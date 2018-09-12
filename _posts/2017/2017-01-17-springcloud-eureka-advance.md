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

Eureka 在设计时，认为分布式环境的网络是不可靠的，可能会出现网络原因导致 EurekaServer 没有收到实例的心跳

而这却并不能说明实例就宕了，**所以 EurekaServer 缺省会打开保护模式**，它主要是网络分区场景下的一种保护

一旦进入保护模式，EurekaServer 将会尝试保护其服务注册表中的信息，不再删除里面的数据（即不会注销任何微服务）

相关介绍，详见：[https://github.com/Netflix/eureka/wiki/Understanding-Eureka-Peer-to-Peer-Communication](https://github.com/Netflix/eureka/wiki/Understanding-Eureka-Peer-to-Peer-Communication)

在这种机制下，它仍然鼓励客户端再去尝试调用这个所谓 down 状态的实例，若确实调用失败，那么断路器就派上用场了

*关于断路器，在接下来的系列文章中，我会详细介绍并演示*

通过修改注册中心的配置文件 application.yml，即可打开或关闭注册中心的自我保护模式

```yml
eureka:
  server:
    enable-self-preservation: false           # 关闭自我保护模式（缺省为打开）
```

## 踢出已关停的节点

自我保护模式打开时，已关停节点是会一直显示在 Eureka 首页的

关闭自我保护模式后，由于其默认的心跳周期比较长等原因，要过一会儿才会发现已关停节点被自动踢出了

若想尽快的及时踢出，那就只有修改默认的心跳周期参数了，如下所示

注册中心的配置文件 application.yml 需要修改的地方为

```yml
eureka:
  server:
    enable-self-preservation: false           # 关闭自我保护模式（缺省为打开）
    eviction-interval-timer-in-ms: 1000       # 续期时间，即扫描失效服务的间隔时间（缺省为60*1000ms）
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

关于续期、心跳、发呆时间的关系，详见上一篇文章中的有关分析：[https://jadyer.cn/2017/01/16/springcloud-eureka/](https://jadyer.cn/2017/01/16/springcloud-eureka/)

> 注意：更改 Eureka Server 的更新频率将打破注册中心的的自我保护功能<br>
　　　生产环境不建议自定义这些配置，详见[https://github.com/spring-cloud/spring-cloud-netflix/issues/373](https://github.com/spring-cloud/spring-cloud-netflix/issues/373)

## 注册服务慢的问题

修改微服务的 eureka.instance.lease-renewal-interval-in-seconds 参数（即心跳时间），便可解决此问题

详见：[http://cloud.spring.io/spring-cloud-static/Camden.SR4/#_why_is_it_so_slow_to_register_a_service](http://cloud.spring.io/spring-cloud-static/Camden.SR4/#_why_is_it_so_slow_to_register_a_service)

## 服务状态UNKNOWN

如果把微服务的 eureka.client.healthcheck.enabled 属性配置在 bootstrap.yml 里面，可能会引起一些不良反应

比如，实际测试发现，Eureka 首页显示的服务状态，本应是 UP(1)，却变成大红色的粗体 UNKNOWN(1)

> Tips：bootstrap.yml 通常会在连接 Spring Cloud Config 搭建的配置中心时使用，接下来的本系列文章中会有介绍和演示

## 首页显示的微服务名

Eureka 首页显示的微服务名默认为：`机器主机名:应用名称:应用端口`

也就是：`${spring.cloud.client.hostname}:${spring.application.name}:${spring.application.instance_id:${server.port}}`

我们也可以修改微服务的配置文件，定制它注册到注册中心时显示的名字，如下所示

```yml
eureka:
  instance:
    # instance-id: ${spring.application.name}                     # 修改显示的微服务名为：应用名称
    instance-id: ${spring.cloud.client.ipAddress}:${server.port}  # 修改显示的微服务名为：IP:端口
```

同样可以知道，两个相同的服务（端口不同），如果注册时设置的都是 eureka.instance.instance-id=${spring.application.name}

那么 Eureka 首页只会看到一个服务名字，而无法区分有几个实例注册上来了（因为注册上来的实例名都是相同的），这是要注意的

## 首页显示的微服务链接

既然微服务显示的名称允许修改，那么其对应的点击链接，也是可以修改的

同样的，还是修改微服务的配置文件，如下所示

```yml
eureka:
  instance:
    # ip-address: 192.168.6.66  # 只有prefer-ip-address=true时才会生效
    prefer-ip-address: true     # 设置微服务调用地址为IP优先（缺省为false）
```

Eureka 首页显示的微服务调用地址，默认是这样的：[http://jadyer-pc:2100/info](http://jadyer-pc:2100/info)

而在设置 prefer-ip-address=true 之后，调用地址会变成：[http://10.16.18.95:2100/info](http://10.16.18.95:2100/info)

这时若再设置 ip-address=192.168.6.66，则调用地址会变成：[http://192.168.6.66:2100/info](http://192.168.6.66:2100/info)