---
layout: post
title: "iBatis入门例子"
categories: iBatis
tags: ibatis demo
author: 玄玉
excerpt: 介绍iBatis的基本用法。
---

* content
{:toc}


直接上示例代码，相关细节说明，详见代码注释

首先是存储数据库连接信息的`jdbc.properties`

```sh
driver   = oracle.jdbc.OracleDriver
url      = jdbc:oracle:thin:@127.0.0.1:1521:jadyer
username = scott
password = jadyer
```

其次是ibatis2的全局配置文件`//src//SqlMapConfig.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE sqlMapConfig PUBLIC "-//ibatis.apache.org//DTD SQL Map Config 2.0//EN" "http://ibatis.apache.org/dtd/sql-map-config-2.dtd">
<sqlMapConfig>
    <!-- <properties/>应该放到<settings/>之前 -->
    <properties resource="jdbc.properties"/>

    <!--
    cacheModelsEnabled：是否启用SqlMapClient上的缓存机制，建议设为"true"
    enhancementEnabled：是否针对POJO启用字节码增强机制以提升getter/setter的调用效能
                        其可避免使用反射所带来的性能开销，同时提升延迟加载的性能，建议设为"true"
    lazyLoadingEnabled：是否启用延迟加载机制，建议设为"true"
    errorTracingEnabled：是否启用错误日志，开发期间可以设为"true"以便调试
    maxRequests：最大并发请求数，即Statement并发数
    maxTransactions：最大并发事务数
    maxSessions：最大Session数，即最大允许的并发SqlMapClient数，它设定必须介于maxRequests和maxTransactions之间
    useStatementNamespaces：是否使用Statement命名空间。这里的命名空间指的是User.xml映射文件中，<sqlMap/>节点的namespace属性
                            如User.xml中的<sqlMap namespace="User">，即指定了此sqlMap节点下定义的操作均从属于"User"命名空间
                            当其值为true时，Statement调用需追加命名空间，如sqlMapClient.insert("User.saveBySequence", user)
                            否则直接通过Statement名称调用即可，如sqlMapClient.insert("saveBySequence", user);
                            但请注意此时需要保证所有的映射文件中，Statement定义不能重名
     -->
    <settings cacheModelsEnabled="true"
            enhancementEnabled="true"
            lazyLoadingEnabled="true"
            errorTracingEnabled="true"
            maxRequests="32"
            maxSessions="10"
            maxTransactions="5"
            useStatementNamespaces="false"/>

    <!--
    定义ibatis的事务管理器
    目前提供了三种选择：JDBC、JTA、EXTERNAL
    JDBC：通过传统JDBC Connection.commit/rollback实现事务支持
    JTA：使用容器提供的JTA服务实现全局事务管理
    EXTERNAL：外部事务管理。如在EJB中使用ibatis，通过EJB的部署配置即可实现自动的事务管理机制
              此时ibatis将把所有事务委托给外部容器进行管理
    此外：也可以通过Spring等轻量级容器实现事务的配置化管理
    -->
    <transactionManager type="JDBC">
        <!--
        设定ibatis运行期使用的DataSource属性，type属性用于指定dataSource的实现类型
        SIMPLE：这是ibatis内置的dataSource实现，其中实现了一个简单的数据库连接池机制
                对应ibatis实现类为com.ibatis.sqlmap.engine.datasource.SimpleDataSourceFactory
        DBCP：基于Apache DBCP连接池组件实现的DataSource封装，当无容器提供DataSource服务时，建议使用该选项
              对应ibatis实现类为com.ibatis.sqlmap.engine.datasource.DbcpDataSourceFactory
        JNDI：使用J2EE容器提供的DataSource实现，DataSource将通过指定的JNDI Name从容器中获取
              对应ibatis实现类为com.ibatis.sqlmap.engine.datasource.JndiDataSourceFactory
        -->
        <dataSource type="SIMPLE">
            <property name="JDBC.Driver" value="${driver}" />
            <!-- 若是MSSQL，需要在url后追加SelectMethod=Cursor以获得JDBC事务的多Statement支持 -->
            <property name="JDBC.ConnectionURL" value="${url}" />
            <property name="JDBC.Username" value="${username}" />
            <property name="JDBC.Password" value="${password}" />
            <!-- 数据库连接池可维持的最大容量 -->
            <property name="Pool.MaximumActiveConnections" value="10"/>
            <!-- 数据库连接池中允许的挂起（idle）连接数 -->
            <property name="Pool.MaximumIdleConnections" value="5"/>
            <!-- ****************************************************************************************** -->
            <!-- **********************************以下配置为SIMPLE模式独享********************************** -->
            <!-- ****************************************************************************************** -->
            <!-- 数据库连接池中，连接被某个任务所允许占用的最大时间，如果超过这个时间限定，连接将被强制收回。单位为毫秒 -->
            <property name="Pool.MaximumCheckoutTime" value="120000"/>
            <!-- 当线程试图从连接池中获取连接时，连接池中无可用连接可供使用，此时线程将进入等待状态，直到池中出现空闲连接 -->
            <!-- 此参数设定了线程所允许等待的最长时间。单位为毫秒 -->
            <property name="Pool.TimeToWait" value="500"/>
            <!-- 数据库连接状态检测语句 -->
            <!-- 某些数据库连接在某段时间持续处于空闲状态时会将其断开。而连接池管理器将通过此语句检测池中连接是否可用 -->
            <!-- 检测语句应是最简化的无逻辑SQL。若语句执行成功，则认为此连接处于可用状态 -->
            <property name="Pool.PingQuery" value="select 1 from t_user"/>
            <!-- 是否允许检测连接状态 -->
            <property name="Pool.PingEnabled" value="false"/>
            <!-- 对持续连接时间超过设定值（毫秒）的连接进行检测 -->
            <property name="Pool.PingConnectionsOlderThan" value="1"/>
            <!-- 对空闲超过设定值（毫秒）的连接进行检测 -->
            <property name="Pool.PingConnectionsNotUsedFor" value="1"/>
            <!-- ****************************************************************************************** -->
            <!-- ***********************************以下配置为DBCP模式独享*********************************** -->
            <!-- ****************************************************************************************** -->
            <!--
            等同于SIMPLE模式下的Pool.TimeToWait
            <property name="Pool.MaximumWait" value="500"/>
            等同于SIMPLE模式下的Pool.PingQuery
            <property name="Pool.ValidationQuery" value="select 1 from t_user"/>
            当数据库连接被废弃时，是否打印日志
            <property name="Pool.LogAbandoned" value="true"/>
            数据库连接被废弃的最大超时时间
            <property name="Pool.RemoveAbandonedTimeout" value="150"/>
            当连接空闲时间超过RemoveAbandonedTimeout时，是否将其废弃
            <property name="Pool.RemoveAbandoned" value="true"/>
            -->
        </dataSource>
    </transactionManager>

    <!--
    JNDI由于大部分配置是在应用服务器中进行，因此ibatis中的配置相对简单
    使用JDBC事务管理的JNDI DataSource配置
    <transactionManager type="JDBC">
        <dataSource type="JNDI">
            <property name="DataSource" value="java:comp/env/jdbc/myDataSource"/>
        </dataSource>
    </transactionManager>
    使用JTA事务管理的JNDI DataSource配置
    <transactionManager type="JTA">
        <property name="UserTransaction" value="java:/ctx/con/UserTransaction"/>
        <dataSource type="JNDI">
            <property name="DataSource" value="java:comp/env/jdbc/myDataSource"/>
        </dataSource>
    </transactionManager>
    -->

    <!-- 指定了映射文件的位置，配置中允许出现多个sqlMap节点，以指定工程中的所有映射文件 -->
    <sqlMap resource="com/jadyer/model/User.xml" />
</sqlMapConfig>
```

