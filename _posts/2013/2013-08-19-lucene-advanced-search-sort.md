---
layout: post
title: "Lucene系列第06节之高级搜索之排序"
categories: Lucene
tags: lucene
author: 玄玉
excerpt: 介绍Lucene-3.6.2中高级搜索里面的排序用法。
---

* content
{:toc}


下面演示的是`Lucene-3.6.2`中针对搜索结果进行排序的各种效果（详见代码注释）

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
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.SortField;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.Version;

/**
 * Lucene系列第06节之高级搜索之排序
 * Created by 玄玉<https://jadyer.cn/> on 2013/08/19 11:04.
 */
public class AdvancedSearchBySort {
    private Directory directory;
    private IndexReader reader;

    public AdvancedSearchBySort(){
        /** 文件大小 */
        int[] sizes = {90, 10, 20, 10, 60, 50};
        /** 文件名 */
        String[] names = {"Michael.java", "Scofield.ini", "Tbag.txt", "Jack", "Jade", "Jadyer"};
        /** 文件内容 */
        String[] contents = {"my blog is https://jadyer.cn/",
                             "my github is https://github.com/jadyer",
                             "my name is jadyer",
                             "I am a Java Developer",
                             "I am from Haerbin",
                             "I like java of Lucene"};
        /** 文件日期 */
        Date[] dates = new Date[sizes.length];
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        IndexWriter writer = null;
        Document doc = null;
        try {
            dates[0] = sdf.parse("20130407 15:25:30");
            dates[1] = sdf.parse("20130407 16:30:45");
            dates[2] = sdf.parse("20130213 11:15:25");
            dates[3] = sdf.parse("20130808 09:30:55");
            dates[4] = sdf.parse("20130526 13:54:22");
            dates[5] = sdf.parse("20130701 17:35:34");
            directory = FSDirectory.open(new File("myExample/01_index/"));
            writer = new IndexWriter(directory, new IndexWriterConfig(Version.LUCENE_36, new StandardAnalyzer(Version.LUCENE_36)));
            writer.deleteAll();
            for(int i=0; i<sizes.length; i++){
                doc = new Document();
                doc.add(new NumericField("size",Field.Store.YES, true).setIntValue(sizes[i]));
                doc.add(new Field("name", names[i], Field.Store.YES, Field.Index.ANALYZED_NO_NORMS));
                doc.add(new Field("content", contents[i], Field.Store.NO, Field.Index.ANALYZED));
                doc.add(new NumericField("date", Field.Store.YES, true).setLongValue(dates[i].getTime()));
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
     * 搜索排序
     * ----------------------------------------------------------------------------------------------------------------
     * 关于Sort参数的可输入规则，如下所示
     * 1)Sort.INDEXORDER--使用文档编号从小到大的顺序进行排序
     * 2)Sort.RELEVANCE---使用文档评分从大到小的顺序进行排序，也是默认的排序规则，等价于search(query, 10)
     * 3)new Sort(new SortField("size", SortField.INT))-----------使用文件大小从小到大的顺序排序
     * 4)new Sort(new SortField("date", SortField.LONG))----------使用文件日期从以前到现在的顺序排序
     * 5)new Sort(new SortField("name", SortField.STRING))--------使用文件名从A到Z的顺序排序
     * 6)new Sort(new SortField("name", SortField.STRING, true))--使用文件名从Z到A的顺序排序
     * 7)new Sort(new SortField("size", SortField.INT), SortField.FIELD_SCORE)--先按文件大小排，再按文档评分排（可指定多个排序规则）
     * 注意:以上7个Sort再打印文档评分时都是NaN，只有search(query, 10)才会正确打印文档评分
     * ----------------------------------------------------------------------------------------------------------------
     * @param expr 搜索表达式
     * @param sort 排序规则
     */
    public void searchBySort(String expr, Sort sort){
        IndexSearcher searcher = new IndexSearcher(this.getIndexReader());
        QueryParser parser = new QueryParser(Version.LUCENE_36, "content", new StandardAnalyzer(Version.LUCENE_36));
        TopDocs tds = null;
        try {
            if(null == sort){
                tds = searcher.search(parser.parse(expr), 10);
            }else{
                tds = searcher.search(parser.parse(expr), 10, sort);
            }
            for(ScoreDoc sd : tds.scoreDocs){
                Document doc = searcher.doc(sd.doc);
                System.out.print("文档编号=" + sd.doc + "  文档权值=" + doc.getBoost() + "  文档评分=" + sd.score + "    ");
                System.out.print("size=" + doc.get("size") + "  date=");
                System.out.print(new SimpleDateFormat("yyyyMMdd HH:mm:ss").format(new Date(Long.parseLong(doc.get("date")))));
                System.out.println("  name=" + doc.get("name"));
            }
        } catch (Exception e) {
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
     * 测试一下排序效果
     */
    public static void main(String[] args) {
        AdvancedSearchBySort advancedSearch = new AdvancedSearchBySort();
        ////使用文档评分从大到小的顺序进行排序,也是默认的排序规则
        //advancedSearch.searchBySort("Java", null);
        //advancedSearch.searchBySort("Java", Sort.RELEVANCE);
        ////使用文档编号从小到大的顺序进行排序
        //advancedSearch.searchBySort("Java", Sort.INDEXORDER);
        ////使用文件大小从小到大的顺序排序
        //advancedSearch.searchBySort("Java", new Sort(new SortField("size", SortField.INT)));
        ////使用文件日期从以前到现在的顺序排序
        //advancedSearch.searchBySort("Java", new Sort(new SortField("date", SortField.LONG)));
        ////使用文件名从A到Z的顺序排序
        //advancedSearch.searchBySort("Java", new Sort(new SortField("name", SortField.STRING)));
        ////使用文件名从Z到A的顺序排序
        //advancedSearch.searchBySort("Java", new Sort(new SortField("name", SortField.STRING, true)));
        //先按照文件大小排序,再按照文档评分排序(可以指定多个排序规则)
        advancedSearch.searchBySort("Java", new Sort(new SortField("size", SortField.INT), SortField.FIELD_SCORE));
    }
}
```