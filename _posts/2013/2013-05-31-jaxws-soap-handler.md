---
layout: post
title: "JAX-WS之SOAP异常处理和Handler处理"
categories: WebServices
tags: WebServices jax-ws handler
author: 玄玉
excerpt: 介绍在JAX-WS里面如果处理SOAP异常，以及编写Handler的方式。
---

* content
{:toc}


## 服务端

首先是`SEI`，即服务端接口类`HelloService.Java`

```java
package com.xuanyuv.service;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;
import com.xuanyuv.exception.UserException;

@WebService(targetNamespace="https://www.xuanyuv.com/")
public interface HelloService {
    @WebResult(name="sayHelloResult")
    public String sayHello(@WebParam(name="name")String name);

    @WebResult(name="loginResult")
    public String login(@WebParam(name="username")String username,
                        @WebParam(name="password")String password) throws UserException;
}
```

下面是`SIB`，即服务端接口实现类`HelloServiceImpl.java`

```java
package com.xuanyuv.service;
import javax.jws.HandlerChain;
import javax.jws.WebService;
import com.xuanyuv.exception.UserException;

@WebService(endpointInterface="com.xuanyuv.service.HelloService", targetNamespace="https://www.xuanyuv.com/")
@HandlerChain(file="myHandlerChain.xml")
public class HelloServiceImpl implements HelloService {
    @Override
    public String sayHello(String name) {
        System.out.println("Receive the name=[" + name + "]......");
        if(null==name){
            return "Hello,World";
        }else{
            return "Hello," + name;
        }
    }

    @Override
    public String login(String username, String password) throws UserException {
        System.out.println("Receive the username=[" + username + "],password=[" + password + "]......");
        if("admin".equals(username) && "hongyu".equals(password)){
            return "用户[" + username + "]认证通过";
        }
        throw new UserException("用户[" + username + "]认证未通过");
    }
}
```

下面是自定义的服务端异常类`UserException.java`

```java
package com.xuanyuv.exception;

//这里不要用RuntimeException
//因为RuntimeException会导致服务端在抛异常给客户端时,服务端自身也会抛相同的异常
//所以WebServices开发中定义异常时要注意这一点
public class UserException extends Exception {
    private static final long serialVersionUID = 6252203957834273236L;

    public UserException() {
        super();
    }

    public UserException(String message) {
        super(message);
    }
}
```

下面是自定义的服务端Handler类`LicenseHandler.java`

```java
package com.xuanyuv.handler;
import java.util.Iterator;
import java.util.Set;
import javax.xml.namespace.QName;
import javax.xml.soap.SOAPBody;
import javax.xml.soap.SOAPEnvelope;
import javax.xml.soap.SOAPException;
import javax.xml.soap.SOAPFault;
import javax.xml.soap.SOAPHeader;
import javax.xml.soap.SOAPHeaderElement;
import javax.xml.soap.SOAPMessage;
import javax.xml.ws.handler.MessageContext;
import javax.xml.ws.handler.soap.SOAPHandler;
import javax.xml.ws.handler.soap.SOAPMessageContext;
import javax.xml.ws.soap.SOAPFaultException;

/**
 * Handler编写步骤
 * 1)创建一个实现了SOAPHandler<SOAPMessageContext>的类
 * 2)在handleMessage()方法中编写代码
 * 3)配置Handler,自定义一个名字随意的xml
 * 4)在服务上启动过滤链
 *   在服务端或者客户端的Service实现类上使用@HandlerChain(file="myHandlerChain.xml")即可
 * Created by 玄玉<https://www.xuanyuv.com/> on 2013/05/17 12:07.
 */
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
        //从服务端角度看:inbound表示接收客户端消息,outbound表示响应消息给客户端..从客户端角度看时正好与之相反
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
        if(!"login".equals(partName)){
            return true;
        }

        if(null==header){
            System.out.println("未找到头信息......");
            this.throwHeaderInvalid(body, "未找到头信息......");
        }
        Iterator<SOAPHeaderElement> iterator = header.extractAllHeaderElements();
        if(!iterator.hasNext()){
            System.out.println("头信息不能为空......");
            this.throwHeaderInvalid(body, "头信息不能为空");
        }

        System.out.println("协议有效......");
        while(iterator.hasNext()){
            System.out.println(iterator.next().getTextContent());
        }
        return true;
    }


    private void throwHeaderInvalid(SOAPBody body, String causeInfo){
        try {
            //添加一个错误信息
            SOAPFault fault = body.addFault();
            fault.setFaultString("协议无效:" + causeInfo);
            throw new SOAPFaultException(fault);
        } catch (SOAPException e) {
            e.printStackTrace();
        }
    }
}
```

