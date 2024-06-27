---
layout: post
title: "CXF之集成Spring"
categories: WebServices
tags: WebServices cxf spring jax-ws jax-ri
author: 玄玉
excerpt: 介绍Apache-CXF与Spring集成的一些细节及完整示例。
---

* content
{:toc}


## 服务端

首先是`SEI`，即服务端接口类`HelloService.Java`

```java
package com.xuanyuv.service;
import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;

@WebService(targetNamespace="https://www.xuanyuv.com/")
public interface HelloService {
    @WebMethod
    @WebResult(name="sayHelloResult")
    public String sayHello(@WebParam(name="name")String name);
}
```

下面是`SIB`，即服务端接口实现类`HelloServiceImpl.java`

```java
package com.xuanyuv.service;
import javax.jws.WebService;
import org.springframework.stereotype.Service;

@WebService(endpointInterface="com.xuanyuv.service.HelloService", targetNamespace="https://www.xuanyuv.com/")
@Service
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

下面是服务端自定义的拦截器类`LicenseInInterceptor.java`

```java
package com.xuanyuv.interceptor;
import java.util.List;
import org.apache.cxf.binding.soap.SoapMessage;
import org.apache.cxf.binding.soap.interceptor.AbstractSoapInterceptor;
import org.apache.cxf.headers.Header;
import org.apache.cxf.interceptor.Fault;
import org.apache.cxf.phase.Phase;
import org.springframework.stereotype.Component;
import org.w3c.dom.Node;

@Component
public class LicenseInInterceptor extends AbstractSoapInterceptor {
    public LicenseInInterceptor(){
        super(Phase.INVOKE);
    }

    @Override
    public void handleMessage(SoapMessage message) throws Fault {
        List<Header> headers = message.getHeaders();
        Object obj = null;
        for(Header header : headers){
            if(header.getName().getLocalPart().equals("licenseInfo")){
                obj = header.getObject();
                if(obj instanceof Node){
                    System.out.println("Receive the licenseInfo=[" + ((Node)obj).getTextContent() + "]");
                }
            }
        }
    }
}
```

下面是服务端的Spring配置文件`applicationContext.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xmlns:jaxws="http://cxf.apache.org/jaxws"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
                        http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
                        http://www.springframework.org/schema/context
                        http://www.springframework.org/schema/context/spring-context-2.5.xsd
                        http://cxf.apache.org/jaxws
                        http://cxf.apache.org/schemas/jaxws.xsd">
    <context:component-scan base-package="com.xuanyuv"/>

    <import resource="classpath:META-INF/cxf/cxf.xml"/>
    <import resource="classpath:META-INF/cxf/cxf-extension-soap.xml"/>
    <import resource="classpath:META-INF/cxf/cxf-servlet.xml"/>

    <!--
    发布WebServices服务
    也可以写成这样<jaxws:endpoint implementor="com.xuanyuv.service.HelloServiceImpl" address="/myHello"/>
    最后的访问地址都是http://127.0.0.1:8088/webPath/services/myHello?wsdl
    经测试：写成address="myHello"的话，也是可以的，访问地址和上一行贴出来的是一样的
    -->
    <jaxws:endpoint implementor="#helloServiceImpl" address="/myHello">
        <jaxws:inInterceptors>
            <bean class="org.apache.cxf.interceptor.LoggingInInterceptor"/>
            <ref bean="licenseInInterceptor"/>
        </jaxws:inInterceptors>
        <jaxws:outInterceptors>
            <bean class="org.apache.cxf.interceptor.LoggingOutInterceptor"/>
        </jaxws:outInterceptors>
    </jaxws:endpoint>

    <!--
    也可以用CXF提供的core.xsd来注册Interceptor（比如本文的客户端代码中写的）
    其需要引入下面的标签声明
    xmlns:cxf="http://cxf.apache.org/core"
    xsi:schemaLocation="http://cxf.apache.org/core http://cxf.apache.org/schemas/core.xsd"
    -->
    <!-- 然后像下面这样写就可以了 -->
    <!--
    <jaxws:endpoint implementor="#helloServiceImpl" address="/myHello"/>
    <cxf:bus>
        <cxf:inInterceptors>
            <bean class="org.apache.cxf.interceptor.LoggingInInterceptor"/>
            <ref bean="licenseInInterceptor"/>
        </cxf:inInterceptors>
        <cxf:outInterceptors>
            <bean class="org.apache.cxf.interceptor.LoggingOutInterceptor"/>
        </cxf:outInterceptors>
    </cxf:bus>
    -->
