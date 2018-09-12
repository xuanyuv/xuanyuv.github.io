---
layout: post
title: "Solr系列第03节之高亮"
categories: Solr
tags: solr
author: 玄玉
excerpt: 介绍Solr-3.6.2高亮显示搜索结果的方法。
---

* content
{:toc}


下面以`Solr-3.6.2`为例演示高亮的用法

```java
package com.jadyer.solrj;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrServer;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrInputDocument;

/**
 * Solr系列第03节之高亮
 * Created by 玄玉<https://jadyer.cn/> on 2013/08/20 13:50.
 */
public enum HelloSolrJHighLighter {
    INSTANCE;

    private SolrServer server;

    private HelloSolrJHighLighter(){
        //创建SolrServer对象，它有两个线程安全的子类EmbeddedSolrServer和CommonsHttpSolrServer
        //EmbeddedSolrServer-----内嵌式的，不需要启动Web服务器
        //CommonsHttpSolrServer--需要启动Web服务器，它是通过HTTP请求来获取数据的
        //CommonsHttpSolrServer已不推荐直接使用了，而是推荐使用HttpSolrServer类
        //同样的StreamingUpdateSolrServer也不推荐使用了，推荐使用ConcurrentUpdateSolrServer
        server = new HttpSolrServer("http://127.0.0.1:8088/solr");
        //添加索引
        this.addIndex();
    }

    /**
     * 添加索引
     * --------------------------------------------------------------------------------------------------
     * 这里之所以没有硬编码指定my_title和my_content的中文分词器
     * 是由于schema.xml中在定义这俩<field>时已通过type属性指定了中文分词器
     * 关于指定中文分词器的具体方法，详见https://jadyer.cn/2013/08/20/solr-search-chinese-analyzer/
     * --------------------------------------------------------------------------------------------------
     */
    private void addIndex(){
        try {
            //添加之前先删除全部索引，删除完记得commit才能生效
            server.deleteByQuery("*:*");
            server.commit();
        } catch (Exception e) {
            e.printStackTrace();
        }
        List<SolrInputDocument> docs = new ArrayList<SolrInputDocument>();
        for(int i=1; i<4; i++){
            SolrInputDocument doc = new SolrInputDocument();
            //对于Solr而言，默认的id是唯一的主键（如果我们没有自定义主键的话），当多次添加的时候，最后添加的相同id的域会覆盖已有的
            doc.addField("id", Integer.toString(i));
            //这里使用的是自定义的Field，所以就需要在schema.xml中为其添加<field>描述，并通过type属性指定其使用的分词器
            doc.addField("my_title", "这是我的第" + i + "个SolrJ程序");
            doc.addField("my_content", "my第" + i + "个SolrJ程序的运行情况");
            docs.add(doc);
        }
        try {
            //可以只添加一个Document，也可以一次添加多个Document，这里添加多个
            server.add(docs);
            //commit后方能生效，否则搜索到的还是add前的索引信息
            server.commit();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 搜索高亮
     */
    public void testHighLighter(){
        SolrQuery query = new SolrQuery("my_title:SolrJ");
        query.setHighlight(true).setHighlightSimplePre("<span style='color:red'>").setHighlightSimplePost("</span>");
        //设置高亮的区域，可设置多个区域
        //但有个前提：待高亮的信息必须是被存储的，即schema.xml中配置<field store="true">
        query.setParam("hl.fl", "my_title, my_content");
        QueryResponse resp = null;
        try {
            resp = server.query(query);
        } catch (SolrServerException e) {
            e.printStackTrace();
        }
        for(SolrDocument sd : resp.getResults()){
            Map<String, List<String>> snippetMap = resp.getHighlighting().get(sd.getFieldValue("id"));
            if(snippetMap!=null && !snippetMap.isEmpty()){
                List<String> snippetList = snippetMap.get("my_title");
                for(String snippet : snippetList){
                    System.out.print(snippet);
                }
                System.out.print("        ");
                //注意：如果在配置<field my_content multiValued="true"/>时指定其支持多值域
                //那么：此处获取到的就会是第一个值域的值
                snippetList = snippetMap.get("my_content");
                for(String snippet : snippetList){
                    System.out.println(snippet);
                }
            }
        }
    }

    /**
     * 测试一下SolrJ的高亮效果
     * --------------------------------------------------------------------------------
     * 测试前记得启动Web服务器
     * 关于Solr与Tomcat的整合，详见https://jadyer.cn/2013/08/20/solr-tomcat/
     * --------------------------------------------------------------------------------
     */
    public static void main(String[] args) {
        HelloSolrJHighLighter.INSTANCE.testHighLighter();
    }
}
```