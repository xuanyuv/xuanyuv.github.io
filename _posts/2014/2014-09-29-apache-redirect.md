---
layout: post
title: "Apache配置请求转发"
categories: Tomcat
tags: centos apache tomcat
author: 玄玉
excerpt: 介绍了CentOS-6.4-minimal版中Apache-2.2.29配置请求转发的方法。
---

* content
{:toc}


本文涉及的相关环境和版本为：`CentOS-6.4-minimal`、`Apache-2.2.29`

# 前言

请求转发、请求重定向、端口转发、端口映射、域名转发、域名反向代理、请求代理等等，都可以通过本文的配置方式来实现

不过：**通过本文的方式将请求转发给Tomcat服务器**，与，**apache整合tomcat**，是两个概念

前者所有的资源都由tomcat处理，后者只有动态资源由tomcat处理（像js、css、html等静态资源由apache处理）

本文是建立在源码安装Apache-2.2.29基础上的，安装过程详见：[https://jadyer.github.io/2014/09/26/centos-install-apache/](https://jadyer.github.io/2014/09/26/centos-install-apache/)

*另外，关于Apache与Tomcat的整合*，详见：[https://jadyer.github.io/2014/09/27/tomcat-apache-jk/](https://jadyer.github.io/2014/09/27/tomcat-apache-jk/)

# 概述

安装Apache时，可能并没有编译加载很多的模块

不过幸好Apache默认都将`mod_so.c`模块编译进来，这就可以实现动态加载模块了

所以要实现本文的请求转发功能

实际上就是在 /app/apache/modules/ 目录中生成`mod_proxy.so`和`mod_proxy_http.so`两个模块的 so 文件

再保证 /app/apache/conf/httpd.conf 文件中存在以下两行LoadModule，以启用该模块

```
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
```

接着开启虚拟主机配置，并增加映射信息，最后重启apache即可

# 配置

下面详细描述一下具体怎么配置

首先执行以下命令

```sh
# /app/apache/是Apache的安装目录
# /app/software/httpd-2.2.29/是Apache的源码目录
[root@CentOS64 ~]# cd /app/software/httpd-2.2.29/modules/proxy/
# -c 执行编译操作
# -i 执行安装操作（它可以将生成的so文件自动放到/app/apache/modules/目录中）
# -a 在/app/apache/conf/httpd.conf文件中自动增加一个LoadModule以激活此模块，若已存在此LoadModule则取消其注释直接启动该模块
[root@CentOS64 proxy]# /app/apache/bin/apxs -c -i -a mod_proxy.c proxy_util.c 
[root@CentOS64 proxy]# /app/apache/bin/apxs -c -i -a mod_proxy_http.c proxy_util.c
```

然后修改 /app/apache/conf/httpd.conf 文件，取消注释`Include conf/extra/httpd-vhosts.conf`

接着修改 /app/apache/conf/extra/httpd-vhosts.conf 文件

使用 **#** 号注释掉原有的两个`<VirtualHost/>`节点，并增加以下内容，最后重启apache即可

（如果需要多个跳转，可以加入多个VirtualHost）

```xml
<VirtualHost *:80>
    ServerName www.jadyer.com
    ErrorLog logs/www.jadyer.com_error_log
    CustomLog logs/www.jadyer.com_access_log common
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass / http://192.168.0.104:8080/
    ProxyPassReverse / http://192.168.0.104:8080/
</VirtualHost>
```