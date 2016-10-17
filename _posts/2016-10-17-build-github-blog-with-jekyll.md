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
* When calling `Gem.sources`, load sources from `configuration`
  if present, else use the default sources. Pull request #1699
  by Luis Sagastume.
* Fail gracefully when attempting to redirect without a Location.
  Pull request #1711 by Samuel Giddins.
* Update vendored Molinillo to 0.5.1. Pull request #1714 by
  Samuel Giddins.

=== 2.6.6 / 2016-06-22

Bug fixes:

* Sort installed versions to make sure we install the latest version when
  running `gem update --system`. As a one-time fix, run
  `gem update --system=2.6.6`. Pull request #1601 by David Radcliffe.

=== 2.6.5 / 2016-06-21

Minor enhancements:

* Support for unified Integer in Ruby 2.4. Pull request #1618
  by SHIBATA Hiroshi.
* Update vendored Molinillo to 0.5.0 for performance improvements.
  Pull request #1638 by Samuel Giddins.

Bug fixes:

* Raise an explicit error if Signer#sign is called with no certs. Pull
  request #1605 by Daniel Berger.
* Update `update_bundled_ca_certificates` utility script for directory
  nesting. Pull request #1583 by James Wen.
* Fix broken symlink support in tar writer (+ fix broken test). Pull
  request #1578 by Cezary Baginski.
* Remove extension directory before (re-)installing. Pull request #1576
  by Jeremy Hinegardner.
* Regenerate test CA certificates with appropriate extensions. Pull
  request #1611 by rhenium.
* Rubygems does not terminate on failed file lock when not superuser. Pull
  request #1582 by Ellen Marie Dash.
* Fix tar headers with a 101 character name. Pull request #1612 by Paweł
  Tomulik.
* Add Gem.platform_defaults to allow implementations to override defaults.
  Pull request #1644 by Charles Oliver Nutter.
* Run Bundler tests on TravisCI. Pull request #1650 by Samuel Giddins.

=== 2.6.4 / 2016-04-26

Minor enhancements:

* Use Gem::Util::NULL_DEVICE instead of hard coded strings. Pull request #1588
  by Chris Charabaruk.
* Use File.symlink on MS Windows if supported. Pull request #1418
  by Nobuyoshi Nakada.

Bug fixes:

* Redact uri password from error output when gem fetch fails. Pull request
  #1565 by Brian Fletcher.
* Suppress warnings. Pull request #1594 by Nobuyoshi Nakada.
* Escape user-supplied content served on web pages by `gem server` to avoid
  potential XSS vulnerabilities. Samuel Giddins.

=== 2.6.3 / 2016-04-05

Minor enhancements:

* Lazily calculate Gem::LoadError exception messages. Pull request #1550
  by Aaron Patterson.
* New fastly cert. Pull request #1548 by David Radcliffe.
* Organize and cleanup SSL certs. Pull request #1555 by James Wen.
* [RubyGems] Make deprecation message for paths= more helpful. Pull
  request #1562 by Samuel Giddins.
* Show default gems when using "gem list". Pull request #1570 by Luis
  Sagastume.

Bug fixes:

* Stub ordering should be consistent regardless of how cache is populated.
  Pull request #1552 by Aaron Patterson.
* Handle cases when the @@stubs variable contains non-stubs. Pull request
  #1558 by Per Lundberg.
* Fix test on Windows for inconsistent temp path. Pull request #1554 by
  Hiroshi Shirosaki.
* Fix `Gem.find_spec_for_exe` picks oldest gem. Pull request #1566 by
  Shinichi Maeshima.
* [Owner] Fallback to email and userid when owner email is missing. Pull
  request #1569 by Samuel Giddins.
* [Installer] Handle nil existing executable. Pull request #1561 by Samuel
  Giddins.
* Allow two digit version numbers in the tests. Pull request #1575 by unak.

=== 2.6.2 / 2016-03-12

Bug fixes:

* Fix wrong version of gem activation for bin stub. Pull request #1527 by
  Aaron Patterson.
* Speed up gem activation failures. Pull request #1539 by Aaron Patterson.
* Fix platform sorting in the resolver. Pull request #1542 by Samuel E.
  Giddins.
* Ensure we unlock the monitor even if try_activate throws. Pull request
  #1538 by Charles Oliver Nutter.


=== 2.6.1 / 2016-02-28

Bug fixes:

* Ensure `default_path` and `home` are set for paths. Pull request #1513
  by Aaron Patterson.
* Restore but deprecate support for Array values on `Gem.paths=`. Pull
  request #1514 by Aaron Patterson.
* Fix invalid gem file preventing gem install from working. Pull request
  #1499 by Luis Sagastume.

=== 2.6.0 / 2016-02-26

Minor enhancements:

* RubyGems now defaults the `gem push` to the gem's "allowed_push_host"
  metadata setting.  Pull request #1486 by Josh Lane.
* Update bundled Molinillo to 0.4.3. Pull request #1493 by Samuel E. Giddins.
* Add version option to gem open command. Pull request #1483 by Hrvoje
  Šimić.
* Feature/add silent flag. Pull request #1455 by Luis Sagastume.
* Allow specifying gem requirements via env variables. Pull request #1472
  by Samuel E. Giddins.

Bug fixes:

* RubyGems now stores `gem push` credentials under the host you signed-in for.
  Pull request #1485 by Josh Lane.
