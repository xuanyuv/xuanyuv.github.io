---
layout: post
title: "Oracle表空间和备份"
categories: Oracle
tags: oracle
author: 玄玉
excerpt: 主要介绍Oracle表空间的用法，以及物理备份和逻辑备份的区别等等。
---

* content
{:toc}


# 表空间

表空间是数据库的逻辑组成部分，它由一个或多个数据文件组成，它的大小实际上就是数据文件相加后的大小

**从物理上讲：数据库存放在数据文件中，从逻辑上讲：数据库则是存放在表空间中**

数据库在逻辑上是由一个或多个表空间组成的，表空间用于从逻辑上组织数据库的数据

表空间主要有两个作用

1、控制数据库占用的磁盘空间

2、dba可以将不同数据类型部署到不同的位置，这样有利于提高IO性能，同时利于备份和恢复等管理操作

　　比如说：有经验的DBA，他不会把索引放到数据空间里面，而是会单放到一个表空间中

## 表空间管理

建立表空间使用`create tablespace`命令（通常由dba或特权用户或具有`create tablespace`系统权限的其它用户来创建表空间）

建立表空间时，它处于联机的（online）状态，此时它是可以访问和读写的，即可以操纵该表空间的数据

但在进行系统维护或者数据库维护时，可能需要改变表空间的状态（通常由dba或特权用户执行该操作）

不过：`scott.emp`是在`system`表空间上的，此时若将system表空间改为只读，是不会成功的

因为：system表空间是系统表空间（如果是普通表空间的话，那么就可以将其设为只读）

```sql
-- 建立名称为ts_blog的表空间，并为该表空间建立名称为ts_blog.dbf的数据文件，区的大小为128k
-- 这里指定了表空间的ts_blog.dbf的数据文件为20M（注意该文件的上限大小为500MB）
create tablespace ts_blog datafile 'd:\ts_blog_01.dbf' size 20m uniform size 128k

-- 使用数据库表空间
create table mydept(deptno number(4),dname varchar2(14),loc varchar2(13)) tablespace ts_blog

alter tablespace ts_blog online;     --联机表空间
alter tablespace ts_blog offline;    --脱机表空间（这个时候就算再厉害的黑客也无能为力）
alter tablespace ts_blog read only;  --令表空间只读（建立表空间时默认是允许读写操作的）
alter tablespace ts_blog read write; --令表空间可读写

-- 删除表空间
-- including contents表示删除表空间时也删除该空间的所有数据库对象
-- datafiles表示将数据库文件也删除
drop tablespace ts_blog including contents and datafiles;

-- 扩展表空间
alter tablespace ts_blog add datafile 'd:\ts_blog.dbf' size 20m;               --添加数据文件
alter tablespace ts_blog 'd:\ts_blog.dbf' resize 20m;                          --增加数据文件的大小（不可超过500MB）
alter tablespace ts_blog 'd:\ts_blog.dbf' autoextend on next 10m maxsize 500m; --设置文件自动增长
```

以上是最常用的数据表空间，除此之外，还有其它类型表空间，如：索引表空间、undo表空间、临时表空间、非标准块的表空间

## 迁移数据文件

如果数据文件所在的磁盘损坏，那么该数据文件将不能再使用

此时为了能够重新使用，可以将这些文件的副本移动到其它磁盘，然后恢复

```sql
-- 经过以下操作后，该表空间就会重新指向到没有问题的数据文件了
select tablespace_name from dba_data_files where file_name='d:\ts_blog.dbf';  --确定数据文件所在的表空间
alter tablespace 表空间名 offline;                                             --脱机表空间，确保数据文件一致
host move d:\ts_blog.dbf e:\ts_blog.dbf                                       --移动数据文件到指定的目标位置
alter tablespace 表空间名 rename datafile 'd:\ts_blog.dbf' to 'e:\ts_blog.dbf' --物理移动后，逻辑修改数据文件
alter tablespace 表空间名 online;                                              --联机表空间
```

# 逻辑备份

关于备份，Oracle有两类备份方式：物理备份和逻辑备份

物理备份是将实际组成数据库的操作系统文件从一处拷贝到另一处的备份过程，它分为冷备份和热备份

