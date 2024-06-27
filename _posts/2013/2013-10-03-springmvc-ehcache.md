---
layout: post
title: "SpringMVC整合Ehcache"
categories: Spring
tags: spring springmvc
author: 玄玉
excerpt: 介绍了SpringMVC-3.2.4整合Ehcache-2.7.4的完整例子。
---

* content
{:toc}


本文涉及的相关环境和版本为：`SpringMVC-3.2.4`、`Ehcache-2.7.4`

正式演示整合代码之前，先介绍一下 googlecode 上的一个经 apache 认证的开源项目：ehcache-spring-annotations

## googlecode开源项目

目前它已经到了 `1.2.0` 版本

它只是简化了 Spring 和 Ehcache 集成的复杂性（事实上我觉得完全没必要，因为它俩集成并不复杂）

尽管如此还是要提一下，它的项目主页为：[https://code.google.com/p/ehcache-spring-annotations/](https://code.google.com/p/ehcache-spring-annotations/)

这篇网文描述了其用法：[http://blog.goyello.com/2010/07/29/quick-start-with-ehcache-annotations-for-spring/](http://blog.goyello.com/2010/07/29/quick-start-with-ehcache-annotations-for-spring/)

总结起来，它使用起来也就是下面这几个步骤

先引入两个文件：ehcache-spring-annotations-1.2.0.jar、guava-r09.jar

然后配置一下 applicationContext.xml

```xml
<beans xmlns:ehcache="http://ehcache-spring-annotations.googlecode.com/svn/schema/ehcache-spring" xsi:schemaLocation="http://ehcache-spring-annotations.googlecode.com/svn/schema/ehcache-spring http://ehcache-spring-annotations.googlecode.com/svn/schema/ehcache-spring/ehcache-spring-1.2.xsd">
<ehcache:annotation-driven/>
<ehcache:config cache-manager="cacheManager">
    <ehcache:evict-expired-elements interval="60"/>
</ehcache:config>
<bean id="cacheManager" class="org.springframework.cache.ehcache.EhCacheManagerFactoryBean">
    <property name="configLocation" value="classpath:ehcache.xml"/>
</bean>
```

最后在需要缓存的方法上标注 `@Cacheable` 和 `@TriggersRemove` 即可

经测试发现：**@TriggersRemove(cacheName="..", when="..", removeAll=true)** 可移除缓存中的全部对象

但是若写成：**@TriggersRemove(cacheName="..", when="..")** 则不会移除缓存中的单一或所有的对象（即缓存中的对象无变化）

## 演示代码

下面正式演示 `SpringMVC-3.2.4` 整合 `Ehcache-2.7.4` 的完整例子（没有使用ehcache-spring-annotations）

本示例用到的所有 jar 如下

 * aopalliance.jar
 * commons-logging-1.1.2.jar
 * ehcache-2.7.4.jar
 * slf4j-api-1.7.5.jar
 * spring-aop-3.2.4.RELEASE.jar
 * spring-beans-3.2.4.RELEASE.jar
 * spring-context-3.2.4.RELEASE.jar
 * spring-context-support-3.2.4.RELEASE.jar
 * spring-core-3.2.4.RELEASE.jar
 * spring-expression-3.2.4.RELEASE.jar
 * spring-web-3.2.4.RELEASE.jar
 * spring-webmvc-3.2.4.RELEASE.jar

首先是 `web.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="2.5" xmlns="http://java.sun.com/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd">
    <servlet>
        <servlet-name>SpringMVC</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:applicationContext.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>SpringMVC</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>
</web-app>
```

然后是 `/src/applicationContext.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:mvc="http://www.springframework.org/schema/mvc" xmlns:cache="http://www.springframework.org/schema/cache" xmlns:context="http://www.springframework.org/schema/context" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.2.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc-3.2.xsd http://www.springframework.org/schema/cache http://www.springframework.org/schema/cache/spring-cache-3.2.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-3.2.xsd">
    <context:component-scan base-package="com.xuanyuv"/>

    <!-- SpringMVC配置 -->
    <mvc:annotation-driven/>
    <mvc:view-controller path="/" view-name="forward:/index.jsp"/>
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/"/>
        <property name="suffix" value=".jsp"/>
    </bean>

    <!-- 缓存配置 -->
    <!-- 启用缓存注解功能（请将其配置在Spring主配置文件中） -->
    <cache:annotation-driven cache-manager="cacheManager"/>
    <!-- Spring自己的基于java.util.concurrent.ConcurrentHashMap实现的缓存管理器（该功能是从Spring3.1开始提供的） -->
    <!--
    <bean id="cacheManager" class="org.springframework.cache.support.SimpleCacheManager">
        <property name="caches">
            <set>
                <bean name="myCache" class="org.springframework.cache.concurrent.ConcurrentMapCacheFactoryBean"/>
            </set>
        </property>
    </bean>
    -->
    <!-- Spring提供的基于Ehcache实现的缓存管理器 -->
    <bean id="cacheManagerFactory" class="org.springframework.cache.ehcache.EhCacheManagerFactoryBean">
        <property name="configLocation" value="classpath:ehcache.xml"/>
    </bean>
    <bean id="cacheManager" class="org.springframework.cache.ehcache.EhCacheCacheManager">
        <property name="cacheManager" ref="cacheManagerFactory"/>
    </bean>
</beans>
```

下面是 `/src/ehcache.xml`

```xml
<!--
Ehcache2.x的变化（取自https://github.com/springside/springside4/wiki/Ehcache）
1)最好在ehcache.xml中声明不进行updateCheck
2)为了配合BigMemory和Size Limit，原来的属性最好改名
  maxElementsInMemory--maxEntriesLocalHeap
  maxElementsOnDisk----maxEntriesLocalDisk
-->
<ehcache>
    <diskStore path="java.io.tmpdir"/>
    <defaultCache
        maxElementsInMemory="1000"
        eternal="false"
        timeToIdleSeconds="120"
        timeToLiveSeconds="120"
        overflowToDisk="false"/>
    <cache name="myCache"
        maxElementsOnDisk="20000"
        maxElementsInMemory="2000"
        eternal="true"
        overflowToDisk="true"
        diskPersistent="true"/>
</ehcache>
<!--
<diskStore>----------当内存缓存中对象数量超过maxElementsInMemory时，将缓存对象写到磁盘缓存中（对象需实现序列化接口）
<diskStore path="">--用来配置磁盘缓存使用的物理路径，Ehcache磁盘缓存使用的文件后缀名是*.data和*.index
name-----------------缓存名称，cache的唯一标识（ehcache会把这个cache放到HashMap里）
maxElementsOnDisk----磁盘缓存中最多可以存放的元素数量，0表示无穷大
maxElementsInMemory--内存缓存中最多可以存放的元素数量，若放入Cache中的元素超过这个数值，则有以下两种情况
                     1)若overflowToDisk=true，则会将Cache中多出的元素放入磁盘文件中
                     2)若overflowToDisk=false，则根据memoryStoreEvictionPolicy策略替换Cache中原有的元素
eternal--------------缓存中对象是否永久有效，即是否永驻内存，true时将忽略timeToIdleSeconds和timeToLiveSeconds
timeToIdleSeconds----缓存数据在失效前的允许闲置时间（单位：秒），仅当eternal=false时使用，默认值是0表示可闲置时间无穷大，此为可选属性
                     即访问这个cache中元素的最大间隔时间，若超过这个时间没有访问此Cache中的某个元素，那么此元素将被从Cache中清除
timeToLiveSeconds----缓存数据在失效前的允许存活时间（单位：秒），仅当eternal=false时使用，默认值是0表示可存活时间无穷大
                     即Cache中的某元素从创建到清楚的生存时间，也就是说从创建开始计时，当超过这个时间时，此元素将从Cache中清除
overflowToDisk-------内存不足时，是否启用磁盘缓存（即内存中对象数量达到maxElementsInMemory时，Ehcache会将对象写到磁盘中）
                     会根据标签中path值查找对应的属性值，写入磁盘的文件会放在path文件夹下，文件的名称是cache的名称，后缀名是data
diskPersistent-------是否持久化磁盘缓存，当该值为true时，系统在初始化时会在磁盘中查找文件名为cache名称，后缀名为index的文件
                     这个文件中存放了已经持久化在磁盘中的cache的index，找到后会把cache加载到内存
                     要想把cache真正持久化到磁盘，写程序时注意执行net.sf.ehcache.Cache.put(Element element)后要调用flush()方法
diskExpiryThreadIntervalSeconds--磁盘缓存的清理线程运行间隔，默认是120秒
diskSpoolBufferSizeMB------------设置DiskStore（磁盘缓存）的缓存区大小，默认是30MB
memoryStoreEvictionPolicy--------内存存储与释放策略，即达到maxElementsInMemory限制时，Ehcache会根据指定策略清理内存
                                 共有三种策略：LRU（最近最少使用）、LFU（最常用的）、FIFO（先进先出）
-->
```

下面是需要被缓存处理的 `UserService.java`

```java
package com.xuanyuv.service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * ----------------------------------------------------------------------------------------------
 * Cacheable注解负责将方法的返回值加入到缓存中
 * CacheEvict注解负责清除缓存（它的三个参数与@Cacheable的意思是一样的）
 * ----------------------------------------------------------------------------------------------
 * value------缓存位置的名称，不能为空，若使用EHCache则其值为ehcache.xml中的<cache name="myCache"/>
 * key--------缓存的Key，默认为空（表示使用方法的参数类型及参数值作为key），支持SpEL
 * condition--只有满足条件的情况才会加入缓存，默认为空（表示全部都加入缓存），支持SpEL
 * ----------------------------------------------------------------------------------------------
 * Created by 玄玉<https://www.xuanyuv.com/> on 2013/10/03 18:17.
 */
@Service
public class UserService {
    private Map<String, String> usersData = new ConcurrentHashMap<String, String>();

    public UserService(){
        System.out.println("用户数据初始化...开始");
        usersData.put("2", "玄玉");
        usersData.put("3", "我的博客：https://www.xuanyuv.com/");
        System.out.println("用户数据初始化...完毕");
    }

    //将查询到的数据缓存到myCache中，并使用方法名称加上参数中的userNo作为缓存的key
    //通常更新操作只需刷新缓存中的某个值，所以为了准确的清除特定的缓存，故定义了这个唯一的key，从而不会影响其它缓存值
    @Cacheable(value="myCache", key="'get'+#userNo")
    public String get(String userNo){
        System.out.println("数据库中查到此用户号[" + userNo + "]对应的用户名为[" + usersData.get(userNo) + "]");
        return usersData.get(userNo);
    }

    @CacheEvict(value="myCache", key="'get'+#userNo")
    public void update(String userNo){
        System.out.println("移除缓存中此用户号[" + userNo + "]对应的用户名[" + usersData.get(userNo) + "]的缓存");
    }

    //allEntries为true表示清除value中的全部缓存，默认为false
    @CacheEvict(value="myCache", allEntries=true)
    public void removeAll(){
        System.out.println("移除缓存中的所有数据");
    }
}
```

下面是 `UserController.java`

```java
package com.xuanyuv.controller;
import javax.annotation.Resource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import com.xuanyuv.service.UserService;

/**
 * Created by 玄玉<https://www.xuanyuv.com/> on 2013/10/03 18:22.
 */
@Controller
@RequestMapping("cacheTest")
public class UserController {
    @Resource
    private UserService userService;

    @RequestMapping(value="/get/{userNo}", method=RequestMethod.GET)
    public String get(@PathVariable String userNo, Model model){
        String username = userService.get(userNo);
        model.addAttribute("username", username);
        return "getUser";
    }

    @RequestMapping(value="/update/{userNo}", method=RequestMethod.GET)
    public String update(@PathVariable String userNo, Model model){
        userService.update(userNo);
        model.addAttribute("userNo", userNo);
        return "updateUser";
    }

    @RequestMapping(value="/removeAll", method=RequestMethod.GET)
    public String removeAll(){
        userService.removeAll();
        return "removeAllUser";
    }
}
```

最后把剩下的 4 个 jsp 页面列出来，首先是 `index.jsp`

```html
<%@ page language="java" pageEncoding="UTF-8"%>
查看<a href="<%=request.getContextPath()%>/cacheTest/get/2" target="_blank">2号</a>用户名
<br/>
<br/>
查看<a href="<%=request.getContextPath()%>/cacheTest/get/3" target="_blank">3号</a>用户名
<br/>
<br/>
更新<a href="<%=request.getContextPath()%>/cacheTest/update/3" target="_blank">3号</a>用户名
<br/>
<br/>
移除<a href="<%=request.getContextPath()%>/cacheTest/removeAll" target="_blank">所有</a>用户名
```

下面是 `getUser.jsp`

```
<%@ page language="java" pageEncoding="UTF-8"%>
当前用户名为${username}
```

下面是 `updateUser.jsp`

```
<%@ page language="java" pageEncoding="UTF-8"%>
已更新${userNo}号用户
```

最后是 `removeAllUser.jsp`

```
<%@ page language="java" pageEncoding="UTF-8"%>
已移除所有用户
```

测试时，访问 index.jsp 之后，点击各个链接并依次观察控制台输出即可

缓存有效果的特征是：第二次查询数据时不会访问数据库（即不打印日志）