---
layout: post
title: "Mina编写同时支持TCP和HTTP的服务器"
categories: Mina2
tags: mina tcp http server
author: 玄玉
excerpt: 演示了Mina2.x编写的，同时监听两个端口，处理不同的TCP和HTTP请求的服务器。
---

* content
{:toc}


这里是用纯Mina2.x写的一个服务器实现，其不依赖任何第三方框架，运行时也不需要类似Tomcat的服务器

它比较适用后台服务（尽管也支持HTML页面），其内部同时支持TCP（自定义协议）和HTTP（HTTP1.0/1.1协议）请求

下面的示例只演示了比较核心的处理实现，供学习之用

实际使用的话，可能需要做一点扩展，比如接口配置、抽象顶层服务等等（这些在我的Github里面都有）

ok，let`s drink code ...

## 启动类

服务启动后，可用浏览器访问下面两个地址

1、[http://127.0.0.1:8000/](http://127.0.0.1:8000/)，这时浏览器会显示这几个字：欢迎访问由Mina2.0.7编写的Web服务器

2、[http://127.0.0.1:8000/login](http://127.0.0.1:8000/login)，这时浏览器会显示这几个字：登录成功

```java
package com.jadyer.demo.mina.server;
import com.jadyer.demo.mina.server.Handler.ServerHandler;
import com.jadyer.demo.mina.server.codec.ServerProtocolCodecFactory;
import org.apache.mina.filter.codec.ProtocolCodecFilter;
import org.apache.mina.filter.executor.ExecutorFilter;
import org.apache.mina.filter.logging.LoggingFilter;
import org.apache.mina.transport.socket.nio.NioSocketAcceptor;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.util.ArrayList;
import java.util.List;

/**
 * 服务启动类
 * Created by 玄玉<http://jadyer.cn/> on 2013/07/07 14:28.
 */
public class MainApp {
    public static void main(String[] args) throws IOException {
        NioSocketAcceptor acceptor = new NioSocketAcceptor();
        //这里并未配置backlog，那么它会采用操作系统默认的连接请求队列长度50
        //详见org.apache.mina.core.polling.AbstractPollingIoAcceptor类源码的96行
        //acceptor.setBacklog(0);
        acceptor.setReuseAddress(true);
        acceptor.getSessionConfig().setWriteTimeout(10000);
        acceptor.getSessionConfig().setBothIdleTime(90);
        acceptor.getFilterChain().addLast("logger", new LoggingFilter());
        acceptor.getFilterChain().addLast("codec", new ProtocolCodecFilter(new ServerProtocolCodecFactory()));
        acceptor.getFilterChain().addLast("executor", new ExecutorFilter());
        acceptor.setHandler(new ServerHandler());
        //服务端绑定两个端口，8000用于接收并处理HTTP请求，9000用于接收并处理TCP请求
        List<SocketAddress> socketAddresses = new ArrayList<>();
        socketAddresses.add(new InetSocketAddress(8000));
        socketAddresses.add(new InetSocketAddress(9000));
        acceptor.bind(socketAddresses);
        //判断服务端启动与否
        if(acceptor.isActive()){
            System.out.println("写 超 时: 10000ms");
            System.out.println("发呆配置: Both Idle 90s");
            System.out.println("端口重用: true");
            System.out.println("服务端初始化完成......");
            System.out.println("服务已启动...开始监听..." + acceptor.getLocalAddresses());
        }else{
            System.out.println("服务端初始化失败......");
        }
    }
}
```

## 消息处理器

下面是服务端消息处理器，它主要用来处理业务分发

目前只接收两种请求：TCP请求的固定业务编码为`10005`，HTTP请求的固定业务编码为`/login`（[http://127.0.0.1:8000/login](http://127.0.0.1:8000/login)）

```java
package com.jadyer.demo.mina.server.Handler;
import com.jadyer.demo.mina.server.model.Token;
import com.jadyer.demo.mina.server.util.JadyerUtil;
import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IdleStatus;
import org.apache.mina.core.session.IoSession;
import java.net.HttpURLConnection;

/**
 * 服务端消息处理器
 * Created by 玄玉<http://jadyer.cn/> on 2013/07/07 14:24.
 */
public class ServerHandler extends IoHandlerAdapter {
    @Override
    public void sessionIdle(IoSession session, IdleStatus status) throws Exception {
        System.out.println("请求进入闲置状态...回路即将关闭...");
        session.close(true);
    }

    @Override
    public void exceptionCaught(IoSession session, Throwable cause) throws Exception {
        System.out.println("请求处理遇到异常...回路即将关闭...");
        cause.printStackTrace();
        session.close(true);
    }

    @Override
    public void messageSent(IoSession session, Object message) throws Exception {
        System.out.println("已回应给Client");
        if(null != session){
            session.close(true);
        }
    }

    @Override
    public void messageReceived(IoSession session, Object message) throws Exception {
        String respData;
        Token token = (Token)message;
        //打印收到的原始报文
        System.out.println("渠道:" + token.getBusiType() + "  交易码:" + token.getBusiCode() + "  完整报文(HEX):"+JadyerUtil.buildHexStringWithASCII(JadyerUtil.getBytes(token.getFullMessage(), "UTF-8")));
        StringBuilder sb = new StringBuilder();
        sb.append("\r\n------------------------------------------------------------------------------------------");
        sb.append("\r\n【通信双方】").append(session);
        sb.append("\r\n【收发标识】Receive");
        sb.append("\r\n【报文内容】").append(token.getFullMessage());
        sb.append("\r\n------------------------------------------------------------------------------------------");
        System.out.println(sb.toString());
        //根据请求的业务编码做不同的处理
        switch (token.getBusiCode()) {
            case "/":
                respData = this.buildHTTPResponseMessage("<h2>欢迎访问由Mina2.0.7编写的Web服务器</h2>");
                break;
            case "/favicon.ico":
                //<link rel="icon" href="http://jadyer.cn/favicon.ico" type="image/x-icon"/>
                //<link rel="shortcut icon" href="http://jadyer.cn/favicon.ico" type="image/x-icon"/>
                String httpResponseMessageBody = "<link rel=\"icon\" href=\"http://jadyer.cn/favicon.ico\"";
                httpResponseMessageBody += " type=\"image/x-icon\"/>\n";
                httpResponseMessageBody += "<link rel=\"shortcut icon\" href=\"http://jadyer.cn/favicon.ico\"";
                httpResponseMessageBody += " type=\"image/x-icon\"/>";
                respData = this.buildHTTPResponseMessage(httpResponseMessageBody);
                break;
            case "/login":
                System.out.println("收到请求参数=[" + token.getBusiMessage() + "]");
                respData = this.buildHTTPResponseMessage("登录成功");
                break;
            case "10005":
                System.out.println("收到请求参数=[" + token.getBusiMessage() + "]");
                respData = "00003099999999`20130707144028`";
                break;
            default:
                switch (token.getBusiType()) {
                    case Token.BUSI_TYPE_TCP:
                        respData = "ILLEGAL_REQUEST";
                        break;
                    case Token.BUSI_TYPE_HTTP:
                        respData = this.buildHTTPResponseMessage(501, null);
                        break;
                    default:
                        respData = "UNKNOWN_REQUEST";
                        break;
                }
                break;
        }
        //打印应答报文
        sb.setLength(0);
        sb.append("\r\n------------------------------------------------------------------------------------------");
        sb.append("\r\n【通信双方】").append(session);
        sb.append("\r\n【收发标识】Response");
        sb.append("\r\n【报文内容】").append(respData);
        sb.append("\r\n------------------------------------------------------------------------------------------");
        System.out.println(sb.toString());
        session.write(respData);
    }

