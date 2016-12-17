---
layout: post
title: "Mina集成Spring"
categories: Mina2
tags: mina spring
author: 玄玉
excerpt: 介绍Mina2.x集成Spring的示例。
---

* content
{:toc}


所谓的集成Spring，其实就是让Mina作为Spring的一个Bean被管理，下面是示例代码

其中客户端和服务端的通信协议是我们自定义的：通信内容为`\n`结尾的字符串，且无长度限制

OK, Let`s drink code ...

## 服务端

首先是服务端的消息处理器`ServerHandler.java`

```java
package com.jadyer.demo.mina;
import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IoSession;

/**
 * 服务端的消息处理器
 * Created by 玄玉<https://jadyer.github.io/> on 2012/10/31 16:46.
 */
public class ServerHandler extends IoHandlerAdapter {
    @Override
    public void sessionOpened(IoSession session) throws Exception {
        System.out.println("InComing Client：" + session.getRemoteAddress());
    }
    @Override
    public void messageReceived(IoSession session, Object message) throws Exception {
        System.out.println("The message received from Client is [" + message.toString() + "]");
        session.write("ok");
    }
}
```

下面是自定义的编码器`MyEncoder.java`

```java
package com.jadyer.demo.mina.codec;
import org.apache.mina.core.buffer.IoBuffer;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.ProtocolEncoderAdapter;
import org.apache.mina.filter.codec.ProtocolEncoderOutput;
import java.nio.charset.Charset;
import java.nio.charset.CharsetEncoder;

/**
 * 自定义的编码器
 * Created by 玄玉<https://jadyer.github.io/> on 2012/10/31 16:38.
 */
public class MyEncoder extends ProtocolEncoderAdapter {
    private final CharsetEncoder charsetEncoder;
    public MyEncoder(String _charsetName){
        this.charsetEncoder = Charset.forName(_charsetName).newEncoder();
    }
    @Override
    public void encode(IoSession session, Object message, ProtocolEncoderOutput out) throws Exception {
        IoBuffer buffer = IoBuffer.allocate(100).setAutoExpand(true);
        buffer.putString(message.toString()+"\n", this.charsetEncoder);
        buffer.flip();
        out.write(buffer);
    }
}
```

下面是自定义的解码器`MyDecoder.java`

```java
package com.jadyer.demo.mina.codec;
import org.apache.mina.core.buffer.IoBuffer;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.CumulativeProtocolDecoder;
import org.apache.mina.filter.codec.ProtocolDecoderOutput;
import java.nio.charset.Charset;
import java.nio.charset.CharsetDecoder;

/**
 * 自定义的解码器
 * Created by 玄玉<https://jadyer.github.io/> on 2012/10/31 16:38.
 */
public class MyDecoder extends CumulativeProtocolDecoder{
    private final CharsetDecoder charsetDecoder;
    public MyDecoder(String _charsetName){
        this.charsetDecoder = Charset.forName(_charsetName).newDecoder();
    }
    @Override
    protected boolean doDecode(IoSession session, IoBuffer in, ProtocolDecoderOutput out) throws Exception {
        String msg = "";
        int fieldSize = 0;
        IoBuffer buffer = IoBuffer.allocate(100).setAutoExpand(true);
        while(in.hasRemaining()){
            byte b = in.get();
            buffer.put(b);
            fieldSize++;
            //10==b表示换行：该短信协议解码器使用\n（ASCII的字符10）作为分界点
            if(10 == b){
                //limit=position，position=0
                buffer.flip();
                //最后的换行符不需要，所以要少读一个字节
                msg = buffer.getString(fieldSize-1, this.charsetDecoder);
                break;
            }
        }
        out.write(msg);
        return false;
    }
}
```

下面是自定义的Mina2.x服务启动器`MinaStartup.java`

```java
package com.jadyer.demo.mina;
import org.apache.mina.core.filterchain.IoFilterChainBuilder;
import org.apache.mina.core.service.IoHandler;
import org.apache.mina.transport.socket.nio.NioSocketAcceptor;
import java.io.IOException;
import java.net.SocketAddress;
import java.util.List;

/**
 * 用于启动Mina2.x服务
 * Created by 玄玉<https://jadyer.github.io/> on 2012/10/31 16:38.
 */
public class MinaStartup {
    private IoHandler handler;                       //处理器
    private List<SocketAddress> socketAddresses;     //监听地址
    private IoFilterChainBuilder filterChainBuilder; //过滤器链
    private int bothIdleTime;                        //双向发呆时间
    private int writeTimeout;                        //写操作超时时间
    private boolean reuseAddress;                    //监听的端口是否可重用

