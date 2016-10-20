---
layout: post
title: "Java操作MongoDB-2.6的常见API"
categories: MongoDB
tags: java api mongodb
author: 玄玉
excerpt: 详细介绍了MongoDB-2.6版本的，Java驱动的常见API用法。
---

* content
{:toc}


对于MongoDB而言，学习方式和学习关系型数据库差不太多

开始都是学习如何insert、find、update、remove

然后就是分页、排序、索引，再接着就是主从复制、副本集、分片等等

最后就是通过它提供的各个驱动（比如Java、PHP、node.js等等）来练习所谓的高级用法

另外：MongoDB也有一款图形化操作工具，叫做MongoVUE

好，回到正文

下面演示的就是以Java为例，常见的操作MongoDB-2.6的API

```java
package com.jadyer.test;

import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;

import org.bson.types.ObjectId;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;
import com.mongodb.WriteResult;
import com.mongodb.util.JSON;

/**
 * mongoDB的Java驱动测试
 * @see ----------------------------------------------------------------------------------------
 * @see 配置
 * @see 1)下载https://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-2.6.1.zip
 * @see 2)解压到本地硬盘D:\Develop\mongoDB\中,并配置环境变量path=D:\Develop\mongoDB\bin
 * @see   然后在CMD下执行此命令验证安装成功与否>mongod --version
 * @see 3)建立D:\Develop\mongoDBData\文件夹,用于存放mongoDB数据文件
 * @see 4)自定义bat文件,分别用于启动mongoDB数据库和连接数据库的客户端
 * @see   启动客户端的mongo_client.bat内容为-->mongo 127.0.0.1:27017/admin
 * @see   启动数据库的mongo_db.bat内容为------>mongod --dbpath D:\Develop\mongoDBData --rest
 * @see   注:加入[--rest]参数是为了能够访问mongoDB的Web控制台http://127.0.0.1:28017/
 * @see ----------------------------------------------------------------------------------------
 * @see Java驱动
 * @see 这里要用到mongoDB的Java驱动包,下载地址http://docs.mongodb.org/ecosystem/drivers/java/
 * @see ----------------------------------------------------------------------------------------
 * @create May 15, 2014 10:17:30 PM
 * @author 玄玉<http://blog.csdn.net/jadyer>
 */
public class MongoDBTest {
    private static MongoClient mongoClient;
    private static DB db;

    /**
     * 建立数据库连接
     */
    @BeforeClass
    public static void globalInit(){
        try {
            //mongoClient = new MongoClient(Arrays.asList(new ServerAddress("127.0.0.1", 27017), new ServerAddress("127.0.0.1", 27018), new ServerAddress("127.0.0.1", 27019)));
            mongoClient = new MongoClient("127.0.0.1", 27017);
        } catch (UnknownHostException e) {
            System.err.println("mongoDB主机地址有误");
        }
        db = mongoClient.getDB("mydemo");
    }


    /**
     * 销毁数据库连接
     */
    @AfterClass
    public static void globalDestroy(){
        mongoClient.close();
    }


    /**
     * 获取数据库信息
     */
    @Test
    public void getMetaData(){
        //查询数据库中所有的集合名称
        for(String collectionName : db.getCollectionNames()){
            System.out.println("mydemo数据库所拥有的集合为:[" + collectionName + "]");
        }
        //查询某一集合中的数据
        DBCollection collection = db.getCollection("person");
        DBCursor cursor = collection.find();
        try{
            while(cursor.hasNext()){
                System.out.println("person集合所拥有的name为--[" + cursor.next().get("name") + "]");
            }
        }finally{
            cursor.close();
        }
        System.out.println("person集合中的记录数为----------->" + cursor.count());
        System.out.println("person集合数据格式化后的JSON串为-->" + JSON.serialize(cursor));
    }


    /**
     * 创建一个空的"moive"集合
     */
    @Test
    public void createCollection(){
        db.createCollection("movie", new BasicDBObject());
    }


    /**
     * 为"moive"集合添加文档
     */
    @Test
    public void insertDocument(){
        DBObject doc = new BasicDBObject();
        doc.put("name", "24");
        doc.put("season", "ninth");
        doc.put("score", 88);
        List<String> actorList = new ArrayList<String>();
        actorList.add("Jack Bauer");
        actorList.add("Counter Terrorist Unit");
        doc.put("actor", actorList);
        db.getCollection("movie").insert(doc);
    }


    /**
     * 批量插入文档
     */
    @Test
    public void insertBatchDocument(){
        List<DBObject> docList = new ArrayList<DBObject>();
        DBObject doc11 = new BasicDBObject("name", "Prison Break").append("season", "fourth").append("score", 99);
        DBObject doc22 = new BasicDBObject("name", "Game of Thrones").append("season", "third").append("score", 92);
        docList.add(doc11);
        docList.add(doc22);
        db.getCollection("movie").insert(docList);
    }


    /**
     * 根据_id删除数据
     */
    @Test
    public void deleteById(){
        WriteResult result = db.getCollection("movie").remove(new BasicDBObject("_id", new ObjectId("5374c6dc5030e0ea4dac8907")));
        System.out.println("本次操作影响的记录条数为:" + result.getN());
    }


    /**
     * 根据条件删除数据
     */
    @Test
    public void deleteByData(){
        DBObject doc = new BasicDBObject();
        doc.put("name", "Prison Break");
        WriteResult result = db.getCollection("movie").remove(doc);
        System.out.println("本次操作影响的记录条数为:" + result.getN());
    }


    /**
     * 更新数据
     * @see 增加email属性
     */
    @Test
    public void update(){
        DBObject doc = new BasicDBObject();
        doc.put("$set", new BasicDBObject("email", "Jadyer@yeah.net"));
        WriteResult result = db.getCollection("movie").update(new BasicDBObject(), doc, false, true);
        System.out.println("本次操作影响的记录条数为:" + result.getN());
    }


    /**
     * 查询"moive"集合中的key
     */
    @Test
    public void getKey(){
        DBObject keys = new BasicDBObject();
        keys.put("_id", false);
        keys.put("name", true);
        //keys.put("score", true);
        //第一个参数表示查询条件,第二个参数表示返回的具体key
        DBCursor cursor = db.getCollection("movie").find(null, keys);
        try{
            while(cursor.hasNext()){
                DBObject object = cursor.next();
                System.out.println("查询到的name=" + object.get("name") + ", score=" + object.get("score"));
            }
        }finally{
            cursor.close();
        }
    }


    /**
     * 查询"moive"集合中分数不超过95的key
     */
    @Test
    public void getKeyUseScore(){
        DBObject ref = new BasicDBObject();
        ref.put("score", new BasicDBObject("$lte", 95));
        DBCursor cursor = db.getCollection("movie").find(ref, null);
        try{
            while(cursor.hasNext()){
                DBObject object = cursor.next();
                System.out.println("查询到的name=" + object.get("name") + ", score=" + object.get("score"));
            }
        }finally{
            cursor.close();
        }
    }


    /**
     * 分页查询
     */
    @Test
    public void limitSkip(){
        DBCursor cursor = db.getCollection("movie").find(null, null);
        cursor.limit(0).skip(1);
        try{
            while(cursor.hasNext()){
                DBObject object = cursor.next();
                System.out.println("查询到的name=" + object.get("name"));
            }
        }finally{
            cursor.close();
        }
    }
}
```