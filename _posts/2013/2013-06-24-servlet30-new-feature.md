---
layout: post
title: "Servlet3.0的几个新特性"
categories: JavaEE
tags: servlet
author: 玄玉
excerpt: 主要介绍Servlet3.0的几个新特性，包括通过注解来编写Servlet、Listener、Filter，以及动态注册Servlet、开启异步支持、文件上传等功能。
---

* content
{:toc}


注意：Servlet3.0 需要 Tomcat7 和 JavaEE6

本文主要介绍了Servlet3.0发布的诸多新特性中的，以下几个

* 注解编写Servlet
* 注解编写Listener（含动态注册Servlet）
* 注解编写Filter
* 异步支持
* 文件上传

下面通过代码来演示各自的具体写法

这是公共的 `web.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="3.0" xmlns="http://java.sun.com/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd">
    <welcome-file-list>
        <welcome-file>login.jsp</welcome-file>
    </welcome-file-list>
</web-app>
```

这是公共的测试页面 `login.jsp`

```html
<%@ page language="java" pageEncoding="UTF-8"%>

<a href="${pageContext.request.contextPath}/hello">测试Servlet3.0注解</a>
<br>
<br>
<a href="${pageContext.request.contextPath}/servlet/hello">测试Servlet3.0注解</a>
<br>
<br>
<a href="${pageContext.request.contextPath}/user">测试Servlet3.0动态注册</a>
<br>
<br>
<a href="${pageContext.request.contextPath}/servlet/user">测试Servlet3.0动态注册</a>
<br>
<br>
<a href="${pageContext.request.contextPath}/async">测试Servlet3.0异步支持</a>
<br>
<br>
<form action="${pageContext.request.contextPath}/upload" method="POST" enctype="multipart/form-data">
    <input name="uploadFile" type="file">
    <br/>
    <input type="submit" value="测试Servlet3.0文件上传">
<form>
```

## 注解编写Filter

```java
package com.jadyer.demo;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.annotation.WebInitParam;
import java.io.IOException;

/**
 * Servlet3.0新特性之注解编写过滤器
 * Created by 玄玉<https://jadyer.cn/> on 2013/06/24 10:39.
 */
@WebFilter(urlPatterns="/*", initParams=@WebInitParam(name="encoding", value="UTF-8"))
public class EncodingFilter implements Filter {
    @Override
    public void destroy() {
        System.out.println("destroy invoked");
    }

    @Override
    public void init(FilterConfig config) throws ServletException {
        System.out.println("init invoked");
        System.out.println(config.getInitParameter("encoding"));
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws IOException, ServletException {
        System.out.println("doFilter invoked");
        chain.doFilter(req, resp);
    }
}
```

## 注解编写Servlet

`@WebServlet` 注解常用的有两个参数

* urlPatterns：用于指定Servlet的访问URL（支持多URL）
* initParams ：用于设定初始参数（支持多参数）

注意：@WebInitParam注解通常不单独使用，而是同 @WebServlet 或者 @WebFilter 组合使用

实际测试：单独使用 @WebInitParam 设定初始参数，设定失败

```java
package com.jadyer.demo;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebInitParam;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Servlet3.0新特性之注解编写ervlet
 * Created by 玄玉<https://jadyer.cn/> on 2013/06/23 17:46.
 */
@WebServlet(urlPatterns={"/hello", "/servlet/hello"}, initParams={@WebInitParam(name="savePath", value="D:/upload")})
public class HelloServlet extends HttpServlet {
    private static final long serialVersionUID = 2040116868162606895L;
    private String savePath;

    @Override
    public void init(ServletConfig config) throws ServletException {
        savePath = config.getInitParameter("savePath");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        PrintWriter out = resp.getWriter();
        out.print("This is Servlet3.0 demo, and the savePath = " + this.savePath);
        out.flush();
        out.close();
    }
}
```

## 注解编写Listener

动态注册 Servlet 的功能，也是在 Listener 里面实现的

所以先列出来一个并没有使用 @WebServlet 注解的类 `UserServlet.java`

```java
package com.jadyer.demo;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * 这里并没有使用@WebServlet注解
 * 而是在监听器里面通过Servlet3.0提供的动态注册机制把它动态注册为一个Servlet
 * Created by 玄玉<https://jadyer.cn/> on 2013/06/24 10:39.
 */
public class UserServlet extends HttpServlet {
    private static final long serialVersionUID = 7115756326691777726L;

    @Override
    public void init(ServletConfig config) throws ServletException {
        System.out.println(config.getInitParameter("logPath"));
        System.out.println(config.getInitParameter("savePath"));
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("https://jadyer.cn/");
    }
}
```

