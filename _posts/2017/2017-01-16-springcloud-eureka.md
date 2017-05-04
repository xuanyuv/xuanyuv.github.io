---
layout: post
title: "SpringCloud系列第02节之注册中心Eureka"
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

也就是说，每个微服务的客户端和服务端，都会注册到 Eureka Server，这就衍生出了微服务相互识别的话题

* 同步：每个 Eureka Server 同时也是 Eureka Client（逻辑上的）<br>
  　　　多个 Eureka Server 之间通过复制的方式完成服务注册表的同步，形成 Eureka 的高可用
* 识别：Eureka Client 会缓存 Eureka Server 中的信息<br>
  　　　即使所有 Eureka Server 节点都宕掉，服务消费者仍可使用缓存中的信息找到服务提供者**（笔者已亲测）**
* 续约：微服务会周期性（默认30s）地向 Eureka Server 发送心跳以Renew（续约）自己的信息（类似于heartbeat）
* 续期：Eureka Server 会定期（默认60s）执行一次失效服务检测功能<br>
  　　　它会检查超过一定时间（默认90s）没有Renew的微服务，发现则会注销该微服务节点

Spring Cloud 已经把 Eureka 集成在其子项目 Spring Cloud Netflix 里面

关于 Eureka 配置的最佳实践，可参考：[https://github.com/spring-cloud/spring-cloud-netflix/issues/203](https://github.com/spring-cloud/spring-cloud-netflix/issues/203)

更多介绍，可参考：[http://cloud.spring.io/spring-cloud-static/Camden.SR4/#spring-cloud-eureka-server](http://cloud.spring.io/spring-cloud-static/Camden.SR4/#spring-cloud-eureka-server)

## 示例代码

本文的例子只能用来尝尝鲜，更丰富的配置详见 Eureka 进阶篇：[http://jadyer.cn/2017/01/17/springcloud-eureka-advance/](http://jadyer.cn/2017/01/17/springcloud-eureka-advance/)

这是演示的是一个由三个模块组成的  Maven 工程，其中包含一个注册中心和两个服务提供者

如下图所示

![](/img/2017/2017-01-16-springcloud-eureka-01.png)

这是公共的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.jadyer.demo</groupId>
    <artifactId>demo-cloud-02</artifactId>
    <version>1.1</version>
    <packaging>pom</packaging>
    <modules>
        <module>service-discovery</module>
        <module>service-server-01</module>
        <module>service-server-02</module>
    </modules>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>1.4.3.RELEASE</version>
    </parent>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>Camden.SR4</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.5.1</version>
                <configuration>
                    <source>1.7</source>
                    <target>1.7</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### 注册中心

总体思路如下

1. SpringBoot启动类标注 `@EnableEurekaServer` 注解
2. 设置自己本身不注册到注册中心

ok，let`s drink code ...

这是注册中心的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-02</artifactId>
        <version>1.1</version>
    </parent>
    <artifactId>service-discovery</artifactId>
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-eureka-server</artifactId>
        </dependency>
    </dependencies>
</project>
```

这是注册中心的 SpringBoot 启动类 `ServiceDiscoveryBootStrap.java`

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

这是注册中心的配置文件 `/src/main/resources/application.yml`

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
    # 而实际服务端注册时，要使用1100端口的才能注册成功，8761端口的会注册失败并报告异常
    serviceUrl:
      # 实际测试：若修改尾部的eureka为其它的，比如/myeureka，注册中心启动没问题，但服务端在注册时会失败
      # 报告异常：com.netflix.discovery.shared.transport.TransportException: Cannot execute request on any known server
      defaultZone: http://127.0.0.1:${server.port}/eureka/
```

### 服务提供方01

总体思路如下

1. SpringBoot启动类标注 `@EnableEurekaClient` 或者 `@EnableDiscoveryClient` 注解
2. 配置注册中心地址

ok，let`s drink code ...

这是服务提供方的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-02</artifactId>
        <version>1.1</version>
    </parent>
    <artifactId>service-server-01</artifactId>
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-eureka</artifactId>
        </dependency>
    </dependencies>
</project>
```

这是服务提供方的 SpringBoot 启动类 `ServiceServer01BootStarp.java`

```java
package com.jadyer.demo;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

/**
 * 通过 @EnableEurekaClient 注解，为服务提供方赋予注册和发现服务的能力
 * ------------------------------------------------------------------------------------------------------------------
 * 也可以使用org.springframework.cloud.client.discovery.@EnableDiscoveryClient注解
 * 详见以下两篇文章的介绍
 * http://cloud.spring.io/spring-cloud-static/Camden.SR3/#_registering_with_eureka
 * https://spring.io/blog/2015/01/20/microservice-registration-and-discovery-with-spring-cloud-and-netflix-s-eureka
 * ------------------------------------------------------------------------------------------------------------------
 * Created by 玄玉<http://jadyer.cn/> on 2017/1/9 16:00.
 */
@EnableEurekaClient
@SpringBootApplication
public class ServiceServer01BootStarp {
    public static void main(String[] args) {
        new SpringApplicationBuilder(ServiceServer01BootStarp.class).run(args);
    }
}
```

这是服务提供方的配置文件 `/src/main/resources/application.yml`

```yml
server:
  port: 2100

spring:
  application:
    name: CalculatorServer                        # 指定发布的微服务名（以后调用时，只需该名称即可访问该服务）

eureka:
  client:
    serviceUrl:
      defaultZone: http://127.0.0.1:1100/eureka/  # 指定服务注册中心的地址
```

这是服务提供方暴露的数学运算服务 `CalculatorController.java`

```java
package com.jadyer.demo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.annotation.Resource;

/**
 * 服务提供方暴露的数学运算服务
 * Created by 玄玉<http://jadyer.cn/> on 2017/1/9 16:00.
 */
@RestController
public class CalculatorController {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    @Resource
    private DiscoveryClient client;

    @RequestMapping("/add")
    public int add(int a, int b){
        //加运算
        int result = a + b;
        //输出服务信息
        ServiceInstance instance = client.getLocalServiceInstance();
        logger.info("uri={}，serviceId={}，result={}", instance.getUri(), instance.getServiceId(), result);
        //返回结果
        return result;
    }
}
```

### 服务提供方02

除了启动端口为2200外，其代码与服务提供方01的完全相同

## 验证

先看一下注册中心的 Eureka 首页效果图

可以看到：两个服务相同，启动端口不同的 CalculatorServer 已经注册进来了

由于发布的微服务所暴露出去的都是 HTTP 的接口，所以验证的话，我们可以浏览器直接访问下面的两个地址

[http://127.0.0.1:2100/add?a=3&b=13](http://127.0.0.1:2100/add?a=3&b=13)

[http://127.0.0.1:2200/add?a=3&b=13](http://127.0.0.1:2200/add?a=3&b=13)

![](/img/2017/2017-01-16-springcloud-eureka-02.png)

目前为止，我们完成了 Spring Cloud Netflix Eureka 搭建注册中心的基本示例，不过也只是尝尝鲜

因为它还存在着很多问题，比如

* 什么是自我保护模式
* 服务提供方关闭之后，在注册中心看到的状态还是 UP
* 注册中心的服务提供方显示的名字，是不是可以自定义
* ...
* ...

等等吧，这些问题，请参见 Eureka 进阶篇：[http://jadyer.cn/2017/01/17/springcloud-eureka-advance/](http://jadyer.cn/2017/01/17/springcloud-eureka-advance/)