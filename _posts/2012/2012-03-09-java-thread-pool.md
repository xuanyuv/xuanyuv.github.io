---
layout: post
title: "Java线程池的用法"
categories: JavaSE
tags: java juc 线程 线程池 返回值 并发包
author: 玄玉
excerpt: 介绍了Java自带的线程池用法。
---

* content
{:toc}


这里演示了普通线程池以及带有返回值的线程池的使用方式

```java
package com.xuanyuv.thread.pool;

import java.util.Random;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletionService;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

/**
 * ThreadPool Test
 * @see ==============================================================================================
 * @see 线程与进程的区别
 * @see 1)多个进程的内部数据和状态是完全独立的，而多线程则会共享一块内存空间和一组系统资源，有可能互相影响
 * @see 2)线程本身的数据通常只有寄存器数据，以及一个程序执行时使用的堆栈。所以线程的切换比进程切换的负担要小
 * @see ==============================================================================================
 * @see 线程的启动方式和消亡
 * @see 1)Thread.start()启动时，JVM会以线程的方式运行它。start()首先会为线程的执行准备系统资源，然后才调用run()
 * @see 2)Thread.run()启动时，JVM会以普通方法运行它。此时就不会存在线程所特有的交替执行的效果
 * @see 3)一个线程类的两个对象，同时以start()方式运行时，JVM仍会把它们当作两个线程类来执行
 * @see 4)终止线程时，绝对不能使用stop()方法，而应该让run()自然结束
 * @see ==============================================================================================
 * @author 玄玉
 * @create Feb 29, 2012 1:13:43 AM
 */
public class ThreadPoolTest {
    public static void main(String[] args) {
        new ThreadPoolTest().threadPoolTest();
        new ThreadPoolTest().threadPoolScheduledTest();
        new ThreadPoolTest().threadPoolCallbaleAndFutureSignTest();
        new ThreadPoolTest().threadPoolCallbaleAndFutureMoreTest();
    }

    /**
     * 创建线程池的几种方式
     * @see Executors.newFixedThreadPool(3);     //创建固定大小的线程池
     * @see Executors.newCachedThreadPool();     //创建缓存线程池。它会根据实际请求的线程数量动态创建线程
     * @see Executors.newSingleThreadExecutor(); //创建单个线程池。它可以实现线程死掉后重新启动的效果，但实际启动的是"替补线程"
     */
    public void threadPoolTest(){
        //newSingleThreadExecutor()的好处就是，若池中的线程死了，它会把一个"替补的线程"扶上位
        //即它会保证池中始终有一个线程存在
        ExecutorService threadPool = Executors.newSingleThreadExecutor();
        for(int i=1; i<=10; i++) {
            final int task = i;
            //注意execute()的返回值是void
            threadPool.execute(new MyThread(task));
        }
        System.out.println("all of 10 tasks have committed......");

        //线程池中的任务均执行完毕后，关闭线程任务
        threadPool.shutdown();
    }

    /**
     * 线程池启动定时器
     * @see Executors.newScheduledThreadPool(3).schedule();            //创建并执行在给定延迟后启用的一次性操作
     * @see Executors.newScheduledThreadPool(3).scheduleAtFixedRate(); //首次启动后，以固定的频率自动执行操作
     * @see scheduleAtFixedRate()支持间隔重复任务的定时方式，但不直接支持绝对定时方式，我们需要转换为相对时间的方式，来执行
     */
    public void threadPoolScheduledTest(){
        //10秒后自动执行一次
        //Executors.newScheduledThreadPool(3).schedule(new MyScheduledThread(), 10, TimeUnit.SECONDS);
        //6秒后首次执行，之后每2秒均自动执行一次
        Executors.newScheduledThreadPool(3).scheduleAtFixedRate(new MyScheduledThread(), 6, 2, TimeUnit.SECONDS);
    }

    /**
     * 线程池返回一个任务的值
     * @see 注意：这里需使用java.util.concurrent.ExecutorService.submit()来提交，它会返回Future对象
     * @see 注意：Future取得的结果类型，与Callable返回的结果类型，必须一致。我们这里是通过泛型来实现的
     */
    public void threadPoolCallbaleAndFutureSignTest(){
        ExecutorService threadPool =  Executors.newSingleThreadExecutor();
        Future<String> future = threadPool.submit(
            new Callable<String>() {
                @Override
                public String call() throws Exception {
                    Thread.sleep(2000);
                    return "张起灵";
                };
            }
        );
        System.out.println("等待结果");
        try {
            //future.get(4, TimeUnit.SECONDS)
            System.out.println("拿到结果：" + future.get());
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
    }

    /**
     * 线程池返回多个任务的值
     * @see java.util.concurrent.CompletionService用于提交一组Callable任务
     * @see CompletionService.take()会返回已完成的一个Callable任务所对应的Future对象
     * @see 这就好比同时种植了几块菜地，然后等待收菜。收菜时，哪块菜熟了，就先去收哪块菜地的菜
     */
    public void threadPoolCallbaleAndFutureMoreTest(){
        ExecutorService threadPool =  Executors.newFixedThreadPool(5);
        CompletionService<Integer> completionService = new ExecutorCompletionService<Integer>(threadPool);
        for(int i=1; i<=5; i++){
            final int taskCode = i;
            completionService.submit(
                new Callable<Integer>(){
                    @Override
                    public Integer call() throws Exception {
                        Thread.sleep(new Random().nextInt(5000));
                        return taskCode;
                    }
                }
            );
        }
        for(int i=0; i<5; i++){
            try {
                System.out.println(completionService.take().get());
            } catch (InterruptedException e) {
                e.printStackTrace();
            } catch (ExecutionException e) {
                e.printStackTrace();
            }
        }
    }
}


class MyThread implements Runnable{
    private Integer task;
    public MyThread(Integer task){
        this.task = task;
    }
    @Override
    public void run() {
        //这里不需要写成j
        //因为它和threadPoolTest()里面的for()循环中的i并不是同一个方法中的变量，故其不会冲突
        for(int i=1; i<=10; i++) {
            try {
                Thread.sleep(20);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println(Thread.currentThread().getName() + " is looping of " + i + " for  task of " + task);
        }
    }
}


class MyScheduledThread implements Runnable{
    @Override
    public void run() {
        System.out.println("bombing......");
    }
}
```