---
layout: post
title: "CentOS搭建开发环境"
categories: Linux
tags: linux centos
author: 玄玉
excerpt: 主要介绍CentOS-7.9版系统中，搭建Java开发环境的细节，包括JDK、Nginx、Nacos、Nexus、Redis等等。
---

* content
{:toc}


本文使用的是 `CentOS-7.9.2009` 版的操作系统

## 安装JDK

下面使用的是`.tar.gz`文件

如果是`.bin`文件，可以先执行`./jdk-6u45-linux-x64.bin`命令，再配置环境变量，即可。

```sh
[root@CentOS79 ~]# cd /
[root@CentOS79 /]# mkdir -p app/software/backup
[root@CentOS79 /]# groupadd Develop                                 # 添加Develop组
[root@CentOS79 /]# useradd -g Develop Jadyer                        # 创建Jadyer用户并分配到Develop组
[root@CentOS79 /]# passwd Jadyer                                    # 设置或修改Jadyer用户密码
[root@CentOS79 /]# chown -R Jadyer:Develop /app                     # 修改目录的拥有者为新建的用户和组
[Jadyer@CentOS79 ~]$ cd /app/software/backup/                       # 切换新用户，访问软件安装包备份目录
[Jadyer@CentOS79 backup]$ tar zxvf jdk-8u40-linux-x64.tar.gz        # 解压jdk
[Jadyer@CentOS79 backup]$ mv jdk1.8.0_40/ /app/software/jdk1.8.0_40 # 统一安装在/app/software/目录中
[root@CentOS79 ~]# vi /etc/profile                                  # 用root配置环境变量，再[:x]保存即可
                      # Set Java Environment Variable
                      JAVA_HOME=/app/software/jdk1.8.0_40
                      PATH=$JAVA_HOME/bin:$PATH
                      export JAVA_HOME PATH
[root@CentOS79 ~]# echo $PATH                                       # 查看当前PATH
[root@CentOS79 ~]# source /etc/profile                              # 令环境变量生效
[root@CentOS79 ~]# echo $PATH                                       # 再看下PATH
[root@CentOS79 ~]# java -version                                    # 验证是否成功
[Jadyer@CentOS79 ~]$ java -version                                  # 普通用户重连服务器，再次验证
```

## 安装Nginx

这里采用的是源码编译安装，下载地址为：https://nginx.org/download/nginx-1.24.0.tar.gz

