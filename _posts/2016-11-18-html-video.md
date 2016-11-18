---
layout: post
title: "网页播放视频"
categories: 坐享其成
tags: 网页 视频
author: 玄玉
excerpt: 描述网页播放视频的<video>的用法。
---

* content
{:toc}


<video style="width:100%; height:100%;" preload="none" controls="controls" poster="http://ww2.sinaimg.cn/large/723dadf5gw1f9wab7mmuij20wp0hggon.jpg">
    <source id="mp4" src="http://gslb.miaopai.com/stream/HtNgr3djfi4nh859KYPpAg__.mp4" type="video/mp4">
    <p>Your user agent does not support the HTML5 Video element.</p>
</video>

实现代码如下

```html
<!--
比较常用的和实用的，也就下面这几个
src                ：指定视频地址（这里是用<source>标签实现的）
source             ：指定可选择的供浏览器显示的媒体（浏览器会从上往下直到找到能够播放的媒体）
poster=""          ：设置视频数据无效或加载中时显示的预览图
preload="none"     ：定义视频不进行预加载
controls="controls"：显示播放控制器
autoplay="autoplay"：设置视频自动播放
loop="loop"        ：设置视频循环播放
-->
<video style="width:100%; height:100%;" preload="none" controls="controls" poster="http://ww2.sinaimg.cn/large/723dadf5gw1f9wab7mmuij20wp0hggon.jpg">
    <source id="mp4" src="http://gslb.miaopai.com/stream/HtNgr3djfi4nh859KYPpAg__.mp4" type="video/mp4">
    <!--
    <source id="mp4" src="http://media.w3.org/2010/05/sintel/trailer.mp4" type="video/mp4">
    <source id="webm" src="http://media.w3.org/2010/05/sintel/trailer.webm" type="video/webm">
    <source id="ogv" src="http://media.w3.org/2010/05/sintel/trailer.ogv" type="video/ogg">
    -->
    <p>Your user agent does not support the HTML5 Video element.</p>
</video>
```