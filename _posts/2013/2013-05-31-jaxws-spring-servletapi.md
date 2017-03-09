---
layout: post
title: "JAX-WS之集成Spring及获取ServletAPI"
categories: JAX-WS
tags: jax-ws spring servlet
author: 玄玉
excerpt: 介绍JAX-WS集成Spring的两种方式，以及获取ServletAPI的方法。
---

* content
{:toc}


## 服务端

首先是`SEI`，即服务端接口类`HelloService.Java`

```java
package com.jadyer.service;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;

@WebService(targetNamespace="http://blog.csdn.net/jadyer")
public interface HelloService {
    @WebResult(name="sayHelloResult")
    public String sayHello(@WebParam(name="name")String name);
}
```

下面是`SIB`，即服务端接口实现类`HelloServiceImpl.java`

```java
package com.jadyer.service;
import javax.annotation.Resource;
import javax.jws.WebService;
import javax.servlet.http.HttpServletRequest;
import javax.xml.ws.WebServiceContext;
import javax.xml.ws.handler.MessageContext;
import javax.xml.ws.handler.soap.SOAPMessageContext;
import org.springframework.stereotype.Service;
import com.jadyer.dao.HelloDaoJDBC;

/**
 * JAX-WS与Spring集成时获取HttpServletAPI
 * 1、SIB中直接使用@Resource注入javax.xml.ws.WebServiceContext
 * 2、使用wsc.getMessageContext().get(SOAPMessageContext.SERVLET_REQUEST)获取HttpServletRequest
 *    但前提是SIB已被Spring所管理...本例中的明显特征是SIB上使用了@Service注解
 * @create May 27, 2013 6:10:50 PM
 * @author 玄玉<https://jadyer.github.io/>
 */
@WebService(serviceName="myHelloService",
            targetNamespace="http://blog.csdn.net/jadyer",
            endpointInterface="com.jadyer.service.HelloService")
@Service
public class HelloServiceImpl implements HelloService {
    @Resource
    private HelloDaoJDBC helloDao;

    @Resource
    private WebServiceContext wsc;

    @Override
    public String sayHello(String name) {
        MessageContext ctx = wsc.getMessageContext();
        HttpServletRequest request = (HttpServletRequest)ctx.get(SOAPMessageContext.SERVLET_REQUEST);
        System.out.println("----------------------------------------------------------------------");
        System.out.println("ServletContextName=" + request.getSession().getServletContext().getServletContextName());
        System.out.println("ContextPath=" + request.getSession().getServletContext().getContextPath());
        System.out.println("RealPath=" + request.getSession().getServletContext().getRealPath("/"));
        System.out.println("ServerInfo=" + request.getSession().getServletContext().getServerInfo());
        System.out.println("----------------------------------------------------------------------");
        return helloDao.sayHello(name);
    }
}
```

下面是服务端模拟的一个DAO实现类`HelloDaoJDBC.java`

```java
package com.jadyer.dao;
import org.springframework.stereotype.Repository;

@Repository("helloDao")
public class HelloDaoJDBC {
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

下面是服务端自定义的Handler类`LicenseHandler.java`

```java
package com.jadyer.handler;
import java.util.Iterator;
import java.util.Set;
import javax.servlet.http.HttpServletRequest;
import javax.xml.namespace.QName;
import javax.xml.soap.SOAPBody;
import javax.xml.soap.SOAPEnvelope;
import javax.xml.soap.SOAPException;
import javax.xml.soap.SOAPHeader;
import javax.xml.soap.SOAPHeaderElement;
import javax.xml.soap.SOAPMessage;
import javax.xml.ws.handler.MessageContext;
import javax.xml.ws.handler.soap.SOAPHandler;
import javax.xml.ws.handler.soap.SOAPMessageContext;

public class LicenseHandler implements SOAPHandler<SOAPMessageContext> {
    @Override
    public Set<QName> getHeaders() {
        return null;
    }

    @Override
    public void close(MessageContext context) {}

    @Override
    public boolean handleFault(SOAPMessageContext context) {
        System.out.println("Server.handleFault() is invoked......");
        return false;
    }

