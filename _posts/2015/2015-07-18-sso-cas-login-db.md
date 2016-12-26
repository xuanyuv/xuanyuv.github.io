---
layout: post
title: "单点登录CAS系列第04节之服务端通过数据库认证用户"
categories: SSO
tags: sso cas
author: 玄玉
excerpt: 主要描述单点登录CAS-4.0.3服务端通过数据库实现用户认证的功能。
---

* content
{:toc}


## 原理

实现方式有两种

一是自己写数据库获取用户名密码再认证的类

一是借助`CAS-4.0.3`自带的JDBC支持来实现认证

#### 自己写认证类（推荐）

1、`CSA-4.0.3`的默认登录用户密码配置在`deployerConfigContext.xml`，所以就到deployerConfigContext.xml里面找

　　可以找到`<bean id="primaryAuthenticationHandler" class="org.jasig...AcceptUsersAuthenticationHandler">`

　　我们在AcceptUsersAuthenticationHandler.java中发现CAS是把配置的用户密码读取到全局`Map<String, String>`中的

2、而AcceptUsersAuthenticationHandler.java是通过继承AbstractUsernamePasswordAuthenticationHandler.java才实现的认证

　　所以创建com.jadyer.sso.authentication.UserAuthenticationHandler extends AbstractUsernamePasswordAuthenticationHandler

　　再重写authenticateUsernamePasswordInternal()方法，在里面获取到前台页面输入的用户密码，再到数据库中校验就行了

3、接下来创建`\WEB-INF\spring-configuration\applicationContext-datasource.xml`

　　它会在启动时被自动加载（web.xml中设定的）

　　然后在里面配置数据库连接池，连接池的用户名密码等可以配置在`\WEB-INF\cas.properties`

　　同时增加`<context:component-scan base-package="com.jadyer.sso"/>`，使得可以在自定义类中应用Spring注解

4、新建一个UserDaoJdbc.java类，通过它利用SpringJDBCTemplate访问数据库

　　因为要连接数据库，所以还要把druid-1.0.14.jar以及mysql-connector-java-5.1.35.jar加入到lib目录中

5、最后记得`deployerConfigContext.xml`里面把这段Bean配置给注释掉`<bean id="primaryAuthenticationHandler">`

　　并在自定义的`UserAuthenticationHandler.java`中使用`@Component(value="primaryAuthenticationHandler")`声明其为Bean

　　注意其名字应该是primaryAuthenticationHandler，因为deployerConfigContext.xml的其它配置引用了primaryAuthenticationHandler

　　否则你还要找到引用了primaryAuthenticationHandler的位置修改为新的Bean

#### cas-server-support-jdbc

1、这一种方式就简单一些了，先引入c3p0-0.9.1.2.jar以及cas-server-support-jdbc-4.0.3.jar

2、修改deployerConfigContext.xml，注释掉<bean id="primaryAuthenticationHandler">

　　并增加<bean id="dataSource"><bean id="passwordEncoder"><bean id="mssoUsersAuthenticationHandler">（下方会贴出具体代码）

　　同样这里也是从cas.properties读取的数据库连接用户密码

3、由于在认证过程中是通过<bean id="authenticationManager">引用了<bean id="primaryAuthenticationHandler">来实现的

　　所以修改这里的primaryAuthenticationHandler为我们新建的mssoUsersAuthenticationHandler

4、通过查看org.jasig.cas.adaptors.jdbc.QueryDatabaseAuthenticationHandler源码会发现

　　这与上面自己写认证类的方式，原理一样，都是直接或间接的扩展AbstractUsernamePasswordAuthenticationHandler

## 代码

本文源码下载：（下面两个地址的文件的内容，都是一样的）

