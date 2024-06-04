---
layout: post
title: "Prometheus结合Grafana搭建监控工具"
categories: Linux
tags: Linux
author: 玄玉
excerpt: 通过开源软件Prometheus、Grafana搭建可以监控服务器、mysql、redis等等的监控系统。
published: true
---

* content
{:toc}


普罗米修斯是一款开源的监控软件，它通过 exporter 的方式（可以理解为监控适配器）

将各种中间件以及第三方的监控数据，统一转化为 Prometheus 能够识别的指标类型

下面是常见的几种 exporter：

* node_exporter：读取 /proc/、/sys/ 等目录的系统文件，来获取 Linux 的运行状态
* mysqld_exporter：读取数据库监控表，来获取 MySQL 的性能数据
* redis_exporter：监控 Redis 数据（支持 Redis Cluster）

对应的下载地址及 sha256sums 如下：

* [prometheus-2.45.5.linux-amd64.tar.gz（https://prometheus.io/download/）](https://github.com/prometheus/prometheus/releases/download/v2.45.5/prometheus-2.45.5.linux-amd64.tar.gz)<br/>
  SHA256：65a61cec978eb44a2a220803a4653e6f1f2dbe69510131a867492981ef39f253
* [node_exporter-1.8.1.linux-amd64.tar.gz（https://prometheus.io/download/）](https://github.com/prometheus/node_exporter/releases/download/v1.8.1/node_exporter-1.8.1.linux-amd64.tar.gz)<br/>
  SHA256：fbadb376afa7c883f87f70795700a8a200f7fd45412532cc1938a24d41078011
* [mysqld_exporter-0.15.1.linux-amd64.tar.gz（https://prometheus.io/download/）](https://github.com/prometheus/mysqld_exporter/releases/download/v0.15.1/mysqld_exporter-0.15.1.linux-amd64.tar.gz)<br/>
  SHA256：85ea5bc68e1b9f466c1df10ff016652dd210371d42245e012b876265e89ae29d
* [redis_exporter-v1.59.0.linux-amd64.tar.gz（https://github.com/oliver006/redis_exporter/）](https://github.com/oliver006/redis_exporter/releases/download/v1.59.0/redis_exporter-v1.59.0.linux-amd64.tar.gz)<br/>
  SHA256：7ad805a21d9423a721e6a0c48190d14b9f18a11507ee3eafbf84df11c71c3b4d
* [grafana-11.0.0.linux-amd64.tar.gz（https://grafana.com/grafana/download）](https://dl.grafana.com/oss/release/grafana-11.0.0.linux-amd64.tar.gz)<br/>
  SHA256：97c70aa4fd11aa75bbb575d7d48764cb3a6c3356b53f34c7750c0dd7e006204d
  
另外，下载软件时，注意对应的 CPU 架构版本

| CPU 架构                    | 描述                       |
|:--------------------------|:-------------------------|
| x86_64 / x64 / amd64      | 64 位 AMD/Intel CPU 的别称   |
| AArch64 / ARMv8v9 / arm64 | 64 位 ARM CPU 的别称         |
| AArch32 / ARMv1v7 /arm    | 32 位 ARM CPU 的别称         |
| x86_32 / x86 / i386       | 32 位 AMD/Intel CPU 的别称   |
| rv64gc / rv64g            | 64 位 RISC-V CPU 的别称      |
| ppc64le                   | 64 位 PowerPC CPU，小端字节序存储 |

## Prometheus

```shell
[xuanyu@dev ~]$ cd /app/software/backup/
[xuanyu@dev backup]$ tar zxvf prometheus-2.45.5.linux-amd64.tar.gz
[xuanyu@dev backup]$ mv prometheus-2.45.5.linux-amd64 /app/software/prometheus-2.45.5
[xuanyu@dev backup]$ cd /app/software/prometheus-2.45.5/
[xuanyu@dev prometheus-2.45.5]$ ./prometheus --version
prometheus, version 2.45.5 (branch: HEAD, revision: 2b052add78646ff39d193dac84eae8855d11565a)
  build user:       root@98598c5dfe5e
  build date:       20240502-08:58:53
  go version:       go1.21.9
  platform:         linux/amd64
  tags:             netgo,builtinassets,stringlabels
[xuanyu@dev prometheus-2.45.5]$ vim start.sh
#!/bin/sh
cd /app/software/prometheus-2.45.5/
nohup ./prometheus --config.file=prometheus.yml > nohup.log 2>&1 &
[xuanyu@dev prometheus-2.45.5]$ chmod 755 start.sh
[root@dev ~]# vim /etc/rc.d/rc.local                  # 添加自启动
su xuanyu -c /app/software/prometheus-2.45.5/start.sh # 绝对路径，并临时以用户xuanyu的身份去执行该行
[root@dev ~]# chmod +x /etc/rc.d/rc.local             # 赋权，使其变成可执行文件
[root@dev ~]# reboot                                  # 最后，重启系统，验证
```

启动成功后，访问地址为：http://xxx.xxx.xxx.xxx:9090/

## Grafana

```shell
[xuanyu@dev ~]$ cd /app/software/backup/
[xuanyu@dev backup]$ tar zxvf grafana-11.0.0.linux-amd64.tar.gz -C /app/software/
[xuanyu@dev backup]$ cd /app/software/grafana-v11.0.0/
[xuanyu@dev grafana-v11.0.0]$ vim conf/defaults.ini
[server]
http_port = 3003
[database]
type = mysql
host = 127.0.0.1:3306
name = grafana
user = grafana_user
password = grafana_pwd
[xuanyu@dev grafana-v11.0.0]$ cd bin/
[xuanyu@dev bin]$ ./grafana server -v
Version 11.0.0 (commit: 277ef258d4b9a5acdf2932347c6a4ca72d739b28, branch: HEAD)
[xuanyu@dev bin]$ vim grafana-server.sh
#!/bin/sh
cd /app/software/grafana-v11.0.0/bin/
nohup ./grafana server > nohup.log 2>&1 &           # 最新版已不推荐使用：./grafana-server，故编写此中转脚本
[xuanyu@dev bin]$ vim start.sh                      # 最后，再编写真正的启动脚本，这样才能实现后台运行
#!/bin/sh
nohup sh /app/software/grafana-v11.0.0/bin/grafana-server.sh >/dev/null 2>&1 &
[xuanyu@dev bin]$ chmod 755 grafana-server.sh start.sh
[root@dev ~]# vim /etc/rc.d/rc.local                    # 添加自启动
su xuanyu -c /app/software/grafana-v11.0.0/bin/start.sh # 绝对路径，并临时以用户xuanyu的身份去执行该行
[root@dev ~]# chmod +x /etc/rc.d/rc.local               # 赋权，使其变成可执行文件
[root@dev ~]# reboot                                    # 最后，重启系统，验证
```

启动成功后，访问地址为：http://xxx.xxx.xxx.xxx:3003/，默认用户名和密码均为admin

## 未完待续

tar -zxvf node_exporter-1.5.0.linux-amd64.tar.gz

cd node_exporter-1.5.0.linux-amd64/

nohup ./node_exporter > nohup.log 2>&1 &