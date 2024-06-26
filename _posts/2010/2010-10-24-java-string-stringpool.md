---
layout: post
title: "String对象与StringPool之间的是是非非"
categories: JavaSE
tags: java
author: 玄玉
excerpt: 详细介绍了Java中的字符串和字符串常量池之间的复杂关系。
---

* content
{:toc}


```java
package com.xuanyuv.demo;

public class StringPoolTest {
    public static void main(String[] args) {
        /*
         * 执行完该行代码，会在内存中生成两个对象（一个在StringPool中，一个在堆内存中），它们的内容都是abc
         * ---------------------------------------------------------------------------------------------------------
         * 1、这里的s不是对象，s是对象的地址，叫做引用（或句柄），它指向的是堆内存中的对象
         * 2、由于经常要用到String类的对象，所以JVM内部为了能够重复使用，便专门用一片内存空间缓冲已存在的String对象
         *    即字符串常量池StringPool，它是java.lang.String类所特有的，它的作用域是整个虚拟机中（可笼统理解为一个工程中）
         * ---------------------------------------------------------------------------------------------------------
         * 在生成字符串对象的时候，String的执行流程如下：
         * 首先到StringPool中查找是否存在内容为abc的对象，若已存在，那么它就不会在StringPool中创建abc对象了
         * 但由于该行代码是main()方法的第一行语句，所以此时StringPool中是空的，是没有对象的
         * 于是它就会把abc对象放到StringPool中，接下来它去执行[new String("abc")]构造方法
         * 我们知道：new关键字表示生成一个对象，这个对象是在Java的堆内存中的
         * 所以接下来它就在Java的堆内存中又生成一个内容为abc的对象
         * 这样就造成了StringPool中有一个abc对象，堆内存中也有一个abc对象
         * ---------------------------------------------------------------------------------------------------------
         */
        String s = new String("abc");

        /*
         * 执行完该行代码，内存中不会生成新的对象
         * ---------------------------------------------------------------------------------------------------------
         * 由于这里是通过直接给出字面值"abc"，而不是new的方式为字符串赋值
         * 所以这种情况下，Java首先会到StringPool中查找有没有内容为abc的字符串对象存在
         * 若没找到，那么便会在StringPool中新创建一个abc对象，再将引用指向新创建的abc对象
         * 若找到了，那么它就不会在StringPool中生成新的字符串对象了，转而使用已存在的，并将s1引用指向StringPool中的abc对象
         * ---------------------------------------------------------------------------------------------------------
         */
        String s1 = "abc";

        /*
         * 执行完该行代码，内存中一共有三个对象
         * ---------------------------------------------------------------------------------------------------------
         * 执行过程中，它会首先查看一下StringPool中有没有abc对象存在
         * 结果发现：有
         * 那么接着它就不会在StringPool中创建新的abc对象
         * 由于它是通过[new String("abc")]方式为字符串赋值的，
         * 我们知道：只要Java中有new操作的话，就表示它会生成一个新的对象（不管多少次，都会生成新的，且新对象都是在堆内存中）
         * 所以执行该行代码时，它在堆内存中又会生成一个新的abc对象，并将其引用地址赋给s2
         * ---------------------------------------------------------------------------------------------------------
         */
        String s2 = new String("abc");

        /**
         * 也就是说，在执行完前面的三行语句后，内存中共有三个对象
         * 其中包含了StringPool中的一个对象和堆内存中的两个对象
         */

        /*
         * 字符串的相等判断
         * ---------------------------------------------------------------------------------------------------------
         * 对于Java中的8个原生数据类型，==比较的是它们的字面值是否相同
         * 对于引用类型，它所比较的：永远永远都是两个对象的内存地址（即两个引用是不是指向同样的一个对象）
         * ---------------------------------------------------------------------------------------------------------
         * 这里s、s1、s2分别指向三个不同的对象，这三个对象分别在内存中不同的地方
         * 所以s、s1、s2中任意两个使用==比较时，由于三者的内存地址均不同，故返回值都是false
         * ---------------------------------------------------------------------------------------------------------
         */
        System.out.println(s == s1);
        System.out.println(s == s2);
        System.out.println(s1 == s2);

        System.out.println("~~~~~~飘逸的分隔线01~~~~~~");

        System.out.println(s.equals(s1));
        System.out.println(s.equals(s2));
        System.out.println(s1.equals(s2));

        System.out.println("~~~~~~飘逸的分隔线02~~~~~~");

        /*
         * java.lang.String.intern()
         * 如果StringPool中已经包含一个等于此String对象的字符串，则返回StringPool中的字符串
         * 否则，将此String对象添加到StringPool中，并返回StringPool中的此String对象的引用
         * ---------------------------------------------------------------------------------------------------------
         * 调用s.intern()时
         * 它首先会先查StringPool中是否存在内容为abc的对象，结果发现：有
         * 这时它就会将s.intern()的返回值指向StringPool中的abc对象
         * 换句话说：s.intern()返回的是StringPool中的abc对象的地址，即与s1相等的值
         * 所以[s == s.intern()]的判断就相当于拿s和s1进行==判断，结果当然会返回false
         * ---------------------------------------------------------------------------------------------------------
         * 调用s1.intern()时
         * 它还是会检查StringPool中是否存在内容为abc的对象，结果发现：有
         * 这时它同样会将StringPool中abc对象的地址返回赋给s1.intern()的返回值
         * 而s1本身指向的就是StringPool中的abc对象，所以[s1 == s1.intern()]判断的结果即true
         * ---------------------------------------------------------------------------------------------------------
         * 基于同样道理：s.intern()和s2.intern()的返回值都是StringPool中的abc对象的地址，所以为true
         * ---------------------------------------------------------------------------------------------------------
         */
        System.out.println(s == s.intern());
        System.out.println(s1 == s1.intern());
        System.out.println(s.intern() == s2.intern());

        System.out.println("~~~~~~飘逸的分隔线03~~~~~~");

        /*
         * 字符串的加号操作
         * ---------------------------------------------------------------------------------------------------------
         * 如果加号左右两边的操作数都是字面值（即常量值）
         * 那么它会将这两个字面值拼起来，并得到一个对象，然后检查StringPool中有没有该对象存在
         * 如果StringPool中没有该对象的话，那么就把它放进去
         * 如果StringPool中存在该对象的话，则不生成新的对象，而是直接返回StringPool中的该对象
         * 所以：["hel" + "lo"]最终会拼成"hello"，并且它返回的是StringPool中hello的地址
         * 所以：[hello == "hel" + "lo"]判断的结果即为true
         * ---------------------------------------------------------------------------------------------------------
         * 如果加号左右两边有一个操作数不是常量的话，即有一个是变量的话
         * 那么在将这两个操作数的值拼起来之后，就不会检查StringPool而是直接在堆内存中生成新对象
         * 所以：["hel" + lo]最终也会拼成"hello"，但不同的是它所拼成的"hello"不是StringPool中的
         * 所以：而是在Java堆内存中新生成的一个"hello"对象
         * 那么：既然一个指向堆内存，一个指向StringPool，则二者肯定不是同一个对象，所以[hello == "hel" + lo]的结果为false
         * 同理：[hello == hel + lo]判断的结果亦为false
         * ---------------------------------------------------------------------------------------------------------
         * final：如果将lo变成final的话，那么[hello == "hel" + lo]的结果就是true
         * ---------------------------------------------------------------------------------------------------------
         */
        String hello = "hello";
        String hel = "hel";
        String lo = "lo";
        //final String lo = "lo";
        System.out.println(hello == "hel" + "lo");
        System.out.println(hello == "hel" + lo);
        System.out.println(hello == hel + lo);
    }
}
```

控制台输出如下

```
false
false
false
~~~~~~飘逸的分隔线01~~~~~~
true
true
true
~~~~~~飘逸的分隔线02~~~~~~
false
true
true
~~~~~~飘逸的分隔线03~~~~~~
true
false
false
```