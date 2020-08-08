---
layout: post
title: "Solr系列第02节之搜索和中文分词"
categories: Lucene
tags: Lucene
author: 玄玉
excerpt: 介绍Solr-3.6.2操作索引、搜索文档、以及整合中文分词。
---

* content
{:toc}


## 整合中文分词

Solr定义的大量域默认都不支持中文分词，若要增加中文分词的支持，那么首先要加的就是`<types><fieldType/></types>`

下面以`MMSeg4j-1.8.5`为例，描述Solr整合中文分词器的细节（其核心就是在schema.xml中配置fieldType）

关于MMSeg4j的介绍，详见[https://jadyer.cn/2013/08/18/lucene-chinese-analyzer/](https://jadyer.cn/2013/08/18/lucene-chinese-analyzer/)

1、拷贝mmseg4j-all-1.8.5.jar到D:\Develop\apache-solr-3.6.2\server\solr\WEB-INF\lib\文件夹中

2、新建D:\Develop\apache-solr-3.6.2\home\dic\文件夹

3、拷贝mmseg4j-1.8.5.zip\data\文件夹中的词典文件到D:\Develop\apache-solr-3.6.2\home\dic\

4、schame.xml中添加中文分词的fieldType定义

　　通常中文分词的工具包中都会提供README.txt，里面会描述扩展solr时需要配置的fieldType

　　同理将mmseg4j-1.8.5.zip中的README.txt打开，拷贝里面描述的三个fieldType到schema.xml中第68行

5、确认并修改这三个fileType中的dicPath属性值为：dic（指的就是第二步新建的dic文件夹）

6、最后测试一下中文分词效果

Solr控制台上[http://127.0.0.1:8088/solr/admin/](http://127.0.0.1:8088/solr/admin/)点击蓝色粗体的**[ANALYSIS]**

然后在`Field Analysis`下面将Field下拉框修改为type，并在右面文本框输入text_general（即schema.xml中定义的fieldType）

接着在`Field Value(Index)`右面的文本框中输入测试文本：我来自中国黑龙江省哈尔滨市巴彦县兴隆镇

再点击下方的`Analyze`按钮，我们就会发现text_general的分词情况了

然后我们再修改text_general为刚才自定义的textComplex，就看到效果啦

另外也可以勾选`Field Value(Index)`下面的`verbose output`选框

这样也会将分词的各个属性（position、Offset、type等等）一并显示

## 示例代码

本例中合计用到9个jar，如下所示

* apache-solr-core-3.6.2.jar
* apache-solr-solrj-3.6.2.jar
* commons-codec-1.6.jar
* commons-io-2.1.jar
* httpclient-4.1.3.jar
* httpcore-4.1.4.jar
* httpmime-4.1.3.jar
* jcl-over-slf4j-1.6.1.jar
* slf4j-api-1.6.1.jar

```java
package com.jadyer.solrj;
import java.util.ArrayList;
import java.util.List;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrServer;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.SolrInputDocument;
import com.jadyer.model.MyMessage;

/**
 * Solr系列第02节之搜索和中文分词
 * Created by 玄玉<https://jadyer.cn/> on 2013/08/20 14:12.
 */
public enum HelloSolrJ {
    INSTANCE;

    private SolrServer server;

    private HelloSolrJ(){
        //创建SolrServer对象，它有两个线程安全的子类EmbeddedSolrServer和CommonsHttpSolrServer
        //EmbeddedSolrServer-----内嵌式的，不需要启动Web服务器
        //CommonsHttpSolrServer--需要启动Web服务器，它是通过HTTP请求来获取数据的
        //CommonsHttpSolrServer已不推荐直接使用了，而是推荐使用HttpSolrServer类
        //同样的StreamingUpdateSolrServer也不推荐使用了，推荐使用ConcurrentUpdateSolrServer
        server = new HttpSolrServer("http://127.0.0.1:8088/solr");
    }

    /**
     * 删除全部索引
     */
    public void deleteAllIndex(){
        try {
            //删除所有的索引，删除完记得commit才能生效
            server.deleteByQuery("*:*");
            server.commit();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 添加索引
     * ----------------------------------------------------------------------
     * 这里之所以没有硬编码指定my_title和my_content的中文分词器
     * 是由于schema.xml中在定义这俩<field>时已通过type属性指定了中文分词器
     * ----------------------------------------------------------------------
     */
    public void addIndex(){
        List<SolrInputDocument> docs = new ArrayList<SolrInputDocument>();
        for(int i=1; i<4; i++){
            SolrInputDocument doc = new SolrInputDocument();
            //对于Solr而言，默认的id是唯一的主键（如果我们没有自定义主键的话），当多次添加的时候，最后添加的相同id的域会覆盖已有的
            doc.addField("id", Integer.toString(i));
            //这里使用的是自定义的Field，所以就需要在schema.xml中为其添加<field>描述，并通过type属性指定其使用的分词器
            doc.addField("my_title", "这是我的第" + i + "个SolrJ程序");
            doc.addField("my_content", "my第" + i + "个SolrJ程序的运行情况");
            docs.add(doc);
        }
        try {
            //可以只添加一个Document，也可以一次添加多个Document，这里添加多个
            server.add(docs);
            //commit后方能生效，否则搜索到的还是add前的索引信息
            server.commit();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 使用JavaBean来添加索引
     */
    public void addIndexByBean(){
        List<MyMessage> msgs = new ArrayList<MyMessage>();
        //由于MyMessage()的第三个参数允许传入多个值，此时就要在schema.xml中配置<field my_content multiValued="true"/>支持多值域
        //并且在MyMessage.java中要使用@Field注解标注，可以标注在属性或setter方法上，并通过注解的默认值来指定所要存储的Field的名字
        msgs.add(new MyMessage("4", "这是第4个SolrJ", new String[]{"第4个SolrJ程序诞生中国", "它是通过SolrJ OF JavaBean4添加"}));
        msgs.add(new MyMessage("5", "这是第5个SolrJ", new String[]{"第5个SolrJ程序诞生哈尔滨", "它是通过SolrJ OF JavaBean5添加"}));
        try {
            server.addBeans(msgs);
            server.commit();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 搜索文档
     */
    public void searchFile(){
        //设置查询字符串
        SolrQuery query = new SolrQuery("my_content:诞生");
        //设置了setStart和setRows就可以实现分页效果了
        query.setStart(0);
        query.setRows(3);
        QueryResponse resp = null;
        try {
            resp = server.query(query);
        } catch (SolrServerException e) {
            e.printStackTrace();
        }
        //搜索出来的结果都保存在SolrDocumentList中
        SolrDocumentList sdl = resp.getResults();
        //这里获取到的是搜索到的总数量，与query.setRows(3)无关
        System.out.println("本次搜索到[" + sdl.getNumFound() + "]条数据");
        for(SolrDocument sd : sdl){
            //System.out.println(sd)会输出下面的
            //SolrDocument[{id=4, my_title=这是第4个SolrJ, my_content=[第4个...中国, 它是...添加]}]
            System.out.println("my_title=" + sd.getFieldValue("my_title") + " my_content=" + sd.getFieldValue("my_content"));
        }
    }

    /**
     * 使用JavaBean接收文档搜索结果
     */
    public void searchFileByBean(){
        SolrQuery query = new SolrQuery("id:*");
        query.setStart(0);
        query.setRows(3);
        QueryResponse resp = null;
        try {
            resp = server.query(query);
        } catch (SolrServerException e) {
            e.printStackTrace();
        }
        List<MyMessage> list = resp.getBeans(MyMessage.class);
        //这里获取到的不是搜索到的总数量，而是与query.setRows(3)有关的值
        //若实际的SolrQuery("id:*")能搜索到5条，则这里得到的就是3，若实际能搜索到的是2条，则这里得到的就是2条
        System.out.println("本次搜索到[" + list.size() + "]条数据");
        for(MyMessage msg : list) {
            System.out.println(msg.getTitle() + "         " + msg.getContent()[0]);
        }
    }
}
```

下面是用到的实体类`MyMessage.java`

```java
package com.jadyer.model;
import org.apache.solr.client.solrj.beans.Field;

public class MyMessage {
    @Field
    private String id;
    @Field("my_title")
    private String title;
    @Field("my_content")
    private String[] content;

    /*-- 三个属性的setter和getter略 --*/

    public MyMessage() {}

    public MyMessage(String id, String title, String[] content) {
        this.id = id;
        this.title = title;
        this.content = content;
    }
}
```

最后是`JUnit4.x`写的一个小测试`HelloSolrJTest.java`

```java
package com.jadyer.test;
import org.junit.Test;
import com.jadyer.solrj.HelloSolrJ;

public class HelloSolrJTest {
    @Test
    public void deleteAllIndex(){
        HelloSolrJ.INSTANCE.deleteAllIndex();
    }

    @Test
    public void addIndexAndSearchFile(){
        HelloSolrJ.INSTANCE.addIndex();
        HelloSolrJ.INSTANCE.searchFile();
    }

    @Test
    public void addIndexAndSearchFileByBean(){
        HelloSolrJ.INSTANCE.addIndexByBean();
        HelloSolrJ.INSTANCE.searchFileByBean();
    }
}
```