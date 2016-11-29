---
layout: post
title: "Eclipse配置小结"
categories: 工具
tags: eclipse myeclipse
author: 玄玉
excerpt: 介绍Eclipse或MyEclipse中的一些常用和好用的配置。
---

* content
{:toc}


## 启动时选择工作空间

启动MyEclipse6.5时，默认会弹出`Select a workspace`对话框

如果我们勾选了`Use this as the default and do not ask again`，下次启动时就不会再弹该对话框了

这时可以修改下面的配置文件，让它启动时弹出来

`D:/Program Files/MyEclipse 6.5/eclipse/configuration/.settings/org.eclipse.ui.ide.prefs`

将第`4`行`SHOW_WORKSPACE_SELECTION_DIALOG`的值由`false`修改为`true`即可

而第`6`行`RECENT_WORKSPACES`是用来设置MyEclipse最近所用到的工作空间的，无需理会

## 移除未使用的类引用

有三种方法，其中第三种是最方便的

* 1、移除某个类中的：在Java类中按键`Ctrl+Shift+O`

* 2、移除整个包中的：`Package Explorer`下右键点击包名，依次选择`Source-->Organize imports`即可

* 3、保存时自动移除：`Windows-->Preferences-->Java-->Editor-->Save Actions`

　　　　　　　　　　　　然后选择`Perform the selected action on save`，再勾选`Organize imports`即可

## 代码格式化时防止换行

```
//Java代码
Window-->preferences-->Java-->Code Style-->Formatter-->Edit-->Line Wrapping-->Maximum line width-->调大点
//HTML代码
Window-->preferences-->MyEclipse Enterprise Workbench-->File and Editors-->HTML-->HTML Source-->Line width-->调大点
//XML代码
Window-->preferences-->MyEclipse Enterprise Workbench-->File and Editors-->XML-->XML Source-->Line width-->调大点
```

## 注释模板日期为中文格式

相信大部分人都用过Eclipse/MyEclipse中的`Code Templates`功能，配置地址如下

`Windows-->Preferences-->Java-->Code Style-->Code Templates-->Comments`

一般我只会配置两个地方：一个是`Types(用于注释在类名上)`，一个是`Methods(用于注释方法上)`

配置内容都是下面这样

```
/**
 * @create ${date} ${time}
 * @author 玄玉<https://jadyer.github.io/>
 */
```

那么问题来了：上面注释中，时间是英文格式，看着很不舒服

想换成中文格式的话，有两个法子

> 第一种是：修改eclipse配置文件`D:\Develop\MyEclipse\eclipse\eclipse.ini`<br>
将其中的`-Duser.language=en`修改为`-Duser.language=zh-cn`（有则修改，无则添加）

> 第二种是：修改eclipse的插件jar（这个法子虽说麻烦点，但比第一种灵活）<br>
`D:\Develop\MyEclipse\eclipse\plugins\org.eclipse.text_3.3.0.v20070606-0010.jar`<br>
也就是`org.eclipse.text_xxxx.jar`（有的eclipse中该jar后面的版本或日期不同）<br>
修改里面的`org.eclipse.jface.text.templates.GlobalTemplateVariables.java`，找到如下代码

```java
public static class Date extends SimpleTemplateVariableResolver {
    public Date() {
        super(TextTemplateMessages.getString("GlobalVariables.variable.description.date"));
    }
    protected String resolve(TemplateContext context) {
        return DateFormat.getDateInstance().format(new Date());
    }
}
//修改成如下内容
public static class Date extends SimpleTemplateVariableResolver {
    public Date() {
        super(TextTemplateMessages.getString("GlobalVariables.variable.description.date"));
    }
    protected String resolve(TemplateContext context) {
        //return DateFormat.getDateInstance().format(new Date());
        return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date());
    }
}
```

## SVN插件中英文互相转换

修改`D:\Develop\eclipse\configuration\config.ini`文件，在其尾部添加如下属性即可

