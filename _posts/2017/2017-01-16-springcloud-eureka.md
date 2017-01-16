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

Spring Cloud 已经把 Eureka 集成在其子项目 Spring Cloud Netflix 里面

关于 Eureka 配置的最佳实践，可参考：[https://github.com/spring-cloud/spring-cloud-netflix/issues/203](https://github.com/spring-cloud/spring-cloud-netflix/issues/203)

更多介绍，可参考：[http://cloud.spring.io/spring-cloud-static/Camden.SR4/#spring-cloud-eureka-server](http://cloud.spring.io/spring-cloud-static/Camden.SR4/#spring-cloud-eureka-server)

## 示例

这里只是一个基本的例子，只能用来尝尝鲜

更多丰富的介绍和演示，详见 Eureka 进阶篇：[https://jadyer.github.io/2017/01/16/springcloud-eureka-advance/](https://jadyer.github.io/2017/01/16/springcloud-eureka-advance/)

### 注册中心

代码比较简单，只有一个启动类 ServiceDiscoveryBootStrap.java 和一个配置文件 application.yml

```java
package com.jadyer.demo;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

//创建服务注册中心
@EnableEurekaServer
@SpringBootApplication
public class ServiceDiscoveryBootStrap {
	public static void main(String[] args) {
		new SpringApplicationBuilder(ServiceDiscoveryBootStrap.class).run(args);
	}
}
```

```yml
server:
  port: 1100

eureka:
  client:
    # 设置是否从注册中心获取注册信息（缺省true）
    # 因为这是一个单点的EurekaServer，不需要同步其它EurekaServer节点的数据，故设为false
    fetch-registry: false
    # 设置是否将自己作为客户端注册到注册中心（缺省true）
    # 这里为不需要（查看@EnableEurekaServer注解的源码，会发现它间接用到了@EnableDiscoveryClient）
    register-with-eureka: false
    # 在未设置defaultZone的情况下，注册中心在本例中的默认地址就是http://127.0.0.1:1100/eureka/
    # 但奇怪的是，启动注册中心时，控制台还是会打印这个地址的节点：http://localhost:8761/eureka/
    # 而实际服务端注册时，要使用1100的才能注册成功，8761的会注册失败并报告异常
    serviceUrl:
      # 实际测试：若修改尾部的eureka为其它的，注册中心启动没问题，但服务端在注册时会失败
      # 报告异常：com.netflix.discovery.shared.transport.TransportException: Cannot execute request on any known server
      defaultZone: http://127.0.0.1:${server.port}/eureka/
```

补充一个日志输出配置的 logback.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
	<contextName>${PROJECT_NAME}</contextName>

	<appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
		<encoder>
			<pattern>[%d{yyyyMMddHHmmssSSS}][%t][%C{0}.%M]%m%n</pattern>
		</encoder>
	</appender>

	<logger name="org.jboss" level="WARN"/>
	<logger name="org.apache" level="WARN"/>
	<logger name="com.netflix" level="INFO"/>
	<logger name="org.hibernate" level="WARN"/>
	<logger name="org.springframework" level="WARN"/>

	<root level="DEBUG">
		<appender-ref ref="CONSOLE"/>
	</root>
</configuration>
```

顺便看一下注册中心 Eureka 首页效果图

![](/img/2017/2017-01-16-springcloud-eureka.png)

### 服务端