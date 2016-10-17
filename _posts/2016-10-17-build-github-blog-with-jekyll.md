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



## 牙疼，明天再写吧。。