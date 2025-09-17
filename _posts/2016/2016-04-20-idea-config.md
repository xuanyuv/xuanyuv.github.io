---
layout: post
title: "idea配置小结"
categories: 工具
tags: idea
author: 玄玉
excerpt: 一些idea的优化配置，诸如字体、乱码、显示、格式、主题、快捷键等等。
---

* content
{:toc}


> 本文所列配置项，已适配：ideaIC-2023.3.8<br/>
  idea历史版本下载：<http://www.jetbrains.com/idea/download/other.html>

## 快捷键

| 快捷键                 | 用途                     | 备注                     |
|:--------------------|:-----------------------|:-----------------------|
| Alt + 回车            | 自动补全                   |                        |
| Ctrl + Alt + 鼠标左键   | 进入实现类                  | 对应 eclipse 中的 Ctrl + T |
| Ctrl + Alt + 方向左键   | 返回上一个方法                |                        |
| Ctrl + Alt + H      | 查询某方法被其它地方调用           | 另外：Alt + F7 也挺好用       |
| 键入 main 再按 Ctrl+J 键 | 快速输入main函数             | 或者：键入 psvm 再按 Tab 键    |
| 键入 sout 再按 Tab 键    | 快速输入System.out.println | 对应 eclipse 中的 syso     |

## 橘黄色图标插件

idea.2016.3 开始，文件夹图标全部换成了暴丑的蓝色

