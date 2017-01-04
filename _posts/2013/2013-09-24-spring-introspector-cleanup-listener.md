---
layout: post
title: "Spring中的IntrospectorCleanupListener的用途"
categories: Spring
tags: spring
author: 玄玉
excerpt: 介绍Spring中的IntrospectorCleanupListener的用途。
---

* content
{:toc}


## 简介

JDK中的 `java.beans.Introspector` 的用途是：发现 Java 类是否符合 JavaBean 规范

如果有的框架或程序用到了 Introspector，那么就会启用一个系统级的缓存，里面存放一些曾加载并分析过的 JavaBean 引用

服务器关闭时，由于缓存中存放着这些 JavaBean 引用，故垃圾回收器无法回收 Web 容器中的 JavaBean 对象，使得内存变大

而 `org.springframework.web.util.IntrospectorCleanupListener` 就是专门用来处理 Introspector 内存泄漏问题的辅助类

IntrospectorCleanupListener 会在 Web 服务器停止时清理 Introspector 缓存，使那些 Javabean 能被垃圾回收器正确回收

而 Spring 自身不会出现这种问题：因为 Spring 在加载并分析完一个类之后会马上刷新 JavaBeans Introspector 缓存

但有些程序和框架在使用了 JavaBeans Introspector 之后，没有进行清理工作（比如Quartz、Struts），最后导致内存泄漏

## 结论

此监听器可以解决 java.beans.Introspector 导致内存泄漏的问题

它应该配置在 web.xml 中与 Spring 相关监听器中的第一个位置（也要在ContextLoaderListener的前面）