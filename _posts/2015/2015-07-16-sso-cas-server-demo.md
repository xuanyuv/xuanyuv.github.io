---
layout: post
title: "单点登录CAS系列第01节之服务端搭建及源码导入IDE"
categories: SSO
tags: sso cas myeclipse
author: 玄玉
excerpt: 主要描述单点登录CAS-4.0.3服务端搭建方法，以及源码导入MyEclipse的步骤。
---

* content
{:toc}


## 简介

谈到单点登录（SSO：Single Sign On），最出名的框架，莫过于CAS（Central Authentication Service）

官方网站：[https://www.apereo.org/projects/cas](https://www.apereo.org/projects/cas)

源码地址：[https://github.com/Jasig/cas](https://github.com/Jasig/cas)和[https://github.com/Jasig/java-cas-client](https://github.com/Jasig/java-cas-client )

帮助文档：[https://wiki.jasig.org/display/CASC/CAS+Client+for+Java+3.1](https://wiki.jasig.org/display/CASC/CAS+Client+for+Java+3.1)

服务端：本系列文章全部基于目前最新的`CAS-4.0.3`

客户端：目前CAS的Java客户端官方最新版本是`3.4.0`，出于安全考虑应立即升级到该版本（它是在2015-07-21发布的）

注意：自从`3.1.11`开始，maven2的groupId已经变为`org.jasig.cas.clien`，如下所示

```xml
<dependency>
    <groupId>org.jasig.cas.client</groupId>
    <artifactId>cas-client-core</artifactId>
    <version>3.4.0</version>
</dependency>
```

## 部署Tomcat

这里使用的环境为：`jdk-7u80-windows-x64`、`apache-tomcat-8.0.21`、`cas-client-core-3.4.0`、`cas-server-webapp-4.0.3`

首先，我们去下载CAS源码，手工构建cas.war，操作步骤如下

1、[https://github.com/Jasig/cas/releases](https://github.com/Jasig/cas/releases)中下载最新版4.0.3得到cas-4.0.3.zip，并解压到桌面

2、执行命令：C:\Users\Jadyer\Desktop\cas-4.0.3>mvn install -DskipTests

在构建最后，会报告下面的错误

```
Could not transfer artifact net.jradius:jradius-core:pom:1.0.0 from/to coova (http://coova-dev.s3.amazonaws.com/mvn): Software caused connection abort: recv failed
```

不过没关系，此时我们想要的war已经生成了，它就是`\cas-4.0.3\cas-server-webapp\target\cas.war`

> 除了上面手工构建的方式，还可以直接下载现成的war包，地址如下（下面两个地址都可以）<br>
[http://central.maven.org/maven2/org/jasig/cas/cas-server-webapp/4.0.3](http://central.maven.org/maven2/org/jasig/cas/cas-server-webapp/4.0.3)<br>
[http://mvnrepository.com/artifact/org.jasig.cas/cas-server-webapp/4.0.3](http://mvnrepository.com/artifact/org.jasig.cas/cas-server-webapp/4.0.3)<br>
下载到的文件为`cas-server-webapp-4.0.3.war`，它的内容与上面手工构建得到的`cas.war`是相同的

接下来，将cas.war部署到Tomcat，启动后访问http://127.0.0.1:8080/cas/

关于登录密码，`CAS-4.0`之前的默认验证规则是：只要用户名和密码相同就认证通过

4.0之后有所改变：其默认用户名密码为`casuser/Mellon`，它配置在`\WEB-INF\deployerConfigContext.xml`

![](https://ae01.alicdn.com/kf/Ud0f93b050af847dea59ad9f74510594cA.png)

![](https://ae01.alicdn.com/kf/U00a329f5b29749f9b90292cae21cf07cq.png)

## 导入MyEclipse

1、MyEclipse中新建一个WebProject，名字随意，比方说cas（新建时JavaEE版本选5.0就行）

2、解压之前得到的cas.war，将其内容拷贝到新建的WebProject中即可（classes目录中的properties文件和log4j.xml拷到src即可）

验证一下：把这个WebProject发布到Tomcat，看到的应该是一样的效果

![](https://ae01.alicdn.com/kf/Ue769f10e11654ddd8f80f5831e0735979.png)

注意：导入时，这两个jar也是CAS的：`person-directory-api-1.5.1.jar`、`person-directory-impl-1.5.1.jar`

另外：cas.war中的`\WEB-INF\classes\`里面并没有class文件，实际上它是在`\WEB-INF\lib\cas-server-*.jar四个jar`里面的

如果也想导入它们的源码，可通过以下方式找到（如果你需要的话）

* cas-server-security-filter-2.0.3.jar

　　　源码地址为[https://github.com/Jasig/cas-server-security-filter](https://github.com/Jasig/cas-server-security-filter)（实际上只有一个java文件）

　　　这里也可以查到源码[http://mvnrepository.com/artifact/org.jasig.cas/cas-server-security-filter/2.0.3](http://mvnrepository.com/artifact/org.jasig.cas/cas-server-security-filter/2.0.3)

* cas-server-core-4.0.3.jar、cas-server-support-generic-4.0.3.jar、cas-server-webapp-support-4.0.3.jar

　　　这三个jar的源码就在`cas-4.0.3.zip`里面，直接拷过来就行了

## 启用HTTP协议支持

我们都知道，Tomcat默认是没有开启HTTPS协议的

这个时候访问[http://127.0.0.1:8080/cas/](http://127.0.0.1:8080/cas/)会在页面看到下面的提示

```
Non-secure Connection
You are currently accessing CAS over a non-secure connection. Single Sign On WILL NOT WORK. In order to have single sign on work, you MUST log in over HTTPS.
```

这段提示是硬编码在`\WEB-INF\view\jsp\default\ui\casLoginView.jsp`中的

我们可以注释掉它，也可以让CAS支持HTTP协议，即令其不开启HTTPS验证，这时需要修改三个文件

```
1、\WEB-INF\deployerConfigContext.xml
<bean class="org.jasig...support.HttpBasedServiceCredentialsAuthenticationHandler">添加p:requireSecure="false"

2、\WEB-INF\spring-configuration\ticketGrantingTicketCookieGenerator.xml
p:cookieSecure="true"改为p:cookieSecure="false"

3、\WEB-INF\spring-configuration\warnCookieGenerator.xml
p:cookieSecure="true"改为p:cookieSecure="false"
```