下面是用到的实体类`User.java`

```java
package com.jadyer.model;
import java.util.Date;

public class User {
    private Integer id;
    private String name;
    private Date birth;

    /* 三个属性的setter和getter略 */

    public User(){}

    public User(String name, Date birth){
        this.name = name;
        this.birth = birth;
    }

    public User(Integer id, String name, Date birth){
        this.id = id;
        this.name = name;
        this.birth = birth;
    }

    @Override
    public String toString() {
        return "id=" + id + "/tname=" + name + "/tbirth=" + birth;
    }
}
```

下面是与实体类位于同一包下的映射文件`User.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE sqlMap PUBLIC "-//ibatis.apache.org//DTD SQL Map 2.0//EN" "http://ibatis.apache.org/dtd/sql-map-2.dtd">
<sqlMap namespace="User">
    <!-- 这样在本配置文件的其他部分，需要引用"com.jadyer.model.User"类时，只需以其别名替代即可 -->
    <typeAlias alias="user" type="com.jadyer.model.User"/>

    <!--
    Statement配置
    它包含了数个与SQLStatement相关的节点：statement、insert、delete、update、select、procedure
    其中<statement>最为通用，它可以替代其余的所有节点。除<statement>之外的节点各自对应SQL中的同名操作
    -->
    <insert id="save" parameterClass="user">
        insert into T_USER(id, name, birth) values(#id#, #name#, #birth#)
    </insert>
    <insert id="saveBySequence" parameterClass="user">
        <selectKey resultClass="int" keyProperty="id">
            select SEQUENCE_T_USER.nextVal as id from dual
        </selectKey>
        insert into T_USER(id, name, birth) values(#id#, #name#, #birth#)
    </insert>

    <update id="update" parameterClass="user">
        update T_USER set name=#name#, birth=#birth# where id=#id#
    </update>

    <delete id="deleteById" parameterClass="Integer">
        delete from T_USER where id = #id#
    </delete>

    <select id="findById" parameterClass="int" resultClass="user">
        <![CDATA[
            select * from T_USER where id = #id#
        ]]>
    </select>
    <select id="findAll" resultClass="user">
        select * from T_USER
    </select>
    <select id="findByName11" parameterClass="java.lang.String" resultClass="user">
        select * from T_USER where name like '$name$'
    </select>
    <select id="findByName22" parameterClass="java.lang.String" resultClass="user">
        select * from T_USER where name like '%$name$%'
    </select>
</sqlMap>
```

