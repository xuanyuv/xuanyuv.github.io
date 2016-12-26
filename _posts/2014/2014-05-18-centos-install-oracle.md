---
layout: post
title: "CentOS安装Oracle"
categories: Oracle
tags: oracle
author: 玄玉
excerpt: 主要介绍CentOS-6.4-DVD系统中安装Oracle-11.2.0.4，以及RLwrap的安装和配置。
---

* content
{:toc}


本文涉及的相关环境为：`CentOS-6.4-DVD`和`Oracle-11.2.0.4`

# 前言

本来是在`CentOS-6.4-minimal-64bit`中安装`Oracle-11.2.0.4.0-Linux-x86_64`，结果整整折腾两天都没安装成功

总是在最后一步`./runInstaller`执行命令后打印下面的提示

```
Checking monitor: must be configured to display at least 256 colors
>>>Could not execute auto check for display colors using command /usr/bin/xdpyinfo.
Check if the DISPLAY variable is set. Failed <<<<
```

后来即便安装了图形界面（安装方法详见[https://jadyer.github.io/2014/01/15/centos-startx/](https://jadyer.github.io/2014/01/15/centos-startx/)），结果还是打印这个提示

于是各种Google，弄了很多东西，其中有一次打印了下面的提示

```
ls: 无法访问/usr/sbin/smartctl: 没有那个文件或目录  /usr/sbin/smartctl not found
```

听一个DBA说：如果报smartctl找不到，就需要先安装smartmontools（Linux系统光盘自带的），之后再安装cvuqdisk

```sh
[root@CentOS64 sbin]# yum install -y smartmontools
[root@CentOS64 sbin]# cd /app
[root@CentOS64 app]# rpm -ivh cvuqdisk-1.0.9-1.rpm
```

最后辗转找到`runcluvfy.sh`和`cvuqdisk-1.0.9-1.rpm`俩文件，安装后再执行`./runInstaller`

发现还是打印这个**Checking monitor: must be configured to display at least 256 colors提示**

后又把CentOS的`id:3:initdefault:`改成`5`启动图形界面，再在CentOS里面去执行`./runInstaller`（之前都是在xshell里操作）

结果还是打印**Checking monitor: must be configured to display at least 256 colors**提示，无奈换回`DVD`系统

以前就听DBA说过：Oracle搞了很多的手段和策略，其中之一就是为数据库安装工作增加了许多小零件的限制

这就使得在Oracle自己的Linux系统上安装Oracle数据库时，非常的方便，畅通无阻

但在其它Linux系统上安装不同版本的Oracle时，就会提示你缺少这个缺少那个的，没点经验的还未必搞得定

# 准备

本文记述的是在VirtualBox里面的`CentOS-6.4-DVD`系统中安装`Oracle-11.2.0.4.0-Linux-x86_64`

关于VirtualBox和CentOS的安装配置就略了，这里主要说一下Oracle-11.2.0.4.0-Linux-x86-64安装包的下载

目前Oracle的**11g**版本已经停止更新了，以后只会更新**12c**版本

由于12c刚出来不久,考虑到企业中应用11g更多一些，所以本文演示的是11g的安装方式

而11g的最后一个版本号就是11.2.0.4.0，但是我们在Oracle官网只能找到11.2.0.1.0的下载

地址为[http://www.oracle.com/technetwork/database/enterprise-edition/downloads/index.html](http://www.oracle.com/technetwork/database/enterprise-edition/downloads/index.html)

是不是有些奇怪，别急，在这个页面同时也会看到下面这样一段描述

```
7/13: Patch Set 11.2.0.4 for Linux and Solaris is now available on support.oracle.com.
Note: it is a full installation (you do not need to download 11.2.0.1 first)
```

翻译过来就是：可以到support.oracle.com去下载11.2.0.4，并且下载到的会是一个完整的安装包，也不需要预先安装11.2.0.1

有Oracle帐户的朋友可以到support.oracle.com下载，没有的也没关系，我的百度网盘里面有

Oracle-11.2.0.4.0-Linux-x86_64安装包共有7个文件，其中`1of7`和`2of7`就是数据库的完整的安装文件，所以这里只需要1和2

另外，Oracle也提供了非常详尽的安装和使用文档，下载地址如下

[http://www.oracle.com/technetwork/database/enterprise-edition/documentation/index.html](http://www.oracle.com/technetwork/database/enterprise-edition/documentation/index.html)

它的在线浏览地址为[http://www.oracle.com/pls/db112/homepage](http://www.oracle.com/pls/db112/homepage)

接下来我们找一下和安装有关的那部分内容

点击左侧`Installing and Upgrading`，再点击右侧`Database Installation Guide for Linux`后面的HTML链接

接下来就会看到很多的安装说明，这里我们只看`Oracle Database Preinstallation Tasks`部分就够了

# 环境配置

总体来讲，主要有以下六步

1. Create group(oinstall,dba)/user account(oracle)---->创建组和用户
2. Configure environment variables for oracle--------->配置环境变量
3. Check and add RPM package-------------------------->检查安装所需的RPM包
4. Modify kernel parameter---------------------------->修改内核参数
5. Change oracle limits------------------------------->修改oracle用户的shell限制（可以提升性能）
6. **./runInstaller**--------------------------------->安装Oracle

## 创建组和用户

```sh
[root@CentOS64 ~]# groupadd oinstall                 (创建一个名为oinstall的组，也可以用别的名字，只是习惯性用oinstall而已)
[root@CentOS64 ~]# groupadd dba                      (创建一个名为dba的组)
[root@CentOS64 ~]# useradd -g oinstall -G dba oracle (创建一个名为oracle的用户，其主组为oinstall，其副组为dba)
[root@CentOS64 ~]# passwd oracle                     (设置用户oracle的登录密码，这里设为22)
[root@CentOS64 ~]# chown -R oracle:oinstall /app     (修改/app目录的拥有着，这里/app目录是我提前创建的)
[root@CentOS64 ~]# yum install -y unzip              (CentOS-6.4-minimal系统中默认是没有unzip包的)
[root@CentOS64 ~]# su - oracle                       (切换到oracle用户)
[oracle@CentOS64 ~]$ cd /app/                        (切换到/app目录，然后解压Oracle安装包)
[oracle@CentOS64 app]# unzip /app/software/p13390677_112040_Linux-x86-64_1of7.zip
[oracle@CentOS64 app]# unzip /app/software/p13390677_112040_Linux-x86-64_2of7.zip
```

## 配置环境变量

这里会配置两个东西：`stty`和`DISPLAY`

stty的作用是：sqlplus中输错字符再按Backspace键回删时，就不会出现乱码字符，若未设置这个则可Ctrl+Backspace

DISPLAY指向的IP就是我的win7的IP（确切来说是网关的地址），作用是若Linux运行的程序有图形界面，那么它就会在Windows下显示

这里在安装Oracle11g时，可以选择图形界面安装，但我的CentOS在启动时会读取到`id:3:initdefault:`，即没有以桌面环境启动

所有我们要借助`Xmanager-Passive`来实现图形界面的功能，上面DISPLAY参数的IP地址实际上是指向安装了Xmanager的Windows系统

最后就会通过启动Xmanager-Passive来显示Oracle的安装图形界面

当然前提是在执行`./runInstaller`命令前，先在Windows下启动Xmanager-Passive

```sh
[root@CentOS64 ~]# hostname                          (查看主机名，得到：CentOS64)
[root@CentOS64 ~]# vi /etc/hosts                     (在hosts中加上"192.168.0.103 CentOS64"映射，该IP是ifconfig得到的)
[root@CentOS64 ~]# vi /etc/selinux/config            (设置SELINUX=disabled，即关掉安全增强工具，然后最好reboot重启一下)
[root@CentOS64 ~]# su - oracle                       (切换到oracle用户)
[oracle@CentOS64 ~]$ pwd                             (列出当前目录，即：/home/oracle)
[oracle@CentOS64 ~]$ ls -la                          (-a表示显示隐藏文件，这里我们会发现一个名为".bash_profile"的隐藏文件)
[oracle@CentOS64 ~]$ vi .bash_profile                (编辑.bash_profile，这样oracle用户登录时就会按照此文件设置的去执行)
# .bash_profile
# Get the aliases and functions
if [ -f ~/.bashrc ]; then
        . ~/.bashrc
fi
# User specific environment and startup programs
ORACLE_BASE=/app
ORACLE_HOME=$ORACLE_BASE/oracle
ORACLE_SID=xuanyu
DISPLAY=192.168.0.102:0.0
PATH=$ORACLE_HOME/bin:$PATH:$HOME/bin
LD_LIBRARY_PATH=$ORACLE_HOME/lib:$LD_LIBRARY_PATH
stty erase ^h
export PATH LD_LIBRARY_PATH DISPLAY ORACLE_BASE ORACLE_HOME ORACLE_SID
:x
[oracle@CentOS64 ~]$ cat .bash_profile
```

## 检查所需RPM

Oracle文档上都有描述，地址为[http://docs.oracle.com/cd/E11882_01/install.112/e47689/pre_install.htm#LADBI1085](http://docs.oracle.com/cd/E11882_01/install.112/e47689/pre_install.htm#LADBI1085)

详见`2.4.3`章节`Package Requirements`，我们这里用的是64位的CentOS

所以看这一段就行了：Oracle Database Package Requirements for Linux x86-64

接下来的就一一对比：Oracle Linux 6 and Red Hat Enterprise Linux 6  The following packages..... must be installed

下面以检查binutils为例

执行命令`rpm -qa | grep binutils`，然后查看控制台输出，我这里输出的是：binutils-2.20.51.0.2-5.36.el6.x86_64，即表明已安装

若无输出则表明未安装binutils（注意要通过root用户来查找）

如果没搜索到，那么比较便捷的方法是执行`yum install -y binutils`来安装

若yum方式安装无效，还可以到[http://pkgs.org/](http://pkgs.org/)下载对应的rpm文件，然后执行`rpm -ivh ksh-20120801-10.el6.x86_64.rpm`命令安装

此外，若想在linux上使用ODBC，那么还要把以下几个包也装上（详见"2.4.5.1 Oracle ODBC Drivers"章节描述）

 * unixODBC-2.2.14-11.el6 (x86_64) or later
 * unixODBC-2.2.14-11.el6.i686 or later
 * unixODBC-devel-2.2.14-11.el6 (x86_64) or later
 * unixODBC-devel-2.2.14-11.el6.i686 or later

## 修改内核参数

[http://docs.oracle.com/cd/E11882_01/install.112/e47689/pre_install.htm#LADBI1188](http://docs.oracle.com/cd/E11882_01/install.112/e47689/pre_install.htm#LADBI1188)

在上个页面的`2.13.1`章节**Displaying and Changing Kernel Parameter Values**描述了需要修改的内核参数

```sh
[root@CentOS64 ~]# vi /etc/sysctl.conf     (将以下配置拷到sysctl.conf文件末尾)
fs.aio-max-nr = 1048576
fs.file-max = 6815744
kernel.shmall = 2097152
kernel.shmmax = 4294967295
kernel.shmmni = 4096
kernel.sem = 250 32000 100 128
net.ipv4.ip_local_port_range = 9000 65500
net.core.rmem_default = 262144
net.core.rmem_max = 4194304
net.core.wmem_default = 262144
net.core.wmem_max = 1048576
[root@CentOS64 ~]# sysctl -p
[root@CentOS64 ~]#
```

这样，上面修改的内核参数就生效了，我们可以使用`sysctl -a | grep net.core.wmem_max`命令查看

## 修改shell限制

[http://docs.oracle.com/cd/E11882_01/install.112/e47689/pre_install.htm#LADBI1188](http://docs.oracle.com/cd/E11882_01/install.112/e47689/pre_install.htm#LADBI1188)

在上个页面的`2.12`章节**Checking Resource Limits for the Oracle Software Installation Users**描述了需要修改的资源限制参数

```sh
[root@CentOS64 oracle]# vi /etc/security/limits.conf  (将以下配置拷到sysctl.conf文件末尾，然后保存即可)
oracle           hard    nofile          65536
oracle           hard    nproc           16384
oracle           soft    nproc           2047
oracle           hard    stack           32768
```

# 安装

有两种方式安装，一个是有图形界面的可视化安装，一个是无图形界面的静默安装

这里演示的是有图形界面的安装

首先打开Win7系统中安装的`Xmanager_Enterprise_4`组件中的`Xmanager-Passive`工具（它会自动最小化到右下角任务栏）

然后以oracle用户执行`./runInstaller`命令（接下来Xmanager-Passive就自动起作用了，Oracle安装界面自动呈现出来了）

1. Configure Security Updates<br>
   取消勾选I wish to receive security Updates via My Oracle Support<br>
   此时点Next后会弹出来一个窗口You have not provided an email address，我们点Yes就行了
2. Download Software Updates：勾选Skip software udpates
3. Installation Option：勾选Install database software only
4. Grid Installation Options：勾选Single instance database installation<br>
   不能选择RAC，因为CentOS上是没法安装RAC的，这是由于Oracle只会在它自己的Linux发布RAC所需要一些特殊软件和包
5. Product Languages：默认的English就行
6. Database Edition：勾选Enterprise Edition(4.5GB)
7. Installation Location：这里Oracle Base和Software Location会自动找到之前设置的环境变量设定的安装目录
8. Create Inventory<br>
   Inventory Directory值修改为`/home/oracle/oraInventory`（Inventory Directory指的是Oracle的配置文件目录）<br>
   oraInventory Group Name采用默认的oinstall就行
9. Operating System Groups<br>
   Database Administrator(OSDBA) Group采用默认的dba选项就行<br>
   Database Operator(OSOPER) Group(Optional)也采用默认的空选项就行
10. Prerequisite Checks<br>
    这一步就是在检查之前设置的内核参数、所需的包等等是否满足Oracle的安装要求<br>
    这一步可能会提示缺少`pdksh-5.2.14`的包，对于pdksh而言，我们可以忽略掉，点击右上角的Ingore All<br>
    （如果是提示缺少其它包，还要仔细看一下）<br>
    然后会弹出个对话框[INS-13016]You have chosen to ingore some of the prerequisite....Are you sure you want to continue?<br>
    这里点Yes就行
11. Summary：这一步会告诉我们都设置了哪些安装参数，然后点Install就行了
12. Install Product<br>
    这一步就是开始安装了，我们看着它安装就行了
    经过漫长的等待，它会弹出一个对话框The following configuration scripts need to be executed as the "root" use<br>
    并会列出两个脚本路径给我们`/home/oracle/oraInventory/orainstRoot.sh`和`/app/oracle/root.sh`<br>
    我们回到Xshell中，以root登录，分别执行这俩脚本（先执行orainstRoot.sh，再执行root.sh）<br>
    两个脚本执行完毕，再回到Oracle安装界面，在这个弹出的对话框中点击"OK"就行了
13. Finish：The installation of Oracle Database was successfull.

# 创建数据库

先创建一个Listener

```sh
[oracle@CentOS64 oracle]$ netca             (控制台会打印Oracle Net Services Configuration，稍候会自动弹出图形界面)
[oracle@CentOS64 oracle]$ ps -ef | grep lsn (图形界面创建Listener完毕后，通过这个命令就可以看到Listener是否启动了)
```

然后再创建数据库

```sh
[oracle@CentOS64 oracle]$ dbca (该命令会自动弹出创建数据库的图形界面，Database Configuration Assistant，创建过程一共有12步)
1of12：选择Create a Database
2of12：选择General Purpose or Transaction Processing，即通用的
3of12：建议输入和上面配置的环境变量中的ORACLE_SID相同，即xuanyu
4of12：取消勾选Configure Enterprise Manager
5of12：设置管理员口令，这里点击Next时可能会弹出提示你设置的密码不安全Do you want to continue，我们选择Yes就行
6of12：Storage Type就默认的File System就行，Storage Locations也是默认的Use Database File Locations from Template就行
7of12：勾选Enable Archiving（即设置归档），另外Specify Fast Recovery Area就按照默认的勾选即可
8of12：勾选Sample Schemas
9of12：Character Sets标签下勾选Use Unicode(AL32UTF8)字符集，其余三个标签按照默认即可
10of12：一些说明文字，直接Next就行
11of12：也是按照它默认的勾选Create Database就行，然后点击Finish开始创建（这是它会弹出一个总结报告的对话框，点击OK即可）
12of12：接下来就会看到我们所熟悉的创建数据库的界面，这个过程比较漫长，我们等待即可
[oracle@CentOS64 oracle]$ ps -ef | grep ora_ (图形界面创建数据库完毕后，通过这个命令就可以看到Oracle实例是否在运行了)
```

# 关闭数据库

```sql
[oracle@CentOS64 oracle]$ sqlplus /nolog     (启动SQLPLUS)
SQL> conn /as sysdba
Connected.
SQL> SELECT * FROM v$version;                (查看Oracle版本)
SQL> shutdown immediate                      (关闭数据库)
Database closed.
Database dismounted.
ORACLE instance shut down.
SQL> quit                                    (退出SQLPLUS)
[oracle@CentOS64 oracle]$ ps -ef | grep ora_ (这时会发现没有任何打印，说明数据库被停止了)
```

# 启动数据库

```sql
[oracle@CentOS64 oracle]$ sqlplus /nolog     (启动SQLPLUS)
SQL> conn /as sysdba
Connected to an idle instance.
SQL> startup                                 (启动数据库)
ORACLE instance started.
Total System Global Area  845348864 bytes
Fixed Size                  1367904 bytes
Variable Size             549453984 bytes
Database Buffers          289406976 bytes
Redo Buffers                5120000 bytes
Database mounted.
Database opened.
SQL> !                                       (退出SQLPLUS)
[oracle@CentOS64 oracle]$ ps -ef | grep ora_ (这时会发现打印出一大堆东西，说明数据库被启动了)
```

# RLwrap安装和配置

Linux中安装完Oracle后，默认的`sqlplus`上下键是不能用的，安装了`rlwrap`之后就能通过上下键翻回历史命令了

其官网为[http://utopia.knoware.nl/~hlub/rlwrap/](http://utopia.knoware.nl/~hlub/rlwrap/)，最终版为`rlwrap-0.37.tar.gz`，作者已经不开发了

下面演示的是源码安装的过程

```sh
[root@CentOS64 software]# tar zxvf rlwrap-0.37.tar.gz
[root@CentOS64 software]# cd rlwrap-0.37
[root@CentOS64 rlwrap-0.37]# ./configure && make && make install (本为三步操作，这里用&&符号连接成一步操作)
[root@CentOS64 rlwrap-0.37]# rlwrap -v                           (输出rlwrap 0.37表明安装成功)
```

配置方式如下

```sh
[root@CentOS64 rlwrap-0.37]# which rlwrap
/usr/local/bin/rlwrap
[root@CentOS64 rlwrap-0.37]# su - oracle
[oracle@CentOS64 ~]$ vi .bash_profile
在.bash_profile最后一行加上alias sqlplus='rlwrap sqlplus'即可
表明以后执行sqlplus命令时自动执行rlwrap sqlplus命令，这样RLwrap就生效了
```

注意，如果使用的是`CentOS-6.4-minimal`系统，那么在安装RLwrap过程中可能会出现下面这些错误提示

```
1. checking build system type...
   Invalid configuration `x86_64-unknown-linux-': machine `x86_64-unknown-linux'not recognized
   configure: error: /bin/sh tools/config.sub x86_64-unknown-linux- failed
   解决：需要安装GCC，执行命令：yum install -y gcc
2. You need the GNU readline library(ftp://ftp.gnu.org/gnu/readline/) to build this program!
   解决：需要安装libtermcap-devel，执行命令：yum install -y libtermcap-devel
        实际上RLwrap的安装需要两个依赖包：readline和libtermcap-devel
        readline一般都会集成在Linux里，所以这里直接安装libtermcap-devel
3. bash: make: command not found
   解决：需要安装make，执行命令：yum install -y make*
```