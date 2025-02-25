---
layout: post
title: "Jekyll搭建静态博客"
categories: 工具
tags: jekyll rubygems blog
author: 玄玉
excerpt: 详细介绍了通过Jekyll在GithubPages（github.io）上创建静态博客的方法。
published: true
---

* content
{:toc}


可以说这是我的第一篇github-blog，下面通过Markdown一步步描述从环境搭建到运行看效果。

## Windows环境

### 安装Jekyll

我们要先安装 Ruby

通过 <https://rubyinstaller.org/downloads/archives/> 下载 127MB 大小的 [rubyinstaller-devkit-3.3.3-1-x64.exe](https://github.com/oneclick/rubyinstaller2/releases/download/RubyInstaller-3.3.3-1/rubyinstaller-devkit-3.3.3-1-x64.exe)

`注意：后面安装 jekyll 时会依赖 MSYS2，所以这里直接下载带 devkit 的安装包`

安装时注意勾选 **Add Ruby executables to your PATH** （不然后面还得手动配置环境变量）

安装到最后一步，再按照提示安装 MSYS2：弹出的窗口选择 **3 - MSYS2 and MINGW development toolchain**

（这个耗时有点长，慢慢等待...）

最后，在命令提示符中验证一下安装结果

```
C:\Users\xuanyu>ruby -v
ruby 3.3.3 (2024-06-12 revision f1c7b6f435) [x64-mingw-ucrt]
```

然后通过 RubyGems 安装 Jekyll，所以先到官网 <https://rubygems.org/> 下载 1.19MB 大小的[rubygems-3.5.11.zip](https://rubygems.org/rubygems/rubygems-3.5.11.zip)

接着解压压缩包到桌面，并在命令提示符中执行安装命令

```
C:\Users\xuanyu\Desktop\rubygems-3.5.11>ruby setup.rb
  Successfully built RubyGem
  Name: bundler
  Version: 2.5.11
  File: bundler-2.5.11.gem
Bundler 2.5.11 installed
RubyGems 3.5.11 installed
...
...
RubyGems installed the following executables:
        D:/Develop/Ruby3.3.3-1/bin/gem
        D:/Develop/Ruby3.3.3-1/bin/bundle
        D:/Develop/Ruby3.3.3-1/bin/bundler

D:\Develop\rubygems-3.5.11>
```

然后删掉桌面的 rubygems-3.5.11 文件夹，它没用了

**下面进入正题：用 RubyGems 来安装 Jekyll**（这个耗时也有点长...）

```
C:\Users\xuanyu>gem -v
3.5.11
C:\Users\xuanyu>gem install jekyll
Fetching webrick-1.9.1.gem
Fetching unicode-display_width-2.6.0.gem
Fetching terminal-table-3.0.2.gem
Fetching safe_yaml-1.0.5.gem
...
...
Parsing documentation for jekyll-4.4.1
Installing ri documentation for jekyll-4.4.1
Done installing documentation for webrick, unicode-display_width, terminal-table, safe_yaml, rouge, forwardable-extended, pathutil, mercenary, liquid, rexml, kramdown, kramdown-parser-gfm, ffi, rb-inotify, rb-fsevent, listen, jekyll-watch, google-protobuf, sass-embedded, jekyll-sass-converter, concurrent-ruby, i18n, http_parser.rb, eventmachine, em-websocket, colorator, public_suffix, addressable, jekyll after 30 seconds
29 gems installed

C:\Users\xuanyu>
```

至此，Jekyll就安装完毕了

### 复制主题

本博主题修改自：<https://github.com/Gaohaoyang/gaohaoyang.github.io>

其第一版的介绍为：<http://jekyllthemes.org/themes/cool-concise-high-end/>

另外这个主题网站也挺不错：<https://jekyllthemes.io/>

这里将该主题代码弄下来后，还是通过 `jekyll serve --watch` 命令启动来查看本地效果

本地启动时，可能会报告下面的错误

