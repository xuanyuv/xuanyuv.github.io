---
layout: post
title: "idea配置小结"
categories: 工具
tags: idea intellij eclipse netbeans
author: 玄玉
excerpt: 一些idea的优化配置，诸如字体、乱码、显示、格式、主题、快捷键等等。
---

* content
{:toc}


> 本文所列配置项，已适配最新版：ideaIC-2018.2.5

## 快捷键

 * 自动补全：Alt + 回車
 * 快速输入main函数：键入 main 再按 Ctrl+J 键（或者键入 psvm 再按 Tab 键）
 * 快速输入System.out.println：键入 sout 再按 Tab 键（对应Eclipse中的syso）
 * 快速生成普通for循环： 键入 fori 再按 Tab 键或 Ctrl+J 键
 * 快速生成foreach循环：键入 iter 再按 Tab 键或 Ctrl+J 键
 * 查询某方法被其它地方调用：Ctrl+Alt+H（其实：Alt + F7 更好用）
 * 定位文件或直接定位某一行：Ctrl+N 或者 Ctrl+Shift+N 时输入文件名后，再跟上冒号和行号，如 `LoanHelper:22`
 * 合并develop分支到master：master分支上工程上右键---Git---Repository---Merge Changes---Branches to merge选择develop分支
 * 常用快捷键：<http://wiki.jikexueyuan.com/project/intellij-idea-tutorial/keymap-introduce.html>
 * 缩进用Tab还是空格：<http://ooxx.me/tabs-vs-spaces.orz>

## 橘黄色图标插件

idea 从 2016.3 开始，文件夹图标全部换成那种有点蓝色的，单独拿出来看上去有点高科技，放在一起实则暴丑的图标

对于习惯之前版本的橘黄色图标的人来说，可以用这个 Idea 2016.2 Icon Pack 插件来恢复，目前最新版为 v3.2

插件介绍见：<https://plugins.jetbrains.com/idea/plugin/7285-idea-2016-2-icon-pack>

这是 v3.2 的官方下载地址：<https://plugins.jetbrains.com/files/7285/47285/Idea11Icons.jar>

这是 v3.2 的我备份的地址：<http://oirr30q6q.bkt.clouddn.com/jadyer/idea/Idea11Icons_v3.2.jar>

安装时选择 Install plugin from disk... 再重启 idea 就会看到经典的橘黄色图标啦

## 首次运行前配置

### idea64.exe.vmoptions

```
-server
-Xms2048m
-Xmx2048m
-XX:MaxPermSize=1024m
-XX:ReservedCodeCacheSize=512m
-XX:+UseConcMarkSweepGC
-XX:+UseCodeCacheFlushing
-XX:SoftRefLRUPolicyMSPerMB=100
-ea
-Dsun.io.useCanonCaches=false
-Dsun.awt.keepWorkingSetOnMinimize=true
-Djava.net.preferIPv4Stack=true
-Djsse.enablesSNIExtension=false
-Djdk.http.auth.tunneling.disabledSchemes=""
-XX:+HeapDumpOnOutOfMemoryError
-XX:-OmitStackTraceInFastThrow

```

### idea.properties

`idea.config.path=D:/Develop/ideaIC/JadyerData/config`，配置idea个性化配置目录

`idea.system.path=D:/Develop/ideaIC/JadyerData/system`，配置idea系统文件目录

`idea.max.intellisense.filesize=2500`，编辑大文件时idea容易卡顿，可适当提高该属性值

`idea.cycle.buffer.size=disabled`，禁用控制台输出缓存，大项目开启很多输出时，控制台会很快刷满

导致不能自动输出后面的日志，这时可以禁用该值或增大 `idea.cycle.buffer.size=1024` 的配置

## 欢迎窗口的配置

### 设置JDK

Configure---Project Defaults---Project Structure---Project Settings---Project---设置JDK和编译级别

### 应用控制台颜色输出

Configure---Project Defaults---Run Configurations---Templates---Application---VM options: -Dspring.output.ansi.enabled=ALWAYS

