---
layout: post
title: "JAX-WS之借助SAAJ创建SOAP消息"
categories: JAX-WS
tags: saaj message payload
author: 玄玉
excerpt: 介绍JAX-WS中借助saaj的方式创建，以及发送SOAP消息给WebService服务端。
---

* content
{:toc}


## 服务端

首先是`SEI`，即服务端接口类`HelloService.Java`

```java
package com.jadyer.service;
import java.util.List;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;
import com.jadyer.model.User;

@WebService
public interface HelloService {
    @WebResult(name="loginResult")
    public String login(@WebParam(name="username")String username, @WebParam(name="password")String password);

    //这里之所以把返回值和参数名都定义为user
    //是为了生成的soap请求消息和响应消息都是<user><id>...</id></user>样子的有规律的xml
    //这样我们就可以很方便的使用JAXB来把消息转成JavaBean
    @WebResult(name="user")
    public User addUser(@WebParam(name="user")User user);

    @WebResult(name="user")
    public List<User> list();
}
```

然后是`SIB`，即服务端接口实现类`HelloServiceImpl.java`

```java
package com.jadyer.service;
import java.util.ArrayList;
import java.util.List;
import javax.jws.WebService;
import com.jadyer.model.User;

@WebService(endpointInterface="com.jadyer.service.HelloService")
public class HelloServiceImpl implements HelloService {
    //模拟一个位于内存中的小仓库
    private static List<User> users = new ArrayList<User>();

    //初始化一个用户
    public HelloServiceImpl(){
        users.add(new User(1, "admin", "管理员", "222222"));
    }

    @Override
    public String login(String username, String password) {
        System.out.println("login() is invoked......");
        for(User user : users){
            if(user.getUsername().equals(username) && user.getPassword().equals(password)){
                return "用户[" + username + "]登录成功";
            }
        }
        return "用户[" + username + "]登录失败";
    }

    @Override
    public User addUser(User user) {
        System.out.println("addUser() is invoked......");
        users.add(user);
        return user;
    }

    @Override
    public List<User> list() {
        System.out.println("list() is invoked......");
        return users;
    }
}
```

下面是服务端用到的映射XML的实体类`User.java`

```java
package com.jadyer.model;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class User {
    private int id;
    private String username;
    private String nickname;
    private String password;

    /*四个属性的setter和getter略*/

    public User() {}

    public User(int id, String username, String nickname, String password) {
        this.id = id;
        this.username = username;
        this.nickname = nickname;
        this.password = password;
    }
}
```

最后是用于发布服务的`MainApp.java`

```java
package com.jadyer.server;
import javax.xml.ws.Endpoint;
import com.jadyer.service.HelloServiceImpl;

public class MainApp {
    public static void main(String[] args) {
        Endpoint.publish("http://127.0.0.1:8888/myHelloService", new HelloServiceImpl());
    }
}
```

**至此服务端发布完毕**

## 客户端

下面是借助`SAAJ`编写客户端的演示

