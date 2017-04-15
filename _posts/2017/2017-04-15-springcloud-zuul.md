---
layout: post
title: "SpringCloud系列第07节之服务网关Zuul"
categories: SpringCloud
tags: springcloud spring
author: 玄玉
excerpt: 本文演示了Zuul实现的API-Gateway。
---

* content
{:toc}


## 为什么需要网关

之前的系列文章中演示了，服务提供方和消费方都注册到注册中心，使得消费方能够直接通过 ServiceId 访问服务方

实际情况是：通常我们的服务方可能都需要做 **接口权限校验、限流、软负载均衡** 等等

而这类工作，完全可以交给服务方的更上一层：服务网关，来集中处理

**这样的目的：保证微服务的无状态性，使其更专注于业务处理**

所以说，服务网关是微服务架构中一个很重要的节点，Spring Cloud Netflix 中的 Zuul 就担任了这样的角色

当然了，除了 Zuul 之外，还有很多软件也可以作为 API Gateway 的实现，比如 Nginx Plus、Kong 等等

## 网关映射

通过服务路由的功能，可以在对外提供服务时，只暴露 Zuul 中配置的调用地址，而调用方就不需要了解后端具体的微服务主机

Zuul 提供了两种映射方式：URL 映射和 ServiceId 映射（后者需要将 Zuul 注册到注册中心，使之能够发现后端的微服务）

ServiceId 映射的好处是：它支持软负载均衡，基于 URL 的方式是不支持的（实际测试也的确如此）

## 示例代码

示例代码如下（也可以直接从 Github 下载：[https://github.com/v5java/demo-cloud-07-zuul](https://github.com/v5java/demo-cloud-07-zuul)）

它是由六个模块组成的 Maven 工程，其中包含兩个服务提供方、两个服务网关、一个注册中心、一个服务消费方

**它们之前的关系是：消费方软负载均衡调用两个服务网关，服务网关根据路由配置再一次软负载均衡调用两个服务提供方**

这是公共的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.jadyer.demo</groupId>
    <artifactId>demo-cloud-07-zuul</artifactId>
    <version>1.1</version>
    <packaging>pom</packaging>
    <modules>
        <module>service-client</module>
        <module>service-discovery</module>
        <module>service-gateway-01</module>
        <module>service-gateway-02</module>
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

这是注册中心的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-07-zuul</artifactId>
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

这是注册中心的配置文件 `/src/main/resources/application.yml`

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

### 服务提供方01

这是第一个服务提供方的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-07-zuul</artifactId>
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
 * --------------------------------------------------------------------------------------------
 * 也可以使用org.springframework.cloud.client.discovery.@EnableDiscoveryClient注解
 * 详见以下两篇文章的介绍
 * http://cloud.spring.io/spring-cloud-static/Camden.SR3/#_registering_with_eureka
 * https://spring.io/blog/2015/01/20/microservice-registration-and-discovery-with-spring-cloud-and-netflix-s-eureka
 * --------------------------------------------------------------------------------------------
 * Created by 玄玉<https://jadyer.github.io/> on 2017/1/9 16:00.
 */
@EnableEurekaClient
@SpringBootApplication
public class ServiceServer01BootStarp {
    public static void main(String[] args) {
        SpringApplication.run(ServiceServer01BootStarp.class, args);
    }
}
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

### 服务提供方02

除了启动端口为2200外，其代码与服务提供方01的完全相同

### 服务网关01

这是第一个服务网关的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-07-zuul</artifactId>
        <version>1.1</version>
    </parent>
    <artifactId>service-gateway-01</artifactId>
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
            <artifactId>spring-cloud-starter-zuul</artifactId>
        </dependency>
    </dependencies>
</project>
```

这是第一个服务网关的配置文件 `/src/main/resources/application.yml`

```yml
server:
  port: 4100

spring:
  application:
    name: jadyer-api-gateway       # 指定发布的微服务名（以后调用时，只需该名称即可访问该服务）

zuul:
  ignored-services: "*"            # 设置忽略的服务，即配置后将不会被路由（但对于明确配置在路由中的，将不会被忽略）
  routes:
    api-cal-url:                   # 基于 URL 的映射（这里自定义路由的名字为 api-cal-url，它可任意指定，唯一即可）
      path: /cal/**                # http://127.0.0.1:4100/cal/add?a=7&b=17会路由至http://127.0.0.1:2100/add?a=7&b=17
      url: http://127.0.0.1:2100/
    api-add:                       # 基于 ServiceId 的映射（自定义路由的名字）
      path: /caladd/**             # http://127.0.0.1:4100/caladd/add?a=6&b=16会路由至CalculatorServer服务的/add?a=6&b=16
      serviceId: CalculatorServer
    CalculatorServer:              # 基于 ServiceId 的映射（路由的名字等于 ServiceId 的情况下，serviceId 属性可以省略）
      path: /mycall/**             # http://127.0.0.1:4100/mycall/add?a=5&b=15会路由至CalculatorServer服务的 /add?a=5&b=15
      #serviceId: CalculatorServer

eureka:
  instance:
    instance-id: ${spring.application.name}:${server.port}
    prefer-ip-address: true                   # 设置微服务调用地址为IP优先（缺省为false）
    lease-renewal-interval-in-seconds: 5      # 心跳时间，即服务续约间隔时间（缺省为30s）
    lease-expiration-duration-in-seconds: 15  # 发呆时间，即服务续约到期时间（缺省为90s）
  client:
    healthcheck:
      enabled: true                               # 开启健康检查（依赖spring-boot-starter-actuator）
    serviceUrl:
      defaultZone: http://127.0.0.1:1100/eureka/  # 指定服务注册中心的地址
```

这是第一个服务网关的 SpringBoot 启动类 `ServiceGateway01BootStarp.java`

```java
package com.jadyer.demo;
import com.netflix.zuul.ZuulFilter;
import org.springframework.boot.SpringApplication;
import org.springframework.cloud.client.SpringCloudApplication;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
import org.springframework.context.annotation.Bean;

//注意不是@EnableZuulServer
@EnableZuulProxy
//注意这里使用了更加简化的@SpringCloudApplication
@SpringCloudApplication
public class ServiceGateway01BootStarp {
    /**
     * 这里的方法返回值，不能写成com.netflix.zuul.IZuulFilter
     * 可以写成com.netflix.zuul.ZuulFilter，或者com.jadyer.demo.GatewayFilter
     * 虽然语法上允许返回IZuulFilter，但实际测试发现返回IZuulFilter时，网关功能却没有生效
     */
    @Bean
    public ZuulFilter gatewayFilter() {
        return new GatewayFilter();
    }

    public static void main(String[] args) {
        SpringApplication.run(ServiceGateway01BootStarp.class, args);
    }
}
```

这是第一个服务网关中，用于控制接口访问权限的过滤器 `GatewayFilter.java`

```java
package com.jadyer.demo;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.servlet.http.HttpServletRequest;