```
C:\Users\xuanyu\Desktop\xuanyuv.github.io>jekyll serve --watch
Configuration file: C:/Users/xuanyu/Desktop/xuanyuv.github.io/_config.yml
  Dependency Error: Yikes! It looks like you don't have jekyll-paginate or one of its dependencies installed. In order to use Jekyll as currently configured, you'll need to install this gem. If you've run Jekyll with `bundle exec`, ensure that you have included the jekyll-paginate gem in your Gemfile as well. The full error message from Ruby is: 'cannot load such file -- jekyll-paginate' If you run into trouble, you can find helpful resources at https://jekyllrb.com/help/!
                    ------------------------------------------------
      Jekyll 4.4.1   Please append `--trace` to the `serve` command
                     for any additional information or backtrace.
                    ------------------------------------------------

C:\Users\xuanyu\Desktop\xuanyuv.github.io>
```

这是因为 Jekyll 中默认安装已没有此分页组件，[官方将其插件化了](https://jekyllrb.com/docs/pagination/)，故需独立安装

```
C:\Users\xuanyu>gem install jekyll-paginate
Fetching jekyll-paginate-1.1.0.gem
Successfully installed jekyll-paginate-1.1.0
Parsing documentation for jekyll-paginate-1.1.0
Installing ri documentation for jekyll-paginate-1.1.0
Done installing documentation for jekyll-paginate after 0 seconds
1 gem installed

C:\Users\xuanyu>
```

接着再启动就成功了，访问 <http://127.0.0.1:4000/> 就看到本地页面了

![](https://ae01.alicdn.com/kf/H3cb4d2c076d44ffea88043d11b3ee97cV.png)

## Linux环境

上面介绍的的 Windows 环境下的安装配置，其实 Linux 下的也不复杂，步骤都一样

### 安装Jekyll

这里是通过源码来编译安装的（服务器是阿里云 ECS，操作系统是 CentOS-7.9.2009）

首先下载 21MB 大小的 [ruby-3.3.3.tar.gz](https://cache.ruby-lang.org/pub/ruby/3.3/ruby-3.3.3.tar.gz)，官方地址下载的有点慢，[可以在这下载](https://cache.ruby-china.com/pub/ruby/3.3/ruby-3.3.3.tar.xz)

然后校验下 sha256：83c05b2177ee9c335b631b29b8c077b4770166d02fa527f3a9f6a40d13f3cce2

```shell
[root@dev backup]# yum install -y libyaml-devel # 编译 Ruby 时的依赖
[root@dev backup]# tar zxvf ruby-3.3.3.tar.gz   # 解压 Ruby 源码包
[root@dev backup]# cd ruby-3.3.3/               # 注意需要指定 OpenSSL
[root@dev ruby-3.3.3]# ./configure --prefix=/app/software/ruby-3.3.3 --with-openssl-include=/app/software/openssl-3.0.14/include/ --with-openssl-lib=/app/software/openssl-3.0.14/lib64/
[root@dev ruby-3.3.3]# make && make install
# Installing to 
# installing binary commands:         /app/software/ruby-3.3.3/bin
# installing base libraries:          /app/software/ruby-3.3.3/lib
# installing default gems from lib:   /app/software/ruby-3.3.3/lib/ruby/gems/3.3.0
# installing default gems from ext:   /app/software/ruby-3.3.3/lib/ruby/gems/3.3.0
# installing bundled gems:            /app/software/ruby-3.3.3/lib/ruby/gems/3.3.0
# installing bundled gem cache:       /app/software/ruby-3.3.3/lib/ruby/gems/3.3.0/cache
[root@dev ruby-3.3.3]# cd ..
[root@dev backup]# rm -rf ruby-3.3.3
[root@dev backup]# vim /etc/profile
                   # Set Ruby Environment Variable
                   RUBY_HOME=/app/software/ruby-3.3.3
                   PATH=$RUBY_HOME/bin:$RUBY_HOME/lib:$PATH
                   export RUBY_HOME PATH
[root@dev backup]# source /etc/profile                         # 放到环境变量，并使之生效
[root@dev backup]# ruby -v                                     # 验证下版本
ruby 3.3.3 (2024-06-12 revision f1c7b6f435) [x86_64-linux]
[root@dev backup]# gem -v                                      # Ruby 自带了 RubyGems，所以不用单独安装
3.5.11
[root@dev backup]# vim /root/.gemrc                            # 使得 RubyGems 可以忽略 SSL 验证错误
:ssl_verify_mode: 0
[root@dev backup]# gem sources -a https://gems.ruby-china.com/ # 增加源
[root@dev backup]# gem sources --remove https://rubygems.org/  # 删除原有源
[root@dev backup]# gem sources -l                              # 查看当前源
[root@dev backup]# yum install -y "gcc-c++.x86_64"             # 下一步 install jekyll 时的 make 所需
[root@dev backup]# gem install jekyll                          # （此过程中会提示 SLL 验证错误，不用管）
# Fetching webrick-1.8.1.gem
# Fetching unicode-display_width-2.5.0.gem
# Fetching terminal-table-3.0.2.gem
# Fetching safe_yaml-1.0.5.gem
# ...
# ...
# Successfully installed webrick-1.8.1
# Successfully installed jekyll-4.3.3
# Parsing documentation for jekyll-4.3.3
# Done installing documentation for webrick, unicode-display_width, terminal-table, safe_yaml, rouge, forwardable-extended, pathutil, mercenary, liquid, kramdown, kramdown-parser-gfm, ffi, rb-inotify, rb-fsevent, listen, jekyll-watch, google-protobuf, sass-embedded, jekyll-sass-converter, concurrent-ruby, i18n, http_parser.rb, eventmachine, em-websocket, colorator, public_suffix, addressable, jekyll after 17 seconds
# 28 gems installed
[root@dev backup]# jekyll -v                   # 打印下版本
jekyll 4.3.3
[root@dev backup]# gem install jekyll-paginate # 安装分页组件
# Fetching jekyll-paginate-1.1.0.gem
# Successfully installed jekyll-paginate-1.1.0
# Parsing documentation for jekyll-paginate-1.1.0
# Installing ri documentation for jekyll-paginate-1.1.0
# Done installing documentation for jekyll-paginate after 0 seconds
# 1 gem installed
[root@dev backup]# exit                        # 下面通过普通用户操作
[xuanyu@dev ~]$ cd /app/www/
[xuanyu@dev www]$ jekyll new blog
Running bundle install in /app/www/blog...
  Bundler: Fetching gem metadata from https://rubygems.org/............
  Bundler: Resolving dependencies...
  Bundler: Bundle complete! 7 Gemfile dependencies, 36 gems now installed.
  Bundler: Use `bundle info [gemname]` to see where a bundled gem is installed.
New jekyll site installed in /app/www/blog.
[xuanyu@dev www]$ cd blog/
[xuanyu@dev blog]$ jekyll serve -w --host=0.0.0.0 # 监听地址默认127.0.0.1，这样公网是访问不到的
```

### 发布博客

这里的发布思路就是：

1. 停止 Jekyll 服务
2. 删除 _site（生成的文章目录）
3. 通过 [Git](https://www.xuanyuv.com/blog/20140926/centos-install-apache.html) 拉取最新的文章
4. 启动 Jekyll 服务

然后再在前面使用 Nginx 代理 Jekyll 服务，就可以访问了

本地发布的话，可以通过 IntelliJ IDEA 上的 Alibaba Cloud Toolkit 插件，来触发远程脚本执行

下面就是启动脚本：**/app/www/xuanyuv.startup.sh**，以及，Alibaba Cloud Toolkit 插件的配置

```shell
#!/bin/bash
APP_NAME=jekyll
APP_PATH=/app/www/xuanyuv.github.io/
RUN__LOG=/app/www/xuanyuv.nohup.log

appPID=0
getAppPID(){
    pidInfo=`ps aux|grep $APP_NAME|grep -v grep`
    if [ -n "$pidInfo" ]; then
        appPID=`echo $pidInfo | awk '{print $2}'`
    else
        appPID=0
    fi
}

shutdown(){
    getAppPID
    echo ""
    echo "[玄玉] =============================================================="
    if [ $appPID -ne 0 ]; then
        echo -n "[玄玉] Stopping $APP_NAME(PID=$appPID)..."
        kill -9 $appPID
        if [ $? -eq 0 ]; then
            echo "[Success]"
            echo "[玄玉] =============================================================="
        else
            echo "[Failed]"
            echo "[玄玉] =============================================================="
        fi
        getAppPID
        if [ $appPID -ne 0 ]; then
            shutdown
        fi
    else
        echo "[玄玉] $APP_NAME is not running"
        echo "[玄玉] =============================================================="
    fi
    echo ""
}

# 注意：jekyll serve 命令执行时，若增加 --detach 参数，发现 --watch 会失效
# 注意：若执行完 jekyll serve 命令，就立即 tail 输出日志，发现 jekyll 进程会被停掉
startupByNohup(){
    nohup $APP_NAME serve --watch > $RUN__LOG 2>&1 &
    #tail -100f $RUN__LOG
}

shutdown
cd $APP_PATH
rm -rf _site
git pull origin master
startupByNohup
```

![](https://gcore.jsdelivr.net/gh/xuanyuv/mydata/img/blog/2016/2016-10-17-jekyll-build-blog-04.png)

## Jekyll补充

* Jekyll 中文介绍见：<http://jekyllcn.com/docs/structure/>
* _posts 目录用于存放博文，格式是：YEAR-MONTH-DAY-title.md
* _drafts 目录用于存放草稿文件，格式是：title.md（没有日期）
* _site 目录用于存放 Jekyll 生成的网站文件
* _layouts 目录用于存放模板文件
* _includes 目录用于存放可以被模板文件包含的公共文件
* _data 目录用于存放数据，Jekyll 会自动加载这里的所有 .jml 或者 .yaml 结尾的文件
* static 目录是个人自定义的，一般存放公共资源，比如 js/css/img
* page 目录是个人自定义的，一般存放站内固定的页面
* sitemap.txt 是给搜索引擎看的，告诉它怎么爬这个站
* index.html 是整站的入口
* 附：Jekyll语法简单笔记：<https://yulijia.net/cn/软件世界/2015/03/12/jekyll-syntax.html>
* 附：Jekyll语法简单笔记：<http://github.tiankonguse.com/blog/2014/11/10/jekyll-study.html>

## 图床

写博客就一定会用到图片，压缩图片的话可以用 **[tinypng](https://tinypng.com/)** 或者 **[色彩笔](https://www.secaibi.com/tools/)** 在线工具批量压缩

目前我大部分用的都是阿里云图床，现在上传入口好多都失效了

所以找到了 jsDelivr + GitHub 这个办法来做图床，即稳定又免费还支持全球CDN

做法就是在 Github 建一个 Public 的仓库，用来放图片

然后用这个地址就行了：**https://cdn.jsdelivr.net/gh/你的用户名/你的仓库名/文件路径**

若想手动刷新 jsDelivr 缓存，只需把链接中的 https://**cdn**.jsdelivr.net/ 替换成 https://**purge**.jsdelivr.net/ 即可

> 如果 cdn.jsdelivr.net 暂时失效的话，可以尝试将URL中的 cdn.jsdelivr.net 换成以下地址<br/>
gcore.jsdelivr.net<br/>
fastly.jsdelivr.net<br/>
testingcf.jsdelivr.net

另外：js 和 css 等静态文件的 CDN，推荐使用 [字节跳动静态资源公共库](https://cdn.bytedance.com/)

另外：参考 <https://blog.akass.cn/resources/mirrors>（bootcdn 和 staticfile 已被污染）