接下来就是核心的监听器 `UserListener.java`

```java
package com.jadyer.demo;
import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.ServletRegistration;
import javax.servlet.annotation.WebListener;

/**
 * Servlet3.0新特性之注解编写监听器以及动态注册Servlet
 * Created by 玄玉<https://jadyer.cn/> on 2013/06/24 10:39.
 */
@WebListener
public class UserListener implements ServletContextListener {
    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("服务器关闭时会调用该方法");
    }

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("服务器启动时会调用该方法");
        ServletContext context = sce.getServletContext();
        //注册一个没有使用@WebServlet注解的类为Servlet（第一个参数是Servlet的名字）
        ServletRegistration register = context.addServlet("userServlet", UserServlet.class);
        //为动态注册的Servlet设定访问URL（可设定多个）
        register.addMapping("/user", "/servlet/user");
        //为动态注册的Servlet设定初始参数（可选的，相当于以前的<init-param>）
        register.setInitParameter("logPath", "/app/log");
        register.setInitParameter("savePath", "/app/upload");
    }
}
```

## 文件上传

先介绍一下 @MultipartConfig 注解的几个属性

 * maxFileSize      ：允许上传的单个文件最大值，与所有文件无关，只限制单个文件（单位为byte，默认值是`-1`，即无限制）
 * maxRequestSize   ：允许上传的文件最大值，指的是一次请求中的所有文件之和（单位为byte，默认值是`-1`，即无限制）
 * fileSizeThreshold：设置阈值，达到阈值后会将所上传的文件从临时目录中写到磁盘（单位为byte，默认值是0）
 * location         ：指定存储所上传文件的目录

关于 location 属性，还分以下两种情况

1. 如果 `part.write(fileName)` 传的参数只有上传的文件名，那么最后文件就会被上传到 location 目录中<br>
   若此时 location 所指定的目录不存在，则会报告下面的异常（Tomcat7.x启动时不会报）<br>
   java.io.IOException: The temporary upload location [D:\\upload\22] is not valid
2. 如果 `part.write(savePath+"/"+fileName)`，则无论 location 是否指定目录，最后文件都会被上传到 savePath<br>
   但是，若此时location所指定的目录不存在，那么也会报告第一种情况中的异常，并导致上传文件失败

所以，API 上说 location 是储存文件的目录，但根据上面两种情况来看，我感觉 location 指的是临时文件目录，**故不推荐使用**

随后我又查看了 Oracle 官方文档，**发现该属性指的就是临时文件目录**

