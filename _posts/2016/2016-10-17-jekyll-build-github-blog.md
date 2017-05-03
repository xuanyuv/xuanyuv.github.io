---
layout: post
title: "Jekyll搭建Github静态博客"
categories: 工具
tags: jekyll rubygems github blog
author: 玄玉
excerpt: 详细介绍了通过Jekyll在GithubPages（github.io）上创建静态博客的方法。
published: false
---

* content
{:toc}


可以说这是我的第一篇github-blog，下面通过Markdown一步步讲述环境搭建到运行看效果。


## 安装Ruby

Windows用户访问 [http://rubyinstaller.org/](http://rubyinstaller.org/) 下载 18.7MB 大小的 [rubyinstaller-2.3.3-x64.exe](https://dl.bintray.com/oneclick/rubyinstaller/rubyinstaller-2.3.3-x64.exe)

安装时可勾选`Add Ruby executables to your PATH`，没选的话可以手工`Path=D:\Develop\Ruby23-x64\bin`

然后在命令提示符中验证一下安装结果

```
C:\Users\Jadyer>ruby -v
ruby 2.3.3p222 (2016-11-21 revision 56859) [x64-mingw32]
```

## 安装Jekyll

这里通过RubyGems安装Jekyll，所以先到官网 [https://rubygems.org/](https://rubygems.org/) 下载 1.01MB 大小的[rubygems-2.6.10.zip](https://rubygems.org/rubygems/rubygems-2.6.10.zip)

接着解压压缩包到 `D:\Develop\` 目录下，并在命令提示符中执行安装命令

```
D:\Develop\rubygems-2.6.10>ruby setup.rb
RubyGems 2.6.10 installed
Parsing documentation for rubygems-2.6.10
Installing ri documentation for rubygems-2.6.10
...
...
...
Ruby Interactive (ri) documentation was installed. ri is kind of like man
pages for ruby libraries. You may access it like this:
  ri Classname
  ri Classname.class_method
  ri Classname#instance_method
If you do not wish to install this documentation in the future, use the
--no-document flag, or set it as the default in your ~/.gemrc file. See
'gem help env' for details.

D:\Develop\rubygems-2.6.10>
```

**接下来就可以用RubyGems来安装Jekyll**

```
C:\Users\Jadyer>gem install jekyll
Fetching: liquid-3.0.6.gem (100%)
Successfully installed liquid-3.0.6
Fetching: kramdown-1.12.0.gem (100%)
Successfully installed kramdown-1.12.0
...
...
...
17 gems installed

C:\Users\Jadyer>
```

至此，Jekyll就安装完毕了。

## 创建博客

先建一个文件夹（这里命名为Jekyll）用于存放博客内容，然后在命令提示符中执行以下命令创建Jekyll工作区。

```
D:\Develop\Code\Jekyll>jekyll new myblog
New jekyll site installed in D:/Develop/Code/Jekyll/myblog.
  Dependency Error: Yikes! It looks like you don't have bundler or one of its de
pendencies installed. In order to use Jekyll as currently configured, you'll nee
d to install this gem. The full error message from Ruby is: 'cannot load such fi
le -- bundler' If you run into trouble, you can find helpful resources at http:/
/jekyllrb.com/help/!
jekyll 3.3.0 | Error:  bundler

D:\Develop\Code\Jekyll>
```

我在实际操作中，遇到了上面的错误提示，这个时候就需要安装一下bundler

```
D:\Develop\Code\Jekyll>gem install bundler
Fetching: bundler-1.13.5.gem (100%)
Successfully installed bundler-1.13.5
Parsing documentation for bundler-1.13.5
Installing ri documentation for bundler-1.13.5
Done installing documentation for bundler after 12 seconds
1 gem installed

D:\Develop\Code\Jekyll>
```

然后再执行命令（记得先把上面new操作创建的myblog目录删掉）

```
D:\Develop\Code\Jekyll>jekyll new myblog
Running bundle install in D:/Develop/Code/jekyll/myblog...
  Bundler: Fetching gem metadata from https://rubygems.org/...........
  Bundler: Fetching version metadata from https://rubygems.org/..
  Bundler: Fetching dependency metadata from https://rubygems.org/.
  Bundler: Resolving dependencies...
  Bundler: Using public_suffix 2.0.5
  Bundler: Using colorator 1.1.0
  Bundler: Using ffi 1.9.17 (x64-mingw32)
  Bundler: Using forwardable-extended 2.6.0
  Bundler: Using sass 3.4.23
  Bundler: Using rb-fsevent 0.9.8
  Bundler: Using kramdown 1.13.2
  Bundler: Using liquid 3.0.6
  Bundler: Using mercenary 0.3.6
  Bundler: Using rouge 1.11.1
  Bundler: Using safe_yaml 1.0.4
  Bundler: Installing thread_safe 0.3.5
  Bundler: Using bundler 1.14.4
  Bundler: Using addressable 2.5.0
  Bundler: Using rb-inotify 0.9.8
  Bundler: Using pathutil 0.14.0
  Bundler: Using jekyll-sass-converter 1.5.0
  Bundler: Installing tzinfo 1.2.2
  Bundler: Using listen 3.0.8
  Bundler: Installing tzinfo-data 1.2016.10
  Bundler: Using jekyll-watch 1.5.0
  Bundler: Using jekyll 3.4.0
  Bundler: Installing jekyll-feed 0.9.1
  Bundler: Installing minima 2.1.0
  Bundler: Bundle complete! 4 Gemfile dependencies, 24 gems now installed.
  Bundler: Use `bundle show [gemname]` to see where a bundled gem is installed.
  Bundler: Post-install message from minima:
  Bundler:
  Bundler: ----------------------------------------------
  Bundler: Thank you for installing minima 2.0!
  Bundler:
  Bundler: Minima 2.0 comes with a breaking change that
  Bundler: renders '<your-site>/css/main.scss' redundant.
  Bundler: That file is now bundled with this gem as
  Bundler: '<minima>/assets/main.scss'.
  Bundler:
  Bundler: More Information:
  Bundler: https://github.com/jekyll/minima#customization
  Bundler: ----------------------------------------------
New jekyll site installed in D:/Develop/Code/jekyll/myblog.

D:\Develop\Code\Jekyll>
```

创建完毕，我们回到本地目录看一下

![](/img/2016/2016-10-17-jekyll-build-github-blog-01.png)

接下来到博客文件夹中，启动Jekyll服务

```
D:\Develop\Code\Jekyll>cd myblog

D:\Develop\Code\Jekyll\myblog>jekyll serve --watch
Configuration file: D:/Develop/Code/jekyll/myblog/_config.yml
Configuration file: D:/Develop/Code/jekyll/myblog/_config.yml
            Source: D:/Develop/Code/jekyll/myblog
       Destination: D:/Develop/Code/jekyll/myblog/_site
 Incremental build: disabled. Enable with --incremental
      Generating...
                    done in 0.629 seconds.
  Please add the following to your Gemfile to avoid polling for changes:
    gem 'wdm', '>= 0.1.0' if Gem.win_platform?
 Auto-regeneration: enabled for 'D:/Develop/Code/jekyll/myblog'
Configuration file: D:/Develop/Code/jekyll/myblog/_config.yml
    Server address: http://127.0.0.1:4000/
  Server running... press ctrl-c to stop.
```

访问[http://127.0.0.1:4000/](http://127.0.0.1:4000/)会看到下面的页面

![](/img/2016/2016-10-17-jekyll-build-github-blog-02.png)

## 复制主题

本博主题修改自[https://github.com/Gaohaoyang/gaohaoyang.github.io](https://github.com/Gaohaoyang/gaohaoyang.github.io)

其第一版的介绍地址为[http://jekyllthemes.org/themes/cool-concise-high-end/](http://jekyllthemes.org/themes/cool-concise-high-end/)

*补充一下，还有一个主题网站，也挺不错的：[https://jekyllthemes.io/](https://jekyllthemes.io/)*

这里将该主题代码clone、fork或download下来后，通过`jekyll s`命令启动来查看本地效果

本地启动时，可能会报告下面的错误

```
C:\Users\Jadyer\Desktop\jadyer.github.io-master>jekyll s
Configuration file: C:/Users/Jadyer/Desktop/jadyer.github.io-master/_config.
yml
Configuration file: C:/Users/Jadyer/Desktop/jadyer.github.io-master/_config.
yml
  Dependency Error: Yikes! It looks like you don't have jekyll-paginate or one o
f its dependencies installed. In order to use Jekyll as currently configured, yo
u'll need to install this gem. The full error message from Ruby is: 'cannot load
 such file -- jekyll-paginate' If you run into trouble, you can find helpful res
ources at http://jekyllrb.com/help/!
jekyll 3.3.0 | Error:  jekyll-paginate

C:\Users\Jadyer\Desktop\jadyer.github.io-master>
```

这是因为Jekyll3.x中默认安装已没有此分页组件，官方将其插件化了，故需独立安装。

详见[https://jekyllrb.com/docs/pagination/](https://jekyllrb.com/docs/pagination/)

```
C:\Users\Jadyer\Desktop\jadyer.github.io-master>gem install jekyll-paginate
Fetching: jekyll-paginate-1.1.0.gem (100%)
Successfully installed jekyll-paginate-1.1.0
Parsing documentation for jekyll-paginate-1.1.0
Installing ri documentation for jekyll-paginate-1.1.0
Done installing documentation for jekyll-paginate after 0 seconds
1 gem installed

C:\Users\Jadyer\Desktop\jadyer.github.io-master>
```

接着再启动，就能启动成功了。

```
C:\Users\Jadyer\Desktop\jadyer.github.io-master>jekyll s
Configuration file: C:/Users/Jadyer/Desktop/jadyer.github.io-master/_config.
yml
Configuration file: C:/Users/Jadyer/Desktop/jadyer.github.io-master/_config.
yml
            Source: C:/Users/Jadyer/Desktop/jadyer.github.io-master
       Destination: C:/Users/Jadyer/Desktop/jadyer.github.io-master/_site
 Incremental build: disabled. Enable with --incremental
      Generating...
    Liquid Warning: Liquid syntax error (line 86): Invalid attribute in for loop
. Valid attributes are limit and offset in "category in site.categories order:as
cending" in index.html
    Liquid Warning: Liquid syntax error (line 86): Invalid attribute in for loop
. Valid attributes are limit and offset in "category in site.categories order:as
cending" in page2/index.html
    Liquid Warning: Liquid syntax error (line 86): Invalid attribute in for loop
. Valid attributes are limit and offset in "category in site.categories order:as
cending" in page3/index.html
    Liquid Warning: Liquid syntax error (line 86): Invalid attribute in for loop
. Valid attributes are limit and offset in "category in site.categories order:as
cending" in page4/index.html
    Liquid Warning: Liquid syntax error (line 86): Invalid attribute in for loop
. Valid attributes are limit and offset in "category in site.categories order:as
cending" in page5/index.html
                    done in 6.586 seconds.
                    --watch arg is unsupported on Windows.
                    If you are on Windows Bash, please see: https://github.com/M
icrosoft/BashOnWindows/issues/216
Configuration file: C:/Users/Jadyer/Desktop/jadyer.github.io-master/_config.
yml
    Server address: http://127.0.0.1:4000/
  Server running... press ctrl-c to stop.
```

访问[http://127.0.0.1:4000/](http://127.0.0.1:4000/)就看到本地页面了

![](/img/2016/2016-10-17-jekyll-build-github-blog-03.png)

## Jekyll补充

* Jekyll中文介绍见[http://jekyllcn.com/docs/structure/](http://jekyllcn.com/docs/structure/)
* _posts目录用于存放博文，格式是：YEAR-MONTH-DAY-title.md
* _drafts目录用于存放草稿文件，格式是：title.md（没有日期）
* _site目录用于存放Jekyll生成的网站文件
* _layouts目录用于存放模板文件
* _includes目录用于存放可以被模板文件包含的公共文件
* _data目录用于存放数据，Jekyll会自动加载这里的所有.jml或者.yaml结尾的文件
* static目录是个人自定义的，一般存放公共资源，比如js/css/img
* page目录是个人自定义的，一般存放站内固定的页面
* sitemap.txt是给搜索引擎看的，告诉它怎么爬这个站
* index.html是整站的入口

1. Jekyll语法简单笔记：[http://github.tiankonguse.com/blog/2014/11/10/jekyll-study.html](http://github.tiankonguse.com/blog/2014/11/10/jekyll-study.html)
2. Jekyll模板语法：[http://jzlingmo.top/blog/2015/03/26/Jekyll模板语法/](http://jzlingmo.top/blog/2015/03/26/Jekyll模板语法/)

## 启动脚本

另附我的启动脚本 `startup.bat`

注意：应使用 ANSI 编码保存批处理文件，否则Windows系统不认识

```sh
@echo off
title 自动打包工具【玄玉制作】
color 02

call jekyll s --watch
```

## 数学表达式

目前该博客模板已支持 MathJax，示例如下

$$
f(x) = ax + b
$$

Inline Mathjax $a \neq b$