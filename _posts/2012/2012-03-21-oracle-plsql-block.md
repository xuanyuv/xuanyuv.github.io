---
layout: post
title: "OraclePLSQL编程之过程函数包及触发器和变量"
categories: Oracle
tags: oracle
author: 玄玉
excerpt: 主要介绍Oracle-PLSQL编程中的块、存储过程、函数、包、触发器、变量等用法。
---

* content
{:toc}


## 简述

`PL/SQL`编程是Oracle在标准的SQL语言上的扩展，它不仅支持允许嵌入SQL语言，还可以自定义常量和变量

也允许使用条件语句、循环语句、逻辑控制语句等，允许使用例外处理各种错误，这样使得它的功能变得更加强大

它的劣势是移植性差，而优势主要有以下四点

1、提高应用程序的运行性能：省去了数据库编译Java程序发送过来的SQL语句的时间

2、模块化的设计思想：比如分页存储过程模块、订单处理存储过程模块、转账存储过程模块等等

3、减少网络传输量：不必再用Java程序发送那么多的SQL语句了

4、提高安全性：直接在Java程序中调用存储过程名，省去了暴露SQL的危险

它的一些常见规范如下

* 定义变量时，建议用`v_`作为前缀，例如`v_sal`
* 定义常量时，建议用`c_`作为前缀，例如`c_rate`
* 定义例外时，建议用`e_`作为前缀，例如`e_error`
* 定义游标时，建议用`_cursor`后缀，例如`emp_cursor`

它主要是块编程，简单可以分为过程、函数、包、触发器等等

```sql
-- 编写一个存储过程，该过程可以向某表中添加记录
create table student(name varchar2(10),password varchar2(30));
create or replace procedure mypro is
    begin
        insert into student values('张起灵','zhang22'); --执行部分
    end;
exec mypro; -- 调用名字为mypro的存储过程，格式为exec procedure_name(param1,param2,...)
call mypro; -- 也可以使用call命令调用
```

## block

`块`是`PL/SQL`的基本程序单元，编写PL/SQL程序实际上就是编写PL/SQL块

完成一个简单功能，可能只需编写一个PL/SQL块；但若实现复杂的功能，可能需要在一个PL/SQL块中嵌套其它的PL/SQL块

PL/SQL块由三个部分构成：定义部分、执行部分、例外处理部分

* declare  ：定义部分：该部分是可选的
* begin    ：执行部分：该部分是必须的
* exception：例外处理部分，该部分是可选的，其用于处理运行的各种错误
* end;

```sql
-- 1、只包括执行部分的PL/SQL块
set serveroutput on -- 打开输出选项
-- dbms_output是Oracle所提供的包，类似Java的开发包，该包中包含一些过程，put_line就是该包中的一个过程
begin
    dbms_output.put_line('my name is jadyer'); -- 在控制台输出字符串：my name is jadyer
end;

-- 2、包含定义部分、执行部分的PL/SQL块
declare
    v_ename varchar2(5); -- 定义字符串变量
    v_sal number(7,2);
begin
    -- into表示将查询到的信息，放入到v_ename变量中（注意这里ename、sal和v_ename、v_sal的顺序是相匹配的）
    -- &表示要接收从控制台输入的变量
    select ename,sal into v_ename,v_sal from emp where empno=&no;
    dbms_output.put_line('雇员名：'||v_ename||' 工资：'||v_sal);
end;

-- 3、包含定义部分、执行部分、例外处理部分的PL/SQL块
declare
    v_ename varchar2(5);
    v_sal number(7,2);
begin
    select ename,sal into v_ename,v_sal from emp where empno=&no;
    dbms_output.put_line('雇员名：'||v_ename||' 工资：'||v_sal);
exception
    --Oracle预定义了一些例外，其中no_data_found就是找不到数据的例外
    when no_data_found then
    dbms_output.put_line('您输入的员工编号不存在。');
end;
```

## 存储过程

其用于执行特定的操作

建立过程时，既可以指定输入参数（可将数据传递到执行部分），也可以指定输出参数（可将执行部分的数据传递到应用环境）

