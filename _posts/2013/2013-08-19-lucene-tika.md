---
layout: post
title: "Lucene系列第10节之Tika"
categories: Lucene
tags: lucene
author: 玄玉
excerpt: 主要介绍Lucene-3.6.2中创建索引时通过Tika来解析各种文档内容的方法。
---

* content
{:toc}


## 简述Tike

以往解析PDF时通常使用PDFBox：[http://pdfbox.apache.org/](http://pdfbox.apache.org/)

解析Office时使用POI：[http://poi.apache.org/](http://poi.apache.org/)

而`Tika`则是对它们的封装，它可以直接将PDF、Office等文件解析为文本字符串（也可以处理html、txt等等）

官网为：[http://tika.apache.org/](http://tika.apache.org/)

用法为：命令行执行`java -jar tika-app-1.4.jar`（双击tika-app-1.4.jar竟然打不开）

　　　　而在项目中使用时，直接引入tika-app-1.4.jar即可

下面是`Tike-1.4`的一个使用示例`HelloTika.java`

```java
package com.xuanyuv.lucene;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import org.apache.tika.Tika;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.Parser;
import org.apache.tika.sax.BodyContentHandler;
import org.xml.sax.ContentHandler;

/**
 * Tika-1.4使用示例
 * Created by 玄玉<https://www.xuanyuv.com/> on 2013/08/07 08:57.
 */
public class HelloTika {
    public static String parseToStringByTikaParser(File file){
        //创建解析器，使用AutoDetectParser可以自动检测一个最合适的解析器
        Parser parser = new AutoDetectParser();
        //指定解析文件中的文档内容
        ContentHandler handler = new BodyContentHandler();
        //指定元数据存放位置，并自己添加一些元数据
        Metadata metadata = new Metadata();
        metadata.set("MyAddPropertyName", "我叫玄玉");
        metadata.set(Metadata.RESOURCE_NAME_KEY, file.getAbsolutePath());
        //指定最基本的变量信息（即存放一个所使用的解析器对象）
        ParseContext context = new ParseContext();
        context.set(Parser.class, parser);
        InputStream is = null;
        try {
            is = new FileInputStream(file);
            //InputStream-----指定文件输入流
            //ContentHandler--指定要解析文件的哪一个内容，它有一个实现类叫做BodyContentHandler，即专门用来解析文档内容的
            //Metadata--------指定解析文件时，存放解析出来的元数据的Metadata对象
            //ParseContext----该对象用于存放一些变量信息，该对象最少也要存放所使用的解析器对象，这也是其存放的最基本的变量信息
            parser.parse(is, handler, metadata, context);
            //打印元数据
            for(String name : metadata.names()){
                System.out.println(name + "=" + metadata.get(name));
            }
            //返回解析到的文档内容
            return handler.toString();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if(is != null){
                try {
                    is.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return null;
    }

    public static String parseToStringByTika(File file){
        //据Tika文档上说，org.apache.tika.Tika的效率没有org.apache.tika.parser.Parser的高
        Tika tika = new Tika();
        //可以指定是否获取元数据，也可自己添加元数据
        Metadata metadata = new Metadata();
        metadata.set("MyAddPropertyName", "我叫玄玉");
        metadata.set(Metadata.RESOURCE_NAME_KEY, file.getAbsolutePath());
        try {
            String fileContent = tika.parseToString(file);
            //String fileContent = tika.parseToString(new FileInputStream(file), metadata);
            //打印元数据
            for(String name : metadata.names()){
                System.out.println(name + "=" + metadata.get(name));
            }
            return fileContent;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public static void main(String[] args) {
        System.out.println(parseToStringByTikaParser(new File("myExample/myFile/Java安全.doc")));
        System.out.println(parseToStringByTika(new File("myExample/myFile/Oracle_SQL语句优化.pdf")));
        System.out.println(parseToStringByTika(new File("myExample/myFile/")));
    }
}
```

## 借助Tika创建索引

下面演示的就是在`Lucene-3.6.2`中借助`Tika-1.4`创建索引的示例代码

```java
package com.xuanyuv.lucene;
import java.io.File;
import java.io.IOException;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
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
import org.apache.tika.Tika;
import com.chenlb.mmseg4j.analysis.ComplexAnalyzer;

/**
 * Lucene系列第10节之Tika
 * Created by 玄玉<https://www.xuanyuv.com/> on 2013/08/19 23:02.
 */
public class HelloTikaIndex {
    private Directory directory;
    private IndexReader reader;

    public HelloTikaIndex(){
        try {
            directory = FSDirectory.open(new File("myExample/myIndex/"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 创建索引
     */
    public void createIndex(){
        Document doc = null;
        IndexWriter writer = null;
        File myFile = new File("myExample/myFile/");
        try{
            //这里的分词器使用的是MMSeg4j（记得引入mmseg4j-all-1.8.5-with-dic.jar）
            //详见https://www.xuanyuv.com/2013/08/18/lucene-chinese-analyzer/中对MMSeg4j的介绍
            writer = new IndexWriter(directory, new IndexWriterConfig(Version.LUCENE_36, new ComplexAnalyzer()));
            writer.deleteAll();
            for(File file : myFile.listFiles()){
                doc = new Document();
                ////当保存文件的Metadata时，要过滤掉文件夹，否则会报告文件夹无法访问的异常
                //if(file.isDirectory()){
                //    continue;
                //}
                //Metadata metadata = new Metadata();
                //doc.add(new Field("filecontent", new Tika().parse(new FileInputStream(file), metadata)));
                doc.add(new Field("filecontent", new Tika().parse(file)));
                doc.add(new Field("filename", file.getName(), Field.Store.YES, Field.Index.NOT_ANALYZED));
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
     * 执行搜索操作
     * @param fieldName 域名（相当于表的字段名）
     * @param keyWords  搜索的关键字
     */
    public void searchFile(String fieldName, String keyWords){
        IndexSearcher searcher = this.getIndexSearcher();
        Query query = new TermQuery(new Term(fieldName, keyWords));
        try {
            TopDocs tds = searcher.search(query, 50);
            for(ScoreDoc sd : tds.scoreDocs){
                Document doc = searcher.doc(sd.doc);
                System.out.print("文档编号=" + sd.doc + "  文档权值=" + doc.getBoost() + "  文档评分=" + sd.score + "   ");
                System.out.println("filename=" + doc.get("filename"));
            }
        } catch (IOException e) {
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
     * 测试一下效果（测试前记得在myExample/myFile/目录下预先准备几个doc,pdf,html,txt等文件）
     */
    public static void main(String[] args) {
        HelloTikaIndex hello = new HelloTikaIndex();
        hello.createIndex();
        hello.searchFile("filecontent", "java");
    }
}
```