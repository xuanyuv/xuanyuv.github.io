---
layout: post
title: "OraclePLSQL编程之条件控制及例外处理和分页"
categories: Oracle
tags: oracle
author: 玄玉
excerpt: 主要介绍Oracle-PLSQL编程中的条件分支语句、控制结构语句、例外处理、以及应用到Oracle分页中的例子。
---

* content
{:toc}


# 条件分支

`PL/SQL`中提供了三种条件分支语句：`if--then`、`if--then--else`、`if--then--elsif--else`

```sql
-- 若员工职位是PRESIDENT，则为其增加工资1000；若员工职位是MANAGER，则为其增加工资500；其它职位的员工工资只增加200
create or replace procedure my_pro(currNo number) is
    v_job emp.job%type;
    begin
        select job into v_job from emp where empno=currNo;
        if v_job='PRESIDENT' then
            update emp set sal=sal+1000 where empno=currNo;
        elsif v_job='MANAGER' then
            update emp set sal=sal+500 where empno=currNo;
        else
            update emp set sal=sal+200 where empno=currNo;
        end if;
    end;
```

# 控制结构

常用的包括`loop`循环、`while`循环、`for`循环

```sql
-- /**
--  * loop
--  * loop是PL/SQL中最简单的循环语句，它以loop开头、以end loop结尾，这种循环至少会被执行一次
--  */
-- 输入用户名，并循环添加10个用户到users表中，用户编号从1开始增加
create or replace procedure my_pro(currName varchar2) is
    v_num number:=1; --定义用户编号变量，并赋初值为1
    begin
        loop
            insert into users values(v_num, currName);
            exit when v_num=10; --当编号为10时，退出循环
            v_num:=v_num+1;     --令编号自增
        end loop;
    end;

-- /**
--  * while
--  * 只有条件为true时，才会执行循环体语句，它以while..loop开头、以end loop结尾
--  */
-- 输入用户名，并循环添加10个用户到users表中，用户编号从11开始增加
create or replace procedure my_pro(currName varchar2) is
    v_num number:=1; --定义用户编号变量，并赋初值为1
    begin
        loop
            insert into users values(v_num, currName);
            exit when v_num=10; --当编号为10时，退出循环
            v_num:=v_num+1;     --令编号自增
        end loop;
    end;

-- /**
--  * for
--  */
begin
    for i in reverse 1..10 loop
        insert into users values(i,'玄霄');
    end loop;
end;

-- /**
--  * goto
--  * 用于跳转到特定标号去执行语句。由于使用goto语句会增加程序的复杂性，使得应用程序可读性变差，故不建议使用
--  * 其基本语法为goto lable（这里的lable的是已经定义好的标号名）
--  */
declare
    i int :=1;
begin
    loop
        dbms_output.put_line('输出 i=' || i);
        if i=10 then
            goto myend; --跳转到myend标号的位置，再向下执行
        end if;
        i:=i+1;
    end loop;
    dbms_output.put_line('循环结束');
    <<myend>> --做一个标号
    dbms_output.put_line('循环结束22');
end;
/

-- /**
--  * null
--  * 它不会执行任何操作，并且会直接将控制传递到下一条语句。使用它的主要好处是可以提高PL/SQL的可读性
--  */
declare
    v_sal emp.sal%type;
    v_name emp.ename%type;
begin
    select sal,ename into v_sal,v_name from emp where empno=&no;
    if v_sal<3000 then
        update emp set comm=sal*0.1 where ename=v_name;
    else
        null; --可以认为它是一个空语句，什么都不干
    end if;
end;
```

# 例外处理

Oracle将例外分为预定义例外、非预定义例外、自定义例外三种

* 预定义例外：用于处理常见的Oracle错误，它是由PL/SQL所提供的系统例外
* 非预定义例外：用于处理与预定义例外无关的Oracle错误
* 自定义例外：用于处理与Oracle错误无关的其它情况

预定义例外和非预定义例外都是与Oracle错误相关的，并且出现的Oracle错误会隐含的触发相应的例外

而自定义例外与Oracle错误没有任何关联，它是由开发人员为特定情况所定义的例外

下面是自定义例外的一个案例

```sql
-- 自定义案例：编写一个PL/SQL块，接收一个员工的编号，并为其工资增加1000元，若该员工不存在，请提示
create or replace procedure my_ex(myNo number) is
    myex exception; --定义一个例外
    begin
        update emp set sal=sal+1000 where empno=myNo;
        if sql%notfound then --这里sql%notfound表示没有update成功
            raise myex;  --这里raise表示触发myex例外
        end if;
    exception
        when myex then
            dbms_output.put_line('错误：没有更新任何用户');
    end;
```