```sql
-- 修改指定用户的工资
-- 类似于Java定义方法时的参数，故不可以指定参数类型的长度
create procedure emp_pro(currName varchar2, newSal number) is
    begin
        update emp set sal=newSal where ename=currName;
    end;

--调用存储过程（效果是将SCOTT的工资变动为23456）
exec emp_pro('SCOTT',23456);

--Java程序中调用该存储过程
CallableStatement cstmt = java.sql.Connection.prepareCall("{call emp_pro(?,?)}");
cstmt.setString(1, "SCOTT");
cstmt.setInt(2, 23456);
cstmt.execute();
```

## 函数

其用于返回特定的数据

建立函数时，在函数头部必须包含return子句，而函数体必须包含return语句返回的数据

```sql
-- 返回指定雇员的年薪
create function emp_fun(currName varchar2) return number is yearSal number(7,2);
    begin
        select sal*12+nvl(comm,0)*12 into yearSal from emp where ename=currName;
        return yearSal;
    end;

-- Java程序中调用该函数时，使用rs.getInt(1)就会得到返回的结果
-- sqlplus中调用函数时，需要以下三步
var NianXin number;
call emp_fun('SCOTT') into:NianXin;
print NianXin;
```

## 包

其用于在逻辑上组合过程和函数，它由包规范和包体两部分组成

包的规范只包含了过程和函数的说明（但是没有过程和函数的实现代码），包体用于实现包规范中的过程和函数

```sql
-- 1、使用create package命令创建包
create or replace package emp_pack is
    procedure emp_pro(currName varchar2, newSal number); --声明该包中有一个过程
    function emp_fun(currName varchar2) return number;   --声明该包中有一个函数
end;

-- 2、使用create package body命令创建包体
create package body emp_pack is
    procedure emp_pro(currName varchar2, newSal number) is
        begin
            update emp set sal=newSal where ename=currName;
        end;
    function emp_fun(currName varchar2) return number is yearSal number;
        begin
            select sal*12+nvl(comm,0)*12 into yearSal from emp where ename=currName;
            return yearSal;
        end;
end;

-- 3、调用包的过程或函数时，在过程和函数前需要带有包名；如果要访问其它方案的包，还需要在包名前加方案名
call emp_pack.emp_pro('SCOTT',400800);
```

## 触发器

触发器是指存放在数据库中，被隐含执行的存储过程

触发器由触发事件、触发条件、触发操作三部分构成

它主要分为：DML触发器、DDL触发器、系统触发器（后两个触发器通常由系统管理员创建，即`conn system/xxx as sysdba`）

### 管理触发器

需要使用system登录

```sql
alter trigger trigger_name disable;          --禁用触发器（让触发器临时生效）
alter trigger trigger_name enable;           --激活触发器
alter table table_name disable all triggers; --禁用表的所有触发器
alter table table_name enable all triggers;  --激活表的所有触发器
drop trigger trigger_name;                   --删除触发器
```

### DML触发器

