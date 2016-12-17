---
layout: post
title: "Mina入门之粘包处理"
categories: Mina2
tags: mina 粘包 拆包
author: 玄玉
excerpt: 介绍Mina2.x通过编解码短信协议的例子，讲述粘包的处理细节。
---

* content
{:toc}


主要下面的例子，演示一下`粘包`的处理，其核心的地方就在于`自定义的解码器`

ok，let`s drink code ...

## 公共的实体类

这是客户端和服务端通信时，传输短信内容的实体类`SmsInfo.java`

```java
package com.jadyer.demo.mina.model;

/**
 * 模拟短信协议内容的对象（不要求必须实现Serializable接口）
 * ----------------------------------------------------------------------------
 * M sip:wap.fetion.com.cn SIP-C/2.0 //状态行：一般表示协议的名字和版本号等
 * S: 1580101xxxx                    //短信的发送号码
 * R: 1880202xxxx                    //短信的接收号码
 * L: 21                             //短信的字节数
 * 你好！！Hello World!!              //短信的内容
 * 上面每行的末尾使用ASCII的10（\n）作为换行符
 * ----------------------------------------------------------------------------
 * Created by 玄玉<https://jadyer.github.io/> on 2012/10/19 11:21.
 */
public class SmsInfo {
    private String sender;
    private String receiver;
    private String message;

    /*-- 三个属性的setter和getter略 --*/

    public SmsInfo() {}

    public SmsInfo(String sender, String receiver, String message) {
        this.sender = sender;
        this.receiver = receiver;
        this.message = message;
    }
}
```

## 服务端

下面是服务端的示例`MyServer.java`

```java
package com.jadyer.demo.mina.server;
import com.jadyer.demo.mina.codec.CmccSipcDecoder;
import com.jadyer.demo.mina.codec.CmccSipcEncoder;
import com.jadyer.demo.mina.model.SmsInfo;
import org.apache.mina.core.service.IoAcceptor;
import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IdleStatus;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.ProtocolCodecFilter;
import org.apache.mina.filter.executor.ExecutorFilter;
import org.apache.mina.filter.logging.LoggingFilter;
import org.apache.mina.transport.socket.nio.NioSocketAcceptor;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.Charset;

/**
 * 服务端示例
 * Created by 玄玉<https://jadyer.github.io/> on 2012/10/19 11:21.
 */
public class MyServer {
    public static void main(String[] args) throws IOException {
        int bindPort = 9876;
        IoAcceptor acceptor = new NioSocketAcceptor();
        acceptor.getSessionConfig().setReadBufferSize(2048);
        acceptor.getSessionConfig().setIdleTime(IdleStatus.BOTH_IDLE, 10);
        acceptor.getFilterChain().addLast("logger", new LoggingFilter());
        acceptor.getFilterChain().addLast("codec", new ProtocolCodecFilter(new CmccSipcEncoder(), new CmccSipcDecoder()));
        acceptor.getFilterChain().addLast("executor", new ExecutorFilter());
        //acceptor.setHandler(new ServerHandler());
        //服务端的自定义消息处理器（由于演示时的逻辑比较简单，所以用内部类）
        acceptor.setHandler(new IoHandlerAdapter(){
            @Override
            public void messageReceived(IoSession session, Object message) throws Exception {
                SmsInfo smsInfo = (SmsInfo)message;
                System.out.println("The message received from Client is [" + smsInfo.getMessage() + "]");
                session.write(new SmsInfo(smsInfo.getReceiver(), smsInfo.getSender(), "Server Received OK"));
            }
            @Override
            public void sessionOpened(IoSession session) throws Exception{
                System.out.println("InComing Client：" + session.getRemoteAddress());
            }
        });
        acceptor.bind(new InetSocketAddress(bindPort));
        System.out.println("Mina Server is Listing on := " + bindPort);
    }
}
```

## 客户端

下面是客户端示例`MyClient.java`

```java
package com.jadyer.demo.mina.client;
import com.jadyer.demo.mina.codec.CmccSipcDecoder;
import com.jadyer.demo.mina.codec.CmccSipcEncoder;
import com.jadyer.demo.mina.model.SmsInfo;
import org.apache.mina.core.service.IoConnector;
import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.ProtocolCodecFilter;
import org.apache.mina.transport.socket.nio.NioSocketConnector;
import java.net.InetSocketAddress;
import java.nio.charset.Charset;

/**
 * 客户端示例
 * Created by 玄玉<https://jadyer.github.io/> on 2012/10/19 11:21.
 */
