---
layout: post
title: "JAX-WS之通过JAX-RI集成Tomcat"
categories: WebServices
tags: WebServices jax-ws jax-ri tomcat
author: 玄玉
excerpt: 介绍JAX-WS通过其参考实现JAX-RI实现与Tomcat的集成方法。
---

* content
{:toc}


## 服务端

先简单介绍一下`JAX-RI`

JAX-RI是一个用来帮助我们开发WebService的工具包，类似的工具包有很多，JAX-RI只是其中的一个

JAX-RI即`JAX-WS的参考实现`，它是作为一个开源项目开发的，是GlassFish项目的一部分.

JAX-RI声称达到了生产质量的实现（以前的参考实现只不过是概念的验证），该参考实现现在是Metro的一部分

JAX-RI的官网为[https://jax-ws.java.net](https://jax-ws.java.net)

我下载到的最新版为`JAXWS2.2.7-20120813.zip`

**言归正文**

既然是与Tomcat集成，那么服务端是一个WebProject

首先是`SEI`，即服务端接口类`HelloService.Java`

```java
package com.xuanyuv.service;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;

@WebService(targetNamespace="https://www.xuanyuv.com/")
public interface HelloService {
    @WebResult(name="sayHelloResult")
    public String sayHello(@WebParam(name="name")String name);
}
```

下面是`SIB`，即服务端接口实现类`HelloServiceImpl.java`

```java
package com.xuanyuv.service;
import javax.jws.WebService;

@WebService(endpointInterface="com.xuanyuv.service.HelloService", targetNamespace="https://www.xuanyuv.com/")
public class HelloServiceImpl implements HelloService {
    @Override
    public String sayHello(String name) {
        System.out.println("Receive the name=[" + name + "]");
        if(null==name){
            return "Hello,World";
        }else{
            return "Hello," + name;
        }
    }
}
```

下面是集成所需的`//WebRoot//WEB-INF//sun-jaxws.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<endpoints xmlns="http://java.sun.com/xml/ns/jax-ws/ri/runtime" version="2.0">
    <!--           name：随便起，在web.xml中配置Servlet时会用到它 -->
    <!-- implementation：对外开放WebServices接口的实现类 -->
    <!--    url-pattern：浏览器访问后缀 -->
    <endpoint name="myJaxWsTomcatDemo"
              implementation="com.xuanyuv.service.HelloServiceImpl"
              url-pattern="/myHello"/>
</endpoints>

<!--
将JAX-WS开发的WebServices服务端部署到Tomcat，步骤如下
1、WEB-INF下创建sun-jaxws.xml
2、导入JAX-RI包
3、配置web.xml
4、启动tomcat
-->
```

最后是`//WebRoot//WEB-INF//web.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" version="2.5">
    <listener>
        <!-- 固定值:使用jaxws-ri中的监听器 -->
        <listener-class>com.sun.xml.ws.transport.http.servlet.WSServletContextListener</listener-class>
    </listener>

    <servlet>
        <!-- 该值必须与sun-jaxws.xml中定义的endpointName相同 -->
        <servlet-name>myJaxWsTomcatDemo</servlet-name>
        <!-- 固定值:使用jaxws-ri中的Servlet -->
        <servlet-class>com.sun.xml.ws.transport.http.servlet.WSServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>myJaxWsTomcatDemo</servlet-name>
        <!-- 该值必须与sun-jaxws.xml中定义的url-pattern相同 -->
        <!-- Tomcat启动成功后访问路径将为http://127.0.0.1:8088/webPath/myHello?wsdl -->
        <url-pattern>/myHello</url-pattern>
    </servlet-mapping>
</web-app>
```

**至此服务端发布完毕**

## 客户端

客户端只有一个用于演示调用服务端的`ClientApp.Java`

它是通过wsimport生成的，关于其用法，可参考<https://www.xuanyuv.com/blog/20130319/jaxws-and-wsimport-demo.html>

```java
package com.xuanyuv.client;
import java.io.IOException;
import java.net.URL;
import javax.xml.namespace.QName;
import javax.xml.soap.SOAPException;
import net.csdn.blog.xuanyuv.HelloService;
import net.csdn.blog.xuanyuv.HelloServiceImplService;

/**
 * wsimport -d D:/Download/ -keep -verbose http://127.0.0.1:8088/jaxws_tomcat/myHello?wsdl
 * Created by 玄玉<https://www.xuanyuv.com/> on 2013/05/31 19:49.
 */
public class ClientApp {
    public static void main(String[] args) throws SOAPException, IOException {
        //服务端提供服务的端口是8088
        //如果使用Eclipse提供的TCP/IP Monitor，则此处需将8088改为TCP/IP Monitor监听的本地端口
        String wsdlLocation = "http://127.0.0.1:8088/jaxws_tomcat/myHello?wsdl";

        //取自wsdl文件中定义的<wsdl:definitions targetNamespace=""/>的值
        String nameSpace = "https://www.xuanyuv.com/";

        //取自wsdl文件中定义的<wsdl:service name="">的值
        String serviceName = "HelloServiceImplService";
        HelloServiceImplService helloServiceImpl = new HelloServiceImplService(new URL(wsdlLocation), new QName(nameSpace, serviceName));
        HelloService hello = helloServiceImpl.getHelloServiceImplPort();
        System.out.println(hello.sayHello("玄玉"));
    }
}
```