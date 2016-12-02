---
layout: post
title: "iBatis集成Spring"
categories: iBatis
tags: ibatis spring
author: 玄玉
excerpt: 介绍iBatis与Spring的三种集成方式。
---

* content
{:toc}


iBatis集成Spring的方式，共有三种

下面简单描述一下（本文展示的是个人感觉最为方便的那种）

## 第一种

将`sqlMapClient`注入给未继承任何类的DAO接口实现类

然后在DAO接口实现类中增加`setSqlMapClient(SqlMapClient sqlMapClient)`方法

接下来就可以基于原生的iBatis-api编程

## 第二种

将`sqlMapClient`注入给继承了`SqlMapClientDaoSupport`类的DAO接口实现类

不同的是该DAO接口实现类不需要添加`setSqlMapClient()`方法

接下来就可以直接使用类似`this.getSqlMapClientTemplate().insert()`的方法

## 第三种

就是本文的例子，个人感觉是最方便的，示例代码如下

首先是实体类`User.Java`

```java
package com.jadyer.model;
public class User {
    private int id;
    private String name;
    private String content;
    private byte[] fileContent;
    /*--setter和getter略--*/
}
```

下面是实体类映射文件`//src//com//jadyer//model//User.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE sqlMap PUBLIC "-//ibatis.apache.org//DTD SQL Map 2.0//EN" "http://ibatis.apache.org/dtd/sql-map-2.dtd">
<sqlMap namespace="User">
    <typeAlias alias="user" type="com.jadyer.model.User"/>

    <resultMap class="user" id="userResultMap">
        <result property="id" column="id"/>
        <result property="name" column="name"/>
        <result property="content" column="content" javaType="java.lang.String" jdbcType="CLOB"/>
    </resultMap>

    <!--
    很多数据库支持自动生成主键的数据类型
    SQLMap通过<insert>子元素<selectKey>来支持自动生成的键值
    它同时支持预生成（如Oracle）和后生成两种类型（如MySQL/MS-SQLServer）
    -->
    <insert id="insert" parameterClass="user">
        <selectKey keyProperty="id" resultClass="java.lang.Integer">
            SELECT seq_t_user_test.nextval AS id FROM DUAL
        </selectKey>
        INSERT INTO t_user_test(id, name, content) VALUES(#id#, #name#, #content#)
    </insert>
    <insert id="insertForMySQL" parameterClass="user">
        INSERT INTO t_user_test(id, name, content) VALUES(#id#, #name#, #content#)
        <selectKey keyProperty="id" resultClass="java.lang.Integer">
            SELECT LAST_INSERT_ID() AS value
        </selectKey>
    </insert>

    <delete id="delete" parameterClass="java.lang.Integer">
        <![CDATA[
            DELETE FROM t_user_test WHERE id=#id#
        ]]>
    </delete>

    <!-- 也可以传Map作为参数 -->
    <update id="update" parameterClass="java.util.Map">
        UPDATE t_user_test SET content=#content# WHERE id=#id#
    </update>

    <select id="selectByID" parameterClass="java.lang.Integer" resultMap="userResultMap">
        SELECT * FROM t_user_test WHERE id=#id#
    </select>
</sqlMap>
```

下面是数据库脚本

```sql
--DB2/Oracle中CLOB对应clob,BLOB对应blob
--     MySQL中CLOB对应text,BLOB对应blob
--      Java中CLOB对应String,BLOB对应byte[]

-- Oracle
CREATE TABLE t_user_test (
id      NUMBER PRIMARY KEY,
name    VARCHAR2(50),
content CLOB
);
CREATE SEQUENCE seq_t_user_test MINVALUE 1 MAXVALUE 999999 START WITH 1 INCREMENT BY 1 CACHE 20;

-- MySQL
CREATE TABLE t_user_test (
id      INT(11) NOT NULL AUTO_INCREMENT,
name    VARCHAR(50) NULL,
content TEXT NULL,
PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=UTF8;
```

下面是iBatis2.x的全局配置文件`//src//SqlMapConfig.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE sqlMapConfig PUBLIC "-//ibatis.apache.org//DTD SQL Map Config 2.0//EN" "http://ibatis.apache.org/dtd/sql-map-config-2.dtd">
<sqlMapConfig>
    <!-- 集成Spring之后，数据源的配置就挪到了Spring，所以iBatis本身的配置可以取消 -->
    <settings useStatementNamespaces="true"/>
    <sqlMap resource="com/jadyer/model/User.xml"/>
</sqlMapConfig>
```

下面是Spring的全局配置文件`//src//applicationContext.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tx="http://www.springframework.org/schema/tx" xmlns:context="http://www.springframework.org/schema/context" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.1.xsd http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-3.1.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-3.2.xsd">
    <bean id="dataSource" class="org.logicalcobwebs.proxool.ProxoolDataSource">
        <property name="driver" value="com.mysql.jdbc.Driver"/>
        <property name="driverUrl" value="jdbc:oracle:thin:@127.0.0.1:1521:jadyer"/>
        <property name="user" value="scott"/>
        <property name="password" value="hongyu"/>
    </bean>

    <context:component-scan base-package="com.jadyer"/>

    <bean id="txManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>
    <tx:annotation-driven transaction-manager="txManager"/>

    <bean id="sqlMapClientTemplate" class="org.springframework.orm.ibatis.SqlMapClientTemplate">
        <property name="sqlMapClient">
            <bean class="org.springframework.orm.ibatis.SqlMapClientFactoryBean">
                <property name="configLocation" value="classpath:SqlMapConfig.xml"/>
                <property name="dataSource" ref="dataSource"/>
            </bean>
        </property>
    </bean>
</beans>
```

