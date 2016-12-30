---
layout: post
title: "Spring集成JDBC"
categories: Spring
tags: spring jdbc
author: 玄玉
excerpt: 描述Spring集成JDBC的配置方法。
---

* content
{:toc}


# 代码

下面直接演示代码，各种细节详见代码注释

首先是 `/src/jdbc.properties`

```ruby
driverClassName=oracle.jdbc.OracleDriver
url=jdbc:oracle:thin:@127.0.0.1:1521:jadyer
username=scott
password=jadyer
initialSize=1
maxActive=500
maxIdle=2
minIdle=1
```

下面是 `/src/beans.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:context="http://www.springframework.org/schema/context" xmlns:aop="http://www.springframework.org/schema/aop" xmlns:tx="http://www.springframework.org/schema/tx" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-2.5.xsd http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-2.5.xsd http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-2.5.xsd">
    <!-- 也可通过下面的方式引入配置文件中的属性 -->
    <!--
    <bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
        <property name="systemPropertiesModeName" value="SYSTEM_PROPERTIES_MODE_OVERRIDE"/>
        <property name="ignoreResourceNotFound" value="false"/>
        <property name="locations">
            <list>
                <value>classpath:config-${spring.profiles.active}.properties</value>
                <value>file:/app/wzf/password/ElecChnlPayCusPassword.properties</value>
            </list>
        </property>
    </bean>
    -->
    <!-- 将jdbc.properties中的值引入到配置文件中 -->
    <context:property-placeholder location="classpath:jdbc.properties" />

    <!-- 配置数据源 -->
    <bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">
        <property name="driverClassName" value="${driverClassName}"/>
        <property name="url" value="${url}"/>
        <property name="username" value="${username}"/>
        <property name="password" value="${password}"/>
        <!-- 连接池启动时的初始值 -->
        <property name="initialSize" value="${initialSize}"/>
        <!-- 连接池的最大值 -->
        <property name="maxActive" value="${maxActive}"/>
        <!-- 最大空闲值：经过一个高峰时间后，连接池可以慢慢将已经用不到的连接释放一部分，一直减少到maxIdle为止 -->
        <property name="maxIdle" value="${maxIdle}"/>
        <!-- 最小空闲值：当空闲的连接数少于阀值时，连接池就会预申请一些连接，以免洪峰突袭时来不及申请数据库连接 -->
        <property name="minIdle" value="${minIdle}"/>
    </bean>

    <!-- 声明一个事务管理器 -->
    <!-- 这里DataSourceTransactionManager类是Spring专门为我们提供的针对数据源的事务管理器 -->
    <bean id="txManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>
    <!-- 启动使用注解实现声明式事务管理的支持 -->
    <tx:annotation-driven transaction-manager="txManager"/>

    <!-- 这里面的 SEQUENCE_PERSON_12 是我们在Oracle数据库中创建的序列名 -->
    <bean id="sequence12" class="org.springframework.jdbc.support.incrementer.OracleSequenceMaxValueIncrementer">
        <property name="incrementerName" value="SEQUENCE_PERSON_12"/>
        <property name="dataSource" ref="dataSource"/>
    </bean>

    <bean id="personServiceImpl" class="com.jadyer.service.impl.PersonServiceImpl">
        <property name="sequence12" ref="sequence12"/>
        <property name="dataSource" ref="dataSource"/>
    </bean>
</beans>

<!-- Spring开发团队建议我们采用注解方式来配置事务 -->
<!-- 下面是使用Spring配置文件实现事务管理的示例代码 -->
<!--
配置事务管理器，共有两种方式：分别为注入sessionFaction和dataSource
<bean id="transactionManager" class="org.springframework.orm.hibernate3.HibernateTransactionManager">
    <property name="sessionFactory" ref="sessionFactory"/>
</bean>
<bean id="txManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
    <property name="dataSource" ref="dataSource"/>
</bean>

设定事务边界
关于事务边界的设置，不要添加到Dao上，通常设置到业务层
因为业务逻辑要调用很多方法，我们要保证它的原子性，这里就是在业务逻辑接口上设定事务边界
因为Spring默认JDK动态代理，它就是对接口做的实现，所以我们事务开启的是接口上的方法
另外，层与层之间，最后通过接口来关联，因为它是抽象的，不经常变动的
<aop:config>
    <aop:pointcut id="transactionPointcut" expression="execution(* com.jadyer.service..*.*(..))" />
    <aop:advisor advice-ref="txAdvice" pointcut-ref="transactionPointcut" />
</aop:config>

配置事务的传播特性
<tx:advice id="txAdvice" transaction-manager="txManager">
    <tx:attributes>
        <tx:method name="get*" read-only="true"  propagation="NOT_SUPPORTED" />
        <tx:method name="add*" propagation="REQUIRED"/>
        <tx:method name="del*" propagation="REQUIRED"/>
        <tx:method name="modify*" propagation="REQUIRED"/>
        <tx:method name="*" propagation="REQUIRED" read-only="true"/>
    </tx:attributes>
</tx:advice>
-->
```

