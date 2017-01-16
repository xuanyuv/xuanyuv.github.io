---
layout: post
title: "SpringCloud系列第03节之注册中心Eureka进阶"
categories: SpringCloud
tags: springcloud spring
author: 玄玉
excerpt: 本文是对Eureka，包括参数优化，做一个详细的介绍。
---

* content
{:toc}


## 自我保护模式

通过修改注册中心的配置文件 application.yml，即可打开或关闭自我保护模式

```yml
eureka:
  server:
    enable-self-preservation: false  # 关闭自我保护模式（缺省为打开）
```

Eureka 在设计时，认为分布式环境的网络是不可靠的，可能会出现网络原因导致 EurekaServer 没有收到实例的心跳

而这却并不能说明实例就宕了，**所以 EurekaServer 缺省会打开保护模式**，它主要是网络分区场景下的一种保护

一旦进入保护模式，EurekaServer 将会尝试保护其服务注册表中的信息，不再删除里面的数据（即不会注销任何微服务）

相关介绍，详见：[https://github.com/Netflix/eureka/wiki/Understanding-Eureka-Peer-to-Peer-Communication](https://github.com/Netflix/eureka/wiki/Understanding-Eureka-Peer-to-Peer-Communication)

在这种机制下，它仍然鼓励客户端再去尝试调用这个所谓 down 状态的实例，若确实调用失败，那么断路器就派上用场了

*关于断路器，在接下来的系列文章中，我会详细介绍并演示*

> 注意：更改 Eureka Server 的更新频率将打破服务的自我保护功能<br>
生产环境不建议自定义这些配置，详见：[https://github.com/spring-cloud/spring-cloud-netflix/issues/373](https://github.com/spring-cloud/spring-cloud-netflix/issues/373)

## 踢出已关停的节点

在自我保护模式打开的前提下，已关停节点是会一直显示在 Eureka 首页的

在关闭自我保护模式的情况下，由于其默认的心跳周期比较长等原因，要过一会儿才会发现已关停节点被自动踢出了

如果想尽可能的及时踢出，那就只有修改默认的心跳周期等参数了，如下所示

注册中心的配置文件 application.yml 需要修改的地方为

```yml
eureka:
  server:
    enable-self-preservation: false      # 关闭自我保护模式（缺省为打开）
    eviction-interval-timer-in-ms: 1000  # 续期时间，即扫描失效服务的间隔时间（缺省为60*1000ms）
```

微服务的配置文件 application.yml 需要修改的地方为

```yml
eureka:
  instance:
    lease-renewal-interval-in-seconds: 5      # 心跳时间，即服务续约间隔时间（缺省为30s）
    lease-expiration-duration-in-seconds: 15  # 发呆时间，即服务续约到期时间（缺省为90s）
  client:
    healthcheck:
      enabled: true                           # 开启健康检查（依赖spring-boot-starter-actuator）
```

关于续期时间、心跳时间、发呆时间的关系

详见上一篇文章中有关续约和续期的描述：[https://jadyer.github.io/2017/01/16/springcloud-eureka/](https://jadyer.github.io/2017/01/16/springcloud-eureka/)

> 如果把 eureka.client.healthcheck.enabled 属性配置在 bootstrap.yml 里面，可能会引起一些不良反应<br>
实际测试时发现：这个时候 Eureka 首页显示的服务状态，本来应该是 UP(1)，却变成了大红色的粗体 UNKNOWN(1)

## 注册服务慢的问题

修改 eureka.instance.lease-renewal-interval-in-seconds 参数（即心跳时间），便可解决此问题

详见：[http://cloud.spring.io/spring-cloud-static/Camden.SR4/#_why_is_it_so_slow_to_register_a_service](http://cloud.spring.io/spring-cloud-static/Camden.SR4/#_why_is_it_so_slow_to_register_a_service)


**== 未完待续 ==**