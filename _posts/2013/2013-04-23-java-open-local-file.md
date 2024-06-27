---
layout: post
title: "Java调用系统默认程序打开本地文件"
categories: JavaSE
tags: java open file
author: 玄玉
excerpt: 介绍Java调用系统默认程序打开本地文件的几种方式。
---

* content
{:toc}


```java
package com.xuanyuv.util;
import java.awt.Desktop;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Java调用系统默认程序打开本地文件
 * Created by 玄玉<https://www.xuanyuv.com/> on 2013/04/23 01:00.
 */
public class OpenLocalFile {
    public static void main(String[] args) throws IOException {
        useProcessBuilder();
        useAWTDesktop();
        useRuntimeExec();
    }

    /**
     * 借助java.lang.ProcessBuilder打开
     */
    private static void useProcessBuilder() throws IOException{
        //new ProcessBuilder("notepad.exe", "C:/Users/xuanyu/Desktop/test file/readme.txt").start();
        List<String> commands = new ArrayList<>();
        commands.add("D:/Program Files/WPS/9.1.0.4047/office6/wps.exe");
        commands.add("C:/Users/xuanyu/Desktop/test file/myResume.doc");
        new ProcessBuilder(commands).start();
    }

    /**
     * 借助java.awt.Desktop打开
     */
    private static void useAWTDesktop() throws IOException{
        //打开的目录或文件名中允许包含空格
        Desktop.getDesktop().open(new File("D:/my local/测试用例.xls"));
    }

    /**
     * 借助java.lang.Runtime打开
     * WPS文字--------Runtime.getRuntime().exec("cmd /c start wps")
     * WPS表格--------Runtime.getRuntime().exec("cmd /c start et")
     * WPS演示--------Runtime.getRuntime().exec("cmd /c start wpp")
     * Office Word---Runtime.getRuntime().exec("cmd /c start winword")
     * Office Excel--Runtime.getRuntime().exec("cmd /c start excel")
     */
    private static void useRuntimeExec() throws IOException{
        //若打开的目录或文件名中不包含空格，就用下面的方式
        Runtime.getRuntime().exec("cmd /c start D:/mylocal/测试用例.xls");
        //可以'运行'或'Win+R'，然后输入'cmd /?'查看帮助信息
        Runtime.getRuntime().exec(new String[]{"cmd.exe", "/c", "D:/my local/测试用例.xls"});
        //借助本地安装程序打开
        //若打开的目录或文件名中包含空格，它就无能为力了...不过本地程序的安装目录允许含空格
        String etCommand = "D:/Program Files/WPS/8.1.0.3526/office6/et.exe";
        String filePath = "D:/mylocal/测试用例.xls";
        Runtime.getRuntime().exec(etCommand + " " + filePath);
    }
}
```