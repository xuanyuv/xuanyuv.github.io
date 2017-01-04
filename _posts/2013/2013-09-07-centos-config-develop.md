---
layout: post
title: "CentOS系统配置及开发环境搭建"
categories: Linux
tags: linux centos
author: 玄玉
excerpt: 主要介绍CentOS-6.4-minimal版系统配置，以及Java开发环境搭建的细节。
---

* content
{:toc}


本文使用的是`CentOS-6.4-minimal`版的操作系统（安装包为：CentOS-6.4-x86_64-minimal.iso）

## 网卡

CentOS默认没有启用eth0网卡，我们做的就是启用它

编辑`vi /etc/sysconfig/network-scripts/ifcfg-eth0`，再修改ONBOOT=yes即可

（如果是VirtualBox里的虚拟机，可以将VirtualBox配置为桥接网卡，就能让虚拟机里的CentOS联网了）

## IPv6

若想检查当前IP地址中是否含有IPv6地址，可以执行`ifconfig`命令

若发现类似inet6 addr: fe80::20c:29ff:fee4:1d8/64则表明已含IPv6

我们目前还用不到IPv6，而CentOS默认是开启了IPv6的，所以要关闭它

编辑`vi /etc/modprobe.d/dist.conf`，在其尾部加入以下两行（若要重新开启IPv6的支持，注释这两行即可）

alias net-pf-10 off

alias ipv6 off

## 防火墙

* service iptables stop：关闭防火墙
* service iptables start：启动防火墙
* service iptables restart：重启防火墙
* service iptables status：查看防火墙状态
* chkconfig iptables OFF：永久关闭防火墙
* chkconfig iptables ON：永久关闭后启用

测试时，我启动了一个Mina写的小应用，结果发现笔记本无法访问虚拟机里的这个应用，但ping虚拟机里的IP却是通的

于是执行`service iptables status`发现CentOS默认开启了22端口（所以xshell可通过ssh连到CentOS），那么就要开通端口了

编辑`vi /etc/sysconfig/iptables`

我们会发现里面有一行是这么写的：`-A INPUT -p tcp -m state --state NEW -m tcp --dport 22 -j ACCEPT`

然后依葫芦画瓢在这一行下面写上：`-A INPUT -p tcp -m state --state NEW -m tcp --dport 8080 -j ACCEPT`

最后执行`service iptables restart`命令即可，此时服务器的8080端口就可以对外提供服务了

## 安装JDK

下面使用的是`.tar.gz`文件，如果用的是`.bin`文件，可以先执行`./jdk-6u45-linux-x64.bin`命令，再配置环境变量，即可。

```sh
[root@CentOS64 ~]# cd /
[root@CentOS64 /]# mkdir app
[root@CentOS64 ~]# groupadd Develop                            #添加Develop组
[root@CentOS64 ~]# useradd -g Develop Jadyer                   #创建Jadyer用户并将其分配到Develop组
[root@CentOS64 ~]# passwd Jadyer                               #设置或修改Jadyer用户密码
[root@CentOS64 /]# chown -R Jadyer:Develop /app                #将/app目录的拥有者修改为Jadyer用户和Develop组
[Jadyer@CentOS64 software]$ tar zxvf jdk-8u40-linux-x64.tar.gz #解压jdk
[Jadyer@CentOS64 software]$ mv jdk1.8.0_40/ /app/jdk1.8.0_40   #统一存放应用在/app目录中
[root@CentOS64 ~]# vi /etc/profile                             #配置环境变量，最后[:x]保存即可
                      #Set Java Environment Variable
                      JAVA_HOME=/app/jdk1.8.0_40
                      PATH=$PATH:$JAVA_HOME/bin
                      export JAVA_HOME PATH
[root@CentOS64 ~]# echo $PATH                                  #查看当前PATH
[root@CentOS64 ~]# source /etc/profile                         #令环境变量生效
[root@CentOS64 ~]# echo $PATH                                  #再看下PATH
[root@CentOS64 ~]# java -version                               #验证是否成功
[Jadyer@CentOS64 ~]$ java -version                             #重复验证（普通用户重连服务器后才会生效）
```

## 安装Tomcat

无需编译源码，直接`tar zxvf apache-tomcat-6.0.41.tar.gz`解压即可

再执行`/app/tomcat/bin/startup.sh`可以启动Tomcat了

## 安装Maven

```sh
[Jadyer@localhost ~]$ cd /app/
[Jadyer@localhost app]$ tar -zxvf apache-maven-3.2.5-bin.tar.gz
[Jadyer@localhost app]$ rm -rf apache-maven-3.2.5-bin.tar.gz
[root@localhost Jadyer]# vi /etc/profile
                         #Set Maven Environment Variable
                         MAVEN_HOME=/app/apache-maven-3.2.5
                         PATH=$PATH:$MAVEN_HOME/bin
                         export MAVEN_HOME PATH
[root@localhost Jadyer]# source /etc/profile
[root@localhost Jadyer]# echo $PATH
[root@localhost Jadyer]# mvn -version
[Jadyer@localhost ~]$ mvn -version
[Jadyer@localhost ~]$ cd /app/code/
[Jadyer@localhost code]$ mkdir MavenRepository
[Jadyer@localhost code]$ vi /app/apache-maven-3.2.5/conf/settings.xml
                         <localRepository>/app/code/MavenRepository</localRepository>
[Jadyer@localhost code]$ cp /app/apache-maven-3.2.5/conf/settings.xml MavenRepository/
```