使用预定义例外只能处理`21`个Oracle错误，而当使用`PL/SQL`开发应用程序时，可能会遇到其它的一些Oracle错误

比如在PL/SQL块中执行DML语句时，违反了约束规定等等，这就会隐含的触发一个内部例外

下面介绍一些常用的例外

```sql
zero_divide          --当执行类似于（2/0）操作时，会触发该例外
logon_denide         --当用户非法登录时，会触发该例外
not_logged_on        --如果用户没有登录，便执行DML操作，会触发该例外
storage_error        --如果超出了内存空间或内存被损坏，会触发该例外
timeout_on_resource  --如果Oracle在等待资源时，出现了超时现象，会触发该例外

-- case_not_found：在开发PL/SQL块中编写case语句时，如果在where子句中没有包含必须的条件分支，则会触发该例外
create or replace procedure my_pro(myno number) is
    v_sal emp.sal%type;
    begin
        select sal into v_sal from emp where empno=myno;
        case
            when v_sal<1000 then
                update emp set sal=sal+100 where empno=myno;
            when v_sal<2000 then
                update emp set sal=sal+200 where empno=myno;
        end case;
    exception
        when case_not_found then --当查出来的薪水是3000的时候，便会触发该例外
        dbms_output.put_line('错误：case语句没有与'||v_sal||'相匹配的条件');
    end;

-- cursor_already_open：当重新打开已经打开的游标时，会隐含的触发该例外
declare
    cursor cursor_emp is select ename,sal from emp;
begin
    open cursor_emp;
    for emp_record in cursor_emp loop
        dbms_output.put_line(emp_record.ename);
    end loop;
exception
    when cursor_already_open then
    dbms_output.put_line('错误：游标已打开，请不要重复打开');
end;

-- dup_val_on_index：在唯一索引所对应的列上插入重复值时，会隐含的触发该例外
begin
    insert into dept values(10, '公关部', '北京');
exception
    when dup_val_on_index then
        dbms_output.put_line('错误：在dept.detpno上不能出现重复值');
end;

-- invaild_cursor：当视图在不合法的游标（如：从未打开的游标上提取数据或关闭未打开的游标等）上执行操作时，会触发该例外
declare
    cursor cursor_emp is select ename,sal from emp;
    emp_record cursor_emp%rowtype;
begin
    --open cursor_emp; --打开游标
    fetch cursor_emp into emp_record;
    dbms_output.put_line(emp_record.ename);
    close cursor_emp;
exception
    when invalid_cursor then
        dbms_output.put_line('错误：请检测游标cursor_emp是否已打开');
end;

-- invalid_number：当输入的数据有误时，会触发该例外
begin
    update emp set sal=sal+'1oo'; --不如将数字100写成了1oo
exception
    when invalid_number then
        dbms_output.put_line('错误：您所输入的数字1oo不正确');
end;

-- no_data_found：当执行select--into--from没有返回行时，即查询到的数据不存在时，会触发该例外
declare
    v_sal emp.sal%type;
begin
    select sal into v_sal from emp where ename='&name';
exception
    when no_data_found then
        dbms_output.put_line('错误：该员工不存在');
end;

-- too_many_rows：当执行select--into--from时，如果返回多行的值，即查询到的数据不止一条时，会触发该例外
declare
    v_ename emp.ename%type;
begin
    select ename into v_ename from emp;
exception
    when too_many_rows then
        dbms_output.put_line('错误：返回值应为一行，这里却返回了多行的数据');
end;

-- value_error：在执行赋值操作时，若变量的长度不足以容纳实际数据，则会触发该例外
declare
    v_ename varchar2(5);
begin
    select ename into v_ename from emp where empno=&no;
    dbms_output.put_line(v_ename);
exception
    when value_error then
        dbms_output.put_line('错误：变量的长度不足');
end;
```

# Oracle分页

下面是无返回值的存储过程

```sql
create table book(bookId number, bookName varchar2(50), publishHouse varchar2(50));
-- in表示这是一个输入参数，默认为in，out表示这是一个输出参数
create or replace procedure my_pro_book(proBookId in number, proBookName in varchar2, proPublishHouse varchar2) is
    begin
        insert into book values(proBookId, proBookName, proPublishHouse);
    end;

-- 下面是Java代码
CallableStatement cstmt = java.sql.Connection.prepareCall("{call my_pro_book(?,?,?)}");
cstmt.setInt(1, 10);
cstmt.setString(2, "盗墓笔记");
cstmt.setString(3, "中国友谊出版公司");
cstmt.execute();
```

下面是有返回值的存储过程（非列表）

