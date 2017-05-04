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


使用版本：目前最新版本的`Fastjson-1.1.41`

整合目的：Controller 里面能够直接通过 `@ResponseBody` 的方式序列化输出 json

## 无效的整合

很自然的，大家会想到类似整合 Jackson 那样，像下面这样配置

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

结果就是：测试时得到下面这样的提示（所以说这种整合方式是无效的）

```
HTTP Status 406
The resource identified by this request is only capable of generating responses with characteristics not acceptable according to the request "accept" headers.
```

## 有效的整合

像下面这样配置，实际测试是有效的

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

<!-- 下面的是spring-4.2整合fastjson-1.2.22的写法 -->

<mvc:annotation-driven>
    <mvc:message-converters register-defaults="true">
        <bean class="com.alibaba.fastjson.support.spring.FastJsonHttpMessageConverter4">
            <property name="supportedMediaTypes" value="text/json;charset=UTF-8"/>
            <property name="fastJsonConfig">
                <bean class="com.alibaba.fastjson.support.config.FastJsonConfig">
                    <property name="dateFormat" value="yyyy-MM-dd HH:mm:ss"/>
                    <property name="serializerFeatures">
                        <array>
                            <value>PrettyFormat</value>
                            <value>WriteNullListAsEmpty</value>
                            <value>WriteNullNumberAsZero</value>
                            <value>WriteNullStringAsEmpty</value>
                            <value>WriteNullBooleanAsFalse</value>
                            <value>WriteDateUseDateFormat</value>
                        </array>
                    </property>
                </bean>
            </property>
        </bean>
    </mvc:message-converters>
</mvc:annotation-driven>
```

它可以控制 json 序列化输出时的一些额外属性（比如是否输出、输出为单引号还是双引号、不使用任何引号等等）

常见的几个属性配置如下

* QuoteFieldNames          ：输出key时是否使用双引号，默认为true
* WriteMapNullValue        ：否输出值为null的字段，默认为false
* WriteNullListAsEmpty     ：List字段若为null，输出[]，而非null
* WriteNullNumberAsZero    ：数值字段若为null，输出0，而非null
* WriteNullStringAsEmpty   ：字符类型字段若为null，输出""，而非null
* WriteNullBooleanAsFalse  ：Boolean字段若为null，输出false，而非null

而通常网上搜到的例子中，都会为该属性设置两个值：WriteMapNullValue、QuoteFieldNames

这就表示：输出时 key 使用双引号，同时也输出值为 null 的字段

* **注意**

    > 若某属性为 String，且值为 null，此时若需要其输出，且输出值为空字符串<br>
    则应同时赋值：WriteMapNullValue、WriteNullStringAsEmpty<br>
    因为实际测试发现：若只赋值 WriteNullStringAsEmpty，则不会输出该属性<br>
    只有加上 WriteMapNullValue 之后，才会输出，且输出值不是 null，而是预期的空字符串

至于 Controller 的写法，就很常见了，没什么特殊的，就像下面这样的

```java
package com.jadyer.controller;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by 玄玉<http://jadyer.cn/> on 2014/08/06 09:58.
 */
@Controller
@RequestMapping("/demo")
public class DemoController {
    //@RequestMapping("/login")
    //public String login(String username, String password, HttpServletResponse response) throws IOException{
    //    response.setContentType("text/plain; charset=UTF-8");
    //    response.setHeader("Cache-Control", "no-cache");
    //    response.setHeader("Pragma", "no-cache");
    //    response.setDateHeader("Expires", 0);
    //    PrintWriter out = response.getWriter();
    //    out.write(JSON.toJSONString(new UserInfo(username, password)));
    //    out.flush();
    //    out.close();
    //    return null;
    //}

    @ResponseBody
    @RequestMapping(value="/login")
    public UserInfo login(String username, String password){
        return new UserInfo(username, password);
    }

    private class UserInfo {
        private String username;
        private String password;
        UserInfo(String _username, String _password) {
            this.username = _username;
            this.password = _password;
        }
        public String getUsername() {
            return username;
        }
        public String getPassword() {
            return password;
        }
    }
}
```