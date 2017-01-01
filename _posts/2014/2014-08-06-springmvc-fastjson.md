---
layout: post
title: "SpringMVC整合Fastjson"
categories: Spring
tags: spring springmvc
author: 玄玉
excerpt: 介绍了SpringMVC整合Fastjson-1.1.41的方法。
---

* content
{:toc}


本文使用的是目前最新版本的：`Fastjson-1.1.41`

整合也是为了在 Controller 里面能够直接通过 @ResponseBody 的方式序列化输出 json

下面演示的是整合的细节代码

# 无效的整合

很自然的，大家会想到类似整合 Jackson 的配置那样，像下面这样写

```xml
<bean class="org.springframework.web.servlet.mvc.annotation.AnnotationMethodHandlerAdapter">
    <property name="messageConverters">
        <list>
            <bean class="org.springframework.http.converter.json.MappingJacksonHttpMessageConverter">
                <property name="supportedMediaTypes" value="text/html;charset=UTF-8"/>
            </bean>
        </list>
    </property>
</bean>

<!-- 上面是整合Jackson的方式，下面是据此联想出来的整合Fastjson的方式 -->

<bean class="org.springframework.web.servlet.mvc.annotation.AnnotationMethodHandlerAdapter">
    <property name="messageConverters">
        <list>
            <bean class="com.alibaba.fastjson.support.spring.FastJsonHttpMessageConverter">
                <property name="supportedMediaTypes" value="text/html;charset=UTF-8"/>
                <property name="serializerFeature">
                    <array>
                        <value>QuoteFieldNames</value>
                        <value>WriteMapNullValue</value>
                    </array>
                </property>
            </bean>
        </list>
    </property>
</bean>
```

结果就是：测试时会看到下面这样的提示（所以这种整合方式是无效的）

```
HTTP Status 406
The resource identified by this request is only capable of generating responses with characteristics not acceptable according to the request "accept" headers.
```

# 正确的整合

应该像下面这样配置，才是正确的

其中 supportedMediaTypes 增加 `text/html;charset=UTF-8`，是为了兼容 IE6

否则 `application/json` 会使得 IE6 中直接弹出对话框询问是否保存文件，而其它高级浏览器会正常打印 json 字符串

```xml
<mvc:annotation-driven>
    <mvc:message-converters register-defaults="true">
        <bean class="com.alibaba.fastjson.support.spring.FastJsonHttpMessageConverter">
            <property name="supportedMediaTypes" value="text/html;charset=UTF-8"/>
            <property name="features">
                <array>
                    <value>WriteMapNullValue</value>
                    <value>WriteNullStringAsEmpty</value>
                </array>
            </property>
        </bean>
    </mvc:message-converters>
</mvc:annotation-driven>
```

关于 features 属性：注意不是 serializerFeature，而是 features，详见 [FastJsonHttpMessageConverter.java](https://github.com/alibaba/fastjson/blob/master/src/main/java/com/alibaba/fastjson/support/spring/FastJsonHttpMessageConverter.java)

它是用来控制 json 序列化输出时的一些额外属性（比如属性是否输出、输出时key使用单引号还是双引号、key不使用任何引号等等）

常见的几个属性配置如下

* QuoteFieldNames----------输出key时是否使用双引号，默认为true
* WriteMapNullValue--------是否输出值为null的字段，默认为false
* WriteNullNumberAsZero----数值字段如果为null，输出为0，而非null
* WriteNullListAsEmpty-----List字段如果为null，输出为[]，而非null
* WriteNullStringAsEmpty---字符类型字段如果为null，输出为""，而非null
* WriteNullBooleanAsFalse--Boolean字段如果为null，输出为false，而非null

通常网上搜到的 SpringMVC 整合 Fastjson 的例子中，都会为 features 属性设置两个属性值：WriteMapNullValue、QuoteFieldNames

这就表示：输出时 key 使用双引号，同时也输出值为 null 的字段

**注意**

    > 输出时某属性为 String 类型，且值为 null，此时若需要其输出，且输出值为空字符串，则需同时赋值：WriteMapNullValue、WriteNullStringAsEmpty<br>
因为实际测试时发现：若只赋值 WriteNullStringAsEmpty，则不会输出该字段，只有也加上 WriteMapNullValue 之后，才会输出，且输出值不是 null，而是预期的空字符串