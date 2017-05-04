---
layout: post
title: "回调演示的伪代码"
categories: Hibernate
tags: hibernate
author: 玄玉
excerpt: 演示模拟Hibernate回调示例，说明Spring中的Callback机制带来的好处。
---

* content
{:toc}


在写 JDBC 或 Hibernate 时，都需要获取 session、开启和提交事务、try{}catch{}、回滚等等

以前是通过动态代理来解决的，把它切进代码里去，其实也可以使用回调机制来解决类似问题

回调的作用就是：优化代码，减少模板性的方法（它可以把一些模板性的语句抽取出来）

下面是回调演示的伪代码

```java
package com.jadyer.demo.hibernate;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import java.sql.SQLException;

/**
 * 回调演示的伪代码（这个类就相当于是我们自己写的应用程序）
 * Created by 玄玉<http://jadyer.cn/> on 2010/11/10 02:59.
 */
public class CallbackDemo {
    public static void main(String[] args) {
        PersistManager persistManager = new PersistManager();
        persistManager.persist(new HibernateCallback() {
            //persist()需要传递一个实现了HibernateCallback接口的对象，在我们这里同样使用匿名的方式
            //既然是实现HibernateCallback接口，所以匿名类中就需要实现接口中的doInHibernate()方法
            //由于doInHibernate()方法的参数就是Session，故实现该方法时，就能得到Session，然后就可以做相关处理了
            @Override
            public Object doInHibernate(Session session) throws HibernateException, SQLException {
                User user = new User();
                user.setUsername("摘星子");
                user.setPassword("出尘子");
                session.save(user);
            }
        });
    }
}


/**
 * 持久化管理类
 */
class PersistManager {
    //persist()就相当于getHibernateTemplate().executeFind()，它们同样都要接收一个HibernateCallback对象
    void persist(HibernateCallback action) {
        Session session = null;
        try {
            session = HibernateUtils.getSession();
            session.beginTransaction();

            /*
             * 回调
             * -----------------------------------------------------------
             * 由于执行doInHibernate(session)的时候，把session传进去了
             * 所以我们在匿名类中就能够直接获取到session，并可以直接使用了
             * -----------------------------------------------------------
             */
            action.doInHibernate(session);

            session.getTransaction().commit();
        }catch(Exception e) {
            if(null == session){
                throw new RuntimeException("org.hibernat.Session is null...");
            }
            session.getTransaction().rollback();
        }finally{
            HibernateUtils.closeSession(session);
        }
    }
}


/**
 * 这里定义的接口，就暂时让它与Spring的HibernateCallback接口的名字和方法都相同吧
 */
interface HibernateCallback {
    Object doInHibernate(Session session) throws HibernateException, SQLException;
}
```

