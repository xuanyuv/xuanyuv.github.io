---
layout: post
title: "Linux命令小结"
categories: Linux
tags: linux 命令
author: 玄玉
excerpt: 介绍常用的Linux命令。
---

* content
{:toc}


**wget** https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-3.2.10.tgz

**curl** -X POST -H "Content-Type: application/json" -d '{"tenantId":"0"}' "http://127.0.0.1:2000/mpp/syncFans"

**zip** -9r mpp.201305090010.zip mpp-2.0.jar【*zip -9r mpp.$(date "+%Y%m%d%H%M%S").zip mpp-2.0.jar*】

**unzip** mpp.201305090010.zip【*unzip mpp.201305090010.zip -d ../code/*】

## grep

```shell
# 统计"keyword"出现在日志中的次数
grep -c "无磁无密" default.log

# 统计"keyword"出现在日志中的行数
grep -n "无磁无密" default.log

# 统计"keyword"出现在日志中的行数，并对"keyword"增加颜色显示（也可以不指定为auto，二者等效）
grep --color -n "无磁无密" default.log
grep --color=auto -n "无磁无密" default.log

# "keyword"颜色增强显示，并显示它出现在日志中行数，同时把前 3 行与后 3 行内容也显示出来
grep --color -n -C3 "20170815193506520" union.log
# "keyword"颜色增强显示，并显示它出现在日志中行数，同时把前 2 行与后 3 行内容也显示出来
grep --color -n -A3 -B2 "20170815193506520" union.log

# 当前目录搜索内容包含"keyword"的文件，并显示其所在那一行的内容及行数，同时颜色增强显示"keyword"
grep --color -n "20170815193506520" *

# 递归搜索当前目录及其子目录中，内容包含"keyword"的文件名
grep -l -r "20170815193506520" *
```

## history

```shell
# 输出最为常用的十条命令，由此可以看出你是一个什么类型的程序员
# 另外，可以直接使用[history]查看以往执行过的命令，然后通过[!number]执行指定编号的历史命令
[xuanyu@dev ~]$ history|awk '{CMD[$2]++;count++;} END {for(a in CMD)print CMD[a]" "CMD[a]/count*100 "% " a}'|grep -v "./"|column -c3 -s " " -t|sort -nr|nl|head -n10
     1  47  20.0855%   cd
     2  38  16.2393%   ll
     3  18  7.69231%   pwd
     4  12  5.12821%   vi
     5  12  5.12821%   exit
     6  12  5.12821%   ab
     7  8   3.4188%    halt
     8  8   3.4188%    cat
     9  7   2.99145%   su
    10  7   2.99145%   rm
[xuanyu@dev ~]$ history|awk '{print $2}'|awk 'BEGIN {FS="|"} {print $1}'|sort|uniq -c|sort -rn|head -10
     47 cd
     38 ll
     18 pwd
     12 vi
     12 exit
     12 ab
      8 halt
      8 cat
      7 su
      7 rm
[xuanyu@dev ~]$
```

## 查端口

```shell
# 查看主机监听的端口（ss 要比 netstat 更高效）
[xuanyu@dev ~]$ ss -lnt
State       Recv-Q Send-Q            Local Address:Port               Peer Address:Port              
LISTEN      0      128                           *:111                           *:*                  
LISTEN      0      128                           *:22                            *:*                  
LISTEN      0      100                   127.0.0.1:25                            *:*                  
LISTEN      0      128                        [::]:111                        [::]:*                  
LISTEN      0      100                       [::1]:25                         [::]:*                  
LISTEN      0      128                        [::]:3003                       [::]:*                  
LISTEN      0      128                        [::]:9090                       [::]:*

# 查询指定端口的监听及运行情况
# 其它的诸如[ps -ef|grep java]、[kill -9 PID]、[nohup ./startup.sh &]、[free]、[top]等等就不举例了
[xuanyu@dev ~]$ netstat -tlanop | grep :80
tcp     0     0 :::8080                     :::*         LISTEN      5053/java      off (0.00/0/0)
tcp     0     0 ::ffff:192.168.8.31:80      :::*         LISTEN      17608/java     off (0.00/0/0)
[xuanyu@dev ~]$ lsof -i:80
COMMAND   PID USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME
java    17608 root  163u  IPv6 29073040      0t0  TCP bjgg-kfvm-31:http (LISTEN)
[xuanyu@dev ~]$
```

## 查日志

```shell
# 根据指定的关键字查询日志（关键字需用双引号括起来，并注意不要出现'>''-'等特殊字符）
[xuanyu@dev ~]$ less -p "无磁无密" default.log
[20121121040952][pool-3-thread-9][NoCardNoPasswordPaymentAction]无磁无密-->检查商户请求参数有效性,检查结果:[参数有效]
[20121121040952][pool-3-thread-9][NoCardNoPasswordPaymentAction]无磁无密-->对商户请求参数进行验签,验签结果:[验签通过]
[20121121040952][pool-3-thread-9][NoCardNoPasswordPaymentAction]无磁无密-->请求支付处理报文[000283`tea`BOC`YEEPAY`]
[20121121040952][pool-3-thread-9][NoCardNoPasswordPaymentAction]无磁无密-->支付处理响应报文[000156信用卡^@^@^@2012]

# 1、也可以直接使用[less logfile]，然后再键入"/keyword"来按照关键字查询日志
#    当通过keyword找到日志后，便可使用向上或向下箭头来查看前后的日志，退出日志查看时直接按下Q键（大小写均可）即可
#    其相比[vi]命令的优点是：日志载入查询快，它是读一行解析一行的，而不是一次都载入内存
# 2、另附less到日志里面后的几个用法
#    [gg]为定位到日志第一行，[G]为定位到日志最后一行，[/keyword]为向下搜索，[?keyword]为向上搜索
#    [n]为向前搜索，[N]为向后搜索（注意措辞：就是说当使用[?]时，[n]就是向上搜索，使用[/]时，[n]就是向下搜索）
# 3、还有一个[tail]也比较常用，用法为[tail -1000f logfile]，作用是实时显示日志的后1000行，达到实时监视的效果
#    参数[-f]会不停地读取最新的内容，使用[Ctrl+c]可以终止日志显示

# 清空日志
# 比较常用的两种方式：[>nohup.log]、[echo "" > nohup.log]
# 另：可以通过[lsof nohup.log]查看占用nohup.log的进程信息，然后再用[pwdx PID]就能看到该进程的工作路径
```

## 获取IP

```shell
[xuanyu@dev ~]$ ifconfig -a
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.1  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::216:3eff:fe37:b9a7  prefixlen 64  scopeid 0x20<link>
        ether 00:16:3e:37:b9:a7  txqueuelen 1000  (Ethernet)
        RX packets 144586  bytes 186092131 (177.4 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 38674  bytes 6727428 (6.4 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

# 用下面的命令即可
ifconfig -a | grep inet | grep -v 127.0.0.1 | grep -v inet6 | awk '{print $2}'
# ifconfig -a       //返回本机的所有IP信息
# grep inet         //截取包含IP的行
# grep -v 127.0.0.1 //去掉本地指向的那行
# grep -v inet6     //去掉包含inet6的那行
# awk { print $2}   //$2表示默认以空格分割的第二组，同理$1表示第一组
# 所以下面这个命令也能获取
ifconfig eth0| grep inet | grep -v inet6 | awk '{ print $2}'

# 若写成shell脚本，就是这样的
#!/bin/sh
NETWORK_CARD_NAME=eth0
HOST_IP=$(ifconfig $NETWORK_CARD_NAME | grep inet | grep -v inet6 | awk '{ print $2}')
echo $HOST_IP
```

## PID情况

```shell
#! /bin/bash
# Function: 根据用户输入的PID，过滤出该PID所有的信息
read -p "请输入要查询的进程PID: " P
n=`ps -aux| awk '$2~/^'$P'$/{print $11}'|wc -l`
if [ $n -eq 0 ];then
 echo "该进程PID不存在"
 exit
fi
echo "--------------------------------------------"
echo "PID: $P"
echo "CPU占用率：`ps -aux| awk '$2~/^'$P'$/{print $3}'`%"
echo "内存占用率：`ps -aux| awk '$2~/^'$P'$/{print $4}'`%"
echo "进程共享内存：`ps -aux| awk '$2~/^'$P'$/{print $6/1024}'`(MB)"
echo "进程虚拟内存：`ps -aux| awk '$2~/^'$P'$/{print $5}'`(KB)"
echo "进程所属用户: `ps -aux| awk '$2~/^'$P'$/{print $1}'`"
echo "进程命令：`ps -aux| awk '$2~/^'$P'$/{print $11}'`"
echo "进程状态：`ps -aux| awk '$2~/^'$P'$/{print $8}'`"
echo "进程运行的时间：`ps -aux| awk '$2~/^'$P'$/{print $10}'`"
echo "进程开始运行的时刻：`ps -aux| awk '$2~/^'$P'$/{print $9}'`"
echo "--------------------------------------------"
```

## 查看空间

* du（disk usage）：通过搜索文件，来计算，每个文件的大小，然后累加得到的值
* df（disk free）：通过文件系统，来获取，空间大小的信息

如果用户删除了一个正在运行的应用程序所打开的某个目录下的文件，那么：

1. du：显示的是减去了该文件后的总大小
2. df：不显示减去该文件后的大小（文件句柄还在被使用），直到该应用程序关闭了此文件（才会真正释放空间）

**场景举例**

常见的场景就是：删除了一个很大的正在写入的 tomcat 的 access 日志

**du** 显示的结果会把日志大小减去，**df** 则仍会包含该日志的大小（实际上 tomcat 仍引用着该文件的句柄）

所以：若要删除某个 access 日志，不要粗暴的 **rm**，而要温柔的：`echo "" > access.log`

因为：**df** 的结果若是磁盘已被占满，那么会导致新日志打不出来，或者其他应用在该磁盘上打不出日志

**那么如何发现被应用程序引用着“已删除”文件呢？**

答案：使用 **lsof（list open files）** 命令查看打开的文件，比如 `lsof | grep deleted`

下面列出一些常用的命令

```shell
# 查看整体目录占用空间
[root@dev ~]$ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda2        20G  7.2G   12G  39% /
tmpfs           1.9G     0  1.9G   0% /dev/shm
/dev/sda1       504M   38M  442M   8% /boot
/dev/sda5        16G  1.4G   14G  10% /home
[root@dev ~]$

# 查看指定目录占用空间
[root@dev ~]$ du -sh /app/tomcat8.0.21/

# 列出当前目录里最大的10个文件
[root@dev ~]$ du -s * | sort -n | tail

# 列出当前目录各个文件及其大小，并以大小倒序排序
# （参数大S用于指定排序，也可以加-a，表示all即显示包括隐藏文件在内的所有文件）
[root@dev ~]$ ls -lhS
```

## 监控服务器

用得比较多的就是 `htop` 命令了，CentOS 上安装命令为：`yum install -y htop`

使用时，直接敲入 htop 再回车即可，下面是监控截图

![](https://s2.loli.net/2024/04/22/tyfd8KLcvTIHazi.jpg)

## 默认登录目录

```shell
# 全局配置用户登录后的默认目录，以及 ll 命令直接显示文件列表及大小
[root@dev ~]$ vim /etc/bashrc
              # 文件内容尾部，增加以下两行
              alias ll='ls -lh --color=auto'
              cd /app/backend/logs/open/
[root@dev ~]$ source /etc/bashrc # 令配置生效
```