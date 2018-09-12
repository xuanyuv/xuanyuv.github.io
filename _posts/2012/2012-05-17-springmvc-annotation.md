---
layout: post
title: "SpringMVC常用的配置和注解"
categories: Spring
tags: spring springmvc
author: 玄玉
excerpt: 介绍了SpringMVC的常用配置，以及各种注解的用法。
---

* content
{:toc}


这里只列举比较常用的，需要关注的配置，以及各种注解的写法

首先是 `web.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" version="2.5">
    <!-- Web容器加载顺序ServletContext==>context-param==>listener==>filter==>servlet -->

    <!--
    使用ContextLoaderListener时需要告诉它Spring配置文件的位置，它默认会去找/WEB-INF/applicationContext.xml
    不过可以设置contextConfigLocation参数，来为上下文载入器指定一个或多个Spring配置文件
    注意：contextConfigLocation参数是一个用逗号分隔的路径列表，其路径是相对于Web系统的根路径的
    -->
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/jadyer-servlet.xml, classpath:applicationContext-*.xml</param-value>
    </context-param>

    <!-- 防止发生java.beans.Introspector内存泄露，应将它配置在ContextLoaderListener的前面 -->
    <!-- 详细介绍见https://jadyer.cn/2013/09/24/spring-introspector-cleanup-listener/ -->
    <listener>
        <listener-class>org.springframework.web.util.IntrospectorCleanupListener</listener-class>
    </listener>

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

    <!-- 设置Session超时时间为30分钟（零或负数表示会话永不超时） -->
    <!--
    <session-config>
        <session-timeout>30</session-timeout>
    </session-config>
    -->

    <error-page>
        <error-code>405</error-code>
        <location>/WEB-INF/405.html</location>
    </error-page>
    <error-page>
        <error-code>404</error-code>
        <location>/WEB-INF/404.jsp</location>
    </error-page>
    <error-page>
        <error-code>500</error-code>
        <location>/WEB-INF/500.jsp</location>
    </error-page>
    <error-page>
        <exception-type>java.lang.Throwable</exception-type>
        <location>/WEB-INF/500.jsp</location>
    </error-page>

    <!--
    默认欢迎页
    Servlet2.5中可直接在此处执行Servlet应用，比如<welcome-file>servlet/InitSystemParamServlet</welcome-file>
    本文的演示代码使用了SpringMVC提供的<mvc:view-controller>，实现了首页隐藏的目的，详见下面的jadyer-servlet.xml
    -->
    <!--
    <welcome-file-list>
        <welcome-file>login.jsp</welcome-file>
    </welcome-file-list>
    -->
</web-app>
```

