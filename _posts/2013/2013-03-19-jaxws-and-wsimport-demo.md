---
layout: post
title: "JAX-WS入门实例及wsimport的使用"
categories: WebServices
tags: WebServices jax-ws wsimport
author: 玄玉
excerpt: 介绍JAX-WS的一个基础demo，以及通过wsimport生成WebService客户端代码的用法。
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

/**
 * SEI(Service Endpoint Interface)
 * -------------------------------------------------------------------------------------------
 * 这里使用类级别注解@WebService是为了标注该接口的方法将公开为Web服务
 * 它默认会公开所有方法，若想屏蔽某个方法，可以使用@Method的exclude=true属性
 * -------------------------------------------------------------------------------------------
 * 默认的生成的wsdl中方法参数名是arg0，arg1，返回值是return
 * 这样很不便于观察，所以我们可以使用@WebResult和@WebParam注解
 * @WebResult和@WebParam可以指定生成的wsdl文件中的方法参数名和返回值
 * -------------------------------------------------------------------------------------------
 * 这里要注意：如果一个WebServices服务已经发布，再来修改服务细节，如方法参数名和返回值
 * 尽管没有修改方法内部逻辑，但再重新发布完服务后，相应的客户端也要做修改，如重新wsimport本地类
 * 这是因为wsdl文件已被修改（尽管改的只是参数名字），而客户端所请求的wsdl与新wsdl在内容上是不同的
 * 若客户端未重新wsimport，会导致请求服务成功（实际是假象的成功）但得不到正确的结果
 * 所以服务一旦发布就不要轻易修改
 * -------------------------------------------------------------------------------------------
 * Created by 玄玉<https://jadyer.cn/> on 2013/05/17 12:11.
 */
@WebService
public interface HelloService {
    @WebResult(name="addResult")
    public int add(@WebParam(name="a")int a, @WebParam(name="b")int b);

    @WebResult(name="sayHelloResult")
    public String sayHello(@WebParam(name="name")String name);
}
```

然后是`SIB`，即服务端接口实现类`HelloServiceImpl.java`

```java
package com.jadyer.service;
import javax.jws.WebService;

/**
 * SIB(Service Implemention Bean)
 * -----------------------------------------------------------------------------------------------
 * 如果该实现类还实现了其它接口，那么就需要在@WebService上使用endpointInterface指定SEI
 * 如@WebService(endpointInterface="com.jadyer.service.HelloService")
 * 有一个比较奇怪的现象是，本例中如果没有加endpointInterface属性，那么SEI中的@WebParam会失效
 * 这是因为endpointInterface属性的作用之一是让SEI中配置的注解生效，不过我们也可以在SIB中直接注解
 * -----------------------------------------------------------------------------------------------
 * Created by 玄玉<https://jadyer.cn/> on 2013/05/17 12:11.
 */