## 安装Subversion

下载地址为：[https://www.open.collab.net/files/documents/60/11125/CollabNetSubversion-client-1.8.13-1.x86_64.rpm](https://www.open.collab.net/files/documents/60/11125/CollabNetSubversion-client-1.8.13-1.x86_64.rpm)

```sh
[Jadyer@localhost ~]$ rpm -q Subversion
[Jadyer@localhost ~]$ rpm -ivh /app/CollabNetSubversion-client-1.8.13-1.x86_64.rpm
warning: /app/CollabNetSubversion-client-1.8.13-1.x86_64.rpm: Header V3 DSA/SHA1 Signature, key ID 35bcca43: NOKEY
Preparing...                ########################################### [100%]
   1:CollabNetSubversion-cli########################################### [100%]
[root@localhost Jadyer]# svn --version
[root@localhost Jadyer]# vi /etc/profile
                         #Set Subversion Environment Variable
                         SVN_HOME=/opt/CollabNet_Subversion
                         PATH=$PATH:$SVN_HOME/bin
                         export SVN_HOME PATH
[root@localhost Jadyer]# source /etc/profile
[root@localhost Jadyer]# svn --version
[Jadyer@localhost ~]$ svn --version
```

## 修改RPM安装路径

RPM包通常都有默认的安装路径，但也有办法更新它的默认安装路径（只不过不是所有的rpm都允许安装到其它路径）

下面通过CollabNetSubversion-client-1.8.13-1.x86_64.rpm和jdk-6u45-linux-amd64.rpm举例说明

通过二者的`Relocations`参数，我们可以看到Subversion是不允许重定位的，而jdk则允许

所以Subversion只能安装在默认路径下，而jdk则可以修改其默认安装路径`/usr/java`为其它路径

方法为执行命令：`rpm -ivh --badreloc --relocate /usr/java=/app/jdk1.6.0_45 jdk-6u45-linux-amd64.rpm`

其中badreloc是将文件强制安装到指定位置，relocate是将文件从oldpath安装到newpath

```sh
[Jadyer@localhost app]$ rpm -qpi CollabNetSubversion-client-1.8.13-1.x86_64.rpm
warning: CollabNetSubversion-client-1.8.13-1.x86_64.rpm: Header V3 DSA/SHA1 Signature, key ID 35bcca43: NOKEY
Name        : CollabNetSubversion-client   Relocations: (not relocatable)
Version     : 1.8.13                            Vendor: CollabNet
Release     : 1                             Build Date: Mon 23 Mar 2015 02:49:36 AM EDT
Install Date: (not installed)               Build Host: cu128.cloud.maa.collab.net
Group       : Utilities/System              Source RPM: CollabNetSubversion-client-1.8.13-1.src.rpm
Size        : 39281894                         License: Proprietary
Signature   : DSA/SHA1, Mon 23 Mar 2015 02:49:51 AM EDT, Key ID 80233a5a35bcca43
Packager    : Alexander Thomas (AT) <alexander@collab.net>
URL         : http://open.collab.net
Summary     : A Concurrent Versioning system similar to but better than CVS.
Description :
CollabNet Subversion client is a free download of open-source Subversion,
compiled and tested by CollabNet. For more information about CollabNet
Subversion, visit the CollabNet community at http://open.collab.net.
```

```sh
[Jadyer@localhost app]$ rpm -qpi jdk-6u45-linux-amd64.rpm
Name        : jdk                          Relocations: /usr/java
Version     : 1.6.0_45                          Vendor: Oracle and/or its affiliates.
Release     : fcs                           Build Date: Tue 26 Mar 2013 07:54:12 PM EDT
Install Date: (not installed)               Build Host: jb6-lin-amd64.sfbay.sun.com
Group       : Development/Tools             Source RPM: jdk-1.6.0_45-fcs.src.rpm
Size        : 127250396                        License: Copyright (c) 2011, Oracle and/or its affiliates. All rights reserved. Also under other license(s) as shown at the Description field.
Signature   : (none)
Packager    : Java Software <jre-comments@java.sun.com>
URL         : http://www.oracle.com/technetwork/java/javase/overview/index.html
Summary     : Java(TM) Platform Standard Edition Development Kit
Description :
The Java Platform Standard Edition Development Kit (JDK) includes both
the runtime environment (Java virtual machine, the Java platform classes
and supporting files) and development tools (compilers, debuggers,
tool libraries and other tools).

The JDK is a development environment for building applications, applets
and components that can be deployed with the Java Platform Standard
Edition Runtime Environment.
```