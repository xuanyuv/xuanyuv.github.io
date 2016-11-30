---
layout: post
title: "Git命令小结"
categories: 工具
tags: svn revert git clone id_rsa passphrase
author: 玄玉
excerpt: 一些常用的Git用法，诸如还原、冲突、仓库迁移、拉取指定分支、克隆最新的几个版本、一机管理多个SSHKey、重置passphrase等等。
---

* content
{:toc}


## 一机多SSHkey自动切换

对于同时处理个人Github和公司Gitlab的情况，就需要一台机器同时管理两个SSHkey并能够自动切换

详细原理见[http://www.ixirong.com/2015/07/29/how-to-use-github-gitlab-together/](http://www.ixirong.com/2015/07/29/how-to-use-github-gitlab-together/)，这里直接说结果

实现方式：通过SSH协议配置config文件，不同域名采用不同的认证密钥

下面举例：配置全局的用户为Github用户，团队项目Gitlab采用局部配置

```bash
# 全局配置，Github默认使用此配置，执行完后可在~/.gitconfig文件中看到设置的用户信息
$ git config --global user.name 'jadyer' && git config --global user.email 'jadyer@yeah.net'
# 局部配置，每个项目都需在项目源码的.git目录下执行，执行完后可在.git/config文件中看到设置的用户信息
$ git config --local user.name 'xuanyu' && git config --local user.email 'xuanyu@company.com'

# 生成供gitlab使用的ssh key
$ ssh-keygen -t rsa -f ~/.ssh/id_rsa.gitlab -C "xuanyu@company.com"
# 生成供github使用的默认的ssh key
$ ssh-keygen -t rsa -C "jadyer@yeah.net"
```

再看~/.ssh/目录下（Windows一般为`C:\Users\Jadyer\.ssh\`）有没有config文件

若没有，就新建`touch ~/.ssh/config`，并添加如下内容

```
Host gitlab.company.com
     IdentityFile ~/.ssh/id_rsa.gitlab
     User xuanyu
```

然后将publicKey上传到github（id_rsa.pub）和gitlab（id_rsa.gitlab.pub），再执行下面命令验证是否OK

```
$ ssh -T git@github.com
Hi jadyer! You've successfully authenticated, but GitHub does not provide shell access.

$ ssh -T git@gitlab.company.com
Welcome to GitLab, 玄玉!
```

## 重置passphrase

passphrase指的是生成RSA密钥时使用的密码，重置时必须输入原密码，否则不能重置

所以若忘了passphrase，就杯具了，这时候只能重新生成RSA密钥对，再重新上传Gitlab

这里主要参考了万能的[stackoverflow](http://stackoverflow.com/questions/10189745/how-to-reset-or-change-the-passphrase-for-a-github-ssh-key)

```
$ ssh -T git@gitlab.company.com
Enter passphrase for key '/c/Users/Jadyer/.ssh/id_rsa.gitlab':
Welcome to GitLab, 玄玉!

$ ssh-keygen -f ~/.ssh//id_rsa.gitlab -p
Enter old passphrase:
Enter new passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved with the new passphrase.

$ ssh -T git@gitlab.company.com
Welcome to GitLab, 玄玉!
```

## 仅克隆最后两个版本

```
$ git clone https://github.com/jadyer/JadyerSDK.git --depth=2
Cloning into 'JadyerSDK'...
remote: Counting objects: 249, done.
remote: Compressing objects: 100% (195/195), done.
remote: Total 249 (delta 58), reused 148 (delta 27), pack-reused 0
Receiving objects: 100% (249/249), 484.00 KiB | 33.00 KiB/s, done.
Resolving deltas: 100% (58/58), done.
Checking connectivity... done.

$ cd JadyerSDK/

$ git rev-list master
0af3137946011e8924c152fec86b8610368512d4
00e01709d85a4dd5b2d75d2eeab6933d6a4bdf0c

$ git rev-list master --max-count=1
0af3137946011e8924c152fec86b8610368512d4

$ git rev-list master --max-count=10
0af3137946011e8924c152fec86b8610368512d4
00e01709d85a4dd5b2d75d2eeab6933d6a4bdf0c

$ git log --pretty=oneline
0af3137946011e8924c152fec86b8610368512d4 [MOD] set donot push msg to user phone on WeChat
00e01709d85a4dd5b2d75d2eeab6933d6a4bdf0c [MOD] set donot push msg to user phone
```

## 拉取仓库及其所有分支

```bash
$ cd workspace_folder
$ git clone http://git.yourcompany.cn/open/mpp.git
$ cd mpp
$ git checkout -b develop origin/develop

```

## 提交本地新项目到Gitlab

```
$ git config --global user.name "玄玉"
$ git config --global user.email "jadyer@yeah.net"
$ cd existing_folder
$ git init
$ git remote add origin git@git.yourcompany.cn:open/mpp.git
$ git add .
$ git commit -a -m "init commit"
$ git push -u origin master
```

## 仓库迁移

```bash
# 先把所有未保存的修改打包为一个commit
$ git commit -m "change repository"

# 删掉原来git源
$ git remote remove origin

# 将新源地址写入本地版本库配置文件
$ git remote add origin [YOUR NEW .GIT URL]

# 提交所有代码
$ git push -u origin master
```

## 操作Tag
```
# 拉取远程最新内容
$ git fetch origin
From gitlab.jadyer.com:open/mpp
 * [new branch]      my-test-bran -> origin/my-test-bran
 * [new tag]         11         -> 11

# 拉取远程指定的标签
$ git fetch origin tag 22
From gitlab.jadyer.com:open/mpp
 * [new tag]         22         -> 22

# 查看已拉取到本地的所有分支（-a参数可以将远程分支通过红色显示出来，如果你开了颜色支持）
$ git branch -a
  develop
* master
  remotes/origin/HEAD -> origin/master
  remotes/origin/branch-alipay-robot
  remotes/origin/branch-alipay-sw
  remotes/origin/develop
  remotes/origin/master
  remotes/origin/my-test-bran

# 查看本地所有标签
$ git tag
1.6.5.RELEASE
1.6.6.RELEASE

# 查看本地某一类标签
$ git tag -l *.6.R*
1.6.6.RELEASE
$ git tag | grep 6.R
1.6.6.RELEASE

# 查看本地某一个标签的详细信息
$ git show 1.6.6.RELEASE
tag 1.6.6.RELEASE
Tagger: jadyer <jadyer@yeah.net>
Date:   Thu Nov 3 11:30:05 2016 +0800

1、商品贷微信后台增加操作员管理功能
2、商品贷微信参数二维码增加推送动态门店功能

commit 696e291cfdac6ca05a711acaf90e79f97cb1128f
Author: jadyer <jadyer@yeah.net>
Date:   Thu Nov 3 11:08:44 2016 +0800

    [MOD] 门店扫描后的提示语改为分期不等待

diff --git a/mpp-mgr/src/main/java/com/jadyer/mpp/mgr/mpp/WeixinController.java b/mpp-mgr/src/main/java/com/jadyer/mpp/mgr/mpp/WeixinController.java
index 1d41739..2209e09 100644
--- a/mpp-mgr/src/main/java/com/jadyer/mpp/mgr/mpp/WeixinController.java
+++ b/mpp-mgr/src/main/java/com/jadyer/mpp/mgr/mpp/WeixinController.java
@@ -220,7 +220,7 @@ public class WeixinController extends WeixinMsgControllerCustomServiceAdapter {
                StringBuilder sb = new StringBuilder();
                sb.append("欢迎来到")
                                .append(compInfoDto.getSuppCompBasicDto().getCompName())
-                               .append("，美丽不等待，点击<a href='")
+                               .append("，分期不等待，点击<a href='")^M
                                .append(ConfigUtil.INSTANCE.getProperty("posloan.wechat.url"))
                                .append(compId)
                                .append("'>【马上申请】</a>");


# 创建本地标签
$ git tag -a 1.6.7.RELEASE -m 'the tag of create'

$ git tag -a 1.6.8.RELEASE -m 'the tag of create again'

$ git tag -a 1.6.9.RELEASE -m 'the tag of create again again'


# Push本地所有标签到远程
$ git push --tags
Counting objects: 2, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (2/2), done.
Writing objects: 100% (2/2), 396 bytes | 0 bytes/s, done.
Total 2 (delta 0), reused 0 (delta 0)
To git@gitlab.jadyer.com:open/mpp.git
 * [new tag]         1.6.7.RELEASE -> 1.6.7.RELEASE
 * [new tag]         1.6.8.RELEASE -> 1.6.8.RELEASE

# Push本地指定标签到远程
$ git push origin 1.6.9.RELEASE
Counting objects: 1, done.
Writing objects: 100% (1/1), 167 bytes | 0 bytes/s, done.
Total 1 (delta 0), reused 0 (delta 0)
To git@gitlab.jadyer.com:open/mpp.git
 * [new tag]         1.6.9.RELEASE -> 1.6.9.RELEASE

# 删除本地标签
$ git tag
1.6.5.RELEASE
1.6.6.RELEASE
1.6.7.RELEASE
1.6.8.RELEASE
1.6.9.RELEASE

$ git tag -d 1.6.9.RELEASE
Deleted tag '1.6.9.RELEASE' (was ea201ff)

$ git tag
1.6.5.RELEASE
1.6.6.RELEASE
1.6.7.RELEASE
1.6.8.RELEASE

# 删除远程标签
$ git push origin --delete tag 1.6.8.RELEASE
To git@gitlab.msxf.com:open/mpp.git
 - [deleted]         1.6.8.RELEASE

$ git push origin :refs/tags/1.6.9.RELEASE
To git@gitlab.jadyer.com:open/mpp.git
 - [deleted]         1.6.9.RELEASE
```

## 还原文件

SVN中使用命令`svn revert <filename>`

Git中使用命令`git checkout <filename>`（注意`git checkout .`会还原当前目录下的所有文件）