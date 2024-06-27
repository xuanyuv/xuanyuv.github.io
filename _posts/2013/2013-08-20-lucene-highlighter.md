---
layout: post
title: "Lucene系列第11节之高亮"
categories: Lucene
tags: lucene
author: 玄玉
excerpt: 主要介绍Lucene-3.6.2中搜索高亮功能的实现。
---

* content
{:toc}


高亮功能属于Lucene的扩展功能（或者叫做贡献功能）

其所需jar位于`Lucene-3.6.2.zip/contrib/highlighter/`文件夹中

本文示例中需要以下4个jar

* lucene-core-3.6.2.jar
* lucene-highlighter-3.6.2.jar
* mmseg4j-all-1.8.5-with-dic.jar
* tika-app-1.4.jar

下面演示的就是`Lucene-3.6.2`中高亮功能的示例代码

```java
package com.xuanyuv.lucene;
import java.io.File;
import java.io.IOException;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.queryParser.MultiFieldQueryParser;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.search.highlight.Formatter;
import org.apache.lucene.search.highlight.Fragmenter;
import org.apache.lucene.search.highlight.Highlighter;
import org.apache.lucene.search.highlight.QueryScorer;
import org.apache.lucene.search.highlight.SimpleHTMLFormatter;
import org.apache.lucene.search.highlight.SimpleSpanFragmenter;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.Version;
import org.apache.tika.Tika;
import com.chenlb.mmseg4j.analysis.MMSegAnalyzer;

/**
 * Lucene系列第11节之高亮
 * Created by 玄玉<https://www.xuanyuv.com/> on 2013/08/20 11:37.
 */
public class HelloHighLighter {
    private Directory directory;
    private IndexReader reader;

    public HelloHighLighter(){
        Document doc = null;
        IndexWriter writer = null;
        try{
            directory = FSDirectory.open(new File("myExample/myIndex/"));
            writer = new IndexWriter(directory, new IndexWriterConfig(Version.LUCENE_36, new MMSegAnalyzer()));
            writer.deleteAll();
            for(File myFile : new File("myExample/myFile/").listFiles()){
                doc = new Document();
                doc.add(new Field("filecontent", new Tika().parse(myFile))); //Field.Store.NO, Field.Index.ANALYZED
                doc.add(new Field("filepath", myFile.getAbsolutePath(), Field.Store.YES, Field.Index.NOT_ANALYZED_NO_NORMS));
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
     * 获取IndexSearcher实例
     */
    private IndexSearcher getIndexSearcher(){
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
            return new IndexSearcher(reader);
        }catch(Exception e) {
            e.printStackTrace();
        }
        return null; //发生异常则返回null
    }

    /**
     * 高亮搜索（不建议把高亮信息存到索引里，而是搜索到内容之后再进行高亮处理）
     * @param expr 搜索表达式
     */
    public void searchByHignLighter(String expr){
        Analyzer analyzer = new MMSegAnalyzer();
        IndexSearcher searcher = this.getIndexSearcher();
        //搜索多个Field
        QueryParser parser = new MultiFieldQueryParser(Version.LUCENE_36, new String[]{"filepath", "filecontent"}, analyzer);
        try {
            Query query = parser.parse(expr);
            TopDocs tds = searcher.search(query, 50);
            for(ScoreDoc sd : tds.scoreDocs){
                Document doc = searcher.doc(sd.doc);
                //获取文档内容
                String filecontent = new Tika().parseToString(new File(doc.get("filepath")));
                System.out.println("搜索到的内容为[" + filecontent + "]");
                //开始高亮处理
                QueryScorer queryScorer = new QueryScorer(query);
                Fragmenter fragmenter = new SimpleSpanFragmenter(queryScorer, filecontent.length());
                Formatter formatter = new SimpleHTMLFormatter("<span style='color:red'>", "</span>");
                Highlighter hl = new Highlighter(formatter, queryScorer);
                hl.setTextFragmenter(fragmenter);
                System.out.println("高亮后的内容为[" + hl.getBestFragment(analyzer, "filecontent", filecontent) + "]");
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if(null != searcher){
                try {
                    searcher.close(); //记得关闭IndexSearcher
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * 高亮的使用方式
     */
    private static void testHighLighter(){
        //这个可以随便写，就是起个标识的作用
        String fieldName = "myinfo";
        String text = "我来自中国黑龙江省哈尔滨市巴彦县兴隆镇长春乡民权村4队";
        QueryParser parser = new QueryParser(Version.LUCENE_36, fieldName, new MMSegAnalyzer());
        try {
            //这里用的是MMSeg4j中文分词器，有关介绍详见https://www.xuanyuv.com/2013/08/18/lucene-chinese-analyzer/
            //MMSeg4j的new MMSegAnalyzer()默认只会对'中国'和'兴隆'进行分词，所以这里就只高亮它们俩了
            Query query = parser.parse("中国 兴隆");
            //针对查询出来的文本，查询其评分，以便于能够根据评分决定显示情况
            QueryScorer queryScorer = new QueryScorer(query);
            //对字符串或文本进行分段，SimpleSpanFragmenter构造方法的第二个参数可以指定高亮的文本长度，默认为100
            Fragmenter fragmenter = new SimpleSpanFragmenter(queryScorer);
            //高亮时的高亮格式，默认为<B></B>，这里指定为红色字体
            Formatter formatter = new SimpleHTMLFormatter("<span style='color:red'>", "</span>");
            //Highlighter专门用来做高亮显示
            //该构造方法还有一个参数为Encoder，它有两个实现类DefaultEncoder和SimpleHTMLEncoder
            //SimpleHTMLEncoder可以忽略掉HTML标签，而DefaultEncoder则不会忽略HTML标签
            Highlighter hl = new Highlighter(formatter, queryScorer);
            hl.setTextFragmenter(fragmenter);
            System.out.println(hl.getBestFragment(new MMSegAnalyzer(), fieldName, text));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 小测试一下
     */
    public static void main(String[] args) {
        //测试高亮的基本使用效果
        HelloHighLighter.testHighLighter();
        //测试高亮搜索的效果（测试前记得在myExample/myFile/文件夹中准备一个或多个内容包含"依赖"的doc或pdf的等文件）
        new HelloHighLighter().searchByHignLighter("依赖");
    }
}
```