下面是用到的实体类 `Person.java`

```java
package com.jadyer.model;

public class Person {
    private Integer id;
    private String name;
    private Integer age;

    /*-- 三个属性的setter和getter略 --*/

    //不要忘记默认的无参构造方法
    public Person(){}

    public Person(String name, Integer age) {
        this.name = name;
        this.age = age;
    }
}
```

下面是服务层接口 `PersonService.java`

```java
package com.jadyer.service;
import java.util.List;
import com.jadyer.model.Person;

public interface PersonService {
    public long save(Person person);
    public void delete(Integer personid);
    public void update(Person person);
    public Person getPersonById(Integer personid);
    public List<Person> getPersons();
}
```

下面是服务层接口的实现类 `PersonServiceImpl.java`

```java
package com.jadyer.service.impl;
import java.util.List;
import javax.sql.DataSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import com.jadyer.model.Person;
import com.jadyer.service.PersonService;

/**
 * ----------------------------------------------------------------------------------------------------
 * SpringJDBC提供了自增键以及行集的支持，自增键对象让我们可以不依赖数据库的自增键，在应用层为新记录提供主键值
 * org.springframework.jdbc.support.incrementer.DataFieldMaxValueIncrementer接口提供两种产生主键的方案
 * 1、通过序列产生主键：比较有代表性的就是本文用到的OracleSequenceMaxValueIncrementer
 * 2、通过表产生主键：比较有代表性的就是MySQLMaxValueIncrementer,具体用法请自行Google
 * ----------------------------------------------------------------------------------------------------
 * 根据主键产生方式和数据库的不同，Spring提供了若干实现类
 * 在其抽象实现类AbstractDataFieldMaxValueIncrementer中有几个重要的属性
 * 其中incrementerName是针对第一种方案（序列）时使用的，columnName和cacheSize是针对第二种方案（表）时使用的
 * 1、incrementerName--用于指定序列或主键表的名称
 * 2、columnName-------用于指定主键列的名字
 * 3、cacheSize--------用于指定缓存的主键个数
 * ----------------------------------------------------------------------------------------------------
 * Created by 玄玉<https://jadyer.github.io/> on 2011/02/20 18:48.
 */
@Transactional
public class PersonServiceImpl implements PersonService {
    //private DataSource dataSource;   //不建议直接对DataSource进行操作
    private JdbcTemplate jdbcTemplate; //而是借助JdbcTemplate
    public void setDataSource(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    private OracleSequenceMaxValueIncrementer sequence12;
    public OracleSequenceMaxValueIncrementer getSequence12() {
        return sequence12;
    }
    public void setSequence12(OracleSequenceMaxValueIncrementer sequence12) {
        this.sequence12 = sequence12;
    }

    public long save(Person person) {
        long ID = this.sequence12.nextLongValue();
        String sql = "insert into person values(" + ID + ", ?, ?)";
        Object[] params = new Object[]{person.getName(), person.getAge()};
        this.jdbcTemplate.update(sql, params);
        return ID;
    }

    //设置当该方法遇到RuntimeException时，不会回滚
    @Transactional(noRollbackFor=RuntimeException.class)
    public void delete(Integer personid) {
        this.jdbcTemplate.update("delete from person where id=?", new Object[]{personid});
        //为了测试noRollbackFor属性，故添加此行代码
        throw new RuntimeException("运行期例外");
    }

    public void update(Person person) {
        String sql = "update person set name=? where id=?";
        Object[] params = new Object[]{person.getName(), person.getId()};
        this.jdbcTemplate.update(sql, params);
    }

    @Transactional(propagation=Propagation.NOT_SUPPORTED)
    public Person getPersonById(Integer personId) {
        String sql = "select * from person where id=?";
        return (Person)this.jdbcTemplate.queryForObject(sql, new Object[]{personId}, new PersonRowMapper());
    }

    @Transactional(propagation=Propagation.NOT_SUPPORTED)
    public String getPersonNameByAge(Integer age) {
        String sql = "SELECT name FROM person WHERE age = ?";
        try{
            return (String)this.jdbcTemplate.queryForObject(sql, new Object[]{age}, String.class);
        }catch(EmptyResultDataAccessException e){
            //查到空记录时，会报告此异常
            return "查无此人";
        }
    }

    @Transactional(propagation=Propagation.NOT_SUPPORTED)
    public List<Person> getPersons() {
        //当查询到该条记录时，它会调用第三个对象的回调方法
        return (List<Person>)this.jdbcTemplate.query("select * from person", new PersonRowMapper());
    }
}
```

