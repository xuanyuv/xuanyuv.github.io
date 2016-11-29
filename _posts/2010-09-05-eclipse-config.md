---
layout: post
title: "Eclipse配置集锦"
categories: 工具
tags: eclipse myeclipse
author: 玄玉
excerpt: 介绍Eclipse或MyEclipse中的一些常用和好用的配置。
---

* content
{:toc}


## 启动时选择工作空间

启动MyEclipse6.5时，默认会弹出`Select a workspace`对话框

如果我们勾选了`Use this as the default and do not ask again`，下次启动时就不会再弹该对话框了

这时可以修改下面的配置文件，让它启动时弹出来

`D:/Program Files/MyEclipse 6.5/eclipse/configuration/.settings/org.eclipse.ui.ide.prefs`

将第`4`行`SHOW_WORKSPACE_SELECTION_DIALOG`的值由`false`修改为`true`即可

而第`6`行`RECENT_WORKSPACES`是用来设置MyEclipse最近所用到的工作空间的，无需理会

## 移除未使用的类引用

有三种方法，其中第三种是最方便的

* 1、移除某个类中的：在Java类中按键`Ctrl+Shift+O`

* 2、移除整个包中的：`Package Explorer`下右键点击包名，依次选择`Source-->Organize imports`即可

* 3、保存时自动移除：`Windows-->Preferences-->Java-->Editor-->Save Actions`

　　　　　　　　　　　　然后选择`Perform the selected action on save`，再勾选`Organize imports`即可

## SVN插件中英文互转

修改`D:\Develop\eclipse\configuration\config.ini`文件，在其尾部添加如下属性即可

```ruby
## Set Subversion English Version
#osgi.nl=en_US
# Set Subversion Chinese Version
osgi.nl=zh_CN
```

## TCPIPMonitor的用法

这是Eclipse或MyEclipse提供的一个类似于`TcpMon`的小工具，很好用

关于TcpMon，目前有两款同名的工具，一个是`Apache`的，一个是`GoogleCode`上的

Apache的地址是[http://ws.apache.org/tcpmon/](http://ws.apache.org/tcpmon/)

GoogleCode地址是[https://code.google.com/p/tcpmon/](https://code.google.com/p/tcpmon/)

GoogleCode上的tcpmon是较新版本的

该工具较老版本的项目页面是[https://java.net/projects/tcpmon](https://java.net/projects/tcpmon)

对应的SVN地址为[https://svn.java.net/svn/tcpmon~svn](https://svn.java.net/svn/tcpmon~svn)

**好了，言归正传**

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

相当于Struts2中的`Interceptor`，等于说我们自己加了一个过滤器，说白了它的原理和`TcpMon`一样