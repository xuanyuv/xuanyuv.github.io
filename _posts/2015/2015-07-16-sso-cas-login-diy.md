---
layout: post
title: "单点登录CAS系列第02节之服务端登录页个性化"
categories: SSO
tags: sso cas
author: 玄玉
excerpt: 主要描述单点登录CAS-4.0.3服务端登录页内容修改的方法。
---

* content
{:toc}


## 原理

cas的页面显示控制是集中在`\WEB-INF\cas.properties`中的`cas.viewResolver.basename`属性的，其默认值为`default_views`

所以cas会去classpath中寻找`default_views.properties`（它里面指定了登录登出页面等）

了解了处理逻辑，再想自定义服务端登录页的话，就方便多了，步骤如下

```
1、修改cas.properties文件：cas.viewResolver.basename=xuanyu，再将default_views.properties拷贝一份为xuanyu.properties
2、修改xuanyu.properties文件：/WEB-INF/view/jsp/default改为/WEB-INF/view/jsp/xuanyu
　　其中`casLoginView.url`表示默认登录页，`casLoginGenericSuccessView.url`表示默认登录成功页
3、复制/WEB-INF/view/jsp/default/及其子目录所有文件到/WEB-INF/view/jsp/xuanyu/里面
```

接下来就可以随意修改登录页面了

注意：\WEB-INF\view\jsp\xuanyu\ui\includes\bottom.jsp 页面引用了 googleapis 的一些 jquery 库

## 代码

下面是我修改的casGenericSuccess.jsp

```html
<%@ page pageEncoding="UTF-8"%>
<body style="background-color:#CBE0C9;">
    <span style="color:red; font-size:64px; font-weight:bold;">登录成功</span>
</body>
```

下面是我修改的`casLoginView.jsp`

```html
<%@ page pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>

<c:set var="ctx" value="${pageContext.request.contextPath}" scope="session"/>

<!DOCTYPE HTML>
<html>
<head>
    <meta charset="UTF-8"/>
    <title>CAS单点登录系统</title>
    <link rel="icon" type="image/x-icon" href="${ctx}/favicon.ico"/>
    <script type="text/javascript" src="${ctx}/js/jquery-1.10.2.min.js"></script>
    <script type="text/javascript" src="${ctx}/js/jquery-ui-1.10.2.min.js"></script>
    <script type="text/javascript" src="${ctx}/js/cas.js"></script>
    <!--[if lt IE 9]>
        <script src="${ctx}/js/html5shiv-3.7.2.min.js" type="text/javascript"></script>
    <![endif]-->
</head>

<style>
body {background-color: #CBE0C9;}
#msg {padding:20px; margin-bottom:10px;}
#msg.errors {border:1px dotted #BB0000; color:#BB0000; padding-left:100px; background:url(${ctx}/images/error.gif) no-repeat 20px center;}
</style>

<body>
<c:if test="${not pageContext.request.secure}">
    <div id="msg" class="errors">
        <h2>Non-secure Connection</h2>
        <p>You are currently accessing CAS over a non-secure connection.  Single Sign On WILL NOT WORK.  In order to have single sign on work, you MUST log in over HTTPS.</p>
    </div>
</c:if>
<form:form method="post" commandName="${commandName}" htmlEscape="true">
    <!--
    cssClass用于指定表单元素CSS样式名,相当于HTML元素的class属性
    cssStyle用于指定表单元素样式,相当于HTML元素的style属性
    cssErrorClass用于指定表单元素发生错误时对应的样式
    path属性用于绑定表单对象的属性值,它支持级联属性,比如path="user.userName"将调用表单对象getUser.getUserName()绑定表单对象的属性值
     -->
    <form:errors path="*" id="msg" cssClass="errors" element="div" htmlEscape="false"/>
    <input type="hidden" name="lt" value="${loginTicket}"/>
    <input type="hidden" name="execution" value="${flowExecutionKey}"/>
    <input type="hidden" name="_eventId" value="submit"/>
    <table border="9">
        <tr>
            <td>
                <c:if test="${not empty sessionScope.openIdLocalId}">
                    <strong>${sessionScope.openIdLocalId}</strong>
                    <input type="hidden" name="username" value="${sessionScope.openIdLocalId}"/>
                </c:if>
                <c:if test="${empty sessionScope.openIdLocalId}">
                    <form:input tabindex="1" path="username" placeholder="帐号" htmlEscape="true" maxlength="16" size="25"/>
                </c:if>
            </td>
        </tr>
        <tr>
            <td>
                <form:password tabindex="2" path="password" placeholder="密码" htmlEscape="true" maxlength="16" size="25"/>
            </td>
        </tr>
        <tr>
            <td>
                <input type="checkbox" tabindex="3" name="warn" value="true"/>
                <label for="warn">转向其他站点前提示我</label>
            </td>
        </tr>
        <tr>
            <td>
                <input type="submit" tabindex="4" value="登录"/>
            </td>
        </tr>
    </table>
</form:form>
</body>
</html>
```

## 效果图

![](https://ae01.alicdn.com/kf/Ueaa149d29623475c9aa0b45b96d5c49fz.png)

![](https://ae01.alicdn.com/kf/U0da9ea67ace04a899374ca5865da6192X.png)

![](https://ae01.alicdn.com/kf/U945e1a6ce4e04ce88bcb799d7bc91b52f.png)