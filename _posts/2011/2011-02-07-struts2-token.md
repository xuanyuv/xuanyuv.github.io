---
layout: post
title: "Struts2防止表单重复提交"
categories: JavaEE
tags: JavaEE struts2 token tokensession 重复提交
author: 玄玉
excerpt: 介绍Struts2中提供的防止表单重复提交的<s:token>用法，以及防止表单重复提交的实现原理。
---

* content
{:toc}


## 方法

Struts2只需在`<s:form/>`标签范围中添加`<s:token/>`标签，即可实现防止表单重复提交

## 原理

假设页面添加的是`<s:token name="hello"/>`，运行项目后查看此页面源文件，会发现它被转化成了如下代码

```xml
<!--
若页面中写的是<s:token/>，那么被生成的代码是像下面这样
<input type="hidden" name="struts.token.name" value="struts.token"/>
<input type="hidden" name="struts.token" value="KF98D738ZRY8TNVQWJL3GYSB8LO5U748"/>
-->
<input type="hidden" name="struts.token.name" value="hello"/>
<input type="hidden" name="hello" value="HUZU1PLOZ2111AAN5XN48I5914IUM668"/>
```

由于`<s:token/>`是个标签，所以必然存在相应的标签库的代码文件

当服务器解析到`<s:token/>`时，该标签对应的类文件就会自动生成两个hidden

其中`struts.token.name`是永远固定的，第一个hidden的值与第二个hidden的name是关联在一起的

第二个hidden的值是Struts2产生的一个32位的`GUID(Globally Unique Identifier全局唯一标识符)`

然后Struts2会这样：`HttpSession.setAttribute("hello", "HUZU1PLOZ2111AAN5XN48I5914IUM668")`

提交表单时，名为`token`的表单重复提交的拦截器发现了hidder，于是会去尝试截获`struts.token.name`

截获到则读取该hidden的值hello，接着拿hello去读另一个hidden的值以及HttpSession里面的值

若读到的值相同，则认为表单第一次提交，于是`HttpSession.removeAttribute("hello")`，接着程序正常执行

若第一次提交后，再刷新页面或第二次提交，这时的GUID再与HttpSession比较，俩值不同于是认为第二次提交

* 表单重复提交拦截器

    > 这里用到的token拦截器，对应`org.apache.struts2.interceptor.TokenInterceptor`，它继承了`MethodFilterInterceptor`拦截器。另外`token`并没有配置在`defaultStack`拦截器里。我们可以发现Struts2采用的防止表单重复提交的方式与Struts1是一模一样的，原理上没有任何改变。但在使用方式上却简化又简化，不像Struts1那样还要写代码，显然比Struts1采用的token方式简洁得多得多

* 重复提交表单时的提示信息的国际化

    > 表单重复提交时的报错信息是放在ActionError中的，在前台页面对错误信息进行输出结果如下所示<br/>
`The form has already been processed or no token was supplied, please try again.`<br/>
然后在org.apache.struts2.struts-message.properties中找到该信息对应的key，就可以设置国际化信息以输出中文提示了。

* tokenSession拦截器

    > 1、使用token拦截器的做法在论坛用得比较多，不过也有些商务网站使用的是tokenSession拦截器<br/>
2、商务网站通常不管用户刷新多少次页面，都一直显示提交成功页面给用户<br/>
　　只不过这个提交成功可能会让用户误解。事实上也仅仅提交成功了一次，后面的都被忽略了<br/>
　　这个功能就是由tokenSession拦截器实现的，它不需配置任何`result`，返回的永远是成功页面<br/>
3、即使用tokenSession拦截器时，前台不用做任何改变，还是在表单里面放一个`<s:token/>`<br/>
　　然后在`struts.xml`中写成`<interceptor-ref name="tokenSession"/>`即可<br/>
4、当发现用户重复提交时，由于tokenSession拦截器的作用，它会返回result为`success`的页面<br/>
　　我们也可以在Action的方法中打印输出一句话来测试是否仅仅第一次的提交被成功执行了<br/>
　　经过测试得知，无论用户在客户端刷新几百遍几千遍，最后只有第一次的提交操作被执行了

## 示例

下面展示一个完整的代码

这里用的是`Struts2.1.8.1`，首先是`web.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" version="2.5">
<filter>
    <filter-name>struts2</filter-name>
    <filter-class>org.apache.struts2.dispatcher.ng.filter.StrutsPrepareAndExecuteFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>struts2</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
<welcome-file-list>
    <welcome-file>testToken.jsp</welcome-file>
</welcome-file-list>
</web-app>
```

下面是用于输入用户名和密码以测试重复提交表单的testToken.jsp页面

```xml
<%@ page language="java" pageEncoding="UTF-8"%>
<%@ taglib prefix="s" uri="/struts-tags"%>
<h2>测试表单重复提交</h2>
<s:actionerror/>
<s:form action="testToken" theme="simple">
    <s:token name="hello"/>
    姓名：<s:textfield name="username"/><br/>
    密码：<s:password name="password"/><br/>
    <s:submit value="提交"/>
</s:form>
```

用户名和密码正确时显示的result.jsp页面

```xml
<%@ page pageEncoding="UTF-8"%>
<h2>Login Success</h2>
```

下面是Struts2的配置文件struts.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE struts PUBLIC
    "-//Apache Software Foundation//DTD Struts Configuration 2.1//EN"
    "http://struts.apache.org/dtds/struts-2.1.dtd">
<struts>
    <package name="struts2.1" extends="struts-default">
        <!-- 当Struts2发现用户进行表单重复提交时，它会寻找invalid.token -->
        <!-- 并根据invalid.token找到与之对应的页面。所以记得要配置invalid.token结果 -->
        <action name="testToken" class="com.jadyer.action.LoginAction" method="testToken">
            <result>/result.jsp</result>
            <result name="invalid.token">/testToken.jsp</result>
            <interceptor-ref name="token"/>
            <interceptor-ref name="defaultStack"/>
        </action>
    </package>
</struts>
```

最后是处理所输入的用户名和密码的LoginAction.java

```java
package com.jadyer.action;
import com.opensymphony.xwork2.ActionSupport;
public class LoginAction extends ActionSupport {
    public String testToken() throws Exception {
        return SUCCESS;
    }
}
```