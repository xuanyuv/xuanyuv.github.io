---
layout: post
title: "SpringCloud系列第04节之注册中心Eureka高可用"
categories: SpringCloud
tags: springcloud spring
author: 玄玉
excerpt: 本文是对Eureka高可用的一个介绍和演示。
---

* content
{:toc}


## 简介

Eureka Server 也支持运行多实例，并以互相注册的方式（即伙伴机制），来实现高可用的部署

即每一台 Eureka 都在配置中指定另一个 Eureka 地址作为伙伴，它在启动时会向伙伴节点获取注册列表

如此一来，Eureka 集群新加机器时，就不用担心注册列表的完整性

所以：我们只需要在 Eureke Server 里面配置其他可用的 serviceUrl，就实现了注册中心的高可用

详见：[http://cloud.spring.io/spring-cloud-static/spring-cloud.html#_peer_awareness](http://cloud.spring.io/spring-cloud-static/spring-cloud.html#_peer_awareness)

## Zone

上面提到 serviceUrl，那就顺便说下 defaultZone

Eureka 有一个 Region 和 Zone 的概念，你可以理解为现实中的大区（Region）和机房（Zone）

Eureka Client 在启动时需要指定 Zone，它会优先请求自己 Zone 的 Eureka Server 获取注册列表

同样的，Eureka Server 在启动时也需要指定 Zone，如果没有指定的话，其会默认使用 defaultZone

详见源码中的 getEurekaServerServiceUrls() 方法：[https://github.com/spring-cloud/spring-cloud-netflix/blob/master/spring-cloud-netflix-eureka-client/src/main/java/org/springframework/cloud/netflix/eureka/EurekaClientConfigBean.java](https://github.com/spring-cloud/spring-cloud-netflix/blob/master/spring-cloud-netflix-eureka-client/src/main/java/org/springframework/cloud/netflix/eureka/EurekaClientConfigBean.java)

<br>
<br>
<br>

**==【未完待续】=**