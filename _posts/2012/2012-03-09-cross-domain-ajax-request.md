---
layout: post
title: "跨域异步请求的两种实现方式"
categories: 前端
tags: ajax 跨域
author: 玄玉
excerpt: 演示了FlyJSONP和jQuery分别实现跨域的异步请求的例子。
---

* content
{:toc}


这里主要介绍了实现跨域异步请求的两种方式：`FlyJSONP`和`jQuery`

实际上我觉得FlyJSONP更好用一些

下面分别演示这两种用法

## FlyJSONP

FlyJSONP 是一个应用 JSONP 实现跨域请求的相当轻量级的 JavaScript 类库

它不依赖于任何 JavaScript 框架，只需要设置一些参数，便可实现跨域的 POST 和 GET 请求

它的官网为：<https://alotaiba.github.io/FlyJSONP/>

用法举例如下

```html
<script src="js/flyjsonp.min.js"></script>
<script>
//IE9.0.8112.16421和FireFox9.0.1上测试均通过
//服务端输出给客户端时，输出的必须是json字符串，否则客户端无法接收
function getJFBCustomState(){
    FlyJSONP.init({debug: true});
    FlyJSONP.post({
        url: 'http://123.125.**.***:8088/ecpaycus/web/getCustomizeByPhoneNo',
        parameters: {phoneNo:'18601148104'},
        error: function(errorMsg){
            alert(errorMsg);
            console.log(errorMsg);
        },
        success: function(data){
            var customState = data.customState;
            alert('服务器返回结果为：' + customState);
        }
    });
}
</script>
<span style="color:blue; text-decoration:underline; cursor:pointer;" onclick="getJFBCustomState();">点此完成定制</span>
```

下面是提供给FlyJSONP的服务端伪代码示例

```java
String phoneNo = request.getParameter("phoneNo"));
//do something...
response.setContentType("application/json; charset=UTF-8");
response.getWriter().print("{customState: 'hasCustomized'}");
```

## jQuery

```html
<script src="https://lf26-cdn-tos.bytecdntp.com/cdn/expire-99-y/jquery/1.2.3/jquery.min.js" type="application/javascript"></script>
<script>
//IE9.0.8112.16421和FireFox9.0.1上测试均通过
//客户端请求时，必须提供回调函数名，并以参数形式放到请求的URL后面
//服务端输出给客户端时，必须将接收到的回调函数名字放到json字符串的前面
$(function(){
    $('#validateCustom').click(function(){
        $.getJSON('http://123.125.**.***:8088/ecpaycus/web/getCustomizeByPhoneNo?jsoncallback=?&phoneNo=18601148104',
            function(json){
                var customState = json.customState;
                alert('服务端返回结果为：' + customState);
            }
        );
    });
});
</script>
<span style="color:blue; text-decoration:underline; cursor:pointer;" id="validateCustom">点此完成定制</span>
```

下面是提供给jQuery的服务端伪代码示例

```java
String phoneNo = request.getParameter("phoneNo"));
//do something...
String jsoncallback = request.getParameter("jsoncallback");
String jsonReturn = "{customState: 'hasCustomized'}";
response.setContentType("application/json; charset=UTF-8");
response.getWriter().print(jsoncallback + "(" + jsonReturn + ")");
```