* Move `coding` location to first line. Pull request #1471 by SHIBATA
  Hiroshi.
* [PathSupport] Handle a regexp path separator. Pull request #1469 by
  Samuel E. Giddins.
* Clean up the PathSupport object. Pull request #1094 by Aaron Patterson.
* Join with File::PATH_SEPARATOR in Gem.use_paths. Pull request #1476 by
  Samuel E. Giddins.
* Handle when the gem home and gem path arent set in the config file. Pull
  request #1478 by Samuel E. Giddins.
* Terminate TimeoutHandler. Pull request #1479 by Nobuyoshi Nakada.
* Remove redundant cache. Pull request #1482 by Eileen M. Uchitelle.
* Freeze `Gem::Version@segments` instance variable. Pull request #1487 by
  Ben Dean.
* Gem cleanup is trying to uninstall gems outside GEM_HOME and reporting
  an error after it tries. Pull request #1353 by Luis Sagastume.
* Avoid duplicated sources. Pull request #1489 by Luis Sagastume.
* Better description for quiet flag. Pull request #1491 by Luis Sagastume.
* Raise error if find_by_name returns with nil. Pull request #1494 by
  Zoltán Hegedüs.
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
Fetching: mercenary-0.3.6.gem (100%)
Successfully installed mercenary-0.3.6
Fetching: safe_yaml-1.0.4.gem (100%)
Successfully installed safe_yaml-1.0.4
Fetching: colorator-1.1.0.gem (100%)
Successfully installed colorator-1.1.0
Fetching: rouge-1.11.1.gem (100%)
Successfully installed rouge-1.11.1
Fetching: sass-3.4.22.gem (100%)
Successfully installed sass-3.4.22
Fetching: jekyll-sass-converter-1.4.0.gem (100%)
Successfully installed jekyll-sass-converter-1.4.0
Fetching: rb-fsevent-0.9.7.gem (100%)
Successfully installed rb-fsevent-0.9.7
Fetching: ffi-1.9.14-x64-mingw32.gem (100%)
Successfully installed ffi-1.9.14-x64-mingw32
Fetching: rb-inotify-0.9.7.gem (100%)
Successfully installed rb-inotify-0.9.7
Fetching: listen-3.0.8.gem (100%)
Successfully installed listen-3.0.8
Fetching: jekyll-watch-1.5.0.gem (100%)
Successfully installed jekyll-watch-1.5.0
Fetching: forwardable-extended-2.6.0.gem (100%)
Successfully installed forwardable-extended-2.6.0
Fetching: pathutil-0.14.0.gem (100%)
Successfully installed pathutil-0.14.0
Fetching: addressable-2.4.0.gem (100%)
Successfully installed addressable-2.4.0
Fetching: jekyll-3.3.0.gem (100%)
Successfully installed jekyll-3.3.0
Parsing documentation for liquid-3.0.6
Installing ri documentation for liquid-3.0.6
Parsing documentation for kramdown-1.12.0
Installing ri documentation for kramdown-1.12.0
Parsing documentation for mercenary-0.3.6
Installing ri documentation for mercenary-0.3.6
Parsing documentation for safe_yaml-1.0.4
Installing ri documentation for safe_yaml-1.0.4
Parsing documentation for colorator-1.1.0
Installing ri documentation for colorator-1.1.0
Parsing documentation for rouge-1.11.1
Installing ri documentation for rouge-1.11.1
Parsing documentation for sass-3.4.22
Installing ri documentation for sass-3.4.22
Parsing documentation for jekyll-sass-converter-1.4.0
Installing ri documentation for jekyll-sass-converter-1.4.0
Parsing documentation for rb-fsevent-0.9.7
Installing ri documentation for rb-fsevent-0.9.7
Parsing documentation for ffi-1.9.14-x64-mingw32
Installing ri documentation for ffi-1.9.14-x64-mingw32
Parsing documentation for rb-inotify-0.9.7
Installing ri documentation for rb-inotify-0.9.7
Parsing documentation for listen-3.0.8
Installing ri documentation for listen-3.0.8
Parsing documentation for jekyll-watch-1.5.0
Installing ri documentation for jekyll-watch-1.5.0
Parsing documentation for forwardable-extended-2.6.0
Installing ri documentation for forwardable-extended-2.6.0
Parsing documentation for pathutil-0.14.0
Installing ri documentation for pathutil-0.14.0
Parsing documentation for addressable-2.4.0
Installing ri documentation for addressable-2.4.0
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

先新建一个文件夹（这里命名为Jekyll）用于存放博客内容，然后在命令提示符中执行以下命令来创建Jekyll工作区。

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

然后再执行命令，创建Jekyll工作区（记得先把上面new操作创建的myblog目录删掉）

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

接下来到博客文件夹中，开启Jekyll服务器（watch参数用于检测文件变化，即修改后不需重启Jekyll，可惜Windows不支持）

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

访问http://127.0.0.1:4000/会看到下面的页面

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

这是因为Jekyll3.x中默认安装已没有此分页组件，官方将其插件化了，故需独立安装，详见[https://jekyllrb.com/docs/pagination/](https://jekyllrb.com/docs/pagination/)

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

访问http://127.0.0.1:4000/就看到本地页面了

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



### 牙疼，剩下的明天再写吧。。