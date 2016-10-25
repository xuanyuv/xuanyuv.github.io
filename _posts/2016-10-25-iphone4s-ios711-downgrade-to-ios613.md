---
layout: post
title: "iPhone4S从ios711降级到ios613"
categories: iPhone
tags: iPhone4S ios613 降级
author: 玄玉
excerpt: 详细介绍了iPhone4S机型操作系统从ios711，降级到乔布斯经典，未越狱的，具有情怀的拟物图标的ios613的方法。
---

* content
{:toc}


我的是`iPhone4S`，`2013`年买的联通合约机，型号为`A1431`，操作系统为`ios7.1.1(11D201)未越狱`

**下文介绍的步骤，仅限上述配置**

其内容搜集并整理自[威锋论坛](http://bbs.feng.com/thread-htm-fid-385.html)，特此鸣谢！

注意：对于其它机型和系统，理论上只要能越狱，在这个时间点上（2016-10-22）都能降级到613

## 越狱并安装插件

可以使用`太极越狱`（普遍推荐）或者`盘古越狱`

`盘古越狱`可能导致降级过程中一定几率失败：最后一步执行命令后，卡在`Sending iBEC (279576 bytes)...`

![](/img/2016-10-25/iphone4s-to-ios613-01.png)

这时有两个解决办法

* 1、太极越狱重新越一次

* 2、更新`Pangu 7.1.X Unthether`插件后再重新降级

上面说的是越狱，那么，就是安装插件`openSSH`和`Core Utilities`

**注意：**不是`Core Utilities (/bin)`，二者不是同一个软件

我当时用的是盘古，越狱后在Cydia里直接能搜索到，若搜不到可以先添加源`http://apt.178.com`

另外，如果安装`openSSH`报错，可以多试几次直到安装上为止

![](/img/2016-10-25/iphone4s-to-ios613-02.png)

![](/img/2016-10-25/iphone4s-to-ios613-03.png)

## 准备文件

* 1、kloader（50.8KB）

* 2、pwnediBSS（72.0KB）

* 3、Win32OpenSSL-1_0_2c.exe（20.5MB，安装到电脑上）

* 4、winscp5.7.3.5438setup.1432114150.exe（5.46MB，也可到其官网下载最新版，安装到电脑上）

* 5、idevicerestore for Windows（1.77G，建议把该文件夹放到盘符根目录，我当时放到了`C盘`根目录）

* 6、iTunes（安装到电脑上，若已安装，则不用重新安装）

    > 到这一步，强烈建议先把手机和电脑连上，打开iTunes，让它识别到iPhone4S。目的是为了安装苹果驱动，这样在下面的`进入DFU模式`时有很大帮助。我当时就没有提前装这个驱动（也就是iTunes不能识别iPhone4S），导致`进入DFU模式`失败。

## 传输文件

1、先用USB连接iPhone4S和电脑，再让它们连接同一个WiFi（这样它们才会在一个局域网）

　　然后打开手机`设置--->无线局域网--->找到连接的WiFi`，查看信息找到手机IP（本文假设10.0.0.66）

![](/img/2016-10-25/iphone4s-to-ios613-04.png)

2、打开WinSCP，文件协议选择`SCP`，主机名填手机IP，用户名为`root`，密码默认为`alpine`，点击**登录**

　　如果弹出对话框**警告 - 潜在的安全问题**，继续点弹窗上面的**登录**（有的版本也叫**更新**）按钮

![](/img/2016-10-25/iphone4s-to-ios613-05.png)

![](/img/2016-10-25/iphone4s-to-ios613-06.png)

3、将上面的`kloader`和`pwnediBSS`文件拖到WinSCP显示的手机窗口

　然后选中右侧右窗口中的这两个文件，右键选择属性，将属性里的`w r x`全部打勾，点击确认。

![](/img/2016-10-25/iphone4s-to-ios613-07.png)

![](/img/2016-10-25/iphone4s-to-ios613-08.png)

![](/img/2016-10-25/iphone4s-to-ios613-09.png)

## 进入DFU模式

接着上一步，`Ctrl+T`打开终端（也可以直接点击黑色的小图标打开）

输入`chmod +x kloader`并点击执行

再输入`./kloader pwnediBSS`也点击执行，**此时iPhone4S会自动黑屏**

同时WinSCP会弹出提醒窗口，告诉你手机没有响应通信，直接点击`中止(A)`即可

![](/img/2016-10-25/iphone4s-to-ios613-10.png)

![](/img/2016-10-25/iphone4s-to-ios613-11.png)

![](/img/2016-10-25/iphone4s-to-ios613-12.png)

到了这步，正常情况就进入了DFU模式（前提是已装苹果驱动，上文有提及），若进入失败可尝试下面的方法

 * 手动进入DFU模式

    > 1、保持iPhone4S处于开机模式或恢复模式，插入数据线（不要使用USB延长线，不要插到前置USB端口）<br/>
2、按下`HOME键`不要松开，再按下`开机键`不要松开，直到iPhone4S屏幕熄灭，再过**4**秒左右，松开开机键，但不要松开HOME键，直到软件提**“成功”**字样再松开HOME键

## 降级

打开命令提示符，依次执行以下命令，然后就会出现刷机界面

等待四五分钟就可以看到激活iPhone的界面了，此时降级成功！

```
cd \
cd idevicerestore for Windows
idevicerestore.exe -e fistmedaddy.ipsw
```

![](/img/2016-10-25/iphone4s-to-ios613-13.png)

![](/img/2016-10-25/iphone4s-to-ios613-14.png)