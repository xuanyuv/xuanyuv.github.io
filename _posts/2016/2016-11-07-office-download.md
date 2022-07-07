---
layout: post
title: "Office版本划分及下载地址"
categories: 工具
tags: office download retail vol
author: 玄玉
excerpt: 介绍Office镜像下载地址，以及它那复杂的版本划分情况。
---

* content
{:toc}


大约在2015年09月21号左右吧，微软发布了Office2016，下面简单介绍一下Office的版本划分

Office本身分为：家庭和学生版、小型企业版、专业版、Office365家庭高级版

而这些版本中，又分为：`大客户批量授权版（VOL）` 以及 `零售版（RETAIL）`

## Vol和Retail

### 二者的区别

* 功能：完全相同
* 安装：Vol安装时可以选择安装路径和自定义组件，Retail则不能（它会自动安装到 C 盘）<br/>
　　　Retail安装时不会弹出安装界面，而是在任务栏右下角已运行程序处，出现有一个橙色图标，单击会显示正在安装
* 授权：Vol可以使用 **KMS** 服务器或 **MAK** 密钥永久激活，Retail则不适用于KMS（可以使用邮件或电话激活）<br/>
　　　相对而言，Vol更容易激活一些
* 发售：平时在商店买的Office安装光盘的版本，其实就是Retail，而Vol则不是（且其只有Professional版本）<br/>
　　　Vol 又称 **Windows Installer 版本**，Retail 又称 **即点即用版本**<br/>
　　　Vol 安装包中，setup.exe 文件只有一个，而且和其他安装用文件在一个目录中<br/>
　　　Retail 安装包中只有三个文件：setup.exe、autorun.inf、office文件夹（里面有 setup32.exe 和 setup64.exe）
* 镜像：Vol的文件名一般以这个打头：SW_DVD5_Office_Professional_Plus_2016<br/>
　　　Retail文件名一般以这个打头：cn_office_professional_plus_2016<br/>
　　　比如office2016的Vol是：SW_DVD5_Office_Professional_Plus_2016_64Bit_ChnSimp_MLF_X20-42426.ISO<br/>
　　　而它的Retail版本则是：cn_office_professional_plus_2016_x86_x64_dvd_6969182.iso<br/>
　　　之所以Retail版的容量要大些，是因为它同时包含了 32bit 和 64bit 的安装文件

### 二者的冲突

在一台电脑上，二者是不能共存的

比如下面的就是：电脑本身安装了即点即用版本的office，再安装Installer版的visio时，报告的提示

这时要么彻底卸载原office，要么安装即点即用版本的Visio

```
很抱歉，Microsoft Office 安装程序遇到问题，因为你的计算机安装了这些基于即点即用安装程序的 Office 程序:

    Microsoft Office Professional Plus 2019 - zh-cn
    Microsoft Office Professional Plus 2019 - en-us

对于此版本，Windows Installer 和即点即用版本的 Office 程序不能并行，因此一次只能安装一种类型。请尝试改为安装即点即用版本的 Office，或者卸载其他基于即点即用的 Office 程序，然后再次尝试此安装。
```

## 下载地址

下面列出的是Vol版的中文安装包下载地址

```
版本：Office 2016 Pro Plus 64位
文件名：SW_DVD5_Office_Professional_Plus_2016_64Bit_ChnSimp_MLF_X20-42426.ISO
文件大小： 1123452928 字节
MD5: 60DC8B1892F611E41140DD3631F39793
SHA1: AEB58DE1BC97685F8BC6BFB0A614A8EF6903E318
CRC32: 8D8AC6D1
下载地址：ed2k://|file|SW_DVD5_Office_Professional_Plus_2016_64Bit_ChnSimp_MLF_X20-42426.ISO|1123452928|31087A00FF67D4F5B4CBF4AA07C3433B|/
```

```
版本：Office 2016 Project 专业版 64位版
文件名：SW_DVD5_Project_Pro_2016_64Bit_ChnSimp_MLF_X20-42676.ISO
文件大小：647157760 字节
MD5: B872E55B8F4A8791D65BCF1DB46D1DCB
SHA1: 3C180FDAF91DBD0CB767BD040B42B0599FC53438
CRC32: 6AB6A570
下载地址：ed2k://|file|SW_DVD5_Project_Pro_2016_64Bit_ChnSimp_MLF_X20-42676.ISO|647157760|0BBBF20CA3A5F61A819586ADCE6E4DCB|/
```

```
版本：Office 2016 Visio 专业版 64位版
文件名：SW_DVD5_Visio_Pro_2016_64Bit_ChnSimp_MLF_X20-42759.ISO
文件大小：714913792 字节
MD5: 93BEB874F5A5870D5854519856047103
SHA1: 71E082174812F748AB1A70CA33E6004E1E1AACA8
CRC32: F813794B
下载地址：ed2k://|file|SW_DVD5_Visio_Pro_2016_64Bit_ChnSimp_MLF_X20-42759.ISO|714913792|FC930AB97B366B3595FC2F28ABAC2A6F|/
```

下面列出的是Retail版的中文安装包下载地址（取自 [MSDN](https://msdn.itellyou.cn/)）

```
文件名：cn_visio_professional_2016_x86_x64_dvd_6970929.iso
　SHA1：E16292B938A284E14A79E4998209F5A4143DBF8A
文件大小：2.41GB
发布时间：2015-09-22
下载地址：ed2k://|file|cn_visio_professional_2016_x86_x64_dvd_6970929.iso|2588262400|52A997F3AF4E40B896C8E4677CF10E90|/
```

```
文件名：cn_project_professional_2016_x86_x64_dvd_6966612.iso
　SHA1：245787253622D4D790F62012B578398EA78D8EA2
文件大小：2.41GB
发布时间：2015-09-22
下载地址：ed2k://|file|cn_project_professional_2016_x86_x64_dvd_6966612.iso|2588266496|DEF65A0A9B12D8A8B734528800F625D5|/
```