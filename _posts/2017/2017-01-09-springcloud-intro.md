---
layout: post
title: "SpringCloud入门"
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

它提供了：服务发现（Eureka）、断路器（Hystrix）、智能路由（Zuul）、客户端负载均衡（Ribbon）等功能

## 版本名

目前，官网中会看到三个版本名：Angel、Brixton、Camden（注意我的用语是版本名，没说版本号）

这是由于：SpringCloud 这个包含了诸多子项目的大型综合项目，它的各子项目版本号都是各自维护的

于是为了管理子项目，避免混淆版本名与子项目版本号，才采用了命名的方式（这些命名目前来看是根据英文字母顺序表的）

比如最先发布的综合版本叫做 Angel，接着就是 Brixton，现在到了 Camden（相信以后会更多，26个字母，应该足够用吧）

而版本号后面的 `.SR` 指的是：service releases，简称 `SRX`（X 是一个递增数字）

通过其官网下方的 **Release train contents:** 表格，可以看到目前各版本名所包含的子项目

*注意：关于其各版本与 Spring-Boot 版本之间的关系，也会在这里面看到*

| Component | Angel.SR6 | Brixton.SR7 | Camden.SR3 | Camden.BUILD-SNAPSHOT |
|:---------:|:---------:|:-----------:|:----------:|:---------------------:|
| spring-cloud-aws     | 1.0.4.RELEASE | 1.1.3.RELEASE | 1.1.3.RELEASE | 1.1.4.BUILD-SNAPSHOT |
| spring-cloud-bus     | 1.0.3.RELEASE | 1.1.2.RELEASE | 1.2.1.RELEASE | 1.2.2.BUILD-SNAPSHOT |
| spring-cloud-cli     | 1.0.6.RELEASE | 1.1.6.RELEASE | 1.2.0.RC1     | 1.2.0.BUILD-SNAPSHOT |
| spring-cloud-commons | 1.0.5.RELEASE | 1.1.3.RELEASE | 1.1.6.RELEASE | 1.1.7.BUILD-SNAPSHOT |
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
　　　服务消费者依然可以使用缓存中的信息找到服务提供者**（亲测）**
