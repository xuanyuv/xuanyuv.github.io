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


本文演示的脚本，依赖的环境和工具有：linux、jdk、tomcat、maven、svn

主要包括功能：自动从SVN拉取最新代码、然后执行Maven编译打包、接着重新发布到Tomcat、最后重启Tomcat

关于脚本中一些命令的含义，可参考我之前的博文：[https://jadyer.github.io/2012/09/09/linux-shell-java/](https://jadyer.github.io/2012/09/09/linux-shell-java/)

# deploy-engine

下面是包含了核心逻辑的，具体的脚本内容`deploy-engine.sh`

```sh
#!/bin/sh
APP_NAME=engine
APP_WARS=JadyerEngine-web/target
APP_PATH=/app/tomcat-6.0.43
APP_CODE=sourcecode
SVN_URL=https://svn.sinaapp.com/jadyer/2/repository/JadyerEngine
SVN_USER=jadyer@yeah.net
SVN_PSWD=玄玉

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
    svn --username $SVN_USER --password $SVN_PSWD checkout $SVN_URL $APP_CODE
    cd $APP_CODE
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
    cp $APP_PATH/$APP_CODE/$APP_WARS/*.war $APP_NAME.war
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

# 中途退出的问题

上面的脚本在使用命令`sh deploy-engine.sh`直接执行的过程中，若未执行完毕便`Ctrl+C`退出，这会导致应用部署失败

所以，可以使用命令`nohup ./deploy-engine.sh &`来执行，这样中途`Ctrl+C`就不会有问题了

不过，要是给别人用的话，对方每次都要敲这么长的命令，可能会觉得麻烦，所以相对来说`Jenkins`也比较适合给被人用

# deploy

这是额外提供的，在上面的`deploy-engine.sh`基础上，可以直接执行的脚本`deploy.sh`

```sh
#!/bin/sh
APP_LOGS=/app/tomcat-6.0.43/logs
SHELL_NAME=bin/deploy-engine.sh

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

# [2>&1]表示把标准错误(stderr)重定向到标准输出(stdout)，否则会提示[nohup: redirecting stderr to stdout]
startupByNohup(){
    cd $APP_LOGS
    rm -rf nohup.log
    nohup ../$SHELL_NAME > nohup.log 2>&1 &
    sleep 1
    tail -100f nohup.log
}

shutdown
startupByNohup
```