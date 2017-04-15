---
layout: post
title: "SpringCloud系列第06节之断路器Hystrix"
categories: SpringCloud
tags: springcloud spring
author: 玄玉
excerpt: 本文演示了客户端在Ribbon和Feign两种实现方式下的，断路器Hystrix的用法。
---

* content
{:toc}


## 前言

微服务架构中，一般都存在着很多的服务单元

这样就有可能出现一个单元因为网络原因或自身问题而出现故障或延迟，导致调用方的对外服务也出现延迟

如果此时调用方的请求不断增加，时间一长就会出现由于等待故障方响应而形成任务积压，最终导致调用方自身服务的瘫痪

为了解决这种问题：便出现了断路器（或者叫熔断器，Cricuit Breaker）模式

断路器模式源于 Martin Fowler 的 [Circuit Breaker](http://martinfowler.com/bliki/CircuitBreaker.html) 一文

我们日常生活中的断路器，本身是一种开关装置，用于在电路上保护线路过载

当线路中有电器发生短路时，它能够及时切断故障电路，防止发生过载、发热、甚至起火等严重后果

而微服务架构中的断路器，其作用是：**当某个服务单元发生故障（类似用电器短路）之后**

**通过断路器的故障监控（类似熔断保险丝），向调用方返回一个错误响应，而不是长时间的等待**

这就不会使得线程被故障服务长时间占用而不释放，避免了故障在分布式系统中的蔓延

## Hystrix的介绍

[Hystrix](https://github.com/Netflix/Hystrix) 正是 Netflix 开源的 [javanica](https://github.com/Netflix/Hystrix/tree/master/hystrix-contrib/hystrix-javanica) 提供的微服务框架套件之一

它是由 Java 实现的，用来处理分布式系统发生故障或延迟时的容错库

它提供了 **断路器、资源隔离、自我修复** 三大功能

1. 断路器<br>
实际可初步理解为快速失败，快速失败是防止资源耗尽的关键点<br>
当 Hystrix 发现在过去某段时间内对服务 AA 的调用出错率达到阀值时，它就会**“熔断”**该服务<br>
后续任何向服务 AA 的请求都会快速失败，而不是白白让调用线程去等待<br>
2. 资源隔离<br>
首先，Hystrix 对每一个依赖服务都配置了一个线程池，对依赖服务的调用会在线程池中执行<br>
比如，服务 AA 的线程池大小为20，那么 Hystrix 会最多允许有20个容器线程调用服务 AA（超出20，它会拒绝并快速失败）<br>
这样即使服务 AA 长时间未响应，容器最多也只能堵塞20个线程，剩余的线程仍然可以处理用户请求<br>
3. 自我修复<br>
处于熔断状态的服务，在经过一段时间后，Hystrix 会让其进入**“半关闭”**状态（即允许少量请求通过）<br>
然后统计调用的成功率，若每个请求都能成功，Hystrix 会恢复该服务，从而达到自我修复的效果<br>
其中：在服务被熔断到进入**“半关闭”**状态之间的时间，就是留给开发人员排查错误并恢复故障的时间

## Hystrix的隔离策略

Hystrix 基于命令模式 HystrixCommand 来包装依赖调用逻辑，其每个命令在单独线程中或信号授权下执行

（Command 是在 Receiver 和 Invoker 之间添加的中间层，Command 实现了对 Receiver 的封装）

Hystrix 支持两种隔离策略：线程池隔离和信号量隔离（都是限制对共享资源的并发访问量）

1. ThreadPool<br>
根据配置把不同命令分配到不同的线程池中，这是比较常用的隔离策略，其优点是隔离性好，并且可以配置断路<br>
某个依赖被设置断路之后，系统不会再尝试新起线程运行它，而是直接提示失败，或返回fallback值<br>
它的缺点是新起线程执行命令，在执行时必然涉及上下文的切换，这会造成一定的性能消耗<br>
但是 Netflix 做过实验，这种消耗对比其带来的价值是完全可以接受的，具体的数据参见 [Hystrix-Wiki](https://github.com/Netflix/Hystrix/wiki/How-it-Works#wiki-Isolation)
2. Semaphores<br>
顾名思义就是使用一个信号量来做隔离<br>
开发者可以限制系统对某一个依赖的最高并发数，这个基本上就是一个限流的策略<br>
每次调用依赖时都会检查一下是否到达信号量的限制值，如达到，则拒绝<br>
该策略的优点是不新起线程执行命令，减少上下文切换，缺点是无法配置断路，每次都一定会去尝试获取信号量

## Hystrix的配置参数

Hystrix 的大部分配置都是 hystrix.command.[HystrixCommandKey] 开头

其中 [HystrixCommandKey] 是可变的，默认是 default，即：hystrix.command.default（对于 Zuul 而言，CommandKey 就是 service id）

它常见的有以下几个配置

* hystrix.command.default.execution.isolation.thread.timeoutInMilliseconds<br>
用来设置 thread 和 semaphore 两种隔离策略的超时时间，默认值是1000<br>
建议设置这个参数，在 Hystrix-1.4.0 之前，semaphore-isolated 隔离策略是不能超时的，1.4.0 开始 semaphore-isolated 也支持超时时间了

* hystrix.command.default.execution.isolation.semaphore.maxConcurrentRequests<br>
此值并非 TPS、QPS、RPS 等都是相对值，它指的是 **1** 秒时间窗口内的事务 **/** 查询 **/** 请求，它是一个绝对值，无时间窗口<br>
相当于亚毫秒级的，指任意时间点允许的并发数，当请求达到或超过该设置值后，其其余就会被拒绝，默认值是100

* hystrix.command.default.execution.timeout.enabled<br>
是否开启超时，默认为true

* hystrix.command.default.execution.isolation.thread.interruptOnTimeout<br>
发生超时是是否中断线程，默认是true

* hystrix.command.default.execution.isolation.thread.interruptOnCancel<br>
取消时是否中断线程，默认是false

* hystrix.command.default.circuitBreaker.requestVolumeThreshold<br>
当在配置时间窗口内达到此数量的失败后，进行短路，默认20个

* hystrix.command.default.circuitBreaker.sleepWindowInMilliseconds<br>
短路多久以后开始尝试是否恢复，默认5s

* hystrix.command.default.circuitBreaker.errorThresholdPercentage<br>
出错百分比阈值，当达到此阈值后，开始短路，默认50%

* hystrix.command.default.fallback.isolation.semaphore.maxConcurrentRequests<br>
调用线程允许请求 HystrixCommand.GetFallback() 的最大数量，默认10，超出时将会有异常抛出<br>
注意：该项配置对于 thread 隔离模式也起作用

以上就是列举的一些常见配置，更多内容可参考：[https://github.com/Netflix/Hystrix/wiki/Configuration](https://github.com/Netflix/Hystrix/wiki/Configuration)

## 示例代码

示例代码如下（也可以直接从 Github 下载：[https://github.com/v5java/demo-cloud-06-hystrix](https://github.com/v5java/demo-cloud-06-hystrix)）

它是由四个模块组成的 Maven 工程，其中包含兩个服务消费者、一个注册中心、一个服务提供者

这是公共的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.jadyer.demo</groupId>
    <artifactId>demo-cloud-06-hystrix</artifactId>
    <version>1.1</version>
    <packaging>pom</packaging>
    <modules>
        <module>service-client-01</module>
        <module>service-client-02</module>
        <module>service-discovery</module>
        <module>service-server</module>
    </modules>
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>1.4.5.RELEASE</version>
    </parent>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>Camden.SR6</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
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

这是注册中心的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-06-hystrix</artifactId>
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

这是中心的配置文件 `/src/main/resources/application.yml`

```yml
server:
  port: 1100

eureka:
  server:
    enable-self-preservation: false       # 关闭自我保护模式（缺省为打开）
    eviction-interval-timer-in-ms: 1000   # 续期时间，即扫描失效服务的间隔时间（缺省为60*1000ms）
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

这是注册中心的 SpringBoot 启动类 `ServiceDiscoveryBootStrap.java`

```java
package com.jadyer.demo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

//创建服务注册中心
@EnableEurekaServer
@SpringBootApplication
public class ServiceDiscoveryBootStrap {
    public static void main(String[] args) {
        SpringApplication.run(ServiceDiscoveryBootStrap.class, args);
    }
}
```

### 服务提供方

这是服务提供方的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-06-hystrix</artifactId>
        <version>1.1</version>
    </parent>
    <artifactId>service-server</artifactId>
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-eureka</artifactId>
        </dependency>
    </dependencies>
</project>
```

这是服务提供方的配置文件 `/src/main/resources/application.yml`

```yml
server:
  port: 2100

spring:
  application:
    name: CalculatorServer                        # 指定发布的微服务名（以后调用时，只需该名称即可访问该服务）

eureka:
  instance:
    instance-id: ${spring.application.name}:${server.port}
    prefer-ip-address: true                       # 设置微服务调用地址为IP优先（缺省为false）
    lease-renewal-interval-in-seconds: 5          # 心跳时间，即服务续约间隔时间（缺省为30s）
    lease-expiration-duration-in-seconds: 15      # 发呆时间，即服务续约到期时间（缺省为90s）
  client:
    healthcheck:
      enabled: true                               # 开启健康检查（依赖spring-boot-starter-actuator）
    serviceUrl:
      defaultZone: http://127.0.0.1:1100/eureka/  # 指定服务注册中心的地址
```

这是服务提供方的 SpringBoot 启动类 `ServiceServerBootStarp.java`

```java
package com.jadyer.demo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

/**
 * 通过 @EnableEurekaClient 注解，为服务提供方赋予注册和发现服务的能力
 * ------------------------------------------------------------------------------------------------------------------
 * 也可以使用org.springframework.cloud.client.discovery.@EnableDiscoveryClient注解
 * 详见以下两篇文章的介绍
 * http://cloud.spring.io/spring-cloud-static/Camden.SR3/#_registering_with_eureka
 * https://spring.io/blog/2015/01/20/microservice-registration-and-discovery-with-spring-cloud-and-netflix-s-eureka
 * ------------------------------------------------------------------------------------------------------------------
 * Created by 玄玉<https://jadyer.github.io/> on 2017/1/9 16:00.
 */
@EnableEurekaClient
@SpringBootApplication
public class ServiceServerBootStarp {
    public static void main(String[] args) {
        SpringApplication.run(ServiceServerBootStarp.class, args);
    }
}
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
 * Created by 玄玉<https://jadyer.github.io/> on 2017/1/9 16:00.
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

### 服务消费方Ribbon的断路

这是服务消费方Ribbon的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-06-hystrix</artifactId>
        <version>1.1</version>
    </parent>
    <artifactId>service-client-01</artifactId>
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-eureka</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-ribbon</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-hystrix</artifactId>
        </dependency>
    </dependencies>
</project>
```

这是服务消费方Ribbon的配置文件 `/src/main/resources/application.yml`

```yml
server:
  port: 3100

spring:
  application:
    name: client-consumer-ribbon

eureka:
  instance:
    instance-id: ${spring.application.name}:${server.port}
    prefer-ip-address: true
    lease-renewal-interval-in-seconds: 5
    lease-expiration-duration-in-seconds: 15
  client:
    healthcheck:
      enabled: true
    serviceUrl:
      defaultZone: http://127.0.0.1:1100/eureka/
```

这是服务消费方Ribbon的 SpringBoot 启动类 `ServiceClient01BootStarp.java`

```java
package com.jadyer.demo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

//@SpringCloudApplication
//开启断路器功能
@EnableCircuitBreaker
@EnableEurekaClient
@SpringBootApplication
public class ServiceClient01BootStarp {
    //开启软均衡负载
    @LoadBalanced
    @Bean
    RestTemplate restTemplate() {
        return new RestTemplate();
    }

    public static void main(String[] args) {
        SpringApplication.run(ServiceClient01BootStarp.class, args);
    }
}
```

这是服务消费方Ribbon的，包含了断路器配置的，远程服务调用实现 `CalculatorService.java`

```java
package com.jadyer.demo.ribbon;
import com.netflix.hystrix.contrib.javanica.annotation.HystrixCommand;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import javax.annotation.Resource;

@Service
class CalculatorService {
    @Resource
    private RestTemplate restTemplate;

    //指定断路后的回调方法（回调方法必须与原方法参数类型相同、返回值类型相同、方法名可以不同）
    @HystrixCommand(fallbackMethod="addServiceToFallback")
    int addService(int a, int b){
        String reqURL = "http://CalculatorServer/add?a=" + a + "&b=" + b;
        return restTemplate.getForEntity(reqURL, Integer.class).getBody();
    }

    public int addServiceToFallback(int aa, int bb){
        return -999;
    }
}
```

这是服务消费方Ribbon的调用示例 `ConsumerController.java`

```java
package com.jadyer.demo.ribbon;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.annotation.Resource;

/**
 * 服务调用方
 * Created by 玄玉<https://jadyer.github.io/> on 2017/1/10 18:23.
 */
@RestController
@RequestMapping("/demo/ribbon")
public class ConsumerController {
    @Resource
    private CalculatorService calculatorService;

    @RequestMapping("/toadd")
    int toadd(int a, int b){
        return calculatorService.addService(a, b);
    }
}
```

### 服务消费方Feign的断路

这是服务消费方Feign的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-06-hystrix</artifactId>
        <version>1.1</version>
    </parent>
    <artifactId>service-client-02</artifactId>
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-eureka</artifactId>
        </dependency>
        <!-- spring-cloud-starter-feign的内部已经包含了spring-cloud-starter-ribbon和spring-cloud-starter-hystrix -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-feign</artifactId>
        </dependency>
    </dependencies>
</project>
```

这是服务消费方Feign的配置文件 `/src/main/resources/application.yml`

```yml
server:
  port: 3200

spring:
  application:
    name: client-consumer-feign

eureka:
  instance:
    instance-id: ${spring.application.name}:${server.port}
    prefer-ip-address: true
    lease-renewal-interval-in-seconds: 5
    lease-expiration-duration-in-seconds: 15
  client:
    healthcheck:
      enabled: true
    serviceUrl:
      defaultZone: http://127.0.0.1:1100/eureka/
```

这是服务消费方Feign的 SpringBoot 启动类 `ServiceClient02BootStarp.java`

```java
package com.jadyer.demo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.netflix.feign.EnableFeignClients;

//开启Feign功能
@EnableFeignClients
@EnableEurekaClient
@SpringBootApplication
public class ServiceClient02BootStarp {
    public static void main(String[] args) {
        SpringApplication.run(ServiceClient02BootStarp.class, args);
    }
}
```

这是服务消费方Feign的，包含了断路器指向的，远程服务调用实现 `CalculatorService.java`

```java
package com.jadyer.demo.feign;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

//绑定該接口到CalculatorServer服务，并通知Feign组件对该接口进行代理（不需要编写接口实现）
@FeignClient(value="CalculatorServer", fallback=HystrixCalculatorService.class)
interface CalculatorService {
    ////@PathVariable這種也是支持的
    //@RequestMapping(value="/add/{a}", method=RequestMethod.GET)
    //int myadd(@PathVariable("a") int a, @RequestParam("b") int b);

    //通过SpringMVC的注解来配置所綁定的服务下的具体实现
    @RequestMapping(value="/add", method=RequestMethod.GET)
    int myadd(@RequestParam("a") int a, @RequestParam("b") int b);
}
```

这是服务消费方Feign的断路器配置类 `HystrixCalculatorService.java`

```java
package com.jadyer.demo.feign;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestParam;

@Component
public class HystrixCalculatorService implements CalculatorService {
    @Override
    public int myadd(@RequestParam("a") int a, @RequestParam("b") int b) {
        return -999;
    }
}
```

這是服务消费方Feign的调用示例 `ConsumerController.java`

```java
package com.jadyer.demo.feign;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.annotation.Resource;

/**
 * 服务调用方
 * Created by 玄玉<https://jadyer.github.io/> on 2017/1/10 18:23.
 */
@RestController
@RequestMapping("/demo/feign")
public class ConsumerController {
    @Resource
    private CalculatorService calculatorService;

    @RequestMapping("/toadd")
    int toadd(int a, int b){
        return calculatorService.myadd(a, b);
    }
}
```

## 验证

先不使用断路器，然后启动注册中心、服务提供方、两个服务消费方，然后分别访问以下两个接口

[http://10.16.64.133:3100/demo/ribbon/toadd?a=11&b=22](http://10.16.64.133:3100/demo/ribbon/toadd?a=11&b=22)

[http://10.16.64.133:3200/demo/feign/toadd?a=11&b=22](http://10.16.64.133:3200/demo/feign/toadd?a=11&b=22)

我们会发现都正常的返回了计算结果：33

然后停掉服务提供方，再访问两个接口，我们会看到下面的报警内容

```
# Ribbon会报告如下内容
Whitelabel Error Page

This application has no explicit mapping for /error, so you are seeing this as a fallback.

Sat Apr 15 11:12:48 CST 2017
There was an unexpected error (type=Internal Server Error, status=500).
I/O error on GET request for "http://CalculatorServer/add": Connection refused: connect; nested exception is java.net.ConnectException: Connection refused: connect
```

```
# Feign会报告如下内容
Whitelabel Error Page

This application has no explicit mapping for /error, so you are seeing this as a fallback.

Sat Apr 15 11:12:48 CST 2017
There was an unexpected error (type=Internal Server Error, status=500).
CalculatorService#myadd(int,int) timed-out and no fallback available.
```

然后我们再启用断路器，并访问两个接口（此时服务提供方是关闭的），都会看到该应答：-999