    /**
     * 构建HTTP响应报文
     * 该方法默认构建的是HTTP响应码为200的响应报文
     * @param httpResponseMessageBody HTTP响应报文体
     * @return 包含了HTTP响应报文头和报文体的完整报文
     */
    private String buildHTTPResponseMessage(String httpResponseMessageBody){
        return this.buildHTTPResponseMessage(HttpURLConnection.HTTP_OK, httpResponseMessageBody);
    }

    /**
     * 构建HTTP响应报文
     * 200--请求已成功，请求所希望的响应头或数据体将随此响应返回...即服务器已成功处理了请求
     * 400--由于包含语法错误，当前请求无法被服务器理解...除非进行修改，否则客户端不应该重复提交这个请求，即错误请求
     * 500--服务器遇到一个未曾预料的状况，致其无法完成请求的处理...一般该问题都会在服务器的程序码出错时出现，即服务器内部错误
     * 501--服务器不支持当前请求所需的某功能...当服务器无法识别请求，且无法支持其对任何资源的请求时，可能返回此代码，即尚未实施
     * @param httpResponseCode        HTTP响应码
     * @param httpResponseMessageBody HTTP响应报文体
     * @return 包含了HTTP响应报文头和报文体的完整报文
     */
    private String buildHTTPResponseMessage(int httpResponseCode, String httpResponseMessageBody){
        if(httpResponseCode == HttpURLConnection.HTTP_OK){
            StringBuilder sb = new StringBuilder();
            sb.append("HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Length: ");
            sb.append(JadyerUtil.getBytes(httpResponseMessageBody, "UTF-8").length);
            sb.append("\r\n\r\n");
            sb.append(httpResponseMessageBody);
            return sb.toString();
        }
        if(httpResponseCode == HttpURLConnection.HTTP_BAD_REQUEST){
            return "HTTP/1.1 400 Bad Request";
        }
        if(httpResponseCode == HttpURLConnection.HTTP_INTERNAL_ERROR){
            return "HTTP/1.1 500 Internal Server Error";
        }
        return "HTTP/1.1 501 Not Implemented";
    }
}
```

这是用到的封装客户端请求报文的实体类`Token.java`

```java
package com.jadyer.demo.mina.server.model;
/**
 * 封装客户端请求报文
 * Created by 玄玉<http://jadyer.cn/> on 2013/07/07 13:42.
 */
public class Token {
    public static final String BUSI_TYPE_TCP = "TCP";
    public static final String BUSI_TYPE_HTTP = "HTTP";
    private String busiCode;    //业务码
    private String busiType;    //业务类型：TCP or HTTP
    private String busiMessage; //业务报文：TCP请求时为TCP完整报文，HTTP_POST时为报文体部分，HTTP_GET时为报文头第一行参数部分
    private String busiCharset; //报文字符集
    private String fullMessage; //原始完整报文（用于在日志中打印最初接收到的原始完整报文）
    /*-- 五个属性的setter和getter略（不包括常量） --*/
}
```

这是用到的一个小工具类`JadyerUtil.java`

```java
package com.jadyer.demo.mina.server.util;
import java.io.UnsupportedEncodingException;

/**
 * Created by 玄玉<http://jadyer.cn/> on 2013/07/12 10:18.
 */
public final class JadyerUtil {
    private JadyerUtil(){}

    /**
     * 判断输入的字符串参数是否为空
     * @return boolean 空则返回true，非空则flase
     */
    public static boolean isEmpty(String input) {
        return null==input || 0==input.length() || 0==input.replaceAll("\\s", "").length();
    }

    /**
     * 判断输入的字节数组是否为空
     * @return boolean 空则返回true，非空则flase
     */
    public static boolean isEmpty(byte[] bytes){
        return null==bytes || 0==bytes.length;
    }

    /**
     * 字节数组转为字符串
     * @see 如果系统不支持所传入的<code>charset</code>字符集，则按照系统默认字符集进行转换
     */
    public static String getString(byte[] data, String charset){
        if(isEmpty(data)){
            return "";
        }
        if(isEmpty(charset)){
            return new String(data);
        }
        try {
            return new String(data, charset);
        } catch (UnsupportedEncodingException e) {
            System.out.println("将byte数组[" + data + "]转为String时发生异常：系统不支持该字符集[" + charset + "]");
            return new String(data);
        }
    }

    /**
     * 字符串转为字节数组
     * @see 如果系统不支持所传入的<code>charset</code>字符集，则按照系统默认字符集进行转换
     */
    public static byte[] getBytes(String data, String charset){
        data = (data==null ? "" : data);
        if(isEmpty(charset)){
            return data.getBytes();
        }
        try {
            return data.getBytes(charset);
        } catch (UnsupportedEncodingException e) {
            System.out.println("将字符串[" + data + "]转为byte[]时发生异常：系统不支持该字符集[" + charset + "]");
            return data.getBytes();
        }
    }

    /**
     * 通过ASCII码将十进制的字节数组格式化为十六进制字符串
     * @see 该方法会将字节数组中的所有字节均格式化为字符串
     */
    public static String buildHexStringWithASCII(byte[] data){
        return buildHexStringWithASCII(data, 0, data.length);
    }