</beans>
```

下面这个是便于日志打印的`log4j.properties`

```ruby
# https://github.com/xuanyuv/seed/blob/master/seed-comm/src/main/java/com/xuanyuv/seed/comm/util/LogUtil.java
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

    <servlet>
        <servlet-name>CXFServlet</servlet-name>
        <servlet-class>org.apache.cxf.transport.servlet.CXFServlet</servlet-class>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>CXFServlet</servlet-name>
        <url-pattern>/services/*</url-pattern>
    </servlet-mapping>
</web-app>
```

**至此，服务端代码示例完毕**

## 客户端

首先是客户端用于发送`SOAPHeader`信息的拦截器类`LicenseOutInterceptor.java`

```java
package com.xuanyuv.interceptor;
import javax.xml.bind.JAXBException;
import javax.xml.namespace.QName;
import org.apache.cxf.binding.soap.SoapMessage;
import org.apache.cxf.binding.soap.interceptor.AbstractSoapInterceptor;
import org.apache.cxf.databinding.DataBinding;
import org.apache.cxf.headers.Header;
import org.apache.cxf.interceptor.Fault;
import org.apache.cxf.jaxb.JAXBDataBinding;
import org.apache.cxf.phase.Phase;
import org.springframework.stereotype.Component;

@Component
public class LicenseOutInterceptor extends AbstractSoapInterceptor{
    public LicenseOutInterceptor(){
        super(Phase.WRITE);
    }

    @Override
    public void handleMessage(SoapMessage message) throws Fault {
        QName qname = new QName("https://www.xuanyuv.com/", "licenseInfo", "ns");
        DataBinding dataBinding = null;
        try {
            dataBinding = new JAXBDataBinding(String.class);
        } catch (JAXBException e) {
            e.printStackTrace();
        }
        Header header = new Header(qname, "Xuanyu", dataBinding);
        message.getHeaders().add(header);
    }
}
```

下面是客户端模拟的一个Service实现类`ClientService.java`

```java
package com.xuanyuv.service;
import javax.annotation.Resource;
import net.csdn.blog.xuanyuv.HelloService;
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
    xmlns:cxf="http://cxf.apache.org/core"
    xmlns:jaxws="http://cxf.apache.org/jaxws"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
                        http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
                        http://www.springframework.org/schema/context
                        http://www.springframework.org/schema/context/spring-context-2.5.xsd
                        http://cxf.apache.org/core
                        http://cxf.apache.org/schemas/core.xsd
                        http://cxf.apache.org/jaxws
                        http://cxf.apache.org/schemas/jaxws.xsd">
    <context:component-scan base-package="com.xuanyuv"/>

    <import resource="classpath:META-INF/cxf/cxf.xml"/>
    <import resource="classpath:META-INF/cxf/cxf-extension-soap.xml"/>
    <import resource="classpath:META-INF/cxf/cxf-servlet.xml"/>

    <jaxws:client id="myServerWebService" serviceClass="net.csdn.blog.xuanyuv.HelloService"
        address="http://127.0.0.1:8088/cxf_04_spring/services/myHello"/>

    <cxf:bus>
        <cxf:inInterceptors>
            <bean class="org.apache.cxf.interceptor.LoggingInInterceptor"/>
        </cxf:inInterceptors>
        <cxf:outInterceptors>
            <bean class="org.apache.cxf.interceptor.LoggingOutInterceptor"/>
            <ref bean="licenseOutInterceptor"/>
        </cxf:outInterceptors>
    </cxf:bus>
</beans>
```

最后是通过`CXF提供的wsdl2java`生成的，用于演示调用服务端的`ClientApp.Java`

关于`wsdl2java`的用法，可参考[https://www.xuanyuv.com/2013/05/31/cxf-demo/](https://www.xuanyuv.com/2013/05/31/cxf-demo/)

```java
package com.xuanyuv.client;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import com.xuanyuv.service.ClientService;

//wsdl2java -d D:/Download/ -frontend jaxws21 -keep -verbose http://127.0.0.1:8088/myHelloService?wsdl
//wsdl2java命令与wsimport相似，wsimport简介详见https://www.xuanyuv.com/2013/03/19/jaxws-and-wsimport-demo/
public class ClientApp {
    public static void main(String[] args) {
        ApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
        ClientService cs = (ClientService)ctx.getBean("clientService");
        System.out.println(cs.getServerResponse("玄玉"));
    }
}
```

## 控制台输出

这是服务端的控制台输出

```
2013-5-31 23:26:08 org.apache.cxf.services.HelloServiceImplService.HelloServiceImplPort.HelloService
信息: Inbound Message
----------------------------
ID: 1
Address: http://127.0.0.1:8088/cxf_04_spring/services/myHello
Encoding: UTF-8
Http-Method: POST
Content-Type: text/xml; charset=UTF-8
Headers: {Accept=[*/*], cache-control=[no-cache], connection=[keep-alive], Content-Length=[302], content-type=[text/xml; charset=UTF-8], host=[127.0.0.1:8088], pragma=[no-cache], SOAPAction=[""], user-agent=[Apache CXF 2.7.0]}
Payload: <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Header><ns:licenseInfo xmlns:ns="https://www.xuanyuv.com/">Xuanyu</ns:licenseInfo></soap:Header><soap:Body><ns2:sayHello xmlns:ns2="https://www.xuanyuv.com/"><name>玄玉</name></ns2:sayHello></soap:Body></soap:Envelope>
--------------------------------------
Receive the name=[玄玉]
Receive the licenseInfo=[Xuanyu]
2013-5-31 23:26:08 org.apache.cxf.services.HelloServiceImplService.HelloServiceImplPort.HelloService
信息: Outbound Message
---------------------------
ID: 1
Encoding: UTF-8
Content-Type: text/xml
Headers: {}
Payload: <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ns2:sayHelloResponse xmlns:ns2="https://www.xuanyuv.com/"><sayHelloResult>Hello,玄玉</sayHelloResult></ns2:sayHelloResponse></soap:Body></soap:Envelope>
--------------------------------------
```

这是客户端的控制台输出

```
2013-5-31 23:26:08 org.apache.cxf.services.HelloServiceService.HelloServicePort.HelloService
信息: Outbound Message
---------------------------
ID: 1
Address: http://127.0.0.1:8088/cxf_04_spring/services/myHello
Encoding: UTF-8
Http-Method: POST
Content-Type: text/xml
Headers: {Accept=[*/*], SOAPAction=[""]}
Payload: <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Header><ns:licenseInfo xmlns:ns="https://www.xuanyuv.com/">Xuanyuv</ns:licenseInfo></soap:Header><soap:Body><ns2:sayHello xmlns:ns2="https://www.xuanyuv.com/"><name>玄玉</name></ns2:sayHello></soap:Body></soap:Envelope>
--------------------------------------
2013-5-31 23:26:08 org.apache.cxf.services.HelloServiceService.HelloServicePort.HelloService
信息: Inbound Message
----------------------------
ID: 1
Response-Code: 200
Encoding: UTF-8
Content-Type: text/xml;charset=UTF-8
Headers: {content-type=[text/xml;charset=UTF-8], Date=[Fri, 31 May 2013 15:26:08 GMT], Server=[Apache-Coyote/1.1], transfer-encoding=[chunked]}
Payload: <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ns2:sayHelloResponse xmlns:ns2="https://www.xuanyuv.com/"><sayHelloResult>Hello,玄玉</sayHelloResult></ns2:sayHelloResponse></soap:Body></soap:Envelope>
--------------------------------------
Hello,玄玉
```