---
layout: post
title: "CentOS系统配置及开发环境搭建"
categories: Linux
tags: linux centos
author: 玄玉
excerpt: 主要介绍CentOS-6.4-minimal版系统配置，以及Java开发环境搭建的细节。
---

* content
{:toc}


本文使用的是 `CentOS-6.4-minimal` 版的操作系统（安装包为：CentOS-6.4-x86_64-minimal.iso）

## 网卡

CentOS默认没有启用eth0网卡，我们做的就是启用它

编辑`vi /etc/sysconfig/network-scripts/ifcfg-eth0`，再修改ONBOOT=yes即可

（如果是VirtualBox里的虚拟机，可以将VirtualBox配置为桥接网卡，就能让虚拟机里的CentOS联网了）

## IPv6

若想检查当前IP地址中是否含有IPv6地址，可以执行`ifconfig`命令

若发现类似inet6 addr: fe80::20c:29ff:fee4:1d8/64则表明已含IPv6

我们目前还用不到IPv6，而CentOS默认是开启了IPv6的，所以要关闭它

编辑`vi /etc/modprobe.d/dist.conf`，在其尾部加入以下两行（若要重新开启IPv6的支持，注释这两行即可）

alias net-pf-10 off

alias ipv6 off

## 防火墙

* service iptables stop：关闭防火墙
* service iptables start：启动防火墙
* service iptables restart：重启防火墙
* service iptables status：查看防火墙状态
* chkconfig iptables OFF：永久关闭防火墙
* chkconfig iptables ON：永久关闭后启用

测试时，我启动了一个Mina写的小应用，结果发现笔记本无法访问虚拟机里的这个应用，但ping虚拟机里的IP却是通的

于是执行`service iptables status`发现CentOS默认开启了22端口（所以xshell可通过ssh连到CentOS），那么就要开通端口了

编辑`vi /etc/sysconfig/iptables`

我们会发现里面有一行是这么写的：`-A INPUT -p tcp -m state --state NEW -m tcp --dport 22 -j ACCEPT`

然后依葫芦画瓢在这一行下面写上：`-A INPUT -p tcp -m state --state NEW -m tcp --dport 8080 -j ACCEPT`

最后执行`service iptables restart`命令即可，此时服务器的8080端口就可以对外提供服务了

## 安装JDK

下面使用的是`.tar.gz`文件，如果用的是`.bin`文件，可以先执行`./jdk-6u45-linux-x64.bin`命令，再配置环境变量，即可。

```sh
[root@CentOS64 ~]# cd /
[root@CentOS64 /]# mkdir app
[root@CentOS64 ~]# groupadd Develop                            # 添加Develop组
[root@CentOS64 ~]# useradd -g Develop Jadyer                   # 创建Jadyer用户并将其分配到Develop组
[root@CentOS64 ~]# passwd Jadyer                               # 设置或修改Jadyer用户密码
[root@CentOS64 /]# chown -R Jadyer:Develop /app                # 将/app目录的拥有者修改为Jadyer用户和Develop组
[Jadyer@CentOS64 software]$ tar zxvf jdk-8u40-linux-x64.tar.gz # 解压jdk
[Jadyer@CentOS64 software]$ mv jdk1.8.0_40/ /app/jdk1.8.0_40   # 统一存放应用在/app目录中
[root@CentOS64 ~]# vi /etc/profile                             # 配置环境变量，最后[:x]保存即可
                      # Set Java Environment Variable
                      JAVA_HOME=/app/jdk1.8.0_40
                      PATH=$JAVA_HOME/bin:$PATH
                      export JAVA_HOME PATH
[root@CentOS64 ~]# echo $PATH                                  # 查看当前PATH
[root@CentOS64 ~]# source /etc/profile                         # 令环境变量生效
[root@CentOS64 ~]# echo $PATH                                  # 再看下PATH
[root@CentOS64 ~]# java -version                               # 验证是否成功
[Jadyer@CentOS64 ~]$ java -version                             # 再次验证（普通用户重连服务器后才会生效）
```

## 安装Tomcat

