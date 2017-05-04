---
layout: post
title: "使用Dom4j和Jdom读写XML文件"
categories: XML
tags: xml dom4j jdom
author: 玄玉
excerpt: 介绍Dom4j和Jdom读写XML文件的方法。
---

* content
{:toc}


## Dom4j

```java
package com.jadyer.demo.xml;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.XMLWriter;
import java.io.IOException;

/**
 * Dom4j读取XML
 * Created by 玄玉<http://jadyer.cn/> on 2010/12/06 18:41.
 */
public class Dom4jDemo {
    public static void main(String[] args) throws IOException, DocumentException {
        xmlRead();
        xmlWrite();
    }


    private static void xmlRead() throws DocumentException {
        ////读取XML文件获取Document对象
        //Document document = new SAXReader().read(new File("D:/testXML.xml"));
        ////读取XML文本内容获取Document对象
        Document document = DocumentHelper.parseText("<?xml version=\"1.0\" encoding=\"UTF-8\"?><users><user><id>123</id><name> Jadyer</name></user></users>");
        System.out.println(((Element)document.selectObject("/users/user/id")).getText());
        System.out.println(((Element)document.selectObject("/users/user/name")).getTextTrim());
    }


    private static void xmlWrite() throws IOException {
        //Document对象代表整个xml文档
        Document document = DocumentHelper.createDocument();

        //rootElement代表文档根元素
        Element rootElement = document.addElement("users");

        //增加一个注释
        rootElement.addComment("This is a comment!");

        //增加一个<user>标签
        Element userElement11 = rootElement.addElement("user");
        //设定不同的<user>下面的子标签
        Element idElement11 = userElement11.addElement("id");
        Element nameElement11 = userElement11.addElement("name");
        Element ageElement11 = userElement11.addElement("age");
        Element addressElement11 = userElement11.addElement("address");
        //为各个子标签赋值
        idElement11.setText("1");
        nameElement11.setText("Jadyer");
        ageElement11.setText("24");
        addressElement11.setText("BeiJing");

        //再加一个子标签<user>
        Element userElement22 = rootElement.addElement("user");
        Element idElement22 = userElement22.addElement("id");
        Element nameElement22 = userElement22.addElement("name");
        Element ageElement22 = userElement22.addElement("age");
        Element addressElement22 = userElement22.addElement("address");
        idElement22.setText("2");
        nameElement22.setText("Moon");
        ageElement22.setText("23");
        addressElement22.setText("HaerBin");

        //设定输出自动缩进及编码
        OutputFormat format = OutputFormat.createPrettyPrint();
        format.setEncoding("UTF-8");

        ////输出到文件
        //XMLWriter writer = new XMLWriter(new FileWriter("D:/testXML.xml"), format);
        //输出到控制台
        XMLWriter writer = new XMLWriter(format);
        writer.write(document);
        writer.flush();
        writer.close();
    }
}
```

生成的XML，控制台输出如下

```xml
<?xml version="1.0" encoding="UTF-8"?>

<users>
  <!--This is a comment!-->
  <user>
    <id>1</id>
    <name>Jadyer</name>
    <age>24</age>
    <address>BeiJing</address>
  </user>
  <user>
    <id>2</id>
    <name>Moon</name>
    <age>23</age>
    <address>HaerBin</address>
  </user>
</users>
```

## Jdom

```java
package com.jadyer.demo.xml;
import org.apache.commons.io.IOUtils;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.JDOMException;
import org.jdom2.filter.Filters;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;
import org.jdom2.xpath.XPath;
import org.jdom2.xpath.XPathBuilder;
import org.jdom2.xpath.XPathExpression;
import org.jdom2.xpath.jaxen.JaxenXPathFactory;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Jdom读写XML
 * Created by 玄玉<http://jadyer.cn/> on 2010/12/06 18:46.
 */
public class JdomDemo {
    public static void main(String[] args) throws IOException, JDOMException {
        xmlRead();
        xmlWrite();
    }


    private static void xmlRead() throws JDOMException, IOException {
        //读取XML文件获取Document对象
        //Document document = new SAXBuilder().build(new File("D:/testXML.xml"));
        //Document document = new SAXBuilder().build(JdomDemo.class.getResourceAsStream("config.xml"));
        //Document document = new SAXBuilder().build(Thread.currentThread().getContextClassLoader().getResourceAsStream("config.xml"));
        //读取XML文本内容获取Document对象
        Document document = new SAXBuilder().build(IOUtils.toInputStream("<?xml version=\"1.0\" encoding=\"UTF-8\"?><users><user><id>123</id><name> Jadyer</name></user></users>", StandardCharsets.UTF_8));
        Element rootElement = document.getRootElement();
        System.out.println(((Element)XPath.selectSingleNode(rootElement, "//users/user/id")).getText());
        System.out.println(((Element)XPath.selectSingleNode(rootElement, "//users/user/name")).getTextTrim());
        /**
         * 2016-11-25 17:20补充如下
         * Jdom2开始就不推荐使用XPath了，改用XPathFactory/XPathExpression/XPathBuilder替代（感觉好难用的样子）
         */
        XPathBuilder<Element> builder = new XPathBuilder<>("//users/user/id", Filters.element());
        XPathExpression<Element> expression = builder.compileWith(JaxenXPathFactory.instance());
        List<Element> elementList = expression.diagnose(rootElement, false).getResult();
        System.out.println(elementList.get(0).getTextTrim());
        builder = new XPathBuilder<>("//users/user/name", Filters.element());
        expression = builder.compileWith(JaxenXPathFactory.instance());
        elementList = expression.diagnose(rootElement, false).getResult();
        System.out.println(elementList.get(0).getTextTrim());
    }


    private static void xmlWrite()throws IOException {
        //先New一个根（Jdom中每一个节点都是Element）
        Element rootElt = new Element("selects");

        //第一个子标签
        Element selectElt11 = new Element("select");
        Element idElt11 = new Element("id");
        Element valueElt11 = new Element("name");
        idElt11.addContent("1");
        valueElt11.addContent("哈尔滨");
        selectElt11.addContent(idElt11);
        selectElt11.addContent(valueElt11);

        //第一个子标签
        Element selectElt22 = new Element("select");
        Element idElt22 = new Element("id");
        Element valueElt22 = new Element("name");
        idElt22.addContent("2");
        valueElt22.addContent("重庆");
        selectElt22.addContent(idElt22);
        selectElt22.addContent(valueElt22);

        //添加子标签
        rootElt.addContent(selectElt11);
        rootElt.addContent(selectElt22);

        //通过根得到整个XML对象
        Document doc = new Document(rootElt);

        //设定输出的XML文件编码，默认生成的XML文件为UTF-8编码
        XMLOutputter out = new XMLOutputter();
        out.setFormat(Format.getCompactFormat().setEncoding("UTF-8"));

        //控制台打印XML
        System.out.println(out.outputString(doc));

        //将生成的XML文件写到D:/testXML.xml中
        out.output(doc, new FileOutputStream("D:/testXML.xml"));
    }
}
```

生成的XML，控制台输出如下

```xml
<?xml version="1.0" encoding="UTF-8"?>
<selects><select><id>1</id><name>哈尔滨</name></select><select><id>2</id><name>重庆</name></select></selects>
```