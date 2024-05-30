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
[root@dev ~]# yum install -y libaio
[root@dev ~]# cd /app/software/mysql-8.0.37/mysql/bin/
[root@dev bin]# ./mysqld --initialize-insecure --user=mysql --basedir=/app/software/mysql-8.0.37/mysql --datadir=/app/software/mysql-8.0.37/mysql_data
[Server] /app/software/mysql-8.0.37/mysql/bin/mysqld (mysqld 8.0.37) initializing of server in progress as process 5319
[InnoDB] InnoDB initialization has started.
[InnoDB] InnoDB initialization has ended.
[Server] root@localhost is created with an empty password ! Please consider switching off the --initialize-insecure option.
```

这时就会初始化 mysql_data 目录，同时创建了 root 用户，且密码为空

> 注意：`--initialize` 参数才会生成随机密码，`--initialize-insecure` 生成的是空密码

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
mysql> use mysql;
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'xuanyu';
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

## 备份与恢复

物理备份除了要拷贝 mysql_data 目录下的数据库文件夹，还要处理 mysql.ibd 文件，比较繁琐且易出错

因此下面列出的是通过 mysqldump 来进行备份和恢复的方式

```shell
# 进入命令目录
cd /app/software/mysql-8.0.37/mysql/bin
# 备份
mysqldump -h127.0.0.1 -uroot -pxuanyu --default-character-set=utf8mb4 --single-transaction --flush-logs --databases mpp > /app/software/mysql-8.0.37/mpp.sql
# 恢复（也可以登录MySQL命令行，直接执行：source /app/software/mysql-8.0.37/mpp.sql，作用是一样的）
mysql -h127.0.0.1 -uroot -pxuanyu < /app/software/xuanyu.sql
```

### mysqldump参数

取自网络，仅供参考，详见：https://www.cnblogs.com/qidaii/articles/17370167.html

* **--all-databases, -A**：导出全部数据库
* **--databases, -B**：导出指定的数据库（参数后面的所有名字参量都被看作数据库名）<br/>
  如果没有该选项，mysqldump把第一个名字参数作为数据库名，后面的作为表名<br/>
  使用该选项，mysqldum把每个名字都当作为数据库名
* **--no-data, -d**：不导出任何数据，只导出数据库表结构
* **--tables**：覆盖 --databases (-B) 选项，指定需要导出的表名（后面所跟参数被视作表名）
* **--ignore-table**：不导出指定表。指定忽略多个表时，需要重复多次，每次一个表<br/>
  每个表必须同时指定数据库和表名，例如：`--ignore-table=database.table1 --ignore-table=database.table2`
* **--default-character-set**：设置默认字符集，默认值为utf8
* **--set-charset**：添加'SET NAMES  default_character_set'到输出文件。默认为打开状态，使用--skip-set-charset关闭选项
* **--add-drop-table**：每个数据表创建之前添加drop数据表语句。(默认为打开状态，使用--skip-add-drop-table取消选项)
* **--add-locks**：在每个表导出之前增加LOCK TABLES并且之后UNLOCK  TABLE。(默认为打开状态，使用--skip-add-locks取消选项)
* --comments**：附加注释信息。默认为打开，可以用--skip-comments取消
* **--compress, -C**：在客户端和服务器之间启用压缩传递所有信息
* **--extended-insert, -e**：使用具有多个VALUES列的INSERT语法。这样使导出文件更小，并加速导入时的速度。默认为打开状态，使用--skip-extended-insert取消选项
* **--force**：在导出过程中忽略出现的SQL错误
* **--no-create-db, -n**：只导出数据，而不添加CREATE DATABASE 语句
* **--no-create-info, -t**：只导出数据，而不添加CREATE TABLE 语句
* **--quick, -q**：不缓冲查询，直接导出到标准输出。默认为打开状态，使用--skip-quick取消该选项
* **--quote-names, -Q**：使用（`）引起表和列名。默认为打开状态，使用--skip-quote-names取消该选项
* **--single-transaction**：该选项在导出数据之前提交一个BEGIN SQL语句，BEGIN 不会阻塞任何应用程序且能保证导出时数据库的一致性状态。它只适用于多版本存储引擎，仅InnoDB。本选项和--lock-tables 选项是互斥的，因为LOCK  TABLES 会使任何挂起的事务隐含提交。要想导出大表的话，应结合使用--quick 选项
* **--max_allowed_packet**：服务器发送和接受的最大包长度。（例如：--max_allowed_packet=10240或者--max_allowed_packet=512M）

### 网上的备份脚本

```shell
#!/bin/bash
#NAME:数据库备份
#DATE:*/*/*
#USER:***

#设置本机数据库登录信息
mysql_user="user"
mysql_password="passwd"
mysql_host="localhost"
mysql_port="3306"
mysql_charset="utf8mb4"
date_time=`date +%Y-%m-%d-%H-%M`

#保存目录中的文件个数
count=10
#备份路径
path=/***/

#备份数据库sql文件并指定目录
mysqldump --all-databases --single-transaction --flush-logs --master-data=2 -h$mysql_host -u$mysql_user -p$mysql_password > $path_$(date +%Y%m%d_%H:%M).sql
[ $? -eq 0 ] && echo "-----------------数据备份成功_$date_time-----------------" || echo "-----------------数据备份失败-----------------"

#找出需要删除的备份
delfile=`ls -l -crt $path/*.sql | awk '{print $9 }' | head -1`
#判断现在的备份数量是否大于阈值
number=`ls -l -crt $path/*.sql | awk '{print $9 }' | wc -l`
if [ $number -gt $count ] then
    rm $delfile  #删除最早生成的备份，只保留count数量的备份
    #更新删除文件日志
    echo "-----------------已删除过去备份sql $delfile-----------------"
fi
```

```text
# 增加定时备份
crontab -e

*    *    *    *    *
-    -    -    -    -
|    |    |    |    |
|    |    |    |    +----------星期中星期几 (0 - 6) (星期天 为0)
|    |    |    +---------------月份 (1 - 12)
|    |    +--------------------一个月中的第几天 (1 - 31)
|    +-------------------------小时 (0 - 23)
+------------------------------分钟 (0 - 59)

添加定时任务(每天12:50以及23:50执行备份操作)
50 12,23 * * * cd /home/;sh backup.sh >> log.txt
```