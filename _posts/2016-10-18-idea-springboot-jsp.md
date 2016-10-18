---
layout: post
title: "idea运行多模块的springbootjsp"
categories: 工具
tags: idea intellij spring boot jsp maven module run debug
author: 玄玉
excerpt: idea在运行含有多个maven module的jsp工程时的解决方案。
---

* content
{:toc}

这东西一共搞了我**12**个小时，才找到解决方案，还是年轻啊。。


## 现象

* 现象01

    > idea里面整个工程只有一个MavenModule的情况下，访问SpringBoot应用的JSP页面，没任何问题

* 现象02

    > 多个MavenModule情况下，idea启动SpringBootApplication之后，无法访问JSP页面，总是提示404<br/>

而其它的资源如`js、css、controller`等都可访问（`jsp`是放在`src/main/webapp/`下的）<br/>

同样的代码，同事的`STS(Run as Spring Boot App)`启动后访问JSP页面，没任何问题

## 解决

参考了这两个链接：[jetbrains](https://youtrack.jetbrains.com/issue/IDEA-142078)　和　[stackoverflow](http://stackoverflow.com/questions/25119604/spring-boot-application-deployed-in-sts-works-fine-but-not-in-intellij-idea)

#### RUN模式

1、pom配置spring-boot-maven-plugin

```xml
<build>
   <plugins>
      <plugin>
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-maven-plugin</artifactId>
         <version>1.3.7.RELEASE</version>
         <configuration>
            <mainClass>com.jadyer.union.youqian.boss.common.BootStrap</mainClass>
         </configuration>
      </plugin>
   </plugins>
</build>
```

`BootStrap.java`代码如下

```java
package com.jadyer.union.youqian.boss.common;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.web.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.web.filter.CharacterEncodingFilter;

import javax.servlet.Filter;

@SpringBootApplication(scanBasePackages="com.jadyer.union")
public class BootStrap extends SpringBootServletInitializer {
	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
		return builder.sources(getClass());
	}

	@Bean
	public Filter characterEncodingFilter(){
		return new CharacterEncodingFilter("UTF-8", true);
	}

	public static void main(String[] args) {
		new SpringApplicationBuilder().sources(BootStrap.class).profiles("local").run(args);
	}
}
```

2、配置启动方式

`idea顶部菜单-->Run-->Edit Configurations--> + -->选择Maven`

最好在下面的`Before launch: Activate tool window`一栏增加`Make`操作，这里就不截图了

* 注意Module运行时的工作空间依赖问题
    > 建议勾选`Resolve Workspace artifacts`<br/>
否则启动时该Module只会找本地仓库的依赖，不找workspace里的submodule<br/>
光这个问题就搞了我**5**个小时，后来还是在[stackoverflow](http://stackoverflow.com/questions/35567002/spring-boot-multi-module-reload-sub-modules-without-running-maven-install)找到的解决方法

![](/img/2016-10-18/boss-config.png)

3、启动

有两个位置（实际执行的都一样），见下方截图

（若在Maven Projects视图执行，还可展开main-boss-->Plugins-->spring-boot-->spring-boot:run-->Run）

![](/img/2016-10-18/boss-run.png)

#### DEBUG模式

1、pom中配置spring-boot-maven-plugin时`增加jvmArguments配置`（注意UTF-8参数，否则控制台中文会乱码）

```xml
<build>
   <plugins>
      <plugin>
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-maven-plugin</artifactId>
         <version>1.3.7.RELEASE</version>
         <configuration>
            <mainClass>com.jadyer.union.youqian.boss.common.BootStrap</mainClass>
            <jvmArguments>-Dfile.encoding=UTF-8 -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005</jvmArguments>
         </configuration>
      </plugin>
   </plugins>
</build>
```

2、配置启动方式

`idea顶部菜单-->Run-->Edit Configurations--> + -->选择Remote`使用默认的配置并命名为`BossRunRemote`

![](/img/2016-10-18/boss-debug.png)

3、启动

`BossRun`点击`Run`运行（不用点DebugRun）成功后，再选择`BossRunRemote`点击`Debug`运行，即可。