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

Ribbon 是一个基于 HTTP 和 TCP 客户端的负载均衡器

它可以在客户端配置 ribbonServerList（服务端列表），然后轮询请求以实现均衡负载

它在联合 Eureka 使用时，ribbonServerList 会被 DiscoveryEnabledNIWSServerList 重写，扩展成从 Eureka 注册中心获取服务端列表

同时它也会用 NIWSDiscoveryPing 来取代 IPing，它将职责委托给 Eureka 来确定服务端是否已经启动

## Feign

Feign 中也使用了 Ribbon

Spring Cloud 为 Feign 增加了对 SpringMVC 注解的支持，还整合了 Ribbon 和 Eureka 来提供均衡负载的 HTTP 客户端实现

注意：spring-cloud-starter-feign 里面已经包含了 spring-cloud-starter-ribbon

## 示例代码

这是演示的是一个由四个模块组成的  Maven 工程，其中包含一个服务消费者、一个注册中心、两个服务提供者

如下图所示

![](/img/2017/2017-01-19-springcloud-ribbon-feign.png)

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
		<module>service-client</module>
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

### 服务提供方01

### 服务提供方02

### 服务消费方Ribbon

### 服务消费方Feign

**==未完待续==**

年底较忙，过几天再放实现代码