```java
package com.jadyer.client;
import java.io.StringReader;
import java.io.StringWriter;
import java.net.URL;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;
import javax.xml.namespace.QName;
import javax.xml.soap.MessageFactory;
import javax.xml.soap.SOAPBody;
import javax.xml.soap.SOAPBodyElement;
import javax.xml.soap.SOAPEnvelope;
import javax.xml.soap.SOAPMessage;
import javax.xml.soap.SOAPPart;
import javax.xml.transform.Source;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMResult;
import javax.xml.transform.stream.StreamSource;
import javax.xml.ws.Dispatch;
import javax.xml.ws.Service;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import com.jadyer.model.User;

/**
 * 借助SAAJ创建SOAP消息并访问服务
 * @see SAAJ(SOAP with Attachments API for Java)是JAXM(Java API for XML Messaging)的一个分支
 * @see ----------------------------------------------------------------------------------------------
 * @see Web服务的基础是以标准格式发送和接收消息,这种标准格式是SOAP
 * @see 使用SAAJ可以手工生成SOAP消息,并发送给服务端,同样可以接收服务端响应
 * @see ----------------------------------------------------------------------------------------------
 * @see 这里推荐一个WebServices必用的一个免费工具soapUI(http://www.soapui.org/)
 * @see 通过它new一个soapUI Project后,我们可以清晰的看到需要发送的SOAP消息和响应的SOAP消息格式
 * @see 这对于理解本文,有莫大的帮助..类似的还有Apache的TCPMon(http://ws.apache.org/commons/tcpmon/)
 * @see ----------------------------------------------------------------------------------------------
 * @create Mar 18, 2013 2:47:18 PM
 * @author 玄玉<https://jadyer.github.io/>
 */
public class TestSAAJ {
    //Web服务端公布的服务地址
    private static String wsdlURL = "http://127.0.0.1:8888/myHelloService?wsdl";
    //取自WSDL文件顶部的<definitions targetNamespace="">的值
    private static String nameSpace = "http://service.jadyer.com/";

    /**
     * 以MESSAGE方式与Web服务交互SOAP消息
     * @see 这里请求的是Web服务端login()方法
     * @see ---------------------------------------------------------------------------------
     * @see 下面是请求的SOAP消息
     * @see <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
     * @see     <SOAP-ENV:Header />
     * @see     <SOAP-ENV:Body>
     * @see         <nn:login xmlns:nn="http://service.jadyer.com/">
     * @see             <username>admin</username>
     * @see             <password>222222</password>
     * @see         </nn:login>
     * @see     </SOAP-ENV:Body>
     * @see </SOAP-ENV:Envelope>
     * @see ---------------------------------------------------------------------------------
     * @see 下面是响应的SOAP消息
     * @see <S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
     * @see     <S:Header />
     * @see     <S:Body>
     * @see         <ns2:loginResponse xmlns:ns2="http://service.jadyer.com/">
     * @see             <loginResult>用户[admin]登录成功</loginResult>
     * @see         </ns2:loginResponse>
     * @see     </S:Body>
     * @see </S:Envelope>
     * @see ---------------------------------------------------------------------------------
     */
    private static void sendRequesetBySOAPMessage() throws Exception{
        /**
         * 获取SOAPBody
         */
        //通过消息工厂创建SoapMessage
        SOAPMessage message = MessageFactory.newInstance().createMessage();
        //创建SOAPPart
        SOAPPart part = message.getSOAPPart();
        //获取SOAPEnvelope(即信封)
        SOAPEnvelope envelope = part.getEnvelope();
        //通过SOAPEnvelope获取相应的Body和Header
        //这里不建议使用SOAPMessage.getSOAPHeader()或者SOAPMessage.getSOAPBody()获取Header和Body
        //因为SOAPMessage并没有提供addHeader()或者addBody()方法,不便于我们手工添加Header等等
        SOAPBody body = envelope.getBody();
        /**
         * 构造SOAPMessage
         */
        //根据QName创建相应的节点
        //这里的QName就是一个带有命名空间的节点,需要的三个参数分别'命名空间'--'请求Web服务的方法名'--'自定义的前缀'
        //那么,在这里它会创建出--><nn:login xmlns:nn="http://service.jadyer.com/">
        QName qname = new QName(nameSpace, "login", "nn");
        //下面指定消息所传递的数据
        //如果直接这么写-->body.addBodyElement(qname).setValue("<a>11</a><b>22</b>");
        //那么发出去的<>会被转换为<和>,显然这不是我们所期望的,所以要使用addChildElement()
        SOAPBodyElement sbe = body.addBodyElement(qname);
        //这里输入的"username"就是Web服务端定义的login()方法的参数名称
        sbe.addChildElement("username").setValue("admin");
        sbe.addChildElement("password").setValue("222222");
        //打印请求消息到控制台
        message.writeTo(System.out);
        /**
         * 通过Dispatch传递SOAPMessage
         */
        //创建服务(这里QName的两个参数分别为WSDL文件顶部的<definitions targetNamespace="" name="">的值)
        //其中name属性值为公开的Web服务的接口实现类加上"Service",也是我们这里要传递的new QName()第二个参数
        Service service = Service.create(new URL(wsdlURL), new QName(nameSpace, "HelloServiceImplService"));
        //创建Dispatch
        //第一个参数:WSDL中<servcie><port name="">的name值,即HelloServiceImplPort,注意指明的命名空间,否则它不认识
        //第二个参数:指明存放数据的类型,我们这里是SOAPMessage.class
        //第三个参数:指明用户使用完整的协议消息还是消息负载,当类型为SOAPMessage时,模式必须为MESSAGE
        //其实第三个参数MESSAGE指的就是要把消息格式化成XML再进行传递,还有一种传递类型是PAYLOAD
        //PAYLOAD指的是通过负载的方式进行传递,换言之,是对一种编好码的数据进行传递,它会自动对字符串进行编码
        //所以PAYLOAD适用于自己组装字符串作为请求消息进行传递
        Dispatch<SOAPMessage> dispatch = service.createDispatch(new QName(nameSpace, "HelloServiceImplPort"), SOAPMessage.class, Service.Mode.MESSAGE);
        //通过Dispatch.invoke(SOAPMessage)方法发送请求消息,其返回值为Web服务端响应的消息
        SOAPMessage respMsg = dispatch.invoke(message);
        System.out.println("\n发起请求:invoking......");
        //打印响应消息到控制台
        respMsg.writeTo(System.out);
        /**
         * 转换响应消息为DOM对象
         */
        Document doc = respMsg.getSOAPPart().getEnvelope().getBody().extractContentAsDocument();
        //这里输入的"loginResult"就是Web服务端定义的login()方法的返回值名称
        System.out.println("\n收到响应:" + doc.getElementsByTagName("loginResult").item(0).getTextContent());
    }

    /**
     * 以MESSAGE方式与Web服务交互SOAP消息
     * @see 这里请求的是Web服务端list()方法
     */
    private static void sendRequesetBySOAPMessageForList() throws Exception{
        SOAPMessage message = MessageFactory.newInstance().createMessage();
        SOAPBody body = message.getSOAPPart().getEnvelope().getBody();
        //list()方法无参就不需要addChildElement了
        body.addBodyElement(new QName(nameSpace, "list", "nn"));
        //打印请求消息到控制台
        message.writeTo(System.out);
        Service service = Service.create(new URL(wsdlURL), new QName(nameSpace, "HelloServiceImplService"));
        Dispatch<SOAPMessage> dispatch = service.createDispatch(new QName(nameSpace, "HelloServiceImplPort"), SOAPMessage.class, Service.Mode.MESSAGE);
        SOAPMessage respMsg = dispatch.invoke(message);
        System.out.println("");
        //打印响应消息到控制台
        respMsg.writeTo(System.out);
        Document doc = respMsg.getSOAPPart().getEnvelope().getBody().extractContentAsDocument();
        NodeList nodes = doc.getElementsByTagName("user");
        for(int i=0; i<nodes.getLength(); i++){
            //JAXB反编排(直接让它来处理org.w3c.dom.Node)
            Unmarshaller unMarshaller = JAXBContext.newInstance(User.class).createUnmarshaller();
            User respUser = (User)unMarshaller.unmarshal(nodes.item(i));
            System.out.println("\n收到响应:" + respUser.getUsername());
            System.out.println("收到响应:" + respUser.getNickname());
            System.out.println("收到响应:" + respUser.getPassword());
        }
    }

    /**
     * 以PAYLOAD方式与Web服务交互SOAP消息
     * @see 这里请求的是Web服务端addUser()方法
     */
    private static void sendRequesetByPAYLOAD() throws Exception{
        //JAXB编排
        User user = new User(3, "hongyu", "玄玉", "888888");
        Marshaller marshaller = JAXBContext.newInstance(User.class).createMarshaller();
        //该值默认为false,true则不会创建即头信息,即<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        marshaller.setProperty(Marshaller.JAXB_FRAGMENT, true);
        StringWriter writer = new StringWriter();
        marshaller.marshal(user, writer);
        //拼装addUser()方法的SOAP消息的Body内容,即<nn:addUser xmlns="......"/>
        String payLoad = "<nn:addUser xmlns:nn=\""+nameSpace+"\">"+writer.toString()+"</nn:addUser>";
        System.out.println("拼装完毕:" + payLoad);
        //通过Dispatch传递payLoad
        Service service = Service.create(new URL(wsdlURL),new QName(nameSpace,"HelloServiceImplService"));
        Dispatch<Source> dispatch = service.createDispatch(new QName(nameSpace, "HelloServiceImplPort"), Source.class, Service.Mode.PAYLOAD);
        Source response = dispatch.invoke(new StreamSource(new StringReader(payLoad)));
        //处理响应信息(利用Transformer对象将响应的Source转换为DOM)
        DOMResult domResult = new DOMResult();
        TransformerFactory.newInstance().newTransformer().transform(response, domResult);
        XPath xpath = XPathFactory.newInstance().newXPath();
        NodeList nodes = (NodeList)xpath.evaluate("//user", domResult.getNode(), XPathConstants.NODESET);
        //JAXB反编排(直接让它来处理org.w3c.dom.Node)
        Unmarshaller unMarshaller = JAXBContext.newInstance(User.class).createUnmarshaller();
        User respUser = (User)unMarshaller.unmarshal(nodes.item(0));
        System.out.println("收到响应:" + respUser.getUsername());
        System.out.println("收到响应:" + respUser.getNickname());
        System.out.println("收到响应:" + respUser.getPassword());
    }

    /**
     * SAAJ测试
     */
    public static void main(String[] args) throws Exception {
        sendRequesetBySOAPMessage();
        System.out.println("---------------------------------------------------------------------------");
        sendRequesetByPAYLOAD();
        System.out.println("---------------------------------------------------------------------------");
        sendRequesetBySOAPMessageForList();
    }
}
```

