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


## 统一配置中心

微服务架构中，会有很多业务粒度相对较小的微服务

而每个服务，根据不同的环境，都需要不同的配置信息才能运行，所以一套集中式的、动态的配置管理设施是必不可少的

而本文的主角 Spring Cloud Config 就提供了适用于分布式系统的、中心化的、外部化配置支持

**它能够统一集中管理所有应用的、所有环境的、配置文件，且支持热更新**

其默认采用 git 仓库存储配置信息，好处是通过 git 客户端工具就可以轻松的管理配置内容，维护环境配置的版本

（虽然它也支持 svn 仓库存储和本地存储，但相信，很少有人这么做）

更多内容，可参考：[http://cloud.spring.io/spring-cloud-static/Camden.SR4/#_spring_cloud_config](http://cloud.spring.io/spring-cloud-static/Camden.SR4/#_spring_cloud_config)

关于配置中心的高可用，可参考：[https://github.com/spring-cloud/spring-cloud-config/issues/87](https://github.com/spring-cloud/spring-cloud-config/issues/87)

关于配置中心与注册中心联合使用，可参考：[https://github.com/spring-cloud/spring-cloud-config/blob/master/docs/src/main/asciidoc/spring-cloud-config.adoc#discovery-first-bootstrap](https://github.com/spring-cloud/spring-cloud-config/blob/master/docs/src/main/asciidoc/spring-cloud-config.adoc#discovery-first-bootstrap)

## 示例代码

**稍后补充。。。**