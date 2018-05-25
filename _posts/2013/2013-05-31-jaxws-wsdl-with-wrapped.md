---
layout: post
title: "JAX-WS之契约优先及隐式声明头信息"
categories: WebServices
tags: WebServices jax-ws wrapped
author: 玄玉
excerpt: 介绍在JAX-WS中通过手工编写XML的方式定义WSDL的各种细节，以及隐式声明头信息的用法。
---

* content
{:toc}


## 服务端

首先是我们自己编写的`//src//META-INF//wsdl//myCalculator.wsdl`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--
编写wsdl文件时，可以通过以下三种封装样式来定义开放服务的方法
1)基于Document的wrapped方式，即所有参数都通过<element>来封装
2)基于Document的unWrapped(Bare)方式,即<message>中传入的是具体的参数名称
3)基于RPC的方式
这里演示的是采用第一种方式来编写的，这也是比较推荐使用的方式
-->
<!-- 其中targetNamespace的作用类似于Java中的package -->
<wsdl:definitions xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:tns="http://blog.csdn.net/jadyer"
    targetNamespace="http://blog.csdn.net/jadyer"
    name="CalculatorServiceImpl">
    <!-- 定义WebService使用的数据类型 -->
    <wsdl:types>
        <!--
        也可以把下面的元素element及其类型定义放到一个schema文件中,即*.xsd
        然后在这里使用include或者import引入,二者区别是namespace
        <xsd:schema targetNamespace="http://blog.csdn.net/jadyer">
            <xsd:import schemaLocation="calculator.xsd" namespace="http://blog.csdn.net/jadyer"/>
            <xsd:include schemaLocation="calculator.xsd"/>
        </xsd:schema>
         -->
        <!-- 这里targetNamespace属性值要和上面的<wsdl:definitions xmlns:tns="" targetNamespace=""/>值一样 -->
        <xsd:schema targetNamespace="http://blog.csdn.net/jadyer">
            <!-- 定义一组元素，这里定义了两个方法add()和minus() -->
            <!-- name="add"表示定义了一个名为add的元素，type="tns:add"表示add元素的类型是tns命名空间下的'add'类型 -->
            <!-- 但我们并不知道add类型是啥类型，因为并不像string是schema数据类型，所以我们就要定义一个名为add的元素类型 -->
            <!-- 所以我们才在下面定义了一个<xsd:complexType name="add"> -->
            <xsd:element name="add" type="tns:add"/>
            <xsd:element name="addResponse" type="tns:addResponse"/>
            <xsd:element name="minus" type="tns:minus"/>
            <xsd:element name="minusResponse" type="tns:minusResponse"/>
            <xsd:element name="licenseInfo" type="xsd:string"/>
            <!--
            <xsd:element name="eleCalculatorException" type="tns:CalculatorException"/>
            <xsd:complexType name="CalculatorException">
                <xsd:sequence>
                    <xsd:element name="message" type="xsd:string"/>
                </xsd:sequence>
            </xsd:complexType>
             -->
            <!-- 定义元素类型 -->
            <xsd:complexType name="add">
                <!-- 指明a要出现在b的前面,且只出现一次,即add(int a, int b) -->
                <xsd:sequence>
                    <xsd:element name="a" type="xsd:int"/>
                    <xsd:element name="b" type="xsd:int"/>
                </xsd:sequence>
            </xsd:complexType>
            <xsd:complexType name="addResponse">
                <!-- 若想让add(int a, int b)方法没有返回值，那么这里便可直接写成<xsd:sequence/>或不写 -->
                <xsd:sequence>
                    <xsd:element name="addResult" type="xsd:int"/>
                </xsd:sequence>
            </xsd:complexType>
            <xsd:complexType name="minus">
                <xsd:sequence>
                    <xsd:element name="num1" type="xsd:int"/>
                    <xsd:element name="num2" type="xsd:int"/>
                </xsd:sequence>
            </xsd:complexType>
            <xsd:complexType name="minusResponse">
                <xsd:sequence>
                    <xsd:element name="minusResult" type="xsd:int"/>
                </xsd:sequence>
            </xsd:complexType>
        </xsd:schema>
    </wsdl:types>


    <!-- 定义操作的数据元素,可比作Java中方法的调用参数 -->
    <!--
    <wsdl:message name="MsgCalculatorException">
        <wsdl:part name="fault" element="tns:eleCalculatorException"/>
    </wsdl:message>
     -->
    <wsdl:message name="add">
        <wsdl:part name="add" element="tns:add"/>
    </wsdl:message>
    <wsdl:message name="addResponse">
        <wsdl:part name="addResponse" element="tns:addResponse"/>
    </wsdl:message>
    <wsdl:message name="minus">
        <wsdl:part name="minus" element="tns:minus"/>
    </wsdl:message>
    <wsdl:message name="minusResponse">
        <wsdl:part name="minusResponse" element="tns:minusResponse"/>
    </wsdl:message>
    <wsdl:message name="licenseInfo">
        <wsdl:part name="licenseInfo" element="tns:licenseInfo"/>
    </wsdl:message>


    <!-- 待绑定的对象接口,即描述了WebService可被执行的操作以及相关的消息,其可比作Java里的方法 -->
    <wsdl:portType name="CalculatorService">
        <!-- 待绑定的add()方法 -->
        <wsdl:operation name="add">
            <wsdl:input message="tns:add"/>
            <wsdl:output message="tns:addResponse"/>
        </wsdl:operation>
        <!-- 待绑定的minus()方法 -->
        <wsdl:operation name="minus">
            <wsdl:input message="tns:minus"/>
            <wsdl:output message="tns:minusResponse"/>
            <!--
            <wsdl:fault name="CalculatorException" message="tns:MsgCalculatorException"/>
             -->
        </wsdl:operation>
    </wsdl:portType>


    <!-- 为每个端口定义消息格式和协议细节......这里type要按照<wsdl:portType>的name来写 -->
    <wsdl:binding name="CalculatorServiceImplPortBinding" type="tns:CalculatorService">
        <!-- style属性可取值'rpc'或'document'，而transport属性定义了要使用的SOAP协议，这里我们使用HTTP -->
        <!-- soap:binding是采用SOAP1.1版本，soap12:binding是采用SOAP1.2版本，并且是采用SOAP规范来形成HTTPRequest -->
        <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
        <!-- operation元素定义了每个端口提供的操作符 -->
        <wsdl:operation name="add">
            <wsdl:input>
                <!-- use属性用于指定SOAP消息的编码规则,其值为encoded或者literal -->
                <!-- literal意味着type定义遵循xml模式定义 -->
                <!-- encoded参考xml中已有的应用数据，通常指的是SOAP1.1规范中的soap编码规则，若文档中无自定义数据，便可选择encoded -->
                <soap:body use="literal"/>
            </wsdl:input>
            <wsdl:output>
                <soap:body use="literal"/>
            </wsdl:output>
        </wsdl:operation>
        <wsdl:operation name="minus">
            <wsdl:input>
                <soap:body use="literal"/>
                <!-- 指明访问minus()方法时需添加头信息 -->
                <soap:header use="literal" part="licenseInfo" message="tns:licenseInfo"/>
            </wsdl:input>
            <wsdl:output>
                <soap:body use="literal"/>
            </wsdl:output>
            <!--
            <wsdl:fault name="CalculatorException">
                <soap:fault name="CalculatorException" use="literal"/>
            </wsdl:fault>
             -->
        </wsdl:operation>
    </wsdl:binding>


    <!-- 这里的name值要与顶部<wsdl:definitions>标签的name值一致 -->
    <wsdl:service name="CalculatorServiceImpl">
        <!-- 这里binding属性要与<wsdl:binding>标签的name值一致，这里的name值可以自定义 -->
        <wsdl:port binding="tns:CalculatorServiceImplPortBinding" name="CalculatorServiceImplPort">
            <!-- 这里用来指定服务发布的地址,可随意指定 -->
            <soap:address location="http://127.0.0.1:8088/myCalculatorService"/>
        </wsdl:port>
    </wsdl:service>
