---
layout: post
title: "SpringCloud系列第02节之注册中心Eureka及示例"
categories: SpringCloud
tags: springcloud spring
author: 玄玉
excerpt: 本文主要对Eureka做一个基本介绍，并演示一个小demo。
---

* content
{:toc}


## 简介

[Eureka](https://github.com/Netflix/Eureka) 是 [Netflix](https://github.com/Netflix) 开发的，一个基于 REST 服务的，服务注册与发现的组件

它主要包括两个组件：Eureka Server 和 Eureka Client

* Eureka Client：一个Java客户端，用于简化与 Eureka Server 的交互（通常就是微服务中的客户端和服务端）
* Eureka Server：提供服务注册和发现的能力（通常就是微服务中的注册中心）

各个微服务启动时，会通过 Eureka Client 向 Eureka Server 注册自己，Eureka Server 会存储该服务的信息

也就是说，每一个微服务的客户端和服务端，都会注册到 Eureka Server，这就衍生出了微服务相互识别的话题

* 同步：每个 Eureka Server 同时也是 Eureka Client（逻辑上的）<br>
  　　　多个 Eureka Server 之间通过复制的方式完成服务注册表的同步，形成 Eureka 的高可用
* 续约：微服务启动后，会周期性地向 Eureka Server 发送心跳（默认周期为30秒）以Renew（续约）自己的信息
* 续期：Eureka Server 在一定时间内（默认90秒）没有收到某微服务节点的心跳，Eureka Server 会注销该微服务节点
* 识别：Eureka Client 会缓存 Eureka Server 中的信息<br>
  　　　即使所有的 Eureka Server 节点都宕掉，服务消费者依然可以使用缓存中的信息找到服务提供者**（笔者已亲测）**

Spring Cloud 已经把 Eureka 集成在其子项目 Spring Cloud Netflix 里面，以实现 Spring Cloud 的注册中心

关于 Eureka 配置的最佳实践，可参考：[https://github.com/spring-cloud/spring-cloud-netflix/issues/203](https://github.com/spring-cloud/spring-cloud-netflix/issues/203)

更多介绍，可参考：[http://cloud.spring.io/spring-cloud-static/Camden.SR4/#spring-cloud-eureka-server](http://cloud.spring.io/spring-cloud-static/Camden.SR4/#spring-cloud-eureka-server)

## 示例

#### 注册中心

#### 服务端