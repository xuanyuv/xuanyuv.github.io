---
layout: post
title: "研读MySQL02之事务原理与锁机制"
categories: 数据库
tags: 数据库
author: 玄玉
excerpt: 介绍MySQL事务实现方式以及不同类型的锁。
published: true
---

* content
{:toc}


## 事务原理

### 事务特性

* A（Atomicity原子性）：全部成功或全部失败
* I（Isolation隔离性）：并行事务之间，互不干扰
* D（Durability持久性）：事务提交后，永久生效
* C（Consistency一致性）：**通过 AID 保证**

### 隔离级别

* Read Uncommitted（读未提交）：最低隔离级别，会读取到其他事务未提交的数据<br>
  即其他事务update操作commit之前，它就能读到update之后的结果，若最后update回滚了，那它又读到之前的结果
* Read Committed（读已提交）：事务过程中可以读取到其他事务已提交的数据<br>
  这是Oracle默认隔离级别，即只要其他事务未commit，那读到的都是之前的结果，只有commit后读到的才是新结果
* Repeatable Read（可重复读）：每次读取相同结果集，不管其他事务是否提交<br>
  这是MySQL默认隔离级别，是依赖MVCC（Multi-Version Concurrent Control，多版本并发控制）实现的快照读
* Serializable（可串行化）：事务排队，隔离级别最高，性能最差，也是最严格的隔离级别

### 并发问题

不同的隔离级别，会引发不同的并发问题，下面是常见的三种：
* 脏读（Drity Read）：读取到未提交的数据
* 不可重复读（Non-repeatable read）：两次读取结果不同
* 幻读（Phantom Read）：读到的结果所表征的数据状态无法支撑后续的业务操作

通过隔离级别的特性，可以知道：
1. RC解决了脏读，但是，它会引起不可重复读和幻读（Oracle）
2. RR解决了脏读和不可重复读，但是，它会引起幻读（MySQL）

> 幻读通常是针对 insert 来说的<br/>
比如 select 某记录发现不存在，接着插入该记录，但插入时发现记录又存在了，插入失败，这就是发生了幻读<br/>
而 mysql 为了解决幻读，提出了 LBCC（解决当前读下的幻读）和 MVCC（解决快照读下的幻读）的两种方案

### 当前读和快照读

我们通过 select 读数据库的时候，实际上有两种读：当前读 和 快照读

* 当前读：读取的是数据的最新版本，并对读取的记录加锁（所以会阻塞其他事务同时改动该记录）<br/>
　　　　这两个语句都是当前读：select...lock in share mode / select...for update<br/>
　　　　另外，对于数据修改的操作（insert/update/delete），也是采用的当前读<br/>
　　　　比如说，我们在 update 的时候，首先会执行当前读，然后把返回的数据加锁，接着才是执行 update
* 快照读：单纯的 select 操作，不包括上述的 select...lock in share mode/select...for update/insert/update/delete<br/>
　　　　其读取的是数据的可见版本（可能是过期的数据），且不会加锁

而当前读和快照读的具体读法，以及快照读又是如何在众多快照中读到数据的，就涉及到了 MVCC 理论

### MVCC

正常来讲，既有读又有写操作的时候，是要加锁的

而现在很多数据库都支持 MVCC（Multi-Version Concurrent Control，多版本并发控制）理论

这样就不用加锁了，变成你写你的版本，我读老的版本，彼此不碍事（类似于 Java Concurrent 包中的 CopyOnWrite）

所以说 MVCC 不光解决了隔离级别的问题，实际上它也解决了事务并发的问题（即读写不冲突）

MySQL 同样支持 MVCC 理论，它是在每条记录上都添加隐藏列的方式实现的

并借助 undo log 和 redo log 实现了事务控制（binlog 是数据库层面的同步和恢复用的）

比如修改了一条记录，该记录中会有版本号和回滚指针两个隐藏列，回滚指针指向 undo log 中的上一次修改的记录

而上一次的记录中，可能又有回滚指针指向再上一次的记录，故无论修改多少次，都可以从 undo log 中读到数据

