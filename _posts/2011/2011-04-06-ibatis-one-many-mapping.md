---
layout: post
title: "iBatis中的一和多映射"
categories: iBatis
tags: ibatis 映射
author: 玄玉
excerpt: 介绍iBatis中的一对多和一对一映射的不同写法，以及示例代码。
---

* content
{:toc}


## 公共的SqlMapConfig.xml

这两个例子里面，都有用到`//src//SqlMapConfig.xml`文件

这是个公共文件，内容如下

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE sqlMapConfig PUBLIC "-//ibatis.apache.org//DTD SQL Map Config 2.0//EN" "http://ibatis.apache.org/dtd/sql-map-config-2.dtd">
<sqlMapConfig>
    <settings useStatementNamespaces="true"/>
    <transactionManager type="JDBC">
        <dataSource type="SIMPLE">
            <property name="JDBC.Driver" value="oracle.jdbc.OracleDriver"/>
            <property name="JDBC.ConnectionURL" value="jdbc:oracle:thin:@127.0.0.1:1521:jadyer"/>
            <property name="JDBC.Username" value="scott"/>
            <property name="JDBC.Password" value="jadyer"/>
        </dataSource>
    </transactionManager>
    <sqlMap resource="com/jadyer/model/User.xml"/>
    <sqlMap resource="com/jadyer/model/People.xml"/>
</sqlMapConfig>
```

## 一对多映射

首先是两个实体类`User.java`以及`Address.java`

```java
package com.jadyer.model;
import java.util.List;
public class User {
    private Integer id;
    private String name;
    private String job;
    private List<Address> addresses;
    /* 四个属性的setter和getter略 */
}
```

```java
package com.jadyer.model;
public class Address {
    private Integer id;
    private Integer userId;
    private String address;
    private Integer postcode;
    /* 四个属性的setter和getter略 */
}
```

接下来是实体类映射文件`com/jadyer/model/User.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE sqlMap PUBLIC "-//ibatis.apache.org//DTD SQL Map 2.0//EN" "http://ibatis.apache.org/dtd/sql-map-2.dtd">
<sqlMap namespace="User">
    <typeAlias alias="user" type="com.jadyer.model.User"/>
    <typeAlias alias="address" type="com.jadyer.model.Address"/>

    <!-- 通过在<resultMap/>中定义嵌套查询getAddressByUserId，实现了关联数据的读取 -->
    <resultMap id="get-user-result" class="user">
        <result property="id" column="ID"/>
        <result property="name" column="NAME"/>
        <result property="job" column="JOB"/>
        <result property="addresses" column="id" select="User.getAddressesByUserId"/>
    </resultMap>

    <select id="getAddressesByUserId" parameterClass="int" resultClass="address">
        select address, postcode from t_address where user_id = #userId#
    </select>

    <select id="getUsers" resultMap="get-user-result">
        select id, name, job from t_user
    </select>

    <select id="getUserByName" parameterClass="java.lang.String" resultMap="get-user-result">
        select id, name, job from t_user where name = #name#
    </select>
</sqlMap>
```

下面是用到的数据库脚本文件

```sql
-- Oracle 11g

-- Create table
create table t_user(
  id    number,
  name  varchar2(10),
  job varchar2(20)
);

create table t_address(
  id    number,
  user_id number,
  address varchar2(20),
  postcode number
);

-- Add data
insert into t_user values(1, '沈浪', '侠客');
insert into t_user values(2, '王怜花', '军师');
insert into t_user values(3, '金不换', '财务');
insert into t_address values(1, 1, '来无影去无踪', 999999);
insert into t_address values(2, 1, '赏金侠客天君', 888888);
insert into t_address values(3, 1, '万剑山庄之主', 777777);
insert into t_address values(4, 2, '鬼魅狐影奸狭', 666666);
insert into t_address values(5, 2, '易容之术无敌', 555555);
insert into t_address values(6, 3, '鬼迷心窍恋财', 444444);
insert into t_address values(7, 3, '厚颜无耻杯具', 333333);
```

最后是JUnit4.x的单元测试类`IBatisOneToManyTest.java`

```java
package com.jadyer.test;
import java.io.IOException;
import java.io.Reader;
import java.sql.SQLException;
import java.util.List;
import org.junit.BeforeClass;
import org.junit.Test;
import com.ibatis.common.resources.Resources;
import com.ibatis.sqlmap.client.SqlMapClient;
import com.ibatis.sqlmap.client.SqlMapClientBuilder;
import com.jadyer.model.Address;
import com.jadyer.model.User;

public class IBatisOneToManyTest {
    private static SqlMapClient sqlMapClient;

