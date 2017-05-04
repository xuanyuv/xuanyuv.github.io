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

ok，let`s drink code ...

## 服务端

首先是服务端的消息处理器`ServerHandler.java`

```java
package com.jadyer.demo.mina;
import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IoSession;

/**
 * 服务端的消息处理器
 * Created by 玄玉<http://jadyer.cn/> on 2012/10/31 16:46.
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
 * Created by 玄玉<http://jadyer.cn/> on 2012/10/31 16:38.
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
 * Created by 玄玉<http://jadyer.cn/> on 2012/10/31 16:38.
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
 * Created by 玄玉<http://jadyer.cn/> on 2012/10/31 16:38.
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

其中的`68 65 6C 6C 6F 0A`可以在`Editplus`中查到各自代表什么，如下图所示

![](/img/2012/2012-10-31-mina-spring.png)

也可以在Linux执行命令`man ascii`来查看

```ruby
[devlog@localhost ~]$ man ascii


ASCII(7)                   Linux Programmer’s Manual                  ASCII(7)

NAME
       ascii - the ASCII character set encoded in octal, decimal, and hexadecimal

DESCRIPTION
       ASCII  is  the American Standard Code for Information Interchange.  It is a 7-bit code.  Many 8-bit codes (such as ISO 8859-1, the Linux default character set) contain
       ASCII as their lower half.  The international counterpart of ASCII is known as ISO 646.

       The following table contains the 128 ASCII characters.

       C program '\X' escapes are noted.

       Oct   Dec   Hex   Char                        Oct   Dec   Hex   Char
       ------------------------------------------------------------------------
       000   0     00    NUL '\0'                    100   64    40    @
       001   1     01    SOH (start of heading)      101   65    41    A
       002   2     02    STX (start of text)         102   66    42    B
       003   3     03    ETX (end of text)           103   67    43    C
       004   4     04    EOT (end of transmission)   104   68    44    D
       005   5     05    ENQ (enquiry)               105   69    45    E
       006   6     06    ACK (acknowledge)           106   70    46    F
       007   7     07    BEL '\a' (bell)             107   71    47    G
       010   8     08    BS  '\b' (backspace)        110   72    48    H
       011   9     09    HT  '\t' (horizontal tab)   111   73    49    I
       012   10    0A    LF  '\n' (new line)         112   74    4A    J
       013   11    0B    VT  '\v' (vertical tab)     113   75    4B    K
       014   12    0C    FF  '\f' (form feed)        114   76    4C    L
       015   13    0D    CR  '\r' (carriage ret)     115   77    4D    M
       016   14    0E    SO  (shift out)             116   78    4E    N
       017   15    0F    SI  (shift in)              117   79    4F    O
       020   16    10    DLE (data link escape)      120   80    50    P
       021   17    11    DC1 (device control 1)      121   81    51    Q
       022   18    12    DC2 (device control 2)      122   82    52    R
       023   19    13    DC3 (device control 3)      123   83    53    S
       024   20    14    DC4 (device control 4)      124   84    54    T
       025   21    15    NAK (negative ack.)         125   85    55    U
       026   22    16    SYN (synchronous idle)      126   86    56    V
       027   23    17    ETB (end of trans. blk)     127   87    57    W
       030   24    18    CAN (cancel)                130   88    58    X
       031   25    19    EM  (end of medium)         131   89    59    Y
       032   26    1A    SUB (substitute)            132   90    5A    Z
       033   27    1B    ESC (escape)                133   91    5B    [
       034   28    1C    FS  (file separator)        134   92    5C    \  '\\'
       035   29    1D    GS  (group separator)       135   93    5D    ]
       036   30    1E    RS  (record separator)      136   94    5E    ^
       037   31    1F    US  (unit separator)        137   95    5F    _
       040   32    20    SPACE                       140   96    60    `
       041   33    21    !                           141   97    61    a
       042   34    22    "                           142   98    62    b
       043   35    23    #                           143   99    63    c
       044   36    24    $                           144   100   64    d
       045   37    25    %                           145   101   65    e
       046   38    26    &                           146   102   66    f
       047   39    27    ´                           147   103   67    g
       050   40    28    (                           150   104   68    h
       051   41    29    )                           151   105   69    i
       052   42    2A    *                           152   106   6A    j
       053   43    2B    +                           153   107   6B    k
       054   44    2C    ,                           154   108   6C    l
       055   45    2D    -                           155   109   6D    m
       056   46    2E    .                           156   110   6E    n
       057   47    2F    /                           157   111   6F    o
       060   48    30    0                           160   112   70    p
       061   49    31    1                           161   113   71    q
       062   50    32    2                           162   114   72    r
       063   51    33    3                           163   115   73    s
       064   52    34    4                           164   116   74    t
       065   53    35    5                           165   117   75    u
       066   54    36    6                           166   118   76    v
       067   55    37    7                           167   119   77    w
       070   56    38    8                           170   120   78    x
       071   57    39    9                           171   121   79    y
       072   58    3A    :                           172   122   7A    z
       073   59    3B    ;                           173   123   7B    {
       074   60    3C    <                           174   124   7C    |
       075   61    3D    =                           175   125   7D    }
       076   62    3E    >                           176   126   7E    ~
       077   63    3F    ?                           177   127   7F    DEL

   Tables
       For convenience, let us give more compact tables in hex and decimal.

          2 3 4 5 6 7       30 40 50 60 70 80 90 100 110 120
        -------------      ---------------------------------
       0:   0 @ P ` p     0:    (  2  <  F  P  Z  d   n   x
       1: ! 1 A Q a q     1:    )  3  =  G  Q  [  e   o   y
       2: " 2 B R b r     2:    *  4  >  H  R  \  f   p   z
       3: # 3 C S c s     3: !  +  5  ?  I  S  ]  g   q   {
       4: $ 4 D T d t     4: "  ,  6  @  J  T  ^  h   r   |
       5: % 5 E U e u     5: #  -  7  A  K  U  _  i   s   }
       6: & 6 F V f v     6: $  .  8  B  L  V  `  j   t   ~
       7: ´ 7 G W g w     7: %  /  9  C  M  W  a  k   u  DEL
       8: ( 8 H X h x     8: &  0  :  D  N  X  b  l   v
       9: ) 9 I Y i y     9: ´  1  ;  E  O  Y  c  m   w
       A: * : J Z j z
       B: + ; K [ k {
       C: , < L \ l |
       D: - = M ] m }
       E: . > N ^ n ~
       F: / ? O _ o DEL

NOTES
   History
       An ascii manual page appeared in Version 7 of AT&T UNIX.

       On older terminals, the underscore code is displayed as a left arrow, called backarrow, the caret is displayed as an up-arrow and the vertical bar has a  hole  in  the
       middle.

       Uppercase  and  lowercase  characters differ by just one bit and the ASCII character 2 differs from the double quote by just one bit, too.  That made it much easier to
       encode characters mechanically or with a non-microcontroller-based electronic keyboard and that pairing was found on old teletypes.

       The ASCII standard was published by the United States of America Standards Institute (USASI) in 1968.


SEE ALSO
       iso_8859-1(7),  iso_8859-10(7),  iso_8859-13(7),  iso_8859-14(7),  iso_8859-15(7),  iso_8859-16(7),   iso_8859-2(7),   iso_8859-3(7),   iso_8859-4(7),   iso_8859-5(7),
       iso_8859-6(7), iso_8859-7(7), iso_8859-8(7), iso_8859-9(7)

COLOPHON
       This  page is part of release 3.22 of the Linux man-pages project.  A description of the project, and information about reporting bugs, can be found at http://www.ker-
       nel.org/doc/man-pages/.

Linux                             2009-02-12                          ASCII(7)
(END)
```