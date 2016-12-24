---
layout: post
title: "启停Java应用的Shell脚本"
categories: Linux
tags: linux
author: 玄玉
excerpt: 介绍启动和停止Java应用程序的Shell脚本。
---

* content
{:toc}


实际使用中，需注意两点：

1. 编写完shell脚本之后，记得`chmod 755 startup.sh`，否则会提示无法执行or没有权限执行等等
2. 最好直接在Linux上创建并编写脚本，这是因为Windows下编写文档格式和编码，是Linux所不能完全承认的<br>
   最直接的体现就是使用过程中会遇到很多似是而非的错误，这曾经搞疯了一大片人

# 启动应用

下面是可单独使用的，用于启动Java应用程序的`startup.sh`

注：该脚本可在服务器上的任意目录下执行，不会影响到日志的输出位置等，调用方式均为：`sh startup.sh`

```sh
#!/bin/sh
#JDK路径
#JAVA_HOME="/usr/java/jdk1.6.0_31"

#JVM启动参数
#-server：一定要作为第一个参数，多个CPU时性能佳
#-Xloggc：记录GC日志，建议写成绝对路径，如此便可在任意目录下执行该shell脚本
JAVA_OPTS="-server -Xms2048m -Xmx2048m -Xloggc:/app/code/CucPayTradePortalLog/gc.log"

#Java程序日志所在的目录
APP_LOG=/app/code/CucPayTradePortalLog

#Java程序主体所在的目录，即classes的上一级目录
APP_HOME=/app/code/CucPayTradePortal

#Java主程序，也就是main(String[] args)方法类
APP_MAIN=com.cucpay.tradeportal.MainApp

#classpath参数，包括指定lib目录下的所有jar
CLASSPATH=$APP_HOME/classes
for tradePortalJar in "$APP_HOME"/lib/*.jar;
do
   CLASSPATH="$CLASSPATH":"$tradePortalJar"
done

#初始化全局变量，用于标识交易前置系统的PID（0表示未启动）
tradePortalPID=0

#获取Java应用的PID
#------------------------------------------------------------------------------------------------------
#说明：通过JDK自带的jps命令，联合Linux中的grep命令，可以准确查找到Java应用的PID
#      [jps -l]表示显示Java主程序的完整包路径
#      awk命令可以分割出PID（$1部分）及Java主程序名称（$2部分）
#例子：[$JAVA_HOME/bin/jps -l | grep $APP_MAIN]命令执行，会看到[5775 com.cucpay.tradeportal.MainApp]
#另外：这个命令也可以取到程序的PID-->[ps aux|grep java|grep $APP_MAIN|grep -v grep|awk '{print $2}']
#------------------------------------------------------------------------------------------------------
getTradeProtalPID(){
    javaps=`$JAVA_HOME/bin/jps -l | grep $APP_MAIN`
    if [ -n "$javaps" ]; then
        tradePortalPID=`echo $javaps | awk '{print $1}'`
    else
        tradePortalPID=0
    fi
}

#启动Java应用程序
#------------------------------------------------------------------------------------------------------
#1、调用getTradeProtalPID()函数，刷新$tradePortalPID全局变量
#2、若程序已经启动（$tradePortalPID不等于0），则提示程序已启动
#3、若程序未被启动，则执行启动命令
#4、启动命令执行后，再次调用getTradeProtalPID()函数
#5、若步骤4执行后，程序的PID不等于0，则打印Success，反之打印Failed
#注意：[echo -n]表示打印字符后不换行
#注意：[nohup command > /path/nohup.log &]是将作业输出到nohup.log，否则它会输出到该脚本目录下的nohup.out中
#------------------------------------------------------------------------------------------------------
startup(){
    getTradeProtalPID
    echo "==============================================================================================="
    if [ $tradePortalPID -ne 0 ]; then
        echo "$APP_MAIN already started(PID=$tradePortalPID)"
        echo "==============================================================================================="
    else
        echo -n "Starting $APP_MAIN"
        nohup $JAVA_HOME/bin/java $JAVA_OPTS -classpath $CLASSPATH $APP_MAIN > $APP_LOG/nohup.log &
        getTradeProtalPID
        if [ $tradePortalPID -ne 0 ]; then
            echo "(PID=$tradePortalPID)...[Success]"
            echo "==============================================================================================="
        else
            echo "[Failed]"
            echo "==============================================================================================="
        fi
    fi
}

#调用启动命令
startup
```

# 停止应用

下面是可单独使用的，用于停止Java应用程序的`shutdown.sh`

```sh
#!/bin/sh
APP_MAIN=com.cucpay.tradeportal.MainApp

tradePortalPID=0

getTradeProtalPID(){
    javaps=`$JAVA_HOME/bin/jps -l | grep $APP_MAIN`
    if [ -n "$javaps" ]; then
        tradePortalPID=`echo $javaps | awk '{print $1}'`
    else
        tradePortalPID=0
    fi
}

#停止Java应用程序
#------------------------------------------------------------------------------------------------------
#1、调用getTradeProtalPID()函数，刷新$tradePortalPID全局变量
#2、若程序已经启动（$tradePortalPID不等于0），则开始执行停止程序操作，否则提示程序未运行
#3、使用[kill -9 PID]命令强制杀掉进程
#4、使用[$?]获取上一句命令的返回值，若其为0，表示程序已停止运行，则打印Success，反之打印Failed
#5、为防止Java程序被启动多次，这里增加了反复检查程序进程的功能，通过递归调用shutdown()函数的方式，反复kill
#注意：Shell编程中，[$?]表示上一句命令或者上一个函数的返回值
#------------------------------------------------------------------------------------------------------
shutdown(){
    getTradeProtalPID
    echo "==============================================================================================="
    if [ $tradePortalPID -ne 0 ]; then
        echo -n "Stopping $APP_MAIN(PID=$tradePortalPID)..."
        kill -9 $tradePortalPID
        if [ $? -eq 0 ]; then
            echo "[Success]"
            echo "==============================================================================================="
        else
            echo "[Failed]"
            echo "==============================================================================================="
        fi
        getTradeProtalPID
        if [ $tradePortalPID -ne 0 ]; then
            shutdown
        fi
    else
        echo "$APP_MAIN is not running"
        echo "==============================================================================================="
    fi
}

shutdown
```

# 查看应用运行状态

下面是可单独使用的，用于查看Java应用程序运行状态的`serverStatus.sh`

```sh
#!/bin/sh
APP_MAIN=com.cucpay.tradeportal.MainApp

tradePortalPID=0

getTradeProtalPID(){
    javaps=`$JAVA_HOME/bin/jps -l | grep $APP_MAIN`
    if [ -n "$javaps" ]; then
        tradePortalPID=`echo $javaps | awk '{print $1}'`
    else
        tradePortalPID=0
    fi
}

getServerStatus(){
    getTradeProtalPID
    echo "==============================================================================================="
    if [ $tradePortalPID -ne 0 ]; then
        echo "$APP_MAIN is running(PID=$tradePortalPID)"
        echo "==============================================================================================="
    else
        echo "$APP_MAIN is not running"
        echo "==============================================================================================="
    fi
}

getServerStatus
```