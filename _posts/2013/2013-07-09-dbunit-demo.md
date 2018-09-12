---
layout: post
title: "DBUnit实现数据库测试"
categories: 单元测试
tags: dbunit demo
author: 玄玉
excerpt: 演示了数据库测试框架DBUnit的用法。
---

* content
{:toc}


直接演示代码，具体注意细节和用法，见代码注释。

首先是数据库SQL

```sql
# MySQL-Front 5.0  (Build 1.133)

# Host: 127.0.0.1    Database: jadyer
# ------------------------------------------------------
# Server version 5.5.25a

DROP DATABASE IF EXISTS `jadyer`;
CREATE DATABASE `jadyer` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `jadyer`;

#
# Table structure for table t_user
#

CREATE TABLE `t_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

#
# Dumping data for table t_user
#
LOCK TABLES `t_user` WRITE;
/*!40000 ALTER TABLE `t_user` DISABLE KEYS */;

INSERT INTO `t_user` VALUES (1,'admin','admin');
INSERT INTO `t_user` VALUES (2,'xuanyu','yuyu');
/*!40000 ALTER TABLE `t_user` ENABLE KEYS */;
UNLOCK TABLES;
```

下面是实体类`User.java`

```java
package com.jadyer.model;
public class User {
    private int id;
    private String username;
    private String password;
    /*-- 三个属性的setter和getter略 --*/
}
```

接下来是用于获取数据库连接的工具类`DBUtil.java`

```java
package com.jadyer.util;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * 用于获取数据库连接的工具类
 * @version v1.1
 * @history v1.1-->getConnection()支持手动传入数据库URL和用户密码
 * @history v1.0-->通过枚举实现的单例，创建工具类
 * Created by 玄玉<https://jadyer.cn/> on 2013/07/09 13:56.
 */
public enum DBUtil {
    INSTANCE;

    private static final String DB_DRIVER = "com.mysql.jdbc.Driver";
    private static final String DB_URL_MYSQL = "jdbc:mysql://127.0.0.1:3306/xuanyu?useUnicode=true&characterEncoding=UTF8&failOverReadOnly=false&zeroDateTimeBehavior=convertToNull";
    private static final String DB_URL_ORACLE = "jdbc:oracle:thin:@127.0.0.1:1521:xuanyu";
    private static final String DB_USERNAME = "scott";
    private static final String DB_PASSWORD = "xuanyu";

    DBUtil(){
        try {
            Class.forName(DB_DRIVER);
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("数据库驱动载入失败", e);
        }
    }


    public Connection getConnection(){
        return this.getConnection(DB_URL_MYSQL, DB_USERNAME, DB_PASSWORD);
    }


    public Connection getConnection(String url, String user, String password){
        try {
            return DriverManager.getConnection(url, user, password);
        } catch (SQLException e) {
            throw new RuntimeException("数据库连接创建失败", e);
        }
    }


    public void close(Connection conn){
        if(null != conn){
            try {
                conn.close();
                if(conn.isClosed()){
                    System.out.println("此数据库连接已关闭-->" + conn);
                }else{
                    System.err.println("此数据库连接关闭失败-->" + conn);
                }
            } catch (SQLException e) {
                System.err.println("数据库连接关闭失败，堆栈轨迹如下：");
                e.printStackTrace();
            }
        }
    }


    public void closeAll(ResultSet rs, PreparedStatement pstmt, Connection conn){
        if(null != rs){
            try {
                rs.close();
            } catch (SQLException e) {
                System.err.println("数据库操作的ResultSet关闭失败，堆栈轨迹如下：");
                e.printStackTrace();
            }
        }
        if(null != pstmt){
            try {
                pstmt.close();
            } catch (SQLException e) {
                System.err.println("数据库操作的PreparedStatement关闭失败，堆栈轨迹如下：");
                e.printStackTrace();
            }
        }
        this.close(conn);
    }
}
```

下面是数据库操作的`UserDaoJdbc.java`

```java
package com.jadyer.dao.jdbc;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import com.jadyer.model.User;
import com.jadyer.util.DBUtil;

public class UserDaoJdbc {
    public User load(String username){
        User user = new User();
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.INSTANCE.getConnection();
            System.out.println("UserDaoJdbc获取到数据库连接-->" + conn);
            pstmt = conn.prepareStatement("SELECT * FROM t_user WHERE username=?");
            pstmt.setString(1, username);
            rs = pstmt.executeQuery();
            if(rs.next()){
                user.setId(rs.getInt("id"));
                user.setUsername(rs.getString("username"));
                user.setPassword(rs.getString("password"));
            }else{
                System.out.println("查此无果");
            }
        } catch (SQLException e) {
            System.out.println("数据库查询时发生异常，堆栈轨迹如下");
            e.printStackTrace();
        } finally {
            DBUtil.INSTANCE.closeAll(rs, pstmt, conn);
        }
        return user;
    }
}
```

下面是`DBUnit`测试时用到的位于`test SourceFolder`目录下的`t_user.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<dataset>
    <!-- 根据表名编写节点标签，接下来构造数据就可以使用两种方式：子节点或属性 -->
    <!--
    <t_user>
        <id>2</id>
        <username>jadyer</username>
        <password>xuanyu</password>
    </t_user>
     -->
    <t_user id="2" username="jadyer" password="xuanyu"/>
