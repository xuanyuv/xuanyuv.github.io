---
layout: post
title: "zTree树插件异步加载模式的用法"
categories: 前端
tags: jquery ztree servlet
author: 玄玉
excerpt: 演示ztree插件的一些用法。
---

* content
{:toc}


先放一张效果图

![](/img/2013-10-16/ztree-demo-01.png)

下面是一个服务端由`Servlet`提供数据给前端显示的完整示例代码

首先是`web.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" version="2.5">
    <servlet>
        <servlet-name>ManageServlet</servlet-name>
        <servlet-class>com.jadyer.servlet.ManageServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>ManageServlet</servlet-name>
        <url-pattern>/servlet/ManageServlet</url-pattern>
    </servlet-mapping>
</web-app>
```

然后是`//WebRoot//index.jsp`

```html
<%@ page language="java" pageEncoding="UTF-8"%>

<!--  zTree官网：http://www.ztree.me(本文使用的版本是zTree_v3.5.14.zip) -->
<!--    作者博客：http://ztreeapi.iteye.com -->
<!--     GitHub：https://github.com/zTree -->
<!-- GoogleCode：https://code.google.com/p/jquerytree/ -->
<!--
zTree引入到项目中后的目录结构如下
WebRoot
  |--js
  |  |--jquery-1.9.1.min.js
  |  |--zTree
  |  |  |--jquery.ztree.all-3.5.min.js
  |  |  |--css
  |  |  |  |--demo.css
  |  |  |  |--zTreeStyle.css
  |  |  |  |--img
  |  |  |  |  |--line_conn.gif
  |  |  |  |  |--loading.gif
  |  |  |  |  |--zTreeStandard.gif
  |  |  |  |  |--zTreeStandard.png
  |  |  |  |  |--diy
  |  |  |  |  |  |--1_close.png
  |  |  |  |  |  |--1_open.png
  |  |  |  |  |  |--2.png
  |  |  |  |  |  |--3.png
  |  |  |  |  |  |--4.png
  |  |  |  |  |  |--5.png
  |  |  |  |  |  |--6.png
  |  |  |  |  |  |--7.png
  |  |  |  |  |  |--8.png
  |  |  |  |  |  |--9.png
 -->
<link type="text/css" rel="stylesheet" href="./js/zTree/css/demo.css">
<link type="text/css" rel="stylesheet" href="./js/zTree/css/zTreeStyle.css">
<script src="./js/jquery-1.9.1.min.js"></script>
<script src="./js/zTree/jquery.ztree.all-3.5.min.js"></script>

<script>
<!--
var setting = {
    check: {
        enable  : true,      //设置zTree的节点上显示勾选框(checkbox或radio)
        chkStyle: 'checkbox' //指定勾选框类型为checkbox(setting.check.enable=true时生效)
    },
    data: {
        simpleData: {
            enable: true,  //开启简单数据模式(Array)
            pIdKey: 'pid'  //节点数据中保存其父节点唯一标识的属性名称,默认值为pId
        }
    },
    async: {
        enable:true, //设置zTree开启异步加载模式,默认值为false(默认为异步的POST请求)
        url   :'${pageContext.request.contextPath}/servlet/ManageServlet'
    },
};
$(function(){
    //开启异步加载后,将第三个参数zNodes填为null后表示根节点也异步加载
    //由于这里的isSimpleData=true,故异步返回的数据格式应该是下面这种
    //这是样例报文[{"checked":false,"chkDisabled":false,"id":1,"name":"测试1","open":true,"pid":0,"value":"值value1"},{"checked":false,"chkDisabled":false,"id":2,"name":"test2","open":true,"pid":1,"value":"值value2"},{"checked":false,"chkDisabled":false,"id":3,"name":"test3","open":true,"pid":1,"value":"值value3"},{"checked":true,"chkDisabled":true,"id":4,"name":"test4","open":true,"pid":2,"value":"值value4"},{"checked":false,"chkDisabled":false,"id":5,"name":"test5","open":true,"pid":2,"value":"值value5"}]
    //如果想对异步返回的数据进行加工,可以在setting.async中配置ajaxDataFilter属性,详见zTree的官方API
    //注意：显示的树的二级菜单是与异步返回数据有关的,可以修改后台生成数据前针对各菜单元素存放的顺序来查看树的显示效果
    //注意：但一级菜单始终会显示在第一列的，可以在后台修改二级（乃至三级、四级）菜单的存放顺序
    $.fn.zTree.init($('#treeDemo'), setting, null);
});

/**
 * 获取已勾选项编号
 */
function getZTreeValue(){
    var treeObj = $.fn.zTree.getZTreeObj('treeDemo');
    var nodes = treeObj.getCheckedNodes(true);
    var checkedIds = '';
    var checkedValues = '';
    for(var i=0; i<nodes.length; i++){
        checkedIds += nodes[i].id + '`';
        checkedValues += nodes[i].value + '`';
    }
    if(checkedIds.length > 0){
        checkedIds = checkedIds.substring(0, checkedIds.length-1);
        checkedValues = checkedValues.substring(0, checkedValues.length-1);
    }
    alert(checkedIds);
    alert(checkedValues);
}
//-->
</script>

