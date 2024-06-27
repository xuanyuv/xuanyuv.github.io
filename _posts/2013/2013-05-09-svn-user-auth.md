---
layout: post
title: "SVN访问用户变更的方法"
categories: 工具
tags: eclipse svn git
author: 玄玉
excerpt: 介绍SVN或者Eclipse集成的SVN中，修改访问用户密码等信息的方法。
---

* content
{:toc}


第一次登录SVN后，SVN会将用户登录信息保存在SVN所控制的`auth`文件夹中

所以，只要删除auth文件夹，下次访问SVN时，就会提示我们输入用户名和密码了

auth文件夹的存放位置如下

```ruby
#Win7
C:\Users\xuanyu\AppData\Roaming\Subversion\auth
#WinXP
C:\Documents and Settings\xuanyu\Application Data\Subversion\auth
```

不过，如果你安装了`TortoiseSVN`就更好办了，执行以下操作即可

`桌面-->右键-->TortoiseSVN-->Settings-->Saved Data-->Authentication data-->Clear`