---
layout: post
title: "Java自定义注解"
categories: JavaSE
tags: java
author: 玄玉
excerpt: 介绍Java自定义注解时用到的几种注解。
---

* content
{:toc}


自定义注解，是自 JDK5.0 开始提供的新特性

下面开始详细介绍一下主要的用法

## 自定义注解

1. 使用 @interface 自定义注解时，实际上是隐式的自动继承java.lang.annotation.Annotation接口
2. java.lang.annotation.Annotation本身只是接口，也不是注解
3. 若显式定义一个接口去继承java.lang.annotation.Annotation接口，则得到的还是普通接口，不是注解
4. 自定义注解时，不能继承或实现其它的注解或接口（即注解类型的后面不能跟任何东西）

```java
package com.xuanyuv.annotation.custom;

enum EnumTest {
    Hello, World, Welcome;
}

/**
 * 自定义注解
 * Created by 玄玉<https://www.xuanyuv.com/> on 2011/03/02 21:35.
 */
public @interface XuanyuAnnotation {
    //定义属性时，需要在后面加上小括号（这和普通的类或接口是不同的）
    //且名为"value"的属性会自动解析为注解的默认属性
    //比如@XuanyuAnnotation("very")会被自动赋值给"value"，不过也可以写成@XuanyuAnnotation(value="very")
    String value();

    //对于属性名不叫value的，使用时若需赋值，就要显式的赋值，比如@XuanyuAnnotation(username="LoveYou")
    String[] username();

    //也可以为一个属性设置默认值，使用时若没有显式赋值，则会取其默认值来解析
    EnumTest password() default EnumTest.Hello;

    //注解可使用的元素类型是有限的
    //只有原生数据类型、String、Class、annotation、enumeration以及这些类别的一维数组才可以
    //Date date(); //非法
}
```

## @Target

java.lang.annotation.Target 注解可以用来限定自定义注解的使用对象（若未指定，则自定义注解可以使用在任何位置）

 * ElementType.TYPE            ：适用class、interface、enum
 * ElementType.FIELD           ：适用field
 * ElementType.METHOD          ：适用method
 * ElementType.PARAMETER       ：适用method上之parameter
 * ElementType.CONSTRUCTOR     ：适用constructor
 * ElementType.LOCAL_VARIABLE  ：适用局部变量
 * ElementType.ANNOTATION_TYPE ：适用annotation型态
 * ElementType.PACKAGE         ：适用package

```java
package com.xuanyuv.annotation.custom;
import java.lang.annotation.ElementType;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
public @interface XuanyuAnnotation {
    String value();
}
```

## @Documented

使用者想要在制作 JavaDoc 的同时，也一并将注解信息加入的话

这时就需要使用 java.lang.annotation.Documented 注解标注

```java
package com.xuanyuv.annotation.custom;
import java.lang.annotation.Documented;

@Documented
public @interface XuanyuAnnotation {
    String hello();
}
```

## @Retention

java.lang.annotation.Retention 注解可以在自定义注解时，告知编译程序如何处理自定义注解

* RetentionPolicy.CLASS   ：默认值，注解储存于class档案中，但不被虚拟机读取，仅用于编译程序或工具程序运行时提供信息
* RetentionPolicy.SOURCE  ：编译程序处理完注解信息后就完成任务，不会被记录在类文件中，而只是存在于 *.java 文件中
* RetentionPolicy.RUNTIME ：编译程序将注解储存于class档案，且可由虚拟机读入，故可反射读取注解信息

```java
package com.xuanyuv.annotation.custom;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface XuanyuAnnotation {
    String hello() default "haerbin";
    String world();
}
```

## @Inherited

默认的父类中的注解并不会被继承至子类中

若想让子类也继承父类中的注解，可以在自定义注解时配置java.lang.annotation.Inherited注解

```java
package com.xuanyuv.annotation.custom;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Inherited
@Retention(RetentionPolicy.RUNTIME)
public @interface XuanyuAnnotation {
    String value();
}
```