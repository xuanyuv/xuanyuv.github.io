---
layout: post
title: "Jekyll搭建Github静态博客"
categories: 工具
tags: jekyll rubygems github blog
author: 玄玉
excerpt: 详细介绍了通过Jekyll在GithubPages（github.io）上创建静态博客的方法。
published: true
---

* content
{:toc}


可以说这是我的第一篇github-blog，下面通过Markdown一步步描述从环境搭建到运行看效果。

## 安装Ruby

Windows 用户访问 [http://rubyinstaller.org/](http://rubyinstaller.org/) 下载 149MB 大小的 [rubyinstaller-devkit-3.0.3-1-x64.exe](https://github.com/oneclick/rubyinstaller2/releases/download/RubyInstaller-3.0.3-1/rubyinstaller-devkit-3.0.3-1-x64.exe)

安装时注意勾选 `Add Ruby executables to your PATH`，没选的话可以手工配置一下 `Path=D:\Develop\Ruby30-x64\bin;...`

安装完成后，按照提示再安装 MSYS2（在弹出的窗口选择 3 - MSYS2 and MINGW development toolchain）（这个耗时有点长，慢慢等待...）

最后，在命令提示符中验证一下安装结果

```
C:\Users\Jadyer>ruby -v
ruby 3.0.3p157 (2021-11-24 revision 3fb7d2cadc) [x64-mingw32]
```

## 安装Jekyll

这里通过 RubyGems 安装 Jekyll，所以先到官网 [https://rubygems.org/](https://rubygems.org/) 下载 1.52MB 大小的[rubygems-3.3.3.zip](https://rubygems.org/rubygems/rubygems-3.3.3.zip)

接着解压压缩包到桌面，并在命令提示符中执行安装命令

```
C:\Users\Jadyer\Desktop\rubygems-3.1.4>ruby setup.rb
  Successfully built RubyGem
  Name: bundler
  Version: 2.3.3
  File: bundler-2.3.3.gem
Bundler 2.3.3 installed
RubyGems 3.3.3 installed
...
...
...
RubyGems installed the following executables:
        D:/Develop/Ruby30-x64/bin/gem
        D:/Develop/Ruby30-x64/bin/bundle
        D:/Develop/Ruby30-x64/bin/bundler

Ruby Interactive (ri) documentation was installed. ri is kind of like man
pages for Ruby libraries. You may access it like this:
  ri Classname
  ri Classname.class_method
  ri Classname#instance_method
If you do not wish to install this documentation in the future, use the
--no-document flag, or set it as the default in your ~/.gemrc file. See
'gem help env' for details.

D:\Develop\rubygems-3.3.3>
```

然后删掉 rubygems-3.3.3 文件夹，它没用了

**下面进入正题：用 RubyGems 来安装 Jekyll**（这个耗时也有点长...）

```
C:\Users\Jadyer>gem install jekyll
Fetching terminal-table-2.0.0.gem
Fetching unicode-display_width-1.8.0.gem
Fetching safe_yaml-1.0.5.gem
...
...
...
Parsing documentation for jekyll-4.2.1
Installing ri documentation for jekyll-4.2.1
Done installing documentation for unicode-display_width, terminal-table, safe_yaml, rouge, forwardable-extended, pathutil, mercenary, liquid, kramdown, kramdown-parser-gfm, ffi, rb-inotify, rb-fsevent, listen, jekyll-watch, sassc, jekyll-sass-converter, concurrent-ruby, i18n, http_parser.rb, eventmachine, em-websocket, colorator, public_suffix, addressable, jekyll after 52 seconds
26 gems installed

C:\Users\Jadyer>
```

至此，Jekyll就安装完毕了

## 创建博客

先建一个文件夹（这里命名为 Jekyll）用于存放博客内容，然后在命令提示符中执行以下命令创建 Jekyll 工作区

```
D:\Develop\Code\Jekyll>jekyll new myblog
Running bundle install in D:/Develop/Code/Jekyll/myblog...
  Bundler: Fetching gem metadata from https://rubygems.org/..........
  Bundler: Resolving dependencies...
...
...
...
  Bundler: Bundle complete! 6 Gemfile dependencies, 35 gems now installed.
  Bundler: Use `bundle info [gemname]` to see where a bundled gem is installed.
New jekyll site installed in D:/Develop/Code/Jekyll/myblog.

D:\Develop\Code\Jekyll>
```

注①：在执行完命令后，若过了一段时间控制台还是没有动静，不妨敲一下回车（堵了，执行结果没有输出在控制台上）

注②：以前的 Jekyll 版本曾遇到下面的错误提示，此时需安装 bundler，然后再重新执行命令（记得先删掉上面 new 的 myblog 目录）

```
New jekyll site installed in D:/Develop/Code/Jekyll/myblog.
  Dependency Error: Yikes! It looks like you don't have bundler or one of its de
pendencies installed. In order to use Jekyll as currently configured, you'll nee
d to install this gem. The full error message from Ruby is: 'cannot load such fi
le -- bundler' If you run into trouble, you can find helpful resources at http:/
/jekyllrb.com/help/!
jekyll 4.1.1 | Error:  bundler


D:\Develop\Code\Jekyll>gem install bundler
Fetching bundler-2.1.4.gem
Successfully installed bundler-2.1.4
Parsing documentation for bundler-2.1.4
Installing ri documentation for bundler-2.1.4
Done installing documentation for bundler after 4 seconds
1 gem installed

D:\Develop\Code\Jekyll>
```

创建完毕，我们回到本地目录看一下

![](https://ae01.alicdn.com/kf/Hf6772f121e91419e973267a6650a539ep.png)

接下来到博客文件夹中，启动Jekyll服务

```
D:\Develop\Code\Jekyll>cd myblog

D:\Develop\Code\Jekyll\myblog>jekyll serve --watch
Configuration file: D:/Develop/Code/Jekyll/myblog/_config.yml
            Source: D:/Develop/Code/Jekyll/myblog
       Destination: D:/Develop/Code/Jekyll/myblog/_site
 Incremental build: disabled. Enable with --incremental
      Generating...
...
...
...
                    done in 0.857 seconds.
 Auto-regeneration: enabled for 'D:/Develop/Code/Jekyll/myblog'
    Server address: http://127.0.0.1:4000/
  Server running... press ctrl-c to stop.
```

访问 [http://127.0.0.1:4000/](http://127.0.0.1:4000/) 会看到下面的页面

![](https://ae01.alicdn.com/kf/H4dcc32f6d61247eaa92b26c4eb206409T.png)

启动过程中，会报告下面的错误提示：

```
 Auto-regeneration: enabled for 'C:/Users/hongyu.lu/Desktop/11/myblog'
                    ------------------------------------------------
      Jekyll 4.2.1   Please append `--trace` to the `serve` command
                     for any additional information or backtrace.
                    ------------------------------------------------
D:/Develop/Ruby30-x64/lib/ruby/gems/3.0.0/gems/jekyll-4.2.1/lib/jekyll/commands/serve/servlet.rb:3:in `require': cannot load such file -- webrick (LoadError)
        from D:/Develop/Ruby30-x64/lib/ruby/gems/3.0.0/gems/jekyll-4.2.1/lib/jekyll/commands/serve/servlet.rb:3:in `<top (required)>'
        from D:/Develop/Ruby30-x64/lib/ruby/gems/3.0.0/gems/jekyll-4.2.1/lib/jekyll/commands/serve.rb:179:in `require_relative'
```

这是因为从Ruby-3.0开始，webrick已经不再绑定到Ruby中了，详见：[Ruby 3.0.0 Released](https://www.ruby-lang.org/en/news/2020/12/25/ruby-3-0-0-released/)，那么手动添加即可

```
D:\Develop\Code\Jekyll\myblog>bundle add webrick
Fetching gem metadata from https://rubygems.org/.........
Resolving dependencies...
...
...
...
...
Using jekyll 4.2.1
Using jekyll-feed 0.15.1
Using jekyll-seo-tag 2.7.1
Using minima 2.5.1
Installing webrick 1.7.0

D:\Develop\Code\Jekyll\myblog>
```

## 复制主题

本博主题修改自[https://github.com/Gaohaoyang/gaohaoyang.github.io](https://github.com/Gaohaoyang/gaohaoyang.github.io)

其第一版的介绍为[http://jekyllthemes.org/themes/cool-concise-high-end/](http://jekyllthemes.org/themes/cool-concise-high-end/)（另：这个[https://jekyllthemes.io/](https://jekyllthemes.io/)主题网站也挺不错）

这里将该主题代码弄下来后，通过 `jekyll s` 命令启动来查看本地效果

本地启动时，可能会报告下面的错误

```
C:\Users\Jadyer\Desktop\jadyer.github.io>jekyll s
Configuration file: D:/Develop/Code/Jekyll/myblog/_config.yml
  Dependency Error: Yikes! It looks like you don't have jekyll-paginate or one of its dependencies installed. In order to use Jekyll as currently configured, you'll need to install this gem. If you've run Jekyll with `bundle exec`, ensure that you have included the jekyll-paginate gem in your Gemfile as well. The full error message from Ruby is: 'cannot load such file -- jekyll-paginate' If you run into trouble, you can find helpful resources at https://jekyllrb.com/help/!
                    ------------------------------------------------
      Jekyll 4.1.1   Please append `--trace` to the `serve` command
                     for any additional information or backtrace.
                    ------------------------------------------------
...
...
...

C:\Users\Jadyer\Desktop\jadyer.github.io>
```

这是因为 Jekyll 中默认安装已没有此分页组件，官方将其插件化了，故需独立安装

详见[https://jekyllrb.com/docs/pagination/](https://jekyllrb.com/docs/pagination/)

```
C:\Users\Jadyer>gem install jekyll-paginate
Fetching jekyll-paginate-1.1.0.gem
Successfully installed jekyll-paginate-1.1.0
Parsing documentation for jekyll-paginate-1.1.0
Installing ri documentation for jekyll-paginate-1.1.0
Done installing documentation for jekyll-paginate after 0 seconds
1 gem installed

C:\Users\Jadyer>
```

接着再启动就成功了，访问 [http://127.0.0.1:4000/](http://127.0.0.1:4000/) 就看到本地页面了

![](https://ae01.alicdn.com/kf/H3cb4d2c076d44ffea88043d11b3ee97cV.png)

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

另附我的启动脚本 `startup.bat` （idea 中可以把 bat 配置到 External Tools 里）

注意：应使用 ANSI 编码保存批处理文件，否则Windows系统不认识

```sh
@echo off
title 自动打包工具【玄玉制作】
color 02

call jekyll s --watch
```

## 图床

写博客就一定会用到图片，压缩图片的话可以用 **[色彩笔](https://www.secaibi.com/tools/)** 在线工具批量压缩

目前我大部分用的都是阿里云图床，现在上传入口好多都失效了

所以找到了 jsDelivr + GitHub 这个办法来做图床，即稳定又免费还支持全球CDN

做法就是在 Github 建一个 Public 的仓库，用来放图片

然后用这个地址就行了：**https://cdn.jsdelivr.net/gh/你的用户名/你的仓库名/文件路径**

若想手动刷新 jsDelivr 缓存，只需把链接中的 https://**cdn**.jsdelivr.net/ 替换成 https://**purge**.jsdelivr.net/ 即可