---
layout: post
title: "Oracle用户管理"
categories: Oracle
tags: oracle
author: 玄玉
excerpt: 主要介绍Oracle中的普通用户、特权用户的管理，包括找回密码等等。
---

* content
{:toc}


## SYS和SYSTEM

安装Oracle时会生成`SYS`和`SYSTEM`两个用户。可以理解为SYS是董事长，SYSTEM是总经理

`Oracle9i`中，默认的SYS密码是change_on_install，默认的SYSTEM密码是manager

### SYS

所有Oracle的数据字典的基表和视图都存放在sys用户中

这些基表和视图对于Oracle的运行是至关重要的，它由数据库自己维护，任何用户都不能手动更改

sys用户拥有sysdba、sysoper、dba角色或权限，是Oracle权限最高的用户

sys用户必须以`as sysdba`或者`as sysoper`形式登录，不能以normal方式登录数据库

### SYSTEM

用于存放一级的内部数据，如Oracle的一些特性或工具的管理信息

SYSTEM用户拥有sysdba、dba角色或系统权限

system如果正常登录，它其实就是一个普通的dba用户

但如果以`as sysdba`登录，那么实际上它是作为sys用户登录的，从登录信息里我们就可以看出来

### 重建SYS密码

这里重建也可以理解为找回密码，主要是删掉原有密码文件，再生成一个新密码文件

1、备份**/ORACLE_HOME/product/11.2.0/dbhome_1/database/PWD+sid.ora**

　　比如我的：D:/Develop/Oracle/product/11.2.0/dbhome_1/database/PWDjadyer.ora

2、删掉`PWD+sid.ora`文件之后，再在命令行执行以下命令，生成新密码文件

　　`orapwd file=原密码文件的全路径/密码文件名.ora password=新密码 entries=6`

　　比如我的：orapwd file=D:/Develop/Oracle/product/11.2.0/dbhome_1/database/PWDjadyer.ora password=新密码 entries=10

　　这里entries是指允许几个特权用户同时登录，并且密码文件名一定要和原来的密码文件名一致

## 用户管理命令

```sql
-- 创建一个密码为my22的myjava用户（具有dba权限，且密码要以字母开头，不能以数字开头）
create user myjava identified by my22

-- 删除用户
-- 通常使用dba身份去删除某个用户，若是其它身份则需要具有drop user权限，且不允许自己删除自己
-- 若欲删除的用户已创建table，则可以在删除时附加cascade参数，表明同时也删除该用户所创建的表
drop user 用户名 [cascade]

-- 修改用户密码
-- 普通用户，可以直接使用password
password
-- 系统管理员，可以使用下面两种方式
password 用户名
alter user 用户名 identified by 新密码
```

## profile管理口令

profile是口令限制、资源限制的命令集合

当建立数据库时，Oracle会自动建立名称为default的profile，

若建立用户时没有指定profile选项，那么Oracle就会将default分配给用户

```sql
-- 指定myjava用户最多只能尝试三次登录，锁定时间为二天
-- 创建profile文件（lock_account即创建的规则名称）
create profile lock_account limit failed_login_attempts 3 password_lock_time 2;
-- 将lock_account规则分配给myjava用户
alter user myjava profile lock_account;
-- 解锁myjava账户
alter user myjava account unlock;

-- 给myjava用户创建一个profile文件，要求它每半个月应该修改自己的登录密码，宽限期为两天
create profile myprofile limit password_life_time 15 password_grace_time 2;
alter user myjava profile myprofile;

-- Oracle中的口令历史功能，会将用户以前使用过的密码，即口令修改的信息存放到数据字典中
-- 用户修改密码时，Oracle就会比较新旧密码，当发现新旧密码相同时，则提示用户输入新密码
-- password_reuse_time 15指定口令可重用时间为15天，即15天后就可以再次使用该口令
create profile myprofile limit password_life_time 15 password_grace_time 2 password_reuse_time 15

-- 删除profile：此时用该文件约束的那些用户，也就都被释放了
drop profile password_history [cascade]
```

## 权限

权限指执行特定类型sql命令或者访问其它方案对象的权利

包括系统权限和对象权限两种

### 系统权限

用于控制用户可以执行的一个或一组数据库操作

`Oracle9i`提供了100多种系统权限，而且Oracle版本越高，其提供的系统权限就越多

**新建用户没有任何权限，甚至连登录数据库的权限都没有，所以需要为其指定相应的权限**

通常由`dba`或具有`grant any privilege`权限的其它用户执行授予操作

授予系统权限时，可以带有`with admin option`选项，指明被授予的用户或角色还可以将该系统权限授予其它用户或角色

常用的系统权限有如下几种

* create session（连接数据库）
* create table（用户可在自身方案中建表）
* create any table（用户可在任何方案中建表）
* create view（建视图）
* create procedure（建过程、函数、包）
* create trigger（建触发器）
* create cluster（建簇）
* create public synonym（建同义词）

```sql
-- 回收系统权限
-- 通常由dba来完成，若使用其它用户来回收权限，则要求其具有相应系统权限及转授系统权限的选项(with admin option)
-- 使用SYSTEM用户为Michael授予权限
grant create session, create table to Michael with admin option;
-- 使用Michael用户为Mahone授予登录数据库的权限
grant crate session to Mahone;
-- 系统权限是不会级联回收的，即此时Mahone还是能够登录数据库的
revoke create session from Michael;
-- 回收myjava用户对scott的emp表的查询权限（注意：谁赋的权，就要由谁收回）
revoke select on emp from myjava;
```

