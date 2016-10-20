---
layout: post
title: "CentOS-6.4安装MongoDB-3.0.2"
categories: MongoDB
tags: centos mongodb 安装
author: 玄玉
excerpt: 详细介绍了在CentOS-6.4-minimal版本中，安装MongoDB-x86_64-3.0.2的步骤。
---

* content
{:toc}


具体版本号为`CentOS-6.4-minimal`以及`MongoDB-x86_64-3.0.2`

## 安装

```
[Jadyer@CentOS64 ~]$ cd /app/software/
[Jadyer@CentOS64 software]$ tar zxvf mongodb-linux-x86_64-3.0.2.tgz
[Jadyer@CentOS64 software]$ mv mongodb-linux-x86_64-3.0.2 /app/mongodb-3.0.2
[root@CentOS64 ~]# vi /etc/profile
                      #Set MongoDB Environment Variable
                      MONGODB_HOME=/app/mongodb-3.0.2
                      PATH=$PATH:$MONGODB_HOME/bin
                      export MONGODB_HOME PATH
[root@CentOS64 ~]# source /etc/profile
[root@CentOS64 ~]# mongod -version
[Jadyer@CentOS64 ~]$ mongod -version
```

## 配置

```
[Jadyer@CentOS64 ~]$ cd /app/mongodb-3.0.2/
[Jadyer@CentOS64 mongodb-3.0.2]$ mkdir data             #创建MongoDB存放数据文件的目录
[Jadyer@CentOS64 mongodb-3.0.2]$ mkdir logs             #创建MongoDB存放日志文件的目录
[Jadyer@CentOS64 mongodb-3.0.2]$ touch logs/mongodb.log #创建一个空的日志文件
[Jadyer@CentOS64 mongodb-3.0.2]$ cd bin
[Jadyer@CentOS64 bin]$ vi startup.sh
mongod --dbpath /app/mongodb-3.0.2/data --logpath /app/mongodb-3.0.2/logs/mongodb.log --logappend --fork --rest --httpinterface
[Jadyer@CentOS64 bin]$ chmod 755 startup.sh
[Jadyer@CentOS64 bin]$ vi shutdown.sh
mongod --dbpath /app/mongodb-3.0.2/data --shutdown
[Jadyer@CentOS64 bin]$ chmod 755 shutdown.sh
[Jadyer@CentOS64 bin]$ vi client.sh
mongo 127.0.0.1:27017/admin
[Jadyer@CentOS64 bin]$ chmod 755 client.sh
```

## 启动

启动时执行上面编写的`startup.sh`就可以了，但启动前有以下四点需要注意：

* 1、用root启动时会有警告提示，可以为mongo单独创建一个用户来启动，以下简称`mongo用户`

* 2、mongo用户的`ulimit -n`和`ulimit -u`要相同，否则也会有警告提示

* 3、先要用`root`用户执行下面两个命令，否则启动后，客户端连接时会有警告提示

```
[root@CentOS64 Jadyer]# echo "never" > /sys/kernel/mm/transparent_hugepage/enabled
[root@CentOS64 Jadyer]# echo "never" > /sys/kernel/mm/transparent_hugepage/defrag
```

* 4、使用`wiredTiger`引擎时，需加`directoryperdb`参数让数据库分文件夹，不然小文件太多，比如下面

```
numactl --interleave=all /usr/local/mongodb/bin/mongod --fork --httpinterface --noauth --bind_ip=0.0.0.0 --port=27017 --storageEngine=wiredTiger --directoryperdb --dbpath=/data/mongodata/data/db1 --logpath=/data/mongodata/logs/mongodb.log --logappend
```

## 管理

```
[Jadyer@CentOS64 ~]$ cd /app/mongodb-3.0.2/bin/
[Jadyer@CentOS64 bin]$ ./startup.sh
[Jadyer@CentOS64 bin]$ ./client.sh
MongoDB shell version: 3.0.2
connecting to: 127.0.0.1:27017/admin
> show dbs
local  0.078GB                       #此时是看不见admin的,但mongodb3.0中有一个能管理用户的userAdminAnyDatabase
> db.createUser({user:"xuanyu",pwd:"222222",roles:[{role:"userAdminAnyDatabase",db:"admin"}]})
> show users                         #查看刚才创建的用户
> db.system.users.find()             #该命令也能查看创建的用户,而且信息更详细
> db.shutdownServer()                #关闭数据库(也可用上面编写的shutdown.sh)
[Jadyer@CentOS64 bin]$ vi startup.sh #加入[--auth]参数
[Jadyer@CentOS64 bin]$ ./startup.sh
[Jadyer@CentOS64 bin]$ ./client.sh
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