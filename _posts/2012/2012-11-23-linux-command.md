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


# scp

```ruby
scp mongodb-linux-x86_64-3.2.10.tgz root@10.16.30.72:/root/
The authenticity of host '10.16.30.72 (10.16.30.72)' can't be established.
RSA key fingerprint is 42:e8:0d:6b:77:8c:05:5a:1b:21:d7:1c:bb:76:49:48.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.16.30.72' (RSA) to the list of known hosts.
root@10.16.30.72's password:
mongodb-linux-x86_64-3.2.10.tgz                                                                                                                                 100%   73MB  73.3MB/s   00:01
```

# wget

```ruby
wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-3.2.10.tgz
--2016-11-08 12:14:17--  https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-3.2.10.tgz
Resolving fastdl.mongodb.org... 54.192.141.215, 54.192.141.68, 54.192.141.206, ...
Connecting to fastdl.mongodb.org|54.192.141.215|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 76836431 (73M) [application/x-gzip]
Saving to: "mongodb-linux-x86_64-3.2.10.tgz"

100%[========================================================================================================================================================>] 76,836,431  3.70M/s   in 22s

2016-11-08 12:14:40 (3.36 MB/s) - "mongodb-linux-x86_64-3.2.10.tgz" saved [76836431/76836431]
```

# grep

```ruby
# 统计"keyword"出现在日志中的次数
grep -c "无磁无密" default.log

# 统计"keyword"出现在日志中的行数
grep -n "无磁无密" default.log

# 统计"keyword"出现在日志中的行数，并对"keyword"增加颜色显示（也可以不指定为auto，二者等效）
grep --color -n "无磁无密" default.log
grep --color=auto -n "无磁无密" default.log

# "keyword"颜色增强显示，并显示它出现在日志中行数，同时把前两行与后三行也显示出来
grep --color -n -A3 -B2 "20170815193506520" union.log

# 当前目录搜索内容包含"keyword"的文件，并显示其所在那一行的内容及行数，同时颜色增强显示"keyword"
grep --color -n "20170815193506520" *

# 递归搜索当前目录及其子目录中，内容包含"keyword"的文件名
grep -l -r "20170815193506520" *
```

# history

```ruby
# 输出最为常用的十条命令，由此可以看出你是一个什么类型的程序员
# 另外，可以直接使用[history]查看以往执行过的命令，然后通过[!number]执行指定编号的历史命令
[Jadyer@Jadyer-RHEL63 ~]$ history|awk '{CMD[$2]++;count++;} END {for(a in CMD)print CMD[a]" "CMD[a]/count*100 "% " a}'|grep -v "./"|column -c3 -s " " -t|sort -nr|nl|head -n10
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
[Jadyer@Jadyer-RHEL63 ~]$ history|awk '{print $2}'|awk 'BEGIN {FS="|"} {print $1}'|sort|uniq -c|sort -rn|head -10
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
[Jadyer@Jadyer-RHEL63 ~]$
```

# 查CPU

