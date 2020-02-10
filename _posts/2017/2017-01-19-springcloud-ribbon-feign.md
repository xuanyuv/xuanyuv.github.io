---
layout: post
title: "SpringCloud系列第05节之服务消费Ribbon和Feign"
categories: SpringCloud
tags: springcloud spring
author: 玄玉
excerpt: 本文演示了分别通过Ribbon和Feign两种方式实现，调用注册中心的服务的例子。
---

* content
{:toc}


## Ribbon

[Ribbon](https://github.com/Netflix/ribbon) 是一个基于 HTTP 和 TCP 客户端的负载均衡器

它可以在客户端配置 ribbonServerList（服务端列表），然后轮询请求以实现均衡负载

它在联合 Eureka 使用时

ribbonServerList 会被 DiscoveryEnabledNIWSServerList 重写，扩展成从 Eureka 注册中心获取服务端列表

同时它也会用 NIWSDiscoveryPing 来取代 IPing，它将职责委托给 Eureka 来确定服务端是否已经启动

## Feign

Spring Cloud Netflix 的微服务都是以 HTTP 接口的形式暴露的，所以可以用 Apache 的 HttpClient 或 Spring 的 RestTemplate 去調用

而 [Feign](https://github.com/Netflix/feign) 是一個使用起來更加方便的 HTTP 客戶端，它用起來就好像調用本地方法一樣，完全感覺不到是調用的遠程方法

总结起来就是：发布到注册中心的服务方接口，是 HTTP 的，也可以不用 Ribbon 或者 Feign，直接浏览器一样能够访问

只不过 Ribbon 或者 Feign 调用起来要方便一些，**最重要的是：它俩都支持软负载均衡**

> 注意：spring-cloud-starter-feign 里面已经包含了 spring-cloud-starter-ribbon（Feign 中也使用了 Ribbon）

## 示例代码

示例代码如下（也可以直接从 Github 下载：[https://github.com/v5java/demo-cloud-05-ribbon-feign](https://github.com/v5java/demo-cloud-05-ribbon-feign)）

它是由五個模块组成的 Maven 工程，其中包含一个注册中心、兩个服务提供者、兩个服务消费者（分别由Ribbon和Feign实现）

这是公共的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.jadyer.demo</groupId>
    <artifactId>demo-cloud-05</artifactId>
    <version>1.1</version>
    <packaging>pom</packaging>
    <modules>
        <module>service-client-01</module>
        <module>service-client-02</module>
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

這是註冊中心的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-05</artifactId>
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

這是註冊中心的配置文件 `/src/main/resources/application.yml`

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

这是註冊中心的 SpringBoot 启动类 `ServiceDiscoveryBootStrap.java`

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

### 服务提供方01

这是第一个服务提供方的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-05</artifactId>
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

这是第一个服务提供方的 SpringBoot 启动类 `ServiceServer01BootStarp.java`

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
 * Created by 玄玉<https://jadyer.cn/> on 2017/1/9 16:00.
 */
@EnableEurekaClient
@SpringBootApplication
public class ServiceServer01BootStarp {
    public static void main(String[] args) {
        SpringApplication.run(ServiceServer01BootStarp.class, args);
    }
}
```

这是第一个服务提供方暴露的数学运算服務 `CalculatorController.java`

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
 * Created by 玄玉<https://jadyer.cn/> on 2017/1/9 16:00.
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

### 服务消费方Ribbon

這是服务消费方Ribbon的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-05</artifactId>
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
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

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

这是服务消费方Ribbon的遠程服务調用實現 `CalculatorService.java`

```java
package com.jadyer.demo.ribbon;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import javax.annotation.Resource;

@Service
class CalculatorService {
    @Resource
    private RestTemplate restTemplate;

    int addService(int a, int b){
        String reqURL = "http://CalculatorServer/add?a=" + a + "&b=" + b;
        return restTemplate.getForEntity(reqURL, Integer.class).getBody();
    }
}
```

這是服务消费方Ribbon的調用示例 `ConsumerController.java`

```java
package com.jadyer.demo.ribbon;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.annotation.Resource;

/**
 * 服务调用方
 * Created by 玄玉<https://jadyer.cn/> on 2017/1/10 18:23.
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

### 服务消费方Feign

這是服务消费方Feign的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-05</artifactId>
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

这是服务消费方Feign的遠程服务調用實現 `CalculatorService.java`

```java
package com.jadyer.demo.feign;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

//绑定該接口到CalculatorServer服务，并通知Feign组件对该接口进行代理（不需要编写接口实现）
@FeignClient(value="CalculatorServer")
interface CalculatorService {
    ////@PathVariable這種也是支持的
    //@RequestMapping(value="/add/{a}", method=RequestMethod.GET)
    //int myadd(@PathVariable("a") int a, @RequestParam("b") int b);

    //通过SpringMVC的注解来配置所綁定的服务下的具体实现
    @RequestMapping(value="/add", method=RequestMethod.GET)
    int myadd(@RequestParam("a") int a, @RequestParam("b") int b);
}
```

這是服务消费方Feign的調用示例 `ConsumerController.java`

```java
package com.jadyer.demo.feign;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.annotation.Resource;

/**
 * 服务调用方
 * Created by 玄玉<https://jadyer.cn/> on 2017/1/10 18:23.
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

## 验证服务消费和软负载均衡

本文中的示例（Ribbon和Feign）都會將請求走软负载均衡后，打到服务端

验证方式就是：分別多次訪問下面的兩個服务消费URL，兩個服务端打印的請求日誌是均等輸出的

[http://10.16.64.133:3100/demo/ribbon/toadd?a=11&b=22](http://10.16.64.133:3100/demo/ribbon/toadd?a=11&b=22)

[http://10.16.64.133:3200/demo/feign/toadd?a=11&b=22](http://10.16.64.133:3200/demo/feign/toadd?a=11&b=22)

若没有走 Ribbon 或者 Feigin，而是直接浏览器访问服务方的接口

如下两个地址，也可以访问成功，只不过无法享受到软负载均衡

[http://10.16.64.133:2100/add?a=3&b=13](http://10.16.64.133:2100/add?a=3&b=13)

[http://10.16.64.133:2200/add?a=3&b=13](http://10.16.64.133:2200/add?a=3&b=13)

最後，補充一張註冊中心的頁面截圖：

![](https://ae01.alicdn.com/kf/Hcb52278614874a50a45708b8234b5164z.png)