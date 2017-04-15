---
layout: post
title: "SpringCloud系列第06节之断路器Hystrix"
categories: SpringCloud
tags: springcloud spring
author: 玄玉
excerpt: 本文演示了客户端在Ribbon和Feign两种实现方式下的，断路器Hystrix的用法。
---

* content
{:toc}


## 简介

微服务架构中，一般都存在着很多的服务单元

这样就有可能出现一个单元因为网络原因或自身问题而出现故障或延迟，导致调用方的对外服务也出现延迟

如果此时调用方的请求不断增加，时间一长就会出现由于等待故障方响应而形成任务积压，最终导致调用方自身服务的瘫痪

为了解决这种问题：便出现了断路器（或者叫熔断器，Cricuit Breaker）模式

断路器模式源于 Martin Fowler 的 [Circuit Breaker](http://martinfowler.com/bliki/CircuitBreaker.html) 一文

我们日常生活中的断路器，本身是一种开关装置，用于在电路上保护线路过载

当线路中有电器发生短路时，它能够及时切断故障电路，防止发生过载、发热、甚至起火等严重后果

而微服务架构中的断路器，其作用是：**当某个服务单元发生故障（类似用电器短路）之后**

**通过断路器的故障监控（类似熔断保险丝），向调用方返回一个错误响应，而不是长时间的等待**

这就不会使得线程被故障服务长时间占用而不释放，避免了故障在分布式系统中的蔓延

## Hystrix

[Hystrix](https://github.com/Netflix/Hystrix) 正是 Netflix 开源的 [javanica](https://github.com/Netflix/Hystrix/tree/master/hystrix-contrib/hystrix-javanica) 提供的微服务框架套件之一

它是由 Java 实现的，用来处理分布式系统发生故障或延迟时的容错库

它提供了 **断路器、资源隔离、自我修复** 三大功能

1. 断路器<br>
实际可初步理解为快速失败，快速失败是防止资源耗尽的关键点<br>
当 Hystrix 发现在过去某段时间内对服务 AA 的调用出错率达到阀值时，它就会**“熔断”**该服务<br>
后续任何向服务 AA 的请求都会快速失败，而不是白白让调用线程去等待<br>
2. 资源隔离<br>
首先，Hystrix 对每一个依赖服务都配置了一个线程池，对依赖服务的调用会在线程池中执行<br>
比如，服务 AA 的线程池大小为20，那么 Hystrix 会最多允许有20个容器线程调用服务 AA（超出20，它会拒绝并快速失败）<br>
这样即使服务 AA 长时间未响应，容器最多也只能堵塞20个线程，剩余的线程仍然可以处理用户请求<br>
3. 自我修复<br>
处于熔断状态的服务，在经过一段时间后，Hystrix 会让其进入**“半关闭”**状态（即允许少量请求通过），然后统计调用的成功率<br>
如果这个请求都能成功，Hystrix 会恢复该服务，从而达到自我修复的效果<br>
其中：在服务被熔断到进入**“半关闭”**状态之间的时间，就是留给开发人员排查错误并恢复故障的时间

Hystrix 基于命令模式 HystrixCommand 来包装依赖调用逻辑，其每个命令在单独线程中或信号授权下执行

（Command 是在 Receiver 和 Invoker 之间添加的中间层，Command 实现了对 Receiver 的封装）

Hystrix 支持两种隔离策略：线程池隔离和信号量隔离（都是限制对共享资源的并发访问量）

1. ThreadPool<br>
根据配置把不同命令分配到不同的线程池中，这是比较常用的隔离策略，其优点是隔离性好，并且可以配置断路<br>
某个依赖被设置断路之后，系统不会再尝试新起线程运行它，而是直接提示失败，或返回fallback值<br>
它的缺点是新起线程执行命令，在执行时必然涉及上下文的切换，这会造成一定的性能消耗<br>
但是 Netflix 做过实验，这种消耗对比其带来的价值是完全可以接受的，具体的数据参见 [Hystrix-Wiki](https://github.com/Netflix/Hystrix/wiki/How-it-Works#wiki-Isolation)
2. Semaphores<br>
顾名思义就是使用一个信号量来做隔离<br>
开发者可以限制系统对某一个依赖的最高并发数，这个基本上就是一个限流的策略<br>
每次调用依赖时都会检查一下是否到达信号量的限制值，如达到，则拒绝<br>
该策略的优点是不新起线程执行命令，减少上下文切换，缺点是无法配置断路，每次都一定会去尝试获取信号量

关于 Hystrix 的详细属性配置说明，可以参见 [Hystrix-Wiki-Configuration](https://github.com/Netflix/Hystrix/wiki/Configuration)

## 示例代码

示例代码如下（也可以直接从 Github 下载：[https://github.com/v5java/demo-cloud-06-hystrix](https://github.com/v5java/demo-cloud-06-hystrix)）

它是由四个模块组成的 Maven 工程，其中包含兩个服务消费者、一个注册中心、一个服务提供者