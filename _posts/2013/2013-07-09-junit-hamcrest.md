---
layout: post
title: "JUnit借助Hamcrest增强测试"
categories: 单元测试
tags: junit hamcrest
author: 玄玉
excerpt: 演示了Hamcrest的用法，以达到增强JUnit测试的目的。
---

* content
{:toc}


```java
package com.jadyer.service;
import java.util.HashMap;
import java.util.Map;
import org.hamcrest.Matchers;
import org.junit.Assert;
import org.junit.Test;

/**
 * -----------------------------------------------------------------------------------------
 * Hamcrest框架提供了一些相对通俗并高效的方法来进行一些junit比较困难的测试
 * 例如比较数值大小、测试对象类型、测试数组元素等等一系列的增强功能
 * -----------------------------------------------------------------------------------------
 * 本例中需要jar有两个：junit-4.10.jar、hamcrest-all-1.3.jar
 * 但是注意：测试时可能报告这个异常java.lang.NoSuchMethodError: org.hamcrest.core.AllOf.allOf
 *          这时把hamcrest.jar移到junit.jar前面即可，否则组合条件如allOf、anyOff等都会抛此异常
 * -----------------------------------------------------------------------------------------
 * Created by 玄玉<https://jadyer.github.io/> on 2013/07/09 12:41.
 */
public class TestByHamcrest {
    /**
     * 如果用的是JUnit-4.10，那么这里可以使用org.junit.Assert类，它提供了assertThat的功能
     * 如果用的是JUnit低版本，比如MyEclipse6.5自带的JUnit-4.3.1则未提供Assert.assertThat
     * 这时可以使用hamcrest-all-1.3.jar自带的org.hamcrest.MatcherAssert.assertThat()
     */
    @Test
    public void testHamcrest(){
        //50是否大于20
        Assert.assertThat(50, Matchers.greaterThan(20));
        //50是否大于或等于50
        Assert.assertThat(50, Matchers.greaterThanOrEqualTo(50));

        //50是否即大于20又小于60(allOf方法类似于Java中的&&)
        Assert.assertThat(50, Matchers.allOf(Matchers.greaterThan(20), Matchers.lessThan(60)));
        //50是否大于20或小于40(anyOf方法类似于Java中的||)
        Assert.assertThat(50, Matchers.anyOf(Matchers.greaterThan(20), Matchers.lessThan(40)));

        //测试"abc.txt"是否以"txt"结束
        Assert.assertThat("abc.txt", Matchers.endsWith("txt"));
        Assert.assertThat("abc.txt", Matchers.startsWith("ab"));
        Assert.assertThat("abc.txt", Matchers.containsString("c.t"));
        Assert.assertThat(22+"aa", Matchers.hasToString("22aa"));
        Assert.assertThat("https://jadyer.github.io/", Matchers.instanceOf(String.class));
        Assert.assertThat("https://jadyer.github.io/", Matchers.notNullValue());
        Assert.assertThat(null, Matchers.nullValue());

        //针对集合的测试
        String[] users = {"玄玉", "Jadyer"};
        Assert.assertThat(users, Matchers.hasItemInArray("玄玉"));
        Map<String, String> userMap = new HashMap<String, String>();
        userMap.put("11", "玄玉");
        userMap.put("22", "Jadyer");
        userMap.put("33", "https://jadyer.github.io/");
        Assert.assertThat(userMap, Matchers.hasKey("22"));
        Assert.assertThat(userMap, Matchers.hasValue("https://jadyer.github.io/"));
    }
}
```