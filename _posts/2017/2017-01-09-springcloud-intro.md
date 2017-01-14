---
layout: post
title: "SpringCloud系列第01节之入门"
categories: SpringCloud
tags: springcloud spring
author: 玄玉
excerpt: 这是一个持续更新的一些关于SpringCloud周边的文章，比如它那不走寻常路的版本号，它里面各个组件的功能简介等。
---

* content
{:toc}


这是一个持续更新的、一些关于 SpringCloud 周边的文章

比如它那不走寻常路的版本名、其各组件的功能描述等等

## 简介

SpringCloud 是在 SpringBoot 基础上建立的

是一个包含了诸多子项目（比如Spring Cloud Config、Spring Cloud Netflix）的大型综合项目

项目主页为：[http://projects.spring.io/spring-cloud/](http://projects.spring.io/spring-cloud/)

其主要提供了包括但不限于以下功能：

* 配置管理（configuration management）
* 服务发现（service discovery，也就是服务注册中心）
* 断路器（circuit breakers，也叫熔断器）
* 智能路由（intelligent routing，通常用来做 API-Gateway 实现）
* 控制总线（control bus）
* 微代理（micro-proxy）
* 全局锁（global locks）
* 领导选举（leadership election）
* 一次性令牌（one-time tokens）
* 分布式会话（distributed sessions）
* 集群状态管理（cluster state）

举个例子：比如 Spring Cloud 的子项目之一 Spring Cloud Netflix

它主要是：封装 Netflix 公司开源的一系列产品，它为 SpringBoot 应用提供了自配置的 Netflix OSS 整合

它提供了：服务发现（Eureka）、断路器（Hystrix）、智能路由（Zuul）、客户端软负载均衡（Ribbon）等功能

## 版本名

目前，官网中会看到三个版本名：Angel、Brixton、Camden（注意我的用语是版本名，没说版本号）

这是由于：SpringCloud 这个包含了诸多子项目的大型综合项目，它的各子项目版本号都是各自维护的

于是为了管理子项目，避免混淆版本名与子项目版本号，才采用了命名的方式（这些命名目前来看是根据英文字母顺序表的）

比如最先发布的综合版本叫做 Angel，接着就是 Brixton，现在到了 Camden（相信以后会更多，26个字母，应该足够用吧）

而版本号后面的 `.SR` 指的是：service releases，简称 `SRX`（X 是一个递增数字）

通过其官网下方的 **Release train contents:** 表格，可以看到目前各版本名所包含的子项目

*注意：关于其各版本与 Spring-Boot 版本之间的关系，也会在这里面看到*

| Component | Angel.SR6 | Brixton.SR7 | Camden.SR4 | Camden.BUILD-SNAPSHOT |
|:---------:|:---------:|:-----------:|:----------:|:---------------------:|
| spring-cloud-aws     | 1.0.4.RELEASE | 1.1.3.RELEASE | 1.1.3.RELEASE | 1.1.4.BUILD-SNAPSHOT |
| spring-cloud-bus     | 1.0.3.RELEASE | 1.1.2.RELEASE | 1.2.1.RELEASE | 1.2.2.BUILD-SNAPSHOT |
| spring-cloud-cli     | 1.0.6.RELEASE | 1.1.6.RELEASE | 1.2.0.RC1     | 1.2.0.BUILD-SNAPSHOT |
| spring-cloud-commons | 1.0.5.RELEASE | 1.1.3.RELEASE | 1.1.7.RELEASE | 1.1.8.BUILD-SNAPSHOT |
| ...                  | ...           | ...           | ...           | ...                  |
| ...                  | ...           | ...           | ...           | ...                  |

## Eureka

[Eureka](https://github.com/Netflix/Eureka) 是 [Netflix](https://github.com/Netflix) 开发的服务注册与发现的组件，本身是一个基于 REST 的服务

Spring Cloud 将它集成在其子项目 Spring Cloud Netflix 中，以实现 Spring Cloud 的服务注册与发现功能

它主要包括两个组件：Eureka Server 和 Eureka Client

* Eureka Client：一个Java客户端，用于简化与 Eureka Server 的交互
* Eureka Server：提供服务注册和发现的能力

各个微服务启动时，会通过 Eureka Client 向 Eureka Server 注册自己，Eureka Server 会存储该服务的信息

另外，关于服务端和客户端的相互识别，有以下几点需要介绍

1. 同步：每个 Eureka Server 同时也是 Eureka Client，多个 Eureka Server 之间通过复制的方式完成服务注册表的同步
2. 续约：微服务启动后，会周期性地向 Eureka Server 发送心跳（默认周期为30秒）以Renew（续约）自己的信息
3. 续期：Eureka Server 在一定时间内（默认90秒）没有接收到某个微服务节点的心跳，Eureka Server 会注销该微服务节点
4. 识别：Eureka Client 会缓存 Eureka Server 中的信息，即使所有的 Eureka Server 节点都宕掉<br>
　　　服务消费者依然可以使用缓存中的信息找到服务提供者**（已亲测）**

关于 Eureka 配置的最佳实践，可参考：[https://github.com/spring-cloud/spring-cloud-netflix/issues/203](https://github.com/spring-cloud/spring-cloud-netflix/issues/203)

更多内容，可参考：[http://cloud.spring.io/spring-cloud-static/Camden.SR4/#spring-cloud-eureka-server](http://cloud.spring.io/spring-cloud-static/Camden.SR4/#spring-cloud-eureka-server)

## Hystrix

微服务架构中，一般都存在着很多的服务单元

这样就有可能出现一个单元因为网络原因或自身问题而出现故障或延迟，导致调用方的对外服务也出现延迟

如果此时调用方的请求不断增加，时间一长就会出现由于等待故障方响应而形成任务积压，最终导致自身服务的瘫痪

为了解决这样的问题：断路器（或者叫熔断器）模式便出现了

断路器模式源于 Martin Fowler 的 [Circuit Breaker](http://martinfowler.com/bliki/CircuitBreaker.html) 一文

日常生活中的断路器本身是一种开关装置，用于在电路上保护线路过载

当线路中有电器发生短路时，它能够及时切断故障电路，防止发生过载、发热、甚至起火等严重后果

微服务架构中的断路器，其作用就是：**当某个服务单元发生故障（类似用电器短路）之后**

**通过断路器的故障监控（类似熔断保险丝），向调用方返回一个错误响应，而不是长时间的等待**

这就不会使得线程被故障服务长时间占用而不释放，避免了故障在分布式系统中的蔓延

而 Hystrix 正是 Netflix 开源的 [javanica](https://github.com/Netflix/Hystrix/tree/master/hystrix-contrib/hystrix-javanica) 提供的微服务框架套件之一

它是由 Java 实现的，用来处理分布式系统发生故障或延迟时的容错库

它基于命令模式 HystrixCommand 来包装依赖调用逻辑，其每个命令在单独线程中 **/** 信号授权下执行

（Command 是在 Receiver 和 Invoker 之间添加的中间层，Command 实现了对 Receiver 的封装）

Hystrix 提供了熔断器组件，可以自动运行或手动调用

Hystrix 支持两种隔离策略：线程池隔离和信号量隔离（都是限制对共享资源的并发访问量）

1. ThreadPool<br>
根据配置把不同命令分配到不同的线程池中，这是比较常用的隔离策略，其优点是隔离性好，并且可以配置断路<br>
某个依赖被设置断路之后，系统不会再尝试新起线程运行它，而是直接提示失败，或返回fallback值<br>
它的缺点是新起线程执行命令，在执行时必然涉及上下文的切换，这会造成一定的性能消耗<br>
但是 Netflix 做过实验，这种消耗对比其带来的价值是完全可以接受的，具体的数据参见 [Hystrix Wiki](https://github.com/Netflix/Hystrix/wiki/How-it-Works#wiki-Isolation)
2. Semaphores<br>
顾名思义就是使用一个信号量来做隔离<br>
开发者可以限制系统对某一个依赖的最高并发数，这个基本上就是一个限流的策略<br>
每次调用依赖时都会检查一下是否到达信号量的限制值，如达到，则拒绝<br>
该策略的优点是不新起线程执行命令，减少上下文切换，缺点是无法配置断路，每次都一定会去尝试获取信号量

关于 Hystrix 的详细属性配置说明，可以参见 [Hystrix的Wiki](https://github.com/Netflix/Hystrix/wiki/Configuration)

## 配置中心

Spring Cloud Config 为服务端和客户端各应用的所有环境，提供了适用于分布式系统的，一个中心化的外部化配置支持

说白了：服务端和客户端的所有应用针对每套部署环境，可能都有不同的配置，发布环境时都要注意所使用的配置文件

而通过 Spring Cloud Config 实现的配置中心，能够达到所有应用的所有环境的配置文件统一集中管理，且支持热更新

它默认采用 git 存储配置信息，这样通过 git 客户端工具就可以很轻松的管理配置内容，维护环境配置的版本

虽然它也支持SVN存储和本地存储，但相信，很少有人这么做

更多内容，可参考：[http://cloud.spring.io/spring-cloud-static/Camden.SR4/#_spring_cloud_config](http://cloud.spring.io/spring-cloud-static/Camden.SR4/#_spring_cloud_config)

关于配置中心的高可用，可参考：[https://github.com/spring-cloud/spring-cloud-config/issues/87](https://github.com/spring-cloud/spring-cloud-config/issues/87)

关于配置中心与注册中心联合使用，可参考：[https://github.com/spring-cloud/spring-cloud-config/blob/master/docs/src/main/asciidoc/spring-cloud-config.adoc#discovery-first-bootstrap](https://github.com/spring-cloud/spring-cloud-config/blob/master/docs/src/main/asciidoc/spring-cloud-config.adoc#discovery-first-bootstrap)