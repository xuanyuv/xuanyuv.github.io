---
layout: post
title: "Chrome插件的导出与导入"
categories: 其它
tags: chrome 插件
author: 玄玉
excerpt: 介绍在不连接ChromeWebStore的情况下，导出本机已安装的Extensions为crx文件，以及导入crx到Chrome的方法。
published: false
---

* content
{:toc}


`Chrome`的应用商店只能翻过去才可以访问，所以换了电脑或者重装系统前

可以把已安装的插件导出为`crx`文件，到了新电脑再拿`crx`导入就行了，就不用弄梯子了

## 导出

首先Chrome访问这个地址：`chrome://extensions/`，点击`Developer mode`，并记住插件的版本号及其ID

然后点击`Pack extension...`按钮

在弹出的提示框中，有两个目录需要设置，其中下面的`Private key file (optional)`不用管

我们只设置`Extension root directory`，它是指Chrome插件安装后存放在本地的目录，如下所示

```
C:\Users\Jadyer\AppData\Local\Google\Chrome\User Data\Default\Extensions\cfhdojbkjhnklbpkdaibdccddilifddb\1.12.4_0
```

最后点击`Pack Extension`即可（*注意要把路径选择到具体的版本号文件夹上面*）

导出完毕会弹出提示框，告诉你生成的文件位置，我们只需要里面的`crx`，另外那个`pem`不用管

## 导入

把`crx`文件拖到Chrome里面就可以了

## 示例图片

![](/img/2016-11-09/chrome-extension-01.png)

<br/>

![](/img/2016-11-09/chrome-extension-02.png)

<br/>

![](/img/2016-11-09/chrome-extension-03.png)

<br/>

![](/img/2016-11-09/chrome-extension-04.png)