无需编译源码，直接`tar zxvf apache-tomcat-6.0.41.tar.gz`解压即可

再执行`/app/tomcat/bin/startup.sh`可以启动Tomcat了

## 安装Nginx

这里采用的是源码编译安装，下载地址为：https://nginx.org/download/nginx-1.24.0.tar.gz

```sh
# 先安装依赖项：编译时依赖gcc环境、pcre可以解析正则以支持rewrite等、 zlib对http包内容进行gzip压缩、openssl支持https
[root@CentOS79 ~]# yum -y install gcc gcc-c++ pcre pcre-devel zlib zlib-devel openssl openssl-devel
[root@CentOS79 ~]# groupadd Nginx                             # 添加Nginx组
[root@CentOS79 ~]# useradd -s /sbin/nologin -M -g Nginx nginx # 创建nginx用户并分配组，且不能shell登录系统
[root@CentOS79 ~]# cd /app/software/                          # 普通用户不能监听1024以内的端口，故用root安装
[root@CentOS79 software]# tar zxvf nginx-1.24.0.tar.gz
[root@CentOS79 software]# cd nginx-1.24.0/
[root@CentOS79 nginx-1.24.0]# pwd
/app/software/nginx-1.24.0
[root@CentOS79 nginx-1.24.0]# ./configure --prefix=/app/nginx-1.24.0 --user=nginx --group=Nginx --with-compat --with-debug --with-threads --with-file-aio --with-http_sub_module --with-http_v2_module --with-http_addition_module --with-http_auth_request_module --with-http_degradation_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_stub_status_module --with-http_ssl_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module
[root@CentOS79 nginx-1.24.0]# make && make install
[root@CentOS79 nginx-1.24.0]# cd ..
[root@CentOS79 software]# rm -rf nginx-1.24.0
[root@CentOS79 software]# cd /app/nginx-1.24.0/
[root@CentOS79 nginx-1.24.0]# ./sbin/nginx -V
nginx version: nginx/1.24.0
built by gcc 4.8.5 20150623 (Red Hat 4.8.5-44) (GCC) 
built with OpenSSL 1.0.2k-fips  26 Jan 2017
TLS SNI support enabled
configure arguments: --prefix=/app/nginx-1.24.0 --user=nginx --group=Nginx --with-compat --with-debug --with-threads --with-file-aio --with-http_sub_module --with-http_v2_module --with-http_addition_module --with-http_auth_request_module --with-http_degradation_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_stub_status_module --with-http_ssl_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module
[root@CentOS79 nginx-1.24.0]# vim conf/nginx.conf
user nginx Nginx;
[root@CentOS79 nginx-1.24.0]# ./sbin/nginx                # 启动
[root@CentOS79 nginx-1.24.0]# ./sbin/nginx -s reload      # 重载配置
[root@CentOS79 nginx-1.24.0]# ./sbin/nginx -s stop        # 停止
[root@CentOS79 nginx-1.24.0]# vim /etc/rc.d/rc.local      # 添加自启动（/etc/rc.local 是 /etc/rc.d/rc.local 的软连接）
/app/nginx-1.24.0/sbin/nginx                              # 最下面添加这一行即可（绝对路径）
[root@CentOS79 nginx-1.24.0]# chmod +x /etc/rc.d/rc.local # 赋权，使其变成可执行文件
[root@CentOS79 nginx-1.24.0]# reboot                      # 最后，重启系统，验证
```

## 安装Redis

Redis 的所有版本下载地址：https://download.redis.io/releases/

这里下载 5.0.14：https://download.redis.io/releases/redis-5.0.14.tar.gz

> Redis 是由 C 语言编写的，其运行需要 C 环境，所以编译前需安装 gcc