对于 SpringBoot 那种 main(String[] args) 方法直接启动的（Maven或者Gradle与之类似，也是右上角配置JVM参数），控制台会彩色输出日志信息

### 黑色主题及避免中文乱码

settings---Appearance & Behavior---Appearance---Theme---Darcula

并勾选 Override default fonts by，同时使用 Microsoft YaHei UI 字体

注意：此处若选 Yahei Consolas Hybrid 字体，会使得配置窗口很难看，非常难看

### 打开内存使用状态

settings---Appearance & Behavior---Appearance---Show memory indicator

### 隐藏工具栏快捷键下划线

settings---Appearance & Behavior---Appearance---Disable mnemonics in menu

### 启动时不打开工程

settings---Appearance & Behavior---System Settings---Reopen last project on startup

### 打开工程时询问打开窗口

settings---Appearance & Behavior---System Settings---Project Opening---Confirm window to open project in

这样在菜单栏 File---Open Recent---选择某个工程师，会弹出提示框询问在当前窗口（This Window）打开还是新窗口（New Window）

### 取消自动更新

settings---Appearance & Behavior---System Settings---Updates---Automatically check updates

### 修改代码提示快捷键

settings---keymap---搜索框输入basic（idea默认的是Ctrl+空格，和我们输入法冲突）---Ctrl+B

### 设置全屏模式快捷键

即工具类View菜单下面的Enter Full Screen

settings---keymap---搜索框输入full screen（搜索到的是Toggle Full Screen mode）---F11

### 修改文件关闭快捷键

settings---keymap---快捷键搜索Ctrl+F4（搜索到的是Window--Editor Tabs--Close）---Ctrl+W

### 修改类方法列表快捷键

settings---keymap---快捷键搜索Ctrl+F12（搜索到的是Main menu--Navigate--File Structure）---添加Ctrl+O

另外，显示类结构视图的快捷键默认为Alt+7（搜索到的是Tool Windows--Structure），感觉它不如Ctrl+F12方便

### 设置Ctrl+E弹层的文件个数

settings---Editor---General---Limits---Recent files limit---默认为50个

### 自动移除UnuseImport

settings---Editor---General---Auto Import---Add unambiguous...fly 以及 Optimize imports...fly

未生效可检查settings---Editor---inspections---Java---Imports---Unused import(editor light)---勾选

注意：通过 Ctrl+X 的方式可能不会有效果，只有 Ctrl+Y 或全选后按键盘回退或 Delete 删除时有效果

### 显示行号

settings---Editor---General---Appearance---Show line numbers

### 取消面包屑导航

即打开 HTML／XML 文件时隐藏 html／header／script 等标签

settings---Editor---General---Breadcrumbs---取消勾选Show breadcrumbs

### 代码提示区分大小写

settings---Editor---General---Code Completion---取消勾选Match case

### 设定折叠或展开的代码类型

settings---Editor---General---Code Folding---勾选表示该类型代码在文件被打开时默认是被折叠的

这里我勾了Inner classes和Anonymous classes

### 移除文件编辑Tab的后缀

settings---Editor---General---Editor Tabs---取消勾选Show file extension

### 移除文件编辑Tab的`×`

settings---Editor---General---Editor Tabs---Close button position下拉框选择None

### 星号标识编辑过的文件

settings---Editor---General---Editor Tabs---勾选Mark modified (*)

### 设置文件编辑Tab的最多数

当我们打开的文件数超过该设置时，最先打开的文件会被关闭

settings---Editor---General---Editor Tabs--Closing Policy---Tab limit---默认为10个

### 代码字体

Windows Vista 发布时，一款全新的中英文字体也随之面世：微软雅黑体（Yahei Consolas Hybrid）

据说微软为了打造这个字体，做每个字的成本几乎达到100美元，也被戏称有史以来最昂贵的一套中文字体

其中 Consolas 是专为编程人员设计的字体

它特性是：所有字母、数字与符号都很容易辨认，且具有相同的宽度，看着很舒服

下载地址如下：（三个地址都是同一个文件）

