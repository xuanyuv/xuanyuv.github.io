---
layout: post
title: "SpringCloud系列第05节之服务消费Ribbon和Feign"
categories: SpringCloud
tags: springcloud spring
author: 玄玉
excerpt: 本文演示了分别通过Ribbon和Feign两种方式实现，调用注册中心的服务的例子。
---

* content
{:toc}


## Ribbon

Ribbon 是一个基于 HTTP 和 TCP 客户端的负载均衡器

它可以在客户端配置 ribbonServerList（服务端列表），然后轮询请求以实现均衡负载

它在联合 Eureka 使用时，ribbonServerList 会被 DiscoveryEnabledNIWSServerList 重写，扩展成从 Eureka 注册中心获取服务端列表

同时它也会用 NIWSDiscoveryPing 来取代 IPing，它将职责委托给 Eureka 来确定服务端是否已经启动

## Feign

Feign 中也使用了 Ribbon

Spring Cloud 为 Feign 增加了对 SpringMVC 注解的支持，还整合了 Ribbon 和 Eureka 来提供均衡负载的 HTTP 客户端实现

注意：spring-cloud-starter-feign 里面已经包含了 spring-cloud-starter-ribbon

## 示例代码

**==未完待续==**

年底较忙，过几天不忙的时候，我再把代码放上来