    /**
     * 通过ASCII码将十进制的字节数组格式化为十六进制字符串
     * @see 该方法常用于字符串的十六进制打印，打印时左侧为十六进制数值，右侧为对应的字符串原文
     * @see 在构造右侧的字符串原文时，该方法内部使用的是平台的默认字符集，来解码byte[]数组
     * @see 该方法在将字节转为十六进制时，默认使用的是<code>java.util.Locale.getDefault()</code>
     * @see 详见String.format(String, Object...)方法和new String(byte[], int, int)构造方法
     * @param data   十进制的字节数组
     * @param offset 数组下标，标记从数组的第几个字节开始格式化输出
     * @param length 格式长度，其不得大于数组长度，否则抛出java.lang.ArrayIndexOutOfBoundsException
     * @return 格式化后的十六进制字符串
     */
    private static String buildHexStringWithASCII(byte[] data, int offset, int length){
        int end = offset + length;
        StringBuilder sb = new StringBuilder();
        StringBuilder sb2 = new StringBuilder();
        sb.append("\r\n------------------------------------------------------------------------");
        boolean chineseCutFlag = false;
        for(int i=offset; i<end; i+=16){
            //X或x表示将结果格式化为十六进制整数
            sb.append(String.format("\r\n%04X: ", i-offset));
            sb2.setLength(0);
            for(int j=i; j<i+16; j++){
                if(j < end){
                    byte b = data[j];
                    //ENG ASCII
                    if(b >= 0){
                        sb.append(String.format("%02X ", b));
                        //不可见字符
                        if(b<32 || b>126){
                            sb2.append(" ");
                        }else{
                            sb2.append((char)b);
                        }
                    //CHA ASCII
                    }else{
                        //汉字前半个字节
                        if(j == i+15){
                            sb.append(String.format("%02X ", data[j]));
                            chineseCutFlag = true;
                            String s = new String(data, j, 2);
                            sb2.append(s);
                        //后半个字节
                        }else if(j == i&&chineseCutFlag){
                            sb.append(String.format("%02X ", data[j]));
                            chineseCutFlag = false;
                            String s = new String(data, j, 1);
                            sb2.append(s);
                        }else{
                            sb.append(String.format("%02X %02X ", data[j], data[j + 1]));
                            String s = new String(data, j, 2);
                            sb2.append(s);
                            j++;
                        }
                    }
                }else{
                    sb.append("   ");
                }
            }
            sb.append("| ");
            sb.append(sb2.toString());
        }
        sb.append("\r\n------------------------------------------------------------------------");
        return sb.toString();
    }
}
```

## 编解码器

由于要同时处理TCP和HTTP请求，也就意味着需要自定义两个解码器，这时就用到了Mina提供的`DemuxingProtocolCodecFactory`

其内部维护了一个MessageDecoder数组，用于保存添加的所有解码器

每次decode()的时候就调用每个MessageDecoder的decodable()逐个检查

只要发现一个MessageDecoder不是对应的解码器，就从数组中移除，直到找到合适的MessageDecoder

如果最后发现数组为空，就表示没有找到对应的MessageDecoder，就会抛出异常

下面就是我们自定义的用于组装编解码器的工厂`ServerProtocolCodecFactory.java`

```java
package com.jadyer.demo.mina.server.codec;
import org.apache.mina.filter.codec.demux.DemuxingProtocolCodecFactory;

/**
 * 组装编解码器的工厂
 * Created by 玄玉<http://jadyer.cn/> on 2013/07/07 14:41.
 */
public class ServerProtocolCodecFactory extends DemuxingProtocolCodecFactory {
    public ServerProtocolCodecFactory(){
        super.addMessageEncoder(String.class, ServerProtocolEncoder.class);
        super.addMessageDecoder(ServerProtocolTCPDecoder.class);
        super.addMessageDecoder(ServerProtocolHTTPDecoder.class);
    }
}
```

下面是自定义的编码器`ServerProtocolEncoder.java`

```java
package com.jadyer.demo.mina.server.codec;
import org.apache.mina.core.buffer.IoBuffer;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.ProtocolEncoderOutput;
import org.apache.mina.filter.codec.demux.MessageEncoder;
import java.nio.charset.Charset;

/**
 * 自定义的编码器
 * Created by 玄玉<http://jadyer.cn/> on 2013/07/07 14:43.
 */
public class ServerProtocolEncoder implements MessageEncoder<String> {
    @Override
    public void encode(IoSession session, String message, ProtocolEncoderOutput out) throws Exception {
        IoBuffer buffer = IoBuffer.allocate(100).setAutoExpand(true);
        buffer.putString(message, Charset.forName("UTF-8").newEncoder());
        buffer.flip();
        out.write(buffer);
    }
}
```

下面是自定义的TCP协议解码器`ServerProtocolTCPDecoder.java`

```java
package com.jadyer.demo.mina.server.codec;
import com.jadyer.demo.mina.server.model.Token;
import com.jadyer.demo.mina.server.util.JadyerUtil;
import org.apache.mina.core.buffer.IoBuffer;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.ProtocolDecoderOutput;
import org.apache.mina.filter.codec.demux.MessageDecoder;
import org.apache.mina.filter.codec.demux.MessageDecoderResult;

/**
 * 自定义的TCP协议解码器
 * ----------------------------------------------------------------------------------------------
 * 收到数据包时，程序首先会执行decodable()方法，通过读取数据判断当前数据包是否可进行decode
 * 当decodable()方法返回MessageDecoderResult.OK时，接着会调用decode()方法，正式decode数据包
 * 在decode()方法进行读取操作会影响数据包的大小，decode需要判断协议中哪些已经decode完，哪些还没decode
 * decode完成后，通过ProtocolDecoderOutput.write()输出，并返回MessageDecoderResult.OK表示decode完毕
 * ----------------------------------------------------------------------------------------------
 * Created by 玄玉<http://jadyer.cn/> on 2013/07/07 13:44.
 */
public class ServerProtocolTCPDecoder implements MessageDecoder {
    @Override
    public void finishDecode(IoSession session, ProtocolDecoderOutput out) throws Exception {
        //暂时什么都不做
    }

    /**
     * 该方法相当于预读取，用于判断是否是可用的解码器，这里对IoBuffer读取不会影响数据包的大小
     * 该方法结束后IoBuffer会复原，所以不必担心调用该方法时，position已经不在缓冲区起始位置
     */
    @Override
    public MessageDecoderResult decodable(IoSession session, IoBuffer in) {
        //TCP报文格式约定为前6个字节表示报文整体长度，长度不足6位时左补零
        //第7位开始代表业务编码，业务编码固定长度为5，第12位开始是业务数据
        if(in.remaining() < 6){
            return MessageDecoderResult.NEED_DATA;
        }
        //服务端启动时已绑定9000端口，其专门用来处理TCP请求
        if(session.getLocalAddress().toString().contains(":9000")){
            byte[] messageLength = new byte[6];
            in.get(messageLength);
            if(in.limit() >= Integer.parseInt(JadyerUtil.getString(messageLength, "UTF-8"))){
                return MessageDecoderResult.OK;
            }else{
                return MessageDecoderResult.NEED_DATA;
            }
        }else{
            return MessageDecoderResult.NOT_OK;
        }
    }

    @Override
    public MessageDecoderResult decode(IoSession session, IoBuffer in, ProtocolDecoderOutput out) throws Exception {
        byte[] message = new byte[in.limit()];
        in.get(message);
        String fullMessage = JadyerUtil.getString(message, "UTF-8");
        Token token = new Token();
        token.setBusiCharset("UTF-8");
        token.setBusiType(Token.BUSI_TYPE_TCP);
        token.setBusiCode(fullMessage.substring(6, 11));
        token.setBusiMessage(fullMessage);
        token.setFullMessage(fullMessage);
        out.write(token);
        return MessageDecoderResult.OK;
    }
}
```

下面是自定义的HTTP协议解码器`ServerProtocolHTTPDecoder.java`

```java
package com.jadyer.demo.mina.server.codec;
import com.jadyer.demo.mina.server.model.Token;
import com.jadyer.demo.mina.server.util.JadyerUtil;
import org.apache.mina.core.buffer.IoBuffer;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.ProtocolDecoderOutput;
import org.apache.mina.filter.codec.demux.MessageDecoder;
import org.apache.mina.filter.codec.demux.MessageDecoderResult;

/**
 * 自定义的HTTP协议解码器
 * Created by 玄玉<http://jadyer.cn/> on 2013/07/07 13:44.
 */
public class ServerProtocolHTTPDecoder implements MessageDecoder {
    @Override
    public void finishDecode(IoSession session, ProtocolDecoderOutput out) throws Exception {
        //暂时什么都不做
    }

