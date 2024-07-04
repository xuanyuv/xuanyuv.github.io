---
layout: post
title: "CentOS安装Apache"
categories: Tomcat
tags: centos apache
author: 玄玉
excerpt: 介绍了CentOS-6.4-minimal版中源码安装Apache-2.2.29的细节。
---

* content
{:toc}


本文涉及的相关环境和版本为：`CentOS-6.4-minimal`、`Apache-2.2.29`，**安装方式为源码安装**

源码安装软件时，通常有以下三个步骤

1. 配置环境<br>
   通常命令为`./configure --prefix=DIR`（即指定软件安装目录），如果还想启用其它功能，可在后面接着添加指令<br>
   比如`--enable-ssl`用于启用Apache的SSL模块<br>
   若不想使用操作系统缺省的SSL库，还可通过`--with-ssl=DIR`指定自己编译的SSL库
2. 编译源码：通常命令为`make`
3. 安装应用：通常命令为`make install`

## 注意事项

1. `httpd-2.2.29`目录下的configure工具是GNU软件基金会推出的专门用于源码发布的工具
2. 配置环境时若出现这个错误：**configure: error: no acceptable C compiler found in $PATH**<br>
   这是说明缺少GCC编译环境，执行`yum -y install gcc`命令安装编译源码所需的工具和库就可以了
3. 执行yum命令时若出现这个错误：**Error: database disk image is malformed**<br>
   这是说明yum的缓存出错，需要清理缓存，执行`yum clean dbcache`命令即可
4. 配置环境时configure的主要工作就是生成Makefile，编译源码时的make命令就是根据Makefile来进行编译的
5. 最好以root安装和启动Apache，以root运行之后，apache就会把它的派生进程切换到非root用户

## 安装Perl5

```sh
[root@dev software]# yum -y install wget
[root@dev software]# wget http://www.cpan.org/src/5.0/perl-5.20.1.tar.gz
[root@dev software]# tar zxvf perl-5.20.1.tar.gz
[root@dev software]# cd perl-5.20.1
[root@dev perl-5.20.1]# ./Configure -des -Dprefix=/app/perl
[root@dev perl-5.20.1]# make
[root@dev perl-5.20.1]# make install
[root@dev perl-5.20.1]# perl -v
```

## 安装OpenSSL

```sh
[root@dev ~]# yum install -y perl-IPC-Cmd
[root@dev ~]# cd /app/software/backup/
[root@dev backup]# tar zxvf openssl-3.0.14.tar.gz
[root@dev backup]# cd openssl-3.0.14/
[root@dev openssl-3.0.14]# ./config --prefix=/app/software/openssl-3.0.14
[root@dev openssl-3.0.14]# make         # 注意：不要一起执行（make & make install）
[root@dev openssl-3.0.14]# make install # 注意：要分两步执行
[root@dev openssl-3.0.14]# cd ..
[root@dev backup]# rm -rf openssl-3.0.14
[root@dev backup]# ln -s /app/software/openssl-3.0.14/lib64/libssl.so.3 /usr/lib64/libssl.so.3
[root@dev backup]# ln -s /app/software/openssl-3.0.14/lib64/libcrypto.so.3 /usr/lib64/libcrypto.so.3
[root@dev backup]# /app/software/openssl-3.0.14/bin/openssl version
OpenSSL 3.0.14 4 Jun 2024 (Library: OpenSSL 3.0.14 4 Jun 2024)
[root@dev backup]#
```

## 安装Apache

```sh
[root@dev software]# tar zxvf httpd-2.2.29.tar.gz
[root@dev software]# cd httpd-2.2.29
[root@dev httpd-2.2.29]# rpm -qa | grep http
[root@dev httpd-2.2.29]# ./configure --prefix=/app/apache --enable-ssl --with-ssl=/app/openssl
[root@dev httpd-2.2.29]# make
[root@dev httpd-2.2.29]# make install
```

## 访问Apache

下面是Apache的目录结构

* bin：可执行文件
* conf：配置文件(apache只有一个配置文件)
* htdocs：缺省的网站根目录（即启动apache后，别人访问apache时，实际访问的就是该目录里面的东西）
* include：头文件
* logs：日志
* man：手册
* manual：联机文档
* modules：存放一些编译好的模块，供apache启动时动态加载

其实apache的可执行文件就一个：**httpd**，它就是apache的主程序

通过`/app/apache/bin/httpd -l`命令可以查看apache编译了多少模块（即列出它支持的所有模块）

如果其中包含`mod_so.c`，则说明apache具备了动态加载模块的功能

比如说想新增加一个模块，那么就不用再编译一次apache，只要编译一下这个模块，再在配置文件里面 load 进去就行了

并且：由于 /app/apache/bin/httpd 支持很多参数，容易搞混

所以：为了方便用户，apache提供了一个名为 /app/apache/bin/apachectl 的启动脚本

启动apache时：在 **apache2.0** 版本中，若想启动支持SSL的apache，则需执行`apachectl startssl`命令

而在 **apache2.2** 版本，直接执行`apachectl start`即可启动并支持SSL

当然前提是在 httpd.conf 中配置`Include conf/extra/httpd-ssl.conf`

```sh
[root@dev bin]# /app/apache/bin/apachectl start
[root@dev bin]# /app/apache/bin/apachectl restart
[root@dev bin]# /app/apache/bin/apachectl stop
```

另外：Apache安装并初次启动后，常见的可能要修改以下几个地方

1. 启动或重启apache时，控制台会打印下面的信息<br>
   httpd: Could not reliably determine the server's fully qualified domain name, using 192.168.0.103 for ServerName<br>
   解决办法是修改 /app/apache/conf/httpd.conf，取消注释`#ServerName www.example.com:80`，再重启apache就看到效果了
2. apache启动后通过电脑访问：[http://192.168.0.102/](http://192.168.0.102/)，发现无法访问（成功访问时页面会显示"It works!"）<br>
   解决办法是修改 /etc/sysconfig/iptables，增加一行：-A INPUT -m state --state NEW -m tcp -p tcp --dport 80 -j ACCEPT<br>
   注意：这一样要添加到默认的22端口规则的下面，若添加到 iptables 文件的尾部，会有可能导致防火墙启动失败<br>
   接着再执行：`service iptables restart`命令重启防火墙即可，不需要重启Linux
3. /app/apache/htdocs/ 中默认的 index.html 不存在时，访问apache会显示 htdocs 目录下的文件列表<br>
   我们可以设置其不显示文件列表<br>
   解决办法是修改 /app/apache/conf/httpd.conf，注释掉**Options Indexes FollowSymLinks**这一行即可<br>
   然后再访问[http://192.168.0.102/](http://192.168.0.102/)，就会看到熟悉的：Forbidden:You don't have permission to access / on this server.
4. 如果想把apache加入系统自启动<br>
   常见的方法有两种：修改配置文件和将apache注册为系统服务（还有一种是在`ntsysv`命令调出的图形界面中操作的）<br>
   修改配置文件的方式最简单：/etc/rc.d/rc.local 文件尾部加入`/app/apache/bin/apachectl start`即可