下面是自定义的实现 RowMapper 接口的类 `PersonRowMapper.java`

```java

package com.jadyer.service.impl;
import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;
import com.jadyer.model.Person;

public class PersonRowMapper implements RowMapper {
    public Object mapRow(ResultSet rs, int index) throws SQLException {
        //当外部调用该方法时，已经做了一步if(rs.next())操作了，所以这里我们不用再rs.next()
        Person person = new Person(rs.getString("name"), rs.getInt("age"));
        //注意：该句不可少
        //否则personService.getPersonById(2)获取到的Person对象中的id值将是空的
        person.setId(rs.getInt("id"));
        //我们的目的是要让返回的person对象的各个属性，都不是虚的，都是确有其值的
        return person;
    }
}
```

然后是使用 JUnit4 写的单元测试类 `PersonServiceTest.java`

```java
package com.jadyer.junit;
import org.junit.BeforeClass;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import com.jadyer.model.Person;
import com.jadyer.service.PersonService;

public class PersonServiceTest {
    private static PersonService personService;

    @BeforeClass
    public static void setUpBeforeClass() throws Exception {
        try {
            ApplicationContext cxt = new ClassPathXmlApplicationContext("beans.xml");
            personService = (PersonService) cxt.getBean("personServiceImpl");
        } catch (RuntimeException e) {
            //若出错，则打印提示信息到控制台（否则它是不会打印到控制台上的）
            System.out.println("服务载入失败，堆栈轨迹如下：");
            e.printStackTrace();
        }
    }

    @Test
    public void save(){
        personService.save(new Person("沈浪", 24));
        personService.save(new Person("王怜花", 25));
    }

    @Test
    public void delete(){
        personService.delete(2);
    }

    @Test
    public void update(){
        Person person = personService.getPersonById(3);
        person.setName("金无望");
        personService.update(person);
    }

    @Test
    public void getPersonById(){
        Person person = personService.getPersonById(3);
        System.out.println("编号:" + person.getId() + "/t姓名:" + person.getName());
    }

    @Test
    public void getPersons(){
        for(Person person : personService.getPersons()){
            System.out.println("编号:" + person.getId() + "/t姓名:" + person.getName());
        }
    }
}
```

最后是用到的 Oracle 数据库脚本文件

```sql
-- Oracle 11g
-- 创建表格
create table person(
    id number(2) primary key,
    name varchar(8),
    age number(2)
);

-- 创建序列
create sequence SEQUENCE_PERSON_12 increment by 1 start with 1 nomaxvalue nocycle;
```

# 补充

获取本次 INSERT 的主键值，也可以借助org.springframework.jdbc.core.simple.SimpleJdbcInsert.class

用法如下

```java
public int insert(String userID, String keyword){
    SimpleJdbcInsert jdbcInsert = new SimpleJdbcInsert(this.jdbcTemplate);
    jdbcInsert.withTableName("t_keyword");                //指定插入的表
    jdbcInsert.usingColumns("userId", "keyword", "type"); //指定插入哪些字段
    jdbcInsert.usingGeneratedKeyColumns("id");            //指定欲插入记录的主键
    Map<String, Object> params = new HashMap<String, Object>();
    params.put("userId", userID);
    params.put("keyword", keyword);
    params.put("type", "vote");
    return jdbcInsert.executeAndReturnKey(params).intValue();
}
```

另外，还有一个场景，**不过：这里并未实际测试**

那就是使用MySQL时，通过 SpringJDBC 单独创建一个查询：查询 MySQL 内置的 `LAST_INSERT_ID()` 函数

据说它返回的是下一个 INSERT 操作的主键值，而非本次 INSERT 的主键值

猜测是由于 Spring 通过 DataSource 获取的连接与上一次的 INSERT 连接不是同一个