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

# 示例代码

这是演示的是一个由四个模块组成的  Maven 工程，其中包含两个注册中心和两个服务提供者

如下图所示

![](/img/2017/2017-01-18-springcloud-eureka-high-availability.png)

这是公共的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.jadyer.demo</groupId>
    <artifactId>demo-cloud-04</artifactId>
    <version>1.1</version>
    <packaging>pom</packaging>
    <modules>
        <module>service-discovery-01</module>
        <module>service-discovery-02</module>
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

### 注册中心01

这是第一个注册中心的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-04</artifactId>
        <version>1.1</version>
    </parent>
    <artifactId>service-discovery-01</artifactId>
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

这是第一个注册中心的 SpringBoot 启动类 `ServiceDiscovery01BootStrap.java`

```java
package com.jadyer.demo;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

//创建服务注册中心
@EnableEurekaServer
@SpringBootApplication
public class ServiceDiscovery01BootStrap {
    public static void main(String[] args) {
        new SpringApplicationBuilder(ServiceDiscovery01BootStrap.class).run(args);
    }
}
```

这是第一个注册中心的配置文件 `/src/main/resources/application.yml`

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
    # fetch-registry: false
    # 设置是否将自己作为客户端注册到注册中心（缺省true）
    # 这里为不需要（查看@EnableEurekaServer注解的源码，会发现它间接用到了@EnableDiscoveryClient）
    register-with-eureka: false
    # 在未设置defaultZone的情况下，注册中心在本例中的默认地址就是http://127.0.0.1:1100/eureka/
    # 但奇怪的是，启动注册中心时，控制台还是会打印这个地址的节点：http://localhost:8761/eureka/
    # 而实际服务端注册时，要使用1100端口的才能注册成功，8761端口的会注册失败并报告异常
    serviceUrl:
      # 实际测试：若修改尾部的eureka为其它的，比如/myeureka，注册中心启动没问题，但服务端在注册时会失败
      # 报告异常：com.netflix.discovery.shared.transport.TransportException: Cannot execute request on any known server
      defaultZone: http://127.0.0.1:1200/eureka/
```

### 注册中心02

其大部分代码与注册中心01相同，不同的有以下两处

1. 启动端口为1200
2. eureka.client.serviceUrl.defaultZone=http://127.0.0.1:1100/eureka/（指向到伙伴那里）

### 服务提供方01

这是第一个服务提供方的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-04</artifactId>
        <version>1.1</version>
    </parent>
    <artifactId>service-server-01</artifactId>
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

这是第一个服务提供方的 SpringBoot 启动类 `ServiceServer01BootStarp.java`

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

这是第一个服务提供方的配置文件 `/src/main/resources/application.yml`

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

这是第一个服务提供方暴露的数学运算服务 `CalculatorController.java`

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

其大部分代码与服务提供方01相同，不同的有以下两处

1. 启动端口为2200
2. eureka.client.serviceUrl.defaultZone=http://127.0.0.1:1200/eureka/（也可配成1100，再看效果，是一样的）

补充一下：服务提供方配置成这样也可以eureka.client.serviceUrl.defaultZone=http://127.0.0.1:1100/eureka/,http://127.0.0.1:1200/eureka/

至于验证，先启动两个注册中心（启动时会报错，不过没关系，这是由于它找不到伙伴），再启动服务提供方

然后看两个注册中心 Eureka 首页的注册服务列表，就会发现会被自动同步