接下来是操作数据库的`UserDaoImpl.java`

```java
package com.jadyer.dao;
import java.sql.SQLException;
import java.util.Map;
import javax.annotation.Resource;
import org.springframework.orm.ibatis.SqlMapClientTemplate;
import org.springframework.stereotype.Repository;
import com.jadyer.model.User;

//其实不是非得去实现什么接口的
@Repository
public class UserDaoImpl {
    @Resource
    private SqlMapClientTemplate sqlMapClientTemplate;

    /**
     * 批量插入
     */
    public void batchInsert(final String statement, final List<User> userList) throws DataAccessException {
        this.getSqlMapClientTemplate().execute(new SqlMapClientCallback() {
            public Object doInSqlMapClient(SqlMapExecutor executor) throws SQLException {
                executor.startBatch();
                int batchCount = 0;
                for(User user : userList){
                    executor.update(statement, user);
                    batchCount++;
                    //每200条批量提交一次
                    if(200 == batchCount){
                        executor.executeBatch();
                        batchCount = 0;
                    }
                }
                executor.executeBatch();
                return null;
            }
        });
    }

    /**
     * @return 返回的是本次新增记录的id（注意配置文件中要在INSERT INTO语句前面指定<selectKey>标签才会生效）
     */
    public int insert(User user) {
        return (Integer)this.sqlMapClientTemplate.insert("User.insert", user);
    }

    /**
     * @return 返回的是本次新增记录的id（注意配置文件中要在INSERT INTO语句后面指定<selectKey>标签才会生效）
     */
    public int insertForMySQL(User user) {
        return (Integer)this.sqlMapClientTemplate.insert("User.insertForMySQL", user);
    }

    /**
     * @return 本次操作影响的行数，即本次删除的记录数
     */
    public int delete(int id) throws SQLException{
        return (Integer)this.sqlMapClientTemplate.delete("User.delete", id);
    }

    /**
     * @return 本次操作影响的行数，即本次修改的记录数
     */
    public int update(Map<String, Object> map) throws SQLException{
        return (Integer)this.sqlMapClientTemplate.update("User.update", map);
    }

    /**
     * @return 本次查询到的对象
     */
    public User selectByID(int id) throws SQLException{
        return (User)this.sqlMapClientTemplate.queryForObject("User.selectByID", id);
    }
}
```

最后是用JUnit4.x编写的单元测试`IbatisSpringTest.java`

```java
package com.jadyer.test;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import com.jadyer.dao.UserDaoImpl;
import com.jadyer.model.User;

/**
 * 本例的依赖包如下
 * ojdbc6-11.2.0.3.jar(mysql-connector-java-5.1.26-bin.jar)
 * proxool-0.9.1.jar
 * proxool-cglib.jar
 * ibatis-2.3.4.726.jar
 * commons-logging-1.1.3
 * aopalliance.jar
 * spring-aop-3.1.4.RELEASE
 * spring-asm-3.1.4.RELEASE
 * spring-beans-3.1.4.RELEASE
 * spring-context-3.1.4.RELEASE
 * spring-core-3.1.4.RELEASE
 * spring-expression-3.1.4.RELEASE
 * spring-jdbc-3.1.4.RELEASE
 * spring-orm-3.1.4.RELEASE
 * spring-tx-3.1.4.RELEASE
 * Created by 玄玉<https://jadyer.github.io/> on 2011/04/06 19:56.
 */
public class IbatisSpringTest {
    private static UserDaoImpl userDao;

    @BeforeClass
    public static void globalInit(){
        try{
            ApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
            userDao = (UserDaoImpl)ctx.getBean("userDaoImpl");
        }catch(RuntimeException e){
            System.out.println("初始化Bean对象时遇到异常，堆栈轨迹如下");
            e.printStackTrace();
        }
    }

    @Test
    public void insert() throws SQLException{
        User user = new User();
        user.setName("张起灵");
        user.setContent("张起灵是个过客，可吴邪却成了幽灵。");
        Assert.assertTrue(userDao.insert(user)>0);
    }

    @Test
    public void delete() throws SQLException{
        Assert.assertEquals(1, userDao.delete(2));
    }

    @Test
    public void update() throws SQLException{
        Map<String, Object> paramMap = new HashMap<String, Object>();
        paramMap.put("id", 4);
        paramMap.put("content", "铁面生可能是最后的黑手");
        Assert.assertEquals(1, userDao.update(paramMap));
    }

    @Test
    public void selectByID() throws SQLException{
        Assert.assertEquals("张起灵", userDao.selectByID(4).getName());
    }
}
```