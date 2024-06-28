---
layout: post
title: "CXF之使用Interceptor"
categories: WebServices
tags: WebServices cxf interceptor 拦截器
author: 玄玉
excerpt: 介绍Apache-CXF中的Interceptor的配置方法。
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

下面是服务端自定义的`Interceptor`实现类`LicenseInInterceptor.java`

```java
package com.xuanyuv.interceptor;
import java.util.List;
import org.apache.cxf.binding.soap.SoapMessage;
import org.apache.cxf.binding.soap.interceptor.AbstractSoapInterceptor;
import org.apache.cxf.headers.Header;
import org.apache.cxf.interceptor.Fault;
import org.apache.cxf.phase.Phase;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

/**
 * 自定义Interceptor
 * 1)自定义一个类，并继承AbstractSoapInterceptor
 * 2)显示声明该Interceptor的一个无参够构造方法，并在其中指明handleMessage()方法的调用阶段
 * Created by 玄玉<https://www.xuanyuv.com/> on 2013/05/28 21:05.
 */
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
                    Element element = (Element)obj;
                    Node usernameNode = element.getElementsByTagName("username").item(0);
                    Node passwordNode = element.getElementsByTagName("password").item(0);
                    //throw new Fault(new IllegalArgumentException("用户信息不能为空"));
                    System.out.println("Receive the username=[" + usernameNode.getTextContent() + "]");
                    System.out.println("Receive the password=[" + passwordNode.getTextContent() + "]");
                }
            }
        }
    }
}
```

最后是发布服务的`ServerApp.java`

```java
package com.xuanyuv.server;
import org.apache.cxf.interceptor.LoggingInInterceptor;
import org.apache.cxf.interceptor.LoggingOutInterceptor;
import org.apache.cxf.jaxws.JaxWsServerFactoryBean;
import com.xuanyuv.interceptor.LicenseInInterceptor;
import com.xuanyuv.service.HelloService;
import com.xuanyuv.service.HelloServiceImpl;

public class ServerApp {
    public static void main(String[] args) {
        JaxWsServerFactoryBean factory = new JaxWsServerFactoryBean();
        factory.setAddress("http://127.0.0.1:8088/myHelloService");
        factory.setServiceClass(HelloService.class);
        factory.setServiceBean(new HelloServiceImpl());

        //打印接收和响应的SOAP通信报文
        factory.getInInterceptors().add(new LoggingInInterceptor());
        factory.getOutInterceptors().add(new LoggingOutInterceptor());

        //也可以使用注解@InInterceptors(interceptors={"com.xuanyuv.interceptor.LicenseInInterceptor"})
        //经测试，作为服务端，可以将之注解到SEI或SIB上，均可
        //而客户端，则只有将之注解到SEI上时，才有效
        factory.getInInterceptors().add(new LicenseInInterceptor());
        factory.create();
    }
}
```

**至此，服务端代码示例完毕**

## 客户端

首先是客户端自定义的`Interceptor`实现类`LicenseOutInterceptor.java`

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
import com.xuanyuv.model.User;

public class LicenseOutInterceptor extends AbstractSoapInterceptor{
    public LicenseOutInterceptor(){
        super(Phase.WRITE);
    }

    @Override
    public void handleMessage(SoapMessage message) throws Fault {
        QName qname = new QName("https://www.xuanyuv.com/", "licenseInfo", "ns");
        DataBinding dataBinding = null;
        try {
            dataBinding = new JAXBDataBinding(User.class);
        } catch (JAXBException e) {
            e.printStackTrace();
        }
        Header header = new Header(qname, new User("Xuanyu", "hongyu"), dataBinding);
        message.getHeaders().add(header);
    }
}
```

下面是客户端用到的实体类`User.java`

```java
package com.xuanyuv.model;

public class User {
    private String username;
    private String password;

    /*两个属性的setter和getter略*/

    public User() {}
    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }
}
```

客户端只有一个用于演示调用服务端的`ClientApp.Java`

它是通过`CXF提供的wsdl2java`生成的，关于其用法，可参考<https://www.xuanyuv.com/blog/20130531/cxf-demo.html>

```java
package com.xuanyuv.client;
import net.csdn.blog.xuanyuv.HelloService;
import org.apache.cxf.interceptor.LoggingInInterceptor;
import org.apache.cxf.interceptor.LoggingOutInterceptor;
import org.apache.cxf.jaxws.JaxWsProxyFactoryBean;
import com.xuanyuv.interceptor.LicenseOutInterceptor;