```sh
# 先安装依赖项：编译时依赖gcc环境、pcre可以解析正则以支持rewrite等、 zlib对http包内容进行gzip压缩、openssl支持https
[root@CentOS79 ~]# yum -y install gcc gcc-c++ pcre pcre-devel zlib zlib-devel openssl openssl-devel
[root@CentOS79 ~]# groupadd Nginx                             # 添加Nginx组
[root@CentOS79 ~]# useradd -s /sbin/nologin -M -g Nginx nginx # 创建nginx用户并分配组，且不能shell登录系统
[root@CentOS79 ~]# cd /app/software/backup/                   # 普通用户不能监听1024以内的端口，故用root安装
[root@CentOS79 backup]# tar zxvf nginx-1.24.0.tar.gz
[root@CentOS79 backup]# cd nginx-1.24.0/
[root@CentOS79 nginx-1.24.0]# pwd
/app/software/backup/nginx-1.24.0
[root@CentOS79 nginx-1.24.0]# ./configure --prefix=/app/software/nginx-1.24.0 --user=nginx --group=Nginx --with-compat --with-debug --with-threads --with-file-aio --with-http_sub_module --with-http_v2_module --with-http_addition_module --with-http_auth_request_module --with-http_degradation_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_stub_status_module --with-http_ssl_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module
[root@CentOS79 nginx-1.24.0]# make && make install
[root@CentOS79 nginx-1.24.0]# cd ..
[root@CentOS79 backup]# rm -rf nginx-1.24.0
[root@CentOS79 backup]# cd /app/software/nginx-1.24.0/
[root@CentOS79 nginx-1.24.0]# ./sbin/nginx -V
nginx version: nginx/1.24.0
built by gcc 4.8.5 20150623 (Red Hat 4.8.5-44) (GCC) 
built with OpenSSL 1.0.2k-fips  26 Jan 2017
TLS SNI support enabled
configure arguments: --prefix=/app/software/nginx-1.24.0 --user=nginx --group=Nginx --with-compat --with-debug --with-threads --with-file-aio --with-http_sub_module --with-http_v2_module --with-http_addition_module --with-http_auth_request_module --with-http_degradation_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_stub_status_module --with-http_ssl_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module
[root@CentOS79 nginx-1.24.0]# vim conf/nginx.conf
user nginx Nginx;
[root@CentOS79 nginx-1.24.0]# ./sbin/nginx                # 启动
[root@CentOS79 nginx-1.24.0]# ./sbin/nginx -s reload      # 重载配置
[root@CentOS79 nginx-1.24.0]# ./sbin/nginx -s stop        # 停止
[root@CentOS79 nginx-1.24.0]# vim /etc/rc.d/rc.local      # 添加自启动（/etc/rc.local 是 /etc/rc.d/rc.local 的软连接）
/app/software/nginx-1.24.0/sbin/nginx                     # 最下面添加这一行即可（绝对路径）
[root@CentOS79 nginx-1.24.0]# chmod +x /etc/rc.d/rc.local # 赋权，使其变成可执行文件
[root@CentOS79 nginx-1.24.0]# reboot                      # 最后，重启系统，验证
```

## 安装Redis

Redis 的所有版本下载地址：https://download.redis.io/releases/

这里下载 5.0.14：https://download.redis.io/releases/redis-5.0.14.tar.gz

> Redis 是由 C 语言编写的，其运行需要 C 环境，所以编译前需安装 gcc

```sh
[Jadyer@CentOS79 ~]$ cd /app/software/backup/
[Jadyer@CentOS79 backup]$ wget https://download.redis.io/releases/redis-5.0.14.tar.gz
[Jadyer@CentOS79 backup]$ su root
[root@CentOS79 backup]# tar zxvf redis-5.0.14.tar.gz
[root@CentOS79 backup]# mkdir -pv /app/software/redis-5.0.14/conf
[root@CentOS79 backup]# mkdir -v /app/software/redis-5.0.14/bin
[root@CentOS79 backup]# mkdir -v /app/software/redis-5.0.14/log
[root@CentOS79 backup]# mkdir -v /app/software/redis-5.0.14/rdb
[root@CentOS79 backup]# mv redis-5.0.14 /app/software/redis-5.0.14/redis/
[root@CentOS79 backup]# cd /app/software/redis-5.0.14/redis/
[root@CentOS79 redis]# make # 过程稍慢，输出下面两行则编译完成（不用执行 make test，它执行的更慢，也没必要）
Hint: It's a good idea to run 'make test' ;)

make[1]: Leaving directory '/app/software/redis-5.0.14/redis/src'
[root@CentOS79 redis]# cd src/
[root@CentOS79 src]# make install # 过程很快（注意：是在 src 目录下执行的，同样也不用去执行 make test）
    CC Makefile.dep

Hint: It's a good idea to run 'make test' ;)

    INSTALL install
    INSTALL install
    INSTALL install
    INSTALL install
    INSTALL install
[root@CentOS79 src]# mv mkreleasehdr.sh redis-benchmark redis-check-aof redis-check-rdb redis-cli redis-sentinel redis-server redis-trib.rb /app/software/redis-5.0.14/bin/
[root@CentOS79 src]# cd ..
[root@CentOS79 redis]# mv redis.conf /app/software/redis-5.0.14/conf/
[root@CentOS79 redis]# cd /app/software/redis-5.0.14/conf/
[root@CentOS79 conf]# vim redis.conf
# bind 127.0.0.1                   # 注释掉（对于多网卡机器，注释掉后，就可以接受来自任意一个网卡的redis请求）
protected-mode no                  # 保护模式将默认的 yes 改为 no（即关闭保护模式，不然会阻止远程访问）
daemonize yes                      # 后台启动将默认的 no 改为 yes
requirepass 123                    # 设置连接密码
dir /app/software/redis-5.0.14/rdb # 数据库目录
logfile "/app/software/redis-5.0.14/log/redis.log"
[root@CentOS79 conf]# cd /app/software/redis-5.0.14/bin/
[root@CentOS79 bin]# ./redis-server /app/software/redis-5.0.14/conf/redis.conf # 启动redis
[root@CentOS79 bin]# ./redis-cli                                               # 客户端命令行连接
127.0.0.1:6379> ping                                                           # 尝试执行一个命令
(error) NOAUTH Authentication required.                                        # 报错，说明配置文件设定密码生效了
127.0.0.1:6379> auth 123                                                       # 提供密码
OK
127.0.0.1:6379> ping
PONG
127.0.0.1:6379> quit
[root@CentOS79 bin]# vim /etc/rc.d/rc.local                                            # 添加自启动
/app/software/redis-5.0.14/bin/redis-server /app/software/redis-5.0.14/conf/redis.conf # 最下面添加这一行即可（绝对路径）
[root@CentOS79 nginx-1.24.0]# chmod +x /etc/rc.d/rc.local                              # 赋权，使其变成可执行文件
[root@CentOS79 nginx-1.24.0]# reboot                                                   # 最后，重启系统，验证
```

