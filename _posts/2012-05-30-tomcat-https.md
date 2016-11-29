---
layout: post
title: "Tomcat配置HTTPS"
categories: Tomcat
tags: Tomcat https
author: 玄玉
excerpt: 介绍了通过keytool生成证书，并分别导入Tomcat、JVM、浏览器的方法。
---

* content
{:toc}


也可以申请免费的CA证书：`StartSSL`

它是StartCom公司的，也是一家CA机构，它的根证书很久之前就被一些具有开源背景的浏览器所支持

申请地址：[http://www.startssl.com](http://www.startssl.com)

参考教程：[http://www.linuxidc.com/Linux/2011-11/47478.htm](http://www.linuxidc.com/Linux/2011-11/47478.htm)

下面演示是通过keytool本地生成证书的过程

## 生成KeyStore

```sh
# -genkey   表示生成密钥
# -alias    指定别名，这里是JadyerKeyStore
# -keyalg   指定算法，这里是RSA
# -validity 指定证书有效期，这里是1024天
# -keystore 指定生成的KeyStore文件名和路径，这里是D:/keys/JadyerKey
D:\>keytool -genkey -alias JadyerKeyStore -keyalg RSA -validity 1024 -keystore D:/keys/JadyerKey
输入密钥库口令:  222222（'以前叫做输入keystore密码'）
再次输入新密码:  222222
您的名字与姓氏是什么？
  [Unknown]:  sso.jadyer.com（'根据实际情况填写服务器域名，否则会导致证书上的名称无效'）
您的组织单位名称是什么？
  [Unknown]:  https://jadyer.github.io/
您的组织名称是什么？
  [Unknown]:  banbuduo
您所在的城市或区域名称是什么?
  [Unknown]:  重庆
您所在的省/市/自治区名称是什么?
  [Unknown]:  江北区
该单位的双字母国家/地区代码是什么?
  [Unknown]:  ZH
CN=sso.jadyer.com, OU=https://jadyer.github.io/, O=banbuduo, L=重庆, ST=江北区,C=ZH是否正确?
  [否]:  y

输入 <JadyerKeyStore> 的密钥口令
        (如果和密钥库口令相同, 按回车):
```

最后一步按回车键，即可直接生成`D:/keys/JadyerKey`文件

不过要注意以下两点：

> 1、如果`-keystore`参数的目录不存在，按回车键之后会看到下面的提示<br>
　　`keytool 错误: java.io.FileNotFoundException: D:\keys\JadyerKey (系统找不到指定的路径。)`<br>
2、如果最后一步主密码与keystore密码不同，那么在证书导入Tomcat，在启动Tomcat时就会报告下面的提示<br>
　　`java.io.IOException: Cannot recover key`

## 导出证书

其中`-alias`参数用来指定生成KeyStore时用的别名

否则会提示：`keytool 错误: java.lang.Exception: 别名 <mykey> 不存在`

```sh
#密钥库口令应该输入生成KeyStore时设置的口令
D:\>keytool -export -file D:/keys/Jadyer.crt -alias JadyerKeyStore -keystore D:/keys/JadyerKey
输入密钥库口令:  222222
存储在文件 <D:/keys/Jadyer.crt> 中的证书
```

## 导入证书到浏览器

浏览器访问HTTPS页面时，可能会询问用户：`这是一个未知SSL的请求，是否继续`

如果把CRT证书导入到浏览器，用户就不会看到这个询问页面了，操作步骤如下

`双击Jadyer.crt-->安装证书-->下一步-->将所有的证书放入下列存储-->浏览-->受信任的根证书颁发机构-->下一步-->完成`

这时会弹出对话框：`您即将从一个声称代表如下的证书颁发机构安装证书:sso.jadyer.com......确认安装此证书吗?`

确认后即可导入成功

## 导入证书到JVM

输入密钥口令若提示：`keytool 错误: java.io.IOException: Keystore was tampered with, or password was incorrect`

那就换个密码，输入`changeit`就行了，这是Java的默认保护密码

```sh
D:\>keytool -import -keystore D:\Develop\Java\jdk1.7.0_80\jre\lib\security\cacerts -file D:/keys/Jadyer.crt -alias JadyerKeyStore
输入密钥库口令:  222222
所有者: CN=sso.jadyer.com, OU=https://jadyer.github.io/, O=banbuduo, L=重庆, ST=江北区, C=ZH
发布者: CN=sso.jadyer.com, OU=https://jadyer.github.io/, O=banbuduo, L=重庆, ST=江北区, C=ZH
序列号: 1e3e16df
有效期开始日期: Tue Nov 29 18:34:18 CST 2016, 截止日期: Thu Sep 19 18:34:18 CST 2019
证书指纹:
         MD5: D7:60:77:F0:6C:96:DB:AB:DA:BB:F6:A3:DD:AF:31:34
         SHA1: A6:7E:20:DF:FF:F4:D8:3A:DC:03:D2:BD:7C:41:D5:F3:54:D8:5A:3E
         SHA256: FD:45:CA:5A:9A:1F:04:A6:7F:DE:AB:71:34:8C:4F:02:AF:0C:F0:9B:3E:15:B0:B5:A9:B5:C0:ED:F0:E6:05:ED
         签名算法名称: SHA256withRSA
         版本: 3

扩展:

#1: ObjectId: 2.5.29.14 Criticality=false
SubjectKeyIdentifier [
KeyIdentifier [
0000: 72 4C 89 3B 56 9A 00 EC   2A 8E EE 30 D5 0F D1 B6  rL.;V...*..0....
0010: EC 56 CB C7                                        .V..
]
]

是否信任此证书? [否]:  y
证书已添加到密钥库中
```

## 应用证书到Tomcat

将文件`D:/keys/JadyerKey`拷贝到`\\%TOMCAT_HOME%\\conf\\`目录中（其它目录也可以）

然后修改`\\%TOMCAT_HOME%\\conf\\server.xml`

```xml
<Connector port="8443" protocol="HTTP/1.1" SSLEnabled="true"
            maxThreads="150" scheme="https" secure="true"
            clientAuth="false" sslProtocol="TLS" URIEncoding="UTF-8"
            keystoreFile="conf/JadyerKey" keystorePass="222222"/>
```

接下来浏览器访问`https://127.0.0.1:8443/blog`会发现应用已经处于SSL安全通道中了

但是，这个时候如果访问`http://127.0.0.1:8080/blog`会发现竟然也能访问

也就是说：我们虽然启用了HTTPS，但现在还可以绕开HTTPS直接HTTP访问，这样一来HTTPS也就起不到作用了

解决办法就是修改`\\%TOMCAT_HOME%\\conf\\web.xml`

在其尾部`<welcome-file-list>`标签后面，加入以下配置即可

```xml
<web-app xmlns="http://xmlns.jcp.org.....version=3.1">
    ......
    ......
    <welcome-file-list>
        <welcome-file>index.html</welcome-file>
        <welcome-file>index.htm</welcome-file>
        <welcome-file>index.jsp</welcome-file>
    </welcome-file-list>
    <security-constraint>
        <!-- Authorization setting for SSL -->
        <web-resource-collection>
            <web-resource-name>SSL_App</web-resource-name>
            <!-- 指明需要SSL的url -->
            <url-pattern>/*</url-pattern>
            <http-method>GET</http-method>
            <http-method>POST</http-method>
        </web-resource-collection>
        <user-data-constraint>
            <!-- 指明需要SSL -->
            <transport-guarantee>CONFIDENTIAL</transport-guarantee>
        </user-data-constraint>
    </security-constraint>
</web-app>
```