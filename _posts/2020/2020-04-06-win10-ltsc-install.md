---
layout: post
title: "Win10安装LTSC及配置"
categories: 工具
tags: win10 ltsc
author: 玄玉
excerpt: 主要介绍Win10-ltsc版安装和配置图解。
published: true
---

* content
{:toc}


## 安装LTSC

新入手的 Thinkpad T490 自带正版激活的 office365 和 Win10 家庭版系统，本不想折腾了

后发现 Cortana 常驻后台（打开电脑啥都不干，它一个人就占 30% CPU），并且家庭版也不怎么好，自动更新就麻烦

那就折腾一下吧，直接装 LTSC（江湖人称老坛酸菜，差不多属于 Win10 各版本中最好的）

### 准备工作

1. 一个 8G U 盘（提前格式化）
2. 一个官方镜像文件（MSDN下载 [Windows 10 Enterprise LTSC 2019](https://msdn.itellyou.cn)）
4. 傲腾内存官方驱动（要用到 [SetupRST 和 SetupOptaneMemory](https://downloadcenter.intel.com/zh-cn/download/29339/) 两个文件）
3. 无线网卡官方驱动（我的是 [Intel WiFi6 AX201](https://downloadcenter.intel.com/zh-cn/download/29455?product=130293) 产品，或者到 [联想官网下载](https://think.lenovo.com.cn/support/driver/mainpage.aspx#ThinkPad)）

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

我们给 C 盘 99G 空间，所以 **新建**，输入102093，**应用**，会提示Windows可能要为系统文件创建额外的分区，点击 **确定**

`这一步很重要`，这是实现 UEFI 启动的关键点（它会4K对齐磁盘），点击确定后，系统会花几秒时间计算一下各分区容量

![](https://ae01.alicdn.com/kf/Hc76932085cad432aa6b52eae9bf82f73S.png)

![](https://ae01.alicdn.com/kf/Ha3ac57aeceb24bbbb7b756d97f02da88T.png)

接着会发现：恢复分区、MSR分区、UEFI分区、主分区就自动生产出来了，根本不用我们去计算哪个分区多大容量

图中剩下的 376.9G 未分配空间是故意留着的，等系统装完，后面创建 D 盘的时候要用到

再选中 99.1G（如果正好分配99G，那装完系统进入我的电脑看到C盘大小就是98.9G）的主分区，点击下一步开始安装（约 10 分钟）

安装成功后，会提示 `Windows 需要重启才能继续，将在 10 秒后重启`，出现这个界面时，不要等他读完秒，直接拔 U 盘！！！

然后电脑会自动重启多次，直至看见 **海内存知己，天涯若比邻。**（感觉是天涯社区的宣传语），就到了个性化设置引导界面了

这里面只需要注意，到了 **让我们为你连接到网络** 这一步时，直接跳过（没必要现在就连）

剩下的就是一路 Next，最后就看到熟悉的 Win10 桌面了

## 配置系统

装完系统，先别联网！！！

装完系统，先别联网！！！

装完系统，先别联网！！！

按照文章顺序，一步一步配置就行

### 检查4K对齐

运行---msinfo32---左侧组件---存储---磁盘，将右侧所有**分区起始偏移**，每个值去除4096，得到的结果是整数表示4K对齐，小数则没对齐

其实，现在的系统都支持4K对齐，也就是说我们装完系统后，就已经默认4K对齐了

在上面的步骤中，`硬盘所有分区全部删除，形成一个未分配的空间` 的时候，系统就已经把磁盘4K对齐了

然后再分配一下 D 盘：运行compmgmt.msc---磁盘管理---未分配的分区上右键---新建简单卷---卷大小默认全满（就是上面预留的376.9G）

注：新建简单卷过程中，卷标名若清空，那么最终我的电脑里显示出来的盘符名称就是常见的：本地磁盘 (D:)

### 激活系统

这里使用大小为863KB的 **HWIDGen_62.01_汉化版.exe**（注意：它在激活时，不需要联网！不需要联网！！不需要联网！！！）

打开 HWIDGen，右上角工作模式选择 **KMS38激活**（也就是激活到2038年），然后点左下角开始按钮，等待一分钟左右，激活成功

![](https://ae01.alicdn.com/kf/Hcfdebb217f4b4d0e98097d70700d7199c.png)

查看激活结果：运行---slmgr.vbs -xpr（就会弹出上面的对话框）

查看激活状态：运行---slmgr.vbs -dlv

查看内部版本：运行---winver

### 配置傲腾

买电脑时，自带了 32G 傲腾，它和电脑的固态硬盘组成 Raid0（如果你们的没带，这一步就跳过）

现在重做系统了，显然傲腾内存是无法识别的（在我的电脑里面会看到一块独立的硬盘，大小显示为 27.2G）

我们要做的就是，安装傲腾内存驱动，然后在驱动管理界面启用它，就行了

装驱动时，我先装的 SetupOptaneMemory，然后打开其管理程序，发现显示：没有兼容英特尔傲腾内存的磁盘

这时，我是这样解决的：

1. 卸载 SetupOptaneMemory，重启
2. 安装 SetupRST，重启
3. 卸载 SetupRST，重启
4. 安装 SetupOptaneMemory，重启
5. 打开 SetupOptaneMemory 驱动管理界面，启用傲腾，重启

这样，Raid0 就组成了，可以结合下面这两张图片来验证效果

![](https://ae01.alicdn.com/kf/Hee7009dc09bb4afd87e06caef51909aaH.png)

![](https://ae01.alicdn.com/kf/H0da493e6d2d644f6a358f6429bc974893.png)

### 关闭WD

1. 运行gpedit.msc---计算机配置---管理模板---Windows组件---WindowsDefender防病毒程序---关闭WD防病毒程序---启用
2. 任务栏右键任务管理器---启动选项卡---右键 Windows Security notification icon---禁用
3. 注销或重启电脑，确保 Defender 被关掉（重启完，再打开任务管理器，检查进程选项卡下的任务列表）

另外，补充下配置 WindowsDefender 只监视传入文件的方法

运行gpedit.msc---计算机配置---管理模板---Windows组件---WD防病毒程序---实时保护---置监视传入和传出文件和程序活动---启用

### 关闭自动更新

![](https://ae01.alicdn.com/kf/Hd332ea5bb18c419b82ca59804e5e88ebU.png)

1. 运行gpedit.msc---计算机配置---管理模板---Windows组件---Windows更新---指定 Intranet Microsoft 更新服务位置---启用
　　<br/>然后在下面的三个输入框（Intranet更新、统计、备用下载服务地址）均填入 127.0.0.1，如上图所示
2. 运行gpedit.msc---计算机配置---管理模板---Windows组件---Windows更新---配置自动更新---禁用
3. 运行compmgmt.msc---系统工具---任务计划程序---任务计划程序库---Microsoft---Windows---WindowsUpdate---禁用所有任务
　　<br/>再找到UpdateOrchestrator，同样禁用它的所有任务（不过失败了，提示：你所使用的用户账户没有禁用此任务的权限，于是作罢）
4. 运行services.msc---Windows Update---停止并禁用---右键属性恢复选项卡---三次失败下拉框均改为无操作
5. 运行services.msc---Windows Update Medic Service---这里禁用时会提示拒绝访问，那改它的注册表就行了
　　<br/>HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\WaaSMedicSvc
　　<br/>双击右侧Start值，修改其值为4（十六进制不变）（原值为3，表示手动）
　　<br/>双击右侧FailureActions值，修改它的二进制数据：将0010、0018行的左起第5个数值由原来的01改为00
　　<br/>补充：该服务是Win10升级到1809版后新增的，作为Windows Update服务的保镖，它开机会自动运行Windows Update服务

下面补充一下网上的其它方法（有的很暴力，但还是不如巨硬暴力），**由于未亲自验证最终效果，故仅供参考**

1. 运行services.msc---Update Orchestrator Service---停止并禁用---右键属性恢复选项卡---三次失败下拉框均改为无操作
　　<br/>专业版发现：停止服务后，左下角开始菜单，设置，Windows更新面板，还是能更新，再回到服务面板发现它又自动启动了
　　<br/>LTSC版发现：停止服务后，到Windows更新面板去看，显示的是一片空白且有卡顿现象，然后再启动这个服务，又没有空白了
2. 卸载掉应用程序列表（不是已安装更新里面）里的KB4023057补丁，它负责的是系统更新，会偷偷打开WindowsUpdate服务
3. 底层入手，斩草除根，直接干掉负责系统更新服务的系统文件C:\Windows\System32\wuaueng.dll

### 关闭自动驱动

Win10 有个特点：自动扫描硬件，并安装相应的驱动

不过自动装的驱动可能不是最新的，还是提前到品牌电脑或硬件官网下载驱动，等激活完系统后，自己装驱动

按理来说，上面已经关了自动更新，它就不会扫描硬件安装驱动了，不过保险起见，还是手动关闭自动装驱动的功能吧

1. 此电脑---右键属性---高级系统设置---硬件--设备安装设置---否
2. 运行gpedit.msc---计算机配置---管理模板---Windows组件---Windows更新---Windows 更新不包括驱动程序---已启用
3. 运行gpedit.msc---计算机配置---管理模板---系统---设备安装---设备安装限制---禁止安装未由其他策略设置描述的设备---已启用

另外，也可设置针对某个硬件不自动驱动，同样在设备安装限制下面，选择阻止使用与下列设备安装程序类相匹配的驱动程序安装设备

更改为已启用，然后点击下面的【显示】按钮，输入设备的GUID值，确定后再勾选也适用于匹配已安装的设备

找设备的GUID值：运行compmgmt.msc---设备管理器---展开某设备---属性---详细信息选项卡---属性下拉框选择类Guid，右键复制显示的值

### 关闭索引服务

运行services.msc---Windows Search---停止服务并禁用

### 关闭碎片整理

C 盘右键属性---工具选项卡---优化---更改设置---取消勾选按计划运行---确定

### 关闭文件夹缩略图

任意文件夹菜单栏---查看---最右侧选项---查看选项卡---勾选始终显示图标，从不显示缩略图

### 关闭快捷方式小箭头

启动注册表：运行---regedit

1. HKEY_CLASSES_ROOT\lnkfile\，删掉右侧的 isShortcut 字符串值
2. HKEY_CLASSES_ROOT\piffile\，删掉右侧的 isShortcut 字符串值

删完注册表，小箭头也没了，但我们发现 Win10 下会导致电脑右键管理，弹出对话框：该文件没有与之关联的应用来执行该操作......

即便如此，我们还是可以通过：运行---compmgmt.msc 来打开计算机管理面板

### 找回Windows照片查看器

将以下内容另存为 reg 文件，双击导入注册表即可

你也可以根据需要，按同样的格式增减其中的图片格式代码，一般来说下面这些就够用了

```
Windows Registry Editor Version 5.00
; Change Extension's File Type
[HKEY_CURRENT_USER\Software\Classes\.jpg]
@="PhotoViewer.FileAssoc.Tiff"

; Change Extension's File Type
[HKEY_CURRENT_USER\Software\Classes\.jpeg]
@="PhotoViewer.FileAssoc.Tiff"

; Change Extension's File Type
[HKEY_CURRENT_USER\Software\Classes\.gif]
@="PhotoViewer.FileAssoc.Tiff"

; Change Extension's File Type
[HKEY_CURRENT_USER\Software\Classes\.png]
@="PhotoViewer.FileAssoc.Tiff"

; Change Extension's File Type
[HKEY_CURRENT_USER\Software\Classes\.bmp]
@="PhotoViewer.FileAssoc.Tiff"

; Change Extension's File Type
[HKEY_CURRENT_USER\Software\Classes\.tiff]
@="PhotoViewer.FileAssoc.Tiff"

; Change Extension's File Type
[HKEY_CURRENT_USER\Software\Classes\.ico]
@="PhotoViewer.FileAssoc.Tiff"
```

### 豆沙绿保护色

启动注册表：运行---regedit

1. HKEY_CURRENT_USER\Control Panel\Colors
　　<br/>双击右侧Windows值，修改其值为202 234 206
2. HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\DefaultColors\Standard
　　<br/>双击右侧Windows值，修改其值为caeace（十六进制不变）

然后注销或重启电脑，就能看到 txt 或 word 文件背景色变成了淡绿色

### 安装驱动

没啥说的，咔咔咔一顿安装一顿重启，就是了

重启之后，就可以联网了：世界那么大，去网上看看

### 补充

1. 至于其它的优化工具，软媒魔方是一个选择，另外就是网上呼声最高的 Dism++
2. 有兴趣根据 MSDN 母盘精简系统组件，并初始化系统配置，再封装成 iso 的，可以尝试 NTLite