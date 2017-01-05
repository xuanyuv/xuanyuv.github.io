---
layout: post
title: "synchronized的几个用法"
categories: JavaSE
tags: java synchronized
author: 玄玉
excerpt: 介绍了Java多线程常用到的synchronized关键字的几个用法。
---

* content
{:toc}


## 同步普通方法

Java中的每个对象都有一个锁（lock）或者叫做监视器（monitor）

当某个线程访问某个对象的 synchronized 方法时，则表示将该对象上锁

此时其它的任何线程，均无法访问该对象中的包括该方法在内的任何一个 synchronized 方法

（但允许访问该对象中的非 synchronized 方法）

直到该线程所访问的 synchronized 方法执行完毕（或抛出了异常）之后，该对象的锁才会被释放

总结：重点在于判断 Synchronized 锁的是谁，如果方法是静态的则锁 Class 对象，否则锁的就是当前对象

补充：1、这只是针对多个线程操作同一个类的同一个对象的情况，若多个线程操作同一个类的不同对象，则不存在这种情况<br>
　　　2、Java中的 volatile 变量也可以看作是一种“程度较轻的synchronized”

注意：1、当 synchronized 方法执行完或者发生异常时，会自动释放锁<br>
　　　2、被 synchronized 保护的数据应该是 private 的，否则也就没必要通过方法来访问这个 public 的数据了

```java
package com.jadyer.demo;

/**
 * synchronized同步普通方法
 * --------------------------------------------------------------
 * 控制台输出，类似如下
 * Thread-0：0
 * Thread-0：1
 * Thread-0：2
 * Thread-1：0
 * Thread-1：1
 * Thread-1：2
 * --------------------------------------------------------------
 * Created by 玄玉<https://jadyer.github.io/> on 2012/02/21 17:29.
 */
public class SynchronizedTest {
    public static void main(String[] args) {
        Bank bank = new Bank();
        new Thread(new ThreadRMB(bank)).start();
        //new一个新的Bank对象，此时存在两个Bank对象，即它们属于同一个类的不同的对象
        //bank = new Bank();
        new Thread(new ThreadDollar(bank)).start();
    }
}


class Bank{
    public synchronized void getRMB(){
        for(int i=0; i<3; i++){
            try {
                Thread.sleep((long)(Math.random()*1000));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println(Thread.currentThread().getName() + "：" + i);
        }
    }

    public synchronized void getDollar(){
        for(int i=0; i<3; i++){
            try {
                Thread.sleep((long)(Math.random()*1000));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println(Thread.currentThread().getName() + "：" + i);
        }
    }
}


class ThreadRMB implements Runnable{
    private Bank bank;
    public ThreadRMB(Bank bank){
        this.bank = bank;
    }
    @Override
    public void run() {
        bank.getRMB();
    }
}


class ThreadDollar implements Runnable{
    private Bank bank;
    public ThreadDollar(Bank bank){
        this.bank = bank;
    }
    @Override
    public void run() {
        bank.getDollar();
    }
}
```

## 同步静态方法

如果某个 synchronized 方法是 static 的

那么当线程访问该方法时，它锁的并不是 synchronized 方法所在的对象，而是该方法所在的对象所对应的 Class 对象

我们知道：Java中无论一个类有多少个对象，这些对象都会对应唯一的一个 Class 对象

因此当线程分别访问同一个类的两个 static 的 synchronized 方法时，**它们的执行顺序也是顺序执行的**

即一个线程先执行一个 static 的 synchronized 方法，执行完毕后，另一个线程才会开始执行另一个 static 的 synchronized 方法

总结：重点在于判断 Synchronized 锁的是谁，如果方法是静态的则锁 Class 对象，否则锁的就是当前对象

