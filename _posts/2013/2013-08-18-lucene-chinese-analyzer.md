---
layout: post
title: "Lucene系列第04节之中文分词器"
categories: Lucene
tags: lucene
author: 玄玉
excerpt: 介绍Lucene-3.6.2中的中文分词器的使用。
---

* content
{:toc}


## 简介

`Lucene-3.5`推荐的四大分词器：SimpleAnalyzer、StopAnalyzer、WhitespaceAnalyzer、StandardAnalyzer

这四大分词器有一个共同的抽象父类，此类有个方法`public final TokenStream tokenStream()`，即分词的一个流

**而分词流程大致有以下三个步骤**

1、将一组数据流java.io.Reader交给Tokenizer，由其将数据转换为一个个的语汇单元

2、通过大量的TokenFilter对已经分好词的数据进行过滤操作，最后产生TokenStream

3、通过TokenStream完成索引的存储

假设有这样的文本`how are you thank you`，实际它是以一个java.io.Reader传进分词器中

Lucene分词器处理完毕后，会把整个分词转换为TokenStream，这个TokenStream中就保存所有的分词信息

TokenStream有两个实现类：`Tokenizer`和`TokenFilter`

Tokenizer用于将一组数据划分为独立的语汇单元，即一个一个的单词，下面是它的一些子类

* KeywordTokenizer，不分词，传什么就索引什么
* StandardTokenizer，标准分词，它有一些较智能的分词操作，诸如将'jadyer@yeah.net'中的'yeah.net'当作一个分词流
* CharTokenizer，针对字符进行控制的，它还有两个子类WhitespaceTokenizer和LetterTokenizer
* WhitespaceTokenizer，使用空格进行分词，诸如将'Thank you,I am jadyer'会被分为4个词
* LetterTokenizer，基于文本单词的分词，它会根据标点符号来分词，诸如将'Thank you,I am jadyer'会被分为5个词
* LowerCaseTokenizer，它是LetterTokenizer的子类，它会将数据转为小写并分词

TokenFilter用于过滤语汇单元，下面是它的一些子类

* StopFilter，它会停用一些语汇单元
* LowerCaseFilter，将数据转换为小写
* StandardFilter，对标准输出流做一些控制
* PorterStemFilter，还原一些数据，比如将coming还原为come，将countries还原为country

## 举例

比如'how are you thank you'会被分词为'how'，'are'，'you'，'thank'，'you'合计5个语汇单元

那么应该保存什么东西，才能使以后在需要还原数据时保证正确的还原呢？

其实主要保存三个东西，如下所示

1、CharTermAttribute（Lucene-3.5以前叫TermAttribute）：保存相应词汇，这里保存的就是'how'，'are'，'you'，'thank'，'you'

2、OffsetAttribute：保存各词汇之间的偏移量（大致理解为顺序），比如'how'的首尾字母偏移量为0和3，'thank'为12和17

3、PositionIncrementAttribute：保存词与词之间的位置增量，比如'how'和'are'增量为1，'are'和'you'是1，'you'和'thank'也是1

　　　　　　　　　　　　　　　但是，假设'are'是停用词（StopFilter的效果），那么'how'和'you'之间的位置增量就变成了2

当我们查找某一个元素时，Lucene会先通过位置增量来取这个元素，但如果两个词的位置增量相同，会发生什么情况呢

假设还有一个单词'this'，它的位置增量和'how'是相同的

那么当我们在界面中搜索'this'时，也会搜到'how are you thank you'，这样就可以有效的做同义词了

目前非常流行的一个叫做`WordNet`的东西，就可以做同义词的搜索

## 中文分词

Lucene默认提供的众多分词器完全不适用中文，下面是一些常见的中文分词器

1、IK：官网为[https://code.google.com/p/ik-analyzer/](https://code.google.com/p/ik-analyzer/)

2、Paoding：庖丁解牛分词器，官网为[http://code.google.com/p/paoding](http://code.google.com/p/paoding)

3、MMSeg4j：据说它使用的是搜狗的词库，官网为[https://code.google.com/p/mmseg4j](https://code.google.com/p/mmseg4j)

下面介绍下MMSeg4j的使用

首先下载`mmseg4j-1.8.5.zip`并引入`mmseg4j-all-1.8.5-with-dic.jar`

然后在需要指定分词器的位置编写`new MMSegAnalyzer()`即可

补充：由于使用的mmseg4j-all-1.8.5-with-dic.jar中已自带了词典，所以直接new MMSegAnalyzer()就行

补充：若引入的是mmseg4j-all-1.8.5.jar，则应指明词典目录，比如new MMSegAnalyzer("D:\\Develop\\mmseg4j-1.8.5\\data")

　　　但若非要使用new MMSegAnalyzer()，则要将mmseg4j-1.8.5.zip自带的data目录拷入classpath下即可

一句话总结：直接引入mmseg4j-all-1.8.5-with-dic.jar就行了

## 代码

下面是示例代码

```java
package com.jadyer.lucene;
import java.io.IOException;
import java.io.StringReader;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.SimpleAnalyzer;
import org.apache.lucene.analysis.StopAnalyzer;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.WhitespaceAnalyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.apache.lucene.analysis.tokenattributes.OffsetAttribute;
import org.apache.lucene.analysis.tokenattributes.PositionIncrementAttribute;
import org.apache.lucene.analysis.tokenattributes.TypeAttribute;
import org.apache.lucene.util.Version;
import com.chenlb.mmseg4j.analysis.ComplexAnalyzer;
import com.chenlb.mmseg4j.analysis.MMSegAnalyzer;

/**
 * Lucene系列第04节之中文分词器
 * Created by 玄玉<http://jadyer.cn/> on 2013/08/18 17:43.
 */
public class HelloChineseAnalyzer {
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

    /**
     * 测试一下中文分词的效果
     */
    public static void main(String[] args) {
        String txt = "我来自中国黑龙江省哈尔滨市";
        displayTokenInfo(txt, new StandardAnalyzer(Version.LUCENE_36), false);
        displayTokenInfo(txt, new StopAnalyzer(Version.LUCENE_36), false);
        displayTokenInfo(txt, new SimpleAnalyzer(Version.LUCENE_36), false);
        displayTokenInfo(txt, new WhitespaceAnalyzer(Version.LUCENE_36), false);
        displayTokenInfo(txt, new MMSegAnalyzer(), false); //等价于new com.chenlb.mmseg4j.analysis.MaxWordAnalyzer()
        displayTokenInfo(txt, new com.chenlb.mmseg4j.analysis.SimpleAnalyzer(), false);
        displayTokenInfo(txt, new ComplexAnalyzer(), false);
    }
}
```