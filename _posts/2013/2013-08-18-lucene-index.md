---
layout: post
title: "Lucene系列第02节之操作索引"
categories: Lucene
tags: lucene
author: 玄玉
excerpt: 介绍Lucene-3.6.2中使用工具Luke查看索引、和针对索引的CRUD等用法。
---

* content
{:toc}


## Luke

使用Luke可以查看分词信息，其下载地址为:[http://code.google.com/p/luke/](http://code.google.com/p/luke/)

注意：每一个Lucene版本都会有一个相应的Luke文件

用法为`双击lukeall-3.5.0.jar`或命令执行`java -jar lukeall-3.5.0.jar`

然后选择索引的存放目录，再点击OK即可

如果我们的索引有改变，可以点击右侧的`Re-open`按钮重新载入索引

Luke界面右下角的`Top ranking terms`窗口中显示的就是分词信息（其中Rank列表示出现频率）

Luke菜单下的`Documents`选项卡中显示的就是文档信息，我们可以根据文档序号来浏览（点击向左和向右的方向箭头）

Luke菜单下的`Search`选项卡中可以根据我们输入的表达式来查文档内容

比如在`Enter search expression here:`输入`content:my`，再在右侧点击一个黑色粗体字的Search大按钮即可

## 代码

下面演示的是`Lucene-3.6.2`中针对索引文件增删改查的操作方式

```java
package com.jadyer.lucene;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.NumericField;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.Version;

/**
 * Lucene系列第02节之操作索引
 * Created by 玄玉<http://jadyer.cn/> on 2013/08/18 15:48.
 */
public class HelloIndex {
    /*
     * 定义一组数据，用来演示搜索（这里有一封邮件为例）
     * 假设每一个变量代表一个Document，这里就定义了6个Document
     */
    //邮件编号
    private String[] ids = {"1", "2", "3", "4", "5", "6"};
    //邮件主题
    private String[] names = {"Michael", "Scofield", "Tbag", "Jack", "Jade", "Jadyer"};
    //邮件地址
    private String[] emails = {"aa@jadyer.us", "bb@jadyer.cn", "cc@jadyer.cc", "dd@jadyer.tw", "ee@jadyer.hk", "ff@jadyer.me"};
    //邮件内容
    private String[] contents = {"my blog", "my website", "my name", "I am JavaDeveloper", "I am from Haerbin", "I like Lucene"};
    //邮件附件（为数字和日期加索引，与，字符串加索引的方式不同）
    private int[] attachs = {9,3,5,4,1,2};
    //邮件日期
    private Date[] dates = new Date[ids.length];
    //它的创建是比较耗时耗资源的，所以这里只让它创建一次，此时reader处于整个生命周期中，实际应用中也可能直接放到ApplicationContext里面
    private static IndexReader reader = null;
    private Directory directory = null;

    public HelloIndex(){
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
        try {
            dates[0] = sdf.parse("20120601");
            dates[1] = sdf.parse("20120603");
            dates[2] = sdf.parse("20120605");
            dates[3] = sdf.parse("20120607");
            dates[4] = sdf.parse("20120609");
            dates[5] = sdf.parse("20120611");
            directory = FSDirectory.open(new File("myExample/02_index/"));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 获取IndexReader实例
     */
    private IndexReader getIndexReader(){
        try {
            if(null == reader){
                reader = IndexReader.open(directory);
            }else{
                //if the index was changed since the provided reader was opened, open and return a new reader; else,return null
                //如果当前reader在打开期间index发生改变，则打开并返回一个新的IndexReader，否则返回null
                IndexReader ir = IndexReader.openIfChanged(reader);
                if(null != ir){
                    reader.close(); //关闭原reader
                    reader = ir;    //赋予新reader
                }
            }
            return reader;
        }catch(Exception e) {
            e.printStackTrace();
        }
        return null; //发生异常则返回null
    }

    /**
     * 通过IndexReader获取文档数量
     */
    public void getDocsCount(){
        System.out.println("maxDocs:" + this.getIndexReader().maxDoc());
        System.out.println("numDocs:" + this.getIndexReader().numDocs());
        System.out.println("deletedDocs:" + this.getIndexReader().numDeletedDocs());
    }

    /**
     * 创建索引
     */
    public void createIndex(){
        IndexWriter writer = null;
        Document doc = null;
        try{
            writer = new IndexWriter(directory, new IndexWriterConfig(Version.LUCENE_36, new StandardAnalyzer(Version.LUCENE_36)));
            //创建索引之前，先把文档清空掉
            writer.deleteAll();
            //遍历ID来创建文档
            for(int i=0; i<ids.length; i++){
                doc = new Document();
                doc.add(new Field("id", ids[i], Field.Store.YES, Field.Index.NOT_ANALYZED_NO_NORMS));
                doc.add(new Field("name", names[i], Field.Store.YES, Field.Index.NOT_ANALYZED_NO_NORMS));
                doc.add(new Field("email", emails[i], Field.Store.YES, Field.Index.NOT_ANALYZED));
                doc.add(new Field("content", contents[i], Field.Store.NO, Field.Index.ANALYZED));
                //为数字加索引（第三个参数指定是否索引）
                doc.add(new NumericField("attach", Field.Store.YES, true).setIntValue(attachs[i]));
                //为日期加索引
                doc.add(new NumericField("date", Field.Store.YES, true).setLongValue(dates[i].getTime()));
                 //建立索引时加权（定义排名规则，即加权，这里是为指定邮件名结尾的emails加权）
                if(emails[i].endsWith("jadyer.cn")){
                    doc.setBoost(2.0f);
                }else if(emails[i].endsWith("jadyer.me")){
                    //为文档加权（注意它的参数类型是Float，默认为1.0f，权值越高则排名越高，显示得就越靠前）
                    doc.setBoost(1.5f);
                }else{
                    doc.setBoost(0.5f);
                }
                writer.addDocument(doc);
            }
        }catch(Exception e) {
            e.printStackTrace();
        }finally{
            if(null != writer){
                try {
                    writer.close();
                } catch (IOException ce) {
                    ce.printStackTrace();
                }
            }
        }
    }

    /**
     * 搜索文件
     */
    public void searchFile(){
        IndexSearcher searcher = new IndexSearcher(this.getIndexReader());
        //精确搜索：搜索"content"中包含"my"的文档
        Query query = new TermQuery(new Term("content", "my"));
        try{
            TopDocs tds = searcher.search(query, 10);
            for(ScoreDoc sd : tds.scoreDocs){
                //sd.doc得到的是文档的序号
                Document doc = searcher.doc(sd.doc);
                //doc.getBoost()得到的权值与创建索引时设置的权值之间是不相搭的，创建索引时的权值的查看需要使用Luke工具
                //              之所以这样，是因为这里的Document对象（是获取到的）与创建索引时的Document对象，不是同一个对象
                //sd.score得到的是该文档的评分，该评分规则的公式是比较复杂的，它主要与文档的权值和出现次数成正比
                System.out.print("("+sd.doc+"|"+doc.getBoost()+"|"+sd.score+")"+doc.get("name")+"["+doc.get("email")+"]-->");
                System.out.print(doc.get("id")+","+doc.get("attach")+",");
                System.out.println(new SimpleDateFormat("yyyyMMdd").format(new Date(Long.parseLong(doc.get("date")))));
            }
        }catch(Exception e){
            e.printStackTrace();
        }finally{
            if(null != searcher){
                try {
                    searcher.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * 更新索引
     * ----------------------------------------------------------------------
     * Lucene其实并未提供更新索引的方法，这里的更新操作内部是先删除再添加的方式
     * 因为Lucene认为更新索引的代价，与删除后重建索引的代价，二者是差不多的
     * ----------------------------------------------------------------------
     */
    public void updateIndex(){
        IndexWriter writer = null;
        Document doc = new Document();
        try{
            writer = new IndexWriter(directory, new IndexWriterConfig(Version.LUCENE_36, new StandardAnalyzer(Version.LUCENE_36)));
            doc.add(new Field("id", "1111", Field.Store.YES, Field.Index.NOT_ANALYZED_NO_NORMS));
            doc.add(new Field("name", names[0], Field.Store.YES, Field.Index.NOT_ANALYZED_NO_NORMS));
            doc.add(new Field("email", emails[0], Field.Store.YES, Field.Index.NOT_ANALYZED));
            doc.add(new Field("content", contents[0], Field.Store.NO, Field.Index.ANALYZED));
            doc.add(new NumericField("attach", Field.Store.YES, true).setIntValue(attachs[0]));
            doc.add(new NumericField("date", Field.Store.YES, true).setLongValue(dates[0].getTime()));
            //其实它会先删除索引文档中id为1的文档，然后再将这里的doc对象重新索引，所以即便这里的1!=1111，但它并不会报错
            //所以在执行完该方法后：maxDocs=7,numDocs=6,deletedDocs=1，就是因为Lucene会先删除再添加
            writer.updateDocument(new Term("id","1"), doc);
        }catch(Exception e) {
            e.printStackTrace();
        }finally{
            if(null != writer){
                try {
                    writer.close();
                } catch (IOException ce) {
                    ce.printStackTrace();
                }
            }
        }
    }

    /**
     * 删除索引
     * ----------------------------------------------------------------------------------------------
     * 在执行完该方法后，再执行本类的searchFile()方法，得知numDocs=5,maxDocs=6,deletedDocs=1
     * 这说明此时删除的文档并没有被完全删除，而是存储在一个回收站中，它是可以恢复的
     * ----------------------------------------------------------------------------------------------
     * 从回收站中清空索引IndexWriter
     * 对于清空索引，Lucene3.5之前叫做优化，调用的是IndexWriter.optimize()方法，但该方法已被禁用
     * 因为optimize时它会全部更新索引，这一过程所涉及到的负载是很大的，于是弃用了该方法，使用forceMerge代替
     * 使用IndexWriter.forceMergeDeletes()方法可以强制清空回收站中的内容
     * 另外IndexWriter.forceMerge(3)方法会将索引合并为3段，这3段中的被删除的数据也会被清空
     * 但其在Lucene3.5之后不建议使用，因为其会消耗大量的开销，而Lucene会根据情况自动处理的
     * ----------------------------------------------------------------------------------------------
     */
    public void deleteIndex(){
        IndexWriter writer = null;
        try{
            writer = new IndexWriter(directory, new IndexWriterConfig(Version.LUCENE_36, new StandardAnalyzer(Version.LUCENE_36)));
            //其参数可以传Query或Term（Query指的是可以查询出一系列的结果并将其全部删掉，而Term属于精确查找）
            //删除索引文档中id为1的文档
            writer.deleteDocuments(new Term("id", "1"));
        }catch(Exception e) {
            e.printStackTrace();
        }finally{
            if(null != writer){
                try {
                    writer.close();
                } catch (IOException ce) {
                    ce.printStackTrace();
                }
            }
        }
    }

    /**
     * 恢复索引（建议弃用）
     */
    @Deprecated
    public void unDeleteIndex(){
        IndexReader reader = null;
        try {
            //IndexReader.open(directory)此时该IndexReader默认的readOnly=true，而在恢复索引时应该指定其为非只读的
            reader = IndexReader.open(directory, false);
            //Deprecated. Write support will be removed in Lucene 4.0. There will be no replacement for this method.
            reader.undeleteAll();
        } catch (Exception e) {
            e.printStackTrace();
        }finally{
            if(null != reader){
                try {
                    reader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

最后补充一个`JUnit4.x`写的一个小测试

```java
package com.jadyer.test;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import com.jadyer.lucene.HelloIndex;

public class HelloIndexTest {
    private HelloIndex hello;

    @Before
    public void init(){
        hello = new HelloIndex();
    }

    @After
    public void destroy(){
        hello.getDocsCount();
    }

    @Test
    public void createIndex(){
        hello.createIndex();
    }

    @Test
    public void searchFile(){
        hello.searchFile();
    }

    @Test
    public void updateIndex(){
        hello.updateIndex();
    }

    @Test
    public void deleteIndex(){
        hello.deleteIndex();
    }

    @Test
    @SuppressWarnings("deprecation")
    public void unDeleteIndex(){
        hello.unDeleteIndex();
    }
}
```