```ruby
# 查看CPU个数
[root@dev3 ~]# grep -c "processor" /proc/cpuinfo
8

# 查看CPU基本信息
[root@dev3 ~]# lscpu
Architecture:          x86_64
CPU op-mode(s):        32-bit, 64-bit
Byte Order:            Little Endian
CPU(s):                8
On-line CPU(s) list:   0-7
Thread(s) per core:    1
Core(s) per socket:    1
Socket(s):             8
NUMA node(s):          1
Vendor ID:             GenuineIntel
CPU family:            6
Model:                 63
Stepping:              2
CPU MHz:               1599.998
BogoMIPS:              3199.99
Hypervisor vendor:     VMware
Virtualization type:   full
L1d cache:             32K
L1i cache:             32K
L2 cache:              256K
L3 cache:              15360K
NUMA node0 CPU(s):     0-7

# 查看CPU使用情况（top命令，然后再按数字1）
[root@dev3 ~]# top
top - 13:05:00 up 51 days,  3:25,  2 users,  load average: 0.02, 0.01, 0.00
Tasks: 231 total,   1 running, 230 sleeping,   0 stopped,   0 zombie
Cpu0  :  1.4%us,  0.3%sy,  0.0%ni, 98.3%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu1  :  0.7%us,  0.7%sy,  0.0%ni, 98.7%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu2  :  2.0%us,  1.3%sy,  0.0%ni, 96.3%id,  0.0%wa,  0.0%hi,  0.3%si,  0.0%st
Cpu3  :  3.0%us,  0.7%sy,  0.0%ni, 96.3%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu4  :  1.0%us,  0.0%sy,  0.0%ni, 99.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu5  : 10.4%us,  6.2%sy,  0.0%ni, 82.7%id,  0.0%wa,  0.0%hi,  0.7%si,  0.0%st
Cpu6  :  1.7%us,  0.7%sy,  0.0%ni, 97.3%id,  0.3%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu7  :  1.0%us,  0.3%sy,  0.0%ni, 98.7%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Mem:   8060880k total,  7886784k used,   174096k free,   194724k buffers
Swap:  8388600k total,  2571452k used,  5817148k free,  2378820k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
 2804 root      20   0 7777m 665m 5932 S 25.9  8.5   8501:14 java
13931 root      20   0 6286m 1.0g 3204 S  5.3 12.8 765:07.95 java
 4287 mysql     20   0 5420m 319m 7600 S  2.3  4.1 694:08.76 mysqld
32049 root      20   0  595m  35m 1508 S  1.3  0.5 150:46.29 python
 8010 root      20   0  522m  50m 3072 S  1.0  0.6 217:18.45 mongod
 9844 root      20   0 15156 1440 1004 R  0.3  0.0   0:00.09 top
22442 root      20   0 38740 2228  864 S  0.3  0.0  27:56.58 redis-server
24010 root      20   0 5802m 683m 5192 S  0.3  8.7  52:23.36 java
    1 root      20   0 19232  660  456 S  0.0  0.0   0:01.62 init
    2 root      20   0     0    0    0 S  0.0  0.0   0:00.00 kthreadd
    3 root      RT   0     0    0    0 S  0.0  0.0   0:16.13 migration/0
    4 root      20   0     0    0    0 S  0.0  0.0   1:04.70 ksoftirqd/0
    5 root      RT   0     0    0    0 S  0.0  0.0   0:00.00 migration/0
    6 root      RT   0     0    0    0 S  0.0  0.0   0:05.00 watchdog/0
    7 root      RT   0     0    0    0 S  0.0  0.0   0:17.21 migration/1
    8 root      RT   0     0    0    0 S  0.0  0.0   0:00.00 migration/1
    9 root      20   0     0    0    0 S  0.0  0.0   0:50.88 ksoftirqd/1
```

# 查端口

```ruby
# 查询指定端口的监听及运行情况
# 其它的诸如[ps -ef|grep java]、[kill -9 PID]、[nohup ./startup.sh &]、[free]、[top]等等就不举例了
[Jadyer@Jadyer-RHEL63 CucPayTradePortalLog]$ netstat -tlanop | grep :80
tcp        0      0 :::8080                     :::*                        LISTEN      5053/java           off (0.00/0/0)
tcp        0      0 ::ffff:192.168.8.31:80      :::*                        LISTEN      17608/java          off (0.00/0/0)
[Jadyer@Jadyer-RHEL63 CucPayTradePortalLog]$ lsof -i:80
COMMAND   PID USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME
java    17608 root  163u  IPv6 29073040      0t0  TCP bjgg-kfvm-31:http (LISTEN)
[Jadyer@Jadyer-RHEL63 CucPayTradePortalLog]$
```

# 查日志

```ruby
# 根据指定的关键字查询日志（关键字需用双引号括起来，并注意不要出现'>''-'等特殊字符）
[Jadyer@Jadyer-RHEL63 CucPayTradePortalLog]$ less -p "无磁无密" default.log
[20121121 04:09:52][pool-3-thread-9][NoCardNoPasswordPaymentAction]无磁无密-->检查商户请求参数的有效性,检查结果:[参数有效]
[20121121 04:09:52][pool-3-thread-9][NoCardNoPasswordPaymentAction]无磁无密-->对商户的请求参数进行验签,验签结果:[验签通过]
[20121121 04:09:52][pool-3-thread-9][NoCardNoPasswordPaymentAction]无磁无密-->发往支付处理的报文[0002831101520600001201211210409520673308396701248842791`tea`中国`GB18030`GDB_CREDIT`MD5`05_YEEPAY_1`]
[20121121 04:09:52][pool-3-thread-9][NoCardNoPasswordPaymentAction]无磁无密-->支付处理的响应报文[00015610122502该支付方式只支持信用卡^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@
^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@201210310000121846512012112104093520121031]