    @Override
    public MessageDecoderResult decodable(IoSession session, IoBuffer in) {
        if(in.remaining() < 5){
            return MessageDecoderResult.NEED_DATA;
        }
        //服务端启动时已绑定8000端口，其专门用来处理HTTP请求
        if(session.getLocalAddress().toString().contains(":8000")){
            return this.isComplete(in) ? MessageDecoderResult.OK : MessageDecoderResult.NEED_DATA;
        }else{
            return MessageDecoderResult.NOT_OK;
        }
    }

    @Override
    public MessageDecoderResult decode(IoSession session, IoBuffer in, ProtocolDecoderOutput out) throws Exception {
        byte[] message = new byte[in.limit()];
        in.get(message);
        String fullMessage = JadyerUtil.getString(message, "UTF-8");
        Token token = new Token();
        token.setBusiCharset("UTF-8");
        token.setBusiType(Token.BUSI_TYPE_HTTP);
        token.setFullMessage(fullMessage);
        if(fullMessage.startsWith("GET")){
            if(fullMessage.startsWith("GET / HTTP/1.1")){
                token.setBusiCode("/");
            }else if(fullMessage.startsWith("GET /favicon.ico HTTP/1.1")){
                token.setBusiCode("/favicon.ico");
            }else{
                //GET /login?aa=bb&cc=dd&ee=ff HTTP/1.1
                if(fullMessage.substring(4, fullMessage.indexOf("\r\n")).contains("?")){
                    token.setBusiCode(fullMessage.substring(4, fullMessage.indexOf("?")));
                    token.setBusiMessage(fullMessage.substring(fullMessage.indexOf("?")+1, fullMessage.indexOf("HTTP/1.1")-1));
                    //GET /login HTTP/1.1
                }else{
                    token.setBusiCode(fullMessage.substring(4, fullMessage.indexOf("HTTP")-1));
                }
            }
        }else if(fullMessage.startsWith("POST")){
            //先获取到请求报文头中的Content-Length
            int contentLength = 0;
            if(fullMessage.contains("Content-Length:")){
                String msgLenFlag = fullMessage.substring(fullMessage.indexOf("Content-Length:") + 15);
                if(msgLenFlag.contains("\r\n")){
                    contentLength = Integer.parseInt(msgLenFlag.substring(0, msgLenFlag.indexOf("\r\n")).trim());
                    if(contentLength > 0){
                        token.setBusiMessage(fullMessage.split("\r\n\r\n")[1]);
                    }
                }
            }
            //POST /login?aa=bb&cc=dd&ee=ff HTTP/1.1
            //特别说明：此时报文体本应该是空的，即Content-Length=0，但不能排除对方偏偏在报文体中也传了参数
            //特别说明：所以这里的处理手段是busiMessage=请求URL中的参数串 + "`" + 报文体中的参数串（如果存在报文体的话）
            if(fullMessage.substring(5, fullMessage.indexOf("\r\n")).contains("?")){
                token.setBusiCode(fullMessage.substring(5, fullMessage.indexOf("?")));
                String urlParam = fullMessage.substring(fullMessage.indexOf("?")+1, fullMessage.indexOf("HTTP/1.1")-1);
                if(contentLength > 0){
                    token.setBusiMessage(urlParam + "`" + fullMessage.split("\r\n\r\n")[1]);
                }else{
                    token.setBusiMessage(urlParam);
                }
                //POST /login HTTP/1.1
            }else{
                token.setBusiCode(fullMessage.substring(5, fullMessage.indexOf("HTTP/1.1")-1));
            }
        }
        out.write(token);
        return MessageDecoderResult.OK;
    }

    /**
     * 校验HTTP请求报文是否已完整接收（目前仅授理GET和POST请求）
     * 关于HTTP请求的样例报文，可参考http://jadyer.cn/2012/11/22/linux-crlf/
     * @param in 装载HTTP请求报文的IoBuffer
     */
    private boolean isComplete(IoBuffer in){
        //先获取HTTP请求的原始报文
        byte[] messages = new byte[in.limit()];
        in.get(messages);
        String message = JadyerUtil.getString(messages, "UTF-8");
        //授理GET请求
        if(message.startsWith("GET")){
            return message.endsWith("\r\n\r\n");
        }
        //授理POST请求
        if(message.startsWith("POST")){
            if(message.contains("Content-Length:")){
                //取Content-Length后的字符串
                String msgLenFlag = message.substring(message.indexOf("Content-Length:") + 15);
                if(msgLenFlag.contains("\r\n")){
                    //取Content-Length值
                    int contentLength = Integer.parseInt(msgLenFlag.substring(0, msgLenFlag.indexOf("\r\n")).trim());
                    if(contentLength == 0){
                        return true;
                    }else if(contentLength > 0){
                        //取HTTP_POST请求报文体
                        String messageBody = message.split("\r\n\r\n")[1];
                        if(contentLength == JadyerUtil.getBytes(messageBody, "UTF-8").length){
                            return true;
                        }
                    }
                }
            }
        }
        //仅授理GET和POST请求
        return false;
    }
}
```

## Mina工具类

该工具类适用于本文自定义的TCP协议处理，对于其它协议，触类旁通修改编解码器就行了

```java
package com.jadyer.demo.mina.server.util;
import org.apache.mina.core.buffer.IoBuffer;
import org.apache.mina.core.future.ConnectFuture;
import org.apache.mina.core.future.ReadFuture;
import org.apache.mina.core.service.IoConnector;
import org.apache.mina.core.session.AttributeKey;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.CumulativeProtocolDecoder;
import org.apache.mina.filter.codec.ProtocolCodecFilter;
import org.apache.mina.filter.codec.ProtocolDecoderOutput;
import org.apache.mina.filter.codec.ProtocolEncoderAdapter;
import org.apache.mina.filter.codec.ProtocolEncoderOutput;
import org.apache.mina.transport.socket.nio.NioSocketConnector;
import java.net.InetSocketAddress;
import java.nio.charset.Charset;
import java.util.concurrent.TimeUnit;

/**
 * 使用Mina2.x发送报文的工具类
 * ----------------------------------------------------------------------------------------------
 * v1.5
 * v1.1-->编码器和解码器中的字符处理，升级为Mina2.x提供的<code>putString()</code>方法来处理
 * v1.2-->解码器采用CumulativeProtocolDecoder实现，以适应应答报文被拆分多次后发送Client的情况
 * v1.3-->修复BUG：请求报文有误时，Server可能返回非约定报文，此时会抛java.lang.NumberFormatException
 * v1.4-->增加全局异常捕获
 * v1.5-->由于本工具类的作用是同步的客户端，故取消IoHandler设置，但注意必须setUseReadOperation(true)
 * ----------------------------------------------------------------------------------------------
 * Created by 玄玉<http://jadyer.cn/> on 2012/10/03 12:42.
 */
public final class MinaUtil {
    private MinaUtil(){}