/**
 * 利用Zuul的过滤器，可以实现对外服务的安全控制
 * -------------------------------------------------------------------------
 * 这里实现了在请求被路由之前检查请求中是否有accesstoken参数
 * 若有就进行路由，若没有就拒绝访问，返回401 Unauthorized错误
 * http://127.0.0.1:4100/mycall/add?a=11&b=22：返回"权限不足"
 * http://127.0.0.1:4100/mycall/add?a=11&b=22&accesstoken=token：返回正常
 * -------------------------------------------------------------------------
 * Created by 玄玉<https://jadyer.github.io/> on 2017/1/14 15:05.
 */
public class GatewayFilter extends ZuulFilter {
    private Logger log = LoggerFactory.getLogger(getClass());

    /**
     * 如下所示，Zuul定义了四种不同生命周期的过滤器类型
     * pre    ：可以在请求被路由之前调用
     * routing：在路由请求时候被调用
     * post   ：在routing和error过滤器之后被调用
     * error  ：处理请求时发生错误时被调用
     */
    @Override
    public String filterType() {
        return "pre";
    }

    @Override
    public int filterOrder() {
        //通过int值来定义过滤器的执行顺序
        return 0;
    }

    @Override
    public boolean shouldFilter() {
        //设置该过滤器总是生效，即总是执行拦截请求
        return true;
    }

