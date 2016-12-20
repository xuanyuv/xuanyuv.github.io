---
layout: post
title: "单点登录CAS系列第07节之客户端配置单点登出"
categories: SSO
tags: sso cas
author: 玄玉
excerpt: 主要描述单点登录服务端为CAS-4.0.3，客户端配置单点登出的方法，以及登出后自动跳转指定资源，和CASServer禁用单点登出等。
---

* content
{:toc}


## 原理

> 本文内容包括配置单点登出、登出后自动跳转指定资源、CASServer禁用单点登出等

与单点登录相对应：登录的地址是`/login`，登出的地址是`/logout`，这里需要配置下面两个Filter

SingleSignOutFilter：用来使Session失效（要配置casServerUrlPrefix参数）

SingleSignOutHttpSessionListener：用于在Session过期时移除其对应的映射关系

* 登出后自动跳转指定资源

登出后默认会跳转到CASServer的登出页，若想跳转到其它资源，可在`/logout`的URL后面加上service=jumpurl

比如[http://sso.jadyer.com:8080/cas-server-web/logout?service=http://blog.csdn.net/jadyer](http://sso.jadyer.com:8080/cas-server-web/logout?service=http://blog.csdn.net/jadyer`)

但默认servcie跳转不会生效，需要CASServer配置**//WEB-INF//cas.properties**中的`cas.logout.followServiceRedirects=true`

另外为org.jasig.cas.client.session.SingleSignOutFilter增加service参数是没用的，因为登出后跳转到指定资源属于服务端行为

* 禁用单点登出

设置**//CASServer//WEB-INF//cas.properties**中的`slo.callbacks.disabled=true`

测试时点击登出后虽然页面跳转到了默认登出页，但再次访问CASClient资源发现并没有登出，即单点登出禁用成功

* 测试单点登出

测试时先登出，然后在浏览器新标签页访问CASClient资源，发现会被自动重定向到单点登录页

或登出后，再点浏览器后退按钮，发现会后退到之前的资源页，但在这个页面点击任何请求，都会自动重定向到单点登录页

## 代码

下面是客户端的`web.xml`

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
    <listener>
        <listener-class>org.jasig.cas.client.session.SingleSignOutHttpSessionListener</listener-class>
    </listener>
    <filter>
        <filter-name>casSingleSignOutFilter</filter-name>
        <filter-class>org.springframework.web.filter.DelegatingFilterProxy</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>casSingleSignOutFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
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

下面是客户端的`/src/applicationContext.xml`

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
    <bean name="casSingleSignOutFilter" class="org.jasig.cas.client.session.SingleSignOutFilter">
        <property name="casServerUrlPrefix" value="${casServerUrlPrefix}"/>
    </bean>
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
#where to logout
casServerLogoutUrl=http://sso.jadyer.com:8080/cas-server-web/logout
#where to login
casServerLoginUrl=http://sso.jadyer.com:8080/cas-server-web/login
#login server root
casServerUrlPrefix=http://sso.jadyer.com:8080/cas-server-web
#who am i
casClientServerName=http://boss.jadyer.com:8080
```

下面是`/WebRoot/index.jsp`


```java
<%@ page pageEncoding="UTF-8"%>
<%@ page import="java.util.Map"%>
<%@ page import="java.net.URLDecoder"%>
<%@ page import="com.jadyer.util.ConfigUtil"%>
<%@ page import="org.jasig.cas.client.util.AssertionHolder"%>
<%@ page import="org.jasig.cas.client.authentication.AttributePrincipal"%>

<script>
function ssoLogout(){
    if(confirm('确定要退出系统吗？')){
        //top.location.href ='http://sso.jadyer.com:8080/cas-server-web/logout?service=http://blog.csdn.net/jadyer';
        //top.location.href ='http://sso.jadyer.com:8080/cas-server-web/logout?service=http://sso.jadyer.com:8080/cas-server-web/login';
        top.location.href ='<%=ConfigUtil.INSTANCE.getProperty("casServerLogoutUrl")%>';
    }
}
</script>

<body style="background-color:#CBE0C9;">
    <span style="color:red; font-size:32px; font-weight:bold;">客户端登录成功</span>
    <br>
    <br>
    <a href="javascript:ssoLogout();">我要登出</a>
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

最后是读取配置文件的工具类`ConfigUtil.java`

```java
package com.jadyer.util;
import java.io.IOException;
import java.util.Properties;
import java.util.regex.Pattern;

/**
 * 配置文件读取工具类
 * --------------------------------------------------------------------------------------------------------------------
 * 用法为ConfigUtil.INSTANCE.getProperty("KJJF.databaseURL")
 * 采用枚举的方式，也是Effective Java作者Josh Bloch提倡的方式，它不仅能避免多线程同步问题，而且还能防止反序列化重新创建新的对象
 * --------------------------------------------------------------------------------------------------------------------
 * @version v2.1
 * @history v2.1-->增加<code>getPropertyBySysKey()</code>方法,用于获取配置文件的键值中含系统属性时的值,详见该方法注释
 * @history v2.0-->采用枚举的方式实现单例
 * @history v1.0-->通过内部类实现单例
 * Created by 玄玉<https://jadyer.github.io/> on 2012/06/07 17:30.
 */
public enum ConfigUtil {
    INSTANCE;
    private Properties config;
    private ConfigUtil(){
        config = new Properties();
        try {
            config.load(ConfigUtil.class.getResourceAsStream("/config.properties"));
            System.out.println("Load /config.properties SUCCESS...");
        } catch (IOException e) {
            System.out.println("Load /config.properties Error...");
            e.printStackTrace();
            throw new ExceptionInInitializerError("加载系统配置文件失败...");
        }
    }

    public String getProperty(String key){
        return config.getProperty(key);
    }

    public int getPropertyForInt(String key){
        return Integer.parseInt(config.getProperty(key));
    }

    /**
     * 配置文件的键值中含系统属性时的获取方式
     * -------------------------------------------------------------------------
     * 若配置文件的某个键值含类似于${user.dir}的写法，如log=${user.dir}/app.log
     * 则可以通过该方法使用系统属性中user.dir的值，替换掉配置文件键值中的${user.dir}
     * -------------------------------------------------------------------------
     * Created by 玄玉<https://jadyer.github.io/> on 2015/02/02 17:22.
     */
    public String getPropertyBySysKey(String key){
        String value = config.getProperty(key);
        if(null!=value && Pattern.compile("\\$\\{\\w+(\\.\\w+)*\\}").matcher(value).find()){
            String sysKey = value.substring(value.indexOf("${")+2, value.indexOf("}"));
            value = value.replace("${"+sysKey+"}", System.getProperty(sysKey));
        }
        return value;
    }
}
```