```sh
[Jadyer@CentOS79 ~]$ cd /app/software/
[Jadyer@CentOS79 software]$ wget https://download.redis.io/releases/redis-5.0.14.tar.gz
[Jadyer@CentOS79 software]$ su root
[root@CentOS79 software]# tar zxvf redis-5.0.14.tar.gz
[root@CentOS79 software]# mkdir -v /app/redis-5.0.14
[root@CentOS79 software]# mkdir -v /app/redis-5.0.14/conf
[root@CentOS79 software]# mkdir -v /app/redis-5.0.14/bin
[root@CentOS79 software]# mkdir -v /app/redis-5.0.14/log
[root@CentOS79 software]# mkdir -v /app/redis-5.0.14/rdb
[root@CentOS79 software]# mv redis-5.0.14 /app/redis-5.0.14/redis/
[root@CentOS79 software]# cd /app/redis-5.0.14/redis/
[root@CentOS79 redis]# make # 过程稍慢，输出下面两行则编译完成（不用执行 make test，它执行的更慢，也没必要）
Hint: It's a good idea to run 'make test' ;)

make[1]: Leaving directory '/app/redis-5.0.14/redis/src'
[root@CentOS79 redis]# cd src/
[root@CentOS79 src]# make install # 过程很快（注意：是在 src 目录下执行的，同样也不用去执行 make test）
    CC Makefile.dep

Hint: It's a good idea to run 'make test' ;)

    INSTALL install
    INSTALL install
    INSTALL install
    INSTALL install
    INSTALL install
[root@CentOS79 src]# mv mkreleasehdr.sh redis-benchmark redis-check-aof redis-check-rdb redis-cli redis-sentinel redis-server redis-trib.rb /app/redis-5.0.14/bin/
[root@CentOS79 src]# cd ..
[root@CentOS79 redis]# mv redis.conf /app/redis-5.0.14/conf/
[root@CentOS79 redis]# cd /app/redis-5.0.14/conf/
[root@CentOS79 conf]# vim redis.conf
# bind 127.0.0.1          # 注释掉（对于多网卡机器，注释掉后，就可以接受来自任意一个网卡的redis请求）
protected-mode no         # 保护模式将默认的 yes 改为 no（即关闭保护模式，不然会阻止远程访问）
daemonize yes             # 后台启动将默认的 no 改为 yes
requirepass 123           # 设置连接密码
dir /app/redis-5.0.14/rdb # 数据库目录
logfile "/app/redis-5.0.14/log/redis.log"
[root@CentOS79 conf]# cd /app/redis-5.0.14/bin/
[root@CentOS79 bin]# ./redis-server /app/redis-5.0.14/conf/redis.conf # 启动redis
[root@CentOS79 bin]# ./redis-cli                                      # 客户端命令行连接
127.0.0.1:6379> ping                                                  # 尝试执行一个命令
(error) NOAUTH Authentication required.                               # 报错，说明配置文件设定密码生效了
127.0.0.1:6379> auth 123                                              # 提供密码
OK
127.0.0.1:6379> ping
PONG
127.0.0.1:6379> quit
[root@CentOS79 bin]# vim /etc/rc.d/rc.local                           # 添加自启动
/app/redis-5.0.14/bin/redis-server /app/redis-5.0.14/conf/redis.conf  # 最下面添加这一行即可（绝对路径）
[root@CentOS79 nginx-1.24.0]# chmod +x /etc/rc.d/rc.local             # 赋权，使其变成可执行文件
[root@CentOS79 nginx-1.24.0]# reboot                                  # 最后，重启系统，验证
```

注：bin 和 conf 目录是为了便于管理，对于启动（或集群）都比较方便（bin 存放命令，conf 存放配置）

## 安装Nacos

下载地址：https://github.com/alibaba/nacos/releases/download/2.3.1/nacos-server-2.3.1.tar.gz

