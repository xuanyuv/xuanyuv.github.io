---
layout: post
title: "Win10ltsc安装"
categories: 工具
tags: win10 ltsc
author: 玄玉
excerpt: 主要介绍Win10-ltsc版安装图解。
published: false
---

* content
{:toc}


## 安装ltsc

新买的 Thinkpad T490 默认是 win10 家庭版系统，这版特别不能忍的就是无征兆性强制更新（不如专业版可以在组策略修改，这版无组策略）

另外发现 Cortana 会常驻后台：打开电脑啥也不干，CPU 利用率始终 30% 多，仔细一看全是 Cortana 占用的，并且耗电量一直显示的红色非常高

网上的各种方法都不能完美卸载 Cortana

既然如此，直接装



1、关闭安全启动（Secure Boot）
2、设置电脑为UEFI启动
3、设置U盘为第一启动项
注：进入BIOS前记得先插上U盘，退出BIOS前记得保存

傲腾内存：https://www.zhihu.com/question/344637683
https://downloadcenter.intel.com/zh-cn/download/29339/





不忘初心精简系统博客
https://www.pc521.net/streamlined-system
【不忘初心】 Win10_LTSC2019 X64 17763.914 五合一 [纯净精简版] 2020.01.01
http://i.pcbeta.com/space-uid-3854607.html
转帖：https://forum.51nb.com/thread-1925686-1-1.html

电脑启动方式：UEFI
磁盘分区方式：GPT
查看当期系统启动方式：运行---msinfo32---BIOS模式若为UEFI表示UEFI启动，若显示为传统则表示Legacy启动
检查磁盘分区方式：桌面此电脑右键---管理---存储---磁盘管理---即将安装系统的磁盘上右键属性---卷选项卡---磁盘分区形式
这就符合UEFI+GPT的安装系统方式




























安装完系统先别联网！！！
安装完系统先别联网！！！
安装完系统先别联网！！！



查看win10内部版本号：运行---winver
关闭文件夹缩略图：任意文件夹菜单栏---查看---最右侧选项---查看选项卡---勾选始终显示图标，从不显示缩略图

关闭Windows Defender
1、运行---gpedit.msc---计算机配置---管理模板---Windows组件---WindowsDefender防病毒程序---双击右侧关闭WindowsDefender防病毒程序---点中已启用---确定即可
2、任务栏右键任务管理器---启动选项卡---右键Windows Security notification icon---禁用即可
3、注销或重启电脑，确保Defender被关掉（重启完，再打开任务管理器，检查进程选项卡下的任务列表）

待测试：运行gpedit.msc计算机配置--管理模板--windows组件--microsoft defender 防病毒--实时保护--配置监视传入和传出文件和程序活动（启用）这里有3个选项，选仅扫描传入文件，然后享受丝滑



激活
可以到网上下载 HWIDGen_62.01_汉化版 压缩包，解压出来得到 HWIDGen_62.01_汉化版.exex，重命名为exe文件
双击执行，在打开的界面右上角工作模式选择KMS38激活，然后点击左下角开始按钮，等待即可
注①：由于LTSC不支持数字权利激活，所以使用KMS38，就是KMS激活到2038年（也和永久激活差不多了）
注②：可以断网激活

关闭索引：运行---services.msc---Windows Search---停止服务并禁用
关闭碎片整理：C盘属性---工具选项卡---优化---更改设置---取消勾选按计划运行---确定

默认管理员身份运行：运行---secpol.msc---本地策略---安全选项---用户帐户控制: 以管理员批准模式运行所有管理员---属性---点中已禁用---确定即可
然后注销电脑，再打开 win+r 就能看到运行小窗口下方显示“使用管理员权限创建此任务”及小盾牌图标






Dism++用法：https://www.bilibili.com/video/BV1X7411974j












































## 配置win10

### 豆沙绿保护色

启动注册表：运行（快捷键Win+R）输入 regedit

```
1、HKEY_CURRENT_USER\Control Panel\Colors\
   双击右侧Windows值，修改其值为199 237 204（或者202 234 206）
2、HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\DefaultColors\Standard\
   双击右侧Windows值，修改其值为caeace（十六进制不变）
```

然后注销或重启电脑，就能看到 txt 或 word 文件背景色变成了淡绿色

### 关闭自动更新

#### 关闭Update

启动注册表：运行（快捷键Win+R）输入 services.msc

找到 Windows Update 服务，右键属性，启动类型改为禁用

接着在恢复选项卡下，将第一次失败、第二次失败、后续失败的操作都改为无操作，同时把下面的重置失败计数改为 0 天

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