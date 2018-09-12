---
layout: post
title: "Hibernate不同主键策略下flush妙用"
categories: JavaEE
tags: JavaEE hibernate flush 主键
author: 玄玉
excerpt: 介绍Hibernate中的不同主键生成策略，结合flush()方法，产生不同的效果，的示例描述和代码。
---

* content
{:toc}


## 简介

这是`2011-04-17 01:21`写在CSDN博客的，仔细一看，也是后半夜写的

这次博客迁移，发现这文还是有些价值的，尽管好像六年没用过Hibernate

## 示例

直接上代码（用老罗的话说就是：不直接看效果，上来就讲一大堆科技参数，都是扯淡。。）

首先是位于`src`下的hibernate核心配置文件`hibernate.cfg.xml`

```xml
<?xml version='1.0' encoding='UTF-8'?>
<!DOCTYPE hibernate-configuration PUBLIC
          "-//Hibernate/Hibernate Configuration DTD 3.0//EN"
          "http://hibernate.sourceforge.net/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
    <session-factory>
        <property name="dialect">org.hibernate.dialect.MySQLDialect</property>
        <property name="connection.url">jdbc:mysql://localhost:3306/jadyer?characterEncoding=UTF-8</property>
        <property name="connection.username">root</property>
        <property name="connection.password">jadyer</property>
        <property name="connection.driver_class">com.mysql.jdbc.Driver</property>

        <property name="hibernate.show_sql">true</property>
        <property name="hibernate.format_sql">true</property>

        <!-- 批量读取数据。建议值50。需要JDBC和底层数据库的支持 -->
        <property name="hibernate.jdbc.fetch_size">50</property>

        <!-- 批量更新数据。建议值30 -->
        <property name="hibernate.jdbc.batch_size">30</property>

        <!-- 配置完这两个属性后，当我们向数据库提交SQL时，就不会一次性把全部数据读入内存 -->
        <!-- 而是按照一定的数量来批量读取相应的数据，但最终是否会生效还取决于底层数据库的支持 -->
        <!-- 有些数据库就不支持这些参数。其中Oracle和SQLServer都支持，而MySQL貌似就不支持 -->

         <!-- 也可以通过以下方式编写映射文件 -->
        <mapping resource="com/jadyer/hibernate/all.hbm.xml"/>
        <!--
        <mapping resource="com/jadyer/hibernate/User11.hbm.xml"/>
        <mapping resource="com/jadyer/hibernate/User22.hbm.xml"/>
        <mapping resource="com/jadyer/hibernate/User33.hbm.xml"/>
         -->
    </session-factory>
</hibernate-configuration>
```

接下来是用到的三个实体类

```java
package com.jadyer.hibernate;
import java.util.Date;
public class User11 {
    private String id;
    private String name;
    private String password;
    private Date createTime;
    /*--三个属性对应的setter和getter略--*/
}


package com.jadyer.hibernate;
import java.util.Date;
public class User22 {
    private int id;
    private String name;
    private String password;
    private Date createTime;
    /*--三个属性对应的setter和getter略--*/
}


package com.jadyer.hibernate;
import java.util.Date;
public class User33 {
    private String id;
    private String name;
    private String password;
    private Date createTime;
    /*--三个属性对应的setter和getter略--*/
}
```

下面是这三个实体类所对应的Hibernate映射文件`all.hbm.xml`

```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
    "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
    "http://hibernate.sourceforge.net/hibernate-mapping-3.0.dtd">
<hibernate-mapping package="com.jadyer.hibernate">
    <class name="User11" table="t_user11">
        <id name="id" column="user_id" length="32">
            <generator class="uuid"/>
        </id>
        <property name="name" unique="true" not-null="true" length="20"/>
        <property name="password" not-null="true" length="10"/>
        <property name="createTime" column="create_time"/>
    </class>

    <class name="User22" table="t_user22">
        <id name="id" column="user_id">
            <generator class="native"/>
        </id>
        <property name="name" unique="true" not-null="true" length="20"/>
        <property name="password"/>
        <property name="createTime" column="createtime"/>
    </class>

    <class name="User33" table="t_user33">
        <id name="id" column="user_id" length="32">
            <generator class="assigned"/>
        </id>
        <property name="name"/>
        <property name="password"/>
        <property name="createTime" column="create_time"/>
    </class>
</hibernate-mapping>
```

然后是利用Hibernate映射文件生成数据库表的ExportDB.java

