---
layout: post
title: "JPA中的继承映射"
categories: JavaEE
tags: JavaEE jpa 映射
author: 玄玉
excerpt: 介绍JPA中的继承映射的示例代码。
---

* content
{:toc}


首先是部门表的实体类`Department.java`

```java
package com.jadyer.model;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import java.util.Set;

/**
 * 部门表的实体
 * Created by 玄玉<https://jadyer.cn/> on 2011/02/11 11:15.
 */
@Entity
public class Department {
    @Id
    @GeneratedValue
    private int id;

    private String name;

    @OneToMany(targetEntity=Employee.class, fetch=FetchType.LAZY, mappedBy="depart", cascade={CascadeType.MERGE,CascadeType.PERSIST})
    private Set<Employee> emps;

    /* 三个属性的setter和getter略 */
}
```

然后是员工表的实体类`Employee.java`

```java
package com.jadyer.model;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.ManyToOne;

/**
 * 员工表的实体
 * Created by 玄玉<https://jadyer.cn/> on 2011/02/11 11:15.
 */
@Entity
//指定继承策略
//InheritanceType.JOINED------------>每个子类一张表
//InheritanceType.SINGLE_TABLE------>单表，一张表映射一个继承树
//InheritanceType.TABLE_PER_CLASS--->每个具体类一张表
@Inheritance(strategy=InheritanceType.SINGLE_TABLE)
//指定鉴别器的列
@DiscriminatorColumn(name="type")
//指定employee表的鉴别器的值
@DiscriminatorValue("1")
public class Employee {
    @Id
    @GeneratedValue
    private int id;

    private String name;

    //JPA缺省就会生成depart_id字段，这要比Hibernate好一些（Hibernate缺省的属性名和字段名是相同的）
    //@Column(name="depart_id")
    //关于它的targetEntity属性，通过反射就会自动找到，所以我们不用理会
    @ManyToOne()
    private Department depart;

    /* 三个属性的setter和getter略 */

    @Override
    public String toString() {
        return "id=" + this.id + "/tname=" + this.name;
    }
}
```

下面是用来代表工资的员工表的子类`Sales.java`

```java
package com.jadyer.model;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

/**
 * 工资
 */
@Entity
//指定sales表的鉴别器的值
@DiscriminatorValue("2")
public class Sales extends Employee {
    private int sell;
    /* setter和getter略 */
}
```

下面是用来代表技能的员工表的子类`Skiller.java`

```java
package com.jadyer.model;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

/**
 * 技能
 */
@Entity
//指定skiller表的鉴别器的值
@DiscriminatorValue("3")
public class Skiller extends Employee {
    private String skill;
    /* setter和getter略 */
}
```

接下来是`//META-INF//persistence.xml`文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence xmlns="http://java.sun.com/xml/ns/persistence" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/persistence http://java.sun.com/xml/ns/persistence/persistence_1_0.xsd" version="1.0">
    <persistence-unit name="jpaExtendDemo" transaction-type="RESOURCE_LOCAL">
        <!-- 指定实现JPA的提供者 -->
        <provider>org.hibernate.ejb.HibernatePersistence</provider>
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

最后是JUnit4单元测试类`ExtendTest.java`

```java
package com.jadyer.junit;
import com.jadyer.model.Department;
import com.jadyer.model.Employee;
import com.jadyer.model.Sales;
import com.jadyer.model.Skiller;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import java.util.HashSet;
import java.util.Set;
import org.junit.Test;

public class ExtendTest {
    @Test
    public void save(){
        EntityManagerFactory factory = Persistence.createEntityManagerFactory("jpaExtendDemo");
        EntityManager em = factory.createEntityManager();
        em.getTransaction().begin();

        Department depart = new Department();
        depart.setName("古龙武侠");

        Employee emp11 = new Employee();
        emp11.setDepart(depart);
        emp11.setName("沈浪");

        Skiller emp22 = new Skiller();
        emp22.setDepart(depart);
        emp22.setName("王怜花");
        emp22.setSkill("skill");

        Sales emp33 = new Sales();
        emp33.setDepart(depart);
        emp33.setName("李寻欢");
        emp33.setSell(88);

        Set<Employee> emps = new HashSet<Employee>();
        emps.add(emp22);
        emps.add(emp11);
        emps.add(emp33);

        //将三名员工加入到部门中
        depart.setEmps(emps);

        em.persist(depart);

        em.getTransaction().commit();
        em.close();
        factory.close();
    }
}
```