    /**
     * 发送TCP消息（当通信发生异常时，比如Fail to get session，它会返回"MINA_SERVER_ERROR"字符串）
     * @param message   待发送报文的中文字符串形式
     * @param ip        远程主机的IP地址
     * @param port      远程主机的端口号
     * @param charset   该方法与远程主机间通信报文为编码字符集（编码为byte[]发送到Server）
     * @return 远程主机响应报文的字符串形式
     */
    public static String sendTCPMessage(String message, String ip, int port, String charset){
        IoConnector connector = new NioSocketConnector();
        connector.setConnectTimeoutMillis(1000);
        //同步的客户端，必须设置此项，其默认为false
        connector.getSessionConfig().setUseReadOperation(true);
        connector.getFilterChain().addLast("codec", new ProtocolCodecFilter(
            new ClientProtocolEncoder(), new ClientProtocolDecode()
        ));
        //作为同步的客户端，可以不需要IoHandler，Mina会自动添加一个默认的IoHandler实现（即AbstractIoConnector）
        //connector.setHandler(this);
        IoSession session = null;
        Object respData = null;
        try{
            ConnectFuture connectFuture = connector.connect(new InetSocketAddress(ip, port));
            //等待连接成功，相当于将异步执行转为同步执行
            connectFuture.awaitUninterruptibly();
            //获取连接成功后的会话对象
            session = connectFuture.getSession();
            session.write(message).awaitUninterruptibly();
            //由于上面已经设置setUseReadOperation(true)，所以IoSession.read()方法才可用
            //因其内部使用BlockingQueue，所以Server端使用它的时候可能导致内存泄漏，但客户端可以适当使用
            ReadFuture readFuture = session.read();
            //Wait until the message is received
            if(readFuture.awaitUninterruptibly(90, TimeUnit.SECONDS)){
                //Get the received message
                respData = readFuture.getMessage();
            }else{
                System.out.println("读取[/" + ip + ":" + port + "]超时");
            }
        }catch(Exception e){
            System.out.println("请求通信[/" + ip + ":" + port + "]时发生异常，堆栈轨迹如下");
            e.printStackTrace();
        }finally{
            if(null != session){
                //关闭IoSession，该操作是异步的，true为立即关闭，false为所有写操作都flush后关闭
                //这里仅仅是关闭了TCP的连接通道，并未关闭Client端程序
                session.close(true);
                //客户端发起连接时，会请求系统分配相关的文件句柄，而在连接失败时记得释放资源，否则时间长了会造成文件句柄泄露
                //当总的文件句柄数超过系统设置值时[ulimit -n]时，会抛出异常"java.io.IOException: Too many open files"
                //这会导致新连接无法创建，服务器直接挂掉
                session.getService().dispose();
            }
        }
        return null==respData ? "MINA_SERVER_ERROR" : respData.toString();
    }

    /**
     * 自定义编码器
     */
    private static class ClientProtocolEncoder extends ProtocolEncoderAdapter {
        @Override
        public void encode(IoSession session, Object message, ProtocolEncoderOutput out) throws Exception {
            IoBuffer buffer = IoBuffer.allocate(100).setAutoExpand(true);
            //二者等效：buffer.put(message.toString().getBytes("UTF-8"))
            buffer.putString(message.toString(), Charset.forName("UTF-8").newEncoder());
            buffer.flip();
            out.write(buffer);
        }
    }

    /**
     * 自定义解码器（样例报文：000064100030010000120121101210419100000000000028`18622233125`10`）
     */
    private static class ClientProtocolDecode extends CumulativeProtocolDecoder {
        //注意这里使用了Mina自带的AttributeKey类来定义保存在IoSession中对象的键值，其可有效防止键值重复
        //通过查询AttributeKey类源码发现，它的构造方法采用的是"类名+键名+AttributeKey的hashCode"的方式
        private final AttributeKey CONTEXT = new AttributeKey(getClass(), "context");
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
            int messageCount = ctx.getMessageCount();
            //判断position和limit之间是否有元素
            while(in.hasRemaining()){
                //get()读取buffer的position的字节，然后position+1
                buffer.put(in.get());
                //约定：报文的前6个字符串表示报文总长度，不足6位则左侧补0
                if(messageCount++ == 5){
                    //Set limit=position and position=0 and mark=-1
                    buffer.flip();
                    //当Server的响应报文中含0x00时，Mina2.x的buffer.getString(fieldSize, decoder)方法会break
                    //该方法的处理细节，详见org.apache.mina.core.buffer.AbstractIoBuffer类的第1718行源码，其说明如下
                    //Reads a NUL-terminated string from this buffer using the specified decoder and returns it
                    //ctx.setMessageLength(Integer.parseInt(buffer.getString(6, decoder)));
                    byte[] messageLength = new byte[6];
                    buffer.get(messageLength);
                    try{
                        //请求报文有误时，Server可能返回非约定报文，此时会抛java.lang.NumberFormatException
                        ctx.setMessageLength(Integer.parseInt(new String(messageLength, "UTF-8")));
                    }catch(NumberFormatException e){
                        ctx.setMessageLength(in.limit());
                    }
                    //让两个IoBuffer的limit相等
                    buffer.limit(in.limit());
                }
            }
            ctx.setMessageCount(messageCount);
            if(ctx.getMessageLength() == buffer.position()){
                buffer.flip();
                byte[] message = new byte[buffer.limit()];
                buffer.get(message);
                out.write(new String(message, "UTF-8"));
                ctx.reset();
                return true;
            }else{
                return false;
            }
        }
        private class Context{
            private final IoBuffer innerBuffer; //用于累积数据的IoBuffer
            private int messageCount;           //记录已读取的报文字节数
            private int messageLength;          //记录已读取的报文头标识的报文长度
            Context(){
                innerBuffer = IoBuffer.allocate(100).setAutoExpand(true);
            }
            int getMessageCount() {
                return messageCount;
            }
            void setMessageCount(int messageCount) {
                this.messageCount = messageCount;
            }
            int getMessageLength() {
                return messageLength;
            }
            void setMessageLength(int messageLength) {
                this.messageLength = messageLength;
            }
            void reset(){
                //Set limit=capacity and position=0 and mark=-1
                this.innerBuffer.clear();
                this.messageCount = 0;
                this.messageLength = 0;
            }
        }
    }
}
```

## 测试一下

执行`MainApp.main()`启动服务后，除了浏览器访问，也可以用工具直接发TCP和HTTP消息，如下所示

```java
package com.jadyer.demo.mina.server.test;
import com.jadyer.demo.mina.server.util.MinaUtil;
import com.msxf.open.mpp.sdk.util.HttpUtil;
import org.junit.Assert;
import org.junit.Test;
import java.util.HashMap;
import java.util.Map;

/**
 * 测试MinaServer
 * 这里用到的HttpUtil，详见https://github.com/jadyer/seed/blob/master/seed-comm/src/main/java/com/jadyer/seed/comm/util/HttpUtil.java
 * Created by 玄玉<http://jadyer.cn/> on 2013/07/09 19:59.
 */
public class TestMinaServer {
    @Test
    public void testTcp(){
        String message = "00004710005101101992012092222400000201307071605";
        String respData = MinaUtil.sendTCPMessage(message, "127.0.0.1", 9000, "UTF-8");
        Assert.assertEquals("00003099999999`20130707144028`", respData);
    }

