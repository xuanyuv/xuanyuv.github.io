---
layout: post
title: "Lucene系列第03节之常见搜索"
categories: Lucene
tags: lucene
author: 玄玉
excerpt: 介绍Lucene-3.6.2中的常见搜索用法。
---

* content
{:toc}


下面是示例代码

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
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.FuzzyQuery;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.NumericRangeQuery;
import org.apache.lucene.search.PhraseQuery;
import org.apache.lucene.search.PrefixQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TermRangeQuery;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.search.WildcardQuery;
import org.apache.lucene.search.BooleanClause.Occur;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.Version;

/**
 * Lucene系列第03节之常见搜索
 * Created by 玄玉<https://jadyer.github.io/> on 2013/08/18 16:20.
 */
public class HelloSearch {
    private Directory directory;
    private IndexReader reader;
    private String[] ids = {"1", "2", "3", "4", "5", "6"};
    private String[] names = {"Michael", "Scofield", "Tbag", "Jack", "Jade", "Jadyer"};
    private String[] emails = {"aa@jadyer.us", "bb@jadyer.cn", "cc@jadyer.cc", "dd@jadyer.tw", "ee@jadyer.hk", "ff@jadyer.me"};
    private String[] contents = {"my java blog is http://blog.csdn.net/jadyer", "my website is http://www.jadyer.cn", "my name is jadyer", "I am JavaDeveloper", "I am from Haerbin", "I like Lucene"};
    private int[] attachs = {9,3,5,4,1,2};
    private Date[] dates = new Date[ids.length];

