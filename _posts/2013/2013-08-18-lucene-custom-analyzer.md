---
layout: post
title: "Lucene系列第05节之自定义停用词和同义词分词器"
categories: Lucene
tags: lucene
author: 玄玉
excerpt: 介绍Lucene-3.6.2中自定义停用词和同义词分词器。
---

* content
{:toc}


这里主要演示的是`Lucene-3.6.2`中自定义停用词分词器和同义词分词器的用法

下面是示例代码

首先是用于显示分词信息的`HelloCustomAnalyzer.java`

```java
package com.jadyer.lucene;
import java.io.IOException;
import java.io.StringReader;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.apache.lucene.analysis.tokenattributes.OffsetAttribute;
import org.apache.lucene.analysis.tokenattributes.PositionIncrementAttribute;
import org.apache.lucene.analysis.tokenattributes.TypeAttribute;

/**
 * Lucene系列第05节之自定义停用词和同义词分词器
 * Created by 玄玉<https://jadyer.cn/> on 2013/08/18 18:10.
 */
public class HelloCustomAnalyzer {
    /**
     * 查看分词信息
     * -----------------------------------------------------------------------------------
     * TokenStream还有两个属性，分别为FlagsAttribute和PayloadAttribute，都是开发时用的
     * FlagsAttribute----标注位属性
     * PayloadAttribute--做负载的属性，用来检测是否已超过负载，超过则可以决定是否停止搜索等等
     * -----------------------------------------------------------------------------------
     * @param txt        待分词的字符串
     * @param analyzer   所使用的分词器
     * @param displayAll 是否显示所有的分词信息
     */
    public static void displayTokenInfo(String txt, Analyzer analyzer, boolean displayAll){
        //第一个参数没有任何意义，可以随便传一个值，它只是为了显示分词
        //这里就是使用指定的分词器将'txt'分词，分词后会产生一个TokenStream（可将分词后的每个单词理解为一个Token）
        TokenStream stream = analyzer.tokenStream("此参数无意义", new StringReader(txt));
        //用于查看每一个语汇单元的信息，即分词的每一个元素
        //这里创建的属性会被添加到TokenStream流中，并随着TokenStream而增加（此属性就是用来装载每个Token的，即分词后的每个单词）
        //当调用TokenStream.incrementToken()时，就会指向到这个单词流中的第一个单词，即此属性代表的就是分词后的第一个单词
        //可以形象的理解成一只碗，用来盛放TokenStream中每个单词的碗，每调用一次incrementToken()后，这个碗就会盛放流中的下一个单词
        CharTermAttribute cta = stream.addAttribute(CharTermAttribute.class);
        //用于查看位置增量（指的是语汇单元之间的距离，可理解为元素与元素之间的空格，即间隔的单元数）
        PositionIncrementAttribute pia = stream.addAttribute(PositionIncrementAttribute.class);
        //用于查看每个语汇单元的偏移量
        OffsetAttribute oa = stream.addAttribute(OffsetAttribute.class);
        //用于查看使用的分词器的类型信息
        TypeAttribute ta = stream.addAttribute(TypeAttribute.class);
        try {
            if(displayAll){
                //等价于while(stream.incrementToken())
                for(; stream.incrementToken() ;){
                    System.out.print(ta.type() + " " + pia.getPositionIncrement());
                    System.out.println(" [" + oa.startOffset() + "-" + oa.endOffset() + "] [" + cta + "]");
                }
            }else{
                System.out.println();
                while(stream.incrementToken()){
                    System.out.print("[" + cta + "]");
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

下面是自定义的停用词分词器`MyStopAnalyzer.java`

```java
package com.jadyer.analysis;
import java.io.Reader;
import java.util.Set;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.LetterTokenizer;
import org.apache.lucene.analysis.LowerCaseFilter;
import org.apache.lucene.analysis.StopAnalyzer;
import org.apache.lucene.analysis.StopFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.util.Version;

/**
 * 自定义的停用词分词器（这里主要用来过滤忽略大小写的指定的字符串）
 * Created by 玄玉<https://jadyer.cn/> on 2013/08/05 13:55.
 */
public class MyStopAnalyzer extends Analyzer {
    //存放停用的分词信息
    private Set<Object> stopWords;

    /**
     * 自定义的用于过滤指定字符串的分词器
     * @param _stopWords 用于指定所要过滤的忽略大小写的字符串
     */
    public MyStopAnalyzer(String[] _stopWords){
        //会自动将字符串数组转换为Set
        stopWords = StopFilter.makeStopSet(Version.LUCENE_36, _stopWords, true);
        //将原有的停用词加入到现在的停用词中
        stopWords.addAll(StopAnalyzer.ENGLISH_STOP_WORDS_SET);
    }

    @Override
    public TokenStream tokenStream(String fieldName, Reader reader) {
        //为这个分词器设定过滤器链和Tokenizer
        return new StopFilter(Version.LUCENE_36,
            //这里就可以存放很多的TokenFilter
            new LowerCaseFilter(Version.LUCENE_36, new LetterTokenizer(Version.LUCENE_36, reader)),
            stopWords);
    }
}
```

下面是自定义的同义词分词器`MySynonymAnalyzer.java`

```java
package com.jadyer.analysis;
import java.io.IOException;
import java.io.Reader;
import java.util.HashMap;
import java.util.Map;
import java.util.Stack;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.apache.lucene.analysis.tokenattributes.PositionIncrementAttribute;
import org.apache.lucene.util.AttributeSource;
import com.chenlb.mmseg4j.ComplexSeg;
import com.chenlb.mmseg4j.Dictionary;
import com.chenlb.mmseg4j.analysis.MMSegTokenizer;