    @Override
    @SuppressWarnings("unchecked")
    public boolean handleMessage(SOAPMessageContext context) {
        System.out.println("Server.handleMessage() is invoked......");

        //只有Handler被纳入Spring管理后，这里获取到的HttpServletRequest才不是null
        HttpServletRequest request = (HttpServletRequest)context.get(SOAPMessageContext.SERVLET_REQUEST);
        System.out.println("RealPath=" + request.getSession().getServletContext().getRealPath("/"));

        //从服务端角度看：inbound表示接收客户端消息，outbound表示响应消息给客户端..从客户端角度看则正好相反
        Boolean isOutBound = (Boolean)context.get(MessageContext.MESSAGE_OUTBOUND_PROPERTY);
        if(isOutBound){
            return true;
        }

        SOAPMessage message = context.getMessage();
        SOAPHeader header = null;
        SOAPBody body = null;
        try {
            SOAPEnvelope envelope = message.getSOAPPart().getEnvelope();
            header = envelope.getHeader();
            body = envelope.getBody();
        } catch (SOAPException e) {
            e.printStackTrace();
        }
        //获取Body中的part name
        String partName = body.getChildNodes().item(0).getLocalName();
        //只对服务端开放的login()方法进行验证,否则它会对服务端开放的所有方法进行验证
        if(!"sayHello".equals(partName)){
            return true;
        }

        if(null==header){
            System.out.println("未找到头信息......");
            return true;
        }
        Iterator<SOAPHeaderElement> iterator = header.extractAllHeaderElements();
        if(!iterator.hasNext()){
            System.out.println("头信息不能为空......");
            return true;
        }

        System.out.println("协议有效......");
        while(iterator.hasNext()){
            System.out.println(iterator.next().getTextContent());
        }
        return true;
    }
}
```

下面是Spring的配置文件`applicationContext.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:context="http://www.springframework.org/schema/context" xmlns:core="http://jax-ws.dev.java.net/spring/core" xmlns:servlet="http://jax-ws.dev.java.net/spring/servlet" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-2.5.xsd http://jax-ws.dev.java.net/spring/core http://jax-ws.dev.java.net/spring/core.xsd http://jax-ws.dev.java.net/spring/servlet http://jax-ws.dev.java.net/spring/servlet.xsd">
    <context:component-scan base-package="com.jadyer"/>

    <!--
    JAX-WS与Spring集成
    有两种比较好的方式：一个是Spring提供的SimpleJaxWsServiceExporter，一个是jaxws-spring提供的WSSpringServlet
    这两种方式的不同之处仅在于配置文件的不同，而SEI和SIB都是一样的
    补充一下：之所以让JAX-WS与Spring集成，主要是让SIB纳入Spring的管理，这样方便我们往SIB注入东西，比如DAO等等
    -->

    <!-- ******************************************************************************************* -->
    <!-- 下面演示Spring提供的SimpleJaxWsServiceExporter的写法 -->
    <!-- ******************************************************************************************* -->
    <!--
    SimpleJaxWsServiceExporter会自动搜索包中含有javax.jws.WebService注解的类，并将之发布为WebService
    这种方式可以直接向SIB中注入对象，因为这个WebService已被Spring所管理，详见本例中的HelloServiceImpl.java
    value用于指明发布地址，不强制要求与Web应用地址相同，访问时的地址是'value'加上@WebService(serviceName='')
    value="http://127.0.0.1:8088/mytest"，则服务地址为http://127.0.0.1:8088/mytestmyHelloService?wsdl
    value="http://127.0.0.1:8088/mytest"，则服务地址为http://127.0.0.1:8088/mytest/myHelloService?wsdl
    这种集成方式所发布的WebService是一种独立的WebService
    -->
    <!--
    <bean class="org.springframework.remoting.jaxws.SimpleJaxWsServiceExporter">
        <property name="baseAddress" value="http://127.0.0.1:8088/mytest/"/>
    </bean>
    -->

    <!-- ******************************************************************************************* -->
    <!-- 下面演示jaxws-spring提供的WSSpringServlet的写法 -->
    <!-- ******************************************************************************************* -->
    <!--
    jaxws-spring的WSSpringServlet开发步骤如下
    1)导入jaxws-spring-1.8.jar,xbean-spring-3.13.jar,jaxws-ri-2.2.7工具包,三者下载地址如下
      http://repo1.maven.org/maven2/org/jvnet/jax-ws-commons/spring/jaxws-spring/1.8/
      http://repo1.maven.org/maven2/org/apache/xbean/xbean-spring/3.13/
      https://jax-ws.java.net(我下载到的最新版为JAXWS2.2.7-20120813.zip)
    2)在Spring配置文件中增加jaxws-spring的两个xsd
      注意加入的是http://jax-ws.dev.java.net/spring/core.xsd，不是spring-jax-ws-core.xsd，否则会报错
    3)在MyEclipse中为xml文件增加jaxws-spring的两个schema，以便于applicationContext.xml中编写jaxws-spring标签
      Preferences-MyEclipse Enterprise Workbench-Files and Editors-XML-XML Catalog-User Specified Entries
      Location：选择File System后选中本地硬盘的spring-jax-ws-core.xsd(可直接从jaxws-spring-1.8.jar中解压出来)
      Key type：选为System ID
           Key：输入http://jax-ws.dev.java.net/spring/core.xsd
    4)编写WSSpringServlet在applicationContext.xml中的配置
    5)编写web.xml
    -->

    <!-- 这里url的值一定要与web.xml中为WSSpringServlet配置的<url-pattern>值相同 -->
    <!-- Web应用启动后,公布服务的访问地址就是http://127.0.0.1:8088/webPath/myService?wsdl -->
    <servlet:binding url="/myService">
        <servlet:service>
            <!-- bean属性表示WebService的注入对象,注意其值要在开头加井号,后跟Spring管理的SIB的Bean名称 -->
            <core:service bean="#helloServiceImpl">
                <!-- 此时就不需要在SIB中指定@HandlerChain(file="myHandlerChain.xml") -->
                <!-- 也不用编写myHandlerChain.xml了 -->
                <core:handlers>
                    <bean class="com.jadyer.handler.LicenseHandler"/>
                </core:handlers>
                <!-- 主动声明wsdl文件import或include的外部文件,否则其发布的wsdl中是不会正确引入xsd的 -->
                <!--
                <core:metadata>
                    <value>/WEB-INF/wsdl/myhello.xsd</value>
                </core:metadata>
                 -->
            </core:service>
        </servlet:service>
    </servlet:binding>
