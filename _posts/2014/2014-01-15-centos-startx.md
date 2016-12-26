---
layout: post
title: "CentOS安装图形用户界面"
categories: Linux
tags: linux centos
author: 玄玉
excerpt: 主要介绍CentOS-6.4-minimal版中安装图形用户界面的方法。
---

* content
{:toc}


这里指的是`CentOS-6.4-minimal`版系统

安装过程共有三步

1. 安装GNOME桌面环境：`yum groupinstall -y "Desktop"`
2. 安装XWindow：`yum groupinstall -y "X Window System"`
3. 安装中文语言：`yum groupinstall -y "Chinese Support"`

然后就可以执行`startx`命令启动GNOME（若命令执行后没有显示桌面，可以尝试按下**Ctrl+Alt+F2**进入桌面）

若想在下次系统启动后直接进入桌面环境，可以修改`/etc/inittab`文件中的`id:3:initdefault`为`id:5:initdefault`，然后重启系统即可