如下图所示：

![](https://cdn.jsdelivr.net/gh/jadyer/mydata/img/blog/2022/2022-01-22-mysql-tx-lock-01.png)

select for update 是一个典型的当前读，它始终读取最新版本的数据

其中 DB_TRX_ID 和 DB_ROLL_PTR 是两个隐藏列

一个代表事务ID（mysql 的每个事务都会分配一个全局唯一且递增的ID），相当于是标识这条数据的版本号

另一个就相当于这条数据的一个指针，它指向这条数据的前一个版本

这样，数据的多版本和控制就有了

而作为快照读的普通 select，怎么决定具体读哪个版本呢，这就涉及到 ReadView 机制

### ReadView

InnoDB 会为每个事务都构造一个数组，用来保存该事务启动的瞬间，当前正在 **【活跃】** 的所有事务ID

活跃事务指的是启动了但还没提交的事务，另外还有 **低水位** 和 **高水位** 的概念：

1. 低水位：该数组中的最小ID
2. 高水位：创建数组时，系统尚未分配的下一个事务ID，也即目前已创建过的事务ID的最大值 **+ 1**（不是数组中的）

而这个数组加上高水位，就组成了当前事务的一致性视图，即 ReadView

**所以说 ReadView 就是一个保存了事务ID的列表**

与其相关的，有 4 个比较重要的定义：
* m_ids：生成ReadView时当前系统中活跃的读写事务的事务ID列表
* min_trx_id：低水位
* max_trx_id：高水位
* creator_trx_id：生成该ReadView的事务的事务ID

按照 RR 的定义：一个事务启动时，能看到所有已提交的事务结果，但该事务执行期间，其他事务的更新对它不可见

换言之，一个事务只需要在启动的时候说，以我启动的时刻为准，如果一个数据的版本是在我启动之前生成的，我就认

若在我启动之后才生成的，我就不认，这时我必须找到它的上一个版本，如果 “上一个版本” 也不可见，则继续往前找

还有，如果是这个事务自己更新的数据，它自己还是要认的（也就是说：我能读到比我先的，不能读到比我后的）

**而这，正是通过 ReadView 来做数据可见性判断的思路**

如下图所示：

![](https://cdn.jsdelivr.net/gh/jadyer/mydata/img/blog/2022/2022-01-22-mysql-tx-lock-02.png)

实际上，在访问某条记录时，会按照下面的规则，从该记录的最新版本开始遍历，逐个判断某个版本是否可见

1. 被访问版本的 trx_id 等于 creator_trx_id，表示当前事务在访问自己修改的记录，可见，返回
2. 被访问版本的 trx_id 小于 min_trx_id，表明该版本在生成ReadView时，已经提交，可见，返回
3. 被访问版本的 trx_id 大于 max_trx_id，表明该版本在生成ReadView时，还未开启，不可见，继续遍历
4. 被访问版本的 trx_id 在 min_trx_id 和 max_trx_id 之间，那么则判断其是否在 m_ids 里面<br/>
在则说明生成ReadView时该版本事务未提交，该版本不可见，反之则可见，返回

> RC 与 RR 这俩隔离级别的一个不同就是：生成 ReadView 的时机不同<br/>
RC 会在每一次普通 SELECT（快照读）前，都生成一个 ReadView<br/>
RR 只在第一次普通 SELECT（快照读）前，生成一个 ReadView，其作用于整个事务的生命过程

因此，对于 RC 而言，由于每次查询前都生成新的 ReadView，这样读到的都是最新版本的 ReadView 下可见的数据

所以，当在一个事务中出现其他事务对某一数据行操作，那么该事务中，两次读到结果就可能不一致

**所以才会说：RC 会引起不可重复读**

而对于 RR 来讲，由于只在第一次生成 ReadView，在事务的整个过程中都不会再生成了，而是重复使用 ReadView

这样，即使在该事务中的两次读之间，做了其它的操作，那么第二次读时，仍然读到的是第一次读到的数据

**所以才会说：RR 解决了不可重复读**