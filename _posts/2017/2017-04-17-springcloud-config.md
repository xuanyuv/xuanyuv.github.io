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

## 一些规则

### yml的加载顺序

应用读取配置中心参数时，会配置配置中心的地址等相关参数，**而这部分配置需优先于 application.yml 被应用读取**

SpringCloud 中的 bootstrap.yml 是会比 application.yml 先加载的，所以这部分配置要定义在 bootstrap.yml 里面

这就引申出两个需要注意的地方

* spring.application.name<br>
它应该配置在 bootstrap.yml，它的名字应该等于配置中心的配置文件的 {application}<br>
所以配置中心在给配置文件取名字时，最好让它等于对应的应用服务名

* 配置中心与注册中心联合使用<br>
若应用通过 serviceId 而非 url 来指定配置中心，则 eureka.client.serviceUrl.defaultZone 也要配置在 bootstrap.yml<br>
要不启动的时候，应用会找不到注册中心，自然也就找不到配置中心了

### url的映射关系

/{application}/{profile}[/{label}]

/{application}-{profile}.yml

/{label}/{application}-{profile}.yml

/{application}-{profile}.properties

/{label}/{application}-{profile}.properties

其中，{label} 对应 git 分支，{application}-{profile}.properties 对应配置文件的名字

所以，可以根据不同的 url 来访问不同的配置内容，比如本文的示例就对应下面链接

http://127.0.0.1:4100/demo.cloud.config/dev/master

http://127.0.0.1:4100/demo.cloud.config-dev.yml

http://127.0.0.1:4100/master/demo.cloud.config-test.yml

http://127.0.0.1:4100/demo.cloud.config-prod.properties

http://127.0.0.1:4100/master/demo.cloud.config-dev.properties

### 属性的热加载

1、显式标注 `@RefreshScope`

2、添加依赖 `spring-boot-starter-actuator`

3、刷新属性 `curl -X POST http://127.0.0.1:2100/refresh（大写的 X 和 POST）`

## 示例代码

示例代码如下（也可以直接从 Github 下载：[https://github.com/v5java/demo-cloud-08-config](https://github.com/v5java/demo-cloud-08-config)）

它是由四个模块组成的 Maven 工程，包含了一个注册中心、一个配置中心、两个读取了配置中心属性的服务提供方

这是公共的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.jadyer.demo</groupId>
    <artifactId>demo-cloud-08-config</artifactId>
    <version>1.1</version>
    <packaging>pom</packaging>
    <modules>
        <module>service-config</module>
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
        <artifactId>demo-cloud-08-config</artifactId>
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

### 配置中心

这是配置中心的 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.jadyer.demo</groupId>
        <artifactId>demo-cloud-08-config</artifactId>
        <version>1.1</version>
    </parent>
    <artifactId>service-config</artifactId>
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-config-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-eureka</artifactId>
        </dependency>
    </dependencies>
</project>
```

这是配置中心的配置文件 `/src/main/resources/application.yml`

```yml
server:
  port: 4100

spring:
  application:
    name: jadyer-config-server
  cloud:
    config:
      server:
        git:
          uri: https://github.com/v5java/demo-cloud-08-config  # 配置git仓库的地址
          searchPaths: config-repo                             # git仓库下的相对地址（多个则用半角逗号分隔）
          # username: username                                 # 只有private的项目才需配置用户名和密码
          # password: password                                 # 只有private的项目才需配置用户名和密码

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

这是配置中心的 SpringBoot 启动类 `ServiceConfigBootStarp.java`

```java
package com.jadyer.demo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

//开启配置中心
@EnableConfigServer
@EnableEurekaClient
@SpringBootApplication
public class ServiceConfigBootStarp {
    public static void main(String[] args) {
        SpringApplication.run(ServiceConfigBootStarp.class, args);
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
        <artifactId>demo-cloud-08-config</artifactId>
        <version>1.1</version>
    </parent>
    <artifactId>service-server</artifactId>
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-config</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-eureka</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
    </dependencies>
</project>
```

这是第一个服务提供方的配置文件 `/src/main/resources/application.yml`

```yml
server:
  port: 2100

#spring:
#  application:
#    name: CalculatorServer                     # 指定发布的微服务名（以后调用时，只需该名称即可访问该服务）

eureka:
  instance:
    instance-id: ${spring.application.name}:${server.port}
    prefer-ip-address: true                     # 设置微服务调用地址为IP优先（缺省为false）
    lease-renewal-interval-in-seconds: 5        # 心跳时间，即服务续约间隔时间（缺省为30s）
    lease-expiration-duration-in-seconds: 15    # 发呆时间，即服务续约到期时间（缺省为90s）
  client:
    healthcheck:
      enabled: true                                # 开启健康检查（依赖spring-boot-starter-actuator）
    #serviceUrl:
    #  defaultZone: http://127.0.0.1:1100/eureka/  # 指定服务注册中心的地址
```

这是第一个服务提供方的配置文件 `/src/main/resources/bootstrap.yml`

```yml
spring:
  application:
    name: demo.cloud.config         # 指定配置中心配置文件的{application}
  cloud:
    config:
      #uri: http://127.0.0.1:4100/  # 指定配置中心的地址
      profile: prod                 # 指定配置中心配置文件的{profile}
      label: master                 # 指定配置中心配置文件的{label}
      discovery:
        enabled: true                    # 使用注册中心里面已注册的配置中心
        serviceId: jadyer-config-server  # 指定配置中心注册到注册中心的serviceId

eureka:
  client:
    serviceUrl:
      defaultZone: http://127.0.0.1:1100/eureka/
```

这是第一个服务提供方的 SpringBoot 启动类 `ServiceServerBootStarp.java`

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
 * Created by 玄玉<http://jadyer.cn/> on 2017/1/9 16:00.
 */
@EnableEurekaClient
@SpringBootApplication
public class ServiceServerBootStarp {
    public static void main(String[] args) {
        SpringApplication.run(ServiceServerBootStarp.class, args);
    }
}
```

这是第一个服务提供方读取配置中心参数（且支持热加载）的例子 `DemoController.java`

```java
package com.jadyer.demo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//支持配置中心属性热加载
@RefreshScope
@RestController
@RequestMapping("/demo/config")
public class DemoController {
    //获取配置中心的属性
    @Value("${host.ifs}")
    private String ifsHost;

    @GetMapping("/getHost")
    public String getHost(){
        return this.ifsHost;
    }
}
```

### 服务提供方02

除了启动端口为2200外，其代码与服务提供方01的完全相同

## 验证

分别访问两个服务提供方暴露出来的接口

[http://127.0.0.1:2100/demo/config/getHost](http://127.0.0.1:2100/demo/config/getHost)

[http://127.0.0.1:2200/demo/config/getHost](http://127.0.0.1:2200/demo/config/getHost)

然后再 `curl -X POST http://127.0.0.1:2100/refresh` 后发现只有2100端口的服务属性刷新了，2200的没变

所以才有了下面的彩蛋

## 彩蛋

属性热加载前，都要手工调用各个应用的刷新接口，即便使用 Git 仓库的 Webhooks，维护起来也够费劲的

解决办法也有，详见下一篇文章《[SpringCloud系列第09节之消息总线Bus](http://jadyer.cn/2017/04/19/springcloud-bus/)》中通过消息总线的方式，实现集群的自动更新