## 控制台输出

```
2013-3-28 23:00:13 com.sun.xml.internal.ws.model.RuntimeModeler getRequestWrapperClass
信息: Dynamically creating request wrapper Class com.jadyer.service.jaxws.List
2013-3-28 23:00:13 com.sun.xml.internal.ws.model.RuntimeModeler getResponseWrapperClass
信息: Dynamically creating response wrapper bean Class com.jadyer.service.jaxws.ListResponse
2013-3-28 23:00:13 com.sun.xml.internal.ws.model.RuntimeModeler getRequestWrapperClass
信息: Dynamically creating request wrapper Class com.jadyer.service.jaxws.Login
2013-3-28 23:00:13 com.sun.xml.internal.ws.model.RuntimeModeler getResponseWrapperClass
信息: Dynamically creating response wrapper bean Class com.jadyer.service.jaxws.LoginResponse
2013-3-28 23:00:13 com.sun.xml.internal.ws.model.RuntimeModeler getRequestWrapperClass
信息: Dynamically creating request wrapper Class com.jadyer.service.jaxws.AddUser
2013-3-28 23:00:13 com.sun.xml.internal.ws.model.RuntimeModeler getResponseWrapperClass
信息: Dynamically creating response wrapper bean Class com.jadyer.service.jaxws.AddUserResponse
login() is invoked......
addUser() is invoked......
list() is invoked......
```

