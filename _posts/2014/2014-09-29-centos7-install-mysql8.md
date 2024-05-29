---
layout: post
title: "CentOS7安装MySQL8"
categories: 数据库
tags: 数据库 mysql centos
author: 玄玉
excerpt: 详细介绍了CentOS-7.9-x64版中源码安装mysql-8.0.37的步骤。
---

* content
{:toc}


本文涉及的相关环境和版本为：`CentOS-7.9-x64`、`mysql-8.0.37`

## 卸载MariaDB

要先卸载掉 centos 自带的 mariadb 数据库，不然可能会影响 mysql 的安装，同时确保目前没有安装 mysql

```sh
[root@dev ~]# rpm -qa | grep mariadb
mariadb-libs-5.5.68-1.el7.x86_64
[root@dev ~]# rpm -e mariadb-libs --nodeps
[root@dev ~]# rpm -qa | grep mariadb
[root@dev ~]#
[root@dev ~]# rpm -qa | grep mysql
[root@dev ~]#
```

## 安装MySQL

下载地址：https://cdn.mysql.com//Downloads/MySQL-8.0/mysql-8.0.37-linux-glibc2.17-x86_64.tar.xz

注意下载时选择的 glibc 版本，可以通过命令 `ldd --version` 查看（查看 gcc 版本使用 `gcc -v`）

```sh
[xuanyu@dev ~]$ cd /app/software/backup/
[xuanyu@dev backup]$ tar xvf mysql-8.0.37-linux-glibc2.17-x86_64.tar.xz
[xuanyu@dev backup]$ mkdir -pv /app/software/mysql-8.0.37/mysql_data
[xuanyu@dev backup]$ mv mysql-8.0.37-linux-glibc2.17-x86_64 /app/software/mysql-8.0.37/mysql
[root@dev ~]# groupadd MySQL                                  # 添加MySQL组
[root@dev ~]# useradd -s /sbin/nologin -M -g MySQL mysql      # 创建mysql用户并分配组，且不能shell登录
[root@dev ~]# chown -R mysql:MySQL /app/software/mysql-8.0.37/
```

## 配置MySQL

```sh
[root@dev ~]# cd /app/software/mysql-8.0.37/mysql/bin/
[root@dev bin]# ./mysqld --initialize-insecure --user=mysql --basedir=/app/software/mysql-8.0.37/mysql --datadir=/app/software/mysql-8.0.37/mysql_data
[Server] /app/software/mysql-8.0.37/mysql/bin/mysqld (mysqld 8.0.36) initializing of server in progress as process 17071
[InnoDB] InnoDB initialization has started.
[InnoDB] InnoDB initialization has ended.
[Server] root@localhost is created with an empty password ! Please consider switching off the --initialize-insecure option.
```

这时就会初始化 mysql_data 目录，同时创建了 root 用户，且密码为空

> `--initialize` 参数才会生成随机密码，`--initialize-insecure` 生成的是空密码

接下来继续配置，并加入自启动

```sh
[root@dev ~]# vim /etc/profile
                       # Set MySQL Environment Variable
                       MySQL_HOME=/app/software/mysql-8.0.37/mysql
                       PATH=$MySQL_HOME/bin:$PATH
                       export MySQL_HOME PATH
[root@dev ~]# echo $PATH
[root@dev ~]# source /etc/profile
[root@dev ~]# echo $PATH
[root@dev ~]# cd /app/software/mysql-8.0.37/mysql/support-files/
[root@dev support-files]# cp mysql.server /etc/init.d/mysqld       # 拷贝启动脚本
[root@dev support-files]# chmod +x /etc/init.d/mysqld              # 赋予可执行权限
[root@dev support-files]# chkconfig --add mysqld                   # 加入系统服务
[root@dev support-files]# chkconfig mysqld on                      # 开机启动
[root@dev support-files]# vim /etc/my.cnf                          # 编写MySQL启动配置
[root@dev support-files]# cd /app/software/mysql-8.0.37/mysql_data/
[root@dev mysql_data]# mkdir binlog
[root@dev mysql_data]# chown -R mysql:MySQL binlog/
```

`my.cnf` 配置的内容如下

```sh
[mysql]
default-character-set = utf8mb4
socket                = /app/software/mysql-8.0.37/mysql_data/mysql.sock

[client]
default-character-set = utf8mb4
socket                = /app/software/mysql-8.0.37/mysql_data/mysql.sock

[mysqld]
#lower_case_table_names = 1（实测发现：只要配置了该参数，就会导致无法启动mysql）
#skip-grant-tables
server-id  = 53306                                                 # Mysql唯一标识（一个集群中唯一）
port       = 3306                                                  # 服务端口（默认3306）
user       = mysql                                                 # 启动用户（官方不建议root启动数据库）
basedir    = /app/software/mysql-8.0.37/mysql                      # mysql的安装目录
datadir    = /app/software/mysql-8.0.37/mysql_data                 # mysql的数据存放目录
socket     = /app/software/mysql-8.0.37/mysql_data/mysql.sock      # 指定套接字文件
pid-file   = /app/software/mysql-8.0.37/mysql_data/mysqld.pid      # 指定pid文件
max_connections     = 200                                          # 允许最大连接数
max_connect_errors  = 10                                           # 允许连接失败的次数
slow_query_log      = 1                                            # 开启慢查询日志
slow_query_log_file = /app/software/mysql-8.0.37/mysql_data/slow_query.log  # 指定慢查询日志文件
long_query_time     = 3                                            # 指定3秒返回查询的结果为慢查询
log-error           = /app/software/mysql-8.0.37/mysql_data/mysql-error.log
log-bin             = /app/software/mysql-8.0.37/mysql_data/binlog/mysql-bin
skip-name-resolve             = 1
default-storage-engine        = INNODB
character-set-server          = utf8mb4
collation-server              = utf8mb4_unicode_ci
init_connect                  = 'SET NAMES utf8mb4'
init_connect                  = 'SET collation_connection = utf8mb4_unicode_ci'

[mysqldump]
quick
max_allowed_packet = 16M

[mysqlhotcopy]
interactive-timeout
```

## 启动MySQL

通过命令 `service mysqld start` 手动启动数据库

初次登录：`mysql -uroot`，然后设置 root 用户的密码和权限

```sql
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'xuanyu123456';
mysql> UPDATE user SET Host='%' WHERE User='root';
mysql> FLUSH PRIVILEGES;
```

再创建一个新用户**dev**，以后用新用户访问数据库**open**

```sql
mysql> CREATE DATABASE IF NOT EXISTS open DEFAULT CHARSET UTF8MB4 COLLATE UTF8MB4_UNICODE_CI;
mysql> CREATE USER 'dev'@'%' IDENTIFIED BY 'dev123';
mysql> GRANT CREATE ON open.* TO 'dev'@'%';
mysql> GRANT CREATE, DROP, ALTER, INDEX, SELECT, INSERT, UPDATE, DELETE ON open.* TO 'dev'@'%';
```

若报错：`[1044] Access denied for user 'root'@'%' to database`，执行以下命令即可

```sql
mysql> mysql -uroot -pxxxxx
mysql> GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
mysql> FLUSH PRIVILEGES;
```