public class MyClient {
    public static void main(String[] args) {
        IoConnector connector = new NioSocketConnector();
        connector.setConnectTimeoutMillis(3000);
        connector.getFilterChain().addLast("codec", new ProtocolCodecFilter(new CmccSipcEncoder(), new CmccSipcDecoder()));
        connector.setHandler(new IoHandlerAdapter(){
            @Override
            public void sessionOpened(IoSession session) throws Exception {
                SmsInfo smsInfo = new SmsInfo();
                smsInfo.setSender("13800008888");
                smsInfo.setReceiver("13600006666");
                smsInfo.setMessage("Hi Jadyer, 这是我用Mina2.x发给你的消息...");
                session.write(smsInfo);
            }
            @Override
            public void messageReceived(IoSession session, Object message) throws Exception {
                SmsInfo smsInfo = (SmsInfo)message;
                System.out.println("The message received from Server is [" + smsInfo.getMessage() + "]");
            }
        });
        connector.connect(new InetSocketAddress("127.0.0.1", 9876));
        System.out.println("Mina Client is startup");
    }
}
```

## 编码器

Mina中编写编码器可以实现ProtocolEncoder.java，其中有encode()、dispose()两个方法需要实现

dispose()用于在销毁编码器时释放关联的资源，这个我们一般不关心，所以通常会继承适配器ProtocolEncoderAdapter.java

相较`解码（字节转为Java对象，也称拆包）`来说，`编码（Java对象转为字节，也称打包）`就很简单了

我们只需要把Java对象转为指定格式的字节流，然后write()出去就行了

```java
package com.jadyer.demo.mina.codec;
import com.jadyer.demo.mina.model.SmsInfo;
import org.apache.mina.core.buffer.IoBuffer;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.ProtocolEncoderAdapter;
import org.apache.mina.filter.codec.ProtocolEncoderOutput;
import java.nio.charset.Charset;
import java.nio.charset.CharsetEncoder;

/**
 * 自定义的编码器
 * Created by 玄玉<https://jadyer.github.io/> on 2012/10/19 11:21.
 */
public class CmccSipcEncoder extends ProtocolEncoderAdapter {
    private final CharsetEncoder charsetEncoder;

    public CmccSipcEncoder(){
        this.charsetEncoder = Charset.forName("UTF-8").newEncoder();
    }