    /**
     * 过滤器的具体逻辑
     */
    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest request = ctx.getRequest();
        log.info(String.format("收到 %s 请求 %s", request.getMethod(), request.getRequestURL().toString()));
        Object accessToken = request.getParameter("accesstoken");
        if(accessToken == null) {
            ctx.getResponse().setContentType("text/html;charset=UTF-8");
            log.warn("accesstoken为空");
            //令zuul过滤该请求，不对其进行路由
            ctx.setSendZuulResponse(false);
            //设置其返回的错误码和报文体
            //这里没有设置应答码为401，是因为401会导致客户端走到它的断路器里面（HystrixCalculatorService）
            //所有设置为200，让应答报文体跳过客户端的断路器，返回给前台
            ctx.setResponseStatusCode(200);
            ctx.setResponseBody("权限不足");
            return null;
        }
        log.info("accesstoken验证通过");
        return null;
    }
}
```

### 服务网关02

除了启动端口为4200外，其代码与服务网关01的完全相同

### 服务消费方

这是服务消费方的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-07-zuul</artifactId>
        <version>1.1</version>
    </parent>
    <artifactId>service-client</artifactId>
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

这是服务消费方的配置文件 `/src/main/resources/application.yml`

```yml
server:
  port: 3100

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

这是服务消费方 SpringBoot 启动类 `ServiceClientBootStarp.java`

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
public class ServiceClientBootStarp {
    public static void main(String[] args) {
        SpringApplication.run(ServiceClientBootStarp.class, args);
    }
}
```

这是服务消费方的，包含了断路器指向的，调用服务网关的实现 `CalculatorService.java`

```java
package com.jadyer.demo.feign;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

//绑定該接口到服务网关的jadyer-api-gateway服务，并通知Feign组件对该接口进行代理（不需要编写接口实现）
@FeignClient(value="jadyer-api-gateway", fallback=HystrixCalculatorService.class)
interface CalculatorService {
    ////@PathVariable這種也是支持的
    //@RequestMapping(value="/mycall/add/{a}", method=RequestMethod.GET)
    //int myadd(@PathVariable("a") int a, @RequestParam("b") int b, @RequestParam("accesstoken") String accesstoken);

    //通过SpringMVC的注解来配置所綁定的服务下的具体实现
    @RequestMapping(value="/mycall/add", method=RequestMethod.GET)
    String myadd(@RequestParam("a") int a, @RequestParam("b") int b, @RequestParam("accesstoken") String accesstoken);
}
```

这是服务消费方的断路器配置类 `HystrixCalculatorService.java`

```java
package com.jadyer.demo.feign;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestParam;

@Component
public class HystrixCalculatorService implements CalculatorService {
    @Override
    public String myadd(@RequestParam("a") int a, @RequestParam("b") int b, @RequestParam("accesstoken") String accesstoken) {
        return "负999";
    }
}
```

这是服务消费方的调用示例 `ConsumerController.java`

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
    String toadd(int a, int b, String accesstoken){
        return calculatorService.myadd(a, b, accesstoken);
    }
}
```

## 验证

分别用浏览器多次访问以下地址，然后观察两个服务提供方、两个服务网关的控制台输出即可

[http://127.0.0.1:4100/cal/add?a=7&b=17](http://127.0.0.1:4100/cal/add?a=7&b=17)

[http://127.0.0.1:4100/cal/add?a=7&b=17&accesstoken=00](http://127.0.0.1:4100/cal/add?a=7&b=17&accesstoken=00)

[http://127.0.0.1:4100/caladd/add?a=6&b=16](http://127.0.0.1:4100/caladd/add?a=6&b=16)

[http://127.0.0.1:4100/caladd/add?a=6&b=16&accesstoken=00](http://127.0.0.1:4100/caladd/add?a=6&b=16&accesstoken=00)

[http://127.0.0.1:4200/mycall/add?a=5&b=15](http://127.0.0.1:4200/mycall/add?a=5&b=15)

[http://127.0.0.1:4200/mycall/add?a=5&b=15&accesstoken=00](http://127.0.0.1:4200/mycall/add?a=5&b=15&accesstoken=00)

[http://127.0.0.1:3100/demo/feign/toadd?a=22&b=56](http://127.0.0.1:3100/demo/feign/toadd?a=22&b=56)

[http://127.0.0.1:3100/demo/feign/toadd?a=22&b=56&accesstoken=00](http://127.0.0.1:3100/demo/feign/toadd?a=22&b=56&accesstoken=00)