```ruby
## Set Subversion English Version
#osgi.nl=en_US
# Set Subversion Chinese Version
osgi.nl=zh_CN
```

## SVN插件提示nosvnjavahl

这里主要指的是：`EclipseJEE`安装SVN插件后提示`Failed to load JavaHL Library`

报错信息，见下方截图

![](/img/2010-09-05/eclipse-config-01.png)

![](/img/2010-09-05/eclipse-config-02.png)

所使用相关工具和环境，以及解决方法，如下所示

```
操作系统：Windows7-64bit-专业版
Java版本：jdk-6u45-windows-x64
SVN插件版本：site-1.6.17
Eclipse版本：eclipse-jee-indigo-SR2-win32-x86_64
解决方法为：Window-->Preferences-->Team-->SVN-->SVN interface-->修改默认的JavaHL为SVNKit即可
```

## easyexplore和OpenExplorer

`Eclipse_Luna`版中安装`org.sf.easyexplore_1.0.4.jar`后，会发现它不支持easyexplore了

这时有两个解决办法

一个是采用Eclipse_Luna自带的功能：`工程-->包或文件上右键-->Show In-->System Explorer即可`

另一个是使用`OpenExplorer`：下载地址为[https://github.com/samsonw/OpenExplorer/downloads](https://github.com/samsonw/OpenExplorer/downloads)

下载后得到`OpenExplorer_1.5.0.v201108051513.jar`，将其拷贝至`//eclipse//dropins//`目录下即可

重新启动Eclipse，会发现工具栏上面有一个类似公文包的图标，就是它了

## 内嵌Jetty报告OutOfMemoryError

`Jetty启动类-->Run AS-->Open Run Dialog-->Arguments-->VM arguments`

输入如下参数即可解决

`-server -Xms512m -Xmx1024m -XX:PermSize=512m -XX:MaxPermSize=512m -XX:+CMSClassUnloadingEnabled -XX:+PrintGCDetails`

## TCPIPMonitor的用法

这是Eclipse或MyEclipse提供的一个类似于`TcpMon`的小工具，很好用

关于TcpMon，目前有两款同名的工具，一个是`Apache`的，一个是`GoogleCode`上的

Apache的地址是[http://ws.apache.org/tcpmon/](http://ws.apache.org/tcpmon/)

GoogleCode地址是[https://code.google.com/p/tcpmon/](https://code.google.com/p/tcpmon/)

GoogleCode上的tcpmon是较新版本的

该工具较老版本的项目页面是[https://java.net/projects/tcpmon](https://java.net/projects/tcpmon)

对应的SVN地址为[https://svn.java.net/svn/tcpmon~svn](https://svn.java.net/svn/tcpmon~svn)

**好了，言归正传**

#### 打开TCP/IP Monitor视图

`MyEclipse-->Window-->Show View-->Other-->MyEclipse Common-->TCP/IP Monitor-->OK`

#### 配置TCP/IP Monitor监听

TCP/IP Monitor视图——>右上角下拉三角——>Properties——>Add——>添加的属性说明如下所示

| 属性类别 | 属性说明 |
|:------------------------|:--------------------------------------------------------------- |
| **LocalMonitoringPort** | 本地监听的端口号，访问Web服务时直接访问该端口即可，它会转发请求到服务端 |
| **HostName**            | 服务端的主机地址                                                  |
| **Port**                | 服务端提供服务的端口                                               |
| **Type**                | 这里选择TCP/IP，若选择HTTP，则只能看到HTTP交互的报文体而看不到报文头了 |

#### 启动TCP/IP Monitor监听

我们在访问服务时，请求地址应该是`127.0.0.1 + Local monitoring port`(可以用浏览器或其它工具类)

本机`Local monitoring port`收到请求后会将请求转发至`Host name + Port`，应答过程则与之相反

相当于Struts2中的`Interceptor`，等于说我们自己加了一个过滤器，说白了它的原理和`TcpMon`一样