下面是配置日志打印的`//src//log4j.properties`

```sh
log4j.appender.stdout=org.apache.log4j.ConsoleAppender
log4j.appender.stdout.layout=org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern=%d %p [%c] - %m%n

log4j.logger.com.ibatis=debug
log4j.logger.com.ibatis.common.jdbc.SimpleDataSource=debug
log4j.logger.com.ibatis.common.jdbc.ScriptRunner=debug
log4j.logger.com.ibatis.sqlmap.engine.impl.SqlMapClientDelegate=debug
log4j.logger.java.sql.Connection=debug
log4j.logger.java.sql.Statement=debug
log4j.logger.java.sql.PreparedStatement=debug,stdout
```

下面是JUnit4.x的单元测试类`UserDaoIbatisTest.java`

```java
package com.jadyer.test;
import java.io.IOException;
import java.io.Reader;
import java.sql.Date;
import java.sql.SQLException;
import java.util.List;
import org.junit.BeforeClass;
import org.junit.Test;
import com.ibatis.common.resources.Resources;
import com.ibatis.sqlmap.client.SqlMapClient;
import com.ibatis.sqlmap.client.SqlMapClientBuilder;
import com.jadyer.model.User;

/**
 * 本程序用到了ibatis-2.3.4.726.jar和log4j-1.2.16.jar
 * Created by 玄玉<https://jadyer.github.io/> on 2011/04/05 23:26.
 */
public class UserDaoIbatisTest {
    //SqlMapClient是ibatis的核心组件，提供数据操作的基础平台
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
     * 添加用户，其ID是通过实体类自行设定的
     */
    @Test
    public void save() throws SQLException {
        User user = new User(22, "张起灵", Date.valueOf("2011-03-26"));
        sqlMapClient.insert("save", user);
    }

    /**
     * 添加用户，其ID是由序列生成的
     */
    @Test
    public void saveBySequence() throws SQLException {
        User user = new User("闷油瓶", Date.valueOf("1988-03-26"));
        sqlMapClient.insert("saveBySequence", user);
        System.out.println("id = " + user.getId());
    }

    /**
     * 更新用户信息
     * ibatis有一个自动化的事务提交机制，即根据当前的调用环境，自动判断操作是否需要自动提交
     * 若未显式调用SqlMapClient.startTransaction()，则ibatis会默认当前的数据库操作为AutoCommit=true
     * <p>
     *     这里的所谓"自动判定"，并不是指ibatis去检查当前是否已开启事务，从而判断当前数据库连接是否设定为自动提交
     *     实际上，在执行update语句时，sqlMapClient会检查当前的Session是否已经关联了某个数据库连接
     *     如果没有，则取一个数据库连接，将其AutoCommit属性设为true，然后执行update操作，执行完之后又释放这个连接
     *     即，下面的两次update实际上先后获取了两个数据库连接，即，下面的两次update并不是基于同一个JDBC Connection
     *     所以：对于多条SQL组合的一个JDBC事务操作而言，必须使用start、commit和endTransaction以实现整体事务的原子性
     * </p>
     */
    @Test
    public void update() throws SQLException {
        User user1 = new User(22, "陈文锦", Date.valueOf("1988-03-26"));
        sqlMapClient.update("update", user1);
        User user2 = new User(22, "霍玲", Date.valueOf("1988-03-12"));
        sqlMapClient.update("update", user2);
    }

    /**
     * 删除指定ID的用户资料
     */
    @Test
    public void deleteById() throws SQLException {
        sqlMapClient.delete("deleteById", 22);
    }

    /**
     * 查询指定ID的用户资料
     */
    @Test
    public void findById() throws SQLException {
        User user = (User)sqlMapClient.queryForObject("findById", 2);
        System.out.println(user);
    }

    /**
     * 查询所有的用户信息
     */
    @Test
    public void findAll() throws SQLException {
        List<User> list = sqlMapClient.queryForList("findAll");
        for(User user : list){
            System.out.println(user);
        }
    }

    /**
     * 根据提供的用户名，模糊查询用户信息
     */
    @Test
    public void findByName11() throws SQLException {
        List<User> list = sqlMapClient.queryForList("findByName11", "%寻%");
        for(User user : list){
            System.out.println(user);
        }
    }

    @Test
    public void findByName22() throws SQLException {
        List<User> list = sqlMapClient.queryForList("findByName22", "寻");
        for(User user : list){
            System.out.println(user);
        }
    }
}
```

最后是数据库脚本文件`t_user.sql`

```sql
-- Oracle 11g

-- Create table
create table t_user(
  id    number,
  name  varchar2(10),
  birth date
);

-- Create sequence
create sequence sequence_t_user increment by 1 start with 1 nomaxvalue nocycle;

-- Add data
insert into t_user values(sequence_t_user.nextval, '玄寻玉', to_date('2011-3-22', 'yyyy-mm-dd'));
insert into t_user values(sequence_t_user.nextval, '李寻欢', to_date('2011-3-23', 'yyyy-mm-dd'));
insert into t_user values(sequence_t_user.nextval, '易天寻', to_date('2011-3-24', 'yyyy-mm-dd'));
insert into t_user values(sequence_t_user.nextval, '寻无迹', to_date('2011-3-25', 'yyyy-mm-dd'));
```