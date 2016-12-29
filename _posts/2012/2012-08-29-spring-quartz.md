---
layout: post
title: "Spring集成Quartz实现作业调度"
categories: Spring
tags: spring quartz
author: 玄玉
excerpt: 描述Spring应用中，通过quartz框架实现作业调度功能的，配置方法。
---

* content
{:toc}


本文涉及的相关环境和版本为：`Spring-2.x`、`Quartz-1.x`

* *2013-10-16 更新：*

    > 像本文这种配置之后，启动Web应用，即便是只部署一个应用实例，也有可能定时任务被执行了两次<br>
这通常是由于applicationContext.xml被初始化两次导致，所以检查以下web.xml就看到了

下面直接演示代码（這里只把核心的几块贴出来）

首先是`applicationContext.xml`

```xml
<bean id="recfileQuartz" class="com.ecpay.cus.quartz.RecFileQuartz">
    <property name="pbcDao" ref="pbcDao"/>
    <property name="nauDao" ref="nauDao"/>
</bean>
<bean id="messageSendQuartz" class="com.ecpay.cus.quartz.MessageSendQuartz">
    <property name="jfbManager" ref="jfbManager"/>
</bean>

<!--
Spring作业调度
0 0/10 9-23 * * ? ：每天09:00-23:00之间每10分钟触发一次
0 */2 * * * ?     ：02分钟触发一次
0 30 0 * * ?      ：每天00:30触发
0 0 1 * * ?       ：每天01:00触发
0 0 0 1 * ?       ：每月01号零点触发
autoStartup='true'：SchedulerFactoryBean在初始化后是否马上启动Scheduler，默认true，若为false则需手工启动Scheduler
concurrent='false'：false为不允许任务并发执行，即第二个job将不会在第一个job完成之前开始执行，默认的jobs是并行执行的
-->
<bean id="quartzJobFactory" class="org.springframework.scheduling.quartz.SchedulerFactoryBean">
    <property name="triggers">
        <list>
            <ref bean="genRecFileRelationTrigger"/>
            <ref bean="sendInfoTrigger"/>
        </list>
    </property>
    <property name="autoStartup" value="true"/>
</bean>

<bean id="genRecFileRelationTrigger" class="org.springframework.scheduling.quartz.CronTriggerBean">
    <property name="jobDetail" ref="genRecFileRelationJobDetail"/>
    <property name="cronExpression" value="0 30 0 * * ?"/>
</bean>
<bean id="genRecFileRelationJobDetail" class="org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean">
    <property name="targetObject" ref="recfileQuartz"/>
    <property name="targetMethod" value="genRecFileRelation"/>
    <property name="concurrent" value="false"/>
</bean>

<bean id="sendInfoTrigger" class="org.springframework.scheduling.quartz.CronTriggerBean">
    <property name="jobDetail" ref="sendInfoDetail"/>
    <property name="cronExpression" value="0 */10 * * * ?"/>
</bean>
<bean id="sendInfoDetail" class="org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean">
    <property name="targetObject" ref="messageSendQuartz"/>
    <property name="targetMethod" value="executeSend"/>
    <property name="concurrent" value="false"/>
</bean>
```

下面是`MessageSendQuartz.java`

```java
package com.ecpay.cus.quartz;
import org.springframework.transaction.annotation.Transactional;
import com.ecpay.cus.service.JFBBusinessManager;

/**
 * 信息推送之作业调度类
 * Created by 玄玉<https://jadyer.github.io/> on 2012/05/04 12:50.
 */
@Transactional
public class MessageSendQuartz {
    private JFBBusinessManager jfbManager;
    public void setJfbManager(JFBBusinessManager jfbManager) {
        this.jfbManager = jfbManager;
    }

    /**
     * 定时执行的方法
     */
    @Transactional
    public void executeSend() throws Exception {
        System.out.println("恭喜您：信息推送任务启动了");
    }
}
```

下面是`RecFileQuartz.java`

```java
package com.ecpay.cus.quartz;
import org.springframework.transaction.annotation.Transactional;
import com.ecpay.cus.dao.NotActiveUserDAO;
import com.ecpay.cus.dao.PayBusinessCustomizeDAO;

/**
 * 业务定制对账文件之作业调度类
 * Created by 玄玉<https://jadyer.github.io/> on 2012/05/04 12:50.
 */
@Transactional
public class RecFileQuartz {
    private PayBusinessCustomizeDAO pbcDao;
    private NotActiveUserDAO nauDao;
    public void setNauDao(NotActiveUserDAO nauDao) {
        this.nauDao = nauDao;
    }
    public void setPbcDao(PayBusinessCustomizeDAO pbcDao) {
        this.pbcDao = pbcDao;
    }

    /**
     * 生成定制关系到数据库
     */
    @Transactional
    public void genRecFileRelation() {
        System.out.println("恭喜您：Spring定制调度执行了该方法，本行打印的日志就是该方法的第一行代码");
    }
}
```