[http://oirr30q6q.bkt.clouddn.com/jadyer/code/sso-cas-login-db.rar](http://oirr30q6q.bkt.clouddn.com/jadyer/code/sso-cas-login-db.rar)

[http://download.csdn.net/detail/jadyer/8911139](http://download.csdn.net/detail/jadyer/8911139)

下面是新创建的`\WEB-INF\spring-configuration\applicationContext-datasource.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tx="http://www.springframework.org/schema/tx" xmlns:context="http://www.springframework.org/schema/context" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.2.xsd http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-3.2.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-3.2.xsd">
    <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource" init-method="init" destroy-method="close">
        <property name="url" value="${jdbc.url}"/>
        <property name="username" value="${jdbc.username}"/>
        <property name="password" value="${jdbc.password}"/>
        <!-- 配置初始化大小、最小、最大 -->
        <property name="initialSize" value="1"/>
        <property name="minIdle" value="1"/>
        <property name="maxActive" value="20"/>
        <!-- 配置获取连接等待超时的时间 -->
        <property name="maxWait" value="60000"/>
        <!-- 配置间隔多久才进行一次检测,检测需要关闭的空闲连接,单位是毫秒 -->
        <property name="timeBetweenEvictionRunsMillis" value="60000"/>
        <!-- 配置一个连接在池中最小生存的时间,单位是毫秒 -->
        <property name="minEvictableIdleTimeMillis" value="300000"/>
        <property name="validationQuery" value="SELECT 'x'"/>
        <property name="testWhileIdle" value="true"/>
        <property name="testOnBorrow" value="false"/>
        <property name="testOnReturn" value="false"/>
        <!-- 打开PSCache,并且指定每个连接上PSCache的大小 -->
        <!-- PSCache(preparedStatement)对支持游标的数据库性能提升巨大,比如说Oracle/DB2/SQL Server,在mysql下建议关闭 -->
        <property name="poolPreparedStatements" value="false"/>
        <property name="maxPoolPreparedStatementPerConnectionSize" value="-1"/>
        <!-- 配置监控统计拦截的filters -->
        <property name="filters" value="wall,mergeStat"/>
    </bean>
    <bean id="txManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>
    <tx:annotation-driven transaction-manager="txManager"/>

    <context:component-scan base-package="com.jadyer.sso"/>
</beans>
```

下面是`cas.properties`中新添加的数据库元信息的配置

```ruby
#<<数据库元信息>>
jdbc.url=jdbc:mysql://192.168.2.41:3306/turtle?useUnicode=true&characterEncoding=UTF8&zeroDateTimeBehavior=convertToNull&autoReconnect=true&failOverReadOnly=false
jdbc.username=turtle
jdbc.password=turtle
```

下面是自定义的`UserDaoJdbc.java`

```java
package com.jadyer.sso.authentication;
import javax.annotation.Resource;
import javax.sql.DataSource;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserDaoJdbc {
    private static final String SQL_VERIFY_ACCOUNT = "SELECT COUNT(*) FROM permission_operator WHERE operator_login=? AND operator_pwd=SHA1(?)";
    private JdbcTemplate jdbcTemplate;
    @Resource
    public void setDataSource(DataSource dataSource){
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }
    public boolean verifyAccount(String username, String password){
        try{
            //验证用户名和密码是否正确
            return 1==this.jdbcTemplate.queryForObject(SQL_VERIFY_ACCOUNT, new Object[]{username, password}, Integer.class);
        }catch(EmptyResultDataAccessException e){
            return false;
        }
    }
}
```

下面是自定义的用户登录认证类`UserAuthenticationHandler.java`

```java
package com.jadyer.sso.authentication;
import java.security.GeneralSecurityException;
import javax.annotation.Resource;
import javax.security.auth.login.FailedLoginException;
import org.jasig.cas.authentication.HandlerResult;
import org.jasig.cas.authentication.PreventedException;
import org.jasig.cas.authentication.UsernamePasswordCredential;
import org.jasig.cas.authentication.handler.support.AbstractUsernamePasswordAuthenticationHandler;
import org.jasig.cas.authentication.principal.SimplePrincipal;
import org.springframework.stereotype.Component;

/**
 * 自定义的用户登录认证类
 * Created by 玄玉<https://jadyer.github.io/> on 2015/07/17 15:48.
 */
@Component(value="primaryAuthenticationHandler")
public class UserAuthenticationHandler extends AbstractUsernamePasswordAuthenticationHandler {
    @Resource
    private UserDaoJdbc userDaoJdbc;
    @Override
    protected HandlerResult authenticateUsernamePasswordInternal(UsernamePasswordCredential transformedCredential) throws GeneralSecurityException, PreventedException {
        //UsernamePasswordCredential参数包含了前台页面输入的用户信息
        String username = transformedCredential.getUsername();
        String password = transformedCredential.getPassword();
        //认证用户名和密码是否正确
        if(userDaoJdbc.verifyAccount(username, password)){
            return createHandlerResult(transformedCredential, new SimplePrincipal(username), null);
        }
        throw new FailedLoginException();
    }
}
```

最后是`deployerConfigContext.xml`中的改动部分

```xml
<!-- 下面是采用cas-server-support-jdbc-4.0.3.jar实现数据库认证的Bean配置 -->
<!--
配置数据源、声明密码加密方式、指定用户名密码的认证器
<bean id="dataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource" p:driverClass="com.mysql.jdbc.Driver"
        p:jdbcUrl="${jdbc.url}" p:user="${jdbc.username}" p:password="${jdbc.password}"/>
<bean id="passwordEncoder" class="org.jasig.cas.authentication.handler.DefaultPasswordEncoder"
        c:encodingAlgorithm="SHA1" p:characterEncoding="UTF-8"/>
<bean id="mssoUsersAuthenticationHandler" class="org.jasig.cas.adaptors.jdbc.QueryDatabaseAuthenticationHandler"
        p:dataSource-ref="dataSource" p:passwordEncoder-ref="passwordEncoder"
        p:sql="SELECT operator_pwd FROM permission_operator WHERE operator_login=?"/>
 -->

<bean id="authenticationManager" class="org.jasig.cas.authentication.PolicyBasedAuthenticationManager">
    <constructor-arg>
        <map>
            <entry key-ref="proxyAuthenticationHandler" value-ref="proxyPrincipalResolver" />
            <entry key-ref="primaryAuthenticationHandler" value-ref="primaryPrincipalResolver" />
            <!-- 下面是采用cas-server-support-jdbc-4.0.3.jar实现数据库认证的Bean声明 -->
            <!--
            <entry key-ref="mssoUsersAuthenticationHandler" value-ref="primaryPrincipalResolver" />
             -->
        </map>
    </constructor-arg>
    <property name="authenticationPolicy">
        <bean class="org.jasig.cas.authentication.AnyAuthenticationPolicy" />
    </property>
</bean>

<!-- 取消默认的用户名和密码，改为我们自己从数据库查询的用户名和密码 -->
<!--
<bean id="primaryAuthenticationHandler" class="org.jasig.cas.authentication.AcceptUsersAuthenticationHandler">
    <property name="users">
        <map>
            <entry key="xuanyu" value="xuanyu"/>
        </map>
    </property>
</bean>
 -->
```