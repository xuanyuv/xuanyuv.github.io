---
layout: post
title: "浅析时间轮算法"
categories: 分布式
tags: 分布式
author: 玄玉
excerpt: 介绍定时任务解决方案之时间轮算法的原理及分布式用法。
published: true
---

* content
  {:toc}


业务需求：在一段时间之后，完成一个工作任务

业务举例：滴滴打车订单完成后，若用户一直不评价，48小时后自动评价为5星

常见方案：启动一个 cron 定时任务，定时扫描订单表（数据量大时，还需要分页查询）

不足之处：轮询效率较低、时效性不好（每小时扫描一次？或者每10分钟？解决不了根本问题）

高效延时消息，包含两个重要的数据结构：
1. 环形队列：例如可以创建一个包含 3600 个 slot 的环形队列，其本质是个数组
2. 任务集合：环上每一个 slot 是一个 Set<Task>

我们要做的就是：启动一个 timer，它每隔一秒，在上述环形队列中移动一格，走完一圈正好一小时

再通过 Current Index 指针来标识当前检测的 slot

而任务Task，有两个很重要的属性：
1. Cycle-Num：当 Current Index 第几圈扫描到这个 slot 时，执行任务
2. Task-Function：需要执行的任务指针

![](https://gcore.jsdelivr.net/gh/jadyer/mydata/img/blog/2023/2023-01-20-cron-time-wheel-01.png)

假设 Current Index 指向第一格，当有延时消息到达，例如希望 3610 秒之后触发一个延时消息任务，只需：

* 计算该 Task 应该放在哪一个 slot<br/>
现在指向 1，3610 秒之后，应该是第 11 格，所以 Task 应该放在第 11 个 slot 的 Set<Task> 中
* 计算该 Task 的 Cycle-Num<br/>
由于该任务是 3610 秒后执行，所以应该绕 **3610/3600=1** 圈之后再执行，于是 Cycle-Num=1

Current Index 每秒移动到一个 slot 时，就看它对应的 Set<Task> 中的每个 Task 的 Cycle-Num 是不是 0
* 不是 0，说明还需要多移动几圈，将 Cycle-Num 减 1
* 是 0，说明要执行这个任务，取出 Task-Funciton 执行（可以用单独的线程来执行），并把它从 Set<Task> 中删除

> 注意，不要用timer来执行任务，否则timer会越来越不准

使用了“延时消息”方案之后，针对上面的需求，只需在订单关闭时，触发一个 48 小时之后的延时消息即可
* 无需再轮询全部订单，效率高
* 一个订单，任务只执行一次
* 时效性好，精确到秒

> 控制timer移动频率可以控制精度

玄玉补充：
* JDK 自带的延时队列 DelayQueue 也能实现类似的功能
* Netty 自带的 HashedWheelTimer 就是上面思路的一个实现（它底层数据结构依然是使用 DelayQueue）
* 上面的方案，没有考虑到持久化和分布式，这需要特别注意

玄玉补充：

这里说的时间轮算法，也只是理论上的

实际落地时，关于持久化，最常见的就是采用 Redis 实现，大致设计方案如下：

假设一个时间轮有 15 个 slot，那就在 Redis 里设置 15 个 key（list0,list1,list2...list14），其 value 就是 List

游标就单独再定义一个 key，value 是 15 个 key 其中的一个（游标移动就是更新它的 value）

涉及的命令就是 SET、LPOP、LPUSH 三个

现在还有三个问题：
1. 不同业务线不同延时需求怎么办？2 天？15 天？难道要搞一个大轮子？<br/>
要知道 Cycle-Num 的方案也有缺点，因为会造成某个 solt 里的数据很多，导致操作它的代价就大了，性能下降<br/>
这时候可以考虑 文件 + Redis 的方案，如下图所示<br/>
![](https://gcore.jsdelivr.net/gh/jadyer/mydata/img/blog/2023/2023-01-20-cron-time-wheel-02.png)
2. 第二个问题就是：谁来移动游标（通过下面方式选到 leader 之后，波动轮子交给 leader 就可以了）
![](https://gcore.jsdelivr.net/gh/jadyer/mydata/img/blog/2023/2023-01-20-cron-time-wheel-03.png)
3. 最后一个问题是：调用方式（通常有以下两种考虑。另外就是采用 RocketMQ 的延时消息来实现，不过也有不足）
![](https://gcore.jsdelivr.net/gh/jadyer/mydata/img/blog/2023/2023-01-20-cron-time-wheel-04.png)