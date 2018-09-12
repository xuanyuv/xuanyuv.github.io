---
layout: post
title: "JPA中的一和多映射"
categories: JavaEE
tags: JavaEE jpa 映射
author: 玄玉
excerpt: 介绍JPA中的一对多、一对一、多对多映射的不同写法，以及示例代码。
---

* content
{:toc}


## 公共的persistence.xml

这两个例子里面，都有用到`//META-INF//persistence.xml`文件

这是个公共文件，内容如下

```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence xmlns="http://java.sun.com/xml/ns/persistence" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/persistence http://java.sun.com/xml/ns/persistence/persistence_1_0.xsd" version="1.0">
    <!--
    <persistence-unit name="jadyerJPAOneToOne" transaction-type="RESOURCE_LOCAL">
    <persistence-unit name="jadyerJPAManyToMany" transaction-type="RESOURCE_LOCAL">
    -->
    <persistence-unit name="jadyerJPAOneToMany" transaction-type="RESOURCE_LOCAL">
        <properties>
            <property name="hibernate.dialect" value="org.hibernate.dialect.OracleDialect"/>
            <property name="hibernate.show_sql" value="true"/>
            <property name="hibernate.format_sql" value="true"/>
            <property name="hibernate.hbm2ddl.auto" value="update"/>
            <property name="hibernate.connection.driver_class" value="oracle.jdbc.OracleDriver"/>
            <property name="hibernate.connection.username" value="scott"/>
            <property name="hibernate.connection.password" value="jadyer"/>
            <property name="hibernate.connection.url" value="jdbc:oracle:thin:@127.0.0.1:1521:jadyer"/>
        </properties>
    </persistence-unit>
</persistence>
```

## 一对多映射

首先是订单的实体`Order.java`

```java
package com.jadyer.model;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import java.util.HashSet;
import java.util.Set;

/**
 * 订单的实体Bean
 * Created by 玄玉<https://jadyer.cn/> on 2011/02/11 09:16.
 */
@Entity
@Table(name="orders")
public class Order {
    @Id
    @Column(length=12)
    private String orderid;

    @Column(nullable=false)
    private Float amount = 0f;

    /**
     * <ul>
     *     <li>
     *         ManyToOne和OneToOne中，只要是加载一的一方，则其延迟属性默认值就是立即记载（fetch=FetchType.EAGER）
     *         OneToMany和ManyToMany中，只要是加载多的一方，则其延迟属性默认值就是延迟加载（fetch=FetchType.LAZY）
     *     </li>
     *     <li>
     *         CascadeType.REFRESH-->级联刷新
     *         CascadeType.PERSIST-->级联持久化，或者叫做级联保存。当保存对象时，同时保存该对象的子对象
     *         CascadeType.MERGE---->级联合并，也可以叫做级联更新。当更新对象时，同时更新该对象的子对象
     *         CascadeType.REMOVE--->级联删除。。。。。。。。。。。当删除对象时，同时删除该对象的子对象
     *     </li>
     *     <li>
     *         CascadeType.REFRESH只适用于实体管理器的refresh()方法
     *         CascadeType.PERSIST只适用于实体管理器的persist()方法
     *         CascadeType.MERGE只适用于实体管理器的merge()方法
     *         CascadeType.REMOVE只适用于实体管理器的remove()方法，并且对于JPQL中的delete from...是不会起作用的
     *         也就是说这里的四个级联类型，是与实体管理器EntityManager的四个方法一一对应的，而与JPQL无关
     *     </li>
     *     <li>
     *         JPA规范中，一对多或多对一关系时，多的一方为关系维护端，负责外键记录的更新
     *         关系被维护端是没有权利更新外键字段的，这里mappedBy属性就表明了该类Order.java为关系的被维护端
     *         它的值"order"指的就是关系维护端OrderItem.java中维护该关系的order属性，类似hibernate中的inverse="true"
     *     </li>
     * </ul>
     */
    @OneToMany(mappedBy="order", cascade={CascadeType.REFRESH,CascadeType.PERSIST,CascadeType.MERGE,CascadeType.REMOVE})
    private Set<OrderItem> items = new HashSet<>();

    public void addOrderItem(OrderItem orderItem){
        //因为OrderItem是关系维护端
        orderItem.setOrder(this);
        this.items.add(orderItem);
    }

    /* 三个属性对应的setter和getter略 */
}
```

下面是订单项的实体`OrderItem.java`

```java
package com.jadyer.demo;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

/**
 * 订单项的实体Bean
 * Created by 玄玉<https://jadyer.cn/> on 2011/02/11 09:16.
 */
@Entity
public class OrderItem {
    @Id
    @GeneratedValue
    private Integer id;

    @Column(length=40, nullable=false)
    private String productName;

    @Column(nullable=false)
    private Float sellPrice = 0f;

    //若optional=false就代表order的值是必须存在的，反映在数据库中的外键字段的值就是禁止为空
    @ManyToOne(cascade={CascadeType.MERGE, CascadeType.REFRESH}, optional=false)
    //指定外键的名称（外键一般都是在关系维护端定义）
    @JoinColumn(name="order_id")
    private Order order;

    /* 四个属性对应的setter和getter略 */
}
```

用到的`persistence.xml`就是本文公共的`persistence.xml`

最后是JUnit4单元测试类`OneToManyTest.java`

```java
package com.jadyer.junit;
import com.jadyer.model.Order;
import com.jadyer.model.OrderItem;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import org.junit.Test;

public class OneToManyTest {
    @Test
    public void save(){
        EntityManagerFactory factory = Persistence.createEntityManagerFactory("jadyerJPAOneToMany");
        EntityManager em = factory.createEntityManager();
        //开启事务
        em.getTransaction().begin();
        OrderItem orderItem11 = new OrderItem();
        OrderItem orderItem22 = new OrderItem();
        orderItem11.setProductName("九阴真经");
        orderItem11.setSellPrice(46f);
        orderItem22.setProductName("六脉神剑");
        orderItem22.setSellPrice(36f);
        Order order = new Order();
        order.setOrderid("999");
        order.setAmount(orderItem11.getSellPrice() + orderItem22.getSellPrice());
        order.addOrderItem(orderItem11);
        order.addOrderItem(orderItem22);
        em.persist(order);
        //提交事务
        em.getTransaction().commit();
        em.close();
        factory.close();
    }
}
```

## 一对一映射

首先是身份证的实体`IDCard.java`

```java
package com.jadyer.model;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToOne;

/**
 * 身份证的实体Bean
 * Created by 玄玉<https://jadyer.cn/> on 2011/02/11 09:16.
 */
@Entity
public class IDCard {
    @Id
    @GeneratedValue
    private Integer id;

    @Column(length=18, nullable=false)
    private String cardno;

    //当在Person.java中为IDCard设定非空之后，这里就不用再设置optional=false了
    //在JPA规范中，并没有规范一对一关系中的关系维护端，所以我们可以人为的决定关系维护端
    @OneToOne(mappedBy="idcard", cascade={CascadeType.PERSIST,CascadeType.MERGE,CascadeType.REFRESH})
    private Person person;

    public IDCard(){}

    public IDCard(String cardno) {
        this.cardno = cardno;
    }

    /* 三个属性的setter和getter略 */
}
```

然后是人的实体`Person.java`

```java
package com.jadyer.model;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

/**
 * 人的实体Bean
 * Created by 玄玉<https://jadyer.cn/> on 2011/02/11 09:16.
 */
@Entity
public class Person {
    @Id
    @GeneratedValue
    private Integer id;

    @Column(length=10, nullable=false)
    private String name;

    @OneToOne(optional=false, cascade=CascadeType.ALL)
    @JoinColumn(name="idcard_id")
    private IDCard idcard;

    public Person(){}

    public Person(String name) {
        this.name = name;
    }

    /* 三个属性的setter和getter略 */
}
```

用到的`persistence.xml`就是本文公共的`persistence.xml`

最后是JUnit4单元测试类`OneToOneTest.java`

```java
package com.jadyer.junit;
import com.jadyer.model.IDCard;
import com.jadyer.model.Person;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import org.junit.Test;

public class OneToOneTest {
    @Test
    public void save(){
        EntityManagerFactory factory = Persistence.createEntityManagerFactory("jadyerJPAOneToOne");
        EntityManager em = factory.createEntityManager();
        //开启事务
        em.getTransaction().begin();
        Person person = new Person("沈浪");
        person.setIdcard(new IDCard("222222"));
        em.persist(person);
        //提交事务
        em.getTransaction().commit();
        em.close();
        factory.close();
    }
}
```

## 多对多映射

首先是学生的实体`Student.java`

```java
package com.jadyer.model;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import java.util.HashSet;
import java.util.Set;

/**
 * 学生的实体Bean
 * Created by 玄玉<https://jadyer.cn/> on 2011/02/11 10:39.
 */
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Integer id;

    @Column(length=10, nullable=false)
    private String name;

    //@JoinTable(name="student_teacher") //这种情况下中间表的字段名默认为students_id和teachers_id
    //@JoinTable注解的inverseJoinColumns属性指的是被维护端的外键，joinColumns用来定义关联表中维护端的外键
    @ManyToMany(cascade=CascadeType.REFRESH)
    @JoinTable(name="student_teacher", joinColumns=@JoinColumn(name="student_id"), inverseJoinColumns=@JoinColumn(name="teacher_id"))
    private Set<Teacher> teachers = new HashSet<>();

    public Student(){}

    public Student(String name) {
        this.name = name;
    }

    /* 三个属性的setter和getter略 */

    /**
     * 建立学生跟老师的关系
     */
    public void addTeacher(Teacher teacher){
        this.teachers.add(teacher);
    }

    /**
     * 解除学生跟老师的关系
     */
    public void removeTeacher(Teacher teacher){
        if(this.teachers.contains(teacher)){
            this.teachers.remove(teacher);
        }
    }
}
```

然后是教师的实体`Teacher.java`

```java
package com.jadyer.model;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import java.util.HashSet;
import java.util.Set;

/**
 * 教师的实体Bean
 * Created by 玄玉<https://jadyer.cn/> on 2011/02/11 10:39.
 */
@Entity
public class Teacher {
    @Id
    @GeneratedValue
    private Integer id;

    @Column(length=10, nullable=false)
    private String name;

    //双向多对多是一种对等关系，所以我们可以人为的决定关系维护端
    @ManyToMany(mappedBy="teachers", cascade=CascadeType.REFRESH)
    private Set<Student> students = new HashSet<Student>();

    public Teacher(){}

    public Teacher(String name) {
        this.name = name;
    }

    /* 三个属性的setter和getter略 */

    //用来判断两个对象是否相同，所以要重写hashCode()和equals()方法
    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        final Teacher other = (Teacher) obj;
        if (id == null) {
            if (other.id != null)
                return false;
        } else if (!id.equals(other.id))
            return false;
        return true;
    }
}
```

用到的`persistence.xml`就是本文公共的`persistence.xml`

最后是JUnit4单元测试类`ManyToManyTest.java`

```java
package com.jadyer.junit;
import com.jadyer.model.Student;
import com.jadyer.model.Teacher;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import org.junit.Test;

public class ManyToManyTest {
    /**
     * 添加学生和老师
     */
    @Test
    public void save(){
        EntityManagerFactory factory = Persistence.createEntityManagerFactory("jadyerJPAManyToMany");
        EntityManager em = factory.createEntityManager();
        em.getTransaction().begin();
        em.persist(new Student("令狐冲"));
        em.persist(new Teacher("风清扬"));
        em.getTransaction().commit();
        em.close();
        factory.close();
    }

    /**
     * 建立学生跟老师的关系
     */
    @Test
    public void buildTS(){
        EntityManagerFactory factory = Persistence.createEntityManagerFactory("jadyerJPAManyToMany");
        EntityManager em = factory.createEntityManager();
        em.getTransaction().begin();
        Student student = em.find(Student.class, 3);
        student.addTeacher(em.getReference(Teacher.class, 4));
        em.getTransaction().commit();
        em.close();
        factory.close();
    }

    /**
     * 解除学生跟老师的关系
     */
    @Test
    public void removeTS(){
        EntityManagerFactory factory = Persistence.createEntityManagerFactory("jadyerJPAManyToMany");
        EntityManager em = factory.createEntityManager();
        em.getTransaction().begin();
        Student student = em.find(Student.class, 3);
        student.removeTeacher(em.getReference(Teacher.class, 4));
        em.getTransaction().commit();
        em.close();
        factory.close();
    }

    /**
     * 删除老师
     */
    @Test
    public void deleteTeacher(){
        EntityManagerFactory factory = Persistence.createEntityManagerFactory("jadyerJPAManyToMany");
        EntityManager em = factory.createEntityManager();
        em.getTransaction().begin();
        Student student = em.find(Student.class, 1);
        Teacher teacher = em.getReference(Teacher.class, 2);
        student.removeTeacher(teacher);
        //Teacher是关系被维护端，所以它没有权利直接更新外键，所以必须在解除关系之后再删除Teacher
        em.remove(em.getReference(Teacher.class, 2));
        em.getTransaction().commit();
        em.close();
        factory.close();
    }

    /**
     * 删除学生
     */
    @Test
    public void deleteStudent(){
        EntityManagerFactory factory = Persistence.createEntityManagerFactory("jadyerJPAManyToMany");
        EntityManager em = factory.createEntityManager();
        em.getTransaction().begin();
        Student student = em.getReference(Student.class, 1);
        //Student是关系维护端，有权利更新外键，所以能够直接删除
        em.remove(student);
        em.getTransaction().commit();
        em.close();
        factory.close();
    }
}
```