    @Override
    public void encode(IoSession session, Object message, ProtocolEncoderOutput out) throws Exception {
        //编写解码器大体有以下5个步骤（主要就是按照协议拼装字符串到IoBuffer缓冲区，最后再write()出去）
        //1.强制转换message对象为指定的对象类型
        SmsInfo smsInfo = (SmsInfo)message;
        //2.创建IoBuffer缓冲区对象，并设置为自动扩展
        IoBuffer buffer = IoBuffer.allocate(100).setAutoExpand(true);
        //3.将转换后的message对象各属性按指定协议组装，并put()到IoBuffer缓冲区（下面写成+"\n"也是可以的）
        buffer.putString("M sip:wap.fetion.com.cn SIP-C/2.0"+'\n', this.charsetEncoder);
        buffer.putString("S: "+smsInfo.getSender()+'\n', this.charsetEncoder);
        buffer.putString("R: "+smsInfo.getReceiver()+'\n', this.charsetEncoder);
        buffer.putString("L: "+smsInfo.getMessage().getBytes(this.charsetEncoder.charset()).length+'\n', this.charsetEncoder);
        buffer.putString(smsInfo.getMessage(), this.charsetEncoder);
        //4.数据组装完毕后，调用flip()方法，为输出做好准备
        //  切记在write()之前调用flip()方法，否则缓冲区的position的后面是没有数据可以用来输出的
        //  必须调用flip()方法将position移至0，limit移至刚才的position（含义请参看java.nio.ByteBuffer）
        buffer.flip();
        //5.最后调用ProtocolEncoderOutput的write()方法输出IoBuffer缓冲区实例
        out.write(buffer);
    }
}
```


## 解码器

整篇文章最核心的就在这里

主要分两种情况：客户端发送的数据是一次全部发送完整的，和，数据被拆分为多次后再发送

解析的时候，前一种情况处理起来比较简单，后一种就要复杂些，很容易出现`粘包`的现象

#### 实现方式

下面先介绍一下如何在Mina2.x里面自定义解码器

Mina中编写解码器，可以实现ProtocolDecoder.java，其中有decode()、finishDecode()、dispose()三个方法

finishDecode()用于处理IoSession关闭时剩余的未读取数据，该方法通常不会被用到

和编码器一样，通常我们只需要继承适配器ProtocolDecoderAdapter.java，关注其decode()方法即可

解码器相对编码器来说，最麻烦的是数据发送过来的规模，比如聊天室中每隔一段时间都会有聊天内容发送过来

此时decode()方法会被往复调用，这样处理时就会非常麻烦，幸好Mina提供了`CumulativeProtocolDecoder.java`

它是累积性的协议解码器：即只要有数据发送过来，该类就会去读取数据，然后累积到内部的IoBuffer缓冲区

但具体的`拆包（把累积到缓冲区的数据解码为Java对象）`则交由子类的`doDecode()`方法来完成

实际上CumulativeProtocolDecoder就是在decode()中反复的调用暴漏给子类实现的doDecode()方法

#### 执行过程

* 当doDecode()返回true时

此时decode()会判断你是否在doDecode()中从内部的IoBuffer缓冲区读取了数据，若没有则会抛出非法的状态异常

也就是说，doDecode()返回true就表示你已经消费了本次数据（哪怕只消费了一个字节）

如果验证通过，那么CumulativeProtocolDecoder会检查缓冲区内是否还有数据未读取

如果有，它就会继续调用doDecode()方法，没有则停止对doDecode()的调用，直到有新的数据被缓冲

* 而当doDecode()返回false时

CumulativeProtocolDecoder会停止对doDecode()的调用

这时，若本次数据还有未读取完的，那么就将含有剩余数据的IoBuffer缓冲区保存到IoSession中

以便下一次数据到来时可以从IoSession中提取合并

若发现本次数据全都读取完毕，则清空IoBuffer缓冲区

* 简而言之

当你认为读取到的数据已经够解码了，那么就返回true，否则就返回false

这个CumulativeProtocolDecoder其实最重要的工作就是帮你完成了数据的累积，因为这个工作是很烦琐的

#### 代码01

下面的解码器`CmccSipcDecoder.java`，适用于客户端发送的数据是一次全部发送完整的情况

```java
package com.jadyer.demo.mina.codec;
import com.jadyer.demo.mina.model.SmsInfo;
import org.apache.mina.core.buffer.IoBuffer;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.CumulativeProtocolDecoder;
import org.apache.mina.filter.codec.ProtocolDecoderOutput;
import java.nio.charset.Charset;
import java.nio.charset.CharsetDecoder;

/**
 * 自定义的解码器（适用于客户端发送的数据是一次全部发送完整的情况）
 * Created by 玄玉<https://jadyer.github.io/> on 2012/10/19 11:21.
 */
public class CmccSipcDecoder extends CumulativeProtocolDecoder {
    private final CharsetDecoder charsetDecoder;

    public CmccSipcDecoder(){
        this.charsetDecoder = Charset.forName("UTF-8").newDecoder();
    }

