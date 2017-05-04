---
layout: post
title: "CentOS安装MySQL"
categories: MySQL
tags: mysql centos
author: 玄玉
excerpt: 详细介绍了CentOS-6.4-minimal版中源码安装MySQL-5.5.38的细节。
---

* content
{:toc}


本文涉及的相关环境和版本为：`CentOS-6.4-minimal`、`MySQL-5.5.38`

安装MySQL，通常有以下三种方式

1. 源码安装
2. 二进制包安装
3. rpm或yum安装

**本文演示的是源码安装**，并且从 mysql-5.5 开始，源码安装要通过 cmake 来安装，不能再像以前那样 configure 安装了

我们在 `mysql-5.5.38.tar.gz` 根目录中会看到一个名为 BUILD-CMAKE 的文件，打开可以看到下面这句话

WHAT YOU NEED : CMake version 2.6 or later installed on your system.

所以，我们首先要做的，就是安装 CMake

## 安装CMake

CMake（cross platform make）的特性是独立于源码编译，编译工作可以在另外一个目录中而非源码目录中进行

好处是可以保证源码目录不受任何一次编译的影响

其安装方法详见官方文档：[http://www.cmake.org/install/](http://www.cmake.org/install/)

这里，我们下载到 cmake-3.0.2.tar.gz，安装步骤如下

```sh
[root@CentOS64 software]# cmake -version                  # 我们会发现没有输出，说明本机并未安装cmake
[root@CentOS64 software]# yum list cmake --showduplicates # 查看yum可安装的软件包版本，会看到只能安装cmake-2.6.4-5.el6版本，故舍弃
[root@CentOS64 software]# yum -y install gcc gcc-c++      # 安装必要的编译环境
[root@CentOS64 software]# yum -y install autoconf libtool # 安装必要的编译环境
[root@CentOS64 software]# yum -y install ncurses-devel    # 安装必要的编译环境（这是配置MySQL环境变量时要用的库，这里一起安装了）
[root@CentOS64 software]# tar zxvf cmake-3.0.2.tar.gz     # 解压cmake-3.0.2源码
[root@CentOS64 software]# cd cmake-3.0.2                  # 进入cmake-3.0.2源码目录
[root@CentOS64 cmake-3.0.2]# ./bootstrap                  # 成功时，会提示CMake has bootstrapped.  Now run gmake.
[root@CentOS64 cmake-3.0.2]# gmake                        # 执行编译
[root@CentOS64 cmake-3.0.2]# gmake install                # 执行安装
[root@CentOS64 cmake-3.0.2]# cd ~                         # 退出cmake-3.0.2源码目录
[root@CentOS64 ~]# rm -rf /app/software/cmake-3.2.0*      # 删除cmake-3.0.2源码
[root@CentOS64 ~]# cmake -version                         # 验证cmake-3.0.2安装结果
```

## 安装MySQL

```sh
[root@CentOS64 ~]# groupadd -r mysql
[root@CentOS64 ~]# useradd -r -s /sbin/nologin -g mysql mysql
[root@CentOS64 ~]# mkdir -pv /app/mysql
[root@CentOS64 ~]# mkdir -pv /app/mysql_data
[root@CentOS64 ~]# chown -R mysql.mysql /app/mysql_data
[root@CentOS64 ~]# tar zxvf /app/software/mysql-5.5.38.tar.gz
[root@CentOS64 ~]# cd mysql-5.5.38/
[root@CentOS64 mysql-5.5.38]# cmake . -DCMAKE_INSTALL_PREFIX=/app/mysql -DMYSQL_DATADIR=/app/mysql_data -DSYSCONFDIR=/etc -DWITH_INNOBASE_STORAGE_ENGINE=1 -DWITH_MYISAM_STORAGE_ENGINE=1 -DWITH_READLINE=1 -DWITH_ZLIB=system -DDEFAULT_CHARSET=utf8 -DDEFAULT_COLLATION=utf8_general_ci
[root@CentOS64 mysql-5.5.38]# make
[root@CentOS64 mysql-5.5.38]# make install
```

## 配置MySQL

```sh
[root@CentOS64 ~]# cd /app/mysql/support-files/
[root@CentOS64 support-files]# cp my-large.cnf /etc/my.conf       # 拷贝配置文件
[root@CentOS64 support-files]# cp mysql.server /etc/init.d/mysqld # 拷贝启动脚本
[root@CentOS64 support-files]# chmod -x /etc/init.d/mysqld        # 赋予可执行权限
[root@CentOS64 support-files]# chkconfig --add mysqld             # 加入系统服务
[root@CentOS64 support-files]# chkconfig mysqld on                # 开机启动
[root@CentOS64 support-files]# vi /etc/profile.d/mysql.sh         # 手动创建，添加内容为：export PATH=$PATH:/app/mysql/bin
[root@CentOS64 support-files]# source /etc/profile.d/mysql.sh     # 执行一遍
[root@CentOS64 support-files]# echo $PATH                         # 查看结果
[root@CentOS64 support-files]# cd /app/mysql                      # 进入MySQL主目录
[root@CentOS64 mysql]# bin/mysql_secure_installation              # 会提示设置root密码，是否移除匿名用户，是否禁止root远程登录等等
```

然后修改配置文件`/etc/my.cnf`

在[mysqld]下面增加或修改以下属性

```
user            = mysql
basedir         = /app/mysql
datadir         = /app/mysql_data
pid-file        = /app/mysql_data/mysqld.pid
ft_min_word_len = 4
max_allowed_packet = 32M
character-set-server = urf8
skip-name-resolve
```

## 启动MySQL

首先通过下面的命令初始化MySQL

`/app/mysql/scripts/mysql_install_db --basedir=/app/mysql --datadir=/app/mysql_data --user=mysql`

然后再执行以下命令

```sh
[root@CentOS64 ~]# service mysqld start 
[root@CentOS64 ~]# netstat -tlanop | grep :3306 
[root@CentOS64 ~]# mysql -uroot -pxuanyu
```

## 注意事项

1. 安装必要的编译环境时，也可以使用`yum -y groupinstall "Development tools"`命令<br>
   但这会安装大约101个库，太粗暴，不建议
2. `useradd -s /sbin/nologin`命令用于设置添加的用户默认bash为nologin：即不允许此用户通过shell登录系统
3. `/app/mysql/`目录为MySQL数据库主程序目录，`/app/mysql_data/`目录为MySQL数据文件目录
4. 如果在cmake配置环境的过程中出错，比如提示**ncurses-devel not found**<br>
   那么yum install之后，想重新配置环境时，要先清除旧的对象文件和缓存信息，执行命令如下<br>
   ```sh
   [root@CentOS64 mysql-5.5.38]# make clean
   [root@CentOS64 mysql-5.5.38]# rm -f CMakeCache.txt
   [root@CentOS64 mysql-5.5.38]# rm -rf /etc/my.cnf
   ```
5. 初始化MySQL时要跟上`--basedir`和`--datadir`参数<br>
   否则会由于相对路径的关系报告FATAL ERROR: Could not find ./bin/my_print_defaults
6. 启动MySQL时若提示：`env: /etc/init.d/mysqld: 权限不够`<br>
   此时执行`chmod -x /etc/init.d/mysqld`是不行的，需要执行`chmod a+wrx /etc/init.d/mysqld`<br>
   然后执行`service mysqld start`即可启动，启动成功时会看到：**Starting MySQL.... SUCCESS!**<br>
   注意此操作全程为root用户
7. 安装并启动完MySQL后，默认不支持用户通过非本机的客户端连接到MySQL，解决办法如下<br>
   ```sql
   [root@CentOS64 ~]# mysql -uroot -pxuanyu
   mysql> GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'xuanyu22' WITH GRANT OPTION;
   mysql> FLUSH PRIVILEGES;
   mysql> exit
   ```
   如此：所有用户就都可以连接到MySQL了，不过注意连接时使用的密码是xuanyu22，而非xuanyu<br>
   其中：`'root'@'%'`里面的root表示用户名，`%`代表任意主机或IP地址，可以根据实际需要修改用户名或主机IP<br>
   并且：这里授权是授权所有权限，当然也可以指定部分权限，详见官方文档[http://dev.mysql.com/doc/refman/5.5/en/grant.html](http://dev.mysql.com/doc/refman/5.5/en/grant.html)
8. 通过以上操作，若客户端仍无法连接MySQL，可尝试以下办法<br>
   修改`/etc/sysconfig/iptables`，增加一行：`-A INPUT -m state --state NEW -m tcp -p tcp --dport 3306 -j ACCEPT`<br>
   接着再执行`service iptables restart`命令重启防火墙即可，不需要重启Linux<br>
   详细原理见：[http://jadyer.cn/2013/09/07/centos-config-develop/](http://jadyer.cn/2013/09/07/centos-config-develop/)

## 编译选项

下面列出的是较为常见的，其它参数见官方文档

```sh
-DCMAKE_INSTALL_PREFIX=/app/mysql           # 数据库安装路径（默认为/usr/local/mysql），该参数可在启动服务时用--basedir参数指定
-DINSTALL_PLUGINDIR=/usr/local/mysql/plugin # 插件文件及配置路径
-DMYSQL_DATADIR=/app/mysql_data             # 数据文件路径
-DSYSCONFDIR=/etc                           # 配置文件路径
-DWITH_INNOBASE_STORAGE_ENGINE=1            # 安装InnoDB存储引擎
-DWITH_MYISAM_STORAGE_ENGINE=1              # 安装MyISAM存储引擎
-DWITH_ARCHIVE_STORAGE_ENGINE=1             # 安装archive存储引擎
-DWITH_BLACKHOLE_STORAGE_ENGINE=1           # 安装blackhole存储引擎
-DWITHOUT_BLACKHOLE_STORAGE_ENGINE=1        # 取消安装blackhole存储引擎
-DWITH_READLINE=1                           # 支持批量导入mysql数据
-DWITH_SSL=yes                              # 支持SSL
-DWITH_SSL=system                           # mysql支持ssl会话，实现基于ssl的数据复制
-DWITH_ZLIB=system                          # 压缩库
-DWITH_LIBWRAP=0                            # 是否可以基于WRAP实现访问控制
-DMYSQL_USER=mysql                          # MySQL用户名
-DMYSQL_TCP_PORT=3306                       # MySQL监听端口
-DMYSQL_UNIX_ADDR=/tmp/mysql.sock           # 指定socket文件存放位置
-DENABLED_LOCAL_INFILE=1                    # 是否启用LOCAL_INFILE功能，即允许从本地导入数据
-DEXTRA_CHARSETS=all                        # 安装所有扩展字符集
-DDEFAULT_CHARSET=utf8                      # 默认编码机制
-DDEFAULT_COLLATION=utf8_general_ci         # 默认语言的排序规则（校验字符）
-DWITH_DEBUG=0                              # DEBUG功能设置
-DENABLE_PROFILING=1                        # 是否启用性能分析功能
```