<http://oirr30q6q.bkt.clouddn.com/jadyer/idea/YaHei_Consolas_Hybrid.rar>

<http://download.csdn.net/detail/jadyer/9719438>

<http://www.intellij.org/downloads/YaHei.Consolas.1.12.zip>

安装方法为：拷贝 `ttf` 文件到 `C:\Windows\Fonts\` 目录即可，然后重启 idea 进行配置

settings---Editor---Font---Font---取消勾选 Show only monospaced fonts，然后选择 Yahei Consolas Hybrid，Size=14

### 控制台字号

settings---Editor---Color Scheme---Console Font---勾选Use console font instead---Size=12（字体不变）

### 函数花括号显示为对称结构

settings---Editor---Colors Style---Java---Wrapping and Braces---Braces placement---三项均改为Next line

### import每个类而非整个包

settings---Editor---Colors Style---Java---Imports---Class count to use import with '*' 设置大一点

当Java类中import某个包下的类超过这里设置的个数，就会换成用星号来代替，比如 `import java.util.*`

### 注释时双斜杠位置为代码头部

settings---Editor---Colors Style---Java---Code Generation---取消勾选Line comment at first column

### 自定义文件代码模板

settings---Editor---File and Code Templates---Includes---File Header---编辑为如下

```
/**
 * Created by 玄玉<https://jadyer.cn/> on ${DATE} ${TIME}.
 */