    /**
     * 也可直接浏览器访问http://127.0.0.1:8000/login以及http://127.0.0.1:8000/login?a=b&c=d&e=f
     * 只要浏览器页面显示"登录成功",即表示HTTP_GET测试通过
     */
    @Test
    public void testHttpGet(){
        //先测试带参数的GET请求
        String respData11 = HttpUtil.get("http://127.0.0.1:8000/login?a=b&c=d&e=f");
        Assert.assertEquals("登录成功", respData11);
        //再测试不带参数的GET请求
        String respData22 = HttpUtil.get("http://127.0.0.1:8000/login");
        Assert.assertEquals("登录成功", respData22);
    }

    @Test
    public void testHttpPost(){
        //先测试带报文体的POST请求(即带参数，模拟表单提交)
        String reqURL = "http://127.0.0.1:8000/login";
        Map<String, String> params = new HashMap<>();
        params.put("username", "Jadyer");
        params.put("password", "xuanyu");
        String respData11 = HttpUtil.post(reqURL, params);
        Assert.assertEquals("登录成功", respData11);
        //再测试不带报文体的POST请求（不带参数）
        String respData22 = HttpUtil.post(reqURL, new HashMap<String, String>());
        Assert.assertEquals("登录成功", respData22);
        //最后测试一下特殊情况，即不带报文体，但在请求地址上带有参数的POST请求（建行外联平台就是这么干的）
        reqURL = "http://127.0.0.1:8000/login?username=Jadyer&password=xuanyu&aa=bb&cc=dd";
        String respData33 = HttpUtil.post(reqURL, new HashMap<String, String>());
        Assert.assertEquals("登录成功", respData33);
    }
}
```

## 控制台输出

* **最初的博文并没有这一部分，这是2016-12-17 22:25后补充的控制台输出**

* **也是为了网友翻看的时候，方便理解上面的处理逻辑，毕竟不是每个人都会把代码拷下来运行一遍**

这是TCP测试时的服务端控制台输出

```
写 超 时: 10000ms
发呆配置: Both Idle 90s
端口重用: true
服务端初始化完成......
服务已启动...开始监听...[/0:0:0:0:0:0:0:0:8000, /0:0:0:0:0:0:0:0:9000]
[20161217 22:25:34][NioProcessor-3][LoggingFilter.log]CREATED
[20161217 22:25:34][NioProcessor-3][LoggingFilter.log]OPENED
[20161217 22:25:34][NioProcessor-3][LoggingFilter.log]RECEIVED: HeapBuffer[pos=0 lim=47 cap=2048: 30 30 30 30 34 37 31 30 30 30 35 31 30 31 31 30...]
渠道:TCP  交易码:10005  完整报文(HEX):
------------------------------------------------------------------------
0000: 30 30 30 30 34 37 31 30 30 30 35 31 30 31 31 30 | 0000471000510110
0010: 31 39 39 32 30 31 32 30 39 32 32 32 32 34 30 30 | 1992012092222400
0020: 30 30 30 32 30 31 33 30 37 30 37 31 36 30 35    | 000201307071605
------------------------------------------------------------------------

------------------------------------------------------------------------------------------
【通信双方】(0x00000002: nio socket, server, /127.0.0.1:54723 => /127.0.0.1:9000)
【收发标识】Receive
【报文内容】00004710005101101992012092222400000201307071605
------------------------------------------------------------------------------------------
收到请求参数=[00004710005101101992012092222400000201307071605]

------------------------------------------------------------------------------------------
【通信双方】(0x00000002: nio socket, server, /127.0.0.1:54723 => /127.0.0.1:9000)
【收发标识】Response
【报文内容】00003099999999`20130707144028`
------------------------------------------------------------------------------------------
[20161217 22:25:34][NioProcessor-3][LoggingFilter.log]SENT: 00003099999999`20130707144028`
已回应给Client
[20161217 22:25:35][NioProcessor-3][LoggingFilter.log]CLOSED
```

这是HTTP_GET测试时的客户端控制台输出

```
-----------------------------------------------------------------------------
HTTP应答完整报文=[HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 12

登录成功]
-----------------------------------------------------------------------------
-----------------------------------------------------------------------------
HTTP应答完整报文=[HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 12

登录成功]
-----------------------------------------------------------------------------
```

对应的HTTP_GET测试时的服务端控制台输出，如下

```
写 超 时: 10000ms
发呆配置: Both Idle 90s
端口重用: true
服务端初始化完成......
服务已启动...开始监听...[/0:0:0:0:0:0:0:0:8000, /0:0:0:0:0:0:0:0:9000]
[20161217 22:26:58][NioProcessor-3][LoggingFilter.log]CREATED
[20161217 22:26:58][NioProcessor-3][LoggingFilter.log]OPENED
[20161217 22:26:58][NioProcessor-3][LoggingFilter.log]RECEIVED: HeapBuffer[pos=0 lim=134 cap=2048: 47 45 54 20 2F 6C 6F 67 69 6E 3F 61 3D 62 26 63...]
渠道:HTTP  交易码:/login  完整报文(HEX):
------------------------------------------------------------------------
0000: 47 45 54 20 2F 6C 6F 67 69 6E 3F 61 3D 62 26 63 | GET /login?a=b&c
0010: 3D 64 26 65 3D 66 20 48 54 54 50 2F 31 2E 31 0D | =d&e=f HTTP/1.1
0020: 0A 48 6F 73 74 3A 20 31 32 37 2E 30 2E 30 2E 31 |  Host: 127.0.0.1
0030: 3A 38 30 30 30 0D 0A 43 6F 6E 6E 65 63 74 69 6F | :8000  Connectio
0040: 6E 3A 20 4B 65 65 70 2D 41 6C 69 76 65 0D 0A 55 | n: Keep-Alive  U
0050: 73 65 72 2D 41 67 65 6E 74 3A 20 41 70 61 63 68 | ser-Agent: Apach
0060: 65 2D 48 74 74 70 43 6C 69 65 6E 74 2F 34 2E 35 | e-HttpClient/4.5
0070: 2E 32 20 28 4A 61 76 61 2F 31 2E 38 2E 30 5F 37 | .2 (Java/1.8.0_7
0080: 37 29 0D 0A 0D 0A                               | 7)
------------------------------------------------------------------------

------------------------------------------------------------------------------------------
【通信双方】(0x00000002: nio socket, server, /127.0.0.1:54906 => /127.0.0.1:8000)
【收发标识】Receive
【报文内容】GET /login?a=b&c=d&e=f HTTP/1.1
Host: 127.0.0.1:8000
Connection: Keep-Alive
User-Agent: Apache-HttpClient/4.5.2 (Java/1.8.0_77)


------------------------------------------------------------------------------------------
收到请求参数=[a=b&c=d&e=f]

------------------------------------------------------------------------------------------
【通信双方】(0x00000002: nio socket, server, /127.0.0.1:54906 => /127.0.0.1:8000)
【收发标识】Response
【报文内容】HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 12

登录成功
------------------------------------------------------------------------------------------
[20161217 22:26:58][NioProcessor-3][LoggingFilter.log]SENT: HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 12