</beans>
```

下面这个是便于日志打印的`log4j.properties`

```ruby
# https://github.com/jadyer/seed/blob/master/seed-comm/src/main/java/com/jadyer/seed/comm/util/LogUtil.java
log4j.rootLogger=DEBUG,CONSOLE

#通常用于框架日志,如mina,spring等
log4j.appender.CONSOLE=org.apache.log4j.ConsoleAppender
log4j.appender.CONSOLE.Threshold=DEBUG
log4j.appender.CONSOLE.Target=System.out
log4j.appender.CONSOLE.layout=org.apache.log4j.PatternLayout
log4j.appender.CONSOLE.layout.ConversionPattern=[%d{yyyyMMdd HH:mm:ss}][%t][%C{1}]%m%n
```

最后是服务端的`web.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" version="2.5">
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:applicationContext.xml</param-value>
    </context-param>
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <!-- 针对jaxws-spring的配置 -->
    <servlet>
        <servlet-name>jaxws-servlet</servlet-name>
        <servlet-class>com.sun.xml.ws.transport.http.servlet.WSSpringServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>jaxws-servlet</servlet-name>
        <url-pattern>/myService</url-pattern>
    </servlet-mapping>
</web-app>
```

**至此服务端发布完毕**

## 客户端

首先是客户端自定义的`HeaderHandler.java`

```java
package com.jadyer.handler;
import java.io.IOException;
import java.util.Set;
import javax.xml.namespace.QName;
import javax.xml.soap.SOAPEnvelope;
import javax.xml.soap.SOAPException;
import javax.xml.soap.SOAPHeader;
import javax.xml.soap.SOAPMessage;
import javax.xml.ws.handler.MessageContext;
import javax.xml.ws.handler.soap.SOAPHandler;
import javax.xml.ws.handler.soap.SOAPMessageContext;

public class HeaderHandler implements SOAPHandler<SOAPMessageContext> {
    @Override
    public Set<QName> getHeaders() {
        return null;
    }

    @Override
    public void close(MessageContext context) {}

    @Override
    public boolean handleFault(SOAPMessageContext context) {
        System.out.println("\nClient.handleFault() is invoked.....");
        return false;
    }

