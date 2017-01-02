---
layout: post
title: "强制要求JVM始终抛出含堆栈的异常"
categories: JavaSE
tags: java jvm
author: 玄玉
excerpt: 介绍如何强制要求JVM始终抛出含堆栈的异常的参数配置。
---

* content
{:toc}


# 现象

生产环境抛异常，但却没有将堆栈信息输出到日志

可以确定的是日志输出时使用的是 `log.error("xxx发生错误", e)`

# 分析

它跟 JDK5 的一个新特性有关

对于一些频繁抛出的异常，JDK为了性能会做一个优化，即 JIT 重新编译后会抛出没有堆栈的异常

而在使用 `-server` 模式时，该优化选项是开启的

因此在频繁抛出某个异常一段时间后，该优化开始起作用：只抛出没有堆栈的异常信息

# 解决

由于该优化是在 JIT 重新编译后才起作用，因此起初抛出的异常还是有堆栈的

所以可以查看较旧的日志，寻找完整的堆栈信息

另一个办法就是暂时禁用该优化：即强制要求每次都要抛出有堆栈的异常

通过配置 JVM 参数来关闭该优化：`-XX:-OmitStackTraceInFastThrow`（注意选项中的减号，加号则表示启用）

其官方说明如下

```
The compiler in the server VM now provides correct stack backtraces for all "cold" built-in exceptions.
For performance purposes, when such an exception is thrown a few times, the method may be recompiled.
After recompilation, the compiler may choose a faster tactic using preallocated exceptions that do not provide a stack trace.
To disable completely the use of preallocated exceptions, use this new flag: -XX:-OmitStackTraceInFastThrow.
```