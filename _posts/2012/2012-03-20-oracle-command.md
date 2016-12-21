---
layout: post
title: "Oracle命令小结"
categories: Oracle
tags: oracle
author: 玄玉
excerpt: 一些常用的Oracle命令。
---

* content
{:toc}


# 分页

```sql
-- rownum分页：这里Oracle使用了二分机制，这种机制使得其分页速度均要快于MySQL和MSSQL
SELECT * FROM (SELECT rownum myno, aa.* FROM (SELECT * FROM emp) aa WHERE rownum<=10) WHERE myno>=6
-- rownum分页：若要指定查询列，或者对列排序等，那么只需要修改最里层的子查询即可
SELECT * FROM (SELECT rownum myno, aa.* FROM (SELECT ename, sal FROM emp ORDER BY sal DESC) aa WHERE rownum<=10) WHERE myno>=6

--第二种方式：rowid分页
SELECT * FROM student WHERE rowid in (SELECT rid FROM (SELECT rownum rn, rid FROM (SELECT rowid rid, sid FROM student ORDER BY sid DESC) WHERE rownum<=10) WHERE rn>=6) ORDER BY sid DESC

--第三种方式：分析函数
SELECT * FROM (SELECT ss.*, row_number() over(ORDER BY sid DESC) rk FROM student ss) WHERE rk<=500 and rk>=201
```

# 元数据

```sql
-- 显示错误的详细信息
show error;

-- 显示操作时间
set timing on;

-- 可以替代变量，而该变量在执行时，需要用户输入
select * from emp where ename='&Jadyer'

-- 将sql*plus屏幕内容输出到指定的文件中
spool d:\bb.sql
select * from emp
spool off

-- 用于显示当前用户拥有的所有表，它只返回用户所对应方案的所有表
select table_name from user_tables;

-- 用于显示当前用户可以访问的所有表，它会返回当前用户方案的所有表，以及该用户可以访问的其它方案的表
select table_name from all_tables;

-- 它会显示所有方案拥有的数据库表。但查询该数据字典视图，要求用户必须是dba角色或者有select any table系统权限
-- 比如当system用户查询数据字典视图dba_tables时，会返回system、sys、scott....方案所对应的数据库表
select * from dict where comments like '%grant%';                           --显示当前用户可以访问的所有数据字典视图
select * from global_name;                                                  --显示当前数据库名称
select tablespace_name from dba_tablespaces;                                --显示表空间的信息
select file_name,bytes from dba_data_files where tablespace_name='表空间名'; --显示表空间所包含的数据文件

select * from dba_roles;                             --查询Oracle中所有的角色，一般是dba
select distinct privilege from dba_tab_privs;        --查询Oracle中所有对象权限，一般是dba
select * from system_privilege_map order by name;    --查询Oracle中所有的系统权限，一般是dba
select tablespace_name from dba_tablespaces;         --查询数据库的表空间
select * from role_sys_privs where role='CONNECT';   --查询CONNECT角色所具有的系统权限
select * from dba_sys_privs where grantee='CONNECT'; --查询CONNECT角色所具有的系统权限
select * from dba_tab_privs where grantee='CONNECT'; --查询CONNECT角色所具有的对象权限

select * from dba_indexes;                                -- 显示数据库所有的索引信息
select * from user_indexes where table_name='表名';       -- 显示当前用户的索引信息
select * from user_ind_columns where index_name='索引名'; -- 显示索引对应的列信息

-- 初始化参数用于设置实例或数据库特征，Oracle9i提供了200多个初始化参数，并且它们都有默认值
-- 可在该文件中修改：ORACLE_HOME\\admin\\jadyer\\pfile\\init.ora
show parameter;

SELECT sys_context('userenv', 'host') FROM DUAL;            --查询当前数据库所在主机的名称
SELECT sys_context('userenv', 'lanuage') FROM DUAL;         --查询当前语言
SELECT sys_context('userenv', 'db_name') FROM DUAL;         --查询当前数据库名称
SELECT sys_context('userenv', 'terminal') FROM DUAL;        --查询当前会话客户所对应的终端标识符
SELECT sys_context('userenv', 'session_user') FROM DUAL;    --查询当前在操作数据库的用户
SELECT sys_context('userenv', 'current_schema') FROM DUAL;  --查询当前在操作的数据库方案
SELECT sys_context('userenv', 'nls_date_format') FROM DUAL; --查询当前会话客户所对应的日期格式
```

# 合并查询

实际应用中，为了合并多个select结果，可以使用集合操作符号：union、union all、intersect、minus

```sql
-- union：用于取得两个结果的并集，它会自动去掉结果集中的重复行
SELECT ename,sal,job FROM emp WHERE sal>2500 union SELECT ename,sal,job FROM emp WHERE job='MANAGER'

-- union all：与union相似，但它不会去掉重复行，而且不会排序
SELECT ename,sal,job FROM emp WHERE sal>2500 union all SELECT ename,sal,job FROM emp WHERE job='MANAGER'

-- intersect：取得两个结果集的交集
SELECT ename,sal,job FROM emp WHERE sal>2500 intersect SELECT ename,sal,job FROM emp WHERE job='MANAGER'

-- minus：取得两个结果集的差集，它只会显示存在于第一个集合中而不存在于第二个集合中的数据
SELECT ename,sal,job FROM emp WHERE sal>2500 minus SELECT ename,sal,job FROM emp WHERE job='MANAGER'
```

# 删除表数据

Oracle中共有三种删除数据的方式：为drop、delete、truncate（其中delete速度慢，truncate速度快）

```sql
DROP TABLE student;     --删除表的结构和数据，不可恢复

TRUNCATE TABLE student; --删除表中所有记录，表结构还在（此过程中不写日志，故数据不可恢复）

SELECT * FROM student;  --删除前查看表中是否有数据
SAVEPOINT aa;           --设定存储点，此步骤必不可少（Oracle中的savepoint不冲突，故可设定多个，且commit后会被清除）
DELETE [FROM] student;  --删除表中的所有数据，表结构还在（此过程中会写日志，故数据仍可恢复）
ROLLBACK TO aa;         --回滚到aa存储点
SELECT * FROM student;  --此时会发现之前delete掉的数据，又恢复回来了
```

# 创建DBLINK

```sql
-- 创建方式
CREATE PUBLIC DATABASE LINK EC_PAYCORE_LINK connect to jfb identified by jfb using
    '(DESCRIPTION =
        (ADDRESS_LIST =
            (ADDRESS = (PROTOCOL = TCP)(HOST = localhost)(PORT = 1521))
        )
        (CONNECT_DATA =
            (SERVICE_NAME = ntdata)
        )
    )';
-- 使用方式
SELECT count(*) FROM t_pay_order_info@EC_PAYCORE_LINK;
```

# 动态性能视图

动态性能视图用于记录当前例程的活动信息

它的所有者为SYS，一般情况下，由dba或特权用户来查询动态性能视图

启动OracleServer时系统会建立动态性能视图，停止Oracle Server时系统会删除动态性能视图

Oracle的所有动态性能视图都是以`v_$`开始的，并且Oracle为每个动态性能视图都提供了相应的以`v$`开始的同义词

例如`v_$datafile`的同义词为`v$datafile`