@WebService(endpointInterface="com.jadyer.service.HelloService")
public class HelloServiceImpl implements HelloService {
    @Override
    public int add(int a, int b) {
        System.out.println(a + "+" + b + "=" + (a+b));
        return a + b;
    }

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

最后是用于发布服务的`MainApp.java`

```java
package com.jadyer.server;
import javax.xml.ws.Endpoint;
import com.jadyer.service.HelloServiceImpl;

/**
 * 基于JAX-WS的WebServices入门
 * JAX-WS(Java API for XML Webservices)
 * -------------------------------------------------------------------------------------------------
 * 两个常见的名词SEI和SIB
 * SEI(Service Endpoint Interface)--服务提供的接口，本例中指的就是HelloService.java
 * SIB(Service Implemention Bean)---服务实现的Bean，本例中指的就是HelloServiceImpl.java
 * -------------------------------------------------------------------------------------------------
 * Created by 玄玉<https://jadyer.cn/> on 2013/05/16 22:04.
 */
public class MainApp {
    public static void main(String[] args) {
        //发布服务，需指定发布的服务地址和实现类
        //运行该类后，服务就发布出去了，然后浏览器访问http://127.0.0.1:8888/myHelloService?wsdl即可
        Endpoint.publish("http://127.0.0.1:8888/myHelloService", new HelloServiceImpl());
    }
}
```

**至此服务端发布完毕**

## 客户端

#### 第一种写法

这种写法的ClientApp只用于测试，实际用处不怎么大

更加好用的客户端处理方式，请参考下面的第二种写法

```java
package com.jadyer.client;
import java.net.MalformedURLException;
import java.net.URL;
import javax.xml.namespace.QName;
import javax.xml.ws.Service;
import com.jadyer.service.HelloService;

public class ClientApp {
    public static void main(String[] args) throws MalformedURLException {
        //创建访问WSDL服务地址的URL
        URL url = new URL("http://127.0.0.1:8888/myHelloService?wsdl");

        //通过QName指明服务的具体信息
        //两个参数分别为WSDL文件顶部的<definitions targetNamespace="" name="">的值
        QName qname = new QName("http://service.jadyer.com/", "HelloServiceImplService");

        //创建服务
        Service service = Service.create(url, qname);

        //实现接口
        HelloService hello = service.getPort(HelloService.class);

        //美中不足的是,这里客户端要依赖于服务端的接口类
        //更加好用的客户端处理方式，详见下文的第二种写法
        System.out.println(hello.add(2, 6));
        System.out.println(hello.sayHello("Jadyer"));
    }
}
```

#### 第二种写法（较好）

这里主要是借助`wsimport`实现WebServices客户端

```java
package com.jadyer.client;
import com.jadyer.service.HelloService;
import com.jadyer.service.HelloServiceImplService;

/**
 * 借助wsimport实现WebServices客户端
 * --------------------------------------------------------------------------------------------------------------
 * wsimport是JDK6提供的工具，用于根据服务端发布的wsdl文件来生成客户端调用服务端时所需的*.java和*.class文件
 * wsimport -d D:/Download/ -keep -verbose http://127.0.0.1:8888/myHelloService?wsdl
 * '-d'--------指明生成的文件所存放的目录，注意该参数值对应的目录要存在，否则会报错
 * '-keep'-----指明生成class文件的同时也生成对应的java文件，否则它只会生成class文件
 * '-verbose'--指明生成文件时在控制台打印详细信息
 * '-p'--------指明生成文件的所属包名，默认为按照wsdl文件的targetNamespace属性来生成包名
 * --------------------------------------------------------------------------------------------------------------
 * Created by 玄玉<https://jadyer.cn/> on 2013/05/16 22:49.
 */
public class ClientApp {
    public static void main(String[] args) {
        //URL url = new URL("http://127.0.0.1:8888/myHelloService?wsdl");
        //QName qname = new QName("http://service.jadyer.com/", "HelloServiceImplService");
        //Service service = Service.create(url, qname);
        //HelloService hello = service.getPort(HelloService.class);
        //System.out.println(hello.add(2, 6));
        //System.out.println(hello.sayHello("Jadyer"));

        //通过wsimport生成客户端调用服务端所需的java文件后，就可以通过上面的方式来调用服务端
        //也可以通过下面的方式调用服务端，个人觉得下面的方式要更省事一些

        HelloServiceImplService helloServiceImpl = new HelloServiceImplService();
        //也可以手工指定URL和QName
        //URL url = new URL("http://127.0.0.1:8888/myHelloService?wsdl");
        //QName qname = new QName("http://service.jadyer.com/", "HelloServiceImplService");
        //HelloServiceImplService helloServiceImpl = new HelloServiceImplService(url, qname);
        HelloService hello = helloServiceImpl.getHelloServiceImplPort();
        System.out.println(hello.add(2, 6));
        System.out.println(hello.sayHello("Jadyer"));
    }
}
```