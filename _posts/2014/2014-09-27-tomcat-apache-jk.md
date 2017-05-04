---
layout: post
title: "Tomcat与Apache整合"
categories: Tomcat
tags: centos apache tomcat jk
author: 玄玉
excerpt: 介绍了CentOS-6.4-minimal版中通过JK-1.2.40整合Apache-2.2.29与Tomcat-6.0.41，以及通过jkstatus监控JK-1.2.40连接状态。
---

* content
{:toc}


本文涉及的相关环境和版本为：`CentOS-6.4-minimal`、`Apache-2.2.29`、`Tomcat-6.0.41`、`JK-1.2.40`

## AJP

Tomcat提供了专门的`JK插件（即常见的mod_jk）`来负责Tomcat和HTTP服务器（比如Apache、Nginx、IIS等）的通信

JK安装在对方的HTTP服务器上之后，当HTTP服务器接收到客户请求时，它会通过JK过滤URL

JK根据预先配置好的URL映射信息，决定是否把请求转发给Tomcat处理

而JK是通过`AJP协议（Apache JServer Protocol）`实现apache与tomcat之间通讯的

AJP协议是为Tomcat与HTTP服务器之间通信而定制的协议，能够提供较高的通信速度和效率

**ajp12**已经废弃了，目前在用的是**1.3**版本的协议（**ajpv13**协议是面向包的）

大致来说，是由于以下两个原因，导致Tomcat与HTTP服务器整合时，采用AJP协议通信的效率要高于HTTP协议

1. ajp采用长连接，保持了Tomcat与HTTP服务器的通信，减少了建立TCP连接的开销
2. ajp采用一定的协议格式，减少了传递报文的数据大小，节省了带宽

## 安装JK

安装过程中，有以下两点需要注意

1. 安装时要指定apache安装目录中的apxs的位置<br>
   它可以方便我们动态加载模块（安装完成后会在apapche的modules目录下生成一份mod_jk.so文件）
2. 安装过程中若提示autoconf或libtool not found，那么`yum -y install autoconf或libtool`即可

```sh
[root@CentOS64 software]# tar zxvf tomcat-connectors-1.2.40-src.tar.gz 
[root@CentOS64 software]# cd tomcat-connectors-1.2.40-src/native/ 
[root@CentOS64 native]# ./buildconf.sh 
[root@CentOS64 native]# ./configure --with-apxs=/app/apache/bin/apxs 
[root@CentOS64 native]# make 
[root@CentOS64 native]# make install 
[root@CentOS64 native]# ll /app/apache/modules/
```

## 配置Tomcat

1. 关闭HTTP协议<br>
   注释server.xml中的`<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443"/>`
2. 开启AJP协议<br>
   保持server.xml中的`<Connector port="8009" protocol="AJP/1.3" redirectPort="8443"/>`

## 配置Apache

Apache的安装过程详见：[http://jadyer.cn/2014/09/26/centos-install-apache/](http://jadyer.cn/2014/09/26/centos-install-apache/)

1. 修改/app/apache/conf/httpd.conf

   > ```
开启虚拟主机：取消注释Include conf/extra/httpd-vhosts.conf
添加JK配置：增加一行Include conf/extra/httpd-jk.conf
```

2. 创建/app/apache/conf/extra/httpd-jk.conf，内容如下

   > ```
LoadModule jk_module modules/mod_jk.so
JkWorkersFile conf/workers.properties
JkLogFile logs/mod_jk.log
JkLogLevel info
```

3. 创建/app/apache/conf/workers.properties，内容如下

   > ```ruby
worker.list=tomcat
worker.tomcat.type=ajp13
worker.tomcat.host=192.168.0.103
worker.tomcat.port=8009
```

4. 修改/app/apache/conf/extra/httpd-vhosts.conf，增加以下内容（可用**#**号注释掉原有的两个`<VirtualHost *:80/>`默认配置）

   > ```sh
\<VirtualHost *:80>
    ServerName "www.jadyer.com"
    DocumentRoot "/app/tomcat/webapps/docs"
    ErrorLog "logs/www.jadyer.com-error.log"
    CustomLog "logs/www.jadyer.com-access.log" common
    \<Directory "/app/tomcat/webapps/docs">
        Options FollowSymLinks
        AllowOverride None
        Order allow,deny
        Allow from all
    \</Directory>
    JkMount   /*      tomcat
    JkUnMount /*.html tomcat
    JkUnMount /*.jpg  tomcat
    JkUnMount /*.css  tomcat
    JkUnMount /css/*  tomcat
    JkUnMount /js/*   tomcat
    JkUnMount /lib/*  tomcat
\</VirtualHost>
```

## 监控JK连接状态

通过jkstatus可以监控JK-1.2.40连接状态，不过需要配置一下jkstatus，方法如下

1. 修改workers.properties，添加以下两行内容<br>
   worker.list=status（实际上是worker.list=status,tomcat）<br>
   worker.status.type=status
2. httpd-vhosts.conf文件中的`<Directory/>`标签下添加一行：JkMount /jkstatus status
3. 重启Apache后，浏览器中访问[http://192.168.0.103/jkstatus](http://192.168.0.103/jkstatus)即可

默认访问时不需要密码，不过，也可以配置访问的密码，方法如下

1. 修改httpd-vhosts.conf，在`<Directory/>`标签下新增如下内容

   > ```sh
\<Location /jkstatus>
    Options MultiViews
    AuthType Basic               #Basic验证
    AuthName "Auther Center"     #弹出框的提示
    AuthUserFile conf/.htpasswd  #存放密码的位置
    require valid-user granted   #只有.htpasswd文件里面的用户才能进入
\</Location>
```

2. 生成密码文件<br>
   执行命令：`/app/apache/bin/htpasswd -c /app/apache/conf/.htpasswd admin`，即可生成一个包含用户admin的密码文件<br>
   同时会让你输入两次新用户admin的密码，最后通过`ls -al`就可以看到生成的密码文件了（它是隐藏文件，需要`-a`才能看到）
3. 修改密码：`htpasswd -m .htpasswd 用户名`
4. 删除用户：`htpasswd -D .htpasswd 用户名`
5. 最后重启apache就可以了，下面是效果图

![](/img/2014/2014-09-27-tomcat-apache-jk.png)