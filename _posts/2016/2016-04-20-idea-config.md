---
layout: post
title: "idea配置小结"
categories: 工具
tags: idea intellij eclipse netbeans
author: 玄玉
excerpt: 一些idea的优化配置，诸如字体、乱码、显示、格式、主题、快捷键、注册码等等。
---

* content
{:toc}


## 插件

### Idea 2016.2 Icon Pack

idea 从 2016.3 开始，文件夹图标全部换成那种有点蓝色的，单独拿出来看上去有点高科技，放在一起实则暴丑的图标

对于习惯之前版本的橘黄色图标的人来说，可以用这个 Idea 2016.2 Icon Pack 插件来恢复，目前最新版为 v3.1.1

插件介绍见：[https://plugins.jetbrains.com/idea/plugin/7285-idea-2016-2-icon-pack](https://plugins.jetbrains.com/idea/plugin/7285-idea-2016-2-icon-pack)

这是 v3.1.1 的官方下载地址：[https://plugins.jetbrains.com/files/7285/31093/Idea11Icons.jar](https://plugins.jetbrains.com/files/7285/31093/Idea11Icons.jar)

这是 v3.1.1 的我备份的地址：[http://oirr30q6q.bkt.clouddn.com/jadyer/idea/Idea11Icons_v3.1.1.jar](http://oirr30q6q.bkt.clouddn.com/jadyer/idea/Idea11Icons_v3.1.1.jar)

安装的时候，选择 Install plugin from disk... 然后重启 idea 就会看到经典的橘黄色图标啦

## 快捷键

### 自定补全

Alt + 回車

### 合并develop分支到master

master分支上工程上右键---Git---Repository---Merge Changes---Branches to merge选择develop分支

合并完成后，若有冲突或替换的修改，idea会列出来，最后再Ctrl+Shift+K把合并后的代码push到master

### 查询某方法被其它地方调用

Ctrl+Alt+H

### 定位文件或直接定位某一行

Ctrl+N 或者 Ctrl+Shift+N 时输入文件名后，再跟上冒号和行号，即可，如`LoanHelper:22`

### 快速输入main函数

键入psvm再按Tab键，或者，键入main再按Ctrl+J键

### 快速输入System.out.println

键入sout再按Tab键（对应Eclipse中的syso）

### 快速生成普通for循环

键入fori再按Tab键或Ctrl+J键

### 快速生成普通for-each循环

键入iter再按Tab键或Ctrl+J键

另附两篇文章：[常用快捷键](http://wiki.jikexueyuan.com/project/intellij-idea-tutorial/keymap-introduce.html)　和　[缩进, Tab 还是空格?](http://ooxx.me/tabs-vs-spaces.orz)


## 首次运行前配置

### 向导功能

只有首次安装运行时，才会看见向导，提示导入配置文件、输入注册码、选择UItheme、配置plugin等

但若以前安装过且卸载过程中没有卸载干净，那么新安装的idea首次运行时就不会看见向导功能

一般想卸载干净的话，卸载后还可以用Everything以及注册表搜索：jetbrains、intellij、idea等关键字

如果这样还看不到向导，可能是下面步骤里创建了JadyerData后，又创建了config和system子目录

（其实config和system等子目录在idea启动时会自动创建的）

### idea.properties

`idea.config.path=D:/Develop/ideaIC/JadyerData/config`，配置idea个性化配置目录

`idea.system.path=D:/Develop/ideaIC/JadyerData/system`，配置idea系统文件目录

`idea.max.intellisense.filesize=2500`，编辑大文件时idea容易卡顿，可适当提高该属性值

`idea.cycle.buffer.size=disabled`，禁用控制台输出缓存，大项目开启很多输出时，控制台会很快刷满

导致不能自动输出后面的日志，这时可以禁用该值或增大`idea.cycle.buffer.size=1024`的配置

### idea64.exe需要JDK8

若当前安装的是JDK7，idea201611版在启动idea64.exe时会提示需要JDK8来运行它

安装JDK8之后，在我的电脑---右键---高级---系统变量---增加一个名为`IDEA_JDK_64`的系统变量

`IDEA_JDK_64=D:\Develop\Java\jdk1.8.0_77`，接着便可直接启动idea，不需要path增加IDEA_JDK_64

关于idea64.exe的更详细介绍见[http://www.iflym.com/index.php/code/201404190001.html](http://www.iflym.com/index.php/code/201404190001.html)

### idea64.exe.vmoptions

```
-server
-Xms1024m
-Xmx1024m
-XX:MaxPermSize=512m
-XX:ReservedCodeCacheSize=256m
-XX:+UseConcMarkSweepGC
-XX:+UseCodeCacheFlushing
-XX:SoftRefLRUPolicyMSPerMB=50
-ea
-Dsun.io.useCanonCaches=false
-Dsun.awt.keepWorkingSetOnMinimize=true
-Djava.net.preferIPv4Stack=true
-Djsse.enablesSNIExtension=false
-XX:+HeapDumpOnOutOfMemoryError
-XX:-OmitStackTraceInFastThrow

```

## 欢迎窗口的配置

### 设置JDK

File---Project Structure---Project Settings---Project---Project JDK

### 黑色主题及避免中文乱码

settings---Appearance & Behavior---Appearance---Theme---Darcula

并勾选 Override default fonts by，同时选择 Microsoft YaHei UI 字体

### 打开内存使用状态

settings---Appearance & Behavior---Appearance---Show memory indicator

### 隐藏工具栏快捷键下划线

settings---Appearance & Behavior---Appearance---Disable mnemonics in menu

### 启动时不打开工程

settings---Appearance & Behavior---System Settings---Reopen last project on startup

### 取消自动更新

settings---Appearance & Behavior---System Settings---Updates---Automatically check updates

### 修改代码提示快捷键

settings---keymap---搜索框输入basic（idea默认的是Ctrl+空格，和我们输入法冲突）---Ctrl+B

### 设置全屏模式快捷键

即工具类View菜单下面的Enter Full Screen

settings---keymap---搜索框输入full screen（搜索到的是Toggle Full Screen mode）---F11

### 修改文件关闭快捷键

settings---keymap---快捷键搜索Ctrl+F4（搜索到的是Window--Editor Tabs--Close）---Ctrl+W

### 修改类结构视图快捷键

settings---keymap---快捷键搜索Ctrl+7（搜索到的是Other--Structure）---Ctrl+O

### 设置Ctrl+E弹层的文件个数

settings---Editor---General---Limits---Recent files limit---默认为50个

### 自动移除UnuseImport

settings---Editor---General---Auto Import---Optimize imports...fly 以及 Add unambiguous...fly

未生效可检查settings---Editor---inspections---Java---Imports---Unused import(editor light)---勾选

注意：通过Ctrl+X的方式不会有效果，只有Ctrl+Y或全选后按键盘回退或Delete删除时才会有效果

### 显示行号

settings---Editor---General---Appearance---Show line numbers

### 取消面包屑导航

即打开HTML/XML文件时隐藏html/header/script等标签

settings---Editor---General---Appearance---取消勾选Show breadcrumbs

### 代码提示忽略大小写

settings---Editor---General---Code Completion---Case sensitive completion---None

### 设定折叠或展开的代码类型

settings---Editor---General---Code Folding---勾选表示该类型代码在文件被打开时默认是被折叠的

### 移除文件编辑Tab的`×`

settings---Editor---General---Editor Tabs---Show "close" button on editor tabs

### 移除文件编辑Tab的后缀

settings---Editor---General---Editor Tabs---Hide file extension in editor tabs

### 设置文件编辑Tab的最多数

当我们打开的文件数超过该设置时，最先打开的文件会被关闭

settings---Editor---General---Editor Tabs--Tab Closing Policy---Tab limit---默认为10个

### 星号标识编辑过的文件

settings---Editor---General---Editor Tabs--Mark modified tabs with asterisk

### 代码字体

在发布了Windows-Vista的时候，一款全新的中英文字体也跟着面世了：微软雅黑体

据说微软为了打造这个字体，做每个字的成本几乎达到100美元，也被戏称有史以来最昂贵的一套中文字体

而Consolas是一种专门为编程人员设计的字体，它特性是所有字母、数字与符号都很容易的辨认，且都具有相同的宽度，看着很舒服

所以`Yahei Consolas Hybrid`就出现了，它是上面两种字体的结合（程序员字体＋最昂贵的中文字体）

下载地址如下：（下面三个地址的文件的内容，都是一样的）

[http://oirr30q6q.bkt.clouddn.com/jadyer/idea/YaHei_Consolas_Hybrid.rar](http://oirr30q6q.bkt.clouddn.com/jadyer/idea/YaHei_Consolas_Hybrid.rar)

[http://download.csdn.net/detail/jadyer/9719438](http://download.csdn.net/detail/jadyer/9719438)

[http://www.intellij.org/downloads/YaHei.Consolas.1.12.zip](http://www.intellij.org/downloads/YaHei.Consolas.1.12.zip)

安装方法为：拷贝`ttf`文件到`C:\Windows\Fonts\`目录即可，然后就可以回到idea里面配置了

settings---Editor---Colors & Fonts---Schema---Darcula Save As Darcula_jadyer

然后子菜单Font---取消勾选Show only monospaced fonts---Primary font=Yahei Consolas Hybrid，Size=14

### 控制台字体

settings---Editor---Colors & Fonts---Console Font---设置方式同代码字体

### import每个类而非整个包

settings---Editor---Colors Style---Java---Imports---Class count to use import with '*'设置大一点

当Java类中import某个包下的类超过这里设置的个数，就会换成用`*`号来代替，比如`import java.util.*`

### 注释时双斜杠置为代码头部

settings---Editor---Colors Style---Java---Code Generation---取消勾选Line comment at first column

### 函数花括号显示为对称结构

settings---Editor---Colors Style---Java---Wrapping and Braces---Braces placement---三项均改为Next line

### 自定义文件代码模板

settings---Editor---File and Code Templates---Includes---File Header---修改如下

```
/**
 * Created by 玄玉<https://jadyer.github.io/> on ${DATE} ${TIME}.
 */
```

### 自定义方法上的注释
settings---Editor---Live Templates---右上角`+`选择`Template Group`---我输入的模板组名是**JadyerGroup**

然后点击`JadyerGroup`---右上角`+`加号选择`Live Template`---设置自定义的触发注释输出的字母

用到时间时可以用`$date$`或者`$time$`占位，并点击`Edit variables`按钮设置为`date()`和`time()`即可

最后别忘了最下方的`No applicable contexts. Define`处选择模板适用范围（截图中我勾选的是**Java**范围）

比如我下面设置的就是输入`c`，然后按`Tab`键，就会生成方法注释

![](/img/2016/2016-04-20-idea-config.png)

### 资源文件的中文显示

settings---Editor---File Encodings---IDE Encoding---UTF-8

settings---Editor---File Encodings---Project Encoding---UTF-8

settings---Editor---File Encodings---Default encoding for properties files---UTF-8

settings---Editor---File Encodings---Transparent native-to-ascii conversion

### 隐藏文件和文件夹

settings---Editor---File Types---Ignore files and folders---`target;*.iml;*.idea;`

### 版本控制下文件变化的显示

settings---Version Control---Show directories with changed descendants

开启后若想调整文件夹的显示颜色：settings---Editor---Colors & Fonts---File Status

### 设置git.exe（可选）

settings---Version Control---Git---Path to Git executable---D:\Develop\Git\bin\git.exe

### Maven自动刷新

settings---Build,Execution,Deployment---Build Tools---Maven---Importing---Import Maven projects automatically

### Maven自动导入源码

settings---Build,Execution,Deployment---Build Tools---Maven---Importing---Automatically download---勾选Sources

### 自动编译

settings---Build,Execution,Deployment---Compiler---Build project automatically

### 手工编译

相较于eclipse的自动实时编译，idea更灵活些，虽然它也支持自动实时编译，但比较占资源

idea共有三种手工编译方式：Compile、Rebuild、Make（可点击菜单栏Build看到）

* Compile

    > 对选定的目标（Java 类文件），进行强制性编译，不管目标是否是被修改过

* Rebuild

    > 对选定的目标（Project），进行强制性编译，不管目标是否是被修改过<br>
由于Rebuild的目标只有Project，所以Rebuild每次花的时间会比较长

* Make

    > 使用最多的编译操作。对选定的目标（Project 或 Module）进行编译，但只编译有修改过的文件<br>
没有修改过的不会编译，这样开发大项目才不会浪费时间在编译过程中

### 编译报错

* 报告：OutOfMemoryError

    > 将其默认的700MB增大（64位用户在内存足够的情况下，建议改为1500或以上）<br/>
settings---Build,Execution,Deployment---Compiler---Build process heap size(Mbytes)

* 报告：找不到符号、未结束的字符串文字

    > 1、UTF-8文件分有BOM和无BOM，idea默认使用的编译器是javac，而其只能编译无BOM的文件<br/>
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

这时就需要清除缓存和索引，清除之后下次启动idea时就会重建

点击`File-->Invalidate Caches / Restart`,此时会弹出一个提示框，内容如下

```
The caches will be invalidated and rebuilt on the next startup.
WARNING: Local History will be also cleared.
Would you like to continue?
```

一般建议点击`Invalidate and Restart`，这样会清除的比较干净

**注意**：若项目未加入版本控制，而你又需要项目文件的历史更改记录，那么你最好备份下`LocalHistory`目录

`LocalHistory=C:\Users\Jadyer\.IntelliJIdea2016.1\system\LocalHistory`

即`idea.properties`文件中的`${idea.system.path}\LocalHistory\`目录

### Project视图折叠空包显示

Project视图---右上角倒数第二个齿轮图标---Hide Empty Middle Packeages

### 省电模式

File---Power Save Mode---此时会关掉代码检查、代码提示等功能，适合读代码，所以也称为阅读模式

### 关闭警告

#### DefaultFileTemplate

settings---Editor---Inspections---General---取消勾选Default File Template Usage

#### neverused

settings---Editor---Inspections---Java---Declaration redundancy---取消勾选Unused declaration

#### @see@create@author

settings---Editor---Inspections---Java---Javadoc issues---

取消勾选Declaration has Javadoc problems（适用@create@author）

取消勾选Declaration has problems in Javadoc references（适用@see）

#### 拼写检查

settings---Editor---Inspections---Spelling---取消勾选

#### 方法和类同名

settings---Editor---Inspections---Java---Naming conventions---取消勾选Method name same as class name

#### 未处理方法返回值

比如`java.io.File.delete()`

settings---Editor---Inspections---Java---Probable bugs---取消勾选Result of method call ignored

#### String代替StringBuilder

settings---Editor---Inspections---Java---Performance issues---取消勾选StringBuffer can be replaced with String

#### 未生成serialVersionUID

settings---Editor---Inspections---Java---Serialization issues---勾选Serializable class without 'serialVersionUID'

然后回到我们的类文件中，将光标放到类名上，再按Alt+Enter就会提示生成serialVersionUID

#### properties的属性未使用

settings---Editor---Inspections---Properties Files---Unused Property---取消勾选

#### spring的一些警告

关闭Can not resolve configuration property 'jasypt.file.****'的警告

settings---Editor---Inspections---Spring---Spring Boot---取消勾选Spring Boot application.yml

关闭Application context not configured for this file的警告

settings---Editor---Inspections---Spring---Spring Core---Setup---取消勾选Spring Facet Code Configuration

## 注册码

idea15及以上版本注册：[http://idea.lanyus.com/](http://idea.lanyus.com/)，idea14注册码如下

```java
import java.math.BigInteger;
import java.util.Date;
import java.util.Random;
import java.util.Scanner;
import java.util.zip.CRC32;

public class KeyGen {
    public static short getCRC(String s, int i, byte bytes[]) {
        CRC32 crc32 = new CRC32();
        if (s != null) {
            for (int j = 0; j < s.length(); j++) {
                char c = s.charAt(j);
                crc32.update(c);
            }
        }
        crc32.update(i);
        crc32.update(i >> 8);
        crc32.update(i >> 16);
        crc32.update(i >> 24);
        for (int k = 0; k < bytes.length - 2; k++) {
            byte byte0 = bytes[k];
            crc32.update(byte0);
        }
        return (short) (int) crc32.getValue();
    }

    public static String encodeGroups(BigInteger biginteger) {
        BigInteger beginner1 = BigInteger.valueOf(0x39aa400L);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; biginteger.compareTo(BigInteger.ZERO) != 0; i++) {
            int j = biginteger.mod(beginner1).intValue();
            String s1 = encodeGroup(j);
            if (i > 0) {
                sb.append("-");
            }
            sb.append(s1);
            biginteger = biginteger.divide(beginner1);
        }
        return sb.toString();
    }

    public static String encodeGroup(int i) {
        StringBuilder sb = new StringBuilder();
        for (int j = 0; j < 5; j++) {
            int k = i % 36;
            char c;
            if (k < 10) {
                c = (char) (48 + k);
            } else {
                c = (char) ((65 + k) - 10);
            }
            sb.append(c);
            i /= 36;
        }
        return sb.toString();
    }

    public static String MakeKey(String name, int days, int id) {
        id %= 100000;
        byte bkey[] = new byte[12];
        bkey[0] = (byte) 1; // Product type: IntelliJ IDEA is 1
        bkey[1] = 14; // version
        Date d = new Date();
        long ld = (d.getTime() >> 16);
        bkey[2] = (byte) (ld & 255);
        bkey[3] = (byte) ((ld >> 8) & 255);
        bkey[4] = (byte) ((ld >> 16) & 255);
        bkey[5] = (byte) ((ld >> 24) & 255);
        days &= 0xffff;
        bkey[6] = (byte) (days & 255);
        bkey[7] = (byte) ((days >> 8) & 255);
        bkey[8] = 105;
        bkey[9] = -59;
        bkey[10] = 0;
        bkey[11] = 0;
        int w = getCRC(name, id % 100000, bkey);
        bkey[10] = (byte) (w & 255);
        bkey[11] = (byte) ((w >> 8) & 255);
        BigInteger pow = new BigInteger("89126272330128007543578052027888001981", 10);
        BigInteger mod = new BigInteger("86f71688cdd2612ca117d1f54bdae029", 16);
        BigInteger k0 = new BigInteger(bkey);
        BigInteger k1 = k0.modPow(pow, mod);
        String s0 = Integer.toString(id);
        String sz = "0";
        while (s0.length() != 5) {
            s0 = sz.concat(s0);
        }
        s0 = s0.concat("-");
        String s1 = encodeGroups(k1);
        s0 = s0.concat(s1);
        return s0;
    }

    public static void main(String[] args) {
        System.out.println("Please input your name : ");
        Scanner scanner = new Scanner(System.in);
        String username = scanner.next();
        Random r = new Random();
        System.out.println(MakeKey(username, 0, r.nextInt(100000)));
    }
}
```