```sql
-- /**
--  * 语法如下
--  */
create [or replace] trigger trigger_name
{before|after}
{insert|delete|update [of column [,column ...]]}
on [schema.] table_name
[for each row]    --代表行级触发器，没有它则代表表级触发器
[when condition]  --代表触发条件
begin
    trigger_body;
end;

-- /**
--  * 一些例子
--  */
-- 1、在表中添加一条数据时，提示"添加了一条数据"
create or replace trigger trigger_blog after insert on scott.blog
begin
    dbms_output.put_line('添加了一条数据');
end;

-- 2、在表中修改多条数据时，提示多次"修改了数据"
create or replace trigger trigger_blog after update on scott.blog for each row
begin
    dbms_output.put_line('修改了数据');
end;

-- 3、禁止在休息日修改表数据（开发人员可以建立before语句触发器，从而实现数据的安全）
create or replace trigger trigger_blog before insert or update or delete on scott.blog
begin
    if to_char(sysdate,'day') in ('星期六','星期日') then
        -- dbms_output.put_line('不能在休息日操作数据');  --这样只会提示，而不能阻止该操作
        -- raise_application_error()是Oracle提供的一个过程，只要PLSQL碰到它，PLSQL就会停止执行，其语法如下
        -- PROCEDUER raise_application_error(error_number_in IN NUMBER, error_msg_in IN VARCHAR2)
        -- error_number_in是从-200000到-20999之间的，这样就不会与Oracle的任何错误代码发生冲突了
        -- 而error_msg_in的长度也不要超过2000，否则Oracle会自动截取前2000个字符
        raise_application_error(-20001,'不能在休息日操作数据');
    end if;
end;

-- 4、为了区分触发器中所包含的多个触发事件，可以使用三个条件：inserting,updating,deleting
create or replace trigger trigger_blog before insert or update or delete on scott.blog
begin
    if to_char(sysdate,'day') in ('星期六','星期日') then
        case
            when inserting then raise_application_error(-20002,'请不要在休息日添加数据');
            when updating then raise_application_error(-20003,'请不要在休息日修改数据');
            when deleting then raise_application_error(-20004,'请不要在休息日删除数据');
        end case;
    end if;
end;

-- 5、修改雇员薪水时，确保雇员工资不能低于原工资，也不能高出原工资的20%，并显示薪水修改前和修改后的值
create or replace trigger trigger_blog before update on scott.blog for each row
begin
    -- 由于我们的触发器是针对emp表的，所以PLSQL就知道这里的sal是blog表的字段
    -- ':new'修饰符用于访问操作完成后列的值，':old'修饰符用于访问操作完成前列的值
    if (:new.sal<:old.sal or :new.sal>:old.sal*1.2) then
        raise_application_error(-20005,'修改后的工资不能低于原工资，也不能高出原工资的20%');
    else
        dbms_output.put_line('原来的工资：'||:old.sal||'    现在的工资：'||:new.sal);
    end if;
end;

-- 6、删除表记录时，自动将删除掉的记录备份到另外一张表中
create or replace trigger trigger_blog before delete on scott.blog for each row
begin
    insert into blog_bak values (:old.id, :old.name, :old.sal);
end;
```

### DDL触发器

```sql
-- 语法如下
create [or replace] trigger trigger_name
after ddl on 方案名.schema  -- 这里的'.schema'是固定写法，如scott.schema
begin
    trigger_body;
end;

-- 一个例子（记录某个用户进行的DDL操作）
create table log_ddl(uname varchar2(20), ddl_event varchar2(20), ddl_time date);
create or replace trigger trigger_ddl after ddl on scott.schema
begin
    insert into log_ddl values(ora_login_user, ora_sysevent, sysdate);
end;
```

##`# 系统触发器

系统触发器是指基于Oracle事件（如logon,startup）所建立的触发器

在创建系统触发器时，需要使用事件属性函数，常用的事件属性函数，如下

* ora_client_ip_address：返回客户端IP（Windows上面返回的IP可能为空）
* ora_database_name：返回数据库名
* ora_login_user：返回登陆的用户名
* ora_sysevent：返回触发触发器的系统事件名
* ora_des_encrypted_password：返回用户DES加密后的密码

```sql
-- 语法如下
create [or replace] trigger trigger_name
after[before] logon[logoff] on database  -- 固定写法，这就不存在for each row属性了，因为它是针对数据库的
begin
    trigger_body;
end;

-- 一个例子（登录触发器会在登录之后记录，退出触发器会在退出之前记录）
create table log_sysevent(uname varchar2(20), logon_time date, logoff_time date, ip varchar2(20));
create or replace trigger trigger_logon after logon on database
begin
    insert into log_sysevent(uname,logon_time,ip) values(ora_login_user, sysdate, ora_client_ip_address);
end;
create or replace trigger trigger_logoff before logoff on database
begin
    insert into log_sysevent(uname,logoff_time,ip) values(ora_login_user, sysdate, ora_client_ip_address);
end;
```

## 变量

在编写PL/SQL程序时，可以定义变量和常量，其主要包括以下四种常见类型

* 标量类型（scalar）
* 复合类型（composite）
* 参照类型（reference）
* lob（large object）

其语法为：`identifier [constant] datatype [not null] [:=| default expr]`

* identifier：名称
* constant  ：指定常量（需要指定它的初始值，且其值是不能改变的）
* datatype  ：数据类型
* not null  ：指定变量不能为null
* **:=**    ：给变量或常量指定初始值
* default   ：用于指定初始值
* expr      ：指定初始值PL/SQL表达式，可以是文本值、其它变量、函数等

### 标量

