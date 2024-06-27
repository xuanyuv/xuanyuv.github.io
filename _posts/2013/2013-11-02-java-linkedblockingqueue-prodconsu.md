---
layout: post
title: "LinkedBlockingQueue模拟的生产者消费者"
categories: JavaSE
tags: java 生产者消费者
author: 玄玉
excerpt: 演示通过java.util.concurrent.LinkedBlockingQueue模拟的生产者消费者实现。
---

* content
{:toc}


Java 提供的线程安全的 Queue 可分为阻塞和非阻塞队列

其中非阻塞队列的典型是：ConcurrentLinkedQueue，阻塞队列的是：BlockingQueue

ConcurrentLinkedQueue 是一个无界线程安全队列，它是按照 FIFO（先入先出）来排序元素的，且此队列不允许使用 null 元素

关于接口 BlockingQueue，文档中是这么说的

```sh
# 壹個支持额外操作的队列：当队列非空时才去获取壹個元素，当队列还有空间时才会存储壹個元素
A Queue that additionally supports operations that wait for the queue to become non-empty when
retrieving an element, and wait for space to become available in the queue when storing an element
```

以下是 BlockingQueue 接口的几个常见标准实现

1. SynchronousQueue：这是一个特殊的 BlockingQueue，对其的操作必须是存放和获取交替完成
2. PriorityBlockingQueue：其所含对象的排序不是 FIFO，而是依据对象自然排序或构造方法的 Comparator 决定
3. ArrayBlockingQueue：有界的阻塞队列，它具有固定的尺寸，因此可在它被阻塞之前向其中放置有限数量的元素<br>
   其构造方法必须带一个 int 参数来指明 BlockingQueue 的大小，其所含对象是以 FIFO（先入先出）顺序排序的
4. LinkedBlockingQueue：无界的阻塞队列，其所含的对象是以 FIFO（先入先出）顺序排序的<br>
   若其构造方法带一个规定大小的参数，则生成的 BlockingQueue 有大小限制，反之则由 Integer.MAX_VALUE 决定

阻塞队列可以解决非常大量的问题，而其方式与 wait() 和 notifyAll() 相比则简单并可靠得多

由于 LinkedBlockingQueue 实现是线程安全的，实现了先进先出等特性，是作为生产者消费者的首选

它常用的方法是 put （队列满的时候会阻塞直到有队列成员被消费） 和 take （队列空的时候会阻塞直到有队列成员被放进来）

若消费者试图从空队列获取对象时，那么队列可以挂起消费者任务，且当有更多元素可用时恢复消费者任务，生产者与之类似

## 模拟实现

```java
package com.xuanyuv.demo;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

/**
 * LinkedBlockingQueue模拟的生产者消费者
 * Created by 玄玉<https://www.xuanyuv.com/> on 2013/11/02 17:40.
 */
public class ProducerConsumer {
    public static void main(String[] args) {
        BlockingQueue<String> dataQueue = new LinkedBlockingQueue<String>();
        Producer p11 = new Producer("生产者01号", dataQueue);
        Producer p22 = new Producer("生产者02号", dataQueue);
        Consumer c11 = new Consumer("消费者01号", dataQueue);
        Consumer c22 = new Consumer("消费者02号", dataQueue);
        Consumer c33 = new Consumer("消费者03号", dataQueue);
        ExecutorService service = Executors.newCachedThreadPool();
        service.submit(p11);
        service.submit(p22);
        service.submit(c11);
        service.submit(c22);
        service.submit(c33);
    }
}

/**
 * 生产者
 */
class Producer implements Runnable {
    private String username;
    private BlockingQueue<String> dataQueue;
    Producer(String username, BlockingQueue<String> dataQueue) {
        this.username = username;
        this.dataQueue = dataQueue;
    }
    public void run() {
        try {
            while (true) {
                //产生0~~99随机整数
                int productID = (int)(Math.random()*100);
                dataQueue.put(String.valueOf(productID));
                System.out.println(username + "已生产：" + productID + "");
                Thread.sleep(500);
            }
        } catch (InterruptedException e1) {
            e1.printStackTrace();
        }
    }
}

/**
 * 消费者
 */
class Consumer implements Runnable {
    private String username;
    private BlockingQueue<String> dataQueue;
    Consumer(String username, BlockingQueue<String> dataQueue) {
        this.username = username;
        this.dataQueue = dataQueue;
    }
    public void run() {
        try {
            while (true) {
                String product = dataQueue.take();
                System.out.println(username + "已消费：" + product + "");
                Thread.sleep(500);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

## 控制台输出

```
生产者02号已生产：39
消费者02号已消费：84
生产者01号已生产：84
消费者01号已消费：39
消费者02号已消费：78
生产者02号已生产：78
生产者01号已生产：93
消费者01号已消费：93
生产者02号已生产：2
生产者01号已生产：18
消费者03号已消费：2
消费者01号已消费：18
生产者02号已生产：31
生产者01号已生产：95
消费者02号已消费：31
消费者01号已消费：95
生产者02号已生产：80
消费者02号已消费：71
生产者01号已生产：71
消费者03号已消费：80
消费者03号已消费：42
消费者02号已消费：24
...
...
...
```