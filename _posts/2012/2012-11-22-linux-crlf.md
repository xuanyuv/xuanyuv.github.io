---
layout: post
title: "各操作系统中的换行符差异"
categories: Linux
tags: linux 换行符
author: 玄玉
excerpt: 介绍换行符CRLF的历史由来，以及各操作系统和文本编辑器中的显示方式。
---

* content
{:toc}


## 现象

我们通常会把应用部署在`Linux`，而在使用`vi`查日志时，可能会发现有一个`^M`符号，如下所示

```
[20121121 07:53:19][pool-3-thread-3][AbstractAction]^M
------------------------------------------------------------------------------------------^M
【通信双方】(0x00004AFE: nio socket, server, /192.168.13.3:59565 => /192.168.12.2:80)^M
【收发标识】Receive^M
【报文内容】POST /tra/trade/noCardNoPassword.htm HTTP/1.1^M
Content-Type: application/x-www-form-urlencoded;charset=GB18030^M
Cache-Control: no-cache^M
Pragma: no-cache^M
User-Agent: Java/1.6.0_24^M
Host: 192.168.20.1^M
Accept: text/html, image/gif, image/jpeg, *; q=.2, */*; q=.2^M
Connection: keep-alive^M
Content-Length: 541^M
^M
cooBankNo=CMBC_CREDIT&signType=MD5&amount=499900&orderValidityNum=15&CVVNo=255^M
------------------------------------------------------------------------------------------
```
```
[20121121 16:37:15][pool-3-thread-26][AbstractAction]^M
------------------------------------------------------------------------------------------^M
【通信双方】(0x0000E522: nio socket, server, /58.83.141.39:60796 => /192.168.12.2:80)^M
【收发标识】Receive^M
【报文内容】GET /notify_yeepay?p1_MerId=11&r0_Cmd=Buy&r1_Code=1&r2_TrxId=22 HTTP/1.1^M
Content-Type: application/x-www-form-urlencoded; charset=GBK^M
Cache-Control: no-cache^M
Pragma: no-cache^M
User-Agent: Java/1.5.0_14^M
Host: 123.125.**.248^M
Accept: text/html, image/gif, image/jpeg, *; q=.2, */*; q=.2^M
Connection: keep-alive^M
^M
^M
------------------------------------------------------------------------------------------
```

先说下`^M`是什么

首先，这是由于`vi`内部认为该日志是Linux格式的，所以，对于换行符，它只认`LF`

于是，会把遇到的`CR`干掉，取而代之的就显示出来一个`^M`符号

并且，`^M`符号只是Linux等系统规定的一个特殊标记，占一个字符的大小，但它不是`^`和`M`的组合

所以，`^M`是打印不出来的，它也只是用于显示而已，不会真正的写入到文件中

## 换行符

这里就引伸出一个概念：换行符，也就是`CR（Carriage Return，回车符）`和`LF（Line Feed，换行符）`的问题

通常**EditPlus--->工具--->参数设置--->文本--->新建文件中**可以看到PC/UNIX/MAC三种格式

而在**UltraEdit--->高级--->配置--->文件处理--->新建文件类型中**可以看到DOS/UNIX/MAC三种格式

而且UltraEdit在保存文件时也可以指定文件格式：DOS为CRLF，UNIX为LF，MAC为CR

实际上`CR和LF`都是用来表示下一行的，只不过各个操作系统所采用的方式不同而已

```
DOS/Windows：采用CRLF（即回车＋换行）表示下一行
Linux/UNIX ：采用LF表示下一行
MAC        ：采用CR表示下一行
注：CR的ASCII是十进制数的13，十六进制的0x0D，LF则分别为10和0x0A
```

> 多数的计算机语言中，表示字符或者字符串就是：`CR为\r`，`LF为\n`<br>
而各语言的printf()函数中的`\n`则代表的是一个逻辑上的意义，即当前操作系统中的下一行<br>
所以在UNIX上它代表的是LF，而在Windows上则是CRLF

另外，HTTP/1.1协议的RFC2616规范中明确说到：

HTTP/1.1将CRLF的序列定义为任何协议元素的行尾标志，但这个规定对实体主体（endtity-body）除外

实体主体（entity-body）的行尾标志是由其相应的媒体类型定义的

于是，可以粗略理解为上面贴出来的HTTP报文中的`【报文内容】`部分（即HTTP请求的原始报文）

它的每一行都是以`CRLF`结尾的（所以在使用Mina2.x编写HTTP服务器时就可以根据`0x0D和0x0A`来判断了）

## 换行符的历史

下面再引申出来一个关于CRLF的历史，仅供了解

计算机出现之前，是使用电传打字机`(Teletype Model 33)`打印字符的，它每秒可以打10个字符

但在打完一行后，准备换行时发现，换行需要用去`0.2秒`，而这`0.2秒`又正好可以打印两个字符

而如果在这`0.2秒`期间，又有新的字符传过来，那么传过来的这个字符将丢失，因为它正在换行

于是，研制人员为了解决此问题，就决定在每行后面添加两个表示结束的字符：CR、LF

`CR（Carriage Return，回车符）`：告诉打字机把打印头重定位在该行的左边界

`LF（Line Feed，换行符）`：告诉打字机把打印头下移一行，即把纸向下移一行

接着，随着计算机的发明，这种处理机制也就被移到了计算机上

但当时存储器很贵，有些人认为在每行结尾加两个字符太浪费了，应该加一个就行了，于是乎分歧出现了

DOS/Windows系统采用CRLF（即回车＋换行）表示下一行

Linux/UNIX系统采用LF表示下一行

MAC系统采用CR表示下一行

这种分歧导致的直接后果就是：

Windows打开UNIX的文件时，所有的文字都会变成一行（因为Windows只认为CRLF才表示换行）

UNIX打开Windows的文件时，每行结尾会多出一个`^M`符号