    public final void bind() throws IOException {
        NioSocketAcceptor acceptor = new NioSocketAcceptor();
        acceptor.setHandler(this.handler);
        acceptor.setReuseAddress(this.reuseAddress);
        acceptor.setFilterChainBuilder(this.filterChainBuilder);
        acceptor.getSessionConfig().setWriteTimeout(this.writeTimeout);
        acceptor.getSessionConfig().setBothIdleTime(this.bothIdleTime);
        if(null==this.socketAddresses || this.socketAddresses.size()<1){
            throw new RuntimeException("监听SocketAddress数不得小于1");
        }
        acceptor.bind(this.socketAddresses);
        if(acceptor.isActive()){
            System.out.println("写 超 时: " + this.writeTimeout + "ms");
            System.out.println("发呆配置: Both Idle " + this.bothIdleTime + "s");
            System.out.println("端口重用: " + this.reuseAddress);
            System.out.println("服务端初始化完成......");
            System.out.println("服务已启动...开始监听..." + acceptor.getLocalAddresses());
        }else{
            System.out.println("服务端初始化失败......");
        }
    }

    public void setHandler(IoHandler handler) {
        this.handler = handler;
    }
    public void setSocketAddresses(List<SocketAddress> socketAddresses) {
        this.socketAddresses = socketAddresses;
    }
    public void setFilterChainBuilder(IoFilterChainBuilder filterChainBuilder) {
        this.filterChainBuilder = filterChainBuilder;
    }
    public void setBothIdleTime(int bothIdleTime) {
        this.bothIdleTime = bothIdleTime;
    }
    public void setWriteTimeout(int writeTimeout) {
        this.writeTimeout = writeTimeout;
    }
    public void setReuseAddress(boolean reuseAddress) {
        this.reuseAddress = reuseAddress;
    }
}
```

最后是用于配置Mina2.x信息的Spring配置文件`applicationContext-mina.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd">
<!-- 构造过滤器链 -->
<bean id="ioFilterChainBuilder" class="org.apache.mina.core.filterchain.DefaultIoFilterChainBuilder">
    <property name="filters">
        <map>
            <!-- 日志过滤器 -->
            <entry key="logging">
                <bean class="org.apache.mina.filter.logging.LoggingFilter"/>
            </entry>
            <!-- 协议编解码过滤器 -->
            <entry key="codec">
                <bean class="org.apache.mina.filter.codec.ProtocolCodecFilter">
                    <constructor-arg index="0">
                        <bean class="com.jadyer.demo.mina.codec.MyEncoder">
                            <constructor-arg value="UTF-8"/>
                        </bean>
                    </constructor-arg>
                    <constructor-arg index="1">
                        <bean class="com.jadyer.demo.mina.codec.MyDecoder">
                            <constructor-arg value="UTF-8"/>
                        </bean>
                    </constructor-arg>
                </bean>
            </entry>
            <!-- 线程池 -->
            <entry key="executor">
                <bean class="org.apache.mina.filter.executor.ExecutorFilter"/>
            </entry>
        </map>
    </property>
</bean>

<!-- 构造Server端 -->
<bean id="myServer" class="com.jadyer.demo.mina.MinaStartup" init-method="bind">
    <property name="reuseAddress" value="true"/>
    <property name="writeTimeout" value="10000"/>
    <property name="bothIdleTime" value="20"/>
    <property name="filterChainBuilder" ref="ioFilterChainBuilder"/>
    <property name="handler">
        <bean class="com.jadyer.demo.mina.ServerHandler"/>
    </property>
    <property name="socketAddresses">
        <list>
            <bean class="java.net.InetSocketAddress">
                <constructor-arg index="0" value="192.168.1.2"/>
                <constructor-arg index="1" value="8000"/>
            </bean>
            <bean class="java.net.InetSocketAddress">
                <constructor-arg index="0" value="192.168.1.2"/>
                <constructor-arg index="1" value="9001"/>
            </bean>
        </list>
    </property>
</bean>

<!--
上面是自己写的集成启动类，比较灵活，可自由控制服务启停绑定多端口等等，也是推荐的（看上去虽然有点傻，但是必杀）
下面是Mina提供的集成方式，不够灵活，比如它只能绑定一个端口等等，所以不推荐
-->

<!--
1、由于本例中使用的是自己写的集成类，所以也就不需要mina-integration-beans-2.0.4.jar，只一个mina-core-2.0.4.jar就够了
2、下面的defaultLocalAddress配置，注入的是一个字符串，但NioSocketAcceptor需要的是InetSocketAddress对象
   所以就需要一个编辑器将注入的字符串构造为InetSocketAddress
   恰好Mina2.x自带的org.apache.mina.integration.beans包中提供了很多属性编辑器，可以实现与所有的DI框架整合（而不仅限Spring）
   其中的InetSocketAddressEditor就是干这个事的，所以下面也配置了相应的bean