/**
 * 自定义的同义词分词器
 * Created by 玄玉<https://jadyer.cn/> on 2013/08/05 17:11.
 */
public class MySynonymAnalyzer extends Analyzer {
    @Override
    public TokenStream tokenStream(String fieldName, Reader reader) {
        //借助MMSeg4j实现自定义分词器，写法参考MMSegAnalyzer类的tokenStream()方法
        //但为了过滤并处理分词后的各个语汇单元，以达到同义词分词器的功能，故自定义一个TokenFilter
        //实际执行流程就是字符串的Reader首先进入MMSegTokenizer，由其进行分词，分词完毕后进入自定义的MySynonymTokenFilter
        //然后在MySynonymTokenFilter中添加同义词
        return new MySynonymTokenFilter(new MMSegTokenizer(new ComplexSeg(Dictionary.getInstance()), reader));
    }
}

/**
 * 自定义的TokenFilter
 * Created by 玄玉<https://jadyer.cn/> on 2013/08/05 17:11.
 */
class MySynonymTokenFilter extends TokenFilter {
    private CharTermAttribute cta;            //用于获取TokenStream中的语汇单元
    private PositionIncrementAttribute pia;   //用于获取TokenStream中的位置增量
    private AttributeSource.State tokenState; //用于保存语汇单元的状态
    private Stack<String> synonymStack;       //用于保存同义词

    protected MySynonymTokenFilter(TokenStream input) {
        super(input);
        this.cta = this.addAttribute(CharTermAttribute.class);
        this.pia = this.addAttribute(PositionIncrementAttribute.class);
        this.synonymStack = new Stack<String>();
    }

    /**
     * 判断是否存在同义词
     */
    private boolean isHaveSynonym(String name){
        //先定义同义词的词典
        Map<String, String[]> synonymMap = new HashMap<String, String[]>();
        synonymMap.put("我", new String[]{"咱", "俺"});
        synonymMap.put("中国", new String[]{"兲朝", "大陆"});
        if(synonymMap.containsKey(name)){
            for(String str : synonymMap.get(name)){
                this.synonymStack.push(str);
            }
            return true;
        }
        return false;
    }

    @Override
    public boolean incrementToken() throws IOException {
        while(this.synonymStack.size() > 0){
            restoreState(this.tokenState); //将状态还原为上一个元素的状态
            cta.setEmpty();
            cta.append(this.synonymStack.pop()); //获取并追加同义词
            pia.setPositionIncrement(0);         //设置位置增量为0
            return true;
        }
        if(input.incrementToken()){
            //注意：当发现当前元素存在同义词之后，不能立即追加同义词，即不能在目标元素上直接处理
            if(this.isHaveSynonym(cta.toString())){
                //存在同义词时，则捕获并保存当前状态
                this.tokenState = captureState();
            }
            return true;
        }else {
            //只要TokenStream中没有元素，就返回false
            return false;
        }
    }
}
```

最后是`JUnit4.x`写的测试

```java
package com.jadyer.test;
import org.apache.lucene.analysis.StopAnalyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.RAMDirectory;
import org.apache.lucene.util.Version;
import org.junit.Test;
import com.jadyer.analysis.MyStopAnalyzer;
import com.jadyer.analysis.MySynonymAnalyzer;
import com.jadyer.lucene.HelloCustomAnalyzer;

public class HelloCustomAnalyzerTest {
    @Test
    public void stopAnalyzer(){
        String txt = "This is my house, I`m come from Haerbin, My email is jadyer@yeah.net";
        HelloCustomAnalyzer.displayTokenInfo(txt, new StandardAnalyzer(Version.LUCENE_36), false);
        HelloCustomAnalyzer.displayTokenInfo(txt, new StopAnalyzer(Version.LUCENE_36), false);
        HelloCustomAnalyzer.displayTokenInfo(txt, new MyStopAnalyzer(new String[]{"I", "EMAIL", "you"}), false);
    }

    @Test
    public void synonymAnalyzer(){
        String txt = "我来自中国黑龙江省哈尔滨市";
        IndexWriter writer = null;
        IndexSearcher searcher = null;
        Directory directory = new RAMDirectory();
        try {
            writer = new IndexWriter(directory, new IndexWriterConfig(Version.LUCENE_36, new MySynonymAnalyzer()));
            Document doc = new Document();
            doc.add(new Field("content", txt, Field.Store.YES, Field.Index.ANALYZED));
            writer.addDocument(doc);
            writer.close();
            //搜索前要确保IndexWriter已关闭，否则会报告org.apache.lucene.index.IndexNotFoundException: no segments* file found
            searcher = new IndexSearcher(IndexReader.open(directory));
            TopDocs tds = searcher.search(new TermQuery(new Term("content", "咱")), 10);
            for(ScoreDoc sd : tds.scoreDocs){
                System.out.println(searcher.doc(sd.doc).get("content"));
            }
            searcher.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        HelloCustomAnalyzer.displayTokenInfo(txt, new MySynonymAnalyzer(), true);
    }
}
```