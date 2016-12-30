---
layout: post
title: "Tomcat配置集锦"
categories: Tomcat
tags: tomcat
author: 玄玉
excerpt: 列举了几个常用的Tomcat配置。
---

* content
{:toc}


# 配置端口

修改 /apache-tomcat-6.0.20/conf/server.xml 文件第67行，改为如下内容

```xml
<Connector port="8088" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" URIEncoding="UTF-8"/>
```

# 新增管理员

修改 /apache-tomcat-6.0.20/conf/tomcat-users.xml 文件第18行的 `<tomcat-users>`

```xml
<tomcat-users>
    <role rolename="admin"/>
    <role rolename="manager"/>
    <user username="jadyer" password="22" roles="admin,manager"/>
</tomcat-users>
```

# 显示列表页面

当我们未设置 JavaWeb 项目的欢迎文件或者欢迎文件不存在时，访问 Web 应用后以列表的形式显示可用页面

修改 /apache-tomcat-6.0.20/conf/web.xml 文件第99行的 listings 参数的值，由默认的 false 修改为 true 即可

```xml
<servlet>
    <servlet-name>default</servlet-name>
    <servlet-class>org.apache.catalina.servlets.DefaultServlet</servlet-class>
    <init-param>
        <param-name>debug</param-name>
        <param-value>0</param-value>
    </init-param>
    <init-param>
        <param-name>listings</param-name>
        <param-value>true</param-value>
    </init-param>
    <load-on-startup>1</load-on-startup>
</servlet>
```

# 自动重载应用

修改 /apache-tomcat-6.0.20/conf/context.xml 文件第19行 `<Context>` 改为 `<Context reloadable="true">`

目的是：当应用中的文件被修改后，Tomcat 服务器会自动重新加载当前的 JavaWeb 应用，避免重新启动 Tomcat

这个修改会对 Tomcat 的运行性能有影响

如果把 Tomcat 作为产品阶段所使用的服务器，最好将其修改成 `<Context reloadable="false">`

# 项目映射本地

修改 /apache-tomcat-6.0.20/conf/server.xml 文件第142行的 `<Host>`，在里面新增如下内容

```xml
<Context path="/test" docBase="F:/Workspace/test/WebRoot" reloadable="true"/>
```