登录成功
[20161217 22:26:59][NioProcessor-3][LoggingFilter.log]CLOSED
[20161217 22:26:59][NioProcessor-4][LoggingFilter.log]CREATED
[20161217 22:26:59][NioProcessor-4][LoggingFilter.log]OPENED
[20161217 22:26:59][NioProcessor-4][LoggingFilter.log]RECEIVED: HeapBuffer[pos=0 lim=122 cap=2048: 47 45 54 20 2F 6C 6F 67 69 6E 20 48 54 54 50 2F...]
已回应给Client
渠道:HTTP  交易码:/login  完整报文(HEX):
------------------------------------------------------------------------
0000: 47 45 54 20 2F 6C 6F 67 69 6E 20 48 54 54 50 2F | GET /login HTTP/
0010: 31 2E 31 0D 0A 48 6F 73 74 3A 20 31 32 37 2E 30 | 1.1  Host: 127.0
0020: 2E 30 2E 31 3A 38 30 30 30 0D 0A 43 6F 6E 6E 65 | .0.1:8000  Conne
0030: 63 74 69 6F 6E 3A 20 4B 65 65 70 2D 41 6C 69 76 | ction: Keep-Aliv
0040: 65 0D 0A 55 73 65 72 2D 41 67 65 6E 74 3A 20 41 | e  User-Agent: A
0050: 70 61 63 68 65 2D 48 74 74 70 43 6C 69 65 6E 74 | pache-HttpClient
0060: 2F 34 2E 35 2E 32 20 28 4A 61 76 61 2F 31 2E 38 | /4.5.2 (Java/1.8
0070: 2E 30 5F 37 37 29 0D 0A 0D 0A                   | .0_77)
------------------------------------------------------------------------

------------------------------------------------------------------------------------------
【通信双方】(0x00000003: nio socket, server, /127.0.0.1:54908 => /127.0.0.1:8000)
【收发标识】Receive
【报文内容】GET /login HTTP/1.1
Host: 127.0.0.1:8000
Connection: Keep-Alive
User-Agent: Apache-HttpClient/4.5.2 (Java/1.8.0_77)


------------------------------------------------------------------------------------------
收到请求参数=[null]

------------------------------------------------------------------------------------------
【通信双方】(0x00000003: nio socket, server, /127.0.0.1:54908 => /127.0.0.1:8000)
【收发标识】Response
【报文内容】HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 12

登录成功
------------------------------------------------------------------------------------------
[20161217 22:26:59][NioProcessor-4][LoggingFilter.log]SENT: HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 12

登录成功
已回应给Client
[20161217 22:26:59][NioProcessor-4][LoggingFilter.log]CLOSED
```

这是HTTP_POST测试时的客户端控制台输出

```
[20161217 22:31:34][main][HttpUtil.post]请求http://127.0.0.1:8000/login的报文为-->>java.util.HashMap@265485100[
password=xuanyu
username=Jadyer
]
[20161217 22:31:36][main][HttpUtil.post]请求http://127.0.0.1:8000/login得到应答<<--[登录成功]
[20161217 22:31:36][main][HttpUtil.post]请求http://127.0.0.1:8000/login的报文为-->>
[20161217 22:31:36][main][HttpUtil.post]请求http://127.0.0.1:8000/login得到应答<<--[登录成功]
[20161217 22:31:36][main][HttpUtil.post]请求http://127.0.0.1:8000/login?username=Jadyer&password=xuanyu&aa=bb&cc=dd的报文为-->>
[20161217 22:31:36][main][HttpUtil.post]请求http://127.0.0.1:8000/login?username=Jadyer&password=xuanyu&aa=bb&cc=dd得到应答<<--[登录成功]
```

对应的HTTP_POST测试时的服务端控制台输出，如下

```
写 超 时: 10000ms
发呆配置: Both Idle 90s
端口重用: true
服务端初始化完成......
服务已启动...开始监听...[/0:0:0:0:0:0:0:0:8000, /0:0:0:0:0:0:0:0:9000]
[20161217 22:31:35][NioProcessor-3][LoggingFilter.log]CREATED
[20161217 22:31:35][NioProcessor-3][LoggingFilter.log]OPENED
[20161217 22:31:35][NioProcessor-3][LoggingFilter.log]RECEIVED: HeapBuffer[pos=0 lim=238 cap=2048: 50 4F 53 54 20 2F 6C 6F 67 69 6E 20 48 54 54 50...]
渠道:HTTP  交易码:/login  完整报文(HEX):
------------------------------------------------------------------------
0000: 50 4F 53 54 20 2F 6C 6F 67 69 6E 20 48 54 54 50 | POST /login HTTP
0010: 2F 31 2E 31 0D 0A 43 6F 6E 74 65 6E 74 2D 4C 65 | /1.1  Content-Le
0020: 6E 67 74 68 3A 20 33 31 0D 0A 43 6F 6E 74 65 6E | ngth: 31  Conten
0030: 74 2D 54 79 70 65 3A 20 61 70 70 6C 69 63 61 74 | t-Type: applicat
0040: 69 6F 6E 2F 78 2D 77 77 77 2D 66 6F 72 6D 2D 75 | ion/x-www-form-u
0050: 72 6C 65 6E 63 6F 64 65 64 3B 20 63 68 61 72 73 | rlencoded; chars
0060: 65 74 3D 55 54 46 2D 38 0D 0A 48 6F 73 74 3A 20 | et=UTF-8  Host:
0070: 31 32 37 2E 30 2E 30 2E 31 3A 38 30 30 30 0D 0A | 127.0.0.1:8000
0080: 43 6F 6E 6E 65 63 74 69 6F 6E 3A 20 4B 65 65 70 | Connection: Keep
0090: 2D 41 6C 69 76 65 0D 0A 55 73 65 72 2D 41 67 65 | -Alive  User-Age
00A0: 6E 74 3A 20 41 70 61 63 68 65 2D 48 74 74 70 43 | nt: Apache-HttpC
00B0: 6C 69 65 6E 74 2F 34 2E 35 2E 32 20 28 4A 61 76 | lient/4.5.2 (Jav
00C0: 61 2F 31 2E 38 2E 30 5F 37 37 29 0D 0A 0D 0A 70 | a/1.8.0_77)    p
00D0: 61 73 73 77 6F 72 64 3D 78 75 61 6E 79 75 26 75 | assword=xuanyu&u
00E0: 73 65 72 6E 61 6D 65 3D 4A 61 64 79 65 72       | sername=Jadyer
------------------------------------------------------------------------

------------------------------------------------------------------------------------------
【通信双方】(0x00000002: nio socket, server, /127.0.0.1:55368 => /127.0.0.1:8000)
【收发标识】Receive
【报文内容】POST /login HTTP/1.1
Content-Length: 31
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Host: 127.0.0.1:8000
Connection: Keep-Alive
User-Agent: Apache-HttpClient/4.5.2 (Java/1.8.0_77)

password=xuanyu&username=Jadyer
------------------------------------------------------------------------------------------
收到请求参数=[password=xuanyu&username=Jadyer]

------------------------------------------------------------------------------------------
【通信双方】(0x00000002: nio socket, server, /127.0.0.1:55368 => /127.0.0.1:8000)
【收发标识】Response
【报文内容】HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 12

