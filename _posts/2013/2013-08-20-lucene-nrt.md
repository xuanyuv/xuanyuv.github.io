---
layout: post
title: "Lucene系列第12节之近实时搜索"
categories: Lucene
tags: lucene
author: 玄玉
excerpt: 主要介绍Lucene-3.6.2中近实时搜索功能的实现。
---

* content
{:toc}


实时搜索：只要数据发生变化，则马上更新索引（IndexWriter.commit()）

近实时搜索：数据发生变化时，先将索引保存到内存中，然后在一个统一的时间再对内存中的所有索引执行commit提交动作

为了实现近实时搜索，`Lucene3.0`提供的方式叫做`reopen`

后来的版本中提供了两个线程安全的类`NRTManager`和`SearcherManager`

不过这俩线程安全的类在`Lucene3.5`和`3.6`版本中的用法有点不太一样，这点要注意！

下面演示的是`Lucene-3.6.2`中近实时搜索的实现方式

```java
package com.jadyer.lucene;
import java.io.File;
import java.io.IOException;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.NRTManager;
import org.apache.lucene.search.NRTManagerReopenThread;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.search.NRTManager.TrackingIndexWriter;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.Version;

/**
 * Lucene系列第12节之近实时搜索
 * Created by 玄玉<http://jadyer.cn/> on 2013/08/20 16:19.
 */
public class HelloNRTSearch {
    private IndexWriter writer;
    private NRTManager nrtManager;
    private TrackingIndexWriter trackWriter;

    public HelloNRTSearch(){
        try {
            Directory directory = FSDirectory.open(new File("myExample/myIndex/"));
            writer = new IndexWriter(directory, new IndexWriterConfig(Version.LUCENE_36, new StandardAnalyzer(Version.LUCENE_36)));
            trackWriter = new NRTManager.TrackingIndexWriter(writer);
            ///*
            // * Lucene3.5中的NRTManager是通过下面的方式创建的
            // * 并且Lucene3.5中可以直接使用NRTManager.getSearcherManager(true)获取到org.apache.lucene.search.SearcherManager
            // */
            //nrtManager = new NRTManager(writer,new org.apache.lucene.search.SearcherWarmer() {
            //    @Override
            //    public void warm(IndexSearcher s) throws IOException {
            //        System.out.println("IndexSearcher.reopen时会自动调用此方法");
            //    }
            //});
            nrtManager = new NRTManager(trackWriter, null);
            //启动一个Lucene提供的后台线程来自动定时的执行NRTManager.maybeRefresh()方法
            //这里的后俩参数，是根据这篇分析的文章写的http://blog.mikemccandless.com/2011/11/near-real-time-readers-with-lucenes.html
            NRTManagerReopenThread reopenThread = new NRTManagerReopenThread(nrtManager, 5.0, 0.025);
            reopenThread.setName("NRT Reopen Thread");
            reopenThread.setDaemon(true);
            reopenThread.start();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 创建索引
     */
    public static void createIndex(){
        String[] ids = {"1", "2", "3", "4", "5", "6"};
        String[] names = {"Michael", "Scofield", "Tbag", "Jack", "Jade", "Jadyer"};
        String[] contents = {"my blog", "my website", "my name", "my job is JavaDeveloper", "I am from Haerbin", "I like Lucene"};
        IndexWriter writer = null;
        Document doc = null;
        try{
            Directory directory = FSDirectory.open(new File("myExample/myIndex/"));
            writer = new IndexWriter(directory, new IndexWriterConfig(Version.LUCENE_36, new StandardAnalyzer(Version.LUCENE_36)));
            writer.deleteAll();
            for(int i=0; i<names.length; i++){
                doc = new Document();
                doc.add(new Field("id",ids[i],Field.Store.YES, Field.Index.NOT_ANALYZED_NO_NORMS));
                doc.add(new Field("name", names[i], Field.Store.YES, Field.Index.NOT_ANALYZED_NO_NORMS));
                doc.add(new Field("content", contents[i], Field.Store.YES, Field.Index.ANALYZED));
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
     * 通过IndexReader获取文档数量
     */
    public static void getDocsCount(){
        IndexReader reader = null;
        try {
            reader = IndexReader.open(FSDirectory.open(new File("myExample/myIndex/")));
            System.out.println("maxDocs:" + reader.maxDoc());
            System.out.println("numDocs:" + reader.numDocs());
            System.out.println("deletedDocs:" + reader.numDeletedDocs());
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if(reader != null){
                try {
                    reader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * 搜索文件
     */
    public void searchFile(){
        //Lucene3.5里面可以直接使用NRTManager.getSearcherManager(true).acquire()
        IndexSearcher searcher = nrtManager.acquire();
        Query query = new TermQuery(new Term("content", "my"));
        try{
            TopDocs tds = searcher.search(query, 10);
            for(ScoreDoc sd : tds.scoreDocs){
                Document doc = searcher.doc(sd.doc);
                System.out.print("文档编号=" + sd.doc + "  文档权值=" + doc.getBoost() + "  文档评分=" + sd.score + "   ");
                System.out.println("id=" + doc.get("id") + "  name=" + doc.get("name") + "  content=" + doc.get("content"));
            }
        }catch(Exception e) {
            e.printStackTrace();
        }finally{
            try {
                //这里就不要IndexSearcher.close()啦，而是交由NRTManager来释放
                nrtManager.release(searcher);
                //Lucene-3.6.2文档中ReferenceManager.acquire()方法描述里建议再手工设置searcher为null，以防止在其它地方被意外的使用
                searcher = null;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * 更新索引
     */
    public void updateIndex(){
        Document doc = new Document();
        doc.add(new Field("id", "11", Field.Store.YES, Field.Index.NOT_ANALYZED_NO_NORMS));
        doc.add(new Field("name", "xuanyu", Field.Store.YES, Field.Index.NOT_ANALYZED_NO_NORMS));
        doc.add(new Field("content", "my name is xuanyu", Field.Store.YES, Field.Index.ANALYZED));
        try{
            //Lucene3.5中可以直接使用org.apache.lucene.search.NRTManager.updateDocument(new Term("id", "1"), doc)
            trackWriter.updateDocument(new Term("id", "1"), doc);
        }catch(IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 删除索引
     */
    public void deleteIndex(){
        try {
            //Lucene3.5中可以直接使用org.apache.lucene.search.NRTManager.deleteDocuments(new Term("id", "2"))
            trackWriter.deleteDocuments(new Term("id", "2"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 提交索引内容的变更情况
     */
    public void commitIndex(){
        try {
            writer.commit();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

下面是用`JUnit4.x`写的小测试

```java
package com.jadyer.test;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import com.jadyer.lucene.HelloNRTSearch;

public class HelloNRTSearchTest {
    @Before
    public void init(){
        HelloNRTSearch.createIndex();
    }

    @After
    public void destroy(){
        HelloNRTSearch.getDocsCount();
    }

    @Test
    public void searchFile(){
        HelloNRTSearch hello = new HelloNRTSearch();
        for(int i=0; i<5; i++){
            hello.searchFile();
            System.out.println("-----------------------------------------------------------");
            hello.deleteIndex();
            if(i == 2){
                hello.updateIndex();
            }
            try {
                System.out.println(".........开始休眠5s(模拟近实时搜索情景)");
                Thread.sleep(5000);
                System.out.println(".........休眠结束");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        //不能单独去new HelloNRTSearch，要保证它们是同一个对象，否则所做的delete和update不会被commit
        hello.commitIndex();
    }
}
```