---
layout: post
title: "JSF实现用户登录小例子"
categories: JSF
tags: jsf demo myfaces asp.net 事件绑定
author: 玄玉
excerpt: 介绍JSF实现用户登录功能的入门示例代码。
---

* content
{:toc}


## 简介

平常我们用的Struts2是基于标准的HTTP请求响应的模式，而`JavaServerFaces`是基于事件的一种编程模型

它是2004年SUN推出的基于MVC的规范，JSF页面表单的每个输入域都绑定到后台`backingbean`对应属性

它也属于JSP、Servlet层次，所以使用Tomcat即可运行，无需借助类似于WebLogic之类的应用服务器

较有名的实现是[Apache出品的MyFaces](http://myfaces.apache.org)，它提供了更多的组件，也是较成熟的，可满足日常绝大数需求

## JSF与ASP.NET

SUN之所以推出JSF，其实很大程度上是模仿了微软的ASP.NET，编写JSF时也是通过标签来引入相应元素

例如填写完表单内容后点击提交按钮，它就会执行与提交按钮所绑定的事件所对应的方法

可以说，JSF跟ASP.NET是异曲同工的，都是将期望的原始Web开发方式转化成接近于桌面应用的开发方式

## 示例

下面通过用户登录的功能实现，来演示JSF的入门代码

首先是`web.xml`文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.5"
    xsi:schemaLocation="http://java.sun.com/xml/ns/javaee   http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd">
    <!-- 也可不指定JSF配置文件，默认即/WEB-INF/faces-config.xml -->
    <!--
    <context-param>
        <param-name>javax.faces.CONFIG_FILES</param-name>
        <param-value>/WEB-INF/faces-config.xml</param-value>
    </context-param>
     -->
    <servlet>
        <servlet-name>Faces Servlet</servlet-name>
        <servlet-class>javax.faces.webapp.FacesServlet</servlet-class>
        <load-on-startup>0</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>Faces Servlet</servlet-name>
        <url-pattern>*.faces</url-pattern>
    </servlet-mapping>
</web-app>
```

然后是`faces-config.xml`文件

该文件与`web.xml`一样，均位于项目的`WEB-INF`目录下

```xml
<?xml version='1.0' encoding='UTF-8'?>
<faces-config xmlns="http://java.sun.com/xml/ns/javaee"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-facesconfig_1_2.xsd"
    version="1.2">
    <!-- ******【使用<managed-bean>标签注册backingbean的信息】****** -->
    <managed-bean>
        <!-- 在JSF术语中称UserBean叫做ManagedBean，即受JSF框架管理的bean -->
        <!-- 这里<managed-bean-name>对应页面中#{userBean.username}的值 -->
        <managed-bean-name>userBean</managed-bean-name>
        <managed-bean-class>com.langsin.backingbean.UserBean</managed-bean-class>
        <managed-bean-scope>request</managed-bean-scope>
    </managed-bean>

    <!-- ******【使用<navigation-rule>标签注册导航规则的信息】****** -->
    <navigation-rule>
        <!-- 指定导航规则来自于某一个视图 -->
        <from-view-id>/login.jsp</from-view-id>
        <!-- 接下来使用<navigation-case>指定导航情况 -->
        <navigation-case>
            <from-outcome>success</from-outcome>
            <to-view-id>/success.jsp</to-view-id>
        </navigation-case>
        <navigation-case>
            <from-outcome>failure</from-outcome>
            <to-view-id>/login.jsp</to-view-id>
        </navigation-case>
    </navigation-rule>
</faces-config>
```

下面是index.jsp页面

运行时应该直接访问`http://127.0.0.1:8088/JSF/login.faces`

由于匹配了`web.xml`中配置的`*.faces`路径，所以请求会经过`FacesServlet`

`FacesServlet`会直接查找当前工程的`login.jsp`文件，并加入JSF标签库的支持

若直接访问`http://127.0.0.1:8088/JSF/login.jsp`，会由于不认识JSF标签导致页面出错

```java
<%@ page pageEncoding="UTF-8"%>
<%response.sendRedirect(request.getContextPath() + "/login.faces");%>
```

接着是login.jsp页面

```html
<%@ page pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h"%>
<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f"%>
<f:view>
    <h1>Login Page</h1>
    <h3>
        <font color="red">提示：</font>
        程序设定的用户名和密码分别为
        <font color="blue"><strong>admin</strong></font>和
        <font color="blue"><strong>jadyer</strong></font>
    </h3>
    <br/>
    <br/>

    <b><h:outputText value="#{userBean.message}"/></b>

    <h:form>
        <h:outputText value="username: "/>
        <h:inputText value="#{userBean.username}"/><br/>
        <!-- 这里#{}表示一种绑定，这里是与userBean对象的username属性进行绑定 -->
        <h:outputText value="password: "/>
        <h:inputSecret value="#{userBean.password}"/><br/>
        <!-- action属性表示：点击该按钮时就会触发userBean对象的validateUser()方法 -->
        <!-- 但是注意，页面中不要写成action="#{userBean.validateUser()}"的形式 -->
        <h:commandButton value="Login" action="#{userBean.validateUser}"/>
    </h:form>
</f:view>
```

下面是success.jsp页面

从HTTP角度来说，其实login.jsp和success.jsp是在一个请求里面的

当我们在login.jsp中点提交时进入服务器端，服务器端是一个请求转发的过程，然后回到了success.jsp页面

因为整个过程是在一个请求中，而在`faces-config.xml`注册的`<managed-bean-scope>`也是在一个request里面

因此`login.jsp`和`success.jsp`共享同一个`UserBean`的实例，于是login.jsp中将属性值绑定到userBean属性中

然后success.jsp就可通过`<h:outputText value="#{userBean.username}"/>`取得所绑定的userBean对象属性值

```html
<%@ page pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h"%>
<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f"%>
<f:view>
    <h:outputText value="username: "/>
    <h:outputText value="#{userBean.username}"/><br/>
    <h:outputText value="password: "/>
    <h:outputText value="#{userBean.password}"/>
</f:view>
```

最后是`ManagedBean`

`backingbean`表示后台bean，这是JSF的一个术语：页面上绑定的对象都叫做`backingbean`

```java
package com.langsin.backingbean;

public class UserBean {
    private String username;
    private String password;
    private String message;

    /*--三个属性对应的getter和setter略--*/

    //如果该方法最后return null的话，那么该请求就会返回到原页面，即login.jsp页面
    public String validateUser() {
        if("admin".equals(username) && "jadyer".equals(password)){
            //并不是一定要写成success，也可以使用其它有意义的字符串
            return "success";
        }
        this.setMessage("username or password error!");
        return "failure";
    }
}
```