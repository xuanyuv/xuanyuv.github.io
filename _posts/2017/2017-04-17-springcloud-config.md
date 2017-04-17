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

微服务架构中，每个微服务的运行，都会读取不同环境的不同配置信息

而本文的主角 Spring Cloud Config 就提供了适用于分布式系统的、集中式的外部化配置支持

**它能够统一集中管理所有应用的、所有环境的配置文件，且支持热更新**

其默认采用 git 仓库存储配置信息，好处是 git 工具便可轻松管理配置内容

（虽然也支持 svn 仓库存储和本地存储，但相信，很少有人这么做）

更多内容，可参考：[http://cloud.spring.io/spring-cloud-static/Camden.SR4/#_spring_cloud_config](http://cloud.spring.io/spring-cloud-static/Camden.SR4/#_spring_cloud_config)

关于配置中心的高可用，可参考：[https://github.com/spring-cloud/spring-cloud-config/issues/87](https://github.com/spring-cloud/spring-cloud-config/issues/87)

关于配置中心与注册中心联合使用，可参考：[https://github.com/spring-cloud/spring-cloud-config/blob/master/docs/src/main/asciidoc/spring-cloud-config.adoc#discovery-first-bootstrap](https://github.com/spring-cloud/spring-cloud-config/blob/master/docs/src/main/asciidoc/spring-cloud-config.adoc#discovery-first-bootstrap)

## 示例代码

**稍后补充。。。**