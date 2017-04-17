---
layout: post
title: "SpringCloud系列第08节之配置中心Config"
categories: SpringCloud
tags: springcloud spring
author: 玄玉
excerpt: 本文演示了spring-cloud-config实现的统一配置中心示例。
---

* content
{:toc}


## 配置中心

微服务意味着要将单体应用中的业务拆分成一个个子服务，每个服务的粒度相对较小，因此系统中会出现大量的服务

由于每个服务都依靠必要的配置信息才能运行，所以一套集中式的、动态的配置管理设施是必不可少的

于是 Spring Cloud 提供了 Spring Cloud Config 来解决这个问题

Spring Cloud Config 为服务端和客户端各应用的所有环境，提供了适用于分布式系统的，一个中心化的外部化配置支持

**说白了：服务端和客户端的所有应用针对每套部署环境，可能都有不同的配置，发布环境时都要注意所使用的配置文件**

而通过 Spring Cloud Config 实现的配置中心，能够达到所有应用的所有环境的配置文件统一集中管理，**且支持热更新**

它默认采用 git 存储配置信息，这样通过 git 客户端工具就可以很轻松的管理配置内容，维护环境配置的版本

虽然它也支持SVN存储和本地存储，但相信，很少有人这么做

更多内容，可参考：[http://cloud.spring.io/spring-cloud-static/Camden.SR4/#_spring_cloud_config](http://cloud.spring.io/spring-cloud-static/Camden.SR4/#_spring_cloud_config)

关于配置中心的高可用，可参考：[https://github.com/spring-cloud/spring-cloud-config/issues/87](https://github.com/spring-cloud/spring-cloud-config/issues/87)

关于配置中心与注册中心联合使用，可参考：[https://github.com/spring-cloud/spring-cloud-config/blob/master/docs/src/main/asciidoc/spring-cloud-config.adoc#discovery-first-bootstrap](https://github.com/spring-cloud/spring-cloud-config/blob/master/docs/src/main/asciidoc/spring-cloud-config.adoc#discovery-first-bootstrap)

## 示例代码

**稍后补充。。。**