---
layout: post
title:  "Jekyll搭建Github静态博客"
categories: 其它
tags: jekyll rubygems github blog
---

* content
{:toc}

这可以说是我的第一篇正式的github-blog，下面通过Markdown写博，一步步讲述环境搭建到运行看效果。

## 安装Ruby

Windows用户访问[http://rubyinstaller.org/](http://rubyinstaller.org/)下载18.4MB大小的[rubyinstaller-2.3.1-x64.exe](http://dl.bintray.com/oneclick/rubyinstaller/rubyinstaller-2.3.1-x64.exe)

安装时可勾选`Add Ruby executables to your PATH`，没选的话可以手工`Path=D:\Develop\Ruby23-x64\bin`


最后在命令提示符中验证：ruby -v

得到输出：ruby 2.3.1p112 (2016-04-26 revision 54768) [x64-mingw32]

## 安装Jekyll

这里是通过RubyGems来安装Jekyll，所以到其官网[https://rubygems.org/](https://rubygems.org/)下载997KB的[rubygems-2.6.7.zip](https://rubygems.org/rubygems/rubygems-2.6.7.zip)文件

解压后在命令提示符中执行以下命令安装RubyGems

```
D:\Develop\rubygems-2.6.7>ruby setup.rb
RubyGems 2.6.7 installed
Parsing documentation for rubygems-2.6.7
Installing ri documentation for rubygems-2.6.7

=== 2.6.7 / 2016-09-26

Bug fixes:

* Install native extensions in the correct location when using the
  `--user-install` flag. Pull request #1683 by Noah Kantrowitz.

（这里就是一大堆的* Install......具体就不详细贴了）

------------------------------------------------------------------------------

RubyGems installed the following executables:
        D:/Develop/Ruby23-x64/bin/gem

Ruby Interactive (ri) documentation was installed. ri is kind of like man
pages for ruby libraries. You may access it like this:
  ri Classname
  ri Classname.class_method
  ri Classname#instance_method
If you do not wish to install this documentation in the future, use the
--no-document flag, or set it as the default in your ~/.gemrc file. See
'gem help env' for details.
```

**接下来就是开始安装Jekyll了**

```
C:\Users\Jadyer>gem install jekyll
```

## 牙疼，明天再写吧。。