注：bin 和 conf 目录是为了便于管理，对于启动（或集群）都比较方便（bin 存放命令，conf 存放配置）

## 安装Nacos

下载地址：https://github.com/alibaba/nacos/releases/download/2.3.1/nacos-server-2.3.1.tar.gz

```sh
[Jadyer@CentOS79 ~]$ cd /app/software/backup/
[Jadyer@CentOS79 backup]$ tar zxvf nacos-server-2.3.1.tar.gz
[Jadyer@CentOS79 backup]$ mv nacos /app/software/nacos-2.3.1
[Jadyer@CentOS79 backup]$ cd /app/software/nacos-2.3.1/
[Jadyer@CentOS79 nacos-2.3.1]$ vim conf/application.properties
spring.sql.init.platform=mysql
# 首次启动前，应先初始化数据库，初始化文件位于：/app/nacos-2.3.1/conf/mysql-schema.sql
db.num=1
# 连接mysql8.0时可能报错：java.sql.SQLNonTransientConnectionException: Public Key Retrieval is not allowed
# 此时，在连接参数上增加：allowPublicKeyRetrieval=true
db.url.0=jdbc:mysql://127.0.0.1:3306/nacos?allowPublicKeyRetrieval=true&characterEncoding=utf8&connectTimeout...
db.user.0=nacos
db.password.0=nacos456
# 开启鉴权（此时程序的bootstrap.yml需要配置spring.cloud.nacos.username/password两个值，才能允许连接nacos）
nacos.core.auth.enabled=true
nacos.core.auth.caching.enabled=true
# 关闭使用user-agent判断服务端请求并放行鉴权的功能
nacos.core.auth.enable.userAgentAuthWhite=false
# identity.key和identity.value是配置请求头白名单的（即白名单的Header：JadyerAuthKey=Jadyer123）
nacos.core.auth.server.identity.key=JadyerAuthKey
nacos.core.auth.server.identity.value=Jadyer123
# 这是一个base64字符串（其原始密钥可以随意指定，但长度不得低于32字符）
nacos.core.auth.plugin.nacos.token.secret.key=aHR0cHM6Ly9qYWR5ZXIuY24vMjAxMy8wOS8wNy9jZW50b3MtY29uZmlnLWRldmVsb3Av
[Jadyer@CentOS79 nacos-2.3.1]$ cd bin/
[Jadyer@CentOS79 bin]$ vim startup-standalone.sh
nohup sh /app/software/nacos-2.3.1/bin/startup.sh -m standalone > /app/software/nacos-2.3.1/bin/nohup.log 2>&1 &
[Jadyer@CentOS79 bin]$ chmod +x startup-standalone.sh
[Jadyer@CentOS79 bin]$ ./startup-standalone.sh      # 启动nacos（默认用户名密码均为nacos，首次登录后记得修改密码）
[Jadyer@CentOS79 bin]$ su root
[root@CentOS79 bin]# vim /etc/rc.d/rc.local         # 添加自启动
JAVA_HOME=/app/software/jdk-21.0.2                  # （由于rc.local要早于/etc/profiles运行）
PATH=$JAVA_HOME/bin:$PATH                           # （因此rc.local执行时看不到任何环境变量）
export JAVA_HOME PATH                               # （故手动指定JAVA_HOME，为nacos的启动提供java环境）
/app/software/nacos-2.3.1/bin/startup-standalone.sh # 最下面添加这一行即可（绝对路径）
[root@CentOS79 bin]# chmod +x /etc/rc.d/rc.local    # 赋权，使其变成可执行文件
[root@CentOS79 bin]# reboot                         # 最后，重启系统，验证
```

