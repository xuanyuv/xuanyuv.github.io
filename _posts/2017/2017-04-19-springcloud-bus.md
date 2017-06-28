---
layout: post
title: "SpringCloud系列第09节之消息总线Bus"
categories: SpringCloud
tags: springcloud spring
author: 玄玉
excerpt: 本文演示了spring-cloud-starter-bus-amqp结合RabbitMQ搭建消息总线，实现集群上应用读取的属性自动化更新。
---

* content
{:toc}


上一节的统一配置中心《[SpringCloud系列第08节之配置中心Config](http://jadyer.cn/2017/04/17/springcloud-config/)》演示了属性热加载

其中提到，每次热加载属性时，都要逐次调用每个应用的 `/refresh` 接口（或者维护 Git 仓库的 Webhooks）来触发属性更新

随着系统的扩充，应用的增加，若所有的触发动作都要手工去做（或者维护 Git 仓库的 Webhooks），这是不人道的

所以我们希望配置中心的属性发生变化时，能有一种途径去通知所有的相关应用去自动刷新配置

而通过 Spring Cloud Bus 就能够实现以消息总线的方式，通知集群上的应用，去动态更新配置信息

本文是以 RabbitMQ 来作为消息代理的中间件（实现将消息路由到一个或多个目的地），所以要先安装 RabbitMQ

## RabbitMQ的安装

RabbitMQ 是 AMQP（Advanced Message Queuing Protocol）协议的一个开源实现的产品

它是由以高性能、健壮、可伸缩性出名的 Erlang OTP 平台实现的工业级的消息队列服务器

所以在安装 RabbitMQ 之前，要先安装 Erlang，下面是它们的下载地址

[http://erlang.org/download/otp_win64_19.3.exe](http://erlang.org/download/otp_win64_19.3.exe)

[http://www.rabbitmq.com/releases/rabbitmq-server/v3.6.9/rabbitmq-server-3.6.9.exe](http://www.rabbitmq.com/releases/rabbitmq-server/v3.6.9/rabbitmq-server-3.6.9.exe)

Windows 下安装成功后，RabbitMQ Server 会自动注册为服务，并以默认配置启动

也可以在开始菜单，找到 RabbitMQ Server 目录，点击 RabbitMQ Service - start 来启动

## RabbitMQ的管理

为了能在 Web 界面管理 RabbitMQ，我们还需要启用它的管理插件

```
D:\Develop\RabbitMQServer\rabbitmq_server-3.6.9\sbin>rabbitmq-plugins enable rabbitmq_management
The following plugins have been enabled:
  amqp_client
  cowlib
  cowboy
  rabbitmq_web_dispatch
  rabbitmq_management_agent
  rabbitmq_management

Applying plugin configuration to rabbit@Jadyer-PC... started 6 plugins.

D:\Develop\RabbitMQServer\rabbitmq_server-3.6.9\sbin>
```

启用后，浏览器访问 [http://127.0.0.1:15672/](http://127.0.0.1:15672/) 即可（登录的用户名密码均为 guest）

登录进去之后，可以在上方的 Admin 导航菜单中新建用户，并分配权限等等

## 示例代码

示例代码如下（也可以直接从 Github 下载：[https://github.com/v5java/demo-cloud-09-bus](https://github.com/v5java/demo-cloud-09-bus)）

它是由四个模块组成的 Maven 工程，包含了一个注册中心、一个配置中心、两个读取了配置中心属性的服务提供方

它是在上一节的统一配置中心《[SpringCloud系列第08节之配置中心Config](http://jadyer.cn/2017/04/17/springcloud-config/)》的代码基础上改的

由于改动不多，所以下面就只列出来各个改动点

### 注册中心

无修改

### 配置中心

1. 引入依赖项spring-cloud-starter-bus-amqp
2. application.yml 中添加 spring.rabbitmq.* 的配置，如下所示

```yml
spring:
  rabbitmq:
    host: 127.0.0.1
    port: 5672        # 注意端口是5672，不是15672
    username: xuanyu
    password: xuanyu
```

### 服务提供方

其改动部分与配置中心相同：都是引入依赖，添加 rabbitmq 配置，简单粗暴一步到位（Spring Cloud Bus 自动化配置的功劳）

## 验证

还是分别访问两个服务提供方暴露出来的接口

[http://127.0.0.1:2100/demo/config/getHost](http://127.0.0.1:2100/demo/config/getHost)

[http://127.0.0.1:2200/demo/config/getHost](http://127.0.0.1:2200/demo/config/getHost)

属性热加载时，需要调用消息总线的 `/bus/refresh` 接口，共有两种方式（都能使集群中其它节点动态刷新读取到的属性）

1. 调用某个应用的接口：`curl -X POST http://127.0.0.1:2100/bus/refresh`
2. 调用消息总线的接口：`curl -X POST http://127.0.0.1:4100/bus/refresh`

但在需要迁移某个使用了的节点时，就不得不修改 Git 仓库的 Webhooks

**所以，为了使得各个微服务保持对等，故推荐第二种方式来刷新属性**

另外，也可通过 destination 参数来指定刷新范围，举例如下

`curl -X POST http://127.0.0.1:4100/bus/refresh?destination=demo.cloud.config:2200`

`curl -X POST http://127.0.0.1:4100/bus/refresh?destination=demo.cloud.config:**`