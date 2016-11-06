---
layout: post
title: "iframe跨域时的高度自适应"
categories: 前端
tags: iframe 跨域 kissy
author: 玄玉
excerpt: 通过kissy-util-adaptive-frame.js解决iframe跨域时的高度自适应问题。
---

* content
{:toc}


其思想就是搞一个代理页面作为中转站，负责通知各个页面间高度发生的变化

本文的方案，是网络上众多方案中修改量最少的：`每个页面只需修改一行代码即可`

同时，它也适用于同域下`<iframe>`高度自适应的需求

## 公共部分

下面是我们要用到的一个公共的kissy-util-adaptive-frame.js

```js
/**
 * 跨域iframe自适应高度解决方案
 * Author: changyin@taobao.com <http://www.lzlu.com>
 * Copyright (c) 2011, Taobao Inc. All rights reserved.
 */
(function(){
    var adaptFrame = new function(){
        var doc = document, body = doc.body, self = this,

            //获取url中的参数
            getRequest = function(name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i"),
                    r = window.location.search.substr(1).match(reg);
                return (r!=null)?  unescape(r[2]) : null;
            },

            //获取配置，script的优先级大于url中的参数
            getConfig = function(){
                //scripts对象一定要在这里赋值，不然取不到正确的script对象
                var scripts = doc.getElementsByTagName('script'),
                    script = scripts[scripts.length - 1];
                return function(param){
                    var p = script.getAttribute(param);
                    return p? p : getRequest(param);
                };
            }(),

            //代理高度
            proxyheight = 0,

            //top页frame的id
            frameid = getConfig("data-frameid"),

            //监听实时更新高度间隔
            timer = getConfig("data-timer"),

            //获取代理的url
            getProxyuUrl = getConfig("data-proxy"),

            //创建代理的iframe
            proxyframe = function(){
                var el = doc.createElement("iframe");
                el.style.display = "none";
                el.name="proxy";
                return el;
            }();


        //重置高度
        this.resize = function(){
            proxyheight = body.offsetHeight;
            proxyframe.src =  getProxyuUrl + "?data-frameid=" + frameid+ "&data-frameheight=" + (proxyheight+40);
        }

        this.init = function(){
            var init = function(){
                body.appendChild(proxyframe);
                self.resize();
                //是否update
                if(!isNaN(timer)){
                    timer = timer<500?500:timer;
                    window.setInterval(function(){
                        if(body.offsetHeight != proxyheight){
                            self.resize();
                        }
                    },timer);
                };
            };
            //如果引入KISSY(http://kissyui.com/), 建议改成:KISSY.ready(function(){init();});
            if(doc.addEventListener){
                window.addEventListener("load",init,false);
            }else{
                window.attachEvent("onload",init);
            }
        }
    }


    adaptFrame.init();
})();
```

下面是我们要用到的代理页面`proxy.jsp`

```html
<%@ page language="java" pageEncoding="UTF-8"%>

<!doctype html>

<script type="text/javascript">
    (function(){
        var getRequest = function(name){
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i"),
                    r = window.location.search.substr(1).match(reg);
                return (r!=null)?  unescape(r[2]) : null;
        },
        height = getRequest("data-frameheight");
        try {
            var el = window.top.document.getElementById(getRequest("data-frameid"));
            if (!el) return;
            el.style.height = height + 'px';
        }
        catch (e) {
            //console.log(e);
        }
    })();
</script>
```

## 示例一

一共有两个JSP页面

首先是位于`123.125.xx.240`机器上的`main.jsp`

```html
<%@ page language="java" pageEncoding="UTF-8"%>

<!doctype html>

<h1>This is the main.jsp</h1>

<iframe id="myMainFrame" src="http://123.125.xx.232:8092/ecpaycus/test/nested.jsp"
        scrolling="no" width="400" style="border:6px solid black;"></iframe>
```

最后是位于`123.125.xx.232`机器上的`nested.jsp`

