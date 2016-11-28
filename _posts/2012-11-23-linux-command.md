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


## scp

```ruby
scp mongodb-linux-x86_64-3.2.10.tgz root@10.16.30.72:/root/
The authenticity of host '10.16.30.72 (10.16.30.72)' can't be established.
RSA key fingerprint is 42:e8:0d:6b:77:8c:05:5a:1b:21:d7:1c:bb:76:49:48.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.16.30.72' (RSA) to the list of known hosts.
root@10.16.30.72's password:
mongodb-linux-x86_64-3.2.10.tgz                                                                                                                                 100%   73MB  73.3MB/s   00:01
```

## wget

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

## grep

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

## 查看CPU

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

## 查看空间

```ruby
# 查看整体目录占用空间
df -h

# 查看指定目录占用空间
du -sh /app/log
```

## 文件解压缩

```ruby
# 压缩
zip -9r ../codebak/CucPayTradePortal_20130509.zip CucPayTradePortal

# 解压
unzip CucPayTradePortal_20130509.zip -d ../code/
```