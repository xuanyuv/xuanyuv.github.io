---
layout: post
title: "Tomcat与Apache配置负载均衡"
categories: Tomcat
tags: tomcat apache
author: 玄玉
excerpt: 介绍了CentOS-6.4-minimal版中Apache-2.2.29与Tomcat-6.0.41实现负载均衡的配置、以及验证的方法。
---

* content
{:toc}


本文涉及的相关环境和版本为：`CentOS-6.4-minimal`、`Apache-2.2.29`、`Tomcat-6.0.41`

本文建立在Apache-2.2.29与Tomcat-6.0.41整合的基础上

整合细节详见：[https://jadyer.github.io/2014/09/27/tomcat-apache-jk/](https://jadyer.github.io/2014/09/27/tomcat-apache-jk/)

# 配置负载均衡

1. 修改端口（由于我是在一台机器上复制多个tomcat，所以需要修改端口，如果是不同的机器就可以跳过这一步）

    > ```sh
[root@CentOS64 app]# vi tomcat/conf/server.xml  # 修改8005为-1，原因详见https://jadyer.github.io/2014/09/27/tomcat-telnet-shutdown/
[root@CentOS64 app]# cp -a tomcat tomcat1
[root@CentOS64 app]# cp -a tomcat tomcat2
[root@CentOS64 app]# cp -a tomcat tomcat3
[root@CentOS64 app]# vi tomcat1/conf/server.xml # 修改ssl端口和ajp端口为8543和8109，即分别+100
[root@CentOS64 app]# vi tomcat2/conf/server.xml # 修改ssl端口和ajp端口为8643和8209，即分别+200
[root@CentOS64 app]# vi tomcat3/conf/server.xml # 修改ssl端口和ajp端口为8743和8309，即分别+300
```

2. 修改/app/apache/conf/workers.properties，修改后的内容如下

    > ```ruby
worker.list=status,tomcatlb
worker.status.type=status
worker.tomcat1.port=8109
worker.tomcat1.host=127.0.0.1
worker.tomcat1.type=ajp13
worker.tomcat1.lbfactor=1
worker.tomcat2.port=8209
worker.tomcat2.host=127.0.0.1
worker.tomcat2.type=ajp13
worker.tomcat2.lbfactor=1
worker.tomcat3.port=8309
worker.tomcat3.host=127.0.0.1
worker.tomcat3.type=ajp13
worker.tomcat3.lbfactor=1                                 # 负载权重，值越高，被分发请求的概率越大，其默认值为1
worker.tomcatlb.type=lb                                   # 可选值ajp13，ajp14，jni，lb or status
worker.retries=6                                          # 通信失败时的重试次数，默认为2
worker.tomcatlb.balanced_workers=tomcat1,tomcat2,tomcat3  # 参与负载均衡的Web服务器
```

3. 修改/app/apache/conf/extra/httpd-vhosts.conf：将默认的tomcat改为tomcatlb（即指定所有请求交由tomcatlb处理）

# 测试负载均衡

启动apache和三个tomcat，便可通过jkstatus看到参与负载均衡的三个tomcat和一些参数（也可通过jkstatus修改负载均衡参数）

*关于jkstatus的配置和使用*，详见：[https://jadyer.github.io/2014/09/27/tomcat-apache-jk/#jk-1](https://jadyer.github.io/2014/09/27/tomcat-apache-jk/#jk-1)

接下来就可以测试负载均衡效果了，测试代码如下

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

访问页面我们会发现，每次刷新页面，通过后台日志都可以看到请求是被随机分配给三个tomcat的

说明请求是由三个tomcat随机承担的，即负载均衡成功

并且，由于这里没有配置集群，所以每次刷新页面时，页面打印的SessionID都是变化的

另附，jkstatus的效果图，如下所示

![](/img/2014/2014-09-27-tomcat-apache-jk.png)

# workers.properties

关于workers.properties的更多属性说明，可参考以下两个网址

[http://tomcat.apache.org/connectors-doc/reference/workers.html](http://tomcat.apache.org/connectors-doc/reference/workers.html)

[http://blog.csdn.net/chumeng411/article/details/7541767](http://blog.csdn.net/chumeng411/article/details/7541767)

另外补充两个待验证的workers属性描述

1. worker.tomcatlb.sticky_session=true<br>
   此处指定集群是否需要会话复制，其默认值为true，即不进行会话复制（为会话粘性），而false则表明需要会话复制<br>
   值为true时：当某用户的请求第一次分发到哪台Tomcat后，则后继的请求会一直分发到此Tomcat服务器上处理<br>
   也就是说：当设置为0（false）时是基于请求的负载均衡，为1（true）时是基于用户的负载均衡
2. worker.tomcatlb.sticky_session_force=true<br>
   该属性默认值为false，若上面的sticky_session设为true，则建议此处也设为true<br>
   此参数表明如果集群中某台Tomcat服务器在多次请求没有响应后，是否将当前的请求转发到其它Tomcat服务器上处理<br>
   此参数在sticky_session=true时影响比较大，会导致转发到其它Tomcat服务器上的请求找不到原来的session<br>
   所以如果此时请求中有读取session中某些信息的话，就会导致应用的Null异常