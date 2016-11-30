---
layout: post
title: "iBatis动态查询及缓存配置"
categories: iBatis
tags: ibatis cache
author: 玄玉
excerpt: 介绍iBatis动态查询及缓存配置的方法。
---

* content
{:toc}


## 动态查询

ibatis提供了丰富的判定节点，它主要分为一元判定和二元判定两类

一元判定是针对属性值本身的判定，如属性是否为NULL，是否为空值等

**以下是比较典型的一元判定**

| 判定节点 | 描述 |
|:------------------------------:|:--------------------------------:|
| &lt;isPropertyAvailable&gt;    | 参数类中是否提供了此属性            |
| &lt;isNotPropertyAvailable&gt; | 与&lt;isPropertyAvailable&gt;相反 |
| &lt;isNull&gt;                 | 属性值是否为NULL                   |
| &lt;isNotNull&gt;              | 与&lt;isNull&gt;相反              |
| &lt;isNotEmpty&gt;             | 与&lt;isEmpty&gt;相反             |
| &lt;isEmpty&gt;                | 若属性为Collection或者String，其size是否小于壹相反<br>其它类型则通过String.valueOf(属性值)获得其String类型的值后，判断其size是否小于壹 |

**下面是其它常见的二元判定节点**

| 判定节点 | 描述 |
|:----------------------:|:-------:|
| &lt;isEqual&gt;        | 相等     |
| &lt;isNotEqual&gt;     | 不等     |
| &lt;isGreaterThan&gt;  | 大于     |
| &lt;isGreaterEqual&gt; | 大于等于 |
| &lt;isLessThan&gt;     | 小于    |
| &lt;isLessEqual&gt;    | 小于等于 |

下面是动态查询的配置示例

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE sqlMap PUBLIC "-//ibatis.apache.org//DTD SQL Map 2.0//EN" "http://ibatis.apache.org/dtd/sql-map-2.dtd">
<sqlMap>
    <typeAlias alias="user" type="com.jadyer.model.User"/>
    <select id="findByNameOrSex" parameterClass="user" resultClass="user">
        select * from t_user
        <dynamic prepend="WHERE">
            <!--
            prepend属性，指明了本节点中定义的SQL子句在主体SQL中出现时的前缀
            而name属性对应的isNotEmpty节点，ibatis会自动判定是否需要追加prepend前缀
            这里"name = #name#"是WHERE子句中的第一个条件子句，不需要AND前缀，会自动省略
            并且：实际运行期将生成带占位符的PreparedStatement
            -->
            <isNotEmpty prepend="AND" property="name">
                name = #name#
            </isNotEmpty>
            <isNotEmpty prepend="AND" property="sex">
                sex = #sex#
            </isNotEmpty>
        </dynamic>
    </select>
    <select id="findByAddressUseName" parameterClass="user" resultClass="user">
        select * from t_user
        <dynamic prepend="WHERE">
            <!-- 判定节点的定义可以非常灵活，甚至可以使用嵌套的判定节点来实现复杂的动态映射 -->
            <isNotEmpty prepend="AND" property="name">
                (name = #name#
                <isNotEmpty prepend="AND" property="address">
                    address = #address#
                </isNotEmpty>
                )
            </isNotEmpty>
        </dynamic>
    </select>
    <select id="findByAge" parameterClass="int" resultClass="user">
        select * from t_user
        <dynamic prepend="WHERE">
            <!-- 这是一个二元判定。二元判定有两个判定参数，一是属性名，一是判定值 -->
            <isGreaterThan prepend="AND" property="age" compareValue="22">
                age = #age#
            </isGreaterThan>
        </dynamic>
    </select>
</sqlMap>
```

## 缓存机制

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE sqlMap PUBLIC "-//ibatis.apache.org//DTD SQL Map 2.0//EN" "http://ibatis.apache.org/dtd/sql-map-2.dtd">
<sqlMap>
    <typeAlias alias="user" type="com.jadyer.model.User"/>

    <!--
    cacheModel节点：定义了本映射文件中使用的Cache机制
    这里申明了一个名为"userCache"的cacheModel，之后可以在<statement>中对其引用
    与Hibernate类似，ibatis通过缓冲接口的插件式实现，提供了多种Cache的实现机制可供选择
    目前有四种Cache实现：MEMORY、LRU、FIFO、OSCACHE
    -->
    <cacheModel type="LRU" id="userCache">
        <!-- Cache刷新间隔。间隔时间到了之后，会在下一次查询时，越过Cache直接查数据库，然后才更新Cache -->
        <flushInterval hours="24"/>
        <!-- 当这些statement被执行了，那么下次的查询将会通过SQL去查，同时用查询结果更新Cache -->
        <!-- 注意和flushInterval一样，都不是主动刷新，而是由下次查询来触发被动刷新 -->
        <flushOnExecute statement="updateUser"/>
        <!-- 本CacheModel中最大容纳的数据对象数量 -->
        <property name="size" value="1000"/>
    </cacheModel>

    <select id="findById" parameterClass="int" resultClass="user" cacheModel="userCache">
        <![CDATA[
            select * from T_USER where id = #id#
        ]]>
    </select>

    <update id="updateUser" parameterClass="user">
        update T_USER set name=#name#, birth=#birth# where id=#id#
    </update>
</sqlMap>
```

http://www.cnblogs.com/xiziyin/archive/2009/12/28/1634430.html