//wsdl2java -d D:/Download/ -frontend jaxws21 -keep -verbose http://127.0.0.1:8088/myHelloService?wsdl
//wsdl2java命令与wsimport相似，wsimport简介详见https://www.xuanyuv.com/blog/20130319/jaxws-and-wsimport-demo.html
public class ClientApp {
    public static void main(String[] args) {
        JaxWsProxyFactoryBean factory = new JaxWsProxyFactoryBean();
        factory.setAddress("http://127.0.0.1:8088/myHelloService");
        factory.setServiceClass(HelloService.class);
        factory.getInInterceptors().add(new LoggingInInterceptor());
        factory.getOutInterceptors().add(new LoggingOutInterceptor());
        factory.getOutInterceptors().add(new LicenseOutInterceptor());
        HelloService hello = (HelloService)factory.create();
        System.out.println(hello.sayHello("玄玉"));
    }
}
```

## 控制台输出

这是服务端控制台输出

```
2013-5-31 22:45:15 org.apache.cxf.services.HelloServiceService.HelloServicePort.HelloService
信息: Inbound Message
----------------------------
ID: 1
Address: http://127.0.0.1:8088/myHelloService
Encoding: UTF-8
Http-Method: POST
Content-Type: text/xml; charset=UTF-8
Headers: {Accept=[*/*], Cache-Control=[no-cache], connection=[keep-alive], Content-Length=[350], content-type=[text/xml; charset=UTF-8], Host=[127.0.0.1:8088], Pragma=[no-cache], SOAPAction=[""], User-Agent=[Apache CXF 2.7.0]}
Payload: <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Header><ns:licenseInfo xmlns:ns="https://www.xuanyuv.com/"><password>hongyu</password><username>Xuanyu</username></ns:licenseInfo></soap:Header><soap:Body><ns2:sayHello xmlns:ns2="https://www.xuanyuv.com/"><name>玄玉</name></ns2:sayHello></soap:Body></soap:Envelope>
--------------------------------------
Receive the name=[玄玉]
Receive the username=[Xuanyu]
Receive the password=[hongyu]
2013-5-31 22:45:15 org.apache.cxf.services.HelloServiceService.HelloServicePort.HelloService
信息: Outbound Message
---------------------------
ID: 1
Encoding: UTF-8
Content-Type: text/xml
Headers: {}
Payload: <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ns2:sayHelloResponse xmlns:ns2="https://www.xuanyuv.com/"><sayHelloResult>Hello,玄玉</sayHelloResult></ns2:sayHelloResponse></soap:Body></soap:Envelope>
--------------------------------------
```

这是客户端控制台输出

```
2013-5-31 22:45:14 org.apache.cxf.service.factory.ReflectionServiceFactoryBean buildServiceFromClass
信息: Creating Service {https://www.xuanyuv.com/}HelloServiceService from class net.csdn.blog.xuanyuv.HelloService
2013-5-31 22:45:15 org.apache.cxf.services.HelloServiceService.HelloServicePort.HelloService
信息: Outbound Message
---------------------------
ID: 1
Address: http://127.0.0.1:8088/myHelloService
Encoding: UTF-8
Http-Method: POST
Content-Type: text/xml
Headers: {Accept=[*/*], SOAPAction=[""]}
Payload: <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Header><ns:licenseInfo xmlns:ns="https://www.xuanyuv.com/"><password>hongyu</password><username>Xuanyu</username></ns:licenseInfo></soap:Header><soap:Body><ns2:sayHello xmlns:ns2="https://www.xuanyuv.com/"><name>玄玉</name></ns2:sayHello></soap:Body></soap:Envelope>
--------------------------------------
2013-5-31 22:45:15 org.apache.cxf.services.HelloServiceService.HelloServicePort.HelloService
信息: Inbound Message
----------------------------
ID: 1
Response-Code: 200
Encoding: UTF-8
Content-Type: text/xml;charset=UTF-8
Headers: {content-type=[text/xml;charset=UTF-8], Server=[Jetty(8.1.7.v20120910)], transfer-encoding=[chunked]}
Payload: <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ns2:sayHelloResponse xmlns:ns2="https://www.xuanyuv.com/"><sayHelloResult>Hello,玄玉</sayHelloResult></ns2:sayHelloResponse></soap:Body></soap:Envelope>
--------------------------------------
Hello,玄玉
```