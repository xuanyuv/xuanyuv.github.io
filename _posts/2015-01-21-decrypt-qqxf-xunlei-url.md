---
layout: post
title: "解密QQ旋风和迅雷链接地址"
categories: 其它
tags: 解密 QQ旋风 迅雷 下载 链接 地址
author: 玄玉
excerpt: 介绍QQ旋风、迅雷、网际快车的各自下载地址，如何解密后还原为文件原始下载地址。
---

* content
{:toc}


## 原理

不止QQ旋风和迅雷，包括网际快车地址的加解密方式都很简单：都是`Base64`，只不过各自有些小改动罢了

* QQ旋风：它只是本本分分的将原下载地址直接`Base64`，再在前面加上旋风的专链标识`qqdl://`

* 迅雷：它在原下载地址首尾分别加上`AA`和`ZZ`，再`Base64`，再在前面加上迅雷专链标识`thunder://`

* 快车：它在原下载地址首尾都加上`[FLASHGET]`，再`Base64`<br/>
　　　最后在前面加上快车专链标识`flashget://`，同时在尾部加上`&forece`

## 举例

下面以迅雷链接地址解密为例，具体说明一下步骤（加密与之相反，此处就略了）

```
thunder://QUFlZDJrOi8vfGZpbGV8JUU3JThCJTgyJUU2JTgwJTkyLkJEMTI4MCVFOCVCNiU4NSVFNiVCOCU4NSVFNyU4OSVCOSVFNiU5NSU4OCVFNCVCOCVBRCVFOCU4QiVCMSVFNSU4RiU4QyVFNSVBRCU5Ny5tcDR8MjU5MzE4MzYzN3xBRDk1M0JFNUMzOUY2MThGNzc1RTI3MDAwNzA4NTczRHxoPVU0V0ZWVDNNQTdYNk9ITlBITFY3Q09JRzZEN1RFUVFYfC9aWg==
```

针对上面这个链接，我们可以在Linux终端下通过`echo url|base64 -d`口令来解密（**注意url去掉thunder://**）

也可以直接到开源中国的在线工具库中解密：[http://tool.oschina.net/encrypt?type=3](http://tool.oschina.net/encrypt?type=3)

```
echo QUFlZDJrOi8vfGZpbGV8JUU3JThCJTgyJUU2JTgwJTkyLkJEMTI4MCVFOCVCNiU4NSVFNiVCOCU4NSVFNyU4OSVCOSVFNiU5NSU4OCVFNCVCOCVBRCVFOCU4QiVCMSVFNSU4RiU4QyVFNSVBRCU5Ny5tcDR8MjU5MzE4MzYzN3xBRDk1M0JFNUMzOUY2MThGNzc1RTI3MDAwNzA4NTczRHxoPVU0V0ZWVDNNQTdYNk9ITlBITFY3Q09JRzZEN1RFUVFYfC9aWg== | base64 -d
```

终端打印出的结果如下

```
AAed2k://|file|%E7%8B%82%E6%80%92.BD1280%E8%B6%85%E6%B8%85%E7%89%B9%E6%95%88%E4%B8%AD%E8%8B%B1%E5%8F%8C%E5%AD%97.mp4|2593183637|AD953BE5C39F618F775E27000708573D|h=U4WFVT3MA7X6OHNPHLV7COIG6D7TEQQX|/ZZ
```

再去掉头尾的AAZZ，就得到解密后的地址了，也即文件的原始下载地址，本例中的文件实即

```
ed2k://|file|狂怒.BD1280超清特效中英双字.mp4|2593183637|AD953BE5C39F618F775E27000708573D|h=U4WFVT3MA7X6OHNPHLV7COIG6D7TEQQX|/
```