其官方文档的地址为：[http://docs.oracle.com/javaee/6/tutorial/doc/gmhal.html](http://docs.oracle.com/javaee/6/tutorial/doc/gmhal.html)

```java
package com.jadyer.demo;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Servlet3.0新特性之文件上传
 * Created by 玄玉<https://jadyer.cn/> on 2013/06/24 15:19.
 */
@WebServlet(urlPatterns="/upload")
//标明此Servlet支持文件上传
@MultipartConfig(fileSizeThreshold=1024*1024*2, maxFileSize=1024*1024*20, maxRequestSize=1024*1024*200)
public class UploadServlet extends HttpServlet {
    private static final long serialVersionUID = 9007276067357814862L;

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setCharacterEncoding("UTF-8");

        //回显上传结果给浏览器
        String uploadResult;
        PrintWriter out = resp.getWriter();
        resp.setContentType("text/html; charset=UTF-8");
        try{
            //获取上传的文件的Part，下面的操作都是以这个Part为中心的
            Part part = req.getPart("uploadFile");

            //本例中它的值是form-data; name="uploadFile"; filename="玄玉.png"
            String _str = part.getHeader("content-disposition");
            //获取上传的文件真实名字（含后缀）
            String fileName = _str.substring(_str.lastIndexOf("=")+2, _str.lastIndexOf("\""));

            //指定上传的文件的存储目录并确保其存在
            String savePath = "D:/upload/";
            File savePathFolder = new File(savePath);
            if(!savePathFolder.exists()){
                savePathFolder.mkdirs();
            }
            //上传文件（写入磁盘）
            part.write(savePath + "/" + fileName);
            uploadResult = "上传完毕<br/>" +
                    "上传的文件Part=" + part.getName() + "<br/>" +
                    "上传的文件名称=" + fileName + "<br/>" +
                    "上传的文件大小=" + part.getSize() + "<br/>" +
                    "上传的文件类型=" + part.getContentType();
        }catch(IllegalStateException ise){
            uploadResult = "上传失败，失败原因为：<br/>" + ise.getMessage();
        }
        out.print(uploadResult);
        out.flush();
        out.close();
    }
}
```

## 异步支持

Servlet2.5 中也可以单独启动一个线程去执行耗时的任务，接着Servlet会继续往下执行

执行完最后一行代码时，Servlet就会把响应输出给请求方，而那个单独启动的线程的任何执行结果都不会反映给请求方

此其一

其二

若不单独启动线程去执行耗时任务，而是将耗时操作串行放到Servlet方法中执行的话，也是不可取的

因为Servlet容器会管理着一个线程池，处理我们请求的Servlet所依附的线程都是来自于这个线程池的

如果某个操作过于耗时，那么线程池里面的资源就会被占用掉，所以 Servlet3.0 就有了异步支持

Servlet3.0 中的异步支持也是单独启动线程执行耗时任务，但是当Servlet执行到最后一行代码时

它提供了一些机制会判断那个线程是否执行完毕，直到线程执行完毕后才会响应所有结果给请求方

```java
package com.jadyer.demo;
import javax.servlet.AsyncContext;
import javax.servlet.AsyncEvent;
import javax.servlet.AsyncListener;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;
import java.util.concurrent.TimeUnit;

/**
 * Servlet3.0新特性之异步支持
 * Created by 玄玉<https://jadyer.cn/> on 2013/06/23 17:47.
 */
//默认不支持异步，需手工开启：asyncSupported=true
@WebServlet(urlPatterns={"/async"}, asyncSupported=true)
public class AsyncServet extends HttpServlet {
    private static final long serialVersionUID = 3314056681141922826L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        PrintWriter out = resp.getWriter();
        out.println("doGet starts：" + new Date());
        out.flush();
        System.out.println("第一步mark");

        //启动一个异步操作的上下文对象AsyncContext
        AsyncContext context = req.startAsync();
        //添加一个监听器（奇怪：AsyncListener竟然没有适配器）
        context.addListener(new AsyncListener(){
            @Override
            public void onComplete(AsyncEvent asyncEvent) throws IOException {
                PrintWriter out = asyncEvent.getSuppliedResponse().getWriter();
                out.println("async succes：" + new Date());
                out.flush();
                /*
                 * 重点：在这里关闭流
                 * -----------------------------------------------------------------------------------------
                 * 1、自打请求进入doGet()开始，直到客户端收到响应为止
                 *    整个过程的任意位置获得的PrintWriter和ServletResponse对象都是一个（通过输出对象引用看出来的）
                 * 2、第一个mark处声明的PrintWriter对象不能在第二个mark处关闭，只能在第4个或第5个mark处关闭
                 *    否则异步支持就会失败（如果是在第5处关闭，那么第5处的out.println()也会响应给客户端）
                 * -----------------------------------------------------------------------------------------
                 */
                out.close();
                System.out.println("第五步mark");
            }
            @Override
            public void onError(AsyncEvent arg0) throws IOException {}
            @Override
            public void onStartAsync(AsyncEvent arg0) throws IOException {}
            @Override
            public void onTimeout(AsyncEvent arg0) throws IOException {}
        });
        //也可以用这种方法启动异步线程
        //context.start(new HelloAsyncThread(context));
        new Thread(new HelloAsyncThread(context)).start();

        out.println("doGet   ends：" + new Date());
        out.flush();
        System.out.println("第二步mark");
    }

    private static class HelloAsyncThread implements Runnable {
        private AsyncContext context;
        HelloAsyncThread(AsyncContext context){
            this.context = context;
        }
        @Override
        public void run() {
            try {
                PrintWriter out = context.getResponse().getWriter();
                out.println("async starts：" + new Date());
                out.flush();
                System.out.println("第三步mark");

                //模拟耗时操作：让线程睡3s
                //Thread.sleep(3000);
                TimeUnit.SECONDS.sleep(3);

                out.println("async   ends：" + new Date());
                out.flush();
                System.out.println("第四步mark");

                //调用complete()就能够告诉Servlet异步处理已完毕，否则Servlet还在傻傻等待，浪费时间
                context.complete();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```