然后是 SpringMVC 的配置文件 `jadyer-servlet.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:mvc="http://www.springframework.org/schema/mvc" xmlns:context="http://www.springframework.org/schema/context" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.0.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc-3.1.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-3.0.xsd">
    <!--
    启用Spring的组件自动扫描机制（自动扫描base-package指定的包中的类和子包里面类）
    它背后注册了很多用于解析注解的处理器，其中就包括<context:annotation-config/>配置的注解所使用的处理器
    所以配置了<context:component-scan base-package="">之后，便无需再配置<context:annotation-config>
    -->
    <context:component-scan base-package="com.jadyer"/>

    <!-- 启动SpringMVC的注解功能，它会自动注册HandlerMapping、HandlerAdapter、ExceptionResolver的相关实例 -->
    <mvc:annotation-driven/>

    <!--
    由于web.xml中设置是：由SpringMVC拦截所有请求，于是在读取静态资源文件的时候就会受到影响（说白了就是读不到）
    经过下面的配置，该标签的作用就是：所有页面中引用"/css/**"的资源，都会从"/resources/styles/"里面找
    我们可以访问http://IP:8080/xxx/css/my.css和http://IP:8080/xxx/resources/styles/my.css对比出来
    -->
    <mvc:resources mapping="/js/**" location="/js/"/>
    <mvc:resources mapping="/img/**" location="/img/"/>
    <mvc:resources mapping="/css/**" location="/resources/styles/"/>
    <mvc:resources mapping="/druid" location="/druid/index.html"/>
    <mvc:resources mapping="/MP_verify_BJ6Y9M1T1nabcdef.txt" location="/MP_verify_BJ6Y9M1T1nabcdef.txt" />
    <mvc:view-controller path="/" view-name="forward:/login.jsp"/>

    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <!--
        viewClass属性用于指定前台在解析数据时，所允许采用的手段（实际上其默认值就是JstlView）
        将来有需要的话，可以把JstlView改成其它的，如FreeMarkerView、VelocityView、TilesView
        <property name="viewClass" value="org.springframework.web.servlet.view.JstlView"/>
        -->
        <!-- 若Controller的方法返回"user/addSuccess"，则SpringMVC会自动找/WEB-INF/jsp/user/addSuccess.jsp -->
        <property name="prefix" value="/WEB-INF/jsp/"/>
        <property name="suffix" value=".jsp"/>
    </bean>

    <!-- SpringMVC上传文件时，需要配置MultipartResolver处理器 -->
    <bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
        <!-- 指定上传文件总大小不能超过800KB（注意maxUploadSize的限制不是针对单个文件，而是所有文件的总容量） -->
        <property name="maxUploadSize" value="800000"/>
    </bean>
    <!-- SpringMVC在超出上传文件限制时，会抛出org.springframework.web.multipart.MaxUploadSizeExceededException -->
    <!-- 该异常是SpringMVC在检查上传的文件信息时抛出来的，而且此时还没有进入到具体的业务Controller方法中 -->
    <bean id="exceptionResolver" class="org.springframework.web.servlet.handler.SimpleMappingExceptionResolver">
        <property name="exceptionMappings">
            <props>
                <!-- 设置遇到MaxUploadSizeExceededException异常时，自动跳转到/WEB-INF/jsp/error_fileupload.jsp页面 -->
                <prop key="org.springframework.web.multipart.MaxUploadSizeExceededException">error_fileupload</prop>
                <!-- 处理其它异常（包括Controller抛出的） -->
                <prop key="java.lang.Throwable">WEB-INF/500</prop>
            </props>
        </property>
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
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.servlet.view.InternalResourceViewResolver;

/**
 * Created by 玄玉<https://jadyer.cn/> on 2012/05/17 01:23.
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

    /**
     * 若只上传一个文件，则只需MultipartFile类型接收文件即可，而无需显式指定@RequestParam
     * 若想上传多个文件，则这里就要用MultipartFile[]类型来接收文件，且需指定@RequestParam
     * 上传多个文件时：前台表单中的所有文件域都要写为<input type="file" name="myfiles"/>
     * 并且表单类型为：<form action="${ctx}/mydemo/upload" method="POST" enctype="multipart/form-data">
     * 但如果前台用的是ajaxfileupload.js这种类似的组件，那就不需要显式的编写表单了，按照组件要求提交文件就行了
     */
    @RequestMapping(value="/upload")
    public String upload(String uname, @RequestParam MultipartFile[] myfiles, HttpServletResponse response) throws IOException{
        //可以在上传文件的同时接收其它参数
        System.out.println("收到用户[" + uname + "]的文件上传请求");
        response.setContentType("text/plain; charset=UTF-8");
        PrintWriter out = response.getWriter();
        for(MultipartFile myfile : myfiles){
            if(myfile.isEmpty()){
                out.print("1`请选择文件后上传");
                out.flush();
                return null;
            }else{
                System.out.println("文件原名：" + myfile.getOriginalFilename());
                System.out.println("文件名称：" + myfile.getName());
                System.out.println("文件长度：" + myfile.getSize());
                System.out.println("文件类型：" + myfile.getContentType());
                System.out.println("===================================================");
                //以下两种方式都能实现文件的保存
                //myfile.transferTo(new File(""));
                //FileUtils.copyInputStreamToFile(myfile.getInputStream(), new File(""));
            }
        }
        out.print("0`文件保存路径");
        out.flush();
        return null;
    }
}
```

再顺手补充一个 `405.html`

```html
<!DOCTYPE HTML>
<html>
<head>
    <title>405.html</title>
    <meta charset="UTF-8">
</head>
<body>
<font color="blue">
    Request method 'GET' not supported
    <br/><br/>
    The specified HTTP method is not allowed for the requested resource.
</font>
</body>
</html>
```