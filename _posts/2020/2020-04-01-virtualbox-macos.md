---
layout: post
title: "VirtualBox安装MacOS-10.11.6"
categories: 工具
tags: virtualbox mac macos eicapitan
author: 玄玉
excerpt: 详细介绍了在虚拟机VirtualBox里面安装Mac OS 10.11.6 EI Capitan的过程。
published: true
---

* content
{:toc}


## 软件版本

VirtualBox-5.2.20

OS X 10.11 El Capitan GM by TechReviews.vmdk（我的百度网盘里面有，这是10.11版，安装完成后再拿官方升级包升至10.11.6）

## 安装过程

### 创建虚拟机

![](https://ae01.alicdn.com/kf/Hc1e6a752e6e648dcaff4cba31962f19am.png)

* 我的电脑是 Win10-64bit 8G 内存，这里给了它 4G
* 我的 vmdk 放在 D:\Develop\Oracle\VirtualBox\JadyerData\vmdk\ 目录下，**以后不要改位置，就一直放在这里**
* 虚拟机属性：启动顺序里面取消 软驱 勾选
* 虚拟机属性：处理器数量我设置了 2（我的电脑是 4 核的）
* 虚拟机属性：显存大小设置最大（我这里是 128MB）

除了上面的几处，其它地方都不用改

接下来关闭 VirtualBox

### 配置虚拟机

以管理员身份打开命令提示符（cmd），输入以下命令

注意：**MacOS-10.11** 是你在 VirtualBox 里面创建的虚拟机名称

```
cd "D:\Develop\Oracle\VirtualBox\"
VBoxManage.exe modifyvm MacOS-10.11 --cpuidset 00000001 000106e5 00100800 0098e3fd bfebfbff
VBoxManage setextradata MacOS-10.11 "VBoxInternal/Devices/efi/0/Config/DmiSystemProduct" "iMac11,3"
VBoxManage setextradata MacOS-10.11 "VBoxInternal/Devices/efi/0/Config/DmiSystemVersion" "1.0"
VBoxManage setextradata MacOS-10.11 "VBoxInternal/Devices/efi/0/Config/DmiBoardProduct" "Iloveapple"
VBoxManage setextradata MacOS-10.11 "VBoxInternal/Devices/smc/0/Config/DeviceKey" "ourhardworkbythesewordsguardedpleasedontsteal(c)AppleComputerInc"
VBoxManage setextradata MacOS-10.11 "VBoxInternal/Devices/smc/0/Config/GetKeyFromRealSMC" 1
```

![](https://ae01.alicdn.com/kf/H3b705a36ca564846b54eb0baf0a824det.png)

然后关闭命令行即可

### 启动虚拟机

重新打开 VirtualBox，启动之前创建的【MacOS-10.11】

这时苹果会初始化一些东西，大约一分钟（如果报错，说明配置虚拟机时的命令输错了）

过一会就会看到苹果系统的引导界面了，一步步设置就好了

说明：下面截图中的日期2018-11-13，实际是第一次安装时截的图，后面编辑文章就拿来用了

![](https://ae01.alicdn.com/kf/H7bad2c45cde34b09a2aa31b0205ac055E.png)

![](https://ae01.alicdn.com/kf/Hda3ad2577c0c485daf3bc5b1b3a50e7dS.png)

![](https://ae01.alicdn.com/kf/H8da8134e393d4fed88a2ca76901a6768C.png)

* 语言选择：勾选 Show All 之后才会看见 China
* 键盘选择：简体中文，拼音模式
* 导入其它电脑信息：不需要
* 定位服务：不需要
* 登录AppleID：不登录（试过输入账号密码去登录，结果半天连不上）
* 同意OSX协议：同意
* 创建操作系统账户
* 设置时区：Huaibei - China
* 发送统计信息给苹果：不发送

接下来就是自动初始化系统了，等了一会就看到熟悉的桌面啦

我们看看开发时最常用的终端界面

![](https://ae01.alicdn.com/kf/H7ce84293628941e08b3e81f520bdd5efq.png)

### 升级稳定版

10.11 系列最稳定的就是 10.11.6 版本，所以我们要通过 Combo Update 升上去

下载地址：[https://www.applex.net/pages/macos/](https://www.applex.net/pages/macos/)

另补充 MacOS 各版本对应的版本号：[https://support.apple.com/zh-cn/HT201260](https://support.apple.com/zh-cn/HT201260)

![](https://ae01.alicdn.com/kf/Hee107905e16642a39f22312d9ec481d6Z.png)

![](https://ae01.alicdn.com/kf/Heb82f15df836435c91811b7347e978cfT.png)

![](https://ae01.alicdn.com/kf/Hcd539927a712483d8a957de544a0163dU.png)