    @Override
    protected boolean doDecode(IoSession session, IoBuffer in, ProtocolDecoderOutput out) throws Exception {
        //记录解析到了短信协议中的哪一行(\n)
        int i = 1;
        //记录在当前行中读取到了哪一个字节
        int matchCount = 0;
        String statusLine="", sender="", receiver="", length="", sms="";
        IoBuffer buffer = IoBuffer.allocate(100).setAutoExpand(true);
        while(in.hasRemaining()){
            byte b = in.get();
            buffer.put(b);
            //10==b表示换行：该短信协议解码器使用\n（ASCII的字符10）作为分界点
            if(10==b && 5>i){
                matchCount++;
                if(1 == i){
                    //limit=position，position=0
                    buffer.flip();
                    statusLine = buffer.getString(matchCount, this.charsetDecoder);
                    //移除本行的最后一个换行符
                    statusLine = statusLine.substring(0, statusLine.length()-1);
                    //本行读取完毕，所以让matchCount=0
                    matchCount = 0;
                    buffer.clear();
                }
                if(2 == i){
                    buffer.flip();
                    sender = buffer.getString(matchCount, this.charsetDecoder);
                    sender = sender.substring(0, sender.length()-1);
                    matchCount = 0;
                    buffer.clear();
                }
                if(3 == i){
                    buffer.flip();
                    receiver = buffer.getString(matchCount, this.charsetDecoder);
                    receiver = receiver.substring(0, receiver.length()-1);
                    matchCount = 0;
                    buffer.clear();
                }
                if(4 == i){
                    buffer.flip();
                    length = buffer.getString(matchCount, this.charsetDecoder);
                    length = length.substring(0, length.length()-1);
                    matchCount = 0;
                    buffer.clear();
                }
                i++;
            }else if(5 == i){
                matchCount++;
                if(Long.parseLong(length.split(": ")[1]) == matchCount){
                    buffer.flip();
                    sms = buffer.getString(matchCount, this.charsetDecoder);
                    i++;
                    break;
                }
            }else{
                matchCount++;
            }
        }
        SmsInfo smsInfo = new SmsInfo();
        smsInfo.setSender(sender.split(": ")[1]);
        smsInfo.setReceiver(receiver.split(": ")[1]);
        smsInfo.setMessage(sms);
        out.write(smsInfo);
        //告诉Mina：本次数据已全部读取完毕，故返回false
        return false;
    }
}
```

#### 状态保存

假如数据的发送被拆成了多次（譬如：短信协议的短信内容、消息报头被拆成了两次发送），那么上面的代码就会存在问题

因为当第二次调用doDecode()方法时，状态变量`i`、`matchCount`势必会被重置，也就是原来的状态值并没有被保存

**那么我们如何解决状态保存的问题呢**

答案就是将状态变量保存在IoSession中或者是Decoder实例自身，*但推荐使用前者*

因为虽然Decoder是单例的，其中的实例变量保存的状态在Decoder实例销毁前始终保持

但Mina并不保证每次调用doDecode()方法时都是同一个线程

这也就是说第一次调用doDecode()是`IoProcessor-1`线程，第二次有可能就是`IoProcessor-2`线程

这就会产生多线程中的`实例变量的可视性`（Visibility，具体请参考Java的多线程知识）问题

而IoSession中使用一个同步的HashMap保存对象，所以我们就不需要担心多线程带来的问题

**使用IoSession保存解码器的状态变量通常的写法，有以下两步**

1、在解码器中定义私有的内部类Context，然后将需要保存的状态变量定义在Context中存储

2、在解码器中定义方法获取这个Context的实例，这个方法的实现要优先从IoSession中获取Context

#### 代码02

这个例子就体现了**状态保存**，它主要干了下面几件事

1、所有记录状态的变量移到了Context内部类中，包括记录读到短信协议的哪一行的line

　　每行读取了多少个字节的matchCount，和记录解析好的状态行、发送者、接受者、短信内容、累积数据的innerBuffer等

　　这样就可以在数据不能完全解码，等待下一次doDecode()方法的调用时，还能承接上一次调用的数据

2、doDecode()中主要的变化是：各种状态变量首先是从Context中获取，在操作之后，将最新的值setXXX()到Context中保存

3、注意doDecode()方法最后的判断，当认为不够解码为一条短信息时，返回false，即本次数据流解码中不要再调用doDecode()

　　当认为已解码出一条短信息时，输出消息并重置所有状态变量，返回true（若仍有没解码完的数据，则继续调用doDecode()）

下面是具体的解码器`CmccSipcDecoder.java`，适用于客户端发送的数据被拆分为多次后发送的情况

```java
package com.jadyer.demo.mina.codec;
import com.jadyer.demo.mina.model.SmsInfo;
import org.apache.mina.core.buffer.IoBuffer;
import org.apache.mina.core.session.AttributeKey;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.CumulativeProtocolDecoder;
import org.apache.mina.filter.codec.ProtocolDecoderOutput;
import java.nio.charset.Charset;
import java.nio.charset.CharsetDecoder;

/**
 * 自定义的解码器（适用于客户端发送的数据被拆分为多次后发送的情况）
 * Created by 玄玉<https://jadyer.github.io/> on 2012/10/19 11:21.
 */
public class CmccSipcDecoder extends CumulativeProtocolDecoder {
    private final CharsetDecoder charsetDecoder;
    private final AttributeKey CONTEXT = new AttributeKey(getClass(), "context");

    public CmccSipcDecoder(){
        this.charsetDecoder = Charset.forName("UTF-8").newDecoder();
    }

    private Context getContext(IoSession session){
        Context context = (Context)session.getAttribute(CONTEXT);
        if(null == context){
            context = new Context();
            session.setAttribute(CONTEXT, context);
        }
        return context;
    }

