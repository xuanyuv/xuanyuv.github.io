---
layout: post
title: "Win10安装LTSC及配置"
categories: 工具
tags: win10 ltsc
author: 玄玉
excerpt: 主要介绍Win10-ltsc版安装和配置图解。
published: false
---

* content
{:toc}


## 安装LTSC

新入手的 Thinkpad T490 自带正版激活的 office365 和 Win10 家庭版系统，本不想折腾了

后发现 Cortana 常驻后台（打开电脑啥都不干，它一个人就占 30% CPU），并且家庭版也不怎么好，自动更新就麻烦

那就折腾一下吧，直接装 LTSC：**江湖人称老坛酸菜，这是 Win10 各版本中最好的，不接受任何反驳**

### 准备工作

1. 8G U 盘（提前格式化）
3. 无线网卡官方驱动（我的是 [Intel WiFi6 AX201](https://downloadcenter.intel.com/zh-cn/download/29455?product=130293) 产品）
4. 傲腾内存官方驱动（要用到 [SetupRST 和 SetupOptaneMemory](https://downloadcenter.intel.com/zh-cn/download/29339/) 两个文件）
2. 官方系统镜像文件（MSDN下载操作系统列表下的 [Windows 10 Enterprise LTSC 2019](https://msdn.itellyou.cn)）

关于系统版本，这里可以看到官方的版本历史：<https://docs.microsoft.com/zh-cn/windows/release-information>

另外，如果追求 LTSC 上还要精简的系统，不妨试试 [远景论坛不忘初心](http://bbs.pcbeta.com/viewthread-1803552-1-1.html) 的作品，口碑很好，不比其它版主的作品差

若无权限浏览论坛，也可看他博客上的文章：[Win10 LTSC2019 X64 17763.914 五合一 [纯净精简版] 2020.01.01](https://www.pc521.net/streamlined-system/bwcx-ltsc2019-lit.html)，内容是一样的

### 制作U盘引导盘

虽然UltraISO软碟通也可以，但还是推荐更小巧更好用的 [Rufus](http://rufus.ie/)，我们用 Portable 版就够了

![](https://ae01.alicdn.com/kf/Hd187ae04185d4c63bdbced1ded308b9ae.png)

注意：点击开始时会弹出对话框，告诉你会擦除 U 盘现有数据，点击确定就开始写入了，接下来就是漫长的等待

**关于截图上面的分区类型和目标系统类型，这里补充一下**

以往都是 Legacy+MBR 的方式启动，对于 Win10 就一定要用 UEFI+GPT，不然没意义（二者区别问度娘）

查看系统启动方式：运行---msinfo32---系统摘要右侧---BIOS模式若为UEFI表示UEFI启动，若显示为传统则表示Legacy启动

查看磁盘分区方式：运行---compmgmt.msc---存储---磁盘管理---右侧下方头部的磁盘**0**磁盘**1**---右键属性---卷选项卡

**通过以上两种方式，确保系统安装前的状态是 UEFI+GPT**

### 装系统

插上 U 盘，重启电脑进 BIOS（T490 快捷键是 F12），鼠标单击 USB HDD: Teclast CoolFlash，这时会自动重启并进入安装界面

![](https://ae01.alicdn.com/kf/H9de0a614ba4c491098280382cc343b6eX.png)

1. 安装过程中，如果有一步让输入秘钥，那就点 **我没有产品秘钥** 进入下一步
2. 到了执行那种类型的安装这一步，一定要选第二个：**自定义：仅安装 Windows (高级)**
3. 然后就到了选择系统安装的分区这一步，`这里把硬盘所有分区全部删除，形成一个未分配的空间`

512G 的硬盘最终会显示一个 476.9G 的未分配空间（注意是把所有驱动器都删除，包括MSR、动态分区、恢复分区等等）

![](https://ae01.alicdn.com/kf/H4aad1cea59ba42a68ad26bab9c386337c.png)

这是网上的一张图片，上面说的最终效果和它是一样的

这里给 C 盘 99G 空间，所以 **新建**，输入102093，**应用**，会提示Windows可能要为系统文件创建额外的分区，点击 **确定**

`这一步很重要`，这是实现 UEFI 启动的重要选择，点击确定后，系统会花几秒时间计算一下各分区容量

![](https://ae01.alicdn.com/kf/Hc76932085cad432aa6b52eae9bf82f73S.png)

![](https://ae01.alicdn.com/kf/Ha3ac57aeceb24bbbb7b756d97f02da88T.png)

接着我们会发现：恢复分区、MSR分区、UEFI分区、主分区就自动生产出来了，根本不用我们去计算哪个分区多大容量

图中剩下的 376.9G 未分配空间是故意留着的，等系统装完，后面创建 D 盘的时候要用到

再选中 99.1G（如果正好分配99G，那装完系统进入我的电脑看到C盘大小就是98.9G）的主分区，点击下一步开始安装（约 10 分钟）

安装成功后，会提示 `Windows 需要重启才能继续，将在 10 秒后重启`，出现这个界面时，不要等他读完秒，直接拔 U 盘就行

然后电脑会自动重启多次，直至看见 **海内存知己，天涯若比邻。**（感觉是天涯社区的宣传语），就到了个性化设置引导界面了

这里面只需要注意，到了 **让我们为你连接到网络** 这一步时，直接跳过就行了（没必要现在就连）

剩下的就是一路下一步，最后就看到熟悉的 Win10 桌面了

## 配置系统

装完系统，先别联网！！！

装完系统，先别联网！！！

装完系统，先别联网！！！

按照文章顺序，一步一步配置就行

### 检查4K对齐

运行---msinfo32---左侧组件---存储---磁盘，将右侧所有**分区起始偏移**，每个值去除4096，得到的结果是整数表示4K对齐，小数则没对齐

其实，现在的系统都支持4K对齐，也就是说我们装完系统后，就已经默认4K对齐了

在上面装系统的步骤中，`硬盘所有分区全部删除，形成一个未分配的空间` 的时候，系统就已经把磁盘4K对齐了

### 配置傲腾

买电脑时，自带了傲腾32G，它和本身的固态硬盘组建成 raid0，效果是这样的

![](https://ae01.alicdn.com/kf/Hee7009dc09bb4afd87e06caef51909aaH.png)

![](https://ae01.alicdn.com/kf/H975e6b07d84140429a0e0c1da1b3616da.png)

现在重做系统后，显然傲腾内存是无法识别的（在我的电脑里面会看到一块独立的硬盘，大小显示为 27.2G）

我们要做的就是，安装傲腾驱动，然后在驱动管理界面启用它，这样就会和固态硬盘组建 radi0 了

装驱动时，我先装的 SetupOptaneMemory，然后打开其管理程序，发现显示：没有兼容英特尔傲腾内存的磁盘

这个时候，我是这样解决的：

1. 卸载 SetupOptaneMemory，重启
2. 安装 SetupRST，重启
3. 卸载 SetupRST，重启
4. 安装 SetupOptaneMemory，重启
5. 打开 SetupOptaneMemory 驱动管理界面，启用傲腾，重启

这样，raid0 就组建成功了（可以按照上面两张图片显示效果，验证一下）

### 关闭WD

1. 运行---gpedit.msc---计算机配置---管理模板---Windows组件---WindowsDefender防病毒程序---双击右侧关闭WD防病毒程序---点中已启用---确定
2. 任务栏右键任务管理器---启动选项卡---右键 Windows Security notification icon---禁用
3. 注销或重启电脑，确保 Defender 被关掉（重启完，再打开任务管理器，检查进程选项卡下的任务列表）

另外，补充下配置 WindowsDefender 只监视传入文件的方法

运行---gpedit.msc---计算机配置---管理模板---Windows组件---WD防病毒程序---实时保护---双击右侧配置监视传入和传出文件和程序活动---点中已启用---确定

### 关闭索引

运行---services.msc---Windows Search---停止服务并禁用

### 关闭碎片整理

C 盘---右键属性---工具选项卡---优化---更改设置---取消勾选按计划运行---确定

### 关闭文件夹缩略图

任意文件夹菜单栏---查看---最右侧选项---查看选项卡---勾选始终显示图标，从不显示缩略图

### 关闭快捷方式小箭头

虽然修改注册表的方式，可以关闭

但是 Win10 下发现，这会导致此电脑，右键管理，弹出对话框：报告没有与之关联的应用程序balabala

### 豆沙绿保护色

启动注册表：运行---regedit

```
1、HKEY_CURRENT_USER\Control Panel\Colors\
   双击右侧Windows值，修改其值为202 234 206
2、HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\DefaultColors\Standard\
   双击右侧Windows值，修改其值为caeace（十六进制不变）
```

然后注销或重启电脑，就能看到 txt 或 word 文件背景色变成了淡绿色

### 激活系统

这里使用的激活工具是 HWIDGen_62.01_汉化版.exe，文件大小为 863KB

注意：HWIDGen 在激活系统时，不需要联网！！！不需要联网！！！不需要联网！！！

打开 HWIDGen_62.01_汉化版.exe，右上角工作模式选择 **KMS38激活**（也就是激活到2038年）

然后点击左下角开始按钮，接着等待一分钟左右，激活成功

![](https://ae01.alicdn.com/kf/Hcfdebb217f4b4d0e98097d70700d7199c.png)

查看激活结果：运行---slmgr.vbs -xpr（就会弹出上面的对话框）

查看激活状态：运行---slmgr.vbs -dlv

查看内部版本：运行---winver

### 关闭自动更新

网上一大堆方法，在服务面板里改，在注册表里改，在组策略里改，有的还是会失败，还是会更新

这里贴一个新颖的方法，也是组策略

运行---gpedit.msc---计算机配置---管理模板---Windows组件---Windows更新---双击右侧指定 Intranet Microsoft 更新服务位置

设置为已启用，然后在下面的三个输入框（Intranet更新、统计、备用下载服务地址）均填入 127.0.0.1

![](https://ae01.alicdn.com/kf/Hd332ea5bb18c419b82ca59804e5e88ebU.png)

下面还是贴一下网上的方法吧，如下所示

#### 关闭Update

启动注册表：运行（快捷键Win+R）输入 services.msc

找到 Windows Update 服务，右键属性，启动类型改为禁用

接着在恢复选项卡下，将第一次失败、第二次失败、后续失败的操作都改为无操作

#### 关闭UpdateMedicService

Win10 升级到 1809 版后，多了一个 `Windows Update Medic Service` 服务，它是 `Windows Update` 服务的保镖

它开机会自动运行 windows update 服务，且该服务无法禁用，从而造成之前禁用 Win10 更新的方法全部失效

而在服务面板（services.msc）中是无法禁用它的，会提示 **拒绝访问**。对于它，我们可以通过注册表来禁用

```
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\WaaSMedicSvc\
双击右侧Start值，修改其值为4（十六进制不变）（原值为3，表示手动）
双击右侧FailureActions值，修改它的二进制数据：将0010、0018行的左起第5个数值由原来的01改为00
```

然后关闭注册表，再重新打开服务面板（services.msc），就看到已禁用以及三个无操作了

### 补充

至于其它的一些优化，软媒魔方也是一个选择，官网地址：<https://mofang.ruanmei.com/>

另外，网上呼声较高的还有 Dism++，B 站有它的一个优化实战视频：<https://www.bilibili.com/video/BV1X7411974j>