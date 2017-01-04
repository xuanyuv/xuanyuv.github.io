---
layout: post
title: "Tomcat与Apache配置集群"
categories: Tomcat
tags: tomcat apache
author: 玄玉
excerpt: 介绍了CentOS-6.4-minimal版中Apache-2.2.29与Tomcat-6.0.41实现集群的配置、以及验证的方法。
---

* content
{:toc}


本文涉及的相关环境和版本为：`CentOS-6.4-minimal`、`Apache-2.2.29`、`Tomcat-6.0.41`、`JK-1.2.40`

本文建立在Apache-2.2.29与Tomcat-6.0.41配置负载均衡的基础上

配置细节详见：[https://jadyer.github.io/2014/09/27/tomcat-apache-loadbalancer/](https://jadyer.github.io/2014/09/27/tomcat-apache-loadbalancer/)

## 前言

先介绍下几个术语

1. 负载均衡<br>
   前端服务器（常常名为负载均衡器、代理均衡器、反向代理）收到HTTP请求后<br>
   将请求分发到后端的不止一个 worker 的web服务器，由它们实际处理请求
2. 会话复制<br>
   即常说的Session共享：将客户端会话的整个状态原原本本复制到集群的其它实例（即每台服务器都存有用户Session信息）<br>
   若集群中的某台宕机了：应用可以自动切换到其它服务器上继续运行，而用户的信息不会丢失，增加了系统的高可用性
3. 集群<br>
   由两个或多个Web服务器实例组成，它们步调一致地工作，透明地处理请求（客户端将一组服务器实例认为是单一实体服务）

再补充几个细节

1. 集群有别于分布式的解决方案，它采用的是每台服务器运行相同应用的策略，由负责均衡的服务器进行分流
2. 由于集群服务需要在处理请求之间不断地会话复制，复制后的会话将会慢慢变得庞大，因此它的资源占用率（内存）非常高
3. 实践证明：在各应用服务器之间不需要状态复制的情况下，负载均衡可以达到性能的线性增长及更高的并发需求

## 配置Tomcat实例

下面配置的**jvmRoute**属性值要与`workers.properties`中设置的节点名相同

该值将做为后缀添加在每个由该结点生成的**jsessionid**后面

而`mod_jk`正是根据jsessionid后面的后缀来确定一个请求应由哪一个结点来处理，这也是实现session_sticky的基本保证

```sh
# You should set jvmRoute to support load-balancing via AJP ie :
# <Engine name="Catalina" defaultHost="localhost" jvmRoute="jvm1">
[root@CentOS64 app]# vi /app/tomcat1/conf/server.xml # 为<Engine/>节点增加jvmRoute属性，属性值为tomcat1
[root@CentOS64 app]# vi /app/tomcat2/conf/server.xml # 为<Engine/>节点增加jvmRoute属性，属性值为tomcat2
[root@CentOS64 app]# vi /app/tomcat3/conf/server.xml # 为<Engine/>节点增加jvmRoute属性，属性值为tomcat3
```

## 配置集群参数

1. 如果tomcat是放在不同机器上面的<br>
   则取消注释`tomcat/conf/server.xml--><Cluster className="org.apache.catalina.ha.tcp.SimpleTcpCluster"/>`即可
2. 如果tomcat是放在同一机器上面的<br>
   此时就要修改<Cluster/>节点的默认配置，其默认配置如下

    > ```xml
<!--
我们要做的就是显式添加此默认配置，并修改里面的<Receiver port="">
由于我们这里有三个tomcat节点，故这个端口就依次修改为4001、4002、4003
之所以没有修改为4100、4200、4300，是由于Tomcat官方建议此端口范围在4000~4100之间
-->
\<Cluster className="org.apache.catalina.ha.tcp.SimpleTcpCluster" channelSendOptions="8">
    \<Manager className="org.apache.catalina.ha.session.DeltaManager"
        expireSessionsOnShutdown="false"
        notifyListenersOnReplication="true"/>
    \<Channel className="org.apache.catalina.tribes.group.GroupChannel">
        \<Membership className="org.apache.catalina.tribes.membership.McastService"
            address="228.0.0.4"
            port="45564"
            frequency="500"
            dropTime="3000"/>
        \<Receiver className="org.apache.catalina.tribes.transport.nio.NioReceiver"
            address="auto"
            port="4000"
            autoBind="100"
            selectorTimeout="5000"
            maxThreads="6"/>
        \<Sender className="org.apache.catalina.tribes.transport.ReplicationTransmitter">
            \<Transport className="org.apache.catalina.tribes.transport.nio.PooledParallelSender"/>
        \</Sender>
        \<Interceptor className="org.apache.catalina.tribes.group.interceptors.TcpFailureDetector"/>
        \<Interceptor className="org.apache.catalina.tribes.group.interceptors.MessageDispatch15Interceptor"/>
    \</Channel>
    \<Valve className="org.apache.catalina.ha.tcp.ReplicationValve" filter=""/>
    \<Valve className="org.apache.catalina.ha.session.JvmRouteBinderValve"/>
    \<Deployer className="org.apache.catalina.ha.deploy.FarmWarDeployer"
        tempDir="/tmp/war-temp/"
        deployDir="/tmp/war-deploy/"
        watchDir="/tmp/war-listen/"
        watchEnabled="false"/>
    \<ClusterListener className="org.apache.catalina.ha.session.JvmRouteSessionIDBinderListener"/>
    \<ClusterListener className="org.apache.catalina.ha.session.ClusterSessionListener"/>
\</Cluster>
```

## 修改应用程序

1. Session中存放的数据必须实现序列化
2. web.xml中加入`<distributable/>`标签

## 测试集群

启动apache和三个tomcat后，测试方法如下（测试代码已在下方贴出）

1. 访问测试页面，会看到页面打印SessionID后面多出了`.tomcat2`<br>
   这就是上文说到的 jsessionid 后面会加上`.jvmRoute`为后缀，表明 tomcat2 在处理此请求
2. 刷新测试页面，会看到打印的SessionID没有变化<br>
   这里与负载均衡后的效果有明显不同，详见：[https://jadyer.github.io/2014/09/27/tomcat-apache-loadbalancer/](https://jadyer.github.io/2014/09/27/tomcat-apache-loadbalancer/)
3. 添加新的属性，提交表单后会发现打印出了新添加的属性名和属性值，接着刷新页面会发现添加的属性依然存在
4. 最关键的一步：关闭 tomcat2 服务器，再刷新页面，会发现请求交由 tomcat1 来处理了，并且之前添加的属性依然存在

至此，Session共享成功，集群成功

最后把测试代码也贴以下

```java
<%@ page language="java" pageEncoding="UTF-8"%>

<%
out.println("<br>Session ID : " + session.getId() + "<br>");
session.setAttribute("myname", "session");
String dataName = request.getParameter("dataName");
if(null!=dataName && dataName.length()>0){
    String dataValue = request.getParameter("dataValue");
    session.setAttribute(dataName, dataValue);
}
out.print("<b>Session 列表</b><br>");
java.util.Enumeration e = session.getAttributeNames();
while(e.hasMoreElements()){
    String name = (String)e.nextElement();
    String value = session.getAttribute(name).toString();
    out.println( name + " = " + value+"<br>");
}
%>

<form action="demo.jsp" method="POST">
    属性名:<input type=text size=20 name="dataName"><br>
    属性值:<input type=text size=20 name="dataValue"><br>
    <input type=submit>
</form>
```

## 注意事项

1. java.net.BindException: Cannot assign requested address; No faulty members identified<br>
   启动 tomcat 时报告上面的异常<br>
   猜测可能是由于 tomcat 安装在我的虚拟机中，该属性导致其与我的主机（Thinkpad笔记本）的IP产生冲突<br>
   此时修改`tomcat/conf/server.xml--><Receiver address="auto">`的auto为`192.168.0.103`（即tomcat服务器IP）即可<br>
   如果还报这个异常，可以试一下`address="127.0.0.1"`
2. 如果仍然启动失败，或者启动成功，但无法实现session共享，那么有可能是组播出现了问题<br>
   因为 tomcat 中的集群原理是通过组播的方式进行节点的查找并使用 TCP 连接进行会话的复制的<br>
   即 tomcat 的 session 同步功能需要用到组播服务<br>
   可以通过`route add -net 224.0.0.0 netmask 240.0.0.0 dev eth0`命令开通Linux组播服务<br>
   若需服务器启动时即开通组播，可以在`/etc/sysconfig/static-routes`文件中加入`eht0 net 224.0.0.0 netmask 240.0.0.0`<br>
   另外，可以通过`netstat -g`或者`route -e`命令来查看组播状态