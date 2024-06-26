---
layout: post
title: "CentOS安装MongoDB"
categories: MongoDB
tags: mongodb centos
author: 玄玉
excerpt: 详细介绍了在CentOS-6.4-minimal版本中，安装MongoDB-x86_64-3.0.2的步骤。
---

* content
{:toc}


* *2016-11-08 13:40 更新内容如下：*

    > 今天在服务器上安装了最新版 MongoDB-x86_64-3.2.10，操作步骤和本文描述的一样，特此说明。

本文涉及的相关环境和版本为：`CentOS-6.4-minimal`、`MongoDB-x86_64-3.0.2`

下面是安装细节

## 安装

在开始正文之前，先简单描述下Windows版的安装步骤（这里以Windows上的mongodb-2.6.1版为例）

1. 下载[https://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-2.6.1.zip](https://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-2.6.1.zip)
2. 解压到本地硬盘D:\Develop\mongoDB\，并配置环境变量path=D:\Develop\mongoDB\bin<br>
   然后在CMD下执行此命令验证安装成功与否`>mongod --version`
3. 建立D:\Develop\mongoDBData\文件夹，用于存放mongoDB数据文件
4. 自定义bat文件，分别用于启动mongoDB数据库和连接数据库的客户端<br>
   启动客户端的`mongo_client.bat`内容为：`mongo 127.0.0.1:27017/admin`<br>
   启动数据库的`mongo_db.bat`内容为：`mongod --dbpath D:\Develop\mongoDBData --rest`<br>
   注意：加入`--rest`参数是为了能够访问mongoDB的Web控制台[http://127.0.0.1:28017/](http://127.0.0.1:28017/)

至此，Windows版的mongodb-2.6.1安装完毕

下面开始正文：`CentOS-6.4-minimal`上安装`MongoDB-x86_64-3.0.2`

```
[xuanyu@dev ~]$ cd /app/software/
[xuanyu@dev software]$ tar zxvf mongodb-linux-x86_64-3.0.2.tgz
[xuanyu@dev software]$ mv mongodb-linux-x86_64-3.0.2 /app/mongodb-3.0.2
[root@dev ~]# vim /etc/profile
                      #Set MongoDB Environment Variable
                      MONGODB_HOME=/app/mongodb-3.0.2
                      PATH=$PATH:$MONGODB_HOME/bin
                      export MONGODB_HOME PATH
[root@dev ~]# source /etc/profile
[root@dev ~]# mongod -version
[xuanyu@dev ~]$ mongod -version
```

## 配置

```
[xuanyu@dev ~]$ cd /app/mongodb-3.0.2/
[xuanyu@dev mongodb-3.0.2]$ mkdir data             #创建MongoDB存放数据文件的目录
[xuanyu@dev mongodb-3.0.2]$ mkdir logs             #创建MongoDB存放日志文件的目录
[xuanyu@dev mongodb-3.0.2]$ touch logs/mongodb.log #创建一个空的日志文件
[xuanyu@dev mongodb-3.0.2]$ cd bin
[xuanyu@dev bin]$ vim startup.sh
mongod --dbpath /app/mongodb-3.0.2/data --logpath /app/mongodb-3.0.2/logs/mongodb.log --logappend --fork --rest --httpinterface
[xuanyu@dev bin]$ chmod 755 startup.sh
[xuanyu@dev bin]$ vim shutdown.sh
mongod --dbpath /app/mongodb-3.0.2/data --shutdown
[xuanyu@dev bin]$ chmod 755 shutdown.sh
[xuanyu@dev bin]$ vim client.sh
mongo 127.0.0.1:27017/admin
[xuanyu@dev bin]$ chmod 755 client.sh
```

## 启动

启动时执行上面编写的`startup.sh`就可以了，但启动前有以下四点需要注意：

* 1、用root启动时会有警告提示，可以为mongo单独创建一个用户来启动，以下简称`mongo用户`

* 2、mongo用户的`ulimit -n`和`ulimit -u`要相同，否则也会有警告提示

* 3、先要用`root`用户执行下面两个命令，否则启动后，客户端连接时会有警告提示

```
[root@dev app]# echo "never" > /sys/kernel/mm/transparent_hugepage/enabled
[root@dev app]# echo "never" > /sys/kernel/mm/transparent_hugepage/defrag
```

* 4、使用`wiredTiger`引擎时，需加`directoryperdb`参数让数据库分文件夹，不然小文件太多，比如下面

```
numactl --interleave=all /usr/local/mongodb/bin/mongod --fork --httpinterface --noauth --bind_ip=0.0.0.0 --port=27017 --storageEngine=wiredTiger --directoryperdb --dbpath=/data/mongodata/data/db1 --logpath=/data/mongodata/logs/mongodb.log --logappend
```

## 管理

```
[xuanyu@dev ~]$ cd /app/mongodb-3.0.2/bin/
[xuanyu@dev bin]$ ./startup.sh  #若启动失败，就检查下/etc/sysconfig/iptables防火墙里面有没有开放27017端口
[xuanyu@dev bin]$ ./client.sh   #启动客户端，连接服务器
MongoDB shell version: 3.0.2
connecting to: 127.0.0.1:27017/admin
> show dbs
local  0.078GB                       #此时是看不见admin的,但mongodb3.0中有一个能管理用户的userAdminAnyDatabase
> db.createUser({user:"xuanyu",pwd:"222222",roles:[{role:"userAdminAnyDatabase",db:"admin"}]})
> show users                         #查看刚才创建的用户
> db.system.users.find()             #该命令也能查看创建的用户,而且信息更详细
> db.shutdownServer()                #关闭数据库(也可用上面编写的shutdown.sh)
[xuanyu@dev bin]$ vim startup.sh #加入[--auth]参数
[xuanyu@dev bin]$ ./startup.sh
[xuanyu@dev bin]$ ./client.sh
MongoDB shell version: 3.0.2
connecting to: 127.0.0.1:27017/admin
> show dbs                           #会报告not authorized on admin to execute command {listDatabases: 1.0}
> db.auth("xuanyu", "222222")        #返回1表示认证通过
1
> show dbs
admin  0.078GB
local  0.078GB
> show collections                   #这时也会报错not authorized on admin...(因为"xuanyu"只有用户管理的权限)
> cls                                #清屏
> use jishu
switched to db jishu
> db.createUser({user:"xuanyudev", pwd:"222222", roles:[{role:"readWrite",db:"jishu"},{role:"read",db:"jishu22"}]})
> show users                         #查看刚才创建的用户
> use admin
switched to db admin
> db.system.users.find()             #查看数据库中的所有用户
> use jishu
switched to db jishu
> show collections                   #这时还会报告not authorized on admin...(因为没权限,先赋权)
> db.auth("xuanyudev", "222222")
1
> show collections                   #如此便可以了
```

## 网摘

* [MongoDB的真正性能-实战百万用户一-一亿的道具](http://www.cnblogs.com/crazylights/archive/2013/05/08/3068098.html)

* [MONGODB中OBJECTID的误区,以及引起的一系列问题](http://www.cnphp6.com/archives/64392)