</dataset>
```

最后是包含了`DBUnit`简单用法的测试用例`UserDaoTest.java`

```java
package com.jadyer.dao;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.sql.Connection;
import java.sql.SQLException;
import org.dbunit.DatabaseUnitException;
import org.dbunit.database.DatabaseConnection;
import org.dbunit.database.IDatabaseConnection;
import org.dbunit.database.QueryDataSet;
import org.dbunit.dataset.IDataSet;
import org.dbunit.dataset.xml.FlatXmlDataSet;
import org.dbunit.dataset.xml.FlatXmlProducer;
import org.dbunit.operation.DatabaseOperation;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.xml.sax.InputSource;
import com.jadyer.dao.jdbc.UserDaoJdbc;
import com.jadyer.model.User;
import com.jadyer.util.DBUtil;

/**
 * DBUnit使用步骤（下载地址为http://sourceforge.net/projects/dbunit/files/）
 * 1、导入DBUnit所需两个jar文件：dbunit.jar和slf4j-api.jar
 * 2、创建DBUnit用到的xml格式的测试数据，xml文件名建议与表名相同
 * 3、创建DBUnit的Connection和DataSet，然后开始进行各项测试工作
 * Created by 玄玉<https://jadyer.cn/> on 2013/07/09 13:56.
 */
public class UserDaoTest {
    private static Connection conn;
    private static IDatabaseConnection dbUnitConn;

    @BeforeClass
    public static void globalInit() {
        conn = DBUtil.INSTANCE.getConnection();
        System.out.println("DBUnit初始化时获取到数据库连接-->" + conn);
        try {
            //DBUnit中用来操作数据文件的Connection依赖于数据库连接的Connection
            dbUnitConn = new DatabaseConnection(conn);
        } catch (DatabaseUnitException e) {
            e.printStackTrace();
        }
    }

    @AfterClass
    public static void globalDestroy(){
        DBUtil.INSTANCE.close(conn);
        if(null != dbUnitConn){
            try {
                dbUnitConn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    ///**
    // * 备份数据库中所有表的数据
    // */
    //@Before
    //public void initAll() throws Exception {
    //    //此时所创建的DataSet包含了数据库中所有表的数据
    //    IDataSet dataSet = dbUnitConn.createDataSet();
    //    //备份数据库中所有表的数据
    //    FlatXmlDataSet.write(dataSet, new FileWriter("D:/AllBak.xml"));
    //}

    /**
     * 备份数据库中某一张或某几张表的数据
     */
    @Before
    public void init() throws Exception {
        //通过QueryDataSet可以有效的选择要处理的表来作为DataSet
        QueryDataSet dataSet = new QueryDataSet(dbUnitConn);
        //这里指定只备份t_user表中的数据，若想备份多个表，那就再addTable(tableName)
        dataSet.addTable("t_user");
        FlatXmlDataSet.write(dataSet, new FileWriter("userBak.xml"));
    }

    /**
     * 还原表数据
     */
    @After
    public void destroy() throws Exception {
        IDataSet dataSet = new FlatXmlDataSet(new FlatXmlProducer(new InputSource(new FileInputStream("userBak.xml"))));
        DatabaseOperation.CLEAN_INSERT.execute(dbUnitConn, dataSet);
    }

    /**
     * 测试查询方法
     */
    @Test
    public void testLoad() throws Exception {
        //FlatXmlDataSet用来获取基于属性存储的属性值
        //XmlDataSet用来获取基于节点类型存储的属性值
        IDataSet dataSet = new FlatXmlDataSet(new FlatXmlProducer(new InputSource(UserDaoTest.class.getClassLoader().getResourceAsStream("t_user.xml"))));
        //DatabaseOperation类的几个常量值
        //CLEAN_INSERT---->先删除数据库中的所有数据，然后将t_user.xml中的数据插入数据库
        //DELETE---------->如果数据库存在与t_user.xml记录的相同的数据，则删除数据库中的该条数据
        //DELETE_ALL------>删除数据库中的所有数据
        //INSERT---------->将t_user.xml中的数据插入数据库
        //NONE------------>nothing to do
        //REFRESH--------->刷新数据库中的数据
        //TRUNCATE_TABLE-->清空表中的数据
        //UPDATE---------->将数据库中的那条数据更新为t_user.xml中的数据
        DatabaseOperation.CLEAN_INSERT.execute(dbUnitConn, dataSet);
        //下面开始数据测试
        UserDaoJdbc dao = new UserDaoJdbc();
        User user = dao.load("jadyer");
        Assert.assertEquals(user.getId(), 2);
        Assert.assertEquals(user.getUsername(), "jadyer");
        Assert.assertEquals(user.getPassword(), "xuanyu");
    }
}
```