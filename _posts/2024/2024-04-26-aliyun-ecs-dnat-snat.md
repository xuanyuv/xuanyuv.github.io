---
layout: post
title: "简易跳板机连接内网服务器"
categories: Linux
tags: Linux ECS VPS 跳板机 SSH Tunnel
author: 玄玉
excerpt: 针对无外网IP的服务器，介绍本地SSH连接的方法，以及它访问外网的方法等。
published: true
---

* content
{:toc}


背景：阿里云上有 2 台 CentOS7.9，一台配备了公网IP（192.168.1.1），另一台无公网IP（192.168.0.1）

工具：xshell 4.0.00115 (Build 0223)

思路：借助 xshell 的隧道转发，将公网机器（192.168.1.1）做成跳板机，使得本地可以访问内网机器（192.168.0.1）

## 简易跳板机

这里介绍两种方式：Local (Outgoing) 和 Dynamic (SOCKS4/5)

**实际更推荐第二种：Dynamic (SOCKS4/5)**

> 注意：无论哪种方式，都要在阿里云网页后台配置安全组：192.168.0.1 机器的 22 端口允许 192.168.1.1 访问

### Local(Outgoing)

在本地机器的 xshell 作如下 2 步配置，即可：

1. 创建一个跳板机的 Session（可以随便给一个名字，这里就命名为跳板机）<br/>
   再配置其隧道转发方式，使得192.168.1.1 机器侦听 2200 端口，来与 192.168.0.1 机器的 22 端口建立隧道<br/>
   ![](https://gcore.jsdelivr.net/gh/jadyer/mydata/img/blog/2024/2024-04-26-aliyun-ecs-dnat-snat-01.png)<br/><br/>
   ![](https://gcore.jsdelivr.net/gh/jadyer/mydata/img/blog/2024/2024-04-26-aliyun-ecs-dnat-snat-02.png)<br/>
2. 然后创建一个连接内网机器的 Session<br/>
   连接配置中的 Authentication 处填入内网机器的用户名密码或 PublicKey，就行了（不用配置隧道）<br/>
   ![](https://gcore.jsdelivr.net/gh/jadyer/mydata/img/blog/2024/2024-04-26-aliyun-ecs-dnat-snat-03.png)<br/>

实际使用时，通过 xshell 先连跳板机，再连内网机器（所以上面创建了 2 个 xshell session）

并且，在连接到内网机器后，也支持使用 xftp 从本地电脑直接传输文件到内网机器上去

**注意：连接内网机器的过程中，若跳板机连接断开了，那么打开的所有内网机器连接都会自动断开**

关于这方面的更详细介绍，可参考这篇博客：[xshell tunnel的使用](https://www.cnblogs.com/oxspirt/p/10260053.html)

### Dynamic(SOCKS4/5)

如果有多台内网服务器：

* Local (Outgoing) 的方式：需要为每一台内网服务器，各配置一个单独的隧道
* Dynamic(SOCKS4/5)的方式：就省事很多，只配置一次隧道和代理，**因此更推荐**

具体的配置过程，同样经过 2 步：

1. 创建一个跳板机的 Session，隧道转发方式也只配置一个 Dynamic (SOCKS4/5) 类型<br/>
   ![](https://gcore.jsdelivr.net/gh/jadyer/mydata/img/blog/2024/2024-04-26-aliyun-ecs-dnat-snat-01.png)<br/><br/>
   ![](https://gcore.jsdelivr.net/gh/jadyer/mydata/img/blog/2024/2024-04-26-aliyun-ecs-dnat-snat-04.png)<br/>
2. 然后创建一个连接内网机器的 Session<br/>
   连接地址、端口、用户名密码都配置内网机器的就行，再配置一下代理即可（不用配置隧道）<br/>
   ![](https://gcore.jsdelivr.net/gh/jadyer/mydata/img/blog/2024/2024-04-26-aliyun-ecs-dnat-snat-05.png)<br/><br/>
   ![](https://gcore.jsdelivr.net/gh/jadyer/mydata/img/blog/2024/2024-04-26-aliyun-ecs-dnat-snat-06.png)<br/>

使用时，同样通过 xshell 先连跳板机，再连内网机器（也支持 xftp 传输文件到内网机器上）

也可以在 xshell 的隧道面板看到详细情况（xshell ---> View ---> Tunneling Pane）

## 访问互联网

内网机器（192.168.0.1）默认是无法访问互联网的

此时，可以借助公网机器（192.168.1.1）来达到访问互联网的目的（二者处于同一个 VPC）

共有 3 步配置 **（注意：全部都是在 192.168.1.1 上面配置的，192.168.0.1 全程不需要任何配置）**：

1. 开启 ECS 的 IP 转发功能
   ```shell
   [root@dev02 ~]# vim /etc/sysctl.conf
   net.ipv4.ip_forward = 1             # 添加这条配置（如果已有，则直接修改）
   [root@dev02 ~]# sysctl -p           # 令修改生效
   ```
2. 设置 SNAT 规则：分别执行以下命令
   ```shell
   # 先执行该命令
   iptables -t nat -I POSTROUTING -s 192.168.0.0/24 -j SNAT --to-source 192.168.1.1
   # 再执行该命令：即把它保存在 iptables 配置文件中（否则 iptables 规则重启会清空）
   service iptables save
   # 此时，查看 /etc/sysconfig/iptables 会发现它多了一条 SNAT 转发规则，如下所示
   # -A POSTROUTING -s 192.168.0.0/24 -j SNAT --to-source 192.168.1.1
   # 最后重启 iptables 使规则生效
   systemctl restart iptables.service
   ```
3. 在阿里云网页后台，添加自定义路由条目：<https://vpc.console.aliyun.com/vpc/cn-beijing/route-tables><br/>
   ![](https://gcore.jsdelivr.net/gh/jadyer/mydata/img/blog/2024/2024-04-26-aliyun-ecs-dnat-snat-07.png)<br/>

现在，192.168.0.1 就可以访问外网了，同 192.168.1.1 相比，速度几乎无影响

```shell
# 这是在跳板机（192.168.1.1）上的
[xuanyu@dev02 ~]$ ping www.baidu.com
PING www.a.shifen.com (220.181.38.149) 56(84) bytes of data.
64 bytes from 220.181.38.149 (220.181.38.149): icmp_seq=1 ttl=54 time=5.09 ms
64 bytes from 220.181.38.149 (220.181.38.149): icmp_seq=2 ttl=54 time=5.08 ms
64 bytes from 220.181.38.149 (220.181.38.149): icmp_seq=3 ttl=54 time=5.11 ms

# 这是在内网机器（192.168.0.1）上的
[xuanyu@prod01 ~]$ ping www.baidu.com
PING www.a.shifen.com (220.181.38.149) 56(84) bytes of data.
64 bytes from 220.181.38.149 (220.181.38.149): icmp_seq=1 ttl=53 time=6.75 ms
64 bytes from 220.181.38.149 (220.181.38.149): icmp_seq=2 ttl=53 time=6.73 ms
64 bytes from 220.181.38.149 (220.181.38.149): icmp_seq=3 ttl=53 time=6.71 ms
```

### 关于新版防火墙

CentOS 7.x 开始默认使用的是 firewall 作为防火墙，我们需要把它改为 iptables 防火墙

注意：firewalld 和 iptables 的配置和规则都有所不同，二者不能同时启动

```shell
# 关闭 firewall
systemctl stop firewalld.service
systemctl disable firewalld.service
systemctl mask firewalld.service
# 安装 iptables
yum install -y iptables-services
# 启动 iptables
systemctl enable iptables
systemctl start iptables
# 查看防火墙状态
systemctl status iptables

# 设置防火墙开机启动
systemctl enable iptables.service
# 重启防火墙使配置生效
systemctl restart iptables.service
```

### 可能遇到的问题

内网机器在 ping 外网时

可能会返回 icmp_seq=1 Destination Host Prohibited，而非预期的 icmp_seq=1 ttl=53 time=6.75 ms

此时，需要修改 192.168.1.1：`vim /etc/sysconfig/iptables`（不用修改内网机器 192.168.0.1）

注释掉：**-A FORWARD -j REJECT --reject-with icmp-host-prohibited**

再重启：`systemctl restart iptables.service` 即可

> 还可能出现一种情况：192.168.0.1 可以 ping 通外网，但是 curl wget 不通<br/>
解决办法是把两台机器放到一个安全组（可以是一个没有任何规则的空安全组）

## 访问内网应用

这种场景：公网的电脑，希望使用浏览器，直接访问内网部署的应用

解决办法：借助跳板机

步骤如下：需要 3 步（假设内网部署的应用的访问地址为：http://192.168.0.1:1400/）

1. 阿里云网页后台，内网机器的安全组，入方向，添加授权策略：1400 端口允许 跳板机（192.168.1.1）访问<br/>
   然后在跳板机上，执行命令验证一下：**curl http://192.168.0.1:1400/** <br/>
   如果发现是通的，那么可以跳过第 2 步，直接第 3 步<br/>
   如果不通并提示：`curl: (7) Failed connect to 192.168.0.1:1400; No route to host`，那么继续第 2 步
2. 内网机器的 iptables 中放行端口
   ```shell
   vi /etc/sysconfig/iptables
   -A INPUT -p tcp -m state --state NEW -m tcp --dport 1400 -j ACCEPT
   service iptables restart
   # 此时在跳板机上再执行：curl http://192.168.0.1:1400/，就会发现它是通的了
   ```
3. 浏览器添加 [SwitchyOmega](https://switchyomega.org/) 插件，其代理信息也即跳板机的信息（SOCKS5://127.0.0.1:1080/）

这样就可以了

补充：第一步的安全组配置，也可以将内网机器和跳板机放到同一个空的安全组里，这样两台机器的内部网络也是通的

### 安全组与iptables

二者区别：安全组是针对 ECS 实例的、iptables 是 CentOS 系统的

也就是说：阿里云服务器开放端口，首先要配置安全组，而若开启了服务器内部防火墙，才是需要修改 iptables