</wsdl:definitions>
```

下面是`SIB`，即服务端接口实现类`CalculatorServiceImpl.java`

```java
package net.csdn.blog.jadyer;
import javax.jws.WebService;

/**
 * SIB(Service Implemention Bean)
 * -------------------------------------------------------------------------------------------------------
 * 契约优先的核心
 * 1)其实WebServices开发服务端的过程中，完全可以不写SEI，直接写一个SIB，再把服务对外发布，客户端足矣正常访问
 *   这个时候，也可以在SIB中直接使用@WebParam和@WebResult来指明发布出去的方法中的参数名和返回值名称等等
 * 2)我们写SEI的目的是使用里面配置的@WebResult等注解，而要让SEI中的注解生效，就要在SIB中使用endpointInterface
 *   由于SEI是我们编写的wsdl生成的，所以它里面的注解都是很规范的，我们在SIB中只关注实现即可，可理解为面向接口编程
 *   所以我们在使用wsdl文件生成服务端代码后,就可以把除了SEI外的其它类都删掉
 * -------------------------------------------------------------------------------------------------------
 * 手工编写SIB
 * 1)最好显式的让SIB和SEI的targetNamespace相同
 * 2)当指定serviceName值时，其值应为wsdl文件中的<wsdl:service name="CalculatorServiceImpl">标签的name值
 * 3)不指定serviceName值时，wsdl中的<wsdl:service name="">则应为SIBService，如CalculatorServiceImplService
 *   否则在启动WebService服务时，会报告下面的异常
 *   Exception in thread "main" javax.xml.ws.WebServiceException:
 *   wsdl file:/F:/Tool/Code/JavaSE/ws_contractFirst/bin/META-INF/wsdl/myCalculator.wsdl
 *   has the following services [{http://blog.csdn.net/jadyer}CalculatorServiceImpl]
 *   but not {http://blog.csdn.net/jadyer}CalculatorServiceImplService
 *   Maybe you forgot to specify a service name in @WebService/@WebServiceProvider?
 * -------------------------------------------------------------------------------------------------------
 * 隐式声明头信息
 * 1)wsdl文件的<wsdl:input>中增加<soap:header use="...." part="licenseInfo" message="...."/>
 * 2)由于我们在wsdl中声明的是<soap:header>，所以此时wsdl生成的SEI中是找不到我们所声明的licenseInfo的
 *   作为服务端，可在欲验证头信息的方法中增加licenseInfo参数，并注解@WebParam(name="licenseInfo",header=true)
 *   作为客户端，调用时会发现minus()并不用传licenseInfo参数，故直接调用minus()时，服务端收到的licenseInfo=null
 *   所以才称为隐式声明头信息
 * 3)在SIB中对应的方法中增加licenseInfo参数，即可进行业务逻辑验证了(本例中只是将头信息licenseInfo打印输出)
 *   如果SEI中的header=true没有指明的话，那么SIB的方法中是无法获取头信息licenseInfo值的，即便客户端传了
 * -------------------------------------------------------------------------------------------------------
 * @create May 20, 2013 12:46:26 AM
 * @author 玄玉<http://jadyer.cn/>
 */
