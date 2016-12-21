---
layout: post
title: "Lucene系列第09节之高级搜索之QueryParser"
categories: Lucene
tags: lucene
author: 玄玉
excerpt: 介绍Lucene-3.6.2中高级搜索时通过自定义QueryParser的方式实现禁用模糊和通配符搜索，以及扩展基于数字和日期的搜索等功能。
---

* content
{:toc}


下面演示的是`Lucene-3.6.2`中搜索的时候

通过`自定义QueryParser`的方式实现`禁用模糊和通配符搜索`，以及`扩展基于数字和日期的搜索`等功能（详见代码注释）

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
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.Version;
import com.jadyer.custom.MyQueryParser;

/**
 * Lucene系列第09节之高级搜索之QueryParser
 * Created by 玄玉<https://jadyer.github.io/> on 2013/08/19 14:07.
 */
public class AdvancedSearch {
    private Directory directory;
    private IndexReader reader;

    public AdvancedSearch(){
        /** 文件大小 */
        int[] sizes = {90, 10, 20, 10, 60, 50};
        /** 文件名 */
        String[] names = {"Michael.java", "Scofield.ini", "Tbag.txt", "Jack", "Jade", "Jadyer"};
        /** 文件内容 */
        String[] contents = {"my java blog is http://blog.csdn.net/jadyer",
                             "my Java Website is http://www.jadyer.cn",
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
     * 自定义QueryParser的搜索
     * @param expr 搜索的表达式
     */
    public void searchByCustomQueryParser(String expr){
        IndexSearcher searcher = new IndexSearcher(this.getIndexReader());
        QueryParser parser = new MyQueryParser(Version.LUCENE_36, "content", new StandardAnalyzer(Version.LUCENE_36));
        try {
            Query query = parser.parse(expr);
            TopDocs tds = searcher.search(query, 10);
            for(ScoreDoc sd : tds.scoreDocs){
                Document doc = searcher.doc(sd.doc);
                System.out.print("文档编号=" + sd.doc + "  文档权值=" + doc.getBoost() + "  文档评分=" + sd.score + "   ");
                System.out.print("size=" + doc.get("size") + "  date=");
                System.out.print(new SimpleDateFormat("yyyyMMdd HH:mm:ss").format(new Date(Long.parseLong(doc.get("date")))));
                System.out.println("  name=" + doc.get("name"));
            }
        } catch (ParseException e) {
            System.err.println(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if(null != searcher){
                try {
                    //记得关闭IndexSearcher
                    searcher.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * 测试一下搜索效果
     */
    public static void main(String[] args) {
        AdvancedSearch advancedSearch = new AdvancedSearch();
        advancedSearch.searchByCustomQueryParser("name:Jadk~");
        advancedSearch.searchByCustomQueryParser("name:Ja??er");
        System.out.println("------------------------------------------------------------------------");
        advancedSearch.searchByCustomQueryParser("name:Jade");
        System.out.println("------------------------------------------------------------------------");
        advancedSearch.searchByCustomQueryParser("name:[h TO n]");
        System.out.println("------------------------------------------------------------------------");
        advancedSearch.searchByCustomQueryParser("size:[20 TO 80]");
        System.out.println("------------------------------------------------------------------------");
        advancedSearch.searchByCustomQueryParser("date:[20130407 TO 20130701]");
    }
}
```

下面是自定义的`MyQueryParser.java`

这里主要实现了以下两个功能

1、禁用模糊搜索和通配符搜索，以提高搜索性能

2、扩展基于数字和日期的搜索，使之支持数字和日期的搜索

```java
package com.jadyer.custom;
import java.text.SimpleDateFormat;
import java.util.regex.Pattern;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.search.NumericRangeQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.util.Version;

/**
 * 自定义QueryParser
 * --------------------------------------------------------------------------------------------------
 * 实际使用QueryParser的过程中，通常会考虑两个问题
 * 1)限制性能低的QueryParser--对于某些QueryParser在搜索时会使得性能降低，故考虑禁用这些搜索以提升性能
 * 2)扩展基于数字和日期的搜索---有时需要进行一个数字的范围搜索，故需扩展原有的QueryParser才能实现此搜索
 * --------------------------------------------------------------------------------------------------
 * 限制性能低的QueryParser
 * 继承QueryParser类并重载相应方法，比如getFuzzyQuery和getWildcardQuery
 * 这样造成的结果就是，当输入普通的搜索表达式时，如'I AND Haerbin'可以正常搜索
 * 但输入'name:Jadk~'或者'name:Ja??er'时，就会执行到重载方法中，这时就可以自行处理了，比如本例中禁止该功能
 * --------------------------------------------------------------------------------------------------
 * 扩展基于数字和日期的查询
 * 思路就是继承QueryParser类后重载getRangeQuery()方法
 * 再针对数字和日期的'域'，做特殊处理（使用NumericRangeQuery.newIntRange()方法来搜索）
 * --------------------------------------------------------------------------------------------------
 * Created by 玄玉<https://jadyer.github.io/> on 2013/08/06 16:13.
 */
public class MyQueryParser extends QueryParser {
    public MyQueryParser(Version matchVersion, String f, Analyzer a) {
        super(matchVersion, f, a);
    }

    @Override
    protected Query getWildcardQuery(String field, String termStr) throws ParseException {
        throw new ParseException("由于性能原因，已禁用通配符搜索，请输入更精确的信息进行搜索 ^_^ ^_^");
    }

    @Override
    protected Query getFuzzyQuery(String field, String termStr, float minSimilarity) throws ParseException {
        throw new ParseException("由于性能原因，已禁用模糊搜索，请输入更精确的信息进行搜索 ^_^ ^_^");
    }

    @Override
    protected Query getRangeQuery(String field, String part1, String part2, boolean inclusive) throws ParseException {
        if(field.equals("size")){
            //默认的QueryParser.parse(String query)表达式中并不支持'size:[20 TO 80]'数字的域值
            //这样一来，针对数字的域值进行特殊处理，那么QueryParser表达式就支持数字了
            return NumericRangeQuery.newIntRange(field, Integer.parseInt(part1), Integer.parseInt(part2), inclusive, inclusive);
        }else if(field.equals("date")){
            String regex = "\\d{8}";
            String dateType = "yyyyMMdd";
            if(Pattern.matches(regex, part1) && Pattern.matches(regex, part2)){
                SimpleDateFormat sdf = new SimpleDateFormat(dateType);
                try {
                    long min = sdf.parse(part1).getTime();
                    long max = sdf.parse(part2).getTime();
                    //使之支持日期的检索，应用时直接QueryParser.parse("date:[20130407 TO 20130701]")
                    return NumericRangeQuery.newLongRange(field, min, max, inclusive, inclusive);
                } catch (java.text.ParseException e) {
                    e.printStackTrace();
                }
            }else{
                throw new ParseException("Unknown date format, please use '" + dateType + "'");
            }
        }
        //如没找到匹配的Field域，那么返回默认的TermRangeQuery
        return super.getRangeQuery(field, part1, part2, inclusive);
    }
}
```