物理备份可在数据库open的状态下进行（即热备），也可在关闭数据库后进行（即冷备）

但逻辑备份与恢复只能在open的状态下进行

这里先只介绍逻辑备份

逻辑备份即使用工具`export`将数据对象的结构和数据导出到文件的过程

当数据库对象被误操作而损坏后，再使用工具`import`利用备份的文件把数据对象导入到数据库的过程

## 导出

具体分为导出表、导出方案、导出数据库三种方式

导出使用`exp`命令来完成，该命令常用的选项如下

* userid：用于指定执行导出操作的用户名、口令、连接字符串
* tables：用于指定执行导出操作的表
* owner：用于指定执行导出操作的方案
* full=y：用于指定执行导出操作的数据库
* inctype：用于指定执行导出操作的增量类型
* rows：用于指定是否导出表中的数据
* file：用于指定导出的文件名

```sql
-- 导出表
-- 导出自己的表
exp userid=scott/xuanyu@jadyer tables=(emp,dept) file=d:\table_emp_dept.dmp
-- 导出其它方案的表（此时该用户需要dba权限或者exp_full_database权限，比如system用户就可导出scott的表）
exp userid=system/manager@jadyer tables=(scott.emp) file=d:\table_emp.dmp
-- 导出表的结构
exp userid=scott/xuanyu@jadyer tables=(emp) file=d:\structure_emp.dmp rows=n
-- 直接导出
-- 这种方式比默认的常规方式速度要快（数据量大时可以考虑使用这种方法）
-- 这时需要数据库的字符集要与客户端字符集完全一致，否则会报错。。。
exp userid=scott/xuanyu@jadyer tables=(emp) file=d:\data_emp.dmp direct=y

-- 导出方案（会导出方案中所有对象的数据，如表、索引、约束等等）
-- 导出自己的方案
exp userid=scott/xuanyu@jadyer owner=scott file=d:\schema_scott.dmp
-- 导出其它的方案（此时该用户需要dba权限或者exp_full_database权限，比如system用户就可以导出任何方案）
exp userid=system/manager@jadyer owner=(system,scott) file=d:\schema_system_scott.dmp

-- 导出数据库（会导出数据库中的对象及数据，要求该用户具有dba权限或者exp_full_database权限）
exp userid=system/manager@jadyer full=y inctype=complete file=d:\database_bak.dmp
```

## 导入

使用工具import将文件中的对象和数据导入到数据库中

**但导入的文件必须是export所导出的文件**

与导出相似，导入也分为导入表、导入方案、导入数据库三种方式，该命令常用的选项如下

* userid：用于指定执行导出操作的用户名、口令、连接字符串
* tables：用于指定执行导入操作的表
* fromuser：用于指定源用户
* touser：用于指定目标用户
* file：用于指定导入的文件名
* full=y：用于指定执行导入整个文件
* inctype：用于指定执行导入操作的增量类型
* rows：用于指定是否导入表行（数据）
* ignore：如果表存在，则只导入数据

```sql
-- 导入表
-- 导入自己的表
imp userid=scott/xuanyu@jadyer tables=(emp) file=d:\table_emp.dmp
-- 导入表到其它用户（此时要求该用户具有dba或者imp_full_database权限）
imp userid=system/manager@jadyer tables=(emp) file=d:\table_emp touser=scott
-- 导入表的结构（只导入表的结构，而不导入数据）
imp userid=scott/xuanyu@jadyer tables=(emp) file=d:\table_emp rows=n
-- 导入数据（如果对象(比如表)已经存在，可以只导入表的数据）
imp userid=scott/xuanyu@jadyer tables=(emp) file=d:\table_emp ignore=y

-- 导入方案（会导入文件中的对象和数据）
-- 导入自身的方案
imp userid=scott/xuanyu file=d:\schema_scott.dmp
-- 导入其它的方案（要求该用户具有dba或者imp_full_database权限）
imp userid=system/manager file=d:\schema_system.dmp fromuser=system touser=scott

-- 导入数据库
-- 默认会导入所有对象结构和数据（此时甚至连实例都不用指定，它会自动创建一个实例）
imp userid=system/manager full=y file=d:\database_bak.dmp
```