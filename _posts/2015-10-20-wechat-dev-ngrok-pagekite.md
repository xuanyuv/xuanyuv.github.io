---
layout: post
title: "微信开发利器ngrok和pagekite"
categories: 工具
tags: 微信 花生壳 ngrok pagekite
author: 玄玉
excerpt: 介绍微信、手Q、支付宝服务窗等开发场景中，需要与远程服务器联调时的，本机服务代理至互联网的工具。
---

* content
{:toc}


最常见的使用场景就是微信开发：微信服务器要主动调用或回调开发者服务器

如果把代码部署到公网的Linux，开发阶段就不便于`Debug，此时`ngrok`就派上用场了

当本地PC运行一个服务时，`ngrok`能够把本地的一个端口反向代理到公网，这样全世界都可以访问

不幸的是`ngrok`架设在美国，你懂的**...**

## ngrok

幸运的是还有良心网友免费搭建了ngrok服务器给我们使用，官网为[http://www.ngrok.cc](http://www.ngrok.cc)

官网上有具体用法，这里就不罗嗦了，下面贴一张效果图（我们也可以自己搭一个ngrok服务，网上也有教程）

![](/img/2015-10-20/wechat-dev-ngrok.png)

## pagekite

它也能实现和ngrok一样的效果，不过速度很慢，不推荐

其官网为[http://pagekite.net](http://pagekite.net)

按照pagekite下载页面的提示，很容易就弄好了，下面是我的截图

![](/img/2015-10-20/wechat-dev-pagekite.png)