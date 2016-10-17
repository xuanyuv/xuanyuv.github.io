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

然后在命令提示符中验证一下安装结果

```
C:\Users\Jadyer>ruby -v
ruby 2.3.1p112 (2016-04-26 revision 54768) [x64-mingw32]
```

## 安装Jekyll

这里通过RubyGems安装Jekyll，所以先到官网[https://rubygems.org/](https://rubygems.org/)下载997KB大小的[rubygems-2.6.7.zip](https://rubygems.org/rubygems/rubygems-2.6.7.zip)

接着解压压缩包，并在命令提示符中执行安装命令

```
D:\Develop\rubygems-2.6.7>ruby setup.rb
RubyGems 2.6.7 installed
Parsing documentation for rubygems-2.6.7
Installing ri documentation for rubygems-2.6.7

=== 2.6.7 / 2016-09-26

Bug fixes:

* Install native extensions in the correct location when using the
  `--user-install` flag. Pull request #1683 by Noah Kantrowitz.

（具体Bug列表明细就略了）

* Find_files only from loaded_gems when using gemdeps. Pull request #1277
  by Michal Papis.


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



D:\Develop\rubygems-2.6.7>
```

**接下来就可以用RubyGems来安装Jekyll**

```
C:\Users\Jadyer>gem install jekyll
Fetching: liquid-3.0.6.gem (100%)
Successfully installed liquid-3.0.6
Fetching: kramdown-1.12.0.gem (100%)
Successfully installed kramdown-1.12.0

（具体的安装列表明细就略了）

Parsing documentation for jekyll-3.3.0
Installing ri documentation for jekyll-3.3.0
Done installing documentation for liquid, kramdown, mercenary, safe_yaml, colora
tor, rouge, sass, jekyll-sass-converter, rb-fsevent, ffi, rb-inotify, listen, je
kyll-watch, forwardable-extended, pathutil, addressable, jekyll after 33 seconds

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
New jekyll site installed in D:/Develop/Code/Jekyll/myblog.
Running bundle install in D:/Develop/Code/Jekyll/myblog...
Fetching gem metadata from https://rubygems.org/..............
Fetching version metadata from https://rubygems.org/...
Fetching dependency metadata from https://rubygems.org/..
Resolving dependencies...
Using addressable 2.4.0
Using colorator 1.1.0
Using ffi 1.9.14
Using forwardable-extended 2.6.0
Using sass 3.4.22
Using rb-fsevent 0.9.7
Using kramdown 1.12.0
Using liquid 3.0.6
Using mercenary 0.3.6
Using rouge 1.11.1
Using safe_yaml 1.0.4
Installing minima 2.0.0
Using bundler 1.13.5
Using rb-inotify 0.9.7
Using pathutil 0.14.0
Using jekyll-sass-converter 1.4.0
Using listen 3.0.8
Using jekyll-watch 1.5.0
Using jekyll 3.3.0
Installing jekyll-feed 0.8.0
Bundle complete! 3 Gemfile dependencies, 20 gems now installed.
Use `bundle show [gemname]` to see where a bundled gem is installed.
Post-install message from minima:

----------------------------------------------
Thank you for installing minima 2.0!

Minima 2.0 comes with a breaking change that
renders '<your-site>/css/main.scss' redundant.
That file is now bundled with this gem as
'<minima>/assets/main.scss'.

More Information:
https://github.com/jekyll/minima#customization
----------------------------------------------


D:\Develop\Code\Jekyll>
```

创建完毕，我们回到本地目录看一下

![](/img/2016-10-17/myblog-folder.png)

接下来到博客文件夹中，启动Jekyll服务

（watch参数用于检测文件变化，即修改后不需重启Jekyll，可惜Windows不支持）

```
D:\Develop\Code\Jekyll>cd myblog

D:\Develop\Code\Jekyll\myblog>jekyll serve --watch
Configuration file: D:/Develop/Code/Jekyll/myblog/_config.yml
Configuration file: D:/Develop/Code/Jekyll/myblog/_config.yml
            Source: D:/Develop/Code/Jekyll/myblog
       Destination: D:/Develop/Code/Jekyll/myblog/_site
 Incremental build: disabled. Enable with --incremental
      Generating...
                    done in 0.738 seconds.
                    --watch arg is unsupported on Windows.
                    If you are on Windows Bash, please see: https://github.com/M
icrosoft/BashOnWindows/issues/216
Configuration file: D:/Develop/Code/Jekyll/myblog/_config.yml
    Server address: http://127.0.0.1:4000/
  Server running... press ctrl-c to stop.
```

访问[http://127.0.0.1:4000/](http://127.0.0.1:4000/)会看到下面的页面

![](/img/2016-10-17/myblog-index-page.png)

## 复制主题

本博主题取自[https://github.com/Gaohaoyang/gaohaoyang.github.io](https://github.com/Gaohaoyang/gaohaoyang.github.io)

其第一版的介绍地址为[http://jekyllthemes.org/themes/cool-concise-high-end/](http://jekyllthemes.org/themes/cool-concise-high-end/)

这里将该主题代码clone、fork或download下来后，通过`jekyll s`命令启动来查看本地效果

本地启动时，可能会报告下面的错误

```
C:\Users\Jadyer\Desktop\gaohaoyang.github.io-master>jekyll s
Configuration file: C:/Users/Jadyer/Desktop/gaohaoyang.github.io-master/_config.
yml
Configuration file: C:/Users/Jadyer/Desktop/gaohaoyang.github.io-master/_config.
yml
  Dependency Error: Yikes! It looks like you don't have jekyll-paginate or one o
f its dependencies installed. In order to use Jekyll as currently configured, yo
u'll need to install this gem. The full error message from Ruby is: 'cannot load
 such file -- jekyll-paginate' If you run into trouble, you can find helpful res
ources at http://jekyllrb.com/help/!
jekyll 3.3.0 | Error:  jekyll-paginate

C:\Users\Jadyer\Desktop\gaohaoyang.github.io-master>
```

这是因为Jekyll3.x中默认安装已没有此分页组件，官方将其插件化了，故需独立安装。

详见[https://jekyllrb.com/docs/pagination/](https://jekyllrb.com/docs/pagination/)

```
C:\Users\Jadyer\Desktop\gaohaoyang.github.io-master>gem install jekyll-paginate
Fetching: jekyll-paginate-1.1.0.gem (100%)
Successfully installed jekyll-paginate-1.1.0
Parsing documentation for jekyll-paginate-1.1.0
Installing ri documentation for jekyll-paginate-1.1.0
Done installing documentation for jekyll-paginate after 0 seconds
1 gem installed

C:\Users\Jadyer\Desktop\gaohaoyang.github.io-master>
```

接着再启动，就能启动成功了。

```
C:\Users\Jadyer\Desktop\gaohaoyang.github.io-master>jekyll s
Configuration file: C:/Users/Jadyer/Desktop/gaohaoyang.github.io-master/_config.
yml
Configuration file: C:/Users/Jadyer/Desktop/gaohaoyang.github.io-master/_config.
yml
            Source: C:/Users/Jadyer/Desktop/gaohaoyang.github.io-master
       Destination: C:/Users/Jadyer/Desktop/gaohaoyang.github.io-master/_site
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
Configuration file: C:/Users/Jadyer/Desktop/gaohaoyang.github.io-master/_config.
yml
    Server address: http://127.0.0.1:4000/
  Server running... press ctrl-c to stop.
```

访问[http://127.0.0.1:4000/](http://127.0.0.1:4000/)就看到本地页面了

![](/img/2016-10-17/hyg-blog.png)

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


<br/>
<br/>
<br/>

## 牙疼，剩下的明天再写吧。。