---
layout: post
title: "Eclipse中TCPIPMonitor的用法"
categories: 工具
tags: eclipse tcpip moniton 报文
author: 玄玉
excerpt: 介绍Eclipse工具中，用于监听指定端口，收发报文的TCP/IP Monitor工具。
---

* content
{:toc}


这是Eclipse或MyEclipse提供的一个类似于`TcpMon`的小工具，很好用

关于TcpMon，目前有两款同名的工具，一个是`Apache`的，一个是`GoogleCode`上的

Apache的地址是[http://ws.apache.org/tcpmon/](http://ws.apache.org/tcpmon/)

GoogleCode地址是[https://code.google.com/p/tcpmon/](https://code.google.com/p/tcpmon/)

GoogleCode上的tcpmon是较新版本的

该工具较老版本的项目页面是[https://java.net/projects/tcpmon](https://java.net/projects/tcpmon)

对应的SVN地址为[https://svn.java.net/svn/tcpmon~svn](https://svn.java.net/svn/tcpmon~svn)

**好了，言归正传**

## TCP/IP Monitor用法

#### 打开TCP/IP Monitor视图

`MyEclipse-->Window-->Show View-->Other-->MyEclipse Common-->TCP/IP Monitor-->OK`

#### 配置TCP/IP Monitor监听

TCP/IP Monitor视图——>右上角下拉三角——>Properties——>Add——>添加的属性说明如下所示

| 属性类别 | 属性说明 |
|:------------------------|:--------------------------------------------------------------- |
| **LocalMonitoringPort** | 本地监听的端口号，访问Web服务时直接访问该端口即可，它会转发请求到服务端 |
| **HostName**            | 服务端的主机地址                                                  |
| **Port**                | 服务端提供服务的端口                                               |
| **Type**                | 这里选择TCP/IP，若选择HTTP，则只能看到HTTP交互的报文体而看不到报文头了 |

#### 启动TCP/IP Monitor监听

我们在访问服务时，请求地址应该是`127.0.0.1 + Local monitoring port`(可以用浏览器或其它工具类)

本机`Local monitoring port`收到请求后会将请求转发至`Host name + Port`，应答过程则与之相反

相当于Struts2中的Interceptor，等于说我们自己加了一个过滤器，说白了它的原理和`TcpMon`一样