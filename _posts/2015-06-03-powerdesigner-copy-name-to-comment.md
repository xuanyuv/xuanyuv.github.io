---
layout: post
title: "PowerDesigner将表name列值复制到comment列"
categories: 工具
tags: PowerDesigner
author: 玄玉
excerpt: 介绍PowerDesigner工具中，把表里面的name列值复制到comment列，的两种方法。
---

* content
{:toc}


PowerDesigner中的pdm默认生成sql时，字段是没有注释的，想要注释的话，有两个方法

## 方法一（推荐）

`pdm`中双击打开一个`Table`，到`Columns`选项卡中，按快捷键`Ctrl+U`，找到`Comment`并勾选即可

而且该操作设置一次就行了，以后在新的Table中也会自动出现Comment

设置完毕后，在添加表字段时一并写上注释，这样生成的sql中字段就会有注释了

## 方法二

执行vbs脚本（见末文）

相较第一种方法，该方法缺点是每次生成sql前，都要执行一遍这个脚本

执行方式为`Tools-->Execute Commands-->Edit/Run Scripts`，或者直接快捷键`Ctrl+Shift+X`

将下面的脚本拷进去执行一遍，也可以保存为`name2comment.vbs`

下一次再执行的话，就可以`Ctrl+O`再选择`name2comment.vbs`即可

```
' 如果comment为空,则填入name;如果comment不为空,则保留不变.这样可以避免已有的注释丢失.

Option Explicit
ValidationMode = True
InteractiveMode = im_Batch

Dim mdl ' the current model

' get the current active model
Set mdl = ActiveModel
If (mdl Is Nothing) Then
    MsgBox "There is no current Model "
ElseIf Not mdl.IsKindOf(PdPDM.cls_Model) Then
    MsgBox "The current model is not an Physical Data model. "
Else
    ProcessFolder mdl
End If

' This routine copy name into comment for each table, each column and each view of the current folder
Private sub ProcessFolder(folder)
Dim Tab 'running table
for each Tab in folder.tables
    if not tab.isShortcut then
        if trim(tab.comment)="" then '如果有表的注释,则不改变它;如果没有表注释,则把name添加到注释中.
            tab.comment = tab.name
        end if
        Dim col ' running column
        for each col in tab.columns
            if trim(col.comment)="" then '如果col的comment为空,则填入name;如果已有注释,则不添加.这样可以避免已有注释丢失.
                col.comment= col.name
            end if
        next
    end if
next

Dim view 'running view
for each view in folder.Views
    if not view.isShortcut and trim(view.comment)="" then
        view.comment = view.name
    end if
next

' go into the sub-packages
Dim f ' running folder
For Each f In folder.Packages
    if not f.IsShortcut then
        ProcessFolder f
    end if
Next
end sub
```