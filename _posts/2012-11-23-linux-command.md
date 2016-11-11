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

## 查看空间

```ruby
# 查看整体目录占用空间
df -h

# 查看指定目录占用空间
du -sh /app/log
```