```sh
[Jadyer@CentOS79 ~]$ cd /app/software/
[Jadyer@CentOS79 software]$ tar zxvf nacos-server-2.3.1.tar.gz
[Jadyer@CentOS79 software]$ mv nacos /app/nacos-2.3.1
[Jadyer@CentOS79 software]$ cd /app/nacos-2.3.1/
[Jadyer@CentOS79 nacos-2.3.1]$ vim conf/application.properties
spring.sql.init.platform=mysql
# 首次启动前，应先初始化数据库，初始化文件位于：/app/nacos-2.3.1/conf/mysql-schema.sql
db.num=1
# 连接mysql8.0时可能报错：java.sql.SQLNonTransientConnectionException: Public Key Retrieval is not allowed
# 此时，在连接参数上增加：allowPublicKeyRetrieval=true
db.url.0=jdbc:mysql://127.0.0.1:3306/nacos?allowPublicKeyRetrieval=true&characterEncoding=utf8&connectTimeout...
db.user.0=nacos
db.password.0=nacos123
# 开启鉴权
nacos.core.auth.enabled=true
nacos.core.auth.caching.enabled=true
nacos.core.auth.enable.userAgentAuthWhite=false
# identity.key和identity.value是配置请求头白名单的（即白名单的Header：JadyerAuthKey=Jadyer123）
nacos.core.auth.server.identity.key=JadyerAuthKey
nacos.core.auth.server.identity.value=Jadyer123
# 这是一个base64字符串（其原始密钥可以随意指定，但长度不得低于32字符）
nacos.core.auth.plugin.nacos.token.secret.key=aHR0cHM6Ly9qYWR5ZXIuY24vMjAxMy8wOS8wNy9jZW50b3MtY29uZmlnLWRldmVsb3Av
[Jadyer@CentOS79 nacos-2.3.1]$ cd bin/
[Jadyer@CentOS79 bin]$ vim startup-standalone.sh
nohup sh /app/nacos-2.3.1/bin/startup.sh -m standalone > /app/nacos-2.3.1/bin/nohup.log 2>&1 &
[Jadyer@CentOS79 bin]$ chmod +x startup-standalone.sh
[Jadyer@CentOS79 bin]$ ./startup-standalone.sh   # 启动nacos（默认用户名密码均为nacos，首次登录后记得修改密码）
[Jadyer@CentOS79 bin]$ su root
[root@CentOS79 bin]# vim /etc/rc.d/rc.local      # 添加自启动
JAVA_HOME=/app/jdk-21.0.2                        # （由于rc.local要早于/etc/profiles运行）
PATH=$JAVA_HOME/bin:$PATH                        # （因此rc.local执行时看不到任何环境变量）
export JAVA_HOME PATH                            # （故手动指定JAVA_HOME，为nacos的启动提供java环境）
/app/nacos-2.3.1/bin/startup-standalone.sh       # 最下面添加这一行即可（绝对路径）
[root@CentOS79 bin]# chmod +x /etc/rc.d/rc.local # 赋权，使其变成可执行文件
[root@CentOS79 bin]# reboot                      # 最后，重启系统，验证
```

## 安装Maven

```sh
[Jadyer@localhost ~]$ cd /app/
[Jadyer@localhost app]$ tar -zxvf apache-maven-3.2.5-bin.tar.gz
[Jadyer@localhost app]$ rm -rf apache-maven-3.2.5-bin.tar.gz
[root@localhost Jadyer]# vi /etc/profile
                         # Set Maven Environment Variable
                         MAVEN_HOME=/app/apache-maven-3.2.5
                         PATH=$MAVEN_HOME/bin:$PATH
                         export MAVEN_HOME PATH
[root@localhost Jadyer]# source /etc/profile
[root@localhost Jadyer]# echo $PATH
[root@localhost Jadyer]# mvn -version
[Jadyer@localhost ~]$ mvn -version
[Jadyer@localhost ~]$ cd /app/code/
[Jadyer@localhost code]$ mkdir MavenRepository
[Jadyer@localhost code]$ vi /app/apache-maven-3.2.5/conf/settings.xml
                         <localRepository>/app/code/MavenRepository</localRepository>
[Jadyer@localhost code]$ cp /app/apache-maven-3.2.5/conf/settings.xml MavenRepository/
```

## 安装Git