    @Override
    public boolean handleMessage(SOAPMessageContext context) {
        System.out.println("\nClient.handleMessage() is invoked.....");
        Boolean isOutBound = (Boolean)context.get(MessageContext.MESSAGE_OUTBOUND_PROPERTY);
        if(isOutBound){
            SOAPMessage message = context.getMessage();
            try {
                SOAPEnvelope envelope = message.getSOAPPart().getEnvelope();
                SOAPHeader header = envelope.getHeader();
                String partName = envelope.getBody().getFirstChild().getLocalName();
                if("sayHello".equals(partName)){
                    if(null == header){
                        header = envelope.addHeader();
                    }
                    QName qname = new QName("http://blog.csdn.net/jadyer", "licenseInfo", "ns");
                    header.addHeaderElement(qname).setValue("Jadyer");
                    message.writeTo(System.out);
                }
            } catch (SOAPException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return true;
    }
}
```

接下来是客户端与Spring集成用到的`HeaderHandlerResolver.java`

```java
package com.jadyer.handler;
import java.util.ArrayList;
import java.util.List;
import javax.xml.ws.handler.Handler;
import javax.xml.ws.handler.HandlerResolver;
import javax.xml.ws.handler.PortInfo;
import org.springframework.stereotype.Component;

@Component
public class HeaderHandlerResolver implements HandlerResolver {
    @SuppressWarnings("unchecked")
    @Override
    public List<Handler> getHandlerChain(PortInfo portInfo) {
        List<Handler> handlers = new ArrayList<Handler>();
        handlers.add(new HeaderHandler());
        return handlers;
    }
}
```

下面是客户端模拟的一个Service实现类`ClientService.java`

```java
package com.jadyer.service;
import javax.annotation.Resource;
import net.csdn.blog.jadyer.HelloService;
import org.springframework.stereotype.Service;

@Service
public class ClientService {
    @Resource
    private HelloService myServerWebService;

    public String getServerResponse(String name){
        return myServerWebService.sayHello(name);
    }
}
```

下面是客户端的Spring配置文件`applicationContext.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
                        http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
                        http://www.springframework.org/schema/context
                        http://www.springframework.org/schema/context/spring-context-2.5.xsd">
    <context:component-scan base-package="com.jadyer"/>

    <!-- 这样就可以在客户端把一个WebService注入到其它的bean中了 -->
    <bean id="myServerWebService" class="org.springframework.remoting.jaxws.JaxWsPortProxyFactoryBean">
        <!--
        记得首先还是要使用wsimport生成客户端代码，然后将接口类全路径写在serviceInterface的值里
        关于wsimport的使用，可参考https://jadyer.github.io/2013/03/19/jaxws-and-wsimport-demo/
        wsimport -d D:/Download/ -keep -verbose http://127.0.0.1:8088/jaxws-spring/myService?wsdl
        -->
        <property name="serviceInterface" value="net.csdn.blog.jadyer.HelloService"/>
        <property name="wsdlDocumentUrl" value="http://127.0.0.1:8088/jaxws-spring/myService?wsdl"/>
        <property name="namespaceUri" value="http://blog.csdn.net/jadyer"/>
        <property name="serviceName" value="myHelloService"/>
        <property name="portName" value="HelloServiceImplPort"/>
        <!-- 使用handlerResolver属性来启用Handler，其属性值应为javax.xml.ws.handler.HandlerResolver类型 -->
        <!-- 所以自定义了一个实现HandlerResolver的类，详见com.jadyer.handler.HeaderHandlerResolver.java -->
        <property name="handlerResolver" ref="headerHandlerResolver"/>
    </bean>
</beans>
```

最后是客户端调用服务端的模拟入口`ClientApp.java`

它是通过wsimport生成的，关于其用法，可参考[https://jadyer.github.io/2013/03/19/jaxws-and-wsimport-demo/](https://jadyer.github.io/2013/03/19/jaxws-and-wsimport-demo/)

```java
package com.jadyer.client;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import com.jadyer.service.ClientService;

public class ClientApp {
    public static void main(String[] args) {
        ApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
        ClientService cs = (ClientService)ctx.getBean("clientService");
        System.out.println(cs.getServerResponse("玄玉"));
    }
}
```

## 控制台输出

```
//客户端
Client.handleMessage() is invoked.....
<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/"><S:Header><ns:licenseInfo xmlns:ns="http://blog.csdn.net/jadyer">Jadyer</ns:licenseInfo></S:Header><S:Body><ns2:sayHello xmlns:ns2="http://blog.csdn.net/jadyer"><name>玄玉</name></ns2:sayHello></S:Body></S:Envelope>
Client.handleMessage() is invoked.....
Hello,玄玉

//服务端
Server.handleMessage() is invoked......
RealPath=D:\Develop\apache-tomcat-6.0.36\webapps\jaxws-spring\
协议有效......
Jadyer
----------------------------------------------------------------------
ServletContextName=null
ContextPath=/jaxws-spring
RealPath=D:\Develop\apache-tomcat-6.0.36\webapps\jaxws-spring\
ServerInfo=Apache Tomcat/6.0.36
----------------------------------------------------------------------
Receive the name=[玄玉]
Server.handleMessage() is invoked......
RealPath=D:\Develop\apache-tomcat-6.0.36\webapps\jaxws-spring\
```