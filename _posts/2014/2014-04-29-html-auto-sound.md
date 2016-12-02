---
layout: post
title: "网页自动播放声音"
categories: 坐享其成
tags: 播放 声音 embed audio
author: 玄玉
excerpt: 介绍如何实现网页在不同浏览器下的，声音自动播放功能。
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

**好了，言归正传**

下面是实现网页自动播放声音的代码

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