```

### 资源文件的中文显示

settings---Editor---File Encodings---Global Encoding---UTF-8

settings---Editor---File Encodings---Project Encoding---UTF-8

settings---Editor---File Encodings---Default encoding for properties files---UTF-8

settings---Editor---File Encodings---Transparent native-to-ascii conversion

### 自定义方法上的注释

settings---Editor---Live Templates---右上角 `+` 选择 Template Group---我输入的模板组名是 JadyerGroup

然后点击 JadyerGroup---右上角 `+` 加号选择 Live Template---设置自定义的触发注释输出的字母

然后在最下方的 No applicable contexts. Define 处选择模板适用范围（截图中我勾选的是**Java**范围）

接下来填写自定义的注释内容，如截图所示（我设置的就是输入 `c` ，然后按 `Tab` 键，就会生成方法注释）

其中时间位置可以用 `$date$` 或者 `$time$` 占位，并点击 Edit variables 按钮，然后在下拉框选择 `date()` 和 `time()`

![](/img/2016/2016-04-20-idea-config.png)

### 隐藏文件和文件夹

settings---Editor---File Types---Ignore files and folders---`target;.gradle;*.iml;*.idea;`

### 版本控制下文件变化的显示

settings---Version Control---Show directories with changed descendants

开启后若想调整文件夹的显示颜色：settings---Version Control---File Status Color

### Maven配置

settings---Build,Execution,Deployment---Build Tools---Maven---选择本机Maven及本地仓库，并勾选Print exception stack traces

### Maven自动刷新

settings---Build,Execution,Deployment---Build Tools---Maven---Importing---Import Maven projects automatically

### Maven自动导入源码

settings---Build,Execution,Deployment---Build Tools---Maven---Importing---Automatically download---勾选Sources

### Maven导入时的JDK

settings---Build,Execution,Deployment---Build Tools---Maven---Importing---JDK for importer---选择本机安装的1.8

### Maven运行时的JDK

settings---Build,Execution,Deployment---Build Tools---Maven---Runner---JRE---选择本机安装的1.8

### 自动编译

settings---Build,Execution,Deployment---Compiler---Build project automatically


## 关闭警告

### DefaultFileTemplate

settings---Editor---Inspections---General---取消勾选Default File Template Usage

### 方法参数是相同值

settings---Editor---Inspections---Java---Declaration redundancy---取消勾选Actual method parameter is the same constant

### neverused

settings---Editor---Inspections---Java---Declaration redundancy---取消勾选Unused declaration

### lamba转化

settings---Editor---Inspections---Java---Java language level migration aids---Java 8---取消勾选Anonymous type can be replaced with lambda

### @see@create@author

settings---Editor---Inspections---Java---Javadoc---

取消勾选Declaration has Javadoc problems（适用@create@author）

取消勾选Declaration has problems in Javadoc references（适用@see）

### 方法和类同名

settings---Editor---Inspections---Java---Naming conventions---取消勾选Method name same as class name

### String代替StringBuffer

settings---Editor---Inspections---Java---Performance issues---取消勾选StringBuilder can be replaced with String

### 未处理方法返回值

比如`java.io.File.delete()`

settings---Editor---Inspections---Java---Probable bugs---取消勾选Result of method call ignored

### 未生成serialVersionUID

settings---Editor---Inspections---Java---Serialization issues---勾选Serializable class without 'serialVersionUID'

### 无需定义serialVersionUID

settings—Editor—Inspections—Java—Serialization issues—勾选Non-serializable class with 'serialVersionUID'

即非序列化的类，不需要定义serialVersionUID

然后回到我们的类文件中，将光标放到类名上，再按 Alt+Enter 键就会提示生成serialVersionUID

### properties的属性未使用

settings---Editor---Inspections---Properties Files---Unused Property---取消勾选

### 拼写检查

settings---Editor---Inspections---Spelling---取消勾选

### spring的一些警告

关闭Can not resolve configuration property 'jasypt.file.****' 的警告

settings---Editor---Inspections---Spring---Spring Boot---取消勾选Spring Boot application.yml

关闭Application context not configured for this file的警告

settings---Editor---Inspections---Spring---Spring Core---Setup---取消勾选Spring Facet Code Configuration


## 其它

### Project视图折叠空包

Project视图---右上角倒数第二个齿轮图标---点击齿轮后选择Compact Middle Packeages

### 省电模式

File---Power Save Mode---此时会关掉代码检查、代码提示等功能，适合读代码，所以也称为阅读模式

### 编译报错

* 报告：OutOfMemoryError

    > 将其默认的700MB增大（64位用户在内存足够的情况下，建议改为1500或以上）<br/>
settings---Build,Execution,Deployment---Compiler---Build process heap size(Mbytes)

* 报告：找不到符号、未结束的字符串文字

    > 1、UTF-8文件分有BOM和无BOM，idea默认使用的编译器是javac，而其只能编译无BOM的文件（settings---Editor---File Encodings---右侧最下方BOM设置）<br/>
　　很多eclipse用户在使用idea开发eclipse项目时会遇到此问题<br/>
　　主要是因为eclipse的编译器是eclipse，其支持有BOM的文件编译。故需对文件进行BOM去除<br/>
2、批量去除BOM，可以Google：批量去除BOM、批量转换无BOM等关键字，网上已有各种方案<br/>
3、除了通过去除BOM，还有设置idea的编译器为eclipse，但是一般不建议这样做<br/>
4、若仍无法解决，而且也确认了idea各配置编码都是UTF-8，报错文件编码也是UTF-8无BOM的<br/>
　　那还有一种可能也会出现这种情况：项目配置文件有问题<br/>
　　项目编码的配置文件在：/项目目录/.idea/encodings.xml。你要是能修改明白就修改<br/>
　　要是不会修改，那就删掉.idea整个目录，重启idea重新配置这个项目即可

### 清除缓存和索引

idea的缓存和索引主要用来加快文件查询、代码提示等操作的速度，但其缓存和索引文件偶尔会莫名损坏

此时打开idea，很有可能idea会报告各种奇妙的错误，甚至打不开项目，idea主题还原为默认状态等等

此时便需清除缓存和索引，清除之后下次启动时就会重建

File-->Invalidate Caches / Restart（此时会弹出一个提示框，内容如下）

```
The caches will be invalidated and rebuilt on the next startup.
WARNING: Local History will be also cleared.
Would you like to continue?
```

一般建议点击 Invalidate and Restart，这样会清除的比较干净

**注意**：若项目未加入版本控制，而又需要项目文件的历史更改记录，那么最好备份下 idea.properties 文件中的 ${idea.system.path}\LocalHistory\ 目录