```
<%@ page language="java" pageEncoding="UTF-8"%>

<!--
页面文档类型统一使用HTML5 DOCTYPE
本页面的大部分内容修改自http://www.lzlu.com/blog/?p=692，在此感谢作者常胤
关于本页面的编码规范，可参考http://docs.kissyui.com/docs/html/tutorials/styleguide/html-coding-style.html
-->
<!doctype html>

<h2>This is the nested.jsp</h2>
<div id="box" style="width:300px; height:100px; background:red; padding:10px;">跨域iframe自适应高度的演示</div>
<button id="btn">增高</button>

<script type="text/javascript">
    var btn = document.getElementById("btn"), box = document.getElementById("box");
    btn.onclick = function(){
        box.style.height = box.offsetHeight + 50 + "px";
    }
</script>

<!--
1、这里data-proxy的值(proxy.jsp)要与main.jsp位于同一个域下
2、这里data-frameid的值要与main.jsp中<iframe id="myMainFrame">的id值一致
3、这里data-timer实际上是指定JavaScript中定时器(它可用来实现实时自适应高度)参数的
-->
<script type="text/javascript" src="kissy-util-adaptive-frame.js"
        data-frameid="myMainFrame" data-timer="1000"
        data-proxy="http://123.125.xx.240:8804/ecpaycus/test/proxy.jsp"></script>
```

okay，完活儿。。

不过，我觉得上面这个例子不是很完善，下面再补充一个

用到的公共js和代理页面还是上面的`kissy-util-adaptive-frame.js`和`proxy.jsp`，不变

## 示例二

为了演示效果，这回页面多了点，有四个

首先是位于`123.125.xx.240`机器上的`main.jsp`

```html
<%@ page language="java" pageEncoding="UTF-8"%>

<!doctype html>

<h1>This is the main.jsp</h1>

<iframe id="myMainFrame" src="http://123.125.xx.232:8092/ecpaycus/test/nested.jsp"
        scrolling="no" width="400" style="border:6px solid black;"></iframe>
```

下面是位于`123.125.xx.232`机器上的`nested.jsp`

```html
<%@ page language="java" pageEncoding="UTF-8"%>

<!doctype html>

<!-- 2秒后自动转到至与main.jsp同域中的nested22.jsp -->
<meta http-equiv="refresh" content="2; URL=http://123.125.xx.240:8804/ecpaycus/test/nested22.jsp">

<h2>2秒后自动转到至nested22.jsp</h2>
<div style="width:300px; height:100px; background:blue;">This is the nested.jsp</div>

<script type="text/javascript" src="kissy-util-adaptive-frame.js"
        data-frameid="myMainFrame" data-timer="1000"
        data-proxy="http://123.125.xx.240:8804/ecpaycus/test/proxy.jsp"></script>
```

接下来是位于`123.125.xx.240`机器上的`nested22.jsp`

```html
<%@ page language="java" pageEncoding="UTF-8"%>

<!doctype html>

<meta http-equiv="refresh" content="2; URL=nested33.jsp">

<h2>2秒后自动转到至nested33.jsp</h2>
<div style="width:300px; height:200px; background:red;">This is the nested22.jsp</div>

<script type="text/javascript" src="kissy-util-adaptive-frame.js"
        data-frameid="myMainFrame" data-timer="1000"
        data-proxy="proxy.jsp"></script>
```

最后同样是位于`123.125.xx.240`机器上的`nested33.jsp`

```html
<%@ page language="java" pageEncoding="UTF-8"%>

<!doctype html>

<h2>This is the nested33.jsp</h2>
<div id="box" style="width:300px; height:300px; background:green;">This is the nested33.jsp</div>

<script type="text/javascript" src="kissy-util-adaptive-frame.js"
        data-frameid="myMainFrame" data-timer="1000"
        data-proxy="proxy.jsp"></script>
```

这回完活了。。

## 补充

本文的机器地址都是`HTTP`的，如果某个页面是位于`HTTPS`下的，那也算是跨域

此时自适应未必会生效，解决办法是让页面与其引用的公共JS和代理页面处于同协议下