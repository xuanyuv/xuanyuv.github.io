---
layout: post
title: "CXF之LinkageError异常及endorsed机制"
categories: CXF
tags: cxf java LinkageError
author: 玄玉
excerpt: 介绍Apache-CXF启动时报告LinkageError异常的解决方法，以及Java中的endorsed机制。
---

* content
{:toc}


## 现象

CXF启动时可能会报告下面的异常

```
Exception in thread "main" java.lang.LinkageError: JAXB 2.1 API is being loaded from the bootstrap classloader,
but this RI (from jar:file:/C:/apache-cxf-2.5.2/lib/jaxb-impl-2.2.4-1.jar!/com/sun/xml/bind/v2/model/impl/ModelBuilder.class) needs 2.2 API.
Use the endorsed directory mechanism to place jaxb-api.jar in the bootstrap classloader. (See http://java.sun.com/j2se/1.5.0/docs/guide/standards/)
```

大致翻译下，就是说：

`Jaxb2.1`的API正在从根类加载器中加载，但这个参考实现`(jaxb-impl-2.2.4-1.jar)`需要一个`2.2`的API

请使用`endorsed`目录机制来替换掉根类加载器中的`jaxb-api.jar`

请参考[http://java.sun.com/j2se/1.5.0/docs/guide/standards/](http://java.sun.com/j2se/1.5.0/docs/guide/standards/)

## 分析

这是由于`JDK`启动时加载的是自带的`jaxb-api-2.1.jar`，而**这里的CXF**需要用到的是`jaxb-api-2.2.jar`

* 注意

    > 1、不是让你去下载`jaxb-api.jar`，而是应该下载`jaxb-api-2.2.jar`<br/>
　　可以从[https://jaxb.java.net/](https://jaxb.java.net/)下载<br/>
　　或从`apache-cxf-2.5.2.zip\apache-cxf-2.5.2\lib\endorsed`目录中取得<br/>
2、不是让你把下载到的jar放到`%JAVA_HOME%/lib/endorsed/`目录下，而是应该自己找到正确的目录

* 找到正确目录的方法，还要根据`JavaProject`还是`JavaWebProject`而不同

    > 1、`JavaProject`就简单多了<br/>
　　直接main执行`System.out.println(System.getProperty("java.endorsed.dirs"));`<br/>
　　我的电脑上显示的是`D:\Develop\Java\jdk1.6.0_45\jre\lib\endorsed`<br/>
2、`JavaWebProject`的话，就要启动一个没有用到`jaxb`的Web项目<br/>
　　然后在`jsp`中执行`<%=System.getProperty("java.endorsed.dirs")%>`<br/>
　　我的电脑上显示的是`D:\Develop\apache-tomcat-6.0.36/common/endorsed`

## 解决

#### 第一种

把`jaxb-api-2.2.jar`放到上面找到的正确的`endorsed`目录中，即可

#### 第二种

第二种是在`Eclipse`中启动`JavaProject`的情况而言的

`main-->Run As-->Open Run Dialog或者Run Configurations-->Arguments-->VM arguments`

再输入此参数：`-Djava.endorsed.dirs=C:\apache-cxf-2.5.2\lib\endorsed`

保存，即可