```java
package com.jadyer.hibernate;
import org.hibernate.cfg.Configuration;
import org.hibernate.tool.hbm2ddl.SchemaExport;

/**
 * 利用Hibernate映射文件生成数据库表
 * Created by 玄玉<https://jadyer.cn/> on 2011/04/17 01:21.
 */
public class ExportDB {
    public static void main(String[] args) {
        //读取hibernate.cfg.xml文件
        Configuration cfg = new Configuration().configure();
        // 创建SchemaExport对象
        SchemaExport export = new SchemaExport(cfg);
        // 创建数据库表
        export.create(true, true);
    }
}
```

接下来是自定义的用于生成Session的工具类HibernateSessionUtils.java

```java
package com.jadyer.hibernate;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

/**
 * Created by 玄玉<https://jadyer.cn/> on 2011/04/17 01:21.
 */
public class HibernateSessionUtils {
    private static SessionFactory factory;

    static {
        try {
            Configuration cfg = new Configuration().configure();
            factory = cfg.buildSessionFactory();
        }catch(Exception e) {
            e.printStackTrace();
        }
    }

    public static Session getSession() {
        return factory.openSession();
    }

    public static void closeSession(Session session) {
        if (null != session && session.isOpen()) {
            session.close();
        }
    }
}
```

最后是借助了JUnit3.8实现的单元测试类SessionFlushTest.java

```java
package com.jadyer.hibernate;
import java.util.Date;
import org.hibernate.Session;
import org.hibernate.Transaction;
import com.jadyer.hibernate.HibernateSessionUtils;
import com.jadyer.hibernate.User11;
import com.jadyer.hibernate.User22;
import com.jadyer.hibernate.User33;
import junit.framework.TestCase;

/**
 * Created by 玄玉<https://jadyer.cn/> on 2011/04/17 01:21.
 */
public class SessionFlushTest extends TestCase {
    /**
     * 向数据库中批量录入1000条数据
     * @see 执行save()方法时，同样会向一级缓存中存放数据
     * @see 所以要考虑到一次性大量的实体数据入库导致内存溢出
     * @see 这时便可使用到session的flush()和clear()方法
     */
    public void testCachea() {
        Session session = null;
        try {
            session = HibernateSessionUtils.getSession();
            session.beginTransaction(); //开启事务
            for (int i=0; i<1000; i++) {
                User22 user = new User22();
                user.setName("u_" + i);
                session.save(user);
                if (0 == i%20) {
                    session.flush(); //每20条数据就强制session持久化数据
                    session.clear(); //同时清空缓存，避免大量数据造成内存溢出
                }
            }
            //如果数据量特别大，最好不要再使用Hibernate录入数据了，可以考虑采用JDBC实现
            //如果JDBC也不能满足要求，那么还可以考虑采用数据库本身的特定导入工具
            //比如相对于Oracle来说，就可以使用它的特定工具【SQL*Loader】
            session.getTransaction().commit(); //提交事务
        }catch(Exception e) {
            e.printStackTrace();
            session.getTransaction().rollback(); //发生异常则将事务回滚
        }finally {
            HibernateSessionUtils.closeSession(session); //最终不要忘记关闭org.hibernate.Session
        }
    }

    /**
     * 测试主键生成策略为uuid时
     * 监测：执行save()之后以及再显式执行flush()时的SQL语句发送情况
     * 结果：调用save()后，不会立即发出insert语句。调用flush()后，才会发送并执行SQL语句
     * @see 【以下是关于session中的existsInDatebase属性的说明】
     * @see 重点关注Debug透视图中的右上角的Variables视图中数据的变化
     * @see 首先以Debug As---JUnit Test方式执行单元测试方法，然后当执行完save()而未执行到flush()之前
     * @see 在Variables视图中展开到session---actionQueue---insertions---elementData---[0]里面
     * @see 我们可以把[0]里面的数据理解为形成insert的对象的集合，以后就遍历该集合，用以生成insert语句
     * @see 在Variables视图中session下面的actionQueue是一个临时的集合，用来形成insert或其它的语句
     * @see 在Variables视图中session下面的persistenceContext就可以理解成是它的缓存
     * @see 展开到persistenceContext---entityEntries---map---entries---table---[0]---value---value
     * @see 注意：展开到table中时，未必每次都是[0]，而此时我们应该展开的是存在HashMap$Entry<K,V>值的[i]就对了
     * @see 接着在第二层value下面，发现这里面还有一份数据。我们可以粗略的理解成是它缓存里的数据
     * @see 这时我们就会发现existsInDatebase属性，该属性就是用来判断当前数据在数据库中是否存在，值为false或true
     * @see 在执行完save()而没有执行flush()之前，existsInDatebase属性的值是false
     * @see 在执行完flush()而没有执行commit()之前，existsInDatebase的值就变为true，并且会马上发出SQL语句
     * @see 当existsInDatebase的值就变为true时，就说明数据库里面已经存在这条数据了
     * @see 这时再回到elementData---[0]临时集合查找，发现临时集合里面的数据已经没有了
     * @see 因为它要遍历该临时集合，再把临时集合里的数据拿出来形成insert语句。在执行insert后，临时集合就被清掉了
     * @see 所以说该临时集合是用来做临时交换的。当清掉临时集合之后，就会更新缓存中existsInDatebase的状态为true
     * @see 这时是在执行完flush()之后而没有执行commit()之前，此时还没有提交事务，但是已经执行了SQL语句
     * @see 而此时在MySQL Command Line Client中执行select查询的话，是查看不到数据的，这涉及到数据库的隔离级别
     * @see 我们可以使用select @@tx_isolation;命令查看MySQL默认隔离级别，结果为REPEATABLE-READ：即可重复读
     * @see 如果我们执行set transaction isolation level read uncommitted;命令，此时的隔离级别就是未提交读
     */
    public void testSave11() {
        Session session = null;
        Transaction tx = null;
        try {
            session = HibernateSessionUtils.getSession();
            tx = session.beginTransaction();
            User11 user = new User11();
            user.setName("张三");
            user.setPassword("123");
            user.setCreateTime(new Date());
            //由于User11采用的是uuid的主键生成策略
            //所以调用save()后，不会发出insert语句，而只是将user纳入了session的管理中
            //但此时id已经生成。而且这个时候session中的existsInDatebase的状态为false
            session.save(user);
            //调用flush()后，Hibernate会清理缓存，并执行SQL语句，会将user对象保存到数据库中
            //如果数据库的隔离级别设置为READ-UNCOMMITTED的话，即未提交读，那么我们就可以看到flush()过的数据
            //并且将session中insertions临时集合里user对象清除，此时session中existsInDatebase也被设置为true
            //session.flush();
            //默认情况下commit()操作会先执行flush()清理缓存，所以不需要显式的调用flush()方法
            tx.commit();
        }catch(Exception e) {
            e.printStackTrace();
            tx.rollback();
        }finally {
            HibernateSessionUtils.closeSession(session);
        }
    }

    /**
     * 测试主键生成策略为native时
     * @see 监测：执行save()之后的SQL语句发送情况
     * @see 结果：调用save()之后，将立即发送并执行insert语句。因为需要返回由数据库生成的id值
     */
    public void testSave22() {
        Session session = null;
        try {
            session = HibernateSessionUtils.getSession();
            session.beginTransaction();
            User22 user = new User22();
            user.setName("李四");
            user.setPassword("123");
            user.setCreateTime(new Date());
            //由于User22采用的是native的主键生成策略
            //所以调用save()方法之后，将发送并执行insert语句，然后返回由数据库生成的id值
            //并纳入了session的管理，也修改了session中的existsInDatebase的状态为true
            //如果数据库的隔离级别设置为未提交读，那么我们就可以看到save()过的数据
            session.save(user);
            session.getTransaction().commit();
        }catch(Exception e) {
            e.printStackTrace();
            session.getTransaction().rollback();
        }finally {
            HibernateSessionUtils.closeSession(session);
        }
    }


    /**
     * 测试主键生成策略为uuid时
     * @see 监测：执行save()和evict()之后，缓存中数据的变化
     * @see 结果：执行commit()后无法成功提交，并报告possible nonthreadsafe access to session
     */
    public void testSave33() {
        Session session = null;
        try {
            session = HibernateSessionUtils.getSession();
            session.beginTransaction();
            User11 user = new User11();
            user.setName("王五");
            user.setPassword("123");
            user.setCreateTime(new Date());
            session.save(user);
            //执行evict()后，会将user对象从session中逐出。即从session的entityEntries属性中逐出user对象
            session.evict(user);
            //执行commit()后无法成功提交
            //因为hibernate在清理缓存时，会在session的临时集合insertions中取出user对象进行insert操作
            //接下来就会去更新persistenceContext里面entityEntries中的existsInDatabase属性的值为true
            //而我们已经采用evict()将user对象从session的entityEntries中逐出了，故找不到相关数据，无法更新
            //抛出异常：org.hibernate.AssertionFailure: possible nonthreadsafe access to session
            //翻译结果：该线程不安全。也就是说当清除user对象，回来更新数据的时候，它认为是其它线程把这个数据删掉了
            //其实给我们的理解：应该说不会出现这个问题。而网上有的人说这可能是Hibernate的一个BUG，其实不然
            //通过这些可以看到：Hibernate在缓存方面确实下足了一番功夫
            session.getTransaction().commit();
        }catch(Exception e) {
            e.printStackTrace();
            session.getTransaction().rollback();
        }finally {
            HibernateSessionUtils.closeSession(session);
        }
    }

    /**
     * 测试主键生成策略为uuid时
     * @see 监测：在evict()之前先执行flush()方法，用以解决调用evict()之后无法提交数据的问题
     * @see 结果：执行commit()后成功提交
     */
    public void testSave44() {
        Session session = null;
        try {
            session = HibernateSessionUtils.getSession();
            session.beginTransaction();
            User11 user = new User11();
            user.setName("赵六");
            user.setPassword("123");
            user.setCreateTime(new Date());
            session.save(user);
            session.flush(); //此时会发出insert语句
            session.evict(user);
            //执行commit()后可以成功提交
            //因为hibernate在清理缓存时，在session的insertions临时集合中无法找到user对象
            //所以就不会发出insert语句，也就不会更新session中的existsInDatabase属性的状态
            session.getTransaction().commit();
        }catch(Exception e) {
            e.printStackTrace();
            session.getTransaction().rollback();
        }finally {
            HibernateSessionUtils.closeSession(session);
        }
    }

    /**
     * 测试主键生成策略为native时
     * @ses 监测：执行save()和evict()之后，缓存中数据的变化
     * @ses 结果：执行commit()后成功提交
     */
    public void testSave55() {
        Session session = null;
        try {
            session = HibernateSessionUtils.getSession();
            session.beginTransaction();
            User22 user = new User22();
            user.setName("马七");
            user.setPassword("123");
            user.setCreateTime(new Date());
            session.save(user); //此时会发送insert语句
            session.evict(user);
            //执行commit()后可以成功提交
            //因为hibernate在清理缓存时，在session的insertions临时集合中无法找到user对象
            //所以就不会发出insert语句，也就不会更新session中的existsInDatabase属性的状态
            session.getTransaction().commit();
        }catch(Exception e) {
            e.printStackTrace();
            session.getTransaction().rollback();
        }finally {
            HibernateSessionUtils.closeSession(session);
        }
    }

    /**
     * 测试主键生成策略为assigned时
     * @see 监测：批量执行save、update、delete操作的顺序
     * @see 结果：Hibernate会按照save、update、delete顺序提交相关操作
     */
    public void testSave66() {
        Session session = null;
        try {
            session = HibernateSessionUtils.getSession();
            session.beginTransaction();
            User33 user = new User33();
            user.setId("001");
            user.setName("王八");
            session.save(user);
            user.setName("夙瑶");
            //session.update(user); //也可以不显式的调用update()。此时的user正处于持久态，它会自动更新的
            User33 user3 = new User33();
            user3.setId("002");
            user3.setName("玄宵");
            session.save(user3);
            //Hibernate: insert into t_user33 (name, password, create_time, user_id) values (?, ?, ?, ?)
            //Hibernate: insert into t_user33 (name, password, create_time, user_id) values (?, ?, ?, ?)
            //Hibernate: update t_user33 set name=?, password=?, create_time=? where user_id=?
            //Hibernate会按照save、update、delete顺序提交相关操作
            session.getTransaction().commit();
        }catch(Exception e) {
            e.printStackTrace();
            session.getTransaction().rollback();
        }finally {
            HibernateSessionUtils.closeSession(session);
        }
    }

    /**
     * 测试主键生成策略为assigned时
     * @see 监测：利用flush()实现自定义的save、update、delete执行顺序
     * @see 结果：SQL会按照我们的意愿执行
     */
    public void testSave77() {
        Session session = null;
        try {
            session = HibernateSessionUtils.getSession();
            session.beginTransaction();
            User33 user = new User33();
            user.setId("003");
            user.setName("蔡依林");
            session.save(user);
            user.setName("菜10");
            //session.update(user); //也可以不显式的调用update()。此时的user正处于持久态，它会自动更新的
            session.flush();//利用flush()实现自定义的save、update、delete执行顺序
            User33 user33 = new User33();
            user33.setId("004");
            user33.setName("郑伊健");
            session.save(user33);
            //Hibernate: insert into t_user33 (name, password, create_time, user_id) values (?, ?, ?, ?)
            //Hibernate: update t_user33 set name=?, password=?, create_time=? where user_id=?
            //Hibernate: insert into t_user33 (name, password, create_time, user_id) values (?, ?, ?, ?)
            //由于在udpate()后面执行了flush()方法，所以在commit()清理缓存时，只会生成session.save(user33)的SQL语句
            session.getTransaction().commit();
        }catch(Exception e) {
            e.printStackTrace();
            session.getTransaction().rollback();
        }finally {
            HibernateSessionUtils.closeSession(session);
        }
    }
}
```