<div>
    <ul id="treeDemo" class="ztree"></ul>
</div>
<br/>
<br/>
<input type="button" value="获取已勾选项编号" onclick="getZTreeValue()"/>
```

下面是用于封装`zTree`树菜单信息的`User.java`

```java
package com.jadyer.model;

public class User {
    private int id;
    private int pid;
    private String name;
    private String value;

    //以下三个属性原本应该用boolean,不过zTree也支持String的'true'和'false'
    private String open;
    private String checked;
    private String chkDisabled;

    /*--以上七个属性的setter和getter略--*/
}
```

最后是用来为`zTree`树提供菜单数据字符串的`ManageServlet.java`

```java
package com.jadyer.servlet;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.alibaba.fastjson.JSON;
import com.jadyer.model.User;

public class ManageServlet extends HttpServlet {
    private static final long serialVersionUID = 1916784793092718608L;

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //response.setContentType("text/html; charset=UTF-8");
        //这里返回类型也可以用application/json
        response.setContentType("application/json; charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.write(this.getData());
        out.flush();
        out.close();
    }

    private String getData() {
        User user1 = new User();
        User user2 = new User();
        User user3 = new User();
        User user4 = new User();
        User user5 = new User();
        user1.setId(1);
        user1.setPid(0);
        user1.setName("测试1");
        user1.setValue("值value1");
        user1.setOpen("true");
        user2.setId(2);
        user2.setPid(1);
        user2.setName("test2");
        user2.setValue("值value2");
        user2.setOpen("true");
        user3.setId(3);
        user3.setPid(1);
        user3.setName("test3");
        user3.setValue("值value3");
        user3.setOpen("true");
        user4.setId(4);
        user4.setPid(2);
        user4.setName("test4");
        user4.setValue("值value4");
        user4.setOpen("true");
        user4.setChecked("true");
        user4.setChkDisabled("true");
        user5.setId(5);
        user5.setPid(2);
        user5.setName("test5");
        user5.setValue("值value5");
        user5.setOpen("true");
        List<User> userList = new ArrayList<User>();
        userList.add(user3);
        userList.add(user2);
        userList.add(user4);
        userList.add(user1);
        userList.add(user5);
        String datas = JSON.toJSONString(userList);
        //这是样例报文datas=[{"checked":false,"chkDisabled":false,"id":1,"name":"测试1","open":true,"pid":0,"value":"值value1"},{"checked":false,"chkDisabled":false,"id":2,"name":"test2","open":true,"pid":1,"value":"值value2"},{"checked":false,"chkDisabled":false,"id":3,"name":"test3","open":true,"pid":1,"value":"值value3"},{"checked":true,"chkDisabled":true,"id":4,"name":"test4","open":true,"pid":2,"value":"值value4"},{"checked":false,"chkDisabled":false,"id":5,"name":"test5","open":true,"pid":2,"value":"值value5"}]
        System.out.println("datas=" + datas);
        return datas;
    }
}
```