---
layout: post
title: "CentOS系统配置"
categories: Linux
tags: linux centos
author: 玄玉
excerpt: 主要介绍CentOS-6.4-minimal版系统配置。
---

* content
{:toc}


本文使用的是 `CentOS-6.4-minimal` 版的操作系统（安装包为：CentOS-6.4-x86_64-minimal.iso）

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

## 安装Tomcat

无需编译源码，直接`tar zxvf apache-tomcat-6.0.41.tar.gz`解压即可

再执行`/app/tomcat/bin/startup.sh`可以启动Tomcat了

## 安装Maven

```sh
[xuanyu@dev ~]$ cd /app/
[xuanyu@dev app]$ tar -zxvf apache-maven-3.2.5-bin.tar.gz
[xuanyu@dev app]$ rm -rf apache-maven-3.2.5-bin.tar.gz
[root@dev Jadyer]# vim /etc/profile
                   # Set Maven Environment Variable
                   MAVEN_HOME=/app/apache-maven-3.2.5
                   PATH=$MAVEN_HOME/bin:$PATH
                   export MAVEN_HOME PATH
[root@dev Jadyer]# source /etc/profile
[root@dev Jadyer]# echo $PATH
[root@dev Jadyer]# mvn -version
[xuanyu@dev ~]$ mvn -version
[xuanyu@dev ~]$ cd /app/code/
[xuanyu@dev code]$ mkdir MavenRepository
[xuanyu@dev code]$ vim /app/apache-maven-3.2.5/conf/settings.xml
                   <localRepository>/app/code/MavenRepository</localRepository>
[xuanyu@dev code]$ cp /app/apache-maven-3.2.5/conf/settings.xml MavenRepository/
```

## 安装Git

```sh
# Git 工作时要调用 curl/zlib/openssl/expat/libiconv 等库的代码，所以要先安装这些依赖
[root@dev backup]# yum install curl-devel expat-devel gettext-devel openssl-devel zlib-devel gcc perl-ExtUtils-CBuilder perl-ExtUtils-MakeMaker
[root@dev backup]# wget https://mirrors.edge.kernel.org/pub/software/scm/git/git-2.45.2.tar.gz
[root@dev backup]# tar zxvf git-2.45.2.tar.gz # sha256：98b26090ed667099a3691b93698d1e213e1ded73d36a2fde7e9125fce28ba234
[root@dev backup]# cd git-2.45.2/
[root@dev git-2.45.2]# make prefix=/app/software/git-2.45.2 all
[root@dev git-2.45.2]# make prefix=/app/software/git-2.45.2 install
[root@dev git-2.45.2]# cd ..
[root@dev backup]# rm -rf git-2.45.2
[root@dev backup]# vim /etc/profile
                   # Set Git Environment Variable
                   GIT_HOME=/app/software/git-2.45.2
                   PATH=$GIT_HOME/bin:$PATH
                   export GIT_HOME PATH
[root@dev backup]# source /etc/profile
[root@dev backup]# echo $PATH
[root@dev backup]# git --version
git version 2.45.2
[root@dev backup]#
```

## 安装Subversion

下载地址为：https://www.open.collab.net/files/documents/60/11125/CollabNetSubversion-client-1.8.13-1.x86_64.rpm

```sh
[xuanyu@dev ~]$ rpm -q Subversion
[xuanyu@dev ~]$ rpm -ivh /app/CollabNetSubversion-client-1.8.13-1.x86_64.rpm
warning: /app/CollabNetSubversion-client-1.8.13-1.x86_64.rpm: Header V3 DSA/SHA1 Signature...
Preparing...                ########################################### [100%]
   1:CollabNetSubversion-cli########################################### [100%]
[root@dev Jadyer]# svn --version
[root@dev Jadyer]# vim /etc/profile
                   # Set Subversion Environment Variable
                   SVN_HOME=/opt/CollabNet_Subversion
                   PATH=$SVN_HOME/bin:$PATH
                   export SVN_HOME PATH
[root@dev Jadyer]# source /etc/profile
[root@dev Jadyer]# svn --version
[xuanyu@dev ~]$ svn --version
```

## 修改RPM安装路径

RPM 包通常都有默认的安装路径，但也可以修改这个路径（并非所有 rpm 都允许安装到其它路径）

下面通过 CollabNetSubversion-client-1.8.13-1.x86_64.rpm 和 jdk-6u45-linux-amd64.rpm 举例说明

通过二者的`Relocations`参数，我们可以看到 Subversion 是不允许重定位的，而 jdk 则允许

所以 Subversion 只能安装在默认路径下，而 jdk 则可以修改其默认的安装路径（/usr/java）

方法为执行命令：`rpm -ivh --badreloc --relocate /usr/java=/app/jdk1.6.0_45 jdk-6u45-linux-amd64.rpm`

其中：`--badreloc`是将文件强制安装到指定位置，`--relocate`是将文件从 oldpath 安装到 newpath

```sh
[xuanyu@dev app]$ rpm -qpi CollabNetSubversion-client-1.8.13-1.x86_64.rpm
warning: CollabNetSubversion-client-1.8.13-1.x86_64.rpm: Header V3 DSA/SHA1 Signature...
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
[xuanyu@dev app]$ rpm -qpi jdk-6u45-linux-amd64.rpm
Name        : jdk                          Relocations: /usr/java
Version     : 1.6.0_45                          Vendor: Oracle and/or its affiliates.
Release     : fcs                           Build Date: Tue 26 Mar 2013 07:54:12 PM EDT
Install Date: (not installed)               Build Host: jb6-lin-amd64.sfbay.sun.com
Group       : Development/Tools             Source RPM: jdk-1.6.0_45-fcs.src.rpm
Size        : 127250396                        License: Copyright (c) 2011, Oracle...
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