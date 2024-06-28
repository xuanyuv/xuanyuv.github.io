---
layout: post
title: "JAX-WS之使用MTOM处理二进制文件"
categories: WebServices
tags: WebServices jax-ws mtom
author: 玄玉
excerpt: 介绍在JAX-WS中通过motm机制处理文件上传等操作的方法。
---

* content
{:toc}


## 服务端

下面这个`SEI`，是以`byte[]`为参数的服务端接口类`BinaryService.Java`

```java
package com.xuanyuv.service;
import javax.jws.WebParam;
import javax.jws.WebService;

@WebService(targetNamespace="https://www.xuanyuv.com/")
public interface BinaryService {
    public void upload(@WebParam(name="uploadFile")byte[] file);
}
```

下面这个`SEI`，是以`DataHandler`为参数的服务端接口类`BinaryHandlerService.java`

```java
package com.xuanyuv.service;

import javax.activation.DataHandler;
import javax.jws.WebParam;
import javax.jws.WebService;
import javax.xml.bind.annotation.XmlMimeType;

@WebService(targetNamespace="https://www.xuanyuv.com/Handler")
public interface BinaryHandlerService {
    public void uploadUseHandler(@WebParam(name="uploadFile")
                                 @XmlMimeType("application/octet-stream")
                                 DataHandler file);
}
```

接下来分别是两个`SEI`对应的`SIB`，即服务端接口实现类

```java
package com.xuanyuv.service;
import java.io.File;
import java.io.IOException;
import javax.jws.WebService;
import javax.xml.ws.soap.MTOM;
import org.apache.commons.io.FileUtils;

@WebService(endpointInterface="com.xuanyuv.service.BinaryService", targetNamespace="https://www.xuanyuv.com/")
@MTOM
public class BinaryServiceImpl implements BinaryService {
    @Override
    public void upload(byte[] file) {
        try {
            FileUtils.writeByteArrayToFile(new File("D:/test.jpg"), file);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

```java
package com.xuanyuv.service;
import java.io.File;
import java.io.IOException;
import javax.activation.DataHandler;
import javax.jws.WebService;
import javax.xml.ws.BindingType;
import javax.xml.ws.soap.SOAPBinding;
import org.apache.commons.io.FileUtils;

@WebService(endpointInterface="com.xuanyuv.service.BinaryHandlerService",
            targetNamespace="https://www.xuanyuv.com/Handler")