然后在浏览器中直接访问 [http://127.0.0.1:8088/test](http://127.0.0.1:8088/test) 即可

但此时 /test/WebRoot/WEB-INF/lib 中需存在相应的 jar，否则可能会报告错误（因为这里是映射的路径）

# 配置内置连接池

Tomcat 中使用的默认的连接池技术是 DBCP

具体的配置是：修改 /apache-tomcat-6.0.20/conf/context.xml 文件第34行，新增以下内容

```xml
<!--
name-------------数据源对象的名字
auth-------------验证方式
type-------------资源的类型
initialSize------连接池的初始连接数，即Tomcat服务器启动后最初建立的连接数
maxActive--------连接池同一时间可分配的最大连接数，如果参数值是非正数，表示不作限制
maxIdle----------连接池中可以保留的最大空闲连接数，大于此数量的空闲连接会被释放，负数表示不作限制
minIdle----------连接池中可以保留的最小空闲连接数，如果小于此数量，更多的空闲连接会被创建，0表示不创建
maxWait----------连接池中连接的最大超时时间，单位：毫秒
driverClassName--数据库驱动的类
username---------建立连接池连接的数据库的用户名
password---------建立连接池连接的数据库的密码
url--------------创建数据库连接所需要的URL的参数值
-->
<Resource name="jdbc/oracleds"
    auth="Container"
    type="javax.sql.DataSource"
    maxActive="100"
    maxIdle="30"
    maxWait="10000"
    driverClassName="oracle.jdbc.OracleDriver"
    username="scott"
    password="oracle"
    url="jdbc:oracle:thin:@127.0.0.1:1521:jadyer"/>
<Resource name="jdbc/mysqlds"
    auth="Container"
    type="javax.sql.DataSource"
    maxActive="100"
    maxIdle="30"
    maxWait="10000"
    driverClassName="com.mysql.jdbc.Driver"
    username="root"
    password="root"
    url="jdbc:mysql://127.0.0.1:3306/jadyer?characterEncoding=UTF-8"/>
<Resource name="jdbc/sqlserver2000ds"
    auth="Container"
    type="javax.sql.DataSource"
    maxAtcive="100"
    maxIdle="30"
    maxWait="10000"
    driverClassName="com.microsoft.jdbc.sqlserver.SQLServerDriver"
    sername="sa"
    password="sa"
    url="jdbc:microsoft:sqlserver://127.0.0.1:1433;DatabaseName=jadyer"/>
```

修改完 context.xml 之后，还需把 Oracle 和 MySQL 的驱动类库复制到 /apache-tomcat-6.0.20/lib/ 目录中

同时为了简化通过连接池获取数据库连接的过程，`JDBC2.0` 规范中引进了 JDBC 数据源的概念

javax.sql.DataSource 对象是 java.sql.Connection 对象的工厂，也可以认为是数据库连接池的管理员

我们的程序要通过 Tomcat 获得数据库的连接，那么先要获取 DataSource 对象，然后通过 DataSource 获取连接池的连接

示例代码如下

```java
//javax.naming.Context是JNDI的上下文对象，作用上有些像我们所说的当前目录
Context context = new InitialContext();
//调用context对象的lookup()，就可以根据指定的JDNI的名字获得一个数据源对象
//其中"java:/comp/env/"是必须有的内容，而"jdbc/oracleds"是我们在context.xml文件所设置的参数name的值
DataSource ds = (DataSource)context.lookup("java:/comp/env/jdbc/oracleds");
//然后通过DataSource对象ds的getConnection()方法就可以获得数据库的连接对象conn
Connection conn = ds.getConnection();
//这种方式获取的Connection对象在使用完后，必须在程序中显式调用该对象的close()方法，释放资源
//即将当前的Connection对象再返回到连接池中，而并不是真正的关闭其相应的到数据库的连接
```

# 配置运行环境变量

先说一下配置Tomcat启动参数的方法

通常在 catalina.sh 第97行增加如下参数配置（也就是`# OS specific support.  $var _must_ be set to either true or false.`的上一行）

```ruby
JAVA_OPTS="-server -Xms512M -Xmx1024M -Xmn192M -XX:NewSize=64m -XX:MaxNewSize=512m -XX:PermSize=512m -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC"
```

而配置运行的环境变量，就是要在 JAVA_OPTS 上面做文章

Tomcat 启动时会通过 catalina.sh 来读取当前目录下的 setenv.sh

所以，我们就可以在 setenv.sh 中配置一些参数，使得应用可以在 **开发／测试／集成／线上** 等环境加载不同的配置文件

做法就是：直接在 /apache-tomcat-6.0.20/bin/ 目录中新建 setenv.sh 文件，内容如下

```ruby
JAVA_OPTS="$JAVA_OPTS -Dappenv.active=dev"
```

然后就可以在 Spring 配置文件或者我们自己写的工具类中，读取这个环境变量，实现不同环境加载不同配置文件的目的

下面简单分别列举一下配置方式

这是 Spring 配置文件的写法

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd">
    <bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
        <property name="systemPropertiesModeName" value="SYSTEM_PROPERTIES_MODE_OVERRIDE"/>
        <property name="ignoreResourceNotFound" value="false"/>
        <property name="locations">
            <list>
                <!-- 自动读取Tomcat启动时配置的环境变量参数 -->
                <value>classpath:config-${appenv.active}.properties</value>
                <value>file:/app/wzf/password/ElecChnlPayCusPassword.properties</value>
            </list>
        </property>
    </bean>
    <bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">
        <!-- 这里的两个值就是配置在properties文件中的键 -->
        <property name="username" value="${jdbc.username}"/>
        <property name="password" value="${jdbc.password}"/>
    </bean>
</beans>
```

这是工具类的写法

```java
package com.jadyer.demo.util;
import java.io.IOException;
import java.util.Properties;

public enum ConfigUtil {
	INSTANCE;

	private Properties config;

	ConfigUtil(){
		config = new Properties();
		try {
			config.load(ConfigUtil.class.getResourceAsStream("/config-"+System.getProperty("appenv.active")+".properties"));
		} catch (IOException e) {
			throw new ExceptionInInitializerError("加载系统配置文件失败...");
		}
	}

	public String getProperty(String key){
		return config.getProperty(key);
	}

	public int getPropertyForInt(String key){
		return Integer.parseInt(config.getProperty(key));
	}
}
```