    /**
     * 读取ibatis配置文件，连接数据库，并创建SqlMapClient
     */
    @BeforeClass
    public static void readConfig() throws IOException {
        Reader reader = Resources.getResourceAsReader("SqlMapConfig.xml");
        sqlMapClient = SqlMapClientBuilder.buildSqlMapClient(reader);
        reader.close();
    }

    /**
     * 获取所有用户的，包含了地址的，详细资料
     */
    @Test
    public void getUsers() throws SQLException {
        List<User> userList = sqlMapClient.queryForList("User.getUsers");
        for(User user : userList){
            System.out.println("==>" + user.getName() + "：" + user.getJob());
            for(Address address : user.getAddresses()){
                System.out.println(address.getAddress() + "---" +address.getPostcode());
            }
        }
    }

    /**
     * 获取指定用户的，包含了地址的，详细资料
     */
    @Test
    public void getUserByName() throws SQLException {
        User user = (User)sqlMapClient.queryForObject("User.getUserByName", "王怜花");
        System.out.println("==>" + user.getName() + "：" + user.getJob());
        for(Address address : user.getAddresses()){
            System.out.println(address.getAddress() + "---" +address.getPostcode());
        }
    }
}
```

## 一对一映射

首先是实体类`People.java`

```java
package com.jadyer.model;

public class People {
    private Integer id;
    private String name;
    private String job;
    private String sex;
    private String card;
    /* 四个属性的setter和getter略 */
}
```

接下来是实体类映射文件`com/jadyer/model/People.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE sqlMap PUBLIC "-//ibatis.apache.org//DTD SQL Map 2.0//EN" "http://ibatis.apache.org/dtd/sql-map-2.dtd">
<sqlMap namespace="People">
    <typeAlias alias="people" type="com.jadyer.model.People"/>

    <resultMap id="get-people-result" class="people">
        <result property="id" column="ID"/>
        <result property="name" column="NAME"/>
        <result property="job" column="JOB"/>
        <result property="sex" column="SEX"/>
        <result property="card" column="CARD"/>
    </resultMap>

    <!--
    一对一关联是一对多关联的一种特例
    这种情况下，若用一对多的编写方式，将导致1+1条SQL的执行
    所以，我们可以采用一次Select两张表的方式，避免这样的性能开销
    这个时候，应该保证People类中包含sex和card两个属性，并且一个People类就够了，不需要Identity类
    -->
    <select id="getPeoples" resultMap="get-people-result">
        select * from t_people, t_identity where t_people.id = t_identity.people_id
    </select>

    <select id="getPeopleByName" parameterClass="java.lang.String" resultMap="get-people-result">
        select * from t_people, t_identity where name = #name# and t_people.id = t_identity.people_id
    </select>
</sqlMap>
```

下面是数据库脚本文件

```sql
-- Oracle 11g

-- Create table
create table t_people(
  id    number,
  name  varchar2(8),
  job varchar2(20)
);

create table t_identity(
  id    number,
  people_id number,
  sex varchar2(2),
  card number
);

-- Add data
insert into t_people values(1, '张起灵', '武器');
insert into t_people values(2, '陈文锦', '领队');
insert into t_people values(3, '吴三省', '插班');
insert into t_identity values(1, 1, '男', 777777777777);
insert into t_identity values(2, 2, '女', 666666666666);
insert into t_identity values(3, 3, '男', 555555555555);
```

最后是JUnit4.x的单元测试类`IBatisOneToOneTest.java`

```java
package com.jadyer.test;
import java.io.IOException;
import java.io.Reader;
import java.sql.SQLException;
import java.util.List;
import org.junit.BeforeClass;
import org.junit.Test;
import com.ibatis.common.resources.Resources;
import com.ibatis.sqlmap.client.SqlMapClient;
import com.ibatis.sqlmap.client.SqlMapClientBuilder;
import com.jadyer.model.People;

public class IbatisOneToOneTest {
    private static SqlMapClient sqlMapClient;

    /**
     * 读取ibatis配置文件，连接数据库，并创建SqlMapClient
     */
    @BeforeClass
    public static void readConfig() throws IOException {
        Reader reader = Resources.getResourceAsReader("SqlMapConfig.xml");
        sqlMapClient = SqlMapClientBuilder.buildSqlMapClient(reader);
        reader.close();
    }

    /**
     * 获取所有用户的，包含了身份证的，详细资料
     */
    @Test
    public void getPeoples() throws SQLException {
        List<People> peopleList = sqlMapClient.queryForList("People.getPeoples");
        for(People people : peopleList){
            System.out.println("==>" + people.getName() + "：" + people.getCard());
        }
    }

    /**
     * 获取指定用户的，包含了身份证的，详细资料
     */
    @Test
    public void getPeopleByName() throws SQLException {
        People people = (People)sqlMapClient.queryForObject("People.getPeopleByName", "陈文锦");
        System.out.println("==>" + people.getName() + "：" + people.getCard());
    }
}
```