```java
package com.jadyer.demo;

/**
 * synchronized同步静态方法
 * --------------------------------------------------------------
 * 控制台输出，类似如下
 * Thread-1：0
 * Thread-0：0
 * Thread-1：1
 * Thread-0：1
 * Thread-0：2
 * Thread-1：2
 * --------------------------------------------------------------
 * Created by 玄玉<https://jadyer.github.io/> on 2012/02/21 17:29.
 */
public class SynchronizedStaticTest {
    public static void main(String[] args) {
        Bank bank = new Bank();
        new Thread(new ThreadRMB()).start();
        new Thread(new ThreadDollar()).start();
    }
}


class Bank{
    public synchronized static void getRMB(){
        for(int i=0; i<3; i++){
            try {
                Thread.sleep((long)(Math.random()*1000));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println(Thread.currentThread().getName() + "：" + i);
        }
    }

    public /*synchronized*/ static void getDollar(){
        for(int i=0; i<3; i++){
            try {
                Thread.sleep((long)(Math.random()*1000));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println(Thread.currentThread().getName() + "：" + i);
        }
    }
}


class ThreadRMB implements Runnable{
    @Override
    public void run() {
        Bank.getRMB();
    }
}


class ThreadDollar implements Runnable{
    @Override
    public void run() {
        Bank.getDollar();
    }
}
```

## 同步块

写法：`synchronized(object){//do something...}`，它表示线程在执行的时候，会对 object 对象上锁

通常会把 java.lang.Object 对象传进来，事实上这里可以传进来任何对象

因为它是一个没有实际作用的对象，其仅仅起到锁的作用，就像一个标识一样

它表示，如果线程能够进入到这里，即执行到这里，那么，就将 object 对象锁上

如果另一个线程也执行到这里，发现 object 对象已上锁，则会等待其解锁后，才会去执行 synchronized 块里面的代码

补充：1、synchronized(this) 表示对当前类的对象上锁（注意它锁的不是当前类的Class对象）<br>
　　　2、synchronized(Bank.class) 表示对当前类的 Class 对象上锁

```java
package com.jadyer.demo;

/**
 * synchronized同步块
 * --------------------------------------------------------------
 * 控制台输出，类似如下
 * Thread-1：0
 * Thread-0：0
 * Thread-0：1
 * Thread-1：1
 * Thread-0：2
 * Thread-1：2
 * --------------------------------------------------------------
 * Created by 玄玉<https://jadyer.github.io/> on 2012/02/21 17:29.
 */
public class SynchronizedBlockTest {
    public static void main(String[] args) {
        Bank bank = new Bank();
        new Thread(new ThreadRMB(bank)).start();
        //如果要验证synchronized(this)锁的是当前类的对象，而非当前类的Class对象
        //则可取消注释该行代码，再观察控制台打印效果：效果应该是两个线程并发执行的输出
        //bank = new Bank();
        new Thread(new ThreadDollar(bank)).start();
    }
}


/**
 * Created by 玄玉<https://jadyer.github.io/> on 2012/02/21 02:29.
 */
class Bank{
    private Object obj11 = new Object();
    private Object obj22 = new Object();

    public void getRMB(){
        //synchronized(obj11){
        synchronized (Bank.class) {
            for(int i=0; i<3; i++){
                try {
                    Thread.sleep((long)(Math.random()*1000));
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread().getName() + "：" + i);
            }
        }
    }

    public void getDollar(){
        //synchronized(obj11){
        //synchronized(obj22){
        synchronized (this) {
            for(int i=0; i<3; i++){
                try {
                    Thread.sleep((long)(Math.random()*1000));
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread().getName() + "：" + i);
            }
        }
    }
}


class ThreadRMB implements Runnable{
    private Bank bank;
    public ThreadRMB(Bank bank){
        this.bank = bank;
    }
    @Override
    public void run() {
        bank.getRMB();
    }
}


class ThreadDollar implements Runnable{
    private Bank bank;
    public ThreadDollar(Bank bank){
        this.bank = bank;
    }
    @Override
    public void run() {
        bank.getDollar();
    }
}
```