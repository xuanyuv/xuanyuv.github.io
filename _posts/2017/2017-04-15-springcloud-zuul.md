---
layout: post
title: "SpringCloud系列第07节之服务网关Zuul"
categories: SpringCloud
tags: springcloud spring
author: 玄玉
excerpt: 本文演示了Zuul实现的API-Gateway。
---

* content
{:toc}


## 为什么需要网关

之前的系列文章中演示了，服务提供方和消费方都注册到注册中心，使得消费方直接通过 ServiceId 访问服务方

实际情况是，通常我们的服务方可能都需要做：接口权限校验、限流、软负载均衡等等

而这类工作，完全可以交给服务方的上一层：服务网关，来集中处理

**我们的目的就是：保证微服务的无状态性，令其更专注于业务处理**

所以说，服务网关是微服务架构中的一个很重要的节点，Spring Cloud Netflix 中的 Zuul 就担任了这样的角色

当然了，除了 Zuul 之外，还有很多软件也可以作为 API Gateway 的实现，比如 Nginx Plus、Kong 等等

## 网关映射

通过服务路由的功能，可以在对外提供服务时，只暴露 Zuul 中配置的调用地址，而调用方就不需要了解后端具体的微服务主机信息

Zuul 提供了两种映射方式：URL 映射和 ServiceId 映射（后者需要将 Zuul 注册到注册中心，使之能够发现后端的微服务）

而基于 ServiceId 映射的好处是：它支持软负载均衡，基于 URL 的方式是不支持的（实际测试也的确如此）

## 示例代码

稍后补充。。