```sh
# Git 的工作需要调用 curl，zlib，openssl，expat，libiconv 等库的代码，所以需要先安装这些依赖工具
[Jadyer@localhost app]# yum install curl-devel expat-devel gettext-devel openssl-devel zlib-devel gcc perl-ExtUtils-CBuilder perl-ExtUtils-MakeMaker
[Jadyer@localhost app]# cd software/
[Jadyer@localhost software]# wget https://github.com/git/git/archive/v2.14.1.tar.gz
[Jadyer@localhost software]# tar -zxvf v2.14.1.tar.gz
[Jadyer@localhost software]# cd git-2.14.1/
[Jadyer@localhost software]# cd ..
[Jadyer@localhost app]# mkdir git
[Jadyer@localhost app]# cd software/git-2.14.1/
[Jadyer@localhost git-2.14.1]# make prefix=/app/git all
[root@localhost git-2.14.1]# make prefix=/app/git install
[root@localhost git-2.14.1]# vi /etc/profile
                             # Set Git Environment Variable
                             GIT_HOME=/app/git
                             PATH=$GIT_HOME/bin:$PATH
                             export GIT_HOME PATH
[root@localhost git-2.14.1]# source /etc/profile
[root@localhost git-2.14.1]# echo $PATH
[root@localhost git-2.14.1]# git --version
[Jadyer@localhost ~]$ git -version
```

## 安装Subversion

下载地址为：https://www.open.collab.net/files/documents/60/11125/CollabNetSubversion-client-1.8.13-1.x86_64.rpm

```sh
[Jadyer@localhost ~]$ rpm -q Subversion
[Jadyer@localhost ~]$ rpm -ivh /app/CollabNetSubversion-client-1.8.13-1.x86_64.rpm
warning: /app/CollabNetSubversion-client-1.8.13-1.x86_64.rpm: Header V3 DSA/SHA1 Signature, key ID 35bcca43: NOKEY
Preparing...                ########################################### [100%]
   1:CollabNetSubversion-cli########################################### [100%]
[root@localhost Jadyer]# svn --version
[root@localhost Jadyer]# vi /etc/profile
                         # Set Subversion Environment Variable
                         SVN_HOME=/opt/CollabNet_Subversion
                         PATH=$SVN_HOME/bin:$PATH
                         export SVN_HOME PATH
[root@localhost Jadyer]# source /etc/profile
[root@localhost Jadyer]# svn --version
[Jadyer@localhost ~]$ svn --version
```

## 安装wkhtmltopdf

下载地址为：https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox-0.12.6-1.centos7.x86_64.rpm

```sh
[Jadyer@localhost ~]$ cd /app/software/
[Jadyer@localhost software]$ rpm -ivh --badreloc --relocate /usr/local=/app/wkhtmltox-0.12.6-1 wkhtmltox-0.12.6-1.centos7.x86_64.rpm
error: Failed dependencies:
	fontconfig is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	libX11 is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	libXext is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	libXrender is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	libjpeg is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	xorg-x11-fonts-75dpi is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	xorg-x11-fonts-Type1 is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
[Jadyer@localhost software]$
[Jadyer@localhost software]$ su root
[root@localhost app]# yum install -y libXrender*
[root@localhost app]# yum install -y libXext*
[root@localhost app]# yum install -y xorg-x11-fonts-Type1
[root@localhost app]# yum install -y xorg-x11-fonts-75dpi
[root@localhost app]# yum install -y libjpeg              # 注意：接下来还是要用root安装，普通用户会失败
[root@localhost app]# rpm -ivh --badreloc --relocate /usr/local=/app/wkhtmltox-0.12.6-1 wkhtmltox-0.12.6-1.centos7.x86_64.rpm
Preparing...                          ################################# [100%]
Updating / installing...
   1:wkhtmltox-1:0.12.6-1.centos7     ################################# [100%]
[root@localhost app]# vim /etc/profile
                      # Set wkhtmltox Environment Variable
                      WKHTMLTOPDF_HOME=/app/wkhtmltox-0.12.6-1
                      PATH=$WKHTMLTOPDF_HOME/bin:$PATH
                      export WKHTMLTOPDF_HOME PATH
[root@localhost app]# source /etc/profile
[root@localhost app]# echo $PATH
[root@localhost app]# wkhtmltopdf -V
wkhtmltopdf 0.12.6 (with patched qt)
[root@localhost app]# yum install -y fontconfig mkfontscale  # 安装字体
[root@localhost app]# fc-list                                # 查看系统中已安装的字体
[root@localhost app]# fc-list :lang=zh                       # 查看系统中已安装的中文字体
[root@localhost app]# cd /usr/share/fonts/
[root@localhost fonts]# rz simsun.ttc                        # 上传字体文件至/usr/share/fonts/
[root@localhost fonts]# mkfontscale
[root@localhost fonts]# mkfontdir
[root@localhost fonts]# fc-cache                             # 通过这三个命令建立字体索引信息、更新字体缓存
[root@localhost fonts]# fc-list :lang=zh                     # 查看系统中已安装的中文字体
```

