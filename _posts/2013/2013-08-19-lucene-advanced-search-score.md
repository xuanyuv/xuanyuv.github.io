---
layout: post
title: "Lucene系列第08节之高级搜索之评分"
categories: Lucene
tags: lucene
author: 玄玉
excerpt: 介绍Lucene-3.6.2中高级搜索里面自定义评分的用法。
---

* content
{:toc}


下面演示的是`Lucene-3.6.2`中搜索的时候，`自定义评分`的用法（详见代码注释）

```java
package com.jadyer.lucene;
import java.io.File;
import java.io.IOException;
import java.util.Random;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.NumericField;
import org.apache.lucene.index.CorruptIndexException;
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
import com.jadyer.custom.MyNameScoreQuery;

/**
 * Lucene系列第08节之高级搜索之评分
 * Created by 玄玉<http://jadyer.cn/> on 2013/08/19 12:13.
 */
public class AdvancedSearchByScore {
    private Directory directory;
    private IndexReader reader;

    public AdvancedSearchByScore(){
        /** 文件大小 */
        int[] sizes = {90, 10, 20, 10, 60, 50};
        /** 文件名 */
        String[] names = {"Michael.java", "Scofield.ini", "Tbag.txt", "Jack", "Jade", "Jadyer"};
        /** 文件内容 */
        String[] contents = {"my blog is http://jadyer.cn/",
                             "my github is https://github.com/jadyer",
                             "my name is jadyer",
                             "I am a Java Developer",
                             "I am from Haerbin",
                             "I like java of Lucene"};
        IndexWriter writer = null;
        Document doc = null;
        try {
            directory = FSDirectory.open(new File("myExample/01_index/"));
            writer = new IndexWriter(directory, new IndexWriterConfig(Version.LUCENE_36, new StandardAnalyzer(Version.LUCENE_36)));
            writer.deleteAll();
            for(int i=0; i<sizes.length; i++){
                doc = new Document();
                doc.add(new NumericField("size", Field.Store.YES, true).setIntValue(sizes[i]));
                doc.add(new Field("name", names[i], Field.Store.YES, Field.Index.ANALYZED_NO_NORMS));
                doc.add(new Field("content", contents[i], Field.Store.NO, Field.Index.ANALYZED));
                //添加一个评分域，专门在自定义评分时使用（此时默认为Field.Store.NO和Field.Index.ANALYZED_NO_NORMS）
                doc.add(new NumericField("fileScore").setIntValue(new Random().nextInt(600)));
                writer.addDocument(doc);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
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
     * 获取IndexReader实例
     */
    private IndexReader getIndexReader(){
        try {
            if(reader == null){
                reader = IndexReader.open(directory);
            }else{
                //if the index was changed since the provided reader was opened, open and return a new reader; else,return null
                //如果当前reader在打开期间index发生改变，则打开并返回一个新的IndexReader，否则返回null
                IndexReader ir = IndexReader.openIfChanged(reader);
                if(ir != null){
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
     * 自定义评分搜索
     */
    public void searchByCustomScoreQuery(){
        IndexSearcher searcher = new IndexSearcher(this.getIndexReader());
        ////创建一个评分域
        //FieldScoreQuery fsq = new FieldScoreQuery("fileScore", FieldScoreQuery.Type.INT);
        ////创建自定义的CustomScoreQuery对象
        //Query query = new MyCustomScoreQuery(new TermQuery(new Term("content", "java")), fsq);
        Query query = new MyNameScoreQuery(new TermQuery(new Term("content", "java")));
        try {
            TopDocs tds = searcher.search(query, 10);
            for(ScoreDoc sd : tds.scoreDocs){
                Document doc = searcher.doc(sd.doc);
                System.out.print("文档编号=" + sd.doc + "  文档权值=" + doc.getBoost() + "  文档评分=" + sd.score + "   ");
                System.out.println("size=" + doc.get("size") + "  name=" + doc.get("name"));
            }
        } catch (CorruptIndexException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if(searcher != null){
                try {
                    searcher.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * 测试一下评分效果
     */
    public static void main(String[] args) {
        new AdvancedSearchByScore().searchByCustomScoreQuery();
    }
}
```