@WebService(serviceName="CalculatorServiceImpl",
            wsdlLocation="META-INF/wsdl/myCalculator.wsdl",
            endpointInterface="net.csdn.blog.jadyer.CalculatorService",
            targetNamespace="http://blog.csdn.net/jadyer")
public class CalculatorServiceImpl implements CalculatorService {
    @Override
    public int add(int a, int b) {
        System.out.println("["+a+"]+["+b+"]=" + (a+b));
        return a + b;
    }

    @Override
    public int minus(int num1, int num2, String licenseInfo) {
        System.out.println("["+num1+"]-["+num2+"]="+(num1-num2) + ", licenseInfo=["+licenseInfo+"]");
        return num1 - num2;
    }
}
```

最后是用于发布WebService服务的`ServerApp.java`

```java
package com.jadyer.server;
import javax.xml.ws.Endpoint;
import net.csdn.blog.jadyer.CalculatorServiceImpl;

/**
 * 契约优先开发及隐式声明头信息
 * --------------------------------------------------------------------------------------------------
 * 开发流程
 * 1)创建\\src\\META-INF\\wsdl\\myCalculator.wsdl文件,并编写其内容
 *   File--New--Other--MyEclipse--Web Services--WSDL--输入文件名后Next
 *   这一步保持Protocol为默认的SOAP不变,SOAP Binding Options为默认document literal不变即可
 * 2)根据wsdl文件生成服务端代码(wsimport -d d:/Download/ -keep -verbose myCalculator.wsdl)
 *   它会生成很多的代码,而作为服务端的我们,只需保留一个接口类(SEI)即可............如果是客户端,就不能删了
 *   若SEI报告ObjectFactory cannot be resolved to a type,则删除@XmlSeeAlso({ObjectFactory.class})
 * 3)编写实现类
 *   在实现类上指定@WebService(serviceName="", wsdlLocation="", endpointInterface="", targetNamespace="")
 * 4)发布服务
 *   发布时的address可任意指定,不要求一定要与myCalculator.wsdl中的<soap:address location=""/>相同
 *   但发布后在浏览器中查看wsdl时会发现,其<soap:address location=""/>值始终与发布时指定的address相同
 * --------------------------------------------------------------------------------------------------
 * @create May 17, 2013 11:33:09 AM
 * @author 玄玉<http://jadyer.cn/>
 */