## 修改RPM安装路径

RPM 包通常都有默认的安装路径，但也可以修改这个路径（并非所有 rpm 都允许安装到其它路径）

下面通过 CollabNetSubversion-client-1.8.13-1.x86_64.rpm 和 jdk-6u45-linux-amd64.rpm 举例说明

通过二者的`Relocations`参数，我们可以看到 Subversion 是不允许重定位的，而 jdk 则允许

所以 Subversion 只能安装在默认路径下，而 jdk 则可以修改其默认的安装路径（/usr/java）

方法为执行命令：`rpm -ivh --badreloc --relocate /usr/java=/app/jdk1.6.0_45 jdk-6u45-linux-amd64.rpm`

其中：`--badreloc`是将文件强制安装到指定位置，`--relocate`是将文件从 oldpath 安装到 newpath

```sh
[Jadyer@localhost app]$ rpm -qpi CollabNetSubversion-client-1.8.13-1.x86_64.rpm
warning: CollabNetSubversion-client-1.8.13-1.x86_64.rpm: Header V3 DSA/SHA1 Signature, key ID 35bcca43: NOKEY
Name        : CollabNetSubversion-client   Relocations: (not relocatable)
Version     : 1.8.13                            Vendor: CollabNet
Release     : 1                             Build Date: Mon 23 Mar 2015 02:49:36 AM EDT
Install Date: (not installed)               Build Host: cu128.cloud.maa.collab.net
Group       : Utilities/System              Source RPM: CollabNetSubversion-client-1.8.13-1.src.rpm
Size        : 39281894                         License: Proprietary
Signature   : DSA/SHA1, Mon 23 Mar 2015 02:49:51 AM EDT, Key ID 80233a5a35bcca43
Packager    : Alexander Thomas (AT) <alexander@collab.net>
URL         : http://open.collab.net
Summary     : A Concurrent Versioning system similar to but better than CVS.
Description :
CollabNet Subversion client is a free download of open-source Subversion,
compiled and tested by CollabNet. For more information about CollabNet
Subversion, visit the CollabNet community at http://open.collab.net.
```

```sh
[Jadyer@localhost app]$ rpm -qpi jdk-6u45-linux-amd64.rpm
Name        : jdk                          Relocations: /usr/java
Version     : 1.6.0_45                          Vendor: Oracle and/or its affiliates.
Release     : fcs                           Build Date: Tue 26 Mar 2013 07:54:12 PM EDT
Install Date: (not installed)               Build Host: jb6-lin-amd64.sfbay.sun.com
Group       : Development/Tools             Source RPM: jdk-1.6.0_45-fcs.src.rpm
Size        : 127250396                        License: Copyright (c) 2011, Oracle and/or its affiliates. All rights reserved. Also under other license(s) as shown at the Description field.
Signature   : (none)
Packager    : Java Software <jre-comments@java.sun.com>
URL         : http://www.oracle.com/technetwork/java/javase/overview/index.html
Summary     : Java(TM) Platform Standard Edition Development Kit
Description :
The Java Platform Standard Edition Development Kit (JDK) includes both
the runtime environment (Java virtual machine, the Java platform classes
and supporting files) and development tools (compilers, debuggers,
tool libraries and other tools).

The JDK is a development environment for building applications, applets
and components that can be deployed with the Java Platform Standard
Edition Runtime Environment.
```