---
layout: post
title: "发布Java应用的Shell脚本"
categories: Linux
tags: linux
author: 玄玉
excerpt: 介绍自动下载SVN源码、Maven编译打包、部署Tomcat、重启Tomcat的Shell脚本。
---

* content
{:toc}


本文演示的脚本，依赖的环境和工具有：linux、jdk、tomcat、maven、git/svn

主要包括功能：自动从git/svn仓库拉取最新代码至临时目录、maven编译打包、重发布到tomcat、删除临时文件、最后重启tomcat

关于脚本中一些命令的含义，可参考我之前的博文：<https://www.xuanyuv.com/blog/20120909/linux-shell-java.html>

## deploy-engine

下面是包含了核心逻辑的，具体的脚本内容`deploy-engine.sh`

该脚步可放置于服务器任何目录下执行，不过我的习惯是统一放到 /tomcat/bin/ 目录下

```sh
#!/bin/sh
# 部署在/tomcat/webapps/目录下的应用名
APP_NAME=ROOT
# tomcat目录的绝对路径
APP_PATH=/app/tomcat-6.0.43
# tomcat里面存储临时代码的文件夹名称（发布完会自动删除）
APP_CODE=sourcecode
# SVN_URL=https://svn.sinaapp.com/hongyu/2/repository/seed
# SVN_USER=xuanyuv@163.com
# SVN_PSWD=xuanyu
# git仓库地址、应用名称、打成的war所在的模块名称
GIT_URL=https://hongyu%40yeah.net:xuanyu@github.com/xuanyuv/seed.git
GIT_CODE=seed
GIT_MODULE=seed-mpp

appPID=0
getAppPID(){
    pidInfo=`ps aux|grep java|grep $APP_PATH|grep -v grep`
    if [ -n "$pidInfo" ]; then
        appPID=`echo $pidInfo | awk '{print $2}'`
    else
        appPID=0
    fi
}

downloadAndCompileSourceCode(){
    cd $APP_PATH
    mkdir $APP_CODE
    # svn --username $SVN_USER --password $SVN_PSWD checkout $SVN_URL $APP_CODE
    cd $APP_CODE
    git clone $GIT_URL --depth=2
    cd $GIT_CODE
    mvn clean package -DskipTests
}

shutdown(){
    getAppPID
    echo "[玄玉] =========================================================================================="
    if [ $appPID -ne 0 ]; then
        echo -n "[玄玉] Stopping $APP_PATH(PID=$appPID)..."
        kill -9 $appPID
        if [ $? -eq 0 ]; then
            echo "[Success]"
            echo "[玄玉] =========================================================================================="
        else
            echo "[Failed]"
            echo "[玄玉] =========================================================================================="
        fi
        getAppPID
        if [ $appPID -ne 0 ]; then
            shutdown
        fi
    else
        echo "[玄玉] $APP_PATH is not running"
        echo "[玄玉] =========================================================================================="
    fi
}

deploy(){
    cd $APP_PATH/webapps/
    rm -rf $APP_NAME
    rm -rf $APP_NAME.war
    cp $APP_PATH/$APP_CODE/$GIT_CODE/$GIT_MODULE/target/*.war $APP_NAME.war
    cd $APP_PATH/logs/
    rm -rf *
    cd $APP_PATH
    rm -rf $APP_CODE
}

startup(){
    cd $APP_PATH/bin
    ./startup.sh
    tail -100f ../logs/catalina.out
}

downloadAndCompileSourceCode
shutdown
deploy
startup
```

## 中途退出的问题

上面的脚本在使用命令`sh deploy-engine.sh`直接执行的过程中，若未执行完毕便`Ctrl+C`退出，这会导致应用部署失败

所以，可以使用命令`nohup ./deploy-engine.sh &`来执行，这样中途`Ctrl+C`就不会有问题了

## deploy

这是额外提供的、基于上面的`deploy-engine.sh`基础上的额外封装、可直接执行的脚本`deploy.sh`

而即便执行过程中，`Ctrl+C`退出了，不也会有什么影响，应用会后台继续自动部署

该脚本同样可放置于服务器任何目录下执行

```sh
#!/bin/sh
# 执行真正逻辑的启动脚本文件名（默认会去/tomcat/bin/下取该文件）
SHELL_NAME=deploy-engine.sh
# tomcat目录
APP_PATH=/app/tomcat-6.0.43

shellPID=0
getShellPID(){
    pidInfo=`ps aux|grep $SHELL_NAME|grep -v grep`
    if [ -n "$pidInfo" ]; then
        shellPID=`echo $pidInfo | awk '{print $2}'`
    else
        shellPID=0
    fi
}

shutdown(){
    getShellPID
    echo "[玄玉] =========================================================================================="
    if [ $shellPID -ne 0 ]; then
        echo -n "[玄玉] Stopping $SHELL_NAME(PID=$shellPID)..."
        kill -9 $shellPID
        if [ $? -eq 0 ]; then
            echo "[Success]"
            echo "[玄玉] =========================================================================================="
        else
            echo "[Failed]"
            echo "[玄玉] =========================================================================================="
        fi
        getShellPID
        if [ $shellPID -ne 0 ]; then
            shutdown
        fi
    else
        echo "[玄玉] $SHELL_NAME is not running"
        echo "[玄玉] =========================================================================================="
    fi
}

# [2>&1]表示把错误输出(stderr)和标准输出(stdout)，都输出到同一个地方，否则会提示[nohup: redirecting stderr to stdout]
# [>/dev/null]表示将标准输出重定向到/dev/null，而/dev/null代表Linux的空设备文件，所有向该文件写入的内容都会丢失，俗称“黑洞”
# 由于nohup.log时间长了会非常大，很占用磁盘，因此：
# 1. 如果不想输出任何东西到控制台，就可以用这个命令：nohup ../bin/$SHELL_NAME > /dev/null 2>&1 &
# 2. 如果只想输出错误信息到控制台，就可以用这个命令：nohup ../bin/$SHELL_NAME > /dev/null 2>nohup.err &
startupByNohup(){
    cd $APP_PATH/logs
    rm -rf nohup.log
    nohup ../bin/$SHELL_NAME > nohup.log 2>&1 &
    sleep 1
    tail -100f nohup.log
}

shutdown
startupByNohup
```