```sql
v_ename varchar2(10);                   --定义一个变长字符串
v_sal number(6,2);                      --定义一个小数，范围是-9999.99~~9999.99
v_sal number(6,2):=5.4                  --定义一个小数并给定初始值为5.4
v_hiredate date;                        --定义一个日期型数据
v_valid boolean not null default false; --定义一个布尔变量，其不能为空，且初始值为false

-- 标量的使用
-- 这里需要说明的是，PL/SQL块为变量赋值不同于其它的编程语言，需要在等号前加冒号，即（:=）
-- 下面以输入员工号，显示员工姓名、工资、个人所得税（税率为0.03）为例
declare
    v_ename varchar2(5);
    v_sal number(7,2);
    c_tax_rate number(3,2):=0.03;
    v_tax_sal number(7,2);
begin
    select ename,sal into v_ename,v_sal from emp where empno=&no;
    v_tax_sal:=v_sal*c_tax_rate; -- 计算所得税，PL/SQL中允许直接进行运算
    dbms_output.put_line('姓名：'||v_ename||' 工资：'||v_sal||' 交税：'||v_tax_sal);
end;

-- 若员工姓名超过5个字符，就会出现错误。那么为了降低PL/SQL程序的维护工作量，可以使用（%type）属性定义变量
-- 这样它会按照数据库列，来确定变量类型和长度，格式为：标识符 表名.列名%type
v_ename emp.ename%type;
```

### 复合变量

composite用于存放多个值的变量，主要包括PL/SQL记录、PL/SQL表、嵌套表（nested table）、动态数组（varray）等

```sql
-- 复合类型之PL/SQL记录（类似于高级语言中的结构体）
-- 注意：当引用PL/SQL记录成员时，必须加上记录变量作为前缀，即：记录变量.记录成员
declare
    -- 定义一个PL/SQL记录类型，类型的名字是emp_record_type，该类型包含三个数据：name、salary、title
    type emp_record_type is record(currName emp.ename%type, salary emp.sal%type, title emp.job%type);
    -- 定义一个变量，变量的名字是my_record，这个变量的类型是emp_record_type
    my_record emp_record_type;
begin
    select ename,sal,job into my_record from emp where empno=7788; -- 该变量my_record就可以接收三个数据
    dbms_output.put_line('员工名：'||my_record.currName||' 工资：'||my_record.salary);
end;

-- 复合类型之PL/SQL表（相当于高级语言中的数组）
-- 注意：高级语言中数组下标不能为负数，而PL/SQL是可以为负数的，且表元素的下标没有限制
declare
    -- 定义一个PL/SQL表类型，类型的名字是my_table_type，该类型用于存放emp.ename%type类型的数组
    -- 其中index by binary_integer表示该数组下标是按整数排序的，故其下标可以为负数，因为负整数也是整数
    type my_table_type is table of emp.ename%type index by binary_integer;
    -- 定义一个变量，变量的名字是my_table，这个变量的类型是my_table_type
    -- PL/SQL中总是将变量名字写在前面，变量类型写在后面
    my_table my_table_type;
begin
    select ename into my_table(0) from emp where empno=7788;
    dbms_output.put_line('员工名：'||my_table(0));
end;
```

### 参照变量

其用于存放数值指针的变量

通过使用参照变量，可使得应用程序共享相同对象，从而降低占用的空间

编写PL/SQL程序时，可使用游标变量（`ref cursor`）和对象类型变量（`ref obj_type`）两种参照变量类型

```sql
-- 参照变量之游标变量
-- 定义游标时，不需要指定相应的select语句
-- 但在使用游标（open）时需要指定select语句，这样一个游标就与一个select语句结合了

-- 使用PL/SQL编写一个块，要求输入部门号，显示该部门所有员工的姓名和工资
declare
    type my_emp_cursor is ref cursor; --定义一个游标类型
    test_cursor my_emp_cursor;        --定义一个游标变量，该变量的类型是my_emp_cursor
    v_ename emp.ename%type;           --定义变量，用于接收select到的ename值
    v_sal emp.sal%type;
begin
    open test_cursor for select ename,sal from emp where deptno=&no; --把test_cursor和一个select结合
    loop                                                             --使用(loop...end loop)循环取出数据
        fetch test_cursor into v_ename,v_sal;                        --使用fetch取出test_cursor游标指向的数据，并放到变量中
        exit when test_cursor%notfound;                              --判断test_cursor是否为空。若其为空，则退出循环
        dbms_output.put_line('员工名：'||v_ename||' 工资：'||v_sal);
    end loop;
end;
```