public class ServerApp {
    public static void main(String[] args) {
        Endpoint.publish("http://127.0.0.1:8088/calculatorQuery", new CalculatorServiceImpl());
    }
}
```

## 客户端

客户端只有一个用于演示调用服务端的`ClientApp.Java`

它是通过wsimport生成的，关于其用法，可参考[http://jadyer.cn/2013/03/19/jaxws-and-wsimport-demo/](http://jadyer.cn/2013/03/19/jaxws-and-wsimport-demo/)

```java
package com.jadyer.client;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import javax.xml.namespace.QName;
import javax.xml.soap.MessageFactory;
import javax.xml.soap.SOAPBody;
import javax.xml.soap.SOAPBodyElement;
import javax.xml.soap.SOAPEnvelope;
import javax.xml.soap.SOAPException;
import javax.xml.soap.SOAPHeader;
import javax.xml.soap.SOAPMessage;
import javax.xml.ws.Dispatch;
import javax.xml.ws.Service;
import net.csdn.blog.jadyer.CalculatorService;
import net.csdn.blog.jadyer.CalculatorServiceImpl;

public class ClientApp {
    //服务端提供服务的端口是8088
    //若使用Eclipse提供的TCP/IPMonitor，则此处需将8088改为TCP/IPMonitor监听的本地端口
    private static final String wsdlLocation = "http://127.0.0.1:8088/calculatorQuery?wsdl";
    //取自wsdl文件中定义的<wsdl:definitions targetNamespace=""/>的值
    private static final String nameSpace = "http://blog.csdn.net/jadyer";
    //取自wsdl文件中定义的<wsdl:service name="">的值
    private static final String serviceName = "CalculatorServiceImpl";
    //取自wsdl文件中定义的<wsdl:port name="">的值
    private static final String portName = "CalculatorServiceImplPort";

    /**
     * 隐式声明头信息(使用SAAJ)
     * @see 本例中,服务端提供的minus()在访问时需要提供头信息
     * @see 如果没提供的话,也可正常访问并接收应答,因为本例中服务端并没有强制验证头信息(只是输出,顶多输出个null)
     * @see 通常有三种方式可以让客户端访问服务端时附带头信息,分别为Handler,SAAJ,代理类
     */
    private static void soapInvoke() throws SOAPException, IOException{
        SOAPMessage message = MessageFactory.newInstance().createMessage();
        SOAPEnvelope envelope = message.getSOAPPart().getEnvelope();
        SOAPBody body = envelope.getBody();
        SOAPHeader header = envelope.getHeader();
        if(null == header){
            header = envelope.getHeader();
        }
        //添加头信息
        header.addHeaderElement(new QName(nameSpace,"licenseInfo","ns")).setValue("theClientLicenseInfo");
        //添加体信息
        SOAPBodyElement sbe = body.addBodyElement(new QName(nameSpace, "minus", "ns"));
        sbe.addChildElement("num1").setValue("4");
        sbe.addChildElement("num2").setValue("1");
        System.out.println("invoke begin......");
        message.writeTo(System.out);
        System.out.println("");
        Service service = Service.create(new URL(wsdlLocation), new QName(nameSpace, serviceName));
        Dispatch<SOAPMessage> dispatch = service.createDispatch(new QName(nameSpace, portName), SOAPMessage.class, Service.Mode.MESSAGE);
        SOAPMessage respMsg = dispatch.invoke(message);
        respMsg.writeTo(System.out);
        System.out.println("\ninvoke end......");
    }

    private static void wsimportInvoke() throws MalformedURLException{
        CalculatorServiceImpl csl = new CalculatorServiceImpl(new URL(wsdlLocation), new QName(nameSpace, serviceName));
        CalculatorService cs = csl.getCalculatorServiceImplPort();
        System.out.println(cs.add(2, 3));
        System.out.println(cs.minus(2, 1));
    }

    public static void main(String[] args) throws SOAPException, IOException {
        wsimportInvoke();
        soapInvoke();
    }
}
```

## 控制台输出

```
//服务端
[2]+[3]=5
[2]-[1]=1,licenseInfo=[null]
[4]-[1]=3,licenseInfo=[theClientLicenseInfo]

//客户端
5
1
invoke begin......
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"><SOAP-ENV:Header><ns:licenseInfo xmlns:ns="http://blog.csdn.net/jadyer">theClientLicenseInfo</ns:licenseInfo></SOAP-ENV:Header><SOAP-ENV:Body><ns:minus xmlns:ns="http://blog.csdn.net/jadyer"><num1>4</num1><num2>1</num2></ns:minus></SOAP-ENV:Body></SOAP-ENV:Envelope>
<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/"><S:Header/><S:Body><ns2:minusResponse xmlns:ns2="http://blog.csdn.net/jadyer"><minusResult>3</minusResult></ns2:minusResponse></S:Body></S:Envelope>
invoke end......
```