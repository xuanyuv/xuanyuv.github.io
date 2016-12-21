---
layout: post
title: "Lucene系列第07节之高级搜索之Filter"
categories: Lucene
tags: lucene
author: 玄玉
excerpt: 介绍Lucene-3.6.2中高级搜索里面的排序用法。
---

* content
{:toc}


下面演示的是`Lucene-3.6.2`中搜索的时候，使用`普通Filter`和`自定义Filter`的用法（详见代码注释）

```java
package com.jadyer.lucene;
import java.io.File;
import java.io.IOException;
import java.text.ParseException;
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
import org.apache.lucene.search.Filter;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.Version;
import com.jadyer.custom.MyFilter;

/**
 * Lucene系列第07节之高级搜索之Filter
 * Created by 玄玉<https://jadyer.github.io/> on 2013/08/19 11:13.
 */
public class AdvancedSearchByFilter {
    private Directory directory;
    private IndexReader reader;

    public AdvancedSearchByFilter(){
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
                //为每个文档添加一个fileID（与ScoreDoc.doc不同），其专门在自定义Filter时使用
                doc.add(new Field("fileID", String.valueOf(i), Field.Store.YES, Field.Index.NOT_ANALYZED_NO_NORMS));
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
     * 搜索过滤
     */
    public void searchByFilter(String expr, Filter filter){
        IndexSearcher searcher = new IndexSearcher(this.getIndexReader());
        QueryParser parser = new QueryParser(Version.LUCENE_36, "content", new StandardAnalyzer(Version.LUCENE_36));
        TopDocs tds = null;
        try {
            if(null == filter){
                tds = searcher.search(parser.parse(expr), 10);
            }else{
                tds = searcher.search(parser.parse(expr), filter, 10);
            }
            for(ScoreDoc sd : tds.scoreDocs){
                Document doc = searcher.doc(sd.doc);
                System.out.print("文档编号=" + sd.doc + "  文档权值=" + doc.getBoost() + "  文档评分=" + sd.score + "   ");
                System.out.print("fileID=" + doc.get("fileID") + "  size=" + doc.get("size") + "  date=");
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
     * 测试一下过滤效果
     */
    public static void main(String[] args) throws ParseException {
        AdvancedSearchByFilter advancedSearch = new AdvancedSearchByFilter();
        ////过滤文件名首字母从'h'到'n'的记录（注意hn要小写）
        //advancedSearch.searchByFilter("Java", new TermRangeFilter("name", "h", "n", true, true));
        ////过滤文件大小在30到80以内的记录
        //advancedSearch.searchByFilter("Java", NumericRangeFilter.newIntRange("size", 30, 80, true, true));
        ////过滤文件日期在20130701 00:00:00到20130808 23:59:59之间的记录
        //Long min = Long.valueOf(new SimpleDateFormat("yyyyMMdd").parse("20130701").getTime());
        //Long max = Long.valueOf(new SimpleDateFormat("yyyyMMdd HH:mm:ss").parse("20130808 23:59:59").getTime());
        //advancedSearch.searchByFilter("Java", NumericRangeFilter.newLongRange("date", min, max, true, true));
        ////过滤文件名以'ja'打头的（注意ja要小写）
        //advancedSearch.searchByFilter("Java", new QueryWrapperFilter(new WildcardQuery(new Term("name", "ja*"))));
        //自定义Filter
        advancedSearch.searchByFilter("Java", new MyFilter());
    }
}
```

下面是自定义的`MyFilter.java`

```java
package com.jadyer.custom;
import java.io.IOException;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.Term;
import org.apache.lucene.index.TermDocs;
import org.apache.lucene.search.DocIdSet;
import org.apache.lucene.search.Filter;
import org.apache.lucene.util.OpenBitSet;

/**
 * 自定义Filter
 * -----------------------------------------------------------------------------------------------
 * 本例的应用场景
 * 假设很多的数据，然后删除了其中的某几条数据，此时在接受搜索请求时为保证不会搜索到已删除的数据
 * 那么可以更新索引，但更新索引会消耗很多时间（因为数据量大），而又要保证已删除的数据不会被搜索到
 * 此时就可以自定义Filter，原理即搜索过程中，当发现此记录为已删除记录，则不添加到返回的搜索结果集中
 * -----------------------------------------------------------------------------------------------
 * 自定义Filter步骤如下
 * 1)继承Filter类并重写getDocIdSet()方法
 * 2)根据实际过滤要求返回新的DocIdSet对象
 * -----------------------------------------------------------------------------------------------
 * DocIdSet小解
 * 这里Filter干的活其实就是创建一个DocIdSet，而DocIdSet其实就是一个数组，可以理解为其中只存放0或1的值
 * 每个搜索出来的Document都有一个文档编号，所以搜索出来多少个Document，那么DocIdSet中就会有多少条记录
 * 而DocIdSet中每一条记录的索引号与文档编号是一一对应的
 * 所以当DocIdSet中的记录为1时，则对应文档编号的Document就会被添加到TopDocs中，为0就会被过滤掉
 * -----------------------------------------------------------------------------------------------
 * Created by 玄玉<https://jadyer.github.io/> on 2013/08/06 19:28.
 */
public class MyFilter extends Filter {
    private static final long serialVersionUID = -8955061358165068L;

    //假设这是已删除记录的fileID值的集合
    private String[] deleteFileIDs = {"1", "3"};

    @Override
    public DocIdSet getDocIdSet(IndexReader reader) throws IOException {
        //创建一个DocIdSet的子类OpenBitSet（创建之后默认所有元素都是0），传的参数就是本次"搜索到的"元素数目
        OpenBitSet obs = new OpenBitSet(reader.maxDoc());
        //先把元素填满，即全部设置为1
        obs.set(0, reader.maxDoc());
        //用于保存已删除元素的文档编号
        int[] docs = new int[1];
        for(String deleteDataID : deleteFileIDs){
            //获取已删除元素对应的TermDocs
            TermDocs tds = reader.termDocs(new Term("fileID", deleteDataID));
            //将已删除元素的文档编号放到docs中，将其出现的频率放到freqs中，最后返回查询出来的元素数目
            int count = tds.read(docs, new int[1]);
            if(count == 1){
                //将这个位置docs[0]的元素删除
                obs.clear(docs[0]);
            }
        }
        return obs;
    }
}
```