---
layout: post
title: "Java模拟单向链表和双向链表的实现"
categories: JavaSE
tags: java
author: 玄玉
excerpt: 介绍了Java模拟单向链表和双向链表的实现，以及线性表的一些概述。
---

* content
{:toc}


## 数据结构

数据结构分为：线性数据结构 和 非线性数据结构

线性数据结构，共包含：线性表、栈、队列、串、数组、文件

非线性数据结构，包含：树、图

**下面主要说一下线性表**

线性表的数据元素呈线性关系，其所有数据元素在同一个线性表中必须是相同的数据类型

线性表中必存在唯一的称为 `第一个` 的数据元素，必存在唯一的称为 `最后一个` 的数据元素

线性表中除第一个元素外，每个元素都有且只有一个前驱元素；除最后一个元素外，每个元素都有且只有一个后继元素

线性表的逻辑结构是 n 个数据元素的有限序列（a1,a2,a3,...,an），其中 n 为线性表的长度（n>=0），n=0 的表称为空表

线性表按其存储结构，可分为：顺序表和链表

1. 链表：用链式存储结构存储的线性表称为链表（即内存地址中的元素不是连续存放的）
2. 顺序表：用顺序存储结构存储的线性表称为顺序表（即内存地址中的元素是按照循序连续存放的）<br>
   　　　　也可以说，将线性表中的数据元素依次存放在某个存储区域中，所形成的表称为顺序表<br>
   　　　　一维数组就是用顺序方式存储的线性表，所以ArrayList可以看作是一种顺序表

另外再说一下 Stack 和 Queue

1. Stack：栈也是一种特殊的线性表，是限定仅在表尾进行插入和删除运算的线性表<br>
   　　　　栈的物理存储可以用顺序存储结构，也可以用链式存储结构<br>
   　　　　栈是一种后进先出（LIFO）的结构，栈的表尾称为栈顶（top），栈的表头称为栈底（bottom）
2. Queue：队列是限定所有的插入只能在表的一端进行，而所有的删除都在表的另一端进行的线性表<br>
   　　　　队列的物理存储可以用顺序存储结构，也可以用链式存储结构<br>
   　　　　队列是一种先进先出（FIFO）的结构，其中允许插入的一端称为队尾（Rear），允许删除的一端称为队头（Front）

## 单向链表

```java
package com.jadyer.demo;

/**
 * 模拟单向链表
 * Created by 玄玉<https://jadyer.github.io/> on 2012/01/23 19:55.
 */
class NodeOneWay {
    String data;     //存放节点数据本身
    NodeOneWay next; //存放指向后一个节点的引用
    public NodeOneWay(){}
    public NodeOneWay(String data){
        this.data = data;
    }
}

/**
 * Java模拟单向链表的实现
 * --------------------------------------------------------------
 * 控制台输出内容如下
 * 通过node11获得node33的data属性值为：node33_data
 * 通过node11获得node33的data属性值为：node33_data
 * 通过node11获得node22的data属性值为：node22_data
 * 通过node11获得node33的data属性值为：node33_data
 * --------------------------------------------------------------
 * Created by 玄玉<https://jadyer.github.io/> on 2012/01/23 19:56.
 */
public class NodeOneWayTest {
    public static void main(String[] args) {
        NodeOneWay node11 = new NodeOneWay("node11_data");
        NodeOneWay node22 = new NodeOneWay("node22_data");
        NodeOneWay node33 = new NodeOneWay("node33_data");
        //生成后继关系
        node11.next = node22;
        node22.next = node33;
        System.out.println("通过node11获得node33的data属性值为：" + node11.next.next.data);
        //生成node44对象，并将其插入到node11和node22中间
        NodeOneWay node44 = new NodeOneWay("node44_data");
        //修改node11的后继关系指向node44
        node11.next = node44;
        //修改node44的后继关系指向node22
        node44.next = node22;
        System.out.println("通过node11获得node33的data属性值为：" + node11.next.next.next.data);
        System.out.println("通过node11获得node22的data属性值为：" + node11.next.next.data);
        //删除node44对象（即node11的后继关系指向node22，node44的后继关系不再指向node22）
        node11.next = node22;
        node44.next = null;
        System.out.println("通过node11获得node33的data属性值为：" + node11.next.next.data);
    }
}
```

## 双向链表

java.util.ArrayList 类的底层，是用数组实现的

java.util.LinkedList 类的底层，就是用双向循环链表实现的

双向链表内的每个对象除了数据本身外，还有两个引用，分别指向前一个元素和后一个元素

所以：**add/remove 操作时，LinkedList 性能好一些，而 get 操作时，ArrayList 性能好一些**

```java
package com.jadyer.demo;

/**
 * 模拟双向循环链表
 * Created by 玄玉<https://jadyer.github.io/> on 2012/01/23 20:16.
 */
class NodeTwoWay {
    NodeTwoWay previous; //存放指向前一个节点的引用
    String data;         //存放节点数据本身
    NodeTwoWay next;     //存放指向后一个节点的引用
    public NodeTwoWay(){}
    public NodeTwoWay(String data){
        this.data = data;
    }
}

/**
 * Java模拟双向循环链表的实现
 * --------------------------------------------------------------
 * 控制台输出内容如下
 * 通过node11获得node33的data属性值为：node33_data
 * 通过node11获得node33的data属性值为：node33_data
 * 通过node11获得node22的data属性值为：node22_data
 * 通过node11获得node33的data属性值为：node33_data
 * --------------------------------------------------------------
 * Created by 玄玉<https://jadyer.github.io/> on 2012/01/23 20:21.
 */
public class NodeTwoWayTest {
    public static void main(String[] args) {
        NodeTwoWay node11 = new NodeTwoWay("node11_data");
        NodeTwoWay node22 = new NodeTwoWay("node22_data");
        NodeTwoWay node33 = new NodeTwoWay("node33_data");
        //生成前驱和后继关系
        node11.previous = node33;
        node11.next = node22;
        node22.previous = node11;
        node22.next = node33;
        node33.previous = node22;
        node33.next = node11;
        System.out.println("通过node11获得node33的data属性值为：" + node11.next.next.data);
        //生成node44对象，并将其插入到node11和node22中间
        NodeTwoWay node44 = new NodeTwoWay("node44_data");
        node44.previous = node11;
        node44.next = node22;
        node11.next = node44;
        node22.previous = node44;
        System.out.println("通过node11获得node33的data属性值为：" + node11.next.next.next.data);
        System.out.println("通过node11获得node22的data属性值为：" + node11.next.next.data);
        //删除node44对象
        node44.previous = null;
        node44.next = null;
        node11.next = node22;
        node22.previous = node11;
        System.out.println("通过node11获得node33的data属性值为：" + node11.next.next.data);
    }
}
```