## 安装wkhtmltopdf

下载地址为：https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox-0.12.6-1.centos7.x86_64.rpm

```sh
[Jadyer@localhost ~]$ cd /app/software/backup/
[Jadyer@localhost backup]$ rpm -ivh --badreloc --relocate /usr/local=/app/software/wkhtmltox-0.12.6-1 wkhtmltox-0.12.6-1.centos7.x86_64.rpm
error: Failed dependencies:
	fontconfig is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	libX11 is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	libXext is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	libXrender is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	libjpeg is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	xorg-x11-fonts-75dpi is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	xorg-x11-fonts-Type1 is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
[Jadyer@localhost backup]$
[Jadyer@localhost backup]$ su root
[root@localhost backup]# yum install -y libXrender*
[root@localhost backup]# yum install -y libXext*
[root@localhost backup]# yum install -y xorg-x11-fonts-Type1
[root@localhost backup]# yum install -y xorg-x11-fonts-75dpi
[root@localhost backup]# yum install -y libjpeg              # 注意：接下来还是要用root安装，普通用户会失败
[root@localhost backup]# rpm -ivh --badreloc --relocate /usr/local=/app/software/wkhtmltox-0.12.6-1 wkhtmltox-0.12.6-1.centos7.x86_64.rpm
Preparing...                          ################################# [100%]
Updating / installing...
   1:wkhtmltox-1:0.12.6-1.centos7     ################################# [100%]
[root@localhost backup]# vim /etc/profile
                             # Set wkhtmltox Environment Variable
                             WKHTMLTOPDF_HOME=/app/software/wkhtmltox-0.12.6-1
                             PATH=$WKHTMLTOPDF_HOME/bin:$PATH
                             export WKHTMLTOPDF_HOME PATH
[root@localhost backup]# source /etc/profile
[root@localhost backup]# echo $PATH
[root@localhost backup]# wkhtmltopdf -V
wkhtmltopdf 0.12.6 (with patched qt)
[root@localhost backup]# yum install -y fontconfig mkfontscale  # 安装字体
[root@localhost backup]# fc-list                                # 查看系统中已安装的字体
[root@localhost backup]# fc-list :lang=zh                       # 查看系统中已安装的中文字体
[root@localhost backup]# cd /usr/share/fonts/
[root@localhost fonts]# rz simsun.ttc                           # 上传字体文件至/usr/share/fonts/
[root@localhost fonts]# mkfontscale
[root@localhost fonts]# mkfontdir
[root@localhost fonts]# fc-cache                                # 通过这三个命令建立字体索引信息、更新字体缓存
[root@localhost fonts]# fc-list :lang=zh                        # 查看系统中已安装的中文字体
```