# 1、也可以直接使用[less logfile]，然后再键入"/keyword"来按照关键字查询日志
#    当通过keyword找到日志后，就可以使用向上或向下箭头来查看前后的日志，退出日志查看时直接按下Q键（大小写均可）即可
#    其相比[vi]命令的优点是：日志载入查询快，它是读一行解析一行的，而不是一次都载入内存
# 2、另附less到日志里面后的几个用法
#    [gg]为定位到日志第一行，[G]为定位到日志最后一行，[/keyword]为向下搜索，[?keyword]为向上搜索
#    [n]为向前搜索，[N]为向后搜索（注意这里的措辞：就是说当使用[?]时，[n]就是向上搜索，使用[/]时，[n]就是向下搜索）
# 3、还有一个[tail]也是比较常用的，用法为[tail -1000f logfile]，作用是实时地显示日志的后1000行，达到实时监视的效果
#    参数[-f]会不停地读取最新的内容，使用[Ctrl+c]可以终止日志显示
```

# 查看空间

```ruby
# 查看整体目录占用空间
[root@wxtest webapps]# df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda2        20G  7.2G   12G  39% /
tmpfs           1.9G     0  1.9G   0% /dev/shm
/dev/sda1       504M   38M  442M   8% /boot
/dev/sda5        16G  1.4G   14G  10% /home
[root@wxtest webapps]#

# 查看指定目录占用空间
[root@wxtest webapps]# du -sh /opt/tomcat8.0.21/
429M	/opt/tomcat8.0.21/
[root@wxtest webapps]#

# 列出当前目录里最大的10个文件
[root@wxtest webapps]# du -s * | sort -n | tail
4344	fwcdemo
28380	oppp.war
28380	opp.war
32772	oppp
32948	opp
48128	ROOT
48920	open.war
60044	open
61852	WEB-INF
65608	mpp
[root@wxtest webapps]#

# 列出当前目录各个文件及其大小，并以大小倒序排序（参数大S用于指定排序，也可以加-a，表示all即显示包括隐藏文件在内的所有文件）
[root@wxtest webapps]# ls -lhS
total 107M
-rw-r--r--  1 root root  48M Dec 16 10:01 open.war
-rw-r--r--. 1 root root  28M Aug 15 14:15 opp.war
-rw-r--r--. 1 root root  28M Aug  5 18:27 oppp.war
-rw-r--r--. 1 root root 3.8M Aug  1 20:53 fwcdemo.war
drwxr-xr-x. 5 root root 4.0K Aug  1 20:53 fwcdemo
drwxr-xr-x  3 root root 4.0K Oct 13 11:19 META-INF
drwxr-xr-x  7 root root 4.0K Dec 21 15:15 mpp
drwxr-xr-x  4 root root 4.0K Dec 16 10:04 open
drwxr-xr-x. 5 root root 4.0K Aug 15 14:17 opp
drwxr-xr-x. 5 root root 4.0K Aug  5 18:29 oppp
drwxrwxrwx. 4 root root 4.0K May 27  2016 ROOT
drwxr-xr-x  4 root root 4.0K Oct 13 11:19 WEB-INF
-rw-r--r--  1 root root   16 Dec 21 15:18 MP_verify_LVXtUAXFgaVTGmFu.txt
[root@wxtest webapps]# ls -lh
total 107M
drwxr-xr-x. 5 root root 4.0K Aug  1 20:53 fwcdemo
-rw-r--r--. 1 root root 3.8M Aug  1 20:53 fwcdemo.war
drwxr-xr-x  3 root root 4.0K Oct 13 11:19 META-INF
drwxr-xr-x  7 root root 4.0K Dec 21 15:15 mpp
-rw-r--r--  1 root root   16 Dec 21 15:18 MP_verify_LVXtUAXFgaVTGmFu.txt
drwxr-xr-x  4 root root 4.0K Dec 16 10:04 open
-rw-r--r--  1 root root  48M Dec 16 10:01 open.war
drwxr-xr-x. 5 root root 4.0K Aug 15 14:17 opp
drwxr-xr-x. 5 root root 4.0K Aug  5 18:29 oppp
-rw-r--r--. 1 root root  28M Aug  5 18:27 oppp.war
-rw-r--r--. 1 root root  28M Aug 15 14:15 opp.war
drwxrwxrwx. 4 root root 4.0K May 27  2016 ROOT
drwxr-xr-x  4 root root 4.0K Oct 13 11:19 WEB-INF
[root@wxtest webapps]#
```

# 文件解压缩

```ruby
# 压缩
zip -9r ../codebak/CucPayTradePortal_20130509.zip CucPayTradePortal

# 解压
unzip CucPayTradePortal_20130509.zip -d ../code/

# 压缩bb.txt和cc.txt文件为aa.zip文件
zip aa.zip bb.txt cc.txt

# 压缩bb.txt成aa.zip后，自动删除bb.txt文件
zip -m aa.zip bb.txt

# 解压除bb.txt文件之外的其它文件
unzip aa.zip -x bb.txt

# 不解压查看zip内容，也可以用-l、-Z（大写）参数，都是不解压查看
unzip -v aa.zip
```