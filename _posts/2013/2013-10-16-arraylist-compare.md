---
layout: post
title: "ArrayList自定义排序"
categories: JavaSE
tags: java
author: 玄玉
excerpt: 演示ArrayList自定义排序的方法。
---

* content
{:toc}


## 代码实现

```java
package com.jadyer.demo;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * 实现Comparator接口重写compare()方法的方式，实现自定义排序ArrayList
 * Created by 玄玉<https://jadyer.github.io/> on 2013/10/16 17:43.
 */
public class SortTest {
    public static void main(String[] args) {
        List<User> userList = new ArrayList<User>();
        userList.add(new User(4, "40", "特色功能"));
        userList.add(new User(2, "30", "基础功能"));
        userList.add(new User(1, "10", "智能客服"));
        userList.add(new User(5, "50", "运营管理"));
        userList.add(new User(3, "30", "首页"));
        for (User user : userList) {
            System.out.println(user.getId() + "--" + user.getAge() + "--" + user.getName());
        }
        System.out.println("-----------------------------------------------------------------------");
        System.out.println("以上是自定义排序前的顺序，默认是按照ArrayList存放顺序显示的");
        System.out.println("以下是自定义排序后的顺序，即先Age排序，Age相同时再按Name排序（都是升序）");
        System.out.println("-----------------------------------------------------------------------");
        Collections.sort(userList, new Comparator<User>(){
            @Override
            public int compare(User o1, User o2) {
                if(!o1.getAge().equals(o2.getAge())){
                    return Integer.parseInt(o1.getAge()) - Integer.parseInt(o2.getAge());
                }else{
                    return o2.getName().compareTo(o1.getName());
                }
            }
        });
        for (User user : userList) {
            System.out.println(user.getId() + "--" + user.getAge() + "--" + user.getName());
        }
    }
}

class User {
    private int id;      //用户编号
    private String age;  //用户年龄（这里故意让它为String）
    private String name; //用户名
    User(int _id, String _age, String _name){
        this.id = _id;
        this.age = _age;
        this.name = _name;
    }
    int getId() {
        return id;
    }
    String getAge() {
        return age;
    }
    String getName() {
        return name;
    }
}
```

## 控制台输出

```
4--40--特色功能
2--30--基础功能
1--10--智能客服
5--50--运营管理
3--30--首页
-----------------------------------------------------------------------
以上是自定义排序前的顺序，默认是按照ArrayList存放顺序显示的
以下是自定义排序后的顺序，即先Age排序，Age相同时再按Name排序（都是升序）
-----------------------------------------------------------------------
1--10--智能客服
3--30--首页
2--30--基础功能
4--40--特色功能
5--50--运营管理
```