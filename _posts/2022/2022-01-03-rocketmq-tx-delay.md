---
layout: post
title: "研习RocketMQ03之事务消息与延时消息"
categories: 分布式
tags: 分布式
author: 玄玉
excerpt: 介绍RocketMQ的事务消息和延时消息的工作原理。
published: true
---

* content
{:toc}


## 事务消息

### 实现流程

![](https://gcore.jsdelivr.net/gh/xuanyuv/mydata/img/blog/2022/2022-01-03-rocketmq-tx-delay-01.png)

上图为 RocketMQ 事务消息实现流程，也是基于两阶段提交协议（2PC）

1. HALF消息<br/>
MQ 收到一条事务消息后：会将该事务消息的主题和队列信息，转换成，半消息储存起来<br/>
然后放到RMQ_SYS_TRANS_HALF_TOPIC里面，而该topic对consumer是不可见的，所以半消息不会被订阅和消费
2. OP消息<br/>
MQ收到针对事务消息的commit或rollback时，会将其储存在RMQ_SYS_TRANS_OP_HALF_TOPIC里面<br/>
然后，若是rollback，则只做记录；若是commit，则根据HALF消息还原事务消息内容并投递出去（投递到commitlog）
3. 回查<br/>
针对超过一定时间的HALF消息，且OP消息还没到，则会回查生产者拿到事务结果（回查时间间隔与次数均可配）

### 核心原理

![](https://gcore.jsdelivr.net/gh/xuanyuv/mydata/img/blog/2022/2022-01-03-rocketmq-tx-delay-02.png)

结合上面这张图，大致描述一下核心原理：

生产者发送一条事务消息，MQ 收到后，也会写到CommitLog，然后dispatch线程发现这是一个事务消息

那就不会把它放到ConsumerQueue，会把它放到 half topic 的队列里面，这样它就不会被消费掉

接着本地事务处理完，就会发 commit/rollback 到 MQ，然后就会被放到 op topic 的队列里面

如果过来的是 rollback，那就不用做什么处理，只记录下来就行

如果过来的是 commit，那就根据 half topic 队列里面备份的信息，还原事务消息并重新投递到CommitLog

这样dispatch就可以把它放到该放的ConsumerQueue里面，然后就能够被消费到了

### 缺点

需要业务方提供回查接口，对业务有侵入（可能个别业务场景都不支持回查，或者处理起来很复杂）

### 自定义实现

![](https://gcore.jsdelivr.net/gh/xuanyuv/mydata/img/blog/2022/2022-01-03-rocketmq-tx-delay-03.png)

在了解了基本原理后，也可以自己实现一套事务消息组件，如上图举例

大致思路就是通过客户端来实现，好处是不管 MQ Server 使用哪一款 MQ 产品，这个组件都能实现事务消息

同时，把消息发送事件记录在事务消息表 Msg Table，通过本地事务来保证业务数据与写消息表的原子性

然后，程序里再写一个事务消息管理器来维护 Msg Table（扫库发送&清理等）

在封装组件时，除了处理发送失败及重试的特殊情况，还要尽量让业务感知不到里面的细节

让业务认为就是在用一个新的 MQ 客户端，或者说调用了一个新的 API

它就是在发出一条事务消息，并且这个消息能自己保证原子性，业务也不用实现回查接口，减轻业务的负担

## 延时消息

RocketMQ 支持 18 个级别的延时等级，默认值为：1s 5s 10s 30s 1m 2m 3m 4m 5m 6m 7m 8m 9m 10m 20m 30m 1h 2h

生产者发消息时通过设置delayLevel选择

**注：其受 CommitLog 保存时间的限制，换句话说若 CommitLog 最长保存 7 天，那么延迟时间最长则为 7 天**

![](https://gcore.jsdelivr.net/gh/xuanyuv/mydata/img/blog/2022/2022-01-03-rocketmq-tx-delay-04.png)

它的实现原理跟事务消息很像：实际RocketMQ很多功能都是类似方案，比如消息失败的重试，可以说是一通百通

具体实现是这样的：

MQ 收到延迟消息时，就会把它替换为 SCHEDULE_TOPIC_XXX 主题（也就是不进行投递）

在 SCHEDULE_TOPIC_XXX 主题中有 18 个队列，分别对应 18 个延时级别

接着就是根据延迟级别把消息放入对应的延时队列里面，而每个队列都有定时任务进行调度

这样就可以恢复到期消息，重新投递到真实的Topic，写到commitlog，进而真正的发送出去供消费

### 缺点

不支持任意时间延时，**如果想延迟 15s 怎么办？**

它一共只支持18个级别，那就把其中一个级别的时间改成15s，也就是改一下rocketmq配置，再重启就行了

那另一个业务侧希望延迟 45s 呢，最后 18 个级别都不够用了怎么办？

那就得加集群了，可这样做太麻烦了

所以网上才会有不少人基于时间轮算法对它进行定制