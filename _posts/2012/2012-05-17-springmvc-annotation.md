---
layout: post
title: "SpringMVC及其注解的用法"
categories: Spring
tags: spring springmvc
author: 玄玉
excerpt: 介绍了SpringMVC的常用配置，以及各种注解的用法。
---

* content
{:toc}


这里只贴比较核心的，需要关注的配置，以及各种常用注解的写法

首先是 `web.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" version="2.5">
    <!--
    使用ContextLoaderListener时需要告诉它Spring配置文件的位置，它默认会去找/WEB-INF/applicationContext.xml
    不过可以设置contextConfigLocation参数，来为上下文载入器指定一个或多个Spring配置文件
    注意：contextConfigLocation参数是一个用逗号分隔的路径列表，其路径是相对于Web系统的根路径的
    -->
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/jadyer-servlet.xml, classpath:applicationContext-*.xml</param-value>
    </context-param>

    <!--
    配置上下文载入器，载入除DispatcherServlet载入的配置文件之外的其它上下文配置文件
    最常用的上下文载入器是一个Servlet监听器，其名称为ContextLoaderListener
    -->
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <!--
    SpringMVC的前端控制器
    当DispatcherServlet载入后，它将从一个XML文件中载入Spring的应用上下文，该XML文件的名字取决于<servlet-name>
    这里DispatcherServlet将试图从一个叫做springmvc-servlet.xml的文件中载入应用上下文，其默认位于WEB-INF目录下
    不过也可以让它去找别的配置文件，修改方法为：配置局部的<init-param>参数
    -->
    <servlet>
        <servlet-name>jadyer</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <!--
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:applicationContext.xml</param-value>
        </init-param>
        -->
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>jadyer</servlet-name>
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

    <welcome-file-list>
        <welcome-file>index.jsp</welcome-file>
    </welcome-file-list>
</web-app>
```

然后是 SpringMVC 的配置文件 `jadyer-servlet.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:mvc="http://www.springframework.org/schema/mvc" xmlns:context="http://www.springframework.org/schema/context" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.0.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc-3.1.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-3.0.xsd">
    <!-- 启用Spring的组件自动扫描机制（自动扫描base-package指定的包中的类和子包里面类） -->
    <context:component-scan base-package="com.jadyer"/>

    <!-- 启动SpringMVC的注解功能，它会自动注册HandlerMapping、HandlerAdapter、ExceptionResolver的相关实例 -->
    <mvc:annotation-driven/>

    <!--
    由于web.xml中设置是：由SpringMVC拦截所有请求，于是在读取静态资源文件的时候就会受到影响（说白了就是读不到）
    经过下面的配置，该标签的作用就是：所有页面中引用"/css/**"的资源，都会从"/resources/styles/"里面找
    我们可以访问http://IP:8080/xxx/css/my.css和http://IP:8080/xxx/resources/styles/my.css对比出来
    -->
    <mvc:resources mapping="/css/**" location="/resources/styles/"/>

    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <!--
        viewClass属性可以用来指定前台在解析数据时，所允许采用的手段。实际上其默认值就是JstlView
        将来有需要的话，就可以在这里把JstlView改成其它的，如FreeMarkerView,VelocityView,TilesView
        -->
        <!--
        <property name="viewClass" value="org.springframework.web.servlet.view.JstlView"/>
        -->
        <!-- 若Controller的方法返回"user/addSuccess"，则SpringMVC会自动找/WEB-INF/jsp/user/addSuccess.jsp -->
        <property name="prefix" value="/WEB-INF/jsp/"/>
        <property name="suffix" value=".jsp"/>
    </bean>
</beans>
```

最后是核心的Controller

```java
package com.jadyer.demo.controller;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

/**
 * Created by 玄玉<https://jadyer.github.io/> on 2012/05/17 01:23.
 */
//指明这是一个SpringMVCController
@Controller
//类似于命名空间，即访问该Controller时必须加上"/mydemo"在前面
@RequestMapping(value="/mydemo")
public class UserController {
    //对于该方法而言，以下两种请求，都会被分发到这里
    //http://127.0.0.1:8088/SpringMVC_study/mydemo
    //http://127.0.0.1:8088/SpringMVC_study/mydemo/
    @RequestMapping
    public String login(){
        System.out.println("login() is invoked");
        return "addSuccess";
    }

    //对于该方法而言，以下两种请求，都会被分发到这里
    //http://127.0.0.1:8088/SpringMVC_study/mydemo/
    //http://127.0.0.1:8088/SpringMVC_study/mydemo/add
    @RequestMapping(value={"/","/add"})
    public String addUser(){
        System.out.println("addUser() is invoked");
        return "addSuccess";
    }

    //@RequestParam("userID")表明在访问该方法时，必须传个参数过来，并且参数名必须是int型的userID
    //以下三种情况，都会导致服务器返回：HTTP Status 400
    //1、没有传任何参数
    //2、传的参数中没有名为userID的参数
    //3、传了userID参数但其参数值无法转换为int型
    @RequestMapping(value={"/delete"})
    public String deleteUser(@RequestParam("userID") int userID){
        System.out.println("===============" + userID);
        return "addSuccess";
    }

    //这里@RequestParam则表明：访问该方法时，至少要把userName参数传过来，否则服务器会返回HTTP Status 400
    @RequestMapping("/edit")
    public String editUser(@RequestParam String userName){
        System.out.println("===============" + userName);
        return "addSuccess";
    }

    //这种情况下，无论传不传userName参数，都可以访问到该方法（若没传，则打印出来的值就是null）
    //而method=RequestMethod.GET用于指定需要以GET方式访问，对于POST请求是进不到本方法的
    @RequestMapping(value="/modify", method=RequestMethod.GET)
    public String modifyUser(String userName){
        System.out.println("===============" + userName);
        return "addSuccess";
    }

    //这时POST请求才会进来
    @RequestMapping(value="/modify", method=RequestMethod.POST)
    public String modifyDoUser(String userName){
        System.out.println("===============" + userName);
        return "addSuccess";
    }

    //获取javax.servlet.http.HttpServletRequest、HttpServletResponse、HttpSession
    //由于使用了@PathVariable，所以此时访问的URL就类似于这样的：/mydemo/michael/eat
    @RequestMapping("{name}/eat")
    public String eat(@PathVariable String name, HttpServletRequest request, HttpServletResponse response, HttpSession session){
        System.out.println("===============" + name);
        System.out.println("===============" + request.getParameter("myname"));
        System.out.println("===============" + request.getLocalAddr());
        System.out.println("===============" + response.getLocale());
        System.out.println("===============" + session.getId());
        //两种写法都要写绝对路径（SpringMVC都会为其自动添加应用上下文）
        //return "redirect:/mydemo/eat";
        return InternalResourceViewResolver.REDIRECT_URL_PREFIX + "/mydemo/eat";
    }
}
```