3、当然了，defaultLocalAddress也可以直接注入InetSocketAddress对象，如下所示
   <property name="defaultLocalAddress">
       <bean class="java.net.InetSocketAddress">
           <constructor-arg index="0" value="192.168.1.2"/>
           <constructor-arg index="1" value="8000"/>
       </bean>
   </property>
-->
<!--
<bean id="myServer" class="org.apache.mina.transport.socket.nio.NioSocketAcceptor" init-method="bind" destroy-method="unbind">
    <property name="reuseAddress" value="true"/>
    <property name="filterChainBuilder" ref="ioFilterChainBuilder"/>
    <property name="handler">
        <bean class="com.jadyer.handler.ServerHandler"/>
    </property>
    <property name="defaultLocalAddress" value="192.168.1.2:8000"/>
</bean>
<bean class="org.springframework.beans.factory.config.CustomEditorConfigurer">
    <property name="customEditors">
        <map>
            <entry key="java.net.SocketAddress">
                <bean class="org.apache.mina.integration.beans.InetSocketAddressEditor"/>
            </entry>
        </map>
    </property>
</bean>
-->
</beans>
```

至此为止，Mina2.x集成Spring的服务端配置，就完事了

关于服务端的启动，有两种方式，实际使用时可根据情况选择

一种是运行一个`main(String[] args)`方法来启动

```java
package com.jadyer.demo.mina;
import org.springframework.context.support.FileSystemXmlApplicationContext;
public class MainApp {
    public static void main(String[] args) {
        //读取Spring的xml文件并启动应用
        new FileSystemXmlApplicationContext("classpath:applicationContext-mina.xml");
    }
}
```

还有一种就是服务端打成war包放到Tomcat里面运行，这时候的`web.xml`配置如下

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" version="2.5">
	<context-param>
		<param-name>contextConfigLocation</param-name>
		<param-value>classpath:applicationContext*.xml</param-value>
	</context-param>
	<listener>
		<listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
	</listener>
</web-app>
```

## 客户端

为了测试，这里写一个最简洁的客户端`MyClient.java`

```java
package com.jadyer.demo.mina;
import com.jadyer.demo.mina.codec.MyDecoder;
import com.jadyer.demo.mina.codec.MyEncoder;
import org.apache.mina.core.service.IoConnector;
import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.ProtocolCodecFilter;
import org.apache.mina.transport.socket.nio.NioSocketConnector;
import java.net.InetSocketAddress;

public class MyClient {
    public static void main(String[] args) {
        IoConnector connector = new NioSocketConnector();
        connector.getFilterChain().addLast("codec", new ProtocolCodecFilter(new MyEncoder("UTF-8"), new MyDecoder("UTF-8")));
        connector.setHandler(new IoHandlerAdapter(){
            @Override
            public void sessionOpened(IoSession session) throws Exception {
                session.write("hello");
            }
            @Override
            public void messageReceived(IoSession session, Object message) throws Exception {
                System.out.println("The message received from Server is [" + message.toString() + "]");
                session.close(false);
                session.getService().dispose();
            }
        });
        //connector.connect(new InetSocketAddress("192.168.1.2", 9001));
        connector.connect(new InetSocketAddress("192.168.1.2", 8000));
    }
}
```

## 控制台输出

这是客户端的控制台输出

```
The message received from Server is [ok]
```

这是服务端的控制台输出

```
写 超 时: 10000ms
发呆配置: Both Idle 20s
端口重用: true
服务端初始化完成......
服务已启动...开始监听...[/192.168.1.2:9001, /192.168.1.2:8000]
[20121030 18:21:16 659][NioProcessor-3][LoggingFilter.log]CREATED
[20121030 18:21:16 660][NioProcessor-3][LoggingFilter.log]OPENED
InComing Client：/192.168.1.2:50148
[20121030 18:21:16 689][NioProcessor-3][LoggingFilter.log]RECEIVED: HeapBuffer[pos=0 lim=6 cap=2048: 68 65 6C 6C 6F 0A]
The message received from Client is [hello]
[20121030 18:21:16 700][NioProcessor-3][LoggingFilter.log]SENT: ok
[20121030 18:21:16 709][NioProcessor-3][LoggingFilter.log]CLOSED
```

## ANSI的查看

上面控制台输出的内容里面，有一块是`HeapBuffer[pos=0 lim=6 cap=2048: 68 65 6C 6C 6F 0A]`

其中的`68 65 6C 6C 6F 0A`可以在`Editplus`工具中看到各自代表什么，如下图所示

![](/img/2012/2012-10-31-mina-spring.png)