@BindingType(SOAPBinding.SOAP11HTTP_MTOM_BINDING)
public class BinaryHandlerServiceImpl implements BinaryHandlerService {
    @Override
    public void uploadUseHandler(DataHandler file) {
        try {
            FileUtils.copyInputStreamToFile(file.getDataSource().getInputStream(), new File("D:/test2.jpg"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

最后是发布服务的`ServerApp.java`

```java
package com.xuanyuv.server;
import javax.xml.ws.Endpoint;
import com.xuanyuv.service.BinaryHandlerService;
import com.xuanyuv.service.BinaryHandlerServiceImpl;
import com.xuanyuv.service.BinaryServiceImpl;

/**
 * 使用MTOM处理二进制文件
 * ---------------------------------------------------------------------------------------------------
 * 比较传统做法是:服务端公布的方法参数为byte[],客户端调用时直接传进去一个文件的byte[]即可
 * 此时使用TcpMon监听报文会发现,字节数组在传送的过程中,都是在SOAPBody里面传送的,而且是一次性全部传送
 * 那么问题就来了:如果传送的文件比较大,就有可能造成内存溢出
 * 对此,有一种解决方案是使用MTOM机制传输文件
 * ---------------------------------------------------------------------------------------------------
 * MTOM(Message Transmission Optimization Mechanism),翻译过来就是消息优化传输机制
 * 使用了MTOM后,我们再使用tcpmon监听报文会发现,文件传输是通过附件(以流的形式)传送的,而不是通过SOAPBody
 * 这里有必要提一下：当使用Apache的TcpMon监听MTOM时，由于JAXWS版本问题，可能会报告下面的异常
 * javax.xml.ws.WebServiceException: java.io.IOException: Error writing to server
 * 这时可以使用GoogleCode上的tcpmon或者Eclipse提供的TCP/IP Monitor
 * 有关三者的描述，可参考https://www.xuanyuv.com/blog/20130523/eclipse-tcpip-monitor.html
 * 好了，回归正题
 * 关于MTOM，有两种实现方式：传输byte[]和传输javax.activation.DataHandler
 * ---------------------------------------------------------------------------------------------------
 * MTOM实现之传输byte[]
 * 1)SEI中定义开放服务的方法参数为byte[]
 * 2)使用@MTOM注解SIB,表示打开MTOM传输功能
 * 3)客户端调用时,为getServicePort()方法传入new MTOMFeature()参数,表示启用MTOM传输
 *   如new BinaryServiceImplService().getBinaryServiceImplPort(new MTOMFeature()).upload(....)
 * ---------------------------------------------------------------------------------------------------
 * MTOM实现之传输javax.activation.DataHandler
 * 1)SEI中定义开放服务的方法参数为DataHandler,并为该参数增加注解@XmlMimeType("application/octet-stream")
 * 2)使用@BindingType(SOAPBinding.SOAP11HTTP_MTOM_BINDING)注解SIB
 * 3)客户端调用时使用(SOAPBinding)((BindingProvider)service).setMTOMEnabled(true)启用MTOM传输
 *   BinaryHandlerService service = new BinaryHandlerServiceImplService().getBinaryHandlerServiceImplPort()
 *   BindingProvider bp = (BindingProvider)service
 *   SOAPBinding binding = (SOAPBinding)bp.getBinding()
 *   binding.setMTOMEnabled(true)
 *   service.uploadUseHandler(new DataHandler(new FileDataSource(new File("D:/玄玉.png"))));
 * ---------------------------------------------------------------------------------------------------
 * MTOM总结
 * 其实在使用DataHandler时,第二步和第三步都可以使用<code>MTOM实现之传输byte[]</code>的第二,三步编写方式
 * 即使用@MTOM和new MTOMFeature()来打开MTOM传输并启用之,也就是说这两种方式的区别就在于开放服务的方法参数不同
 * 一个是upload(byte[] file),一个是upload(@XmlMimeType("application/octet-stream")DataHandler file)
 * ---------------------------------------------------------------------------------------------------
 * Created by 玄玉<https://www.xuanyuv.com/> on 2013/05/26 12:15.
 */
public class ServerApp {
    public static void main(String[] args) {
        Endpoint.publish("http://127.0.0.1:8086/upload", new BinaryServiceImpl());
        Endpoint.publish("http://127.0.0.1:8086/uploadHandler", new BinaryHandlerServiceImpl());
    }
}
```

**至此服务端发布完毕**

## 客户端

客户端只有一个演示调用服务的类`ClientApp.java`

这里是由wsimport生成的，关于其用法，可参考<https://www.xuanyuv.com/blog/20130319/jaxws-and-wsimport-demo.html>

```java
package com.xuanyuv.client;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import javax.activation.DataHandler;
import javax.activation.FileDataSource;
import javax.xml.namespace.QName;
import javax.xml.ws.BindingProvider;
import javax.xml.ws.soap.SOAPBinding;
import net.csdn.blog.xuanyuvhandler.BinaryHandlerService;
import net.csdn.blog.xuanyuvhandler.BinaryHandlerServiceImplService;

/**
 * wsimport -d D:/Download/ -keep -verbose http://127.0.0.1:8086/upload?wsdl
 * Created by 玄玉<https://www.xuanyuv.com/> on 2013/05/26 13:47.
 */
public class ClientApp {
    public static void main(String[] args) throws IOException {
        //URL url = new URL("http://127.0.0.1:8086/upload?wsdl");
        //QName qname = new QName("https://www.xuanyuv.com/", "BinaryServiceImplService");
        //byte[] uploadFile = FileUtils.readFileToByteArray(new File("D:/玄玉.png"));
        ////普通的传文件
        //new BinaryServiceImplService(url, qname).getBinaryServiceImplPort().upload(uploadFile);
        ////MTOM方式
        //new BinaryServiceImplService(url, qname).getBinaryServiceImplPort(new MTOMFeature()).upload(uploadFile);

        URL urlHandler = new URL("http://127.0.0.1:8086/uploadHandler?wsdl");
        QName qnameHandler = new QName("https://www.xuanyuv.com/Handler", "BinaryHandlerServiceImplService");
        BinaryHandlerService service = new BinaryHandlerServiceImplService(urlHandler, qnameHandler).getBinaryHandlerServiceImplPort();
        BindingProvider bp = (BindingProvider)service;
        SOAPBinding binding = (SOAPBinding)bp.getBinding();
        binding.setMTOMEnabled(true);
        service.uploadUseHandler(new DataHandler(new FileDataSource(new File("D:/玄玉.png"))));
    }
}
```