可以用这个插件：[Idea 2016.2 Icon Pack](https://plugins.jetbrains.com/idea/plugin/7285-idea-2016-2-icon-pack)，回到原来的橘黄色图标

另外：2019.3.2 中该插件无效（2018.3.6 没问题），此时可以用这个插件：[Legacy Icon Pack for 2018.2+](https://plugins.jetbrains.com/plugin/10777-legacy-icon-pack-for-2018-2-)

## 首次运行前的配置

### idea.properties

```properties
idea.config.path=D:/Develop/JetBrains/xuanyuData/ideaic/config
idea.system.path=D:/Develop/JetBrains/xuanyuData/ideaic/system
idea.plugins.path=${idea.config.path}/plugins
idea.log.path=${idea.system.path}/log
# 编辑大文件时idea容易卡顿：可适当提高该属性值
idea.max.intellisense.filesize=2500
# 禁用控制台输出缓存：大项目开启很多输出时，控制台会很快刷满，导致不能自动输出后面的日志
# 这时可以禁用该值或增大其配置
idea.cycle.buffer.size=disabled
```

### 64.exe.vmoptions
```text
-Xms3072m
-Xmx3072m
-XX:ReservedCodeCacheSize=512m
-XX:+UseG1GC
-XX:SoftRefLRUPolicyMSPerMB=100
-XX:CICompilerCount=2
-XX:+HeapDumpOnOutOfMemoryError
-XX:-OmitStackTraceInFastThrow
-XX:+IgnoreUnrecognizedVMOptions
-XX:CompileCommand=exclude,com/intellij/openapi/vfs/impl/FilePartNodeRoot,trieDescend
-ea
-Dsun.io.useCanonCaches=false
-Dsun.java2d.metal=true
-Djbr.catch.SIGABRT=true
-Djdk.http.auth.tunneling.disabledSchemes=""
-Djdk.attach.allowAttachSelf=true
-Djdk.module.illegalAccess.silent=true
-Dkotlinx.coroutines.debug=off

```

## 全局配置

**在欢迎界面，点击左侧 Customize，再点击 All settings，开始下列配置**

### 项目参数及JDK

```
# 注：新版idea要在配置完全局参数，并打开一个工程后，才能配置以下项

# 设置JDK
Structure for New Projects---Project Settings---Project---设置JDK

# 控制台彩色输出：适合 SpringBoot 那种 main() 方法启动的（Maven启动与之类似，也是右上角配置JVM参数）
Run Configuration Templates for New Projects---Application---VM options: -Dspring.output.ansi.enabled=ALWAYS

# 应用启动参数短命令行
Run Configuration Templates for New Projects---Application---Shorten command line---JAR manifest

# 打开内存使用状态
新版：主界面双击Shift，在弹出的搜索栏输入Show memory indicator，再启用即可
旧版：settings---Appearance & Behavior---Appearance---Show memory indicator

# 隐藏左侧和右侧的工具栏
标题栏---view---Appearance---取消勾选 Tool Window Bars（后续双击 Alt 键即可复显出来）

# 隐藏或打开顶部的导航菜单栏
主界面双击Shift，在弹出的搜索栏输入main menu，再启用 View | Appearance: Main Menu 即可
```

### 外观及行为配置

**记得先启用新版UI**

```
# 黑色主题及避免中文乱码（此处若选 Yahei Consolas Hybrid，会使得配置窗口很难看，非常难看）
settings---Appearance & Behavior---Appearance---Theme---默认即可
# 新版：2023.3.6版就用默认的 Dark，Use custom font，Inter，Size=13 就挺好的
# 旧版：Darcula，Use custom font，Microsoft YaHei UI，Size=12

# 隐藏工具栏快捷键下划线
settings---Appearance & Behavior---Appearance---UI Options---不勾选Enable mnemonics in menu

# 应用空闲时自动保存文件
settings---Appearance & Behavior---System Settings---Autosave---勾选Save files if the IDE is idle for 15 seconds

# 不发送统计文件给JetBrains & 取消自动更新 
settings---Appearance & Behavior---System Settings---Data Sharing 和 Updates
```

### 编辑器之通用配置
```
# 自动移除UnuseImport
settings---Editor---General---Auto Import---勾选Add unambiguous...fly 以及 Optimize imports...fly

# 显示行号
settings---Editor---General---Appearance---勾选Show line numbers

# 取消面包屑导航（即打开 HTML／XML 文件时隐藏 html／header／script 等标签）
settings---Editor---General---Breadcrumbs---不勾选Show breadcrumbs

# 代码提示不区分大小写
settings---Editor---General---Code Completion---不勾选Match case

# 设定折叠或展开的代码类型（勾选则表示该类型代码在文件被打开时默认是被折叠显示的）
settings---Editor---General---Code Folding---勾选Inner classes、Anonymous classes

# Tab上移除文件后缀
settings---Editor---General---Editor Tabs---不勾选Show file extension

# Tab上星号标识编辑过且未保存的文件
settings---Editor---General---Editor Tabs---勾选Mark modified

# Tab上移除文件上的叉
settings---Editor---General---Editor Tabs---Close button position---None

# Tab上打开文件的最多数
settings---Editor---General---Editor Tabs--Closing Policy---Tab limit---8
```

### 编辑器之代码字体

**推荐 idea 自带的 JetBrains Mono 字体，这也是一款真等宽的字体**

以前用的是网上推荐的 Yahei Consolas Hybrid 字体（实际它不是真等宽字体），下载地址如下

<https://gitee.com/a42/YaHei-Consolas-Hybrid-1.12>

<https://github.com/GitHubNull/YaHei-Consolas-Hybrid-1.12>

常规的两种安装方法是：双击 ttf 文件再点击安装按钮，或把 ttf 文件拷贝到 C:\Windows\Fonts\ 目录

但新版 Win10 有一个特性：默认安装字体只是给当前用户安装的，而 2018.3 无法良好的适配该特性，导致获取不到新安装字体

解决办法就是：右键 ttf 文件，选择为所有用户安装即可

再回到 idea 配置：`settings---Editor---Font---Yahei Consolas Hybrid，Size=14，Line height=1.2`

### 编辑器之代码风格
```
# 控制台字号（先拷贝一份 Scheme 的 Darcula 配置，新命名为 Darcula_Xuanyu）
settings---Editor---Color Scheme---Console Font---Use console font instead of the default---Size=12

# 文件换行符使用Unix格式（先拷贝一份 Scheme 的 Default 配置，新命名为 Default_Xuanyu）
settings---Editor---Colors Style---Line separator---Unix and macOS (\n)

# import每个类而非整个包（当import某个包下的类超过这里设置的个数时，就会换成星号来代替，比如import java.util.*）
settings---Editor---Colors Style---Java---Imports---Class count to use import with *---64

# 通过快捷键注释时，双斜杠位置为：与代码对齐（默认在行首），且注释的双斜线与注释内容之间有且仅有一个空格
settings---Editor---Colors Style---Java---Code Generation---不勾选Line comment at first column，勾选Add a space at comment start
```

### 编辑器之关闭检查

先拷贝一份 Profile 的 Default 配置，新命名为 Default_Xuanyu

注意：不同的 idea 版本下的 Inspections 配置均有不同，以下只是概述其意

```
# DefaultFileTemplate
settings---Editor---Inspections---General---不勾选Default File Template Usage

# 方法参数是相同值
settings---Editor---Inspections---Java---Declaration redundancy---不勾选Actual method parameter is the same constant

# 取消注释内容中含有代码的提示
settings---Editor---Inspections---Java---Code maturity---不勾选Commented out code

# Return value of the method is never used
settings---Editor---Inspections---Java---Declaration redundancy---不勾选Method can be void

# neverused
settings---Editor---Inspections---Java---Declaration redundancy---不勾选Unused declaration

# lamba转化（这里我还是用的默认勾选）
settings---Editor---Inspections---Java---Java language level migration aids---Java 8---Anonymous type can be replaced with lambda

# @create@author@see（前者针对@create@author，后者针对@see）
settings---Editor---Inspections---Java---Javadoc---不勾选Declaration has Javadoc problems和Declaration has problems in Javadoc references

# 方法和类同名
settings---Editor---Inspections---Java---Naming conventions---Method---不勾选Method name same as class name

# 未处理方法返回值（比如java.io.File.delete()）
settings---Editor---Inspections---Java---Probable bugs---不勾选Result of method call ignored

# serialVersionUID（然后回到类文件中，光标放到类名上，Alt+Enter就会提示生成serialVersionUID）
settings---Editor---Inspections---Java---Serialization issues---勾选Serializable class without serialVersionUID
settings---Editor---Inspections---JVM languages---勾选Non-serializable class with serialVersionUID

# 关闭Maven-jar包最新版检查
settings---Editor---Inspections---Package Search---全部不勾选

# 关闭语法拼写检查
settings---Editor---Inspections---Proofreading---全部不勾选

# properties的属性未使用
settings---Editor---Inspections---Properties Files---不勾选Unused Property
```

### 编辑器之注释模板

这是设置文件头注释（创建新文件时的）

settings---Editor---File and Code Templates---Includes---File Header---编辑为如下

```
/**
 * Created by 玄玉<https://www.xuanyuv.com> on ${DATE} ${TIME}.
 */
```

**同样道理，也可以配置：创建枚举类时，默认的类内容**

settings---Editor---File and Code Templates---Files---Enum---编辑为如下

```
#if (${PACKAGE_NAME} && ${PACKAGE_NAME} != "")package ${PACKAGE_NAME};#end
#parse("File Header.java")
public enum ${NAME} {
    ${NAME}_1 (1, "枚举值01"),
    ${NAME}_2 (2, "枚举值02");

    private final int code;
    private final String msg;

    ${NAME}(int code, String msg){
        this.code = code;
        this.msg = msg;
    }

    public int getCode() {
        return code;
    }

    public String getMsg() {
        return msg;
    }
    
    public static String getMsgByCode(int code){
        for(${NAME} obj : values()){
            if(obj.getCode() == code){
                return obj.getMsg();
            }
        }
        throw new IllegalArgumentException("无法识别的Code=[" + code + "]");
    }
}
```

**接下来是自定义方法上的注释**

settings---Editor---Live Templates---右上角 `+` 选择 Template Group---输入模板组名：XuanyuGroup

再点击 XuanyuGroup---右上角 `+` 加号选择 Live Template---设置自定义的触发注释输出的字母

然后在最下方的 No applicable contexts. Define 处选择模板适用范围（截图中我勾选的是 **Java** 范围）

接下来填写自定义的注释内容，如截图所示（我设置的就是输入 `c` ，然后按 `Tab` 键，就会生成方法注释）

其中时间位置可以用 `$date$` 或者 `$time$` 占位，并点击 Edit variables 按钮，然后在下拉框选择 `date()` 和 `time()`

```
/**
 *
 * Comment by 玄玉<https://www.xuanyuv.com> on $date$ $time$.
 */
```

![](https://ae01.alicdn.com/kf/H7ad4863359204e2a857bf832bc20b055M.png)

### 编辑器之其它

```
# 资源文件的中文显示
settings---Editor---File Encodings---Global Encoding---UTF-8
settings---Editor---File Encodings---Project Encoding---UTF-8
settings---Editor---File Encodings---Default encoding for properties files---UTF-8
settings---Editor---File Encodings---Transparent native-to-ascii conversion

# 隐藏文件和文件夹
settings---Editor---File Types---Ignore files and folders---target;.gradle;*.iml;*.idea;

# 版本控制下文件变化的显示（调整文件夹显示颜色，配置在Version Control---File Status Color）
新版：settings---Version Control---Confirmation---勾选Highlight directories that contain modified files in the Project tree
旧版：settings---Version Control---勾选Show directories with changed descendants

# Markdown文件默认以编辑模式打开
settings---Languages & Frameworks---Markdown---Default layout---Editor
```

### 快捷键

先拷贝一份 keymap 的 Windows 配置，新命名为 Windows_Xuanyu

```
# 修改代码提示快捷键
settings---keymap---搜索框输入basic（idea默认的是Ctrl+空格，和我们输入法冲突）---Ctrl+B

# 设置全屏模式快捷键（即工具类 View 菜单下面的 Enter Full Screen）
settings---keymap---搜索框输入full screen（搜索到的是Toggle Full Screen mode）---F11

# 修改文件关闭快捷键
settings---keymap---快捷键搜索Ctrl+F4（搜索到的是Window--Editor Tabs--Close）---Ctrl+W

# 修改类方法列表快捷键
settings---keymap---快捷键搜索Ctrl+F12（搜索到的是Main menu--Navigate--File Structure）---Ctrl+O
```

### Maven

```
settings---Build,Execution,Deployment---Build Tools---Maven---勾选Print exception stack traces，并选择本机Maven及本地仓库
settings---Build,Execution,Deployment---Build Tools---Maven---Importing---Automatically download---勾选Sources和Annotations
settings---Build,Execution,Deployment---Build Tools---Maven---Importing---JDK for importer---选择本机安装的1.8
settings---Build,Execution,Deployment---Build Tools---Maven---Runner---JRE---选择本机安装的1.8

settings---Build,Execution,Deployment---Compiler---Build project automatically

settings---Build,Execution,Deployment---Compiler---Shared build process heap size(Mbytes)---1024
```

## datagrip的几个配置

数据库工具，常见的有 Heidisql、DBeaver、JookDB、Navicat，其实 JetBrains 家的 DataGrip 也挺好用

> 此处已适配：DataGrip-2021.2.2（2021.2.3版本起，要求登录JetBrains帐号，故无限试用插件也失效了）<br/>
如果想改hosts的话，可以试试下面的<br/>
127.0.0.1 jetbrains.com<br/>
127.0.0.1 www.jetbrains.com<br/>
127.0.0.1 plugins.jetbrains.com<br/>
127.0.0.1 account.jetbrains.com<br/>
127.0.0.1 account.jetbrains.com.cn<br/>
127.0.0.1 plugins.jetbrains.com.cn<br/>
127.0.0.1 www.jetbrains.com.cn<br/>
127.0.0.1 jetbrains.com.cn

### idea.properties

```properties
idea.config.path=D:/Develop/JetBrains/xuanyuData/datagrip/config
idea.system.path=D:/Develop/JetBrains/xuanyuData/datagrip/system
idea.plugins.path=${idea.config.path}/plugins
idea.log.path=${idea.system.path}/log
idea.max.intellisense.filesize=2500
idea.cycle.buffer.size=disabled
```

### 64.exe.vmoptions

```text
-XX:ReservedCodeCacheSize=512m
-Xmx1024m
-Xms1024m
-XX:+UseG1GC
-XX:SoftRefLRUPolicyMSPerMB=100
-XX:CICompilerCount=2
-XX:+HeapDumpOnOutOfMemoryError
-XX:-OmitStackTraceInFastThrow
-ea
-Dsun.io.useCanonCaches=false
-Djdk.http.auth.tunneling.disabledSchemes=""
-Djdk.attach.allowAttachSelf=true
-Djdk.module.illegalAccess.silent=true
-Dkotlinx.coroutines.debug=off

```

### 快捷键等常见用法

| 快捷键           | 用途               | 备注                       |
|:--------------|:-----------------|:-------------------------|
| Ctrl + F5     | 刷新数据             |                          |
| Ctrl + /      | 注释SQL            | 或者：Ctrl + Shift + /      |
| Ctrl + Enter  | 执行SQL            | 未选中SQL的情况下，会弹框询问你执行哪条SQL |
| Ctrl + B      | 快速查看表结构          | 左侧表列表中，选中表，按下此组合键        |
| Ctrl + Q      | 以纵向列的方式查看数据信息    | 选中此行，就会显示此行所有的字段值        |
| Ctrl + N      | 快速导航到指定的表、视图、函数等 | 跟 idea 一样                |
| Shift + Shift | 可以搜索任何想搜索的内容     | 跟 idea 一样                |

```
# 结果集中设置字段值为NULL
在查询出来的结果集中，字段上右键，Set NULL，即可

# 查看本地历史SQL
查询控制台上，右键，Local History，Show History

# 关键字导航
查询控制台上，鼠标放到表名上（也可以是字段名或函数名），按下 Ctrl，再点击鼠标左键，就会立即定位到具体表上

# 多窗口查看结果
若希望查询在新的 tab 中展示，而保留当前查询出来的结果集，那么点击现有结果集上方的 Pin Tab（像针的图标）即可
```

### 常用配置

在欢迎界面，点击左侧 Customize，再点击 All settings，开始下列配置

注：有的配置可参考上方 idea 配置，故不再重复列出

```
# 执行光标所在的语句（此时SQL须以分号结尾，除非手动选中整个SQL，那时就会直接执行选中的SQL）
settings----Database---General---Execute---When inside statement execute---Smallest statement

# 设置SQL方言（创建个项目，进去后，才会显示该配置）
settings----Database---SQL Dialects---Global 和 Project 级别的都设置成 MySQL

# 其实 datagrip 也有工作空间和项目的概念（欢迎屏幕上能看见，默认个人目录），可通过下面配置来自定义
settings---Appearancd & Behavior---System Settings---Default project directory

# 消除绿框（默认在手写SQL时，会有一个绿框跟随着）
settings---Editor---Code Scheme---Database---Console---Statement to execucte---取消勾选Effects

# 关键词大写
settings---Editor---Code Style---SQL---General---Case选项卡---Word Case---Keywords---To Upper

# 连接数据库失败（serverTimezone改成上海，还能避免SQL查询出的时间比真实落库时间早 8 个小时的问题）
标题栏---File---Data Sources...---Drivers---MySQL---设置本地 jar 及 serverTimezone=Asia/Shanghai

# 表名后面显示注释
标题栏---View---Appearance---Details in Tree View
```

### 字符集连接问题

当数据库服务端设置为 UTF8MB4 后

datagrip 在操作数据库时，可能会提示下面信息：

llegal mix of collations (utf8mb4_general_ci,IMPLICIT) and (utf8mb4_0900_ai_ci,IMPLICIT) for operation '='

解决办法就是在数据库连接 URL 上增加：`connectionCollation=utf8mb4_general_ci`