---
layout: post
title: "CXF之契约优先及隐式声明头信息"
categories: CXF
tags: cxf xml
author: 玄玉
excerpt: 介绍Apache-CXF中通过手工编写XML的方式定义WSDL的各种细节，以及隐式声明头信息的用法。
---

* content
{:toc}


其实它与JAX-WS的契约优先开发方式基本相同，详见[https://jadyer.github.io/2013/05/31/jaxws-build-wsdl-with-wrapped/](https://jadyer.github.io/2013/05/31/jaxws-build-wsdl-with-wrapped/)

不同的地方是：这种方式下，CXF发布的时候要加两个参数而已

即便如此，还是老习惯：贴代码

## 服务端

首先是用于定义元素类型的`//src//META-INF//calculator.xsd`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    targetNamespace="http://blog.csdn.net/jadyer"
    xmlns:tns="http://blog.csdn.net/jadyer"
    elementFormDefault="unqualified">
    <xsd:element name="add" type="tns:add"/>
    <xsd:element name="addResponse" type="tns:addResponse"/>
    <xsd:element name="licenseUser" type="tns:user"/>
    <xsd:complexType name="add">
        <xsd:sequence>
            <xsd:element name="a" type="xsd:int"/>
            <xsd:element name="b" type="xsd:int"/>
        </xsd:sequence>
    </xsd:complexType>
    <xsd:complexType name="addResponse">
        <xsd:sequence>
            <xsd:element name="addResult" type="xsd:int"/>
        </xsd:sequence>
    </xsd:complexType>
    <xsd:complexType name="user">
        <xsd:sequence>
            <xsd:element name="username" type="xsd:string"/>
            <xsd:element name="password" type="xsd:string"/>
        </xsd:sequence>
    </xsd:complexType>
</xsd:schema>
```

接下来是我们自己编写的`//src//META-INF//myCalculator.wsdl`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<wsdl:definitions xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:tns="http://blog.csdn.net/jadyer"
    targetNamespace="http://blog.csdn.net/jadyer"
    name="CalculatorServiceImpl">
    <wsdl:types>
        <xsd:schema targetNamespace="http://blog.csdn.net/jadyer">
            <xsd:include schemaLocation="calculator.xsd"/>
        </xsd:schema>
    </wsdl:types>

    <wsdl:message name="add">
        <wsdl:part name="add" element="tns:add"/>
    </wsdl:message>
    <wsdl:message name="addResponse">
        <wsdl:part name="addResponse" element="tns:addResponse"/>
    </wsdl:message>
    <wsdl:message name="licenseUser">
        <wsdl:part name="licenseUser" element="tns:licenseUser"/>
    </wsdl:message>

    <wsdl:portType name="CalculatorService">
        <wsdl:operation name="add">
            <wsdl:input message="tns:add"/>
            <wsdl:output message="tns:addResponse"/>
        </wsdl:operation>
    </wsdl:portType>

    <wsdl:binding name="CalculatorServiceImplPortBinding" type="tns:CalculatorService">
        <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
        <wsdl:operation name="add">
            <wsdl:input>
                <soap:body use="literal"/>
                <soap:header use="literal" part="licenseUser" message="tns:licenseUser"/>
            </wsdl:input>
            <wsdl:output>
                <soap:body use="literal"/>
            </wsdl:output>
        </wsdl:operation>
    </wsdl:binding>

    <wsdl:service name="CalculatorServiceImpl">
        <wsdl:port binding="tns:CalculatorServiceImplPortBinding" name="CalculatorServiceImplPort">
            <soap:address location="http://127.0.0.1:8088/myCalculatorService"/>
        </wsdl:port>
    </wsdl:service>
</wsdl:definitions>
```

下面是`SIB`，即服务端接口实现类`CalculatorServiceImpl.java`

```java
package net.csdn.blog.jadyer;
import javax.jws.WebService;
import com.jadyer.model.User;

@WebService(serviceName="CalculatorServiceImpl",
            wsdlLocation="META-INF/myCalculator.wsdl",
            endpointInterface="net.csdn.blog.jadyer.CalculatorService",
            targetNamespace="http://blog.csdn.net/jadyer")
public class CalculatorServiceImpl implements CalculatorService {
    @Override
    public int add(int a, int b, User licenseUser) {
        if(null != licenseUser){
            System.out.println("Receive the username=[" + licenseUser.getUsername() + "]");
            System.out.println("Receive the password=[" + licenseUser.getPassword() + "]");
        }
        System.out.println(a + "+" + b + "=" + (a+b));
        return a+b;
    }
}
```

这是服务端用到的一个实体类`User.java`

```java
package com.jadyer.model;

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

最后是发布服务的`ServerApp.java`

```java
package com.jadyer.server;
import javax.xml.namespace.QName;
import net.csdn.blog.jadyer.CalculatorService;
import net.csdn.blog.jadyer.CalculatorServiceImpl;
import org.apache.cxf.interceptor.LoggingInInterceptor;
import org.apache.cxf.interceptor.LoggingOutInterceptor;
import org.apache.cxf.jaxws.JaxWsServerFactoryBean;

/**
 * CXF中的契约优先方式开发及隐式声明头信息
 * -----------------------------------------------------------------------------------------------------
 * 开发流程
 * 1)创建并编写\\src\\META-INF\\calculator.xsd和myCalculator.wsdl文件
 * 2)根据wsdl生成服务端代码(wsdl2java -d D:/Download/ -frontend jaxws21 -keep -verbose myCalculator.wsdl)
 *   它会生成很多的代码,而作为服务端,只需保留SEI即可............如果是客户端,就不能删了
 *   然后把SEI中的@XmlSeeAlso({ObjectFactory.class})和className="....."两处删除
 * 3)编写实现类
 *   在实现类上指定@WebService(serviceName="", wsdlLocation="", endpointInterface="", targetNamespace="")
 * 4)发布服务
 *   发布时的address可任意指定,不要求一定要与myCalculator.wsdl中的<soap:address location=""/>相同
 *   但发布后在浏览器中查看wsdl时会发现,其<soap:address location=""/>值始终与发布时指定的address相同
 * -----------------------------------------------------------------------------------------------------
 * @create May 28, 2013 9:41:27 PM
 * @author 玄玉<https://jadyer.github.io/>
 */
public class ServerApp {
    public static void main(String[] args) {
        JaxWsServerFactoryBean factory = new JaxWsServerFactoryBean();
        factory.setAddress("http://127.0.0.1:8088/myCalculator");
        factory.setServiceClass(CalculatorService.class);
        factory.setServiceBean(new CalculatorServiceImpl());

        //打印接收和响应的SOAP通信报文
        factory.getInInterceptors().add(new LoggingInInterceptor());
        factory.getOutInterceptors().add(new LoggingOutInterceptor());

        //设置以下两个参数后，此种发布方式才是基于契约优先来发布的，否则仍会以代码优先来发布
        //区别方式是发布后用浏览器访问wsdl时，若wsdl与我们编写的wsdl相同，且元素类型引用自另一个xsd，则表示契约优先发布成功
        //否则，用浏览器访问wsdl时，可直接看到元素类型定义，则表示是代码优先的方式发布的
        factory.setWsdlLocation("META-INF/myCalculator.wsdl");
        factory.setServiceName(new QName("http://blog.csdn.net/jadyer", "CalculatorServiceImpl"));
        factory.create();
    }
}
```

**至此，服务端代码示例完毕**

## 客户端

下面是自定义的用于发送`SOAPHeader`信息的`LicenseOutInterceptor.java`

```java
package com.jadyer.interceptor;
import javax.xml.bind.JAXBException;
import javax.xml.namespace.QName;
import net.csdn.blog.jadyer.User;
import org.apache.cxf.binding.soap.SoapMessage;
import org.apache.cxf.binding.soap.interceptor.AbstractSoapInterceptor;
import org.apache.cxf.databinding.DataBinding;
import org.apache.cxf.headers.Header;
import org.apache.cxf.interceptor.Fault;
import org.apache.cxf.jaxb.JAXBDataBinding;
import org.apache.cxf.phase.Phase;

public class LicenseOutInterceptor extends AbstractSoapInterceptor{
    public LicenseOutInterceptor(){
        super(Phase.WRITE);
    }

    @Override
    public void handleMessage(SoapMessage message) throws Fault {
        QName qname = new QName("http://blog.csdn.net/jadyer", "licenseUser", "ns");
        DataBinding dataBinding = null;
        try {
            dataBinding = new JAXBDataBinding(User.class);
        } catch (JAXBException e) {
            e.printStackTrace();
        }
        User user = new User();
        user.setUsername("Jadyer");
        user.setPassword("hongyu");
        Header header = new Header(qname, user, dataBinding);
        message.getHeaders().add(header);
    }
}
```

最后是通过`CXF提供的wsdl2java`生成的，用于演示调用服务端的`ClientApp.Java`

关于`wsdl2java`的用法，可参考[https://jadyer.github.io/2013/05/31/cxf-demo/](https://jadyer.github.io/2013/05/31/cxf-demo/)

```java
package com.jadyer.client;
import net.csdn.blog.jadyer.CalculatorService;
import org.apache.cxf.interceptor.LoggingInInterceptor;
import org.apache.cxf.interceptor.LoggingOutInterceptor;
import org.apache.cxf.jaxws.JaxWsProxyFactoryBean;
import com.jadyer.interceptor.LicenseOutInterceptor;

//wsdl2java -d D:/Download/ -frontend jaxws21 -keep -verbose http://127.0.0.1:8088/myHelloService?wsdl
//wsdl2java命令与wsimport相似，wsimport简介详见https://jadyer.github.io/2013/03/19/jaxws-and-wsimport-demo/
public class ClientApp {
    public static void main(String[] args) {
        JaxWsProxyFactoryBean factory = new JaxWsProxyFactoryBean();
        factory.setAddress("http://127.0.0.1:8088/myCalculator");
        factory.setServiceClass(CalculatorService.class);
        factory.getInInterceptors().add(new LoggingInInterceptor());
        factory.getOutInterceptors().add(new LoggingOutInterceptor());
        factory.getOutInterceptors().add(new LicenseOutInterceptor());
        CalculatorService hello = (CalculatorService)factory.create();
        System.out.println(hello.add(12, 33));
    }
}
```

## 控制台输出

这是服务端控制台输出

```
2013-5-31 23:06:19 org.apache.cxf.services.CalculatorServiceImpl.CalculatorServiceImplPort.CalculatorService
信息: Inbound Message
----------------------------
ID: 1
Address: http://127.0.0.1:8088/myCalculator
Encoding: UTF-8
Http-Method: POST
Content-Type: text/xml; charset=UTF-8
Headers: {Accept=[*/*], Cache-Control=[no-cache], connection=[keep-alive], Content-Length=[342], content-type=[text/xml; charset=UTF-8], Host=[127.0.0.1:8088], Pragma=[no-cache], SOAPAction=[""], User-Agent=[Apache CXF 2.7.0]}
Payload: <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Header><ns2:licenseUser xmlns:ns2="http://blog.csdn.net/jadyer"><username>Jadyer</username><password>hongyu</password></ns2:licenseUser></soap:Header><soap:Body><ns2:add xmlns:ns2="http://blog.csdn.net/jadyer"><a>12</a><b>33</b></ns2:add></soap:Body></soap:Envelope>
--------------------------------------
Receive the username=[Jadyer]
Receive the password=[hongyu]
12+33=45
2013-5-31 23:06:19 org.apache.cxf.services.CalculatorServiceImpl.CalculatorServiceImplPort.CalculatorService
信息: Outbound Message
---------------------------
ID: 1
Encoding: UTF-8
Content-Type: text/xml
Headers: {}
Payload: <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ns2:addResponse xmlns:ns2="http://blog.csdn.net/jadyer"><addResult>45</addResult></ns2:addResponse></soap:Body></soap:Envelope>
--------------------------------------
```

这是客户端控制台输出

```
2013-5-31 23:06:18 org.apache.cxf.service.factory.ReflectionServiceFactoryBean buildServiceFromClass
信息: Creating Service {http://blog.csdn.net/jadyer}CalculatorServiceService from class net.csdn.blog.jadyer.CalculatorService
2013-5-31 23:06:19 org.apache.cxf.services.CalculatorServiceService.CalculatorServicePort.CalculatorService
信息: Outbound Message
---------------------------
ID: 1
Address: http://127.0.0.1:8088/myCalculator
Encoding: UTF-8
Http-Method: POST
Content-Type: text/xml
Headers: {Accept=[*/*], SOAPAction=[""]}
Payload: <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Header><ns2:licenseUser xmlns:ns2="http://blog.csdn.net/jadyer"><username>Jadyer</username><password>hongyu</password></ns2:licenseUser></soap:Header><soap:Body><ns2:add xmlns:ns2="http://blog.csdn.net/jadyer"><a>12</a><b>33</b></ns2:add></soap:Body></soap:Envelope>
--------------------------------------
2013-5-31 23:06:19 org.apache.cxf.services.CalculatorServiceService.CalculatorServicePort.CalculatorService
信息: Inbound Message
----------------------------
ID: 1
Response-Code: 200
Encoding: UTF-8
Content-Type: text/xml;charset=UTF-8
Headers: {content-type=[text/xml;charset=UTF-8], Server=[Jetty(8.1.7.v20120910)], transfer-encoding=[chunked]}
Payload: <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ns2:addResponse xmlns:ns2="http://blog.csdn.net/jadyer"><addResult>45</addResult></ns2:addResponse></soap:Body></soap:Envelope>
--------------------------------------
45
```