下面是我们自定义的评分类`MyCustomScoreQuery.java`

```java
package com.jadyer.custom;
import java.io.IOException;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.function.CustomScoreProvider;
import org.apache.lucene.search.function.CustomScoreQuery;
import org.apache.lucene.search.function.ValueSourceQuery;

/**
 * 自定义评分的步骤
 * ---------------------------------------------------------------------------------------
 * 1)创建一个类继承于CustomScoreQuery
 * 2)覆盖CustomScoreQuery.getCustomScoreProvider()方法
 * 3)创建一个类继承于CustomScoreProvider
 * 4)覆盖CustomScoreProvider.customScore()方法：我们的自定义评分主要就是在此方法中完成的
 * ---------------------------------------------------------------------------------------
 * Created by 玄玉<http://jadyer.cn/> on 2013/08/06 10:30.
 */
public class MyCustomScoreQuery extends CustomScoreQuery {
    private static final long serialVersionUID = -2373017691291184609L;

    public MyCustomScoreQuery(Query subQuery, ValueSourceQuery valSrcQuery) {
        //ValueSourceQuery参数就是指专门用来做评分的Query，即评分域的FieldScoreQuery
        super(subQuery, valSrcQuery);
    }

    @Override
    protected CustomScoreProvider getCustomScoreProvider(IndexReader reader) throws IOException {
        //如果直接返回super的，就表示使用原有的评分规则，即通过[原有的评分*传入的评分域所获取的评分]来确定最终评分
        //return super.getCustomScoreProvider(reader);
        return new MyCustomScoreProvider(reader);
    }

    private class MyCustomScoreProvider extends CustomScoreProvider {
        public MyCustomScoreProvider(IndexReader reader) {
            super(reader);
        }
        @Override
        public float customScore(int doc, float subQueryScore, float valSrcScore) throws IOException {
            //subQueryScore--表示默认文档的打分，valSrcScore--表示评分域的打分
            //该方法的返回值就是文档评分，即ScoreDoc.score获取的结果
            System.out.println("subQueryScore=" + subQueryScore + "    valSrcScore=" + valSrcScore);
            return subQueryScore/valSrcScore;
        }
    }
}
```

下面是自定义的采用特殊文件名作为评分标准的评分类`MyNameScoreQuery.java`

```java
package com.jadyer.custom;
import java.io.IOException;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.search.FieldCache;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.function.CustomScoreProvider;
import org.apache.lucene.search.function.CustomScoreQuery;

/**
 * 采用特殊文件名作为评分标准的评分类
 * Created by 玄玉<http://jadyer.cn/> on 2013/08/06 14:17.
 */
public class MyNameScoreQuery extends CustomScoreQuery {
    private static final long serialVersionUID = -2813985445544972520L;

    public MyNameScoreQuery(Query subQuery) {
        //由于这里是打算根据文件名来自定义评分，所以重写构造方法时不必传入评分域的ValueSourceQuery
        super(subQuery);
    }

    @Override
    protected CustomScoreProvider getCustomScoreProvider(IndexReader reader) throws IOException {
        return new FilenameScoreProvider(reader);
    }

    private class FilenameScoreProvider extends CustomScoreProvider {
        String[] filenames;
        public FilenameScoreProvider(IndexReader reader) {
            super(reader);
            try {
                //在IndexReader没有关闭之前，所有的数据都会存储到一个预缓存中（缺点是占用大量内存）
                //所以我们可以通过预缓存获取name域的值（获取到的是name域所有值，故使用数组）
                this.filenames = FieldCache.DEFAULT.getStrings(reader, "name");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        @Override
        public float customScore(int doc, float subQueryScore, float valSrcScore) throws IOException {
            //由于FilenameScoreQuery构造方法没有传入ValueSourceQuery，故此处ValueSourceQuery默认为1.0
            System.out.println("subQueryScore=" + subQueryScore + "    valSrcScore=" + valSrcScore);
            if(filenames[doc].endsWith(".java") || filenames[doc].endsWith(".ini")){
                //只加大java文件和ini文件的评分
                return subQueryScore*1.5f;
            }else{
                return subQueryScore/1.5f;
            }
        }
    }
}
```