---
layout: post
title: "Eclipse配置集锦"
categories: 工具
tags: eclipse myeclipse
author: 玄玉
excerpt: 介绍Eclipse或MyEclipse中的一些常用和好用的配置。
---

* content
{:toc}


## 启动时选择工作空间

启动MyEclipse6.5时，默认会弹出`Select a workspace`对话框

如果我们勾选了`Use this as the default and do not ask again`，下次启动时就不会再弹该对话框了

这时可以修改下面的配置文件，让它启动时弹出来

`D:/Program Files/MyEclipse 6.5/eclipse/configuration/.settings/org.eclipse.ui.ide.prefs`

将第`4`行`SHOW_WORKSPACE_SELECTION_DIALOG`的值由`false`修改为`true`即可

而第`6`行`RECENT_WORKSPACES`是用来设置MyEclipse最近所用到的工作空间的，无需理会

## 移除未使用的类引用

有三种方法，其中第三种是最方便的

* 1、移除某个类中的：在Java类中按键`Ctrl+Shift+O`

* 2、移除整个包中的：`Package Explorer`下右键点击包名，依次选择`Source-->Organize imports`即可

* 3、保存时自动移除：`Windows-->Preferences-->Java-->Editor-->Save Actions`

　　　　　　　　　　　　然后选择`Perform the selected action on save`，再勾选`Organize imports`即可

## SVN插件中英文互相转换

修改`D:\Develop\eclipse\configuration\config.ini`文件，在其尾部添加如下属性即可

```ruby
## Set Subversion English Version
#osgi.nl=en_US
# Set Subversion Chinese Version
osgi.nl=zh_CN
```