---
layout: post
title: "Telnet无需验证直接关闭Tomcat"
categories: Tomcat
tags: tomcat telnet shutdown
author: 玄玉
excerpt: 介绍了telnet命令关闭Tomcat的方法。
---

* content
{:toc}


Tomcat的配置文件**server.xml**中有这么一行：`<Server port="8005" shutdown="SHUTDOWN">`

看着不起眼，其实搞不好就是个安全隐患（在没有防火墙的前提下）

因为任何一个人Telnet这个Tomcat服务器的8005端口：`telnet 127.0.0.1 8005`

再输入大写的SHUTDOWN，回车后Tomcat就立即被关闭了

从安全角度讲，可以把shutdown的值换成一个不容易猜测到的字符串（或者`port="-1"`）