    public HelloSearch(){
        IndexWriter writer = null;
        Document doc = null;
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
        try {
            dates[0] = sdf.parse("20120601");
            dates[1] = sdf.parse("20120603");
            dates[2] = sdf.parse("20120605");
            dates[3] = sdf.parse("20120607");
            dates[4] = sdf.parse("20120609");
            dates[5] = sdf.parse("20120611");
            directory = FSDirectory.open(new File("myExample/03_index/"));
            writer = new IndexWriter(directory, new IndexWriterConfig(Version.LUCENE_36, new StandardAnalyzer(Version.LUCENE_36)));
            //创建索引之前，先把文档清空掉
            writer.deleteAll();
            //遍历ID来创建文档
            for(int i=0; i<ids.length; i++){
                doc = new Document();
                doc.add(new Field("id", ids[i], Field.Store.YES, Field.Index.NOT_ANALYZED_NO_NORMS));
                doc.add(new Field("name", names[i], Field.Store.YES, Field.Index.ANALYZED_NO_NORMS));
                doc.add(new Field("email", emails[i], Field.Store.YES, Field.Index.NOT_ANALYZED));
                doc.add(new Field("email", "test"+i+""+i+"@jadyer.com", Field.Store.YES, Field.Index.NOT_ANALYZED));
                doc.add(new Field("content", contents[i], Field.Store.NO, Field.Index.ANALYZED));
                //为数字加索引（第三个参数指定是否索引）
                doc.add(new NumericField("attach", Field.Store.YES, true).setIntValue(attachs[i]));
                //假设有多个附件
                doc.add(new NumericField("attach", Field.Store.YES, true).setIntValue((i+1)*100));
                //为日期加索引
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
     * 针对分页搜索创建索引
     */
    public HelloSearch(boolean pageFlag){
        String[] myNames = new String[50];
        String[] myContents = new String[50];
        for(int i=0; i<50; i++){
            myNames[i] = "file(" + i + ")";
            myContents[i] = "I love JavaSE, also love Lucene(" + i + ")";
        }
        IndexWriter writer = null;
        Document doc = null;
        try {
            directory = FSDirectory.open(new File("myExample/03_index/"));
            writer = new IndexWriter(directory, new IndexWriterConfig(Version.LUCENE_36, new StandardAnalyzer(Version.LUCENE_36)));
            writer.deleteAll();
            for(int i=0; i<myNames.length; i++){
                doc = new Document();
                doc.add(new Field("myname", myNames[i], Field.Store.YES, Field.Index.NOT_ANALYZED_NO_NORMS));
                doc.add(new Field("mycontent", myContents[i], Field.Store.YES, Field.Index.ANALYZED));
                writer.addDocument(doc);
            }
        } catch (IOException e) {
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
     * @param query 搜索的Query对象
     */
    private void doSearch(Query query){
        IndexSearcher searcher = this.getIndexSearcher();
        try {
            //第二个参数指定搜索后显示的最多的记录数，其与tds.totalHits没有联系
            TopDocs tds = searcher.search(query, 10);
            System.out.println("本次搜索到[" + tds.totalHits + "]条记录");
            for(ScoreDoc sd : tds.scoreDocs){
                Document doc = searcher.doc(sd.doc);
                System.out.print("文档编号="+sd.doc+"  文档权值="+doc.getBoost()+"  文档评分="+sd.score+"    ");
                System.out.print("id="+doc.get("id")+"  email="+doc.get("email")+"  name="+doc.get("name")+"  ");
                //获取多个同名域的方式
                String[] attachValues = doc.getValues("attach");
                for(String attach : attachValues){
                    System.out.print("attach=" + attach + "  ");
                }
                System.out.println();
            }
        } catch (IOException e) {
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
     * 精确匹配搜索
     * @param fieldName 域名（相当于表的字段名）
     * @param keyWords  搜索的关键字
     */
    public void searchByTerm(String fieldName, String keyWords){
        Query query = new TermQuery(new Term(fieldName, keyWords));
        this.doSearch(query);
    }

    /**
     * 基于范围的搜索
     * @param fieldName 域名（相当于表的字段名）
     * @param start     开始字符
     * @param end       结束字符
     */
    public void searchByTermRange(String fieldName, String start, String end){
        //后面两个参数用于指定开区间或闭区间
        Query query = new TermRangeQuery(fieldName, start, end, true, true);
        this.doSearch(query);
    }

    /**
     * 针对数字的搜索
     */
    public void searchByNumericRange(String fieldName, int min, int max){
        Query query = NumericRangeQuery.newIntRange(fieldName, min, max, true, true);
        this.doSearch(query);
    }

    /**
     * 基于前缀的搜索（它是对Field分词后的结果进行前缀查找的结果）
     */
    public void searchByPrefix(String fieldName, String prefix){
        Query query = new PrefixQuery(new Term(fieldName, prefix));
        this.doSearch(query);
    }

    /**
     * 基于通配符的搜索
     * @param wildcard *：任意多个字符，?：一个字符
     */
    public void searchByWildcard(String fieldName, String wildcard){
        Query query = new WildcardQuery(new Term(fieldName, wildcard));
        this.doSearch(query);
    }

    /**
     * 模糊搜索（与通配符搜索不同）
     */
    public void searchByFuzzy(String fieldName, String fuzzy){
        Query query = new FuzzyQuery(new Term(fieldName, fuzzy));
        this.doSearch(query);
    }

    /**
     * 多条件搜索（本例中搜索name值中以Ja开头，且content中包含am的内容）
     */
    public void searchByBoolean(){
        BooleanQuery query = new BooleanQuery();
        //Occur.MUST表示此条件必须为true，Occur.MUST_NOT表示此条件必须为false，Occur.SHOULD表示此条件非必须
        query.add(new WildcardQuery(new Term("name", "Ja*")), Occur.MUST);
        query.add(new TermQuery(new Term("content", "am")), Occur.MUST);
        this.doSearch(query);
    }

    /**
     * 短语搜索（很遗憾的是短语查询对中文搜索没有太大的作用，但对英文搜索是很好用的，但它的开销比较大，尽量少用）
     */
    public void searchByPhrase(){
        PhraseQuery query = new PhraseQuery();
        query.setSlop(1);                          //设置跳数
        query.add(new Term("content", "am"));      //第一个Term
        query.add(new Term("content", "Haerbin")); //产生距离之后的第二个Term
        this.doSearch(query);
    }

    /**
     * 基于QueryParser的搜索
     */
    public void searchByQueryParse(){
        QueryParser parser = new QueryParser(Version.LUCENE_36, "content", new StandardAnalyzer(Version.LUCENE_36));
        Query query = null;
        try {
            //query = parser.parse("Haerbin");           //搜索content中包含[Haerbin]的记录
            //query = parser.parse("I AND Haerbin");     //搜索content中包含[I]和[Haerbin]的记录
            //query = parser.parse("Lucene OR Haerbin"); //搜索content中包含[Lucene]或者[Haerbin]的记录
            //query = parser.parse("Lucene Haerbin");    //搜索content中包含[Lucene]或者[Haerbin]的记录
            //parser.setDefaultOperator(Operator.AND);   //将空格的默认操作OR修改为AND
            ////1)如果name域在索引时，不进行分词，那么无论这里写成[name:Jadyer]还是[name:jadyer]，最后得到的都是0条记录
            ////2)由于name原值为大写[J]，若索引时不对name分词，除非修改name原值为小写[j]，并且搜索[name:jadyer]才能得到记录
            //query = parser.parse("name:Jadyer");       //修改搜索域为name=Jadyer的记录
            //query = parser.parse("name:Ja*");          //支持通配符
            //query = parser.parse("\"I am\"");          //搜索content中包含[I am]的记录（注意不能使用parse("content:'I am'")）
            //parser.setAllowLeadingWildcard(true);      //设置允许[*]或[?]出现在查询字符的第一位，即[name:*de]，否则[name:*de]会报异常
            //query = parser.parse("name:*de");          //Lucene默认的第一个字符不允许为通配符，因为这样效率比较低
            ////parse("+am +name:Jade")--------------------搜索content中包括[am]的，并且name=Jade的记录
            ////parse("am AND NOT name:Jade")--------------搜索content中包括[am]的，并且nam不是Jade的记录
            ////parse("(blog OR am) AND name:Jade")--------搜索content中包括[blog]或者[am]的，并且name=Jade的记录
            //query = parser.parse("-name:Jack +I");     //搜索content中包括[I]的，并且name不是Jack的记录（加减号要放到域说明的前面）
            //query = parser.parse("id:[1 TO 3]");       //搜索id值从1到3的记录（TO必须大写，且这种方式没有办法匹配数字）
            //query = parser.parse("id:{1 TO 3}");       //搜索id=2的记录
            query = parser.parse("name:Jadk~");          //模糊搜索
        } catch (ParseException e) {
            e.printStackTrace();
        }
        this.doSearch(query);
    }

    /**
     * 普通的分页搜索（适用于lucene3.5之前）
     * @param expr      搜索表达式
     * @param pageIndex 页码
     * @param pageSize  分页大小
     */
    public void searchPage(String expr, int pageIndex, int pageSize){
        IndexSearcher searcher = this.getIndexSearcher();
        QueryParser parser = new QueryParser(Version.LUCENE_36, "mycontent", new StandardAnalyzer(Version.LUCENE_36));
        try {
            Query query = parser.parse(expr);
            TopDocs tds = searcher.search(query, pageIndex*pageSize);
            ScoreDoc[] sds = tds.scoreDocs;
            for(int i=(pageIndex-1)*pageSize; i<pageIndex*pageSize; i++){
                Document doc = searcher.doc(sds[i].doc);
                System.out.println("文档编号:" + sds[i].doc + "-->" + doc.get("myname") + "-->" + doc.get("mycontent"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
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
     * 基于searchAfter的分页搜索（适用于Lucene3.5）
     * @param expr      搜索表达式
     * @param pageIndex 页码
     * @param pageSize  分页大小
     */
    public void searchPageByAfter(String expr, int pageIndex, int pageSize){
        IndexSearcher searcher = this.getIndexSearcher();
        QueryParser parser = new QueryParser(Version.LUCENE_36, "mycontent", new StandardAnalyzer(Version.LUCENE_36));
        try {
            Query query = parser.parse(expr);
            TopDocs tds = searcher.search(query, (pageIndex-1)*pageSize);
            //使用IndexSearcher.searchAfter()搜索，该方法第一个参数为上一页记录中的最后一条记录
            if(pageIndex > 1){
                tds = searcher.searchAfter(tds.scoreDocs[(pageIndex-1)*pageSize-1], query, pageSize);
            }else{
                tds = searcher.searchAfter(null, query, pageSize);
            }
            for(ScoreDoc sd : tds.scoreDocs){
                Document doc = searcher.doc(sd.doc);
                System.out.println("文档编号:" + sd.doc + "-->" + doc.get("myname") + "-->" + doc.get("mycontent"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if(null != searcher){
                try {
                    searcher.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

下面是`JUnit4.x`编写的测试

```java
package com.jadyer.test;
import java.io.File;
import org.junit.Before;
import org.junit.Test;
import com.jadyer.lucene.HelloSearch;

public class HelloSearchTest {
    private HelloSearch hello;

    @Before
    public void init(){
        hello = new HelloSearch();
    }

    @Test
    public void searchByTerm(){
        hello.searchByTerm("content", "my");
    }

    @Test
    public void searchByTermRange(){
        hello.searchByTermRange("name", "M", "o");
    }

    @Test
    public void searchByNumericRange(){
        hello.searchByNumericRange("attach", 2, 5);
    }

    @Test
    public void searchByPrefix(){
        hello.searchByPrefix("content", "b");
    }

    @Test
    public void searchByWildcard(){
        hello.searchByWildcard("name", "Ja??er");
    }

    @Test
    public void searchByFuzzy(){
        hello.searchByFuzzy("name", "Jadk");
    }

    @Test
    public void searchByBoolean(){
        hello.searchByBoolean();
    }

    @Test
    public void searchByPhrase(){
        hello.searchByPhrase();
    }

    @Test
    public void searchByQueryParse(){
        hello.searchByQueryParse();
    }

    @Test
    public void searchPage(){
        for(File file : new File("myExample/03_index/").listFiles()){
            file.delete();
        }
        hello = new HelloSearch(true);
        hello.searchPage("mycontent:javase", 2, 10);
    }

    @Test
    public void searchPageByAfter(){
        for(File file : new File("myExample/03_index/").listFiles()){
            file.delete();
        }
        hello = new HelloSearch(true);
        hello.searchPageByAfter("mycontent:javase", 3, 10);
    }
}
```