---
layout: post
title: "单点登录CAS系列第06节之客户端配置单点登录"
categories: SSO
tags: sso cas
author: 玄玉
excerpt: 主要描述单点登录服务端为CAS-4.0.3，客户端配置单点登录的方法。
---

* content
{:toc}


## 原理

这里用的是：cas-client-core-3.4.0.jar（2015-07-21发布的）

下载地址为：[http://mvnrepository.com/artifact/org.jasig.cas.client/cas-client-core/3.4.0](http://mvnrepository.com/artifact/org.jasig.cas.client/cas-client-core/3.4.0)

下面介绍两种配置方法：一种是纯web.xml配置，一种是借助Spring来配置，相关的官方文档如下所示

[https://wiki.jasig.org/display/CASC/Configuring+the+Jasig+CAS+Client+for+Java+in+the+web.xml](https://wiki.jasig.org/display/CASC/Configuring+the+Jasig+CAS+Client+for+Java+in+the+web.xml)

[https://wiki.jasig.org/display/CASC/Configuring+the+JA-SIG+CAS+Client+for+Java+using+Spring](https://wiki.jasig.org/display/CASC/Configuring+the+JA-SIG+CAS+Client+for+Java+using+Spring)

#### 纯web.xml

web.xml中需配置四个顺序固定的Filter，而且出于认证考虑，最好配置在其他Filter之前，它们的先后顺序如下

1. AuthenticationFilter
2. TicketValidationFilter（或其它AbstractTicketValidationFilter实现，比如Cas20ProxyReceivingTicketValidationFilter）
3. HttpServletRequestWrapperFilter
4. AssertionThreadLocalFilter

下面分别介绍一下四个Filter的各自用途

* AuthenticationFilter

用来拦截请求，判断是否需要CASServer认证，需要则跳转到CASServer登录页，否则放行请求

有两个必须参数：一个是指定CASServer登录地址的casServerLoginUrl，一个是指定认证成功后跳转地址的serverName或service

service和serverName设置一个即可，二者都设置时service的优先级更高（即会以service为准）

service指的是一个确切的URL，而serverName是用来指定客户端的主机名的，格式为`{protocol}:{hostName}:{port}`

指定serverName时，该Filter会把它附加上当前请求的URI及对应的查询参数来构造一个确切的URL作为认证成功后的跳转地址

比如serverName="http://gg.cn"，当前请求的URI为"/oa"，查询参数为"aa=bb"，则认证成功后跳转地址为http://gg.cn/oa?aa=bb

简单来讲：`casServerLoginUrl--去哪登录`，`serverName--我是谁`

* TicketValidationFilter

请求通过AuthenticationFilter认证后，若请求中携带了ticket参数，则会由该类Filter对携带的ticket进行校验

验证ticket的时候，要访问CAS服务的`/serviceValidate`接口，使用的url就是`${casServerUrlPrefix}/serviceValidate`

所以它也有两个参数是必须指定的，casServerUrlPrefix（CASServer对应URL地址的前缀）和serverName或service

实际上，TicketValidationFilter只是对验证ticket的这一类Filter的统称，其并不对应CASClient中的具体类型

CASClient中有多种验证ticket的Filter，都继承自AbstractTicketValidationFilter

常见的有Cas10TicketValidationFilter**/**Cas20ProxyReceivingTicketValidationFilter**/**Saml11TicketValidationFilter

它们的验证逻辑都是一致的，都有AbstractTicketValidationFilter实现，只是使用的TicketValidator不一样而已

如果要从服务器获取用户名之外的更多信息应该采用CAS20这个2.0协议的代理

* HttpServletRequestWrapperFilter

用于封装每个请求的HttpServletRequest为其内部定义的CasHttpServletRequestWrapper

它会将保存在Session或request中的Assertion对象重写HttpServletRequest的getUserPrincipal()、getRemoteUser()、isUserInRole()

这样在我们的应用中就可以非常方便的从HttpServletRequest中获取到用户的相关信息

* AssertionThreadLocalFilter

为了方便用户在应用的其它地方获取Assertion对象，其会将当前的Assertion对象存放到当前的线程变量中

以后用户在程序的任何地方都可以从线程变量中获取当前的Assertion，而无需从Session或request中解析

该线程变量是由AssertionHolder持有的，可以通过`Assertion assertion = AssertionHolder.getAssertion()`获取当前Assertion

#### 借助Spring

与上述web.xml配置四个Filter方式不同的是，可以使用Spring的四个DelegatingFilterProxy来代理需要配置的四个Filter

此时这四个Filter就应该配置为Spring的Bean对象，并且web.xml中的<filter-name>就应该对应SpringBean名称

但是SingleSignOutFilter**/**HttpServletRequestWrapperFilter**/**AssertionThreadLocalFilter等Filter不含配置参数

所以实际上只需要配置AuthenticationFilter和Cas20ProxyReceivingTicketValidationFilter两个Filter交由Spring代理就可以了

#### 注意

* CAS1.0提供的接口有/validate，CAS2.0提供的接口有/serviceValidate、/proxyValidate、/proxy

* 四个Filter太多了，有时间的话考虑参考org.springframework.web.filter.CompositeFilter写一个Filter来实现

* web.xml的好处是可以配置匿名访问的资源，配置参数参考AuthenticationFilter中的ignoreUrlPatternMatcherStrategyClass

　　　起码cas-client-core-3.4.0.jar中的Spring配置还不支持ignorePattern（该参数默认正则验证，此外还有contains和equals验证）

* javax.net.ssl.SSLHandshakeException: java.security.cert.CertificateException: No name matching casserver found

　　　这是由于创建证书的域名和应用中配置的CAS服务域名不一致（也就是说客户端导入的CRT证书与CAS服务端的域名不同）

## 代码

本文源码下载：（下面两个地址的文件的内容，都是一样的）

[http://oirr30q6q.bkt.clouddn.com/jadyer/code/sso-cas-client-login.rar](http://oirr30q6q.bkt.clouddn.com/jadyer/code/sso-cas-client-login.rar)

[http://download.csdn.net/detail/jadyer/8934207](http://download.csdn.net/detail/jadyer/8934207)

下面是`web.xml`的配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="2.5" xmlns="http://java.sun.com/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd">
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:applicationContext.xml</param-value>
    </context-param>
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <servlet>
        <servlet-name>SpringMVC</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:applicationContext.xml</param-value>
        </init-param>
    </servlet>
    <servlet-mapping>
        <servlet-name>SpringMVC</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>

    <filter>
        <filter-name>CharacterEncodingFilter</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
        <init-param>
            <param-name>encoding</param-name>
            <param-value>UTF-8</param-value>
        </init-param>
        <init-param>
            <param-name>forceEncoding</param-name>
            <param-value>true</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>CharacterEncodingFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

    <!-- SSO -->
    <filter>
        <filter-name>casAuthenticationFilter</filter-name>
        <filter-class>org.springframework.web.filter.DelegatingFilterProxy</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>casAuthenticationFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
    <filter>
        <filter-name>casTicketValidationFilter</filter-name>
        <filter-class>org.springframework.web.filter.DelegatingFilterProxy</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>casTicketValidationFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
    <!--
    <context-param>
        <param-name>serverName</param-name>
        <param-value>http://boss.jadyer.com:8080</param-value>
    </context-param>
    <filter>
        <filter-name>casAuthenticationFilter</filter-name>
        <filter-class>org.jasig.cas.client.authentication.AuthenticationFilter</filter-class>
        <init-param>
            <param-name>casServerLoginUrl</param-name>
            <param-value>http://sso.jadyer.com:8080/cas-server-web/login</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>casAuthenticationFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
    <filter>
        <filter-name>casTicketValidationFilter</filter-name>
        <filter-class>org.jasig.cas.client.validation.Cas20ProxyReceivingTicketValidationFilter</filter-class>
        <init-param>
            <param-name>casServerUrlPrefix</param-name>
            <param-value>http://sso.jadyer.com:8080/cas-server-web</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>casTicketValidationFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
     -->
    <filter>
        <filter-name>casHttpServletRequestWrapperFilter</filter-name>
        <filter-class>org.jasig.cas.client.util.HttpServletRequestWrapperFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>casHttpServletRequestWrapperFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
    <filter>
        <filter-name>casAssertionThreadLocalFilter</filter-name>
        <filter-class>org.jasig.cas.client.util.AssertionThreadLocalFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>casAssertionThreadLocalFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
</web-app>
```

下面是`/src/applicationContext.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:mvc="http://www.springframework.org/schema/mvc" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.2.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc-3.2.xsd">
    <bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
        <property name="systemPropertiesModeName" value="SYSTEM_PROPERTIES_MODE_OVERRIDE"/>
        <property name="ignoreResourceNotFound" value="false"/>
        <property name="locations">
            <list>
                <value>classpath:config.properties</value>
            </list>
        </property>
    </bean>
    <mvc:resources mapping="/index.jsp" location="/index.jsp"/>

    <!-- cas -->
    <bean name="casAuthenticationFilter" class="org.jasig.cas.client.authentication.AuthenticationFilter">
        <property name="serverName" value="${casClientServerName}"/>
        <property name="casServerLoginUrl" value="${casServerLoginUrl}"/>
    </bean>
    <bean name="casTicketValidationFilter" class="org.jasig.cas.client.validation.Cas20ProxyReceivingTicketValidationFilter">
        <property name="serverName" value="${casClientServerName}"/>
        <property name="ticketValidator">
            <bean class="org.jasig.cas.client.validation.Cas20ServiceTicketValidator">
                <constructor-arg index="0" value="${casServerUrlPrefix}"/>
            </bean>
        </property>
    </bean>
</beans>
```

下面是`/src/config.properties`

```ruby
#<<Central Authentication Service>>
#where to login
casServerLoginUrl=http://sso.jadyer.com:8080/cas-server-web/login
#login server root
casServerUrlPrefix=http://sso.jadyer.com:8080/cas-server-web
#who am i
#casClientServerName=http://boss.jadyer.com:8180
casClientServerName=http://risk.jadyer.com:8280
```

最后是`/WebRoot/index.jsp`

```java
<%@ page pageEncoding="UTF-8"%>
<%@ page import="java.util.Map"%>
<%@ page import="java.net.URLDecoder"%>
<%@ page import="org.jasig.cas.client.util.AssertionHolder"%>
<%@ page import="org.jasig.cas.client.authentication.AttributePrincipal"%>

<body style="background-color:#CBE0C9;">
    <span style="color:red; font-size:32px; font-weight:bold;">客户端登录成功</span>
</body>

<hr size="2">

<%
    AttributePrincipal principal = (AttributePrincipal)request.getUserPrincipal();
    Map<String, Object> attributes = principal.getAttributes();
    out.print("principal.getName()=" + principal.getName() + "<br/>");
    out.print("request.getRemoteUser()=" + request.getRemoteUser() + "<br/>");
    out.print("登录用户：" + attributes.get("userId") + "<br/>");
    out.print("登录时间：" + AssertionHolder.getAssertion().getAuthenticationDate() + "<br/>");
    out.print("-----------------------------------------------------------------------<br/>");
    for(Map.Entry<String, Object> entry : attributes.entrySet()){
        //服务端返回中文时需要encode，客户端接收显示中文时需要decode，否则会乱码
        out.print(entry.getKey() + "=" + URLDecoder.decode(entry.getValue().toString(), "UTF-8") + "<br/>");
    }
    out.print("-----------------------------------------------------------------------<br/>");
    Map<String, Object> attributes22 = AssertionHolder.getAssertion().getAttributes();
    for(Map.Entry<String, Object> entry : attributes22.entrySet()){
        out.print(entry.getKey() + "=" + entry.getValue() + "<br/>");
    }
    out.print("-----------------------------------------------------------------------<br/>");
    Map<String, Object> attributes33 = AssertionHolder.getAssertion().getPrincipal().getAttributes();
    for(Map.Entry<String, Object> entry : attributes33.entrySet()){
        out.print(entry.getKey() + "=" + entry.getValue() + "<br/>");
    }
%>
```

## 测试

接下来就可以测试了，测试之前先修改几处配置，模拟单点环境

首先在`C:\Windows\System32\drivers\etc\hosts`中添加以下三个配置

```
127.0.0.1 sso.jadyer.com
127.0.0.1 boss.jadyer.com
127.0.0.1 risk.jadyer.com
```

然后拷贝三个Tomcat，分别用作sso服务器和两个sso客户端

修改两个sso客户端的`\Tomcat\conf\server.xml`的以下三个端口，保证启动监听端口不重复

```xml
<Server port="8105" shutdown="SHUTDOWN">
<Connector port="8180" protocol="HTTP/1.1"......>
<Connector port="8109" protocol="AJP/1.3" redirectPort="8443"/>
<Server port="8205" shutdown="SHUTDOWN">
<Connector port="8280" protocol="HTTP/1.1"......>
<Connector port="8209" protocol="AJP/1.3" redirectPort="8443"/>
```

最后修改两个sso客户端`\Tomcat\webapps\cas-client\WEB-INF\classes\config.properties`里面的`casClientServerName`的值

```ruby
casClientServerName=http://boss.jadyer.com:8180
casClientServerName=http://risk.jadyer.com:8280
```

下面开始测试

先访问[http://boss.jadyer.com:8180/cas-client](http://boss.jadyer.com:8180/cas-client)，发现没登录会自动跳转到单点登录页

![](/img/2015/2015-07-26-sso-cas-client-login-01.png)

输入密码后登录成功

![](/img/2015/2015-07-26-sso-cas-client-login-02.png)

再访问[http://risk.jadyer.com:8280/cas-client](http://risk.jadyer.com:8280/cas-client)，会发现自动登录成功，不用再登录了

![](/img/2015/2015-07-26-sso-cas-client-login-03.png)