登录成功
------------------------------------------------------------------------------------------
[20161217 22:31:36][NioProcessor-3][LoggingFilter.log]SENT: HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 12

登录成功
已回应给Client
[20161217 22:31:36][NioProcessor-3][LoggingFilter.log]CLOSED
[20161217 22:31:36][NioProcessor-4][LoggingFilter.log]CREATED
[20161217 22:31:36][NioProcessor-4][LoggingFilter.log]OPENED
[20161217 22:31:36][NioProcessor-4][LoggingFilter.log]RECEIVED: HeapBuffer[pos=0 lim=206 cap=2048: 50 4F 53 54 20 2F 6C 6F 67 69 6E 20 48 54 54 50...]
渠道:HTTP  交易码:/login  完整报文(HEX):
------------------------------------------------------------------------
0000: 50 4F 53 54 20 2F 6C 6F 67 69 6E 20 48 54 54 50 | POST /login HTTP
0010: 2F 31 2E 31 0D 0A 43 6F 6E 74 65 6E 74 2D 4C 65 | /1.1  Content-Le
0020: 6E 67 74 68 3A 20 30 0D 0A 43 6F 6E 74 65 6E 74 | ngth: 0  Content
0030: 2D 54 79 70 65 3A 20 61 70 70 6C 69 63 61 74 69 | -Type: applicati
0040: 6F 6E 2F 78 2D 77 77 77 2D 66 6F 72 6D 2D 75 72 | on/x-www-form-ur
0050: 6C 65 6E 63 6F 64 65 64 3B 20 63 68 61 72 73 65 | lencoded; charse
0060: 74 3D 55 54 46 2D 38 0D 0A 48 6F 73 74 3A 20 31 | t=UTF-8  Host: 1
0070: 32 37 2E 30 2E 30 2E 31 3A 38 30 30 30 0D 0A 43 | 27.0.0.1:8000  C
0080: 6F 6E 6E 65 63 74 69 6F 6E 3A 20 4B 65 65 70 2D | onnection: Keep-
0090: 41 6C 69 76 65 0D 0A 55 73 65 72 2D 41 67 65 6E | Alive  User-Agen
00A0: 74 3A 20 41 70 61 63 68 65 2D 48 74 74 70 43 6C | t: Apache-HttpCl
00B0: 69 65 6E 74 2F 34 2E 35 2E 32 20 28 4A 61 76 61 | ient/4.5.2 (Java
00C0: 2F 31 2E 38 2E 30 5F 37 37 29 0D 0A 0D 0A       | /1.8.0_77)
------------------------------------------------------------------------

------------------------------------------------------------------------------------------
【通信双方】(0x00000003: nio socket, server, /127.0.0.1:55369 => /127.0.0.1:8000)
【收发标识】Receive
【报文内容】POST /login HTTP/1.1
Content-Length: 0
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Host: 127.0.0.1:8000
Connection: Keep-Alive
User-Agent: Apache-HttpClient/4.5.2 (Java/1.8.0_77)


------------------------------------------------------------------------------------------
收到请求参数=[null]

------------------------------------------------------------------------------------------
【通信双方】(0x00000003: nio socket, server, /127.0.0.1:55369 => /127.0.0.1:8000)
【收发标识】Response
【报文内容】HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 12

登录成功
------------------------------------------------------------------------------------------
[20161217 22:31:36][NioProcessor-4][LoggingFilter.log]SENT: HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 12

登录成功
[20161217 22:31:36][NioProcessor-4][LoggingFilter.log]CLOSED
已回应给Client
[20161217 22:31:36][NioProcessor-5][LoggingFilter.log]CREATED
[20161217 22:31:36][NioProcessor-5][LoggingFilter.log]OPENED
[20161217 22:31:36][NioProcessor-5][LoggingFilter.log]RECEIVED: HeapBuffer[pos=0 lim=250 cap=2048: 50 4F 53 54 20 2F 6C 6F 67 69 6E 3F 75 73 65 72...]
渠道:HTTP  交易码:/login  完整报文(HEX):
------------------------------------------------------------------------
0000: 50 4F 53 54 20 2F 6C 6F 67 69 6E 3F 75 73 65 72 | POST /login?user
0010: 6E 61 6D 65 3D 4A 61 64 79 65 72 26 70 61 73 73 | name=Jadyer&pass
0020: 77 6F 72 64 3D 78 75 61 6E 79 75 26 61 61 3D 62 | word=xuanyu&aa=b
0030: 62 26 63 63 3D 64 64 20 48 54 54 50 2F 31 2E 31 | b&cc=dd HTTP/1.1
0040: 0D 0A 43 6F 6E 74 65 6E 74 2D 4C 65 6E 67 74 68 |   Content-Length
0050: 3A 20 30 0D 0A 43 6F 6E 74 65 6E 74 2D 54 79 70 | : 0  Content-Typ
0060: 65 3A 20 61 70 70 6C 69 63 61 74 69 6F 6E 2F 78 | e: application/x
0070: 2D 77 77 77 2D 66 6F 72 6D 2D 75 72 6C 65 6E 63 | -www-form-urlenc
0080: 6F 64 65 64 3B 20 63 68 61 72 73 65 74 3D 55 54 | oded; charset=UT
0090: 46 2D 38 0D 0A 48 6F 73 74 3A 20 31 32 37 2E 30 | F-8  Host: 127.0
00A0: 2E 30 2E 31 3A 38 30 30 30 0D 0A 43 6F 6E 6E 65 | .0.1:8000  Conne
00B0: 63 74 69 6F 6E 3A 20 4B 65 65 70 2D 41 6C 69 76 | ction: Keep-Aliv
00C0: 65 0D 0A 55 73 65 72 2D 41 67 65 6E 74 3A 20 41 | e  User-Agent: A
00D0: 70 61 63 68 65 2D 48 74 74 70 43 6C 69 65 6E 74 | pache-HttpClient
00E0: 2F 34 2E 35 2E 32 20 28 4A 61 76 61 2F 31 2E 38 | /4.5.2 (Java/1.8
00F0: 2E 30 5F 37 37 29 0D 0A 0D 0A                   | .0_77)
------------------------------------------------------------------------

------------------------------------------------------------------------------------------
【通信双方】(0x00000004: nio socket, server, /127.0.0.1:55370 => /127.0.0.1:8000)
【收发标识】Receive
【报文内容】POST /login?username=Jadyer&password=xuanyu&aa=bb&cc=dd HTTP/1.1
Content-Length: 0
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Host: 127.0.0.1:8000
Connection: Keep-Alive
User-Agent: Apache-HttpClient/4.5.2 (Java/1.8.0_77)


------------------------------------------------------------------------------------------
收到请求参数=[username=Jadyer&password=xuanyu&aa=bb&cc=dd]

------------------------------------------------------------------------------------------
【通信双方】(0x00000004: nio socket, server, /127.0.0.1:55370 => /127.0.0.1:8000)
【收发标识】Response
【报文内容】HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 12

登录成功
------------------------------------------------------------------------------------------
[20161217 22:31:36][NioProcessor-5][LoggingFilter.log]SENT: HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 12

登录成功
已回应给Client
[20161217 22:31:36][NioProcessor-5][LoggingFilter.log]CLOSED
```