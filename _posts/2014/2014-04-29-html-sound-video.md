---
layout: post
title: "网页播放声音和视频"
categories: 前端
tags: 前端
author: 玄玉
excerpt: 介绍如何实现网页在不同浏览器下的声音自动播放功能，以及视频播放。
---

* content
{:toc}


先啰嗦两句

`W3C`已经发布了`HTML5.1`的提案推荐标准：[https://www.w3.org/TR/2016/PR-html51-20160915/](https://www.w3.org/TR/2016/PR-html51-20160915/)

其中很多老标签都被废弃了

* `<bgsound></bgsound>`

　　　原写法为`<bgsound src="your.mid" autostart="true" loop="infinite"></bgsound>`

　　　推荐使用`<audio>`或者`<object>+<embed/>`来代替

　　　例如`<embed src="your.mid" autostart="true" loop="true" hidden="true"/>`

* 用来定义字体、字号和颜色的也废弃了

　　　比如`<span style="font-family:verdana;font-size:14px;color:green;">some text</span>`

　　　应当用`CSS`来代替

* 使内容居中的`<center>文本及子元素会居中</center>`也被废弃了

　　　同样应当用`CSS(text-align: center;)`来控制

其它的就不列举了

## 播放声音

```html
<!DOCTYPE HTML>
<html>
<head>
    <title>网页自动播放声音</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <script src="//cdn.bootcss.com/jquery/1.7.2/jquery.min.js"></script>
</head>
<script>
//这里参考了以下两个站点的介绍
//http://www.w3school.com.cn/html/html_audio.asp
//http://www.zhanxin.info/development/2013-05-17-html5-audio.html
//测试时可以用这个目录的声音D:\ProgramFiles\Tencent\QQ\Misc\Sound\Classic\
$(function(){
    if($.browser.msie && $.browser.version=='8.0'){
        //本来这里用的是<bgsound src="system.wav"/>,结果IE8不播放声音,于是换成了embed
        $('#newMessageDIV').html('<embed src="system.wav"/>');
    }else{
        //IE9+,Firefox,Chrome均支持<audio/>
        var sound = '<audio autoplay="autoplay">';
        sound += '<source src="system.wav" type="audio/wav"/>';
        sound += '<source src="system.mp3" type="audio/mpeg"/>';
        sound += '</audio>';
        $('#newMessageDIV').html(sound);
    }
});
</script>
<body>
    <div id="newMessageDIV" style="display:none"></div>
</body>
</html>
```

## 播放视频

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

<video style="width:100%; height:100%;" preload="none" controls="controls" poster="http://ww2.sinaimg.cn/large/723dadf5gw1f9wab7mmuij20wp0hggon.jpg">
    <source src="http://gslb.miaopai.com/stream/HtNgr3djfi4nh859KYPpAg__.mp4" type="video/mp4">
    <p>Your user agent does not support the HTML5 Video element.</p>
</video>

<video style="width:100%; height:100%;" preload="none" controls="controls" poster="http://ww1.sinaimg.cn/large/723dadf5ly1fh8zvn6059j21h20s34qq.jpg">
    <source src="https://gss3.baidu.com/6LZ0ej3k1Qd3ote6lo7D0j9wehsv/tieba-smallvideo/35_f626470dc54c0cc506323973d140705a.mp4" type="video/mp4">
    <p>Your user agent does not support the HTML5 Video element.</p>
</video>