### 对象权限

指访问其它方案对象的权利

用户可以直接访问自己方案的对象，但要访问别的方案的对象，则必须具有对象的权限

常用的有：alter、insert、delete、update、select、index（索引）、references（引用）、execute（执行包、过程、函数的权限）

```sql
-- 授予对象权限
-- 在Oracle9i前，授予对象权限是由对象的所有者或者具有相应的（with grant option）权限的用户来操作的
-- 从Oracle9i起，dba用户（SYS、SYSTEM）可以将任何对象上的对象权限授予其它用户
-- 对象权限可以授予用户、角色和public
-- 授予权限时若带有with grant option选项，则可以将该权限转授其它用户
-- 但是，with grant option选项是不能授予给角色的，它只能授予给用户
grant update on emp(sal) to Michael;          --授予Michael用户只可以修改scott.emp表的sal字段的权限
grant alter on emp to Michael;                --授予Michael用户修改scott.emp表结构的权限
grant execute on dbms_transaction to Michael; --授予Michael用户执行包dbms_transaction的权限
grant index on scott.emp to Michael;          --授予Michael用户可以在scott方案中的emp表上建立索引的权限

--回收对象权限
--对象权限的回收是会被级联回收的
grant connect to myjava with admin option;       --如果是系统权限，就加入with admin option
grant select on emp to myjava with grant option; --如果是对象权限，就加入with grant option
grant select on scott.emp to myjava22;           --级联回收机制：若scott回收myjava对emp表的查询权限，那么得到myjava授权的myjava22也会失去select权限
```

## 角色

角色为相关权限的命令集合，使用角色的主要目的就是为了简化权限的管理

角色分为预定义角色和自定义角色

### 预定义角色

预定义角色指Oracle所提供的角色，每种角色都用于执行一些特定的管理任务，常用的预定义角色有connect、resource、dba

1、connect

　　具有应用开发人员需要的大部分权限

　　多数情况下，只要给新创建的用户授予connect和resource角色就够了，它包含了以下系统权限

　　alter session、create cluster、create database link、create session、create table、create view、create sequence

2、resource

　　具有应用开发人员所需要的其它权限。比如建立存储过程、触发器等

　　注意该角色隐含了`unlimited tablespace`系统权限

　　它包含了以下系统权限

　　create cluster、create indextype、create table、create sequence、create type、create procedure、create trigger

3、dba

　　具有所有的系统权限，以及`with admin option`选项

　　默认的dba用户为`SYS`和`SYSTEM`，他们可以将任何系统权限授予其它用户

　　但要注意，dba角色不具备`sysdba`和`sysoper`的特权（启动和关闭数据库）

### 自定义角色

一般由`dba`或者具有`create role`系统权限的其它用户来建立

建立角色时，可以指定验证方式：即不验证和数据库验证

1、不验证：如果角色是公用的角色，可以采用不验证的方式建立角色

　　命令为：`create role 角色名 not identified;`

2、数据库验证：此时建立角色需要为其提供口令。角色名和口令存放在数据库中，当激活该角色时，必须提供口令

　　命令为：`create role 角色名 identified by 口令;`

### 管理角色

新建立角色时，该角色没有任何权限，为了使得角色能够完成特定任务，必须为其授予相应的系统权限和对象权限

给角色授权和给用户授权没有太多区别

但要注意：系统权限的`unlimited tablesapce`和对象权限的`with grant option`选项是不能授予角色的

```sql
-- 授权角色
grant create session to 角色名 with admin option;
grant select on scott.emp to 角色名;
grant insert,update,delete on scott.emp to 角色名;
grant select on emp to myjava; --授权myjava用户可以查询scott的emp表。此时必须是scott或者更高权限如dba方才进行该操作
                               --此时应该使用select * from scott.emp来查询，否则还是查不到数据
grant all on emp to myjava;    --授权myjava用户拥有scott相对于emp表的所有权限，其查询、修改、删除表数据的权限

-- 2、分配角色给某个用户（通常由dba或具有grant any role系统权限的其它用户来完成）
grant 角色名 to Michael with admin option;  --授予Michael用户一个角色，且Michael可以将该角色继续授予给其它用户
grant resource to myjava;                  --授权myjava用户可在任意表空间下建表
grant connect to myjava;                   --授权myjava用户拥有登录权限
grant dba to myjava;                       --授权myjava用户拥有DBA权限

-- 删除角色（通常由dba或具有drop any role系统权限的其它用户来执行）
drop role 角色名; --此时该角色所被授予的用户，将同时会失去该角色所包含的权限

-- 显示角色
-- 当以用户的身份连接到数据库时，Oracle会自动激活默认的角色
-- 通过dba_role_privs可以显示某个用户具有的所有角色以及当前默认的角色
select * from dba_role_privs where grantee='用户名'; --显示某个用户具有的所有角色以及当前默认的角色
select * from dba_roles;                            --显示所有角色，包括预定义和自定义的角色
select * from role_sys_privs where role='角色名'     --显示角色所具有的系统权限
select * from dba_tab_privs where grantee='角色名';  --显示角色所具有的对象权限
```