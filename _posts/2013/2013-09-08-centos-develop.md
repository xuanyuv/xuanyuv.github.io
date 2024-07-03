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

Oracle官方下载地址：<https://www.oracle.com/java/technologies/downloads/#java21>

关于收费问题，在该页面有这样一句话：

```text
JDK 21 binaries are free to use in production and free to redistribute, at no cost, under the Oracle No-Fee Terms and Conditions (NFTC).

JDK 21 will receive updates under the NFTC, until September 2026, a year after the release of the next LTS. Subsequent JDK 21 updates will be licensed under the Java SE OTN License (OTN) and production use beyond the limited free grants of the OTN license will require a fee.
```

也就是说：截止到 2026 年 09 月，JDK21 都是采用 NFTC 协议（即完全免费，并且可以用于生产环境）

而从 2026 年 09 月起，JDK21 就开始采用 OTN 协议（即收费）

但是具体怎么收费，[网上有 2 种争论：](https://zhuanlan.zhihu.com/p/414822476)

* 2026 年 09 月开始，只要使用了 JDK21，无论是哪个小版本，都要收费
* 仅针对 2026 年 09 月之后发布的 JDK21 才收费，在这之前发布的 JDK21 依旧免费

*注：2026 年 09 月开始，若使用 JDK21 之后的 LTS 版本，仍是免费的（每个 LTS 版都有对应的 NFTC）*

**所以，有很多人在使用 OpenJDK，下载地址为：<https://jdk.java.net/archive/>**

**但是，有更多人在使用 Adoptium Eclipse Temurin，其实它的前身，就是大名鼎鼎的 AdoptOpenJDK**

实际上，AdoptOpenJDK 更新到 jdk16 就停止更新了（详见：<https://adoptopenjdk.net/releases.html>）

而后便移交给了 Eclipse 基金会，并改名为 Adoptium Eclipse Temurin（主页：<https://adoptium.net/>）

*补充：Adoptium 不再提供 OpenJ9 的实现，若确实需要 OpenJ9，可以到[清华大学开源软件镜像站](https://mirror.tuna.tsinghua.edu.cn/news/rename-adoptopenjdk-to-adoptium/)下载*

```sh
[root@dev ~]# mkdir -p /app/software/backup
[root@dev ~]# groupadd Develop                                # 添加Develop组
[root@dev ~]# useradd -g Develop xuanyu                       # 创建xuanyu用户并分配到Develop组
[root@dev ~]# passwd xuanyu                                   # 设置或修改xuanyu用户密码
[root@dev ~]# chown -R xuanyu:Develop /app                    # 修改目录的拥有者为新建的用户和组
[xuanyu@dev ~]$ cd /app/software/backup/                      # 使用普通用户来安装
[xuanyu@dev backup]$ tar zxvf jdk-21.0.3_linux-x64_bin.tar.gz # 解压jdk
[xuanyu@dev backup]$ mv jdk-21.0.3/ /app/software/            # 统一安装在/app/software/目录下
[root@dev ~]# vim /etc/profile                                # 用root配置环境变量，再用[:x]保存
              # Set Java Environment Variable
              JAVA_HOME=/app/software/jdk-21.0.3
              PATH=$JAVA_HOME/bin:$PATH
              export JAVA_HOME PATH
[root@dev ~]# echo $PATH          # 查看当前PATH
[root@dev ~]# source /etc/profile # 令环境变量生效
[root@dev ~]# echo $PATH          # 再看下PATH
[root@dev ~]# java -version       # 验证是否成功
[xuanyu@dev ~]$ java -version     # 普通用户重连服务器，再次验证
```

## 安装Redis

Redis 的所有版本下载地址：https://download.redis.io/releases/

这里下载 5.0.14：https://download.redis.io/releases/redis-5.0.14.tar.gz

> Redis 是由 C 语言写的，其运行需要 C 环境，故编译前需安装 gcc：yum -y install gcc gcc-c++

另外，在 ARM 架构的 Linux 系统上，make 编译时可能报错：**/usr/bin/ld: cannot find -latomic**

说明系统缺少 libatomic.so，即编译时需要用到 libatomic.so 库，而系统又找不到这个库

解决办法如下：

1. 先执行：`yum -y install *atomic*`
2. 再执行：`ln -s /usr/lib64/libatomic.so.1.2.0 /usr/lib/libatomic.so`

然后重新编译即可

```shell
[xuanyu@dev ~]$ cd /app/software/backup/
[xuanyu@dev backup]$ wget https://download.redis.io/releases/redis-5.0.14.tar.gz
[xuanyu@dev backup]$ tar zxvf redis-5.0.14.tar.gz
[xuanyu@dev backup]$ mkdir -pv /app/software/redis-5.0.14/conf
[xuanyu@dev backup]$ mkdir -v /app/software/redis-5.0.14/bin
[xuanyu@dev backup]$ mkdir -v /app/software/redis-5.0.14/log
[xuanyu@dev backup]$ mkdir -v /app/software/redis-5.0.14/rdb
[xuanyu@dev backup]$ mv redis-5.0.14 /app/software/redis-5.0.14/redis/
[xuanyu@dev backup]$ cd /app/software/redis-5.0.14/redis/
[xuanyu@dev redis]$ make # 过程稍慢，输出下面两行则编译完成（不用执行 make test，它执行的更慢，也没必要）
Hint: It's a good idea to run 'make test' ;)

make[1]: Leaving directory '/app/software/redis-5.0.14/redis/src'
[xuanyu@dev redis]# cd src/
[xuanyu@dev redis]$ su root
[root@dev src]# make install # 过程很快（注意：是在 src 目录下执行的，同样也不用去执行 make test）
Hint: It's a good idea to run 'make test' ;)

    INSTALL install
    INSTALL install
    INSTALL install
    INSTALL install
    INSTALL install
[root@dev src]$ exit
[xuanyu@dev src]$ mv mkreleasehdr.sh redis-benchmark redis-check-aof redis-check-rdb redis-cli redis-sentinel redis-server redis-trib.rb /app/software/redis-5.0.14/bin/
[xuanyu@dev src]$ cd ..
[xuanyu@dev redis]$ mv redis.conf /app/software/redis-5.0.14/conf/
[xuanyu@dev redis]$ cd /app/software/redis-5.0.14/conf/
[xuanyu@dev conf]$ vim redis.conf
# bind 127.0.0.1                    # 对于多网卡机器，注释掉后，就可以接受来自任意一个网卡的redis请求
daemonize yes                       # 后台启动将默认的 no 改为 yes
logfile "/app/software/redis-5.0.14/log/redis.log"
dir /app/software/redis-5.0.14/rdb/ # 数据库目录
requirepass 123                     # 设置连接密码
[xuanyu@dev conf]$ cd /app/software/redis-5.0.14/bin/
[xuanyu@dev bin]$ ./redis-server /app/software/redis-5.0.14/conf/redis.conf # 启动redis
[xuanyu@dev bin]$ ./redis-cli -h 127.0.0.1 -p 6379 -a 123 shutdown          # 停止redis
[xuanyu@dev bin]$ ./redis-cli                                               # 客户端命令行连接
127.0.0.1:6379> PING                                                        # 尝试执行一个命令
(error) NOAUTH Authentication required.                                     # 说明配置文件设定密码生效了
127.0.0.1:6379> auth 123                                                    # 提供密码
OK
127.0.0.1:6379> PING
PONG
127.0.0.1:6379> quit
[root@dev bin]$ vim /etc/rc.d/rc.local                                      # 添加自启动
su xuanyu -c "/app/software/redis-5.0.14/bin/redis-server /app/software/redis-5.0.14/conf/redis.conf"
[root@dev bin]$ chmod +x /etc/rc.d/rc.local                                 # 赋权，使其变成可执行文件
[root@dev bin]$ reboot                                                      # 最后，重启系统，验证
```

注：bin 和 conf 目录是为了便于管理，对于启动（或集群）都比较方便（bin 存放命令，conf 存放配置）

另：补充一下通过 RDB 方式进行数据备份与还原

```shell
# 备份原数据（执行完 save 或者 bgsave 命令后，数据就会持久化到硬盘上的 RDB 文件中）
127.0.0.1:6379> save
# 查询 RDB 文件的保存位置
127.0.0.1:6379> config get dir
1) "dir"
2) "/app/software/redis-5.0.14/rdb"
127.0.0.1:6379>
# 最后将 RDB 文件拷贝到目标 Redis 的 rdb 目录下替换，再重启 Redis 即可
```

## 安装Nginx

这里采用的是源码编译安装，下载地址为：https://nginx.org/download/nginx-1.24.0.tar.gz

```sh
# 先安装依赖项：编译时依赖gcc环境、pcre可以解析正则以支持rewrite、 zlib对http包进行gzip压缩、openssl支持https
[root@dev ~]# yum -y install gcc gcc-c++ pcre pcre-devel zlib zlib-devel openssl openssl-devel
[root@dev ~]# groupadd Nginx                             # 添加Nginx组
[root@dev ~]# useradd -s /sbin/nologin -M -g Nginx nginx # 创建nginx用户并分配组，且不能shell登录系统
[root@dev ~]# cd /app/software/backup/                   # 普通用户不能监听1024以内的端口，故用root安装
[root@dev backup]# tar zxvf nginx-1.24.0.tar.gz
[root@dev backup]# cd nginx-1.24.0/
[root@dev nginx-1.24.0]# pwd
/app/software/backup/nginx-1.24.0
[root@dev nginx-1.24.0]# ./configure --prefix=/app/software/nginx-1.24.0 --user=nginx --group=Nginx --with-compat --with-debug --with-threads --with-file-aio --with-http_sub_module --with-http_v2_module --with-http_addition_module --with-http_auth_request_module --with-http_degradation_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_stub_status_module --with-http_ssl_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module
[root@dev nginx-1.24.0]# make && make install
[root@dev nginx-1.24.0]# cp -R contrib/vim/* /usr/share/vim/vimfiles/ # vim nginx.conf 时，增加语法高亮
[root@dev nginx-1.24.0]# cd ..
[root@dev backup]# rm -rf nginx-1.24.0
[root@dev backup]# chown -R nginx:Nginx /app/software/nginx-1.24.0/
[root@dev backup]# cd /app/software/nginx-1.24.0/conf
[root@dev conf]# ../sbin/nginx -V
nginx version: nginx/1.24.0
built by gcc 4.8.5 20150623 (Red Hat 4.8.5-44) (GCC) 
built with OpenSSL 1.0.2k-fips  26 Jan 2017
TLS SNI support enabled
configure arguments: --prefix=/app/software/nginx-1.24.0 --user=nginx --group=Nginx --with-compat --with-debug --with-threads --with-file-aio --with-http_sub_module --with-http_v2_module --with-http_addition_module --with-http_auth_request_module --with-http_degradation_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_stub_status_module --with-http_ssl_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module
[root@dev conf]# vim nginx.conf
[root@dev conf]# ../sbin/nginx -t -c /app/software/nginx-1.24.0/conf/nginx.conf
nginx: the configuration file /app/software/nginx-1.24.0/conf/nginx.conf syntax is ok
nginx: configuration file /app/software/nginx-1.24.0/conf/nginx.conf test is successful
[root@dev conf]# ../sbin/nginx               # 启动
[root@dev conf]# ../sbin/nginx -s reload     # 重载配置
[root@dev conf]# ../sbin/nginx -s stop       # 停止
[root@dev conf]# vim /etc/rc.d/rc.local      # 添加自启动（/etc/rc.local 是 /etc/rc.d/rc.local 的软连接）
/app/software/nginx-1.24.0/sbin/nginx        # 添加这一行即可（绝对路径）
[root@dev conf]# chmod +x /etc/rc.d/rc.local # 赋权，使其变成可执行文件
[root@dev conf]# reboot                      # 最后，重启系统，验证
```

### 配置文件示例

下面是 /app/software/nginx-1.24.0/conf/nginx.conf 的示例

```text
# 网站安全性检测：https://myssl.com

# 定义 nginx 运行的用户和用户组
user nginx Nginx;

# nginx 进程个数（建议设置为等于 CPU 总核心数）
worker_processes auto;

# 全局错误日志定义类型：[ debug | info | notice | warn | error | crit ]
error_log /app/software/nginx-1.24.0/logs/error.log info;
# 进程文件
pid /app/software/nginx-1.24.0/logs/nginx.pid;

# Load dynamic modules. See /usr/share/doc/nginx/README.dynamic.
# include /usr/share/nginx/modules/*.conf;

# 一个 nginx 进程打开的最多文件描述符数目
# 理论值应该是最多打开文件数（系统的值 [ulimit -n]）与 nginx 进程数相除
# 但是 nginx 分配请求并不均匀，所以建议与 [ulimit -n] 的值保持一致
worker_rlimit_nofile 65535;

# 工作模式与连接数上限
events {
    # 参考事件模型，use [ kqueue | rtsig | epoll | /dev/poll | select | poll ];
    # epoll 模型是 Linux2.6 以上版本内核中的高性能网络 I/O 模型，如果跑在 FreeBSD 上面就用 kqueue 模型
    # 这个选项通常不需要显式指定，因为 nginx 会默认使用当前系统中最有效的模式
    # use epoll;
    # 单个进程最大连接数（最大连接数 = 连接数 * 进程数）
    worker_connections 65535;
}

# 设定 HTTP 服务器
http {
    # 日志格式
    log_format access '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    # 访问日志
    access_log /app/software/nginx-1.24.0/logs/access.log access;

    # 开启目录列表访问，适合下载服务器，默认关闭
    #autoindex on;            # 显示目录
    #autoindex_exact_size on; # 显示文件大小，默认为on，单位是bytes（改为off后，显示出文件的大概大小，单位是kB或者MB或者GB）
    #autoindex_localtime on;  # 显示文件时间，默认为off，显示的文件时间为GMT时间（改为on后，显示的文件时间为文件的服务器时间）

    gzip_static         on;   # 响应报文头包含 Content-Encoding: gzip 表示开启了gzip，反之则未开启gzip
    gzip                on;   # 开启gzip后，响应的 Etag 值若以 W/" 打头，则代表服务器在线压缩
    gzip_vary           on;   # 开启gzip后，响应的 Etag 值若以 " 打头，则表示拿了.gz，即gzip_static生效了
    gzip_types          text/plain text/css application/css text/javascript application/x-javascript application/javascript;
    gzip_proxied        any;  # 如果，在当前的 nginx 前面，还有一层 nginx 代理
    gzip_comp_level     6;    # 那么，最前面的 nginx 也要配置一个 gzip on;（只配置这一行就可以）
    gzip_min_length     10k;
    gzip_http_version   1.0;

    sendfile            on;                       # 开启高效文件传输模式，该指令指定nginx是否调用sendfile函数来输出文件。对于普通应用设为on，若用来进行下载等应用磁盘IO重负载应用，可设为off，以平衡磁盘与网络I/O处理速度，降低系统的负载（注意：如果图片显示不正常把这个改成off）
    tcp_nopush          on;                       # 防止网络阻塞
    tcp_nodelay         on;                       # 防止网络阻塞
    keepalive_timeout   120;                      # 单位：s，设置客户端连接保持活动的超时时间，在超过这个时间后服务器会关闭该链接
    types_hash_max_size 4096;                     # 影响散列表的冲突率（默认为1024，其值越大，越会消耗更多的内存，但散列key的冲突率会降低，检索速度就更快）
    server_names_hash_bucket_size 512;            # 服务器名字的hash表大小
    server_tokens       off;                      # 响应头中 [Server: nginx/1.24.0] 改为 [Server: nginx]
    include             mime.types;               # 文件扩展名与文件类型映射表
    default_type        application/octet-stream; # 默认文件类型

    ssl_protocols       TLSv1.2;
    ssl_certificate     xuanyu.cn.pem;
    ssl_certificate_key xuanyu.cn.key;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4:!DH:!DHE;
    add_header Strict-Transport-Security "max-age=31536000; includeSubdomains; preload";

    # WebSocket变量定义
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }
    
    # 禁止通过IP的方式访问服务器（防止服务器被其它域名恶意解析）
    # ssl_reject_handshake只对443有效，[return 444]对80和443都有效
    # 像下面这种两个都配置时，443会优先采用ssl_reject_handshake（与二者配置的前后顺序无关）
    # 所以：当访问https://IP/时，浏览器会看到：ERR_SSL_UNRECOGNIZED_NAME_ALERT
    # 所以：当访问http://IP/时，浏览器会看到：ERR_EMPTY_RESPONSE
    # 建议：该模块，配置在所有server模块的最前面（实测配置在中间或后面，也能生效）
    # 补充：经实测，可以不用配置[server_name _;]
    # 相关：https://shansing.com/read/519/
    # 相关：https://www.cnblogs.com/walls/p/11324567.html
    server {
        listen 80      default_server;
        listen 443 ssl default_server;
        access_log                off;
        ssl_reject_handshake       on;
        return                    444;
    }

    server {
        listen 80;                                        # 监听端口
        server_name xuanyu.cn www.xuanyu.cn;              # 域名可以有多个，用空格隔开
        # rewrite ^(.*) https://$server_name$1 permanent; # HTTP 自动跳转 HTTPS
        rewrite ^(.*) https://www.xuanyu.cn/ permanent;   # HTTP 自动跳转 HTTPS
    }

    server {
        listen 443 ssl;
        server_name xuanyu.cn www.xuanyu.cn;
        # location 是有顺序的，当一个请求有可能匹配多个 location 时，该请求会被第一个 location 处理
        location / {
            root /app/software/nginx-1.24.0/html;
        }
        # JS和CSS缓存时间设置
        location ~ .*\.(js|css)?$ {
            expires 12h;
        }
        # 图片缓存时间设置
        location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$ {
            root /app/software/nginx-1.24.0/html;
            expires 7d;
        }
    }

    # Load modular configuration files from the ../nginx/conf/conf.d directory.
    # See http://nginx.org/en/docs/ngx_core_module.html#include for more information.
    include /app/software/nginx-1.24.0/conf/conf.d/*.conf;
}
```

下面是 /app/software/nginx-1.24.0/conf/conf.d/nginx-prod.conf 的示例

```text
server {
    listen 443 ssl;
    server_name gw.xuanyu.cn;
    location / {
        proxy_pass       http://192.168.0.1:1099/;
        proxy_set_header Host              $http_host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size        50M;
        client_body_buffer_size     50M;
        proxy_connect_timeout       300s;
        proxy_send_timeout          30m;
        proxy_read_timeout          30m;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }
}

server {
    listen 443 ssl;
    server_name sso.xuanyu.cn;
    location / {
        proxy_pass       http://192.168.0.1:1100/;
    }
}

server {
    listen 443 ssl;
    server_name m.xuanyu.cn;
    location / {
        proxy_pass       http://192.168.0.1:7789/;
        client_max_body_size    50M;
        client_body_buffer_size 50M;
    }
}

server {
    listen 443 ssl;
    server_name home.xuanyu.cn;
    # check client is pc or mobile
    if ($http_user_agent ~* (mobile|nokia|iphone|ipad|android|samsung|htc|blackberry)) {
         rewrite  ^(.*)    https://m.xuanyu.cn/ permanent;
    }
    location / {
        proxy_pass       http://192.168.0.1:7788/;
        client_max_body_size    50M;
        client_body_buffer_size 50M;
    }
}
```

## 安装Nacos

下载地址：https://github.com/alibaba/nacos/releases/download/2.2.3/nacos-server-2.2.3.tar.gz

**注意：最新的v2.3.2有BUG，读不到修改后的配置，新建用户反复关联namespace也有问题，巨坑 ！！**

```sh
[xuanyu@dev ~]$ cd /app/software/backup/
[xuanyu@dev backup]$ tar zxvf nacos-server-2.2.3.tar.gz
[xuanyu@dev backup]$ mv nacos /app/software/nacos-2.2.3
[xuanyu@dev backup]$ cd /app/software/nacos-2.2.3/
[xuanyu@dev nacos-2.2.3]$ vim conf/application.properties
spring.sql.init.platform=mysql
# 首次启动前，应先初始化数据库，初始化文件位于：/app/software/nacos-2.2.3/conf/mysql-schema.sql
db.num=1
# 连接mysql8.0可能报错：java.sql.SQLNonTransientConnectionException: Public Key Retrieval is not allowed
# 此时，在连接参数上增加：allowPublicKeyRetrieval=true
db.url.0=jdbc:mysql://127.0.0.1:3306/nacos?allowPublicKeyRetrieval=true&characterEncoding=utf8&connectTimeout...
db.user.0=nacos
db.password.0=nacos456
# 开启鉴权（此时程序的bootstrap.yml需要配置spring.cloud.nacos.username/password两个值，才能允许连接nacos）
nacos.core.auth.enabled=true
nacos.core.auth.caching.enabled=true
# 关闭使用user-agent判断服务端请求并放行鉴权的功能
nacos.core.auth.enable.userAgentAuthWhite=false
# identity.key和identity.value是配置请求头白名单的（即白名单的Header：XuanyuAuthKey=Xuanyu123）
nacos.core.auth.server.identity.key=XuanyuAuthKey
nacos.core.auth.server.identity.value=Xuanyu123
# 这是一个base64字符串（其原始密钥可以随意指定，但长度不得低于32字符）
nacos.core.auth.plugin.nacos.token.secret.key=aHR0cHM6Ly9qYWR5ZXIuY24vMjAxMy8wOS8wNy9jZW50b3MtY29uZmlnLWRldmVsb3Av
[xuanyu@dev nacos-2.2.3]$ cd bin/
[xuanyu@dev bin]$ vim startup-standalone.sh
nohup sh /app/software/nacos-2.2.3/bin/startup.sh -m standalone > /app/software/nacos-2.2.3/bin/nohup.log 2>&1 &
[xuanyu@dev bin]$ chmod +x startup-standalone.sh
[xuanyu@dev bin]$ ./startup-standalone.sh           # 启动nacos（默认用户密码均为nacos，登录后记得改密码）
[root@dev bin]# vim /etc/rc.d/rc.local              # 添加自启动
JAVA_HOME=/app/software/jdk-21.0.3                  # （由于 rc.local 要早于 /etc/profiles 运行）
PATH=$JAVA_HOME/bin:$PATH                           # （因此 rc.local 执行时看不到任何环境变量）
export JAVA_HOME PATH                               # （故手动指定JAVA_HOME，为Nacos的启动提供Java环境）
su xuanyu -c /app/software/nacos-2.2.3/bin/startup-standalone.sh # 临时以用户xuanyu的身份去执行该行
[root@dev bin]# chmod +x /etc/rc.d/rc.local         # 赋权，使其变成可执行文件
[root@dev bin]# reboot                              # 重启验证（应用程序连接时，需要开放8848、9848端口）
```

另外，再补充一下：将 Nacos 安装成为 win10 系统服务的方法，步骤如下

1. 下载文件：https://github.com/winsw/winsw/releases/download/v2.12.0/WinSW.NET4.exe
2. WinSW.NET4.exe 放到 D:\Develop\nacos\bin\ 目录下，并重命名为 nacos-service.exe
3. 在该目录 D:\Develop\nacos\bin\ 下创建 nacos-service.xml 文件
4. 在该目录 D:\Develop\nacos\bin\ 的上方文件夹路径位置，输入 cmd 打开命令提示行窗口
5. 执行该命令即可：nacos-service.exe install （若要卸载，则将 install 参数换为 uninstall）

其中，nacos-service.xml 内容如下：

```xml
<service>
   <!-- 唯一服务ID-->
   <id>nacos</id>
   <!-- 显示服务的名称 -->
   <name>nacos</name>
   <!-- 服务描述 -->
   <description>本地的Nacos服务</description>
   <!-- 日志路径 -->
   <logpath>D:\Develop\nacos\bin\logs\</logpath>
   <!-- 日志模式 -->
   <logmode>roll</logmode>
   <!-- 可执行文件的命令 -->
   <executable>D:\Develop\nacos\bin\startup.cmd</executable>
   <arguments>-m standalone</arguments>
   <!-- 停止可执行文件的命令 -->
   <stopexecutable>D:\Develop\nacos\bin\shutdown.cmd</stopexecutable>
</service>
```

## 安装Nexus

下载地址：https://help.sonatype.com/en/download.html，这里使用的是 [nexus-3.68.1-02-java11-unix.tar.gz](https://sonatype-download.global.ssl.fastly.net/repository/downloads-prod-group/3/nexus-3.68.1-02-java11-unix.tar.gz)

```sh
[xuanyu@dev ~]$ cd /app/software/backup/
[xuanyu@dev backup]$ mkdir -p /app/software/nexus-3.68.1-02
[xuanyu@dev backup]$ tar zxvf nexus-3.68.1-02-java11-unix.tar.gz -C /app/software/nexus-3.68.1-02
[xuanyu@dev backup]$ cd /app/software/nexus-3.68.1-02
[xuanyu@dev nexus-3.68.1-02]$ vim nexus-3.68.1-02/bin/nexus.rc # 修改运行Nexus所使用的用户（默认为root）
[xuanyu@dev nexus-3.68.1-02]$ vim nexus-3.68.1-02/bin/nexus    # 修改运行Nexus所使用的JDK
INSTALL4J_JAVA_HOME_OVERRIDE="/app/software/jdk-11.0.23"       # 修改第14行的值（含双引号）
[xuanyu@dev nexus-3.68.1-02]$ vim nexus-3.68.1-02/etc/nexus-default.properties # 修改Nexus的默认访问端口
application-port=8081                                                          # 默认端口即为8081
[root@dev /]# vim /etc/rc.d/rc.local                                           # 添加自启动
su xuanyu -c "/app/software/nexus-3.68.1-02/nexus-3.68.1-02/bin/nexus start"   # 临时以xuanyu的身份执行
[root@dev /]# chmod +x /etc/rc.d/rc.local                                      # 赋权，使其变成可执行文件
[root@dev /]# reboot                                                           # 最后，重启系统，验证
```

其中，以下几点可以注意一下：

1. 解压完 nexus-3.68.1-02-java11-unix.tar.gz 文件后，会出现 2 个目录
   * nexus-3.68.1-02：该目录包含了 Nexus 运行所需的启动脚本、依赖 jar 等等
   * sonatype-work：该目录用于存储数据，比如 Nexus 生成的配置文件、日志文件、仓库文件等
2. bin 目录下的 nexus 命令，有以下几个参数：
   * start：以后台进程启动服务，日志以文件形式保存
   * run：以当前进程启动服务，日志直接打印在控制台
   * stop：停止服务
   * restart：重启服务
   * status：查看服务状态
3. 之所以单独指定 `jdk-11.0.23`，是因为实测：当指定 `jdk-21.0.3` 时会启动失败，并有下面的提示
   ```text
   No suitable Java Virtual Machine could be found on your system.
   The version of the JVM must be at least 1.8 and at most 11.
   Please define INSTALL4J_JAVA_HOME to point to a suitable JVM.
   ```
4. 启动后，浏览器默认访问地址为：[http://127.1.1.1:8081/](http://127.1.1.1:8081/)<br/>
   默认用户为admin，默认密码位于：/app/software/nexus-3.68.1-02/sonatype-work/nexus3/admin.password<br/>
   首次登录后，会提示修改密码，修改完密码后，admin.password 文件也就会消失
5. 首次登陆时，会提示是否打开允许匿名访问（后面也可以在Nexus管理台：Security：Anonymous Access菜单进行修改）
6. 启动后，会发现控制台（../sonatype-work/nexus3/log/nexus.log）经常会输出下面的异常日志
   ```text
   2024-04-18 12:31:43,187+0800 WARN  [pool-6-thread-9]  admin com.sonatype.nexus.plugins.outreach.internal.outreach.SonatypeOutreach - Could not download page bundle
   org.apache.http.conn.ConnectTimeoutException: Connect to sonatype-download.global.ssl.fastly.net:443 [sonatype-download.global.ssl.fastly.net/31.13.86.21] failed: connect timed out
   ```
   关闭也简单：Nexus管理台：System：Capabilities菜单：编辑Outreach.Management：点击Disable，再重启Nexus即可

### 增加代理源

通常在安装完 Nexus 后，都会增加新的代理源，具体步骤如下：

1. Nexus管理台：Repository：Repositories菜单：点击右侧Create repository：选择 `maven2 (proxy)`
2. **Name、Remote storage、Negative Cache TTL** 填入 aliyun、https://maven.aliyun.com/repository/public、288000
3. 以此类推，再把 **apache** 的也创建进来（其地址为：https://repository.apache.org/content/repositories/releases/）
4. 修改 maven-public：将这 2 个代理源加入 Member repositories，并将其排在最前面，再把 maven-central 排在最后

通过上面的操作，就成功增加了 2 个新的代理源，并加入到了 maven-public 这个 Group 里面

关于仓库的不同类型，是这样的：

* hosted：宿主仓库，也就是内部项目的发布仓库，用于存储企业内部生成的jar，也可以放第三方的jar（比如Oracle驱动）
* proxy：代理仓库，用于代替企业成员去远程下载jar，然后企业成员就可以统一从该仓库下载jar，节省了远程下载的消耗
* group：分组仓库，用于把仓库组合在一起，统一提供服务，企业成员在settings.xml或者pom.xml里只配置这一个地址即可

> 补充：有的企业会再新建一个库，叫做 `3rd party`，类型是 `hosted`，专门存放第三方的 jar

### 创建普通用户

为了不暴露 admin 用户，我们创建一个普通用户并赋予角色

1. Nexus管理台：Security：Roles菜单：点击右侧Create Role：选择 Role Type 为 `Nexus role`
2. `Role ID` 填入 **xxx-dev-role**，`Role Name` 填入 **xxx研发角色**
3. `Applied Privileges` 处搜索并添加一条这样的权限：**nx-repository-view-maven2-maven-snapshots-edit**
4. `Applied Roles` 处搜索并添加一个这样的角色：**nx-anonymous**<br/>
   即此举等于是复用一份匿名角色的权限，到当前新建的角色中，下面是**nx-anonymous**角色默认拥有的权限：
   ```text
   nx-healthcheck-read
   nx-search-read
   nx-repository-view-*-*-read
   nx-repository-view-*-*-browse
   ```
5. 最后创建用户时，赋予新建的 **xxx-dev-role** 角色即可

另外有几点需要注意：

* 实测同时添加 nx-component-upload 和 nx-repository-view-maven2-maven-snapshots-add 权限<br/>
  也无法上传 jar 包，会提示：authorization failed for http://127.0.0.1:8081..., status: 403 Forbidden<br/>
  而仅添加一个 nx-repository-view-maven2-maven-snapshots-edit 权限，就能够成功上传 jar 包
* maven-snapshots 仓库的 Deployment policy 可以修改为 Disable redeploy，即不允许重新部署<br/>
  所以只能打新包，防止恶意篡改，就跟 maven-releases 仓库的默认配置一样（它不会影响 jar 包的上传）

### 修改Maven配置

```xml
<localRepository>D:/Develop/Code/repo_mvn</localRepository>

<server>
    <id>xuanyu-public</id>
    <username>xuanyu</username>
    <password>xuanyu</password>
</server>
<server>
    <id>xuanyu-admin</id>
    <username>admin</username>
    <password>admin</password>
</server>

<!-- mirror-id 要和 server-id 保持一致 -->
<mirror>
    <id>xuanyu-public</id>
    <url>http://127.0.0.1:8081/repository/maven-public/</url>
    <mirrorOf>*</mirrorOf>
</mirror>
```

对于 settings.xml 而已，仅此三项即可（不用配置<profile>）

对于 pom.xml 而言，需要配置项如下：

```xml
<repositories>
    <repository>
        <id>xuanyu-public</id>
        <url>http://127.0.0.1:8081/repository/maven-public/</url>
        <releases>
            <enabled>true</enabled>
        </releases>
        <snapshots>
            <enabled>true</enabled>
            <updatePolicy>always</updatePolicy>
        </snapshots>
    </repository>
</repositories>
<pluginRepositories>
    <pluginRepository>
        <id>xuanyu-public</id>
        <url>http://127.0.0.1:8081/repository/maven-public/</url>
        <releases>
            <enabled>true</enabled>
        </releases>
    </pluginRepository>
</pluginRepositories>

<!-- 这里的两个 id 可以相同，并保持和 <maven-settings-server-id> 一致即可 -->
<distributionManagement>
    <repository>
        <id>xuanyu-public</id>
        <url>http://127.0.0.1:8081/repository/maven-releases/</url>
    </repository>
    <snapshotRepository>
        <id>xuanyu-public</id>
        <url>http://127.0.0.1:8081/repository/maven-snapshots/</url>
    </snapshotRepository>
</distributionManagement>
```

### 手动上传三方jar

由于上面创建的 **xxx-dev-role** 角色，只是针对 maven-snapshots 仓库配置了 edit 权限

因此它是没有权限往 maven-releases 仓库中上传 jar 包的

此时要么给它增加 maven-releases-edit 权限，要么换成用 admin 用户来上传，命令举例如下：

```shell
# 注意：参数 **-DrepositoryId** 的值，其实就是 <maven-settings-server-id> 的值
mvn deploy:deploy-file -DgroupId=com.xuanyuv.oracle -DartifactId=ojdbc6 -Dversion=11.2.0.4 -Dpackaging=jar -Dfile=ojdbc6-11.2.0.4.jar -Dsources=ojdbc6-11.2.0.4-sources.jar -DrepositoryId=xuanyu-admin -Durl=http://127.0.0.1:8081/repository/maven-releases/
```

## 安装wkhtmltopdf

下载地址为：https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox-0.12.6-1.centos7.x86_64.rpm

注意：要用 root 来安装，普通用户会失败

```sh
[root@dev backup]$ yum install -y libjpeg libXext* libXrender* xorg-x11-fonts-Type1 xorg-x11-fonts-75dpi
[root@dev backup]$ rpm -ivh --badreloc --relocate /usr/local=/app/software/wkhtmltox-0.12.6-1 wkhtmltox-0.12.6-1.centos7.x86_64.rpm
Preparing...                          ################################# [100%]
Updating / installing...
   1:wkhtmltox-1:0.12.6-1.centos7     ################################# [100%]
[root@dev backup]$ vim /etc/profile
                   # Set wkhtmltox Environment Variable
                   WKHTMLTOPDF_HOME=/app/software/wkhtmltox-0.12.6-1
                   PATH=$WKHTMLTOPDF_HOME/bin:$PATH
                   export WKHTMLTOPDF_HOME PATH
[root@dev backup]$ source /etc/profile
[root@dev backup]$ echo $PATH
[root@dev backup]$ wkhtmltopdf -V
wkhtmltopdf 0.12.6 (with patched qt)
[root@dev backup]$ yum install -y fontconfig mkfontscale # 安装字体
[root@dev backup]$ fc-list                               # 查看系统中已安装的字体
[root@dev backup]$ fc-list :lang=zh                      # 查看系统中已安装的中文字体
[root@dev backup]$ cd /usr/share/fonts/
[root@dev fonts]$ rz simsun.ttc                          # 上传字体文件至/usr/share/fonts/
[root@dev fonts]$ mkfontscale
[root@dev fonts]$ mkfontdir
[root@dev fonts]$ fc-cache                               # 通过这三个命令建立字体索引信息、更新字体缓存
[root@dev fonts]$ fc-list :lang=zh                       # 查看系统中已安装的中文字体
```