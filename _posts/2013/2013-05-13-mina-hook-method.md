---
layout: post
title: "Mina中的钩子用法"
categories: Mina2
tags: mina 钩子
author: 玄玉
excerpt: 介绍Mina中的钩子用法，也就是Java模板方法模式中的HookMethod实现。
---

* content
{:toc}


所谓的钩子用法，其实也就是 Java 模板方法模式中的 HookMethod 实现

下面拿代码举个例子

这是核心的抽象类 `IoSession.java`

```java
package com.xuanyuv.hook;

public abstract class IoSession {
    public void write(Object message){
        System.out.println(message);
        messageSend(this);
    }

    public abstract void messageSend(IoSession session);
}
```

这是关键的实现类 `MyHandler.java`

```java
package com.xuanyuv.hook;

public class MyHandler extends IoSession{
    @Override
    public void messageSend(IoSession session) {
        System.out.println("aa");
    }

    public static void main(String[] args) {
        new MyHandler().write("11");
    }
}
```

运行 main() 方法会看到控制台输出如下内容（这就说明了一切）

```
11
aa
```