```sql
create or replace procedure my_pro_book(proBookId in number, proBookName out varchar2, proPublishHouse out varchar2) is
    begin
        select bookName,publishHouse into proBookName,proPublishHouse from book where bookId=proBookId;
    end;

--下面是Java代码
CallableStatement cstmt = java.sql.Connection.prepareCall("{call my_pro_book(?,?,?)}");
cstmt.setInt(1, 10);                                            --给第一个问号赋值
cstmt.registerOutParameter(2, oracle.jdbc.OracleTypes.VARCHAR); --给第二个问号赋值，可以理解为注册值
cstmt.registerOutParameter(3, oracle.jdbc.OracleTypes.VARCHAR); --给第三个问号赋值
cstmt.execute();                                                --执行该存储过程
String publishHouse = cstmt.getString(3); --取出该存储过程的返回值（注意所取参数值的问号顺序，它由该参数的位置决定）
```

下面是有返回值的存储过程（列表[结果集]）

```sql
-- 由于Oracle存储过程没有返回值，它的所有返回值都是通过`out`参数替代的，列表同样也不例外
-- 但由于是集合，所以不能用一般的参数，必须要用`package`
create or replace package my_package_emp as type my_cursor is ref cursor;
    end my_package_emp; --创建一个my_package_book包，并在该包中声明了一个my_cursor类型的游标
create or replace procedure my_pro_emp(currNo in number, cursor_emp out my_package_emp.my_cursor) is
    begin
        open cursor_emp for select * from emp where deptno=currNo;
    end;

-- 下面是Java代码
CallableStatement cstmt = java.sql.Connection.prepareCall("{call my_pro_emp(?,?)}");
cstmt.setInt(1, 10);
cstmt.registerOutParameter(2, oracle.jdbc.OracleTypes.CURSOR); --此时为该参数注册的类型为CURSOR
cstmt.execute();
ResultSet rs = (ResultSet)cstmt.getObject(2); --得到结果集（用ResultSet接收getObject()返回值的同时，注意造型）
while(rs.next()){
    System.out.println(rs.getInt(1)+" "+rs.getString(2));
}
```

下面是编写Oracle分页的存储过程的详细例子

```sql
create or replace package my_package_pagination as type my_cursor_pagination is ref cursor;
create or replace procedure my_pro_pagination(
    tableName in varchar2,                                               --表名
    pageSize in number,                                                  --分页大小（即每页显示的记录数）
    pageNumber in number,                                                --当前页码
    rowCount out number,                                                 --总记录数
    pageCount out number,                                                --总页数
    cursor_pagination out my_package_pagination.my_cursor_pagination) is --返回的记录集
    v_sql varchar2(1000);                                                --定义分页的SQL语句字符串
    v_beginNo number:=(pageNumber-1)*pageSize+1;
    v_endNo number:=pageNumber*pageSize;
    begin
        v_sql:='select * from (select rownum myno, aa.* from (select * from '||tableName||' order by sal) aa where rownum<='||v_endNo||') where myno>='||v_beginNo;
        open cursor_pagination for v_sql;          --关联游标和SQL语句
        v_sql:='select count(*) from '||tableName; --组织一个SQL语句
        execute immediate v_sql into rowCount;     --执行一个SQL语句，并将返回的值赋给rowCount
        if mod(rowCount,pageSize)=0 then           --计算pageCount
            pageCount:=rowCount/pageSize;
        else
            pageCount:=rowCount/pageSize+1;
        end if;
        close cursor_pagination; --关闭游标
    end;

-- 以下是Java代码
CallableStatement cstmt = java.sql.Connection.prepareCall("{call my_pro_pagination(?,?,?,?,?,?)}");
cstmt.setString(1, "emp");                                      --指定表名，即待分页显示的表
cstmt.setInt(2, 5);                                             --指定分页大小
cstmt.setInt(3, 2);                                             --指定显示的当前页码
cstmt.registerOutParameter(4, oracle.jdbc.OracleTypes.INTEGER); --注册总记录数
cstmt.registerOutParameter(5, oracle.jdbc.OracleTypes.INTEGER); --注册总页数
cstmt.registerOutParameter(6, oracle.jdbc.OracleTypes.CURSOR);  --注册返回的结果集
cstmt.execute();
Integer rowCount = cstmt.getInt(4);           --取出总记录数
Integer pageCount = cstmt.getInt(5);          --取出总页数
ResultSet rs = (ResultSet)cstmt.getObject(6); --得到结果集
while(rs.next()){
    System.out.println("编号：" + rs.getInt(1) + "  姓名：" + rs.getString(2) + "  工资：" + rs.getFloat(6));
}
```