```
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"><SOAP-ENV:Header/><SOAP-ENV:Body><nn:login xmlns:nn="http://service.jadyer.com/"><username>admin</username><password>222222</password></nn:login></SOAP-ENV:Body></SOAP-ENV:Envelope>
发起请求:invoking......
<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/"><S:Header/><S:Body><ns2:loginResponse xmlns:ns2="http://service.jadyer.com/"><loginResult>用户[admin]登录成功</loginResult></ns2:loginResponse></S:Body></S:Envelope>
收到响应:用户[admin]登录成功
---------------------------------------------------------------------------
拼装完毕:<nn:addUser xmlns:nn="http://service.jadyer.com/"><user><id>3</id><nickname>玄玉</nickname><password>888888</password><username>hongyu</username></user></nn:addUser>
收到响应:hongyu
收到响应:玄玉
收到响应:888888
---------------------------------------------------------------------------
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"><SOAP-ENV:Header/><SOAP-ENV:Body><nn:list xmlns:nn="http://service.jadyer.com/"/></SOAP-ENV:Body></SOAP-ENV:Envelope>
<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/"><S:Header/><S:Body><ns2:listResponse xmlns:ns2="http://service.jadyer.com/"><user><id>1</id><nickname>管理员</nickname><password>222222</password><username>admin</username></user><user><id>3</id><nickname>玄玉</nickname><password>888888</password><username>hongyu</username></user></ns2:listResponse></S:Body></S:Envelope>
收到响应:admin
收到响应:管理员
收到响应:222222

收到响应:hongyu
收到响应:玄玉
收到响应:888888
```