接下来是用于配置Handler的`myHandlerChain.xml`

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<javaee:handler-chains xmlns:javaee="http://java.sun.com/xml/ns/javaee" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <javaee:handler-chain>
        <javaee:handler>
            <javaee:handler-class>com.xuanyuv.handler.LicenseHandler</javaee:handler-class>
        </javaee:handler>
    </javaee:handler-chain>
</javaee:handler-chains>
```

最后是发布WebService服务的`ServerApp.java`

```java
package com.xuanyuv.server;
import javax.xml.ws.Endpoint;
import com.xuanyuv.service.HelloServiceImpl;

/**
 * SOAP异常处理和Handler处理
 * ---------------------------------------------------------------------------------------------------
 * 手工指定命名空间时,建议在SEI和SIB都使用@WebService注解，如下所示
 * @WebService(targetNamespace="https://www.xuanyuv.com/")
 * ---------------------------------------------------------------------------------------------------
 * 通过Handler处理SOAP消息(Handler类似于过滤器，它分为SOAPHandler和LogicalHandler)
 * SOAPHandler-----可以获取SOAPMessage信息
 * LogicalHandler--只能获取SOAPBody信息
 * 客户端发出的消息始终都是LogicalHandler先处理，然后才是SOAPHandler处理，服务器端的消息处理顺序则与之相反
 * ---------------------------------------------------------------------------------------------------
 * Created by 玄玉<https://www.xuanyuv.com/> on 2013/05/16 18:14.
 */
public class ServerApp {
    public static void main(String[] args) {
        Endpoint.publish("http://127.0.0.1:8888/myHelloService", new HelloServiceImpl());
    }
}
```

**服务端代码发布完毕**

## 客户端

首先是客户端自定义的Handler类`HeaderHandler.java`

```java
package com.xuanyuv.handler;
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
                String partName = envelope.getBody().getChildNodes().item(0).getLocalName();
                //System.out.println("------------------------------------");
                //NodeList nan = envelope.getBody().getChildNodes();
                //System.out.println("nan.getLength()=" + nan.getLength());
                //for(int i=0; i<nan.getLength(); i++){
                //    System.out.println(nan.item(i).getLocalName());
                //}
                //System.out.println("------------------------------------");
                //只在访问服务端login()方法时才加头信息
                if("login".equals(partName)){
                    if(null == header){
                        header = envelope.addHeader();
                    }
                    QName qname = new QName("https://www.xuanyuv.com/", "licenseInfo", "ns");
                    header.addHeaderElement(qname).setValue("Xuanyu");
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

下面是用于配置客户端Handler的`myHandlerChain.xml`

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<javaee:handler-chains xmlns:javaee="http://java.sun.com/xml/ns/javaee" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <javaee:handler-chain>
        <javaee:handler>
            <javaee:handler-class>com.xuanyuv.handler.HeaderHandler</javaee:handler-class>
        </javaee:handler>
    </javaee:handler-chain>
</javaee:handler-chains>
```

最后是客户端调用服务端代码

这里是由wsimport生成的，关于其用法，可参考<https://www.xuanyuv.com/blog/20130319/jaxws-and-wsimport-demo.html>

```java
package com.xuanyuv.client;
import javax.xml.ws.soap.SOAPFaultException;
import net.csdn.blog.xuanyuv.HelloService;
import net.csdn.blog.xuanyuv.HelloServiceImplService;
import net.csdn.blog.xuanyuv.UserException_Exception;

public class ClientApp {
    public static void main(String[] args) {
        HelloService server = new HelloServiceImplService().getHelloServiceImplPort();
        try {
            System.out.println(server.sayHello("玄玉"));
            System.out.println(server.login("admin", "hongyu"));
        } catch (UserException_Exception e) {
            //捕获服务端login()方法可能抛出的用户认证未通过的异常
            System.out.println("UserException:" + e.getMessage());
        } catch (SOAPFaultException e) {
            //捕获服务端可能抛出的SOAPHeader为空的异常
            System.out.println("SOAPFaultException:" + e.getMessage());
        }
    }
}
```

## 控制台输出

下面是服务端的控制台输出

```
Server.handleMessage() is invoked......
Receive the name=[玄玉]......
Server.handleMessage() is invoked......
Server.handleMessage() is invoked......
协议有效......
Xuanyu
Receive the username=[admin],password=[hongyu]......
Server.handleMessage() is invoked......
```

下面是客户端的控制台输出

```
Client.handleMessage() is invoked.....

Client.handleMessage() is invoked.....
Hello,玄玉

Client.handleMessage() is invoked.....
<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/"><S:Header><ns:licenseInfo xmlns:ns="https://www.xuanyuv.com/">Xuanyu</ns:licenseInfo></S:Header><S:Body><ns2:login xmlns:ns2="https://www.xuanyuv.com/"><username>admin</username><password>hongyu</password></ns2:login></S:Body></S:Envelope>
Client.handleMessage() is invoked.....
用户[admin]认证通过
```