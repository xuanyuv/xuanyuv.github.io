---
layout: post
title: "Solr系列第01节之整合Tomcat"
categories: Lucene
tags: Lucene
author: 玄玉
excerpt: 介绍Solr-3.6.2整合Tomcat的细节。
---

* content
{:toc}


除非特别说明，本系列采用的都是 **Solr-3.6.2**

Solr官网：[http://lucene.apache.org/solr/](http://lucene.apache.org/solr/)

Solr下载：[http://archive.apache.org/dist/lucene/solr/](http://archive.apache.org/dist/lucene/solr/)

Solr文档：[http://wiki.apache.org/solr/](http://wiki.apache.org/solr/)

　　　　　[http://wiki.apache.org/solr/SolrInstall](http://wiki.apache.org/solr/SolrInstall)

　　　　　[http://wiki.apache.org/solr/Solrj](http://wiki.apache.org/solr/Solrj)

　　　　　[http://wiki.apache.org/solr/SolrCloud](http://wiki.apache.org/solr/SolrCloud)

　　　　　[http://wiki.apache.org/solr/SolrCloud%20using%20Jboss](http://wiki.apache.org/solr/SolrCloud%20using%20Jboss)

## 简介

Solr是一个高性能的，采用Java开发的，基于HTTP和Lucene实现的开源企业级全文搜索引擎

可以粗暴的理解为：Lucene专注于搜索底层实现及算法优化，Solr专注于高层次的为企业服务的易于使用和管理的搜索服务器

再粗暴一点理解为：Lucene和Solr的关系类似于，Ajax和jQuery，Servlet和Struts2，JAX-WS和CXF，NIO和Mina的关系

而 SolrJ 是 Solr 提供的基于 Java 的访问 Solr 服务器的接口，它提供了对Solr服务器进行索引的CRUD和优化的相关接口

## 启动

解压下载到的apache-solr-3.6.2.zip中的example文件夹到本地硬盘

然后命令行执行`java -jar start.jar`便启动了Solr服务器，访问地址为：[http://127.0.0.1:8983/solr/](http://127.0.0.1:8983/solr/)

## 整合Tomcat

1、本地硬盘新建D:\Develop\apache-solr-3.6.2\文件夹

2、再新建D:\Develop\apache-solr-3.6.2\home\文件夹

3、将下载的apache-solr-3.6.2.zip\example\solr\里面的内容拷贝到上一步新建的home文件夹中

4、清空D:\Develop\apache-solr-3.6.2\home\data\文件夹里的内容

5、再新建D:\Develop\apache-solr-3.6.2\server\文件夹

6、将下载到的apache-solr-3.6.2.zip\example\webapps\solr.war中的内容解压到上一步新建的server文件夹中

7、编辑D:\Develop\apache-solr-3.6.2\home\conf\solrconfig.xml的第`114`行为下面的值

　　`<dataDir>${solr.data.dir:D:\Develop\apache-solr-3.6.2\home\data}</dataDir>`

　　其实这一步也可以把data目录放到环境变量中，然后使用`${environmentVariable}`就引用到了

8、编辑D:\Develop\apache-tomcat-6.0.36\conf\server.xml的第`144`行即`<Hots>`标签中为下面的值

　　`<Context path="/solr" docBase="D:\Develop\apache-solr-3.6.2\server\solr" reloadable="false"/>`

9、为`<Context/>`设置相应的环境变量，指明Solr的主目录的地址，修改好后是这样的

```xml
<Context path="/solr" docBase="D:\Develop\apache-solr-3.6.2\server\solr" reloadable="false">
    <Environment name="solr/home" type="java.lang.String" value="D:\Develop\apache-solr-3.6.2\home" override="true"/>
</Context>
```

最后启动Tomcat，然后访问[http://127.0.0.1:8088/solr/](http://127.0.0.1:8088/solr/)即可

注意：对于`apache-solr-3.5.0.zip`而言，最后在启动Tomcat时可能会报告下面的异常

```
严重: org.apache.solr.common.SolrException: Error loading class 'solr.VelocityResponseWriter'
Caused by: java.lang.ClassNotFoundException: solr.VelocityResponseWriter
```

这时就要修改D:\Develop\apache-solr-3.5.0\home\conf\solrconfig.xml文件的第1554行（对于solr-3.6.2而言就是第1573行）

```xml
<queryResponseWriter name="velocity" class="solr.VelocityResponseWriter" enable="${solr.velocity.enable:false}"/>
```

若取消了（即置为false）VelocityResponseWriter输出格式后，重启Tomcat仍报此异常，那直接把这行代码注释掉应该就可以了

## schema

这里介绍一下`D:\Develop\apache-solr-3.6.2\home\conf\schema.xml`

1、这个文件中定义了大量的域，而且每个域都指定了fieldType，fieldType中定义了每个域使用的分词器

2、我们可以直接用solr定义好的域，也可以自定义域，并且solr提供的大量域中第一个域是`id`域，它的required是true，即必须的

　　我们可以直接用它的id域，也可以自定义id域，但只能有一个域`required="true"`

3、并且程序中使用的域名都要在schema.xml中指定好，否则会报告下面的异常

　　org.apache.solr.common.SolrException: ERROR: [doc=1] unknown field 'content'

4、该文件的第`1026`行可以配置默认的搜索域`<defaultSearchField/>`

　　这个指的就是[http://127.0.0.1:8088/solr/admin/](http://127.0.0.1:8088/solr/admin/)界面中的`Query String`