---
layout: post
title: "Oracle安装时先决条件检查失败的解决方案"
categories: 数据库
tags: 数据库 oracle
author: 玄玉
excerpt: 主要介绍Oracle11g安装时先决条件检查失败的解决方案。
---

* content
{:toc}


## 安装环境

Win7-64bit专业版，内存6G，硬盘空间足够

Oracle的版本是Oracle Database 11g Release 2 (11.2.0.1.0) for Microsoft Windows (x64)

安装包名称为win64_11gR2_database_1of2.zip、win64_11gR2_database_2of2.zip

## 失败分析

现象是安装包在先决条件检查步骤，报告：未能满足某些最低安装要求。请复查并修复下表中列出的问题，然后重新检查系统。

并在安装界面下方提示：此先决条件将测试系统物理内存总量是否至少为922MB(944128.0KB)，预期值：N/A，实际值：N/A

这是由于操作系统未开启默认共享，导致Oracle无法检查环境的可用性

## 解决方案

开启C盘的默认共享：管理员身份执行`C:/Windows/System32/cmd.exe-->net share c$=c:`

关闭C盘的默认共享：管理员身份执行`C:/Windows/System32/cmd.exe-->net share c$ /delete`

修改完后，退出Oracle，再从头开始重新安装Oracle，即可

![](/img/2013/2013-06-26-oracle-condition-error.png)