    @Override
    protected boolean doDecode(IoSession session, IoBuffer in, ProtocolDecoderOutput out) throws Exception {
        Context ctx = this.getContext(session);
        IoBuffer buffer = ctx.innerBuffer;
        int matchCount = ctx.getMatchCount();
        int line = ctx.getLine();
        String statusLine = ctx.getStatusLine();
        String sender = ctx.getSender();
        String receiver = ctx.getReceiver();
        String length = ctx.getLength();
        String sms = ctx.getSms();
        while(in.hasRemaining()){
            byte b = in.get();
            matchCount++;
            buffer.put(b);
            if(10==b && line<4){
                if(0 == line){
                    buffer.flip();
                    statusLine = buffer.getString(matchCount, this.charsetDecoder);
                    statusLine = statusLine.substring(0, statusLine.length()-1);
                    matchCount = 0;
                    buffer.clear();
                    ctx.setStatusLine(statusLine);
                }
                if(1 == line){
                    buffer.flip();
                    sender = buffer.getString(matchCount, this.charsetDecoder);
                    sender = sender.substring(0, sender.length()-1);
                    matchCount = 0;
                    buffer.clear();
                    ctx.setSender(sender);
                }
                if(2 == line){
                    buffer.flip();
                    receiver = buffer.getString(matchCount, this.charsetDecoder);
                    receiver = receiver.substring(0, receiver.length()-1);
                    matchCount = 0;
                    buffer.clear();
                    ctx.setReceiver(receiver);
                }
                if(3 == line){
                    buffer.flip();
                    length = buffer.getString(matchCount, this.charsetDecoder);
                    length = length.substring(0, length.length()-1);
                    matchCount = 0;
                    buffer.clear();
                    ctx.setLength(length);
                }
                line++;
            }else if(4 == line){
                if(Long.parseLong(length.split(": ")[1]) == matchCount){
                    buffer.flip();
                    sms = buffer.getString(matchCount, this.charsetDecoder);
                    ctx.setSms(sms);
                    //由于下面的break，这里需要调用else外面的两行代码
                    ctx.setMatchCount(matchCount);
                    ctx.setLine(line);
                    break;
                }
            }
            ctx.setMatchCount(matchCount);
            ctx.setLine(line);
        }
        //判断本次是否已读取完毕：要求读取到最后一行，且读取的字节数与前一行指定的字节数相同
        if(4==ctx.getLine() && Long.parseLong(ctx.getLength().split(": ")[1])==ctx.getMatchCount()){
            SmsInfo smsInfo = new SmsInfo();
            smsInfo.setSender(sender.split(": ")[1]);
            smsInfo.setReceiver(receiver.split(": ")[1]);
            smsInfo.setMessage(sms);
            out.write(smsInfo);
            ctx.reset();
            return true;
        }else{
            return false;
        }
    }

    private class Context{
        private final IoBuffer innerBuffer; //用于累积数据的IoBuffer
        private String statusLine = "";     //记录解析好的状态行
        private String sender = "";         //记录解析好的发送者
        private String receiver = "";       //记录解析好的接受者
        private String length = "";
        private String sms = "";            //记录解析好的短信内容
        private int matchCount = 0;         //记录每一行读取了多少个字节
        private int line = 0;               //记录读到短信协议的哪一行
        Context(){
            innerBuffer = IoBuffer.allocate(100).setAutoExpand(true);
        }
        /*-- 七个属性的setter和getter略（不包括innerBuffer） --*/
        void reset(){
            this.innerBuffer.clear();
            this.statusLine = "";
            this.sender = "";
            this.receiver = "";
            this.length = "";
            this.sms = "";
            this.matchCount = 0;
            this.line = 0;
        }
    }
}
```

## 控制台输出

这是客户端的控制台输出

```
Mina Client is startup
19:12:19.560 [NioProcessor-2] DEBUG org.apache.mina.filter.codec.ProtocolCodecFilter - Processing a MESSAGE_RECEIVED for session 1
The message received from Server is [Server Received OK]
```

这是服务端的控制台输出

```
Mina Server is Listing on := 9876
19:12:19.503 [NioProcessor-3] INFO org.apache.mina.filter.logging.LoggingFilter - CREATED
19:12:19.509 [NioProcessor-3] INFO org.apache.mina.filter.logging.LoggingFilter - OPENED
19:12:19.513 [NioProcessor-3] DEBUG org.apache.mina.filter.executor.OrderedThreadPoolExecutor - Adding event SESSION_OPENED to session 2
Queue : [SESSION_OPENED, ]

19:12:19.536 [pool-3-thread-1] DEBUG org.apache.mina.core.filterchain.IoFilterEvent - Firing a SESSION_OPENED event for session 2
19:12:19.538 [NioProcessor-3] INFO org.apache.mina.filter.logging.LoggingFilter - RECEIVED: HeapBuffer[pos=0 lim=121 cap=2048: 4D 20 73 69 70 3A 77 61 70 2E 66 65 74 69 6F 6E...]
19:12:19.539 [NioProcessor-3] DEBUG org.apache.mina.filter.codec.ProtocolCodecFilter - Processing a MESSAGE_RECEIVED for session 2
InComing Client：/127.0.0.1:52222
19:12:19.542 [pool-3-thread-1] DEBUG org.apache.mina.core.filterchain.IoFilterEvent - Event SESSION_OPENED has been fired for session 2
19:12:19.547 [NioProcessor-3] DEBUG org.apache.mina.filter.executor.OrderedThreadPoolExecutor - Adding event MESSAGE_RECEIVED to session 2
Queue : [MESSAGE_RECEIVED, ]

19:12:19.550 [pool-3-thread-1] DEBUG org.apache.mina.core.filterchain.IoFilterEvent - Firing a MESSAGE_RECEIVED event for session 2
The message received from Client is [Hi Jadyer, 这是我用Mina2.x发给你的消息...]
19:12:19.558 [NioProcessor-3] INFO org.apache.mina.filter.logging.LoggingFilter - SENT: com.jadyer.demo.mina.model.SmsInfo@722af94
19:12:19.558 [NioProcessor-3] DEBUG org.apache.mina.filter.executor.OrderedThreadPoolExecutor - Adding event MESSAGE_SENT to session 2
Queue : [MESSAGE_SENT, ]

19:12:19.557 [pool-3-thread-1] DEBUG org.apache.mina.core.filterchain.IoFilterEvent - Event MESSAGE_RECEIVED has been fired for session 2
19:12:19.558 [pool-3-thread-1] DEBUG org.apache.mina.core.filterchain.IoFilterEvent - Firing a MESSAGE_SENT event for session 2
19:12:19.559 [pool-3-thread-1] DEBUG org.apache.mina.core.filterchain.IoFilterEvent - Event MESSAGE_SENT has been fired for session 2
19:12:29.559 [NioProcessor-3] INFO org.apache.mina.filter.logging.LoggingFilter - IDLE
19:12:29.559 [NioProcessor-3] DEBUG org.apache.mina.filter.executor.OrderedThreadPoolExecutor - Adding event SESSION_IDLE to session 2
Queue : [SESSION_IDLE, ]

19:12:29.559 [pool-3-thread-2] DEBUG org.apache.mina.core.filterchain.IoFilterEvent - Firing a SESSION_IDLE event for session 2
19:12:29.559 [pool-3-thread-2] DEBUG org.apache.mina.core.filterchain.IoFilterEvent - Event SESSION_IDLE has been fired for session 2
19:12:39.559 [NioProcessor-3] INFO org.apache.mina.filter.logging.LoggingFilter - IDLE
19:12:39.559 [NioProcessor-3] DEBUG org.apache.mina.filter.executor.OrderedThreadPoolExecutor - Adding event SESSION_IDLE to session 2
Queue : [SESSION_IDLE, ]

19:12:39.559 [pool-3-thread-1] DEBUG org.apache.mina.core.filterchain.IoFilterEvent - Firing a SESSION_IDLE event for session 2
19:12:39.559 [pool-3-thread-1] DEBUG org.apache.mina.core.filterchain.IoFilterEvent - Event SESSION_IDLE has been fired for session 2
19:12:49.560 [NioProcessor-3] INFO org.apache.mina.filter.logging.LoggingFilter - IDLE
19:12:49.560 [NioProcessor-3] DEBUG org.apache.mina.filter.executor.OrderedThreadPoolExecutor - Adding event SESSION_IDLE to session 2
Queue : [SESSION_IDLE, ]

19:12:49.560 [pool-3-thread-2] DEBUG org.apache.mina.core.filterchain.IoFilterEvent - Firing a SESSION_IDLE event for session 2
19:12:49.560 [pool-3-thread-2] DEBUG org.apache.mina.core.filterchain.IoFilterEvent - Event SESSION_IDLE has been fired for session 2
19:12:59.565 [NioProcessor-3] INFO org.apache.mina.filter.logging.LoggingFilter - IDLE
19:12:59.565 [NioProcessor-3] DEBUG org.apache.mina.filter.executor.OrderedThreadPoolExecutor - Adding event SESSION_IDLE to session 2
Queue : [SESSION_IDLE, ]
```