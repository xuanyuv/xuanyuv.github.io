---
layout: post
title: "JPA中的联合主键映射"
categories: JavaEE
tags: JavaEE jpa 映射
author: 玄玉
excerpt: 介绍JPA中的联合主键映射的示例代码。
---

* content
{:toc}


首先是飞机航线的复合主键类`AirLinePK.java`

```java
package com.xuanyuv.model;
import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Embeddable;

/**
 * 飞机航线的复合主键类
 * <ul>
 *     <li>通常复合主键类的类名尾部都带有PK字样，且通常只定义用作主键的字段</li>
 *     <li>
 *         作为复合主键类，以下三点是必须要遵守的JPA规范
 *         1.必须提供一个public的无参构造函数
 *         2.必须实现序列化接口
 *         3.必须重写hashCode()和equals()方法，其中以复合主键类的字段作为判断依据
 *     </li>
 * </ul>
 * Created by 玄玉<https://www.xuanyuv.com/> on 2011/02/11 10:39.
 */
//即嵌入注解，它用来告诉JPA：我们只是使用复合主键类里面的属性，作为实体的持久化字段
@Embeddable
public class AirLinePK implements Serializable {
    private static final long serialVersionUID = 3185023189977221359L;

    //飞机航线在国际上是有标准的，通常都会采用三字码来代表出发城市和目的城市
    //所谓三字码就是三个英文字母，比如北京的三字码是PEK，广州是CAN，上海是SHA
    //所以这里字段的长度只需要设成3位就可以
    @Column(length=3)
    private String startCity;

    @Column(length=3)
    private String endCity;

    public AirLinePK(){}

    public AirLinePK(String startCity, String endCity) {
        this.startCity = startCity;
        this.endCity = endCity;
    }

    /* 两个属性的setter和getter略 */

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((endCity == null) ? 0 : endCity.hashCode());
        result = prime * result + ((startCity == null) ? 0 : startCity.hashCode());
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
        final AirLinePK other = (AirLinePK) obj;
        if (endCity == null) {
            if (other.endCity != null)
                return false;
        } else if (!endCity.equals(other.endCity))
            return false;
        if (startCity == null) {
            if (other.startCity != null)
                return false;
        } else if (!startCity.equals(other.startCity))
            return false;
        return true;
    }
}
```

然后是飞机航线的实体`AirLine.java`

```java
package com.xuanyuv.model;
import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;

/**
 * 飞机航线的实体Bean
 */
@Entity
public class AirLine {
    //用于标注该属性为实体的标识符，该注解专门用于复合主键类
    @EmbeddedId
    private AirLinePK id;

    @Column(length=20)
    private String name;

    public AirLine(){}

    public AirLine(String startCity, String endCity, String name){
        this.id = new AirLinePK(startCity, endCity);
        this.name = name;
    }

    /* 两个属性的setter和getter略 */
}
```

下面是`//META-INF//persistence.xml`文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence xmlns="http://java.sun.com/xml/ns/persistence" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/persistence http://java.sun.com/xml/ns/persistence/persistence_1_0.xsd" version="1.0">
    <persistence-unit name="jpaCompositePKDemo" transaction-type="RESOURCE_LOCAL">
        <properties>
            <property name="hibernate.dialect" value="org.hibernate.dialect.OracleDialect"/>
            <property name="hibernate.show_sql" value="true"/>
            <property name="hibernate.format_sql" value="true"/>
            <property name="hibernate.hbm2ddl.auto" value="update"/>
            <property name="hibernate.connection.driver_class" value="oracle.jdbc.OracleDriver"/>
            <property name="hibernate.connection.username" value="scott"/>
            <property name="hibernate.connection.password" value="xuanyu"/>
            <property name="hibernate.connection.url" value="jdbc:oracle:thin:@127.0.0.1:1521:xuanyu"/>
        </properties>
    </persistence-unit>
</persistence>
```

最后是JUnit4单元测试类`CompositePKTest.java`

```java
package com.xuanyuv.junit;
import com.xuanyuv.model.AirLine;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import org.junit.Test;

public class CompositePKTest {
    @Test
    public void save(){
        EntityManagerFactory factory = Persistence.createEntityManagerFactory("jpaCompositePKDemo");
        EntityManager em = factory.createEntityManager();
        em.getTransaction().begin();
        em.persist(new AirLine("PEK", "SHA", "北京飞往上海"));
        em.getTransaction().commit();
        em.close();
        factory.close();
    }
}
```