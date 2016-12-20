---
layout: post
title: "64bit环境下plsqldev的使用"
categories: Oracle
tags: oracle plsqldev
author: 玄玉
excerpt: 主要介绍Win7-64bit系统中，plsqldev的使用。
---

* content
{:toc}


## 现象

Win7—64bit中安装了`Oracle_win64_11gR2_database`和`plsqldev715`之后，启动plsqldev时发现其无法识别Oracle实例

## 原因

32位的应用程序`PLSQL Developer 715`在加载`64位的oci.dll`时出错

## 解决

* 下载Oracle Instant Client

地址为：[http://www.oracle.com/technetwork/indexes/downloads/index.html](http://www.oracle.com/technetwork/indexes/downloads/index.html)

点击Database栏中的InstantClient，转向后页面中点击Instant Client for Microsoft Windows(32-bit)链接

然后在新页面中点击Accept License Agreement单选框，最后单击instantclient-basic-nt-11.2.0.2.0.zip下载链接

该链接的标注为：Instant Client Package - Basic: All files required to run OCI, OCCI, and JDBC-OCI applications

实际下载地址为：[http://download.oracle.com/otn/nt/instantclient/112020/instantclient-basic-nt-11.2.0.2.0.zip](http://download.oracle.com/otn/nt/instantclient/112020/instantclient-basic-nt-11.2.0.2.0.zip)

* 解压Oracle Instant Client

将下载到的47.9MB大小的instantclient-basic-nt-11.2.0.2.0.zip解压到本地

原则上可将其解压至任意目录，但不推荐路径名含有中文及空格（这里我将其解压到了**/%ORACLE_HOME%/product/**目录中）

* 拷贝tnsnames.ora到instantclient_11_2根目录中

将`\%ORACLE_HOME%\product11.2.0\dbhome_1\NETWORK\ADMIN\`中的tnsnames.ora拷贝到instantclient_11_2根目录中

我们也可以自行创建tnsnames.ora文件，其模版配置如下

```
系统标识符SID =
     (DESCRIPTION =
             (ADDRESS = (PROTOCOL = TCP)(HOST = 数据库服务器IP地址)(PORT = 端口))
             (CONNECT_DATA =
                     (SERVER = DEDICATED)
                     (SERVICE_NAME = 数据库服务名) 或者 (SID = 数据库服务名)
             )
     )
```

备注：可能会发现即使instantclient_11_2根目录中创建了tnsnames.ora文件后，plsqldve偶尔也会无法识别Oracle实例

于是我就索性一股脑将`sqlnet.ora`、`listener.ora`、`tnsnames.ora`三个文件都拷贝到了instantclient_11_2根目录中

实践发现，这么做之后，就没有出现过plsqldev识别Oracle实例失败的现象了，大家可以参考一下

* 配置系统环境变量

```
Win7-->计算机-->属性-->高级系统设置-->环境变量-->系统变量中新增以下两个变量
TNS_ADMIN = %ORACLE_HOME%\product\instantclient_11_2
NLS_LANG = AMERICAN_AMERICA.AL32UTF8 或者 SIMPLIFIED CHINESE_CHINA.ZHS16GBK
```

其中AMERICAN_AMERICA是固定的，因为InstantClient不支持其他语言，而后半部分的AL32UTF8则取决于数据库的字符集

* 配置plsqldev连接参数

```
plsqldev工具-->Tools-->Preferences-->Connection-->配置Oracle Home和OCI library路径
Oracle Home = %ORACLE_HOME%\product\instantclient_11_2（InstantClient的解压目录）
OCI library = %ORACLE_HOME%\product\instantclient_11_2\oci.dll
```

最后重启plsqldev即可

## 补充

也可以写一个批处理，来自动设置启动plsqldev时所需的变量。如下所示

```ruby
@echo off
set TNS_ADMIN=D:\Develop\Oracle\product\instantclient_11_2
set NLS_LANG=AMERICAN_AMERICA.AL32UTF8
start D:\ProgramFiles\PLSQLDeveloper\plsqldev.exe
```