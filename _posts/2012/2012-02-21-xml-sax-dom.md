---
layout: post
title: "使用SAX和DOM读取XML文件"
categories: XML
tags: xml sax dom
author: 玄玉
excerpt: 介绍SAX和DOM读取XML文件的方法。
---

* content
{:toc}


## 区别

二者属于XML的两种解析模型：DOM是面向模型的，SAX是基于事件的

DOM解析XML时，会先将XML文档加载到内存，再操作内存中的DOM树，效率虽然高但不适合大文件解析

SAX则是读一部分解一部分这种顺序执行的，它一旦经过了某个元素，我们就没有办法再去访问它了

SAX不必将整个XML文档都加载到内存中，因此它占据内存要比DOM少一些

不过，SAX编程要比DOM稍微复杂一点：它需要实现一个回调

下面是本文示例中，读取的XML内容

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<people>
    <!-- This is Jadyer`s comment -->
    <person personID="P01">
        <姓名 userID="U01">玄玉</姓名>
        <邮箱>myjadyer@gmail.com</邮箱>
        <地址>哈尔滨</地址>
    </person>
    <person personID="P02">
        <姓名 userID="U02">玄玉道</姓名>
        <邮箱>jadyer@yeah.net</邮箱>
        <地址>重庆</地址>
    </person>
    <person personID="P03">
        <姓名 userID="U03">查文斌</姓名>
        <邮箱>zhawenbing@163.com</邮箱>
        <地址>茅山天正道</地址>
    </person>
    <person personID="P04">
        <姓名 userID="U04">杨露禅</姓名>
        <邮箱>yangluchan@126.com</邮箱>
        <地址>太极陈家沟</地址>
    </person>
</people>
```

## SAX

```java
package com.jadyer.demo.xml;
import org.apache.commons.io.IOUtils;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import java.nio.charset.StandardCharsets;
import java.util.Stack;

/**
 * SAX(Simple APIs for XML)的方式解析XML文档
 * Created by 玄玉<https://jadyer.github.io/> on 2012/02/21 11:33.
 */
public class SaxXMLDemo {
    public static void main(String[] args) throws Exception {
        String xmlStr = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
                "<people>\n" +
                "    <!-- This is Jadyer`s comment -->\n" +
                "    <person personID=\"P01\">\n" +
                "        <姓名 userID=\"U01\">玄玉</姓名>\n" +
                "        <邮箱>myjadyer@gmail.com</邮箱>\n" +
                "        <地址>哈尔滨</地址>\n" +
                "    </person>\n" +
                "    <person personID=\"P02\">\n" +
                "        <姓名 userID=\"U02\">玄玉道</姓名>\n" +
                "        <邮箱>jadyer@yeah.net</邮箱>\n" +
                "        <地址>重庆</地址>\n" +
                "    </person>\n" +
                "    <person personID=\"P03\">\n" +
                "        <姓名 userID=\"U03\">查文斌</姓名>\n" +
                "        <邮箱>zhawenbing@163.com</邮箱>\n" +
                "        <地址>茅山天正道</地址>\n" +
                "    </person>\n" +
                "    <person personID=\"P04\">\n" +
                "        <姓名 userID=\"U04\">杨露禅</姓名>\n" +
                "        <邮箱>yangluchan@126.com</邮箱>\n" +
                "        <地址>太极陈家沟</地址>\n" +
                "    </person>\n" +
                "</people>";
        //获得SAX解析器工厂实例
        SAXParserFactory factory = SAXParserFactory.newInstance();
        //获得SAX解析器实例
        SAXParser parser = factory.newSAXParser();
        //开始解析
        parser.parse(IOUtils.toInputStream(xmlStr, StandardCharsets.UTF_8), new MyXMLHandler());
    }
}

class MyXMLHandler extends DefaultHandler {
    private Stack<String> stack = new Stack<>();
    private String name;
    private String email;
    private String address;
    @Override
    public void startDocument() throws SAXException {
        System.out.println("*******************************Document_start*********");
    }
    @Override
    public void endDocument() throws SAXException {
        System.out.println("*******************************Document_end***********");
    }
    @Override
    public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException {
        System.out.println("===============================Element_Start=======");
        //qName表示标签的名字，即<person personID="P01">中的person
        stack.push(qName);
        for(int i=0; i<attributes.getLength(); i++){
            //获得第i个属性，输出：personID=P01
            System.out.println(attributes.getQName(i) + "=" + attributes.getValue(i));
        }
    }
    @Override
    public void characters(char[] ch, int start, int length) throws SAXException {
        String tag = stack.peek();
        if("姓名".equals(tag)){
            name = new String(ch, start, length);
        }else if("邮箱".equals(tag)){
            email = new String(ch, start, length);
        }else if("地址".equals(tag)){
            address = new String(ch, start, length);
        }
    }
    @Override
    public void endElement(String uri, String localName, String qName) throws SAXException {
        System.out.println("===============================Element_End=========");
        //表示该元素已经解析完毕，从栈中弹出
        stack.pop();
        if("person".equals(qName)){
            System.out.println("姓名: " + name);
            System.out.println("邮箱: " + email);
            System.out.println("地址: " + address);
            System.out.println("---------------------------------------------------");
        }
    }
}
```

SAX读取到的XML内容，控制台输出如下

```
*******************************Document_start*********
===============================Element_Start=======
===============================Element_Start=======
personID=P01
===============================Element_Start=======
userID=U01
===============================Element_End=========
===============================Element_Start=======
===============================Element_End=========
===============================Element_Start=======
===============================Element_End=========
===============================Element_End=========
姓名: 玄玉
邮箱: myjadyer@gmail.com
地址: 哈尔滨
---------------------------------------------------
===============================Element_Start=======
personID=P02
===============================Element_Start=======
userID=U02
===============================Element_End=========
===============================Element_Start=======
===============================Element_End=========
===============================Element_Start=======
===============================Element_End=========
===============================Element_End=========
姓名: 玄玉道
邮箱: jadyer@yeah.net
地址: 重庆
---------------------------------------------------
===============================Element_Start=======
personID=P03
===============================Element_Start=======
userID=U03
===============================Element_End=========
===============================Element_Start=======
===============================Element_End=========
===============================Element_Start=======
===============================Element_End=========
===============================Element_End=========
姓名: 查文斌
邮箱: zhawenbing@163.com
地址: 茅山天正道
---------------------------------------------------
===============================Element_Start=======
personID=P04
===============================Element_Start=======
userID=U04
===============================Element_End=========
===============================Element_Start=======
===============================Element_End=========
===============================Element_Start=======
===============================Element_End=========
===============================Element_End=========
姓名: 杨露禅
邮箱: yangluchan@126.com
地址: 太极陈家沟
---------------------------------------------------
===============================Element_End=========
*******************************Document_end***********
```

## DOM

#### 打印文件内容

```java
package com.jadyer.demo.xml;
import org.apache.commons.io.IOUtils;
import org.w3c.dom.Attr;
import org.w3c.dom.Comment;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * DOM(Document Object Model)的方式解析XML文档
 * Created by 玄玉<https://jadyer.github.io/> on 2012/02/21 11:33.
 */
public class DomXMLDemo {
    public static void main(String[] args) throws Exception {
        String xmlStr = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
                "<people>\n" +
                "    <!-- This is Jadyer`s comment -->\n" +
                "    <person personID=\"P01\">\n" +
                "        <姓名 userID=\"U01\">玄玉</姓名>\n" +
                "        <邮箱>myjadyer@gmail.com</邮箱>\n" +
                "        <地址>哈尔滨</地址>\n" +
                "    </person>\n" +
                "    <person personID=\"P02\">\n" +
                "        <姓名 userID=\"U02\">玄玉道</姓名>\n" +
                "        <邮箱>jadyer@yeah.net</邮箱>\n" +
                "        <地址>重庆</地址>\n" +
                "    </person>\n" +
                "    <person personID=\"P03\">\n" +
                "        <姓名 userID=\"U03\">查文斌</姓名>\n" +
                "        <邮箱>zhawenbing@163.com</邮箱>\n" +
                "        <地址>茅山天正道</地址>\n" +
                "    </person>\n" +
                "    <person personID=\"P04\">\n" +
                "        <姓名 userID=\"U04\">杨露禅</姓名>\n" +
                "        <邮箱>yangluchan@126.com</邮箱>\n" +
                "        <地址>太极陈家沟</地址>\n" +
                "    </person>\n" +
                "</people>";
        //获取用于创建具体DOM解析器的工厂
        //由于所有的解析器都遵从JAXP(Java API for Xml Parse)定义的接口
        //而这里的newInstance()会根据一个系统变量来决定使用哪一个解析器
        //所以需要切换不同的解析器时，只需要修改系统变量，而不用改代码
        DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
        //获得具体的DOM解析器
        DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();
        //解析一个XML文档，获得Document对象
        //Document document = documentBuilder.parse(new File("userinfo.xml"));
        Document document = documentBuilder.parse(IOUtils.toInputStream(xmlStr, StandardCharsets.UTF_8));
        new DomXMLDemo().xmlPrint(document.getDocumentElement());
    }

    /**
     * 通过递归以DOM的方式，解析XML文档，将其内容输出到控制台
     */
    private void xmlPrint(Element rootElement) throws ParserConfigurationException, IOException, SAXException {
        //从根元素开始处理
        String tagName = rootElement.getNodeName();
        NodeList children = rootElement.getChildNodes();
        System.out.print("<" + tagName);
        NamedNodeMap map = rootElement.getAttributes();
        //如果元素存在属性，则打印属性
        if(null != map){
            for(int i=0; i<map.getLength(); i++){
                Attr attr = (Attr)map.item(i);
                System.out.print(" " + attr.getName() + "=\"" + attr.getValue() + "\"");
            }
        }
        System.out.print(">");
        for(int i=0; i<children.getLength(); i++){
            Node node = children.item(i);
            short nodeType = node.getNodeType();
            //判断节点类型，是元素，则继续递归
            if(Node.ELEMENT_NODE == nodeType){
                this.xmlPrint((Element)node);
            }else if(Node.TEXT_NODE == nodeType){
                System.out.print(node.getNodeValue());
            }else if(Node.COMMENT_NODE == nodeType){
                System.out.print("<!--");
                Comment comment = (Comment) node;
                System.out.print(comment.getData());
                System.out.print("-->");
            }
        }
        System.out.print("</" + tagName + ">");
    }
}
```

#### 读取文件内容

```java
package com.jadyer.demo.xml;
import org.apache.commons.io.IOUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * DOM(Document Object Model)的方式解析XML文档
 * Created by 玄玉<https://jadyer.github.io/> on 2012/02/21 11:33.
 */
public class DomXMLDemo {
    public static void main(String[] args) throws Exception {
        String xmlStr = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
                "<people>\n" +
                "    <!-- This is Jadyer`s comment -->\n" +
                "    <person personID=\"P01\">\n" +
                "        <姓名 userID=\"U01\">玄玉</姓名>\n" +
                "        <邮箱>myjadyer@gmail.com</邮箱>\n" +
                "        <地址>哈尔滨</地址>\n" +
                "    </person>\n" +
                "    <person personID=\"P02\">\n" +
                "        <姓名 userID=\"U02\">玄玉道</姓名>\n" +
                "        <邮箱>jadyer@yeah.net</邮箱>\n" +
                "        <地址>重庆</地址>\n" +
                "    </person>\n" +
                "    <person personID=\"P03\">\n" +
                "        <姓名 userID=\"U03\">查文斌</姓名>\n" +
                "        <邮箱>zhawenbing@163.com</邮箱>\n" +
                "        <地址>茅山天正道</地址>\n" +
                "    </person>\n" +
                "    <person personID=\"P04\">\n" +
                "        <姓名 userID=\"U04\">杨露禅</姓名>\n" +
                "        <邮箱>yangluchan@126.com</邮箱>\n" +
                "        <地址>太极陈家沟</地址>\n" +
                "    </person>\n" +
                "</people>";
        new DomXMLDemo().xmlRead(xmlStr);
    }

    private void xmlRead(String xmlStr) throws ParserConfigurationException, IOException, SAXException {
        //获取用于创建具体DOM解析器的工厂
        //由于所有的解析器都遵从JAXP(Java API for Xml Parse)定义的接口
        //而这里的newInstance()会根据一个系统变量来决定使用哪一个解析器
        //所以需要切换不同的解析器时，只需要修改系统变量，而不用改代码
        DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
        //获得具体的DOM解析器
        DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();
        //解析一个XML文档，获得Document对象
        //Document document = documentBuilder.parse(new File("userinfo.xml"));
        Document document = documentBuilder.parse(IOUtils.toInputStream(xmlStr, StandardCharsets.UTF_8));
        //获得文档的根元素节点
        Element rootElement = document.getDocumentElement();
        //解析XML时要注意：节点与节点之间的空格文本，也算是根元素节点的孩子的组成部分
        NodeList childNodeList = rootElement.getChildNodes();
        System.out.println("该XML文档的根元素节点为: " + rootElement.getTagName());
        System.out.println("根元素节点下的孩子数目为: " + childNodeList.getLength());
        System.out.println("根元素节点下的孩子名字为: 如下所示");
        for(int i=0; i<childNodeList.getLength(); i++){
            System.out.println("                       " + childNodeList.item(i).getNodeName());
        }
        System.out.println("=====================================================================");
        /*
         * 开始解析
         */
        //获得所有的标签名为'person'的节点
        NodeList nodeList = document.getElementsByTagName("person");
        for(int i=0; i<nodeList.getLength(); i++){
            Element element = (Element)nodeList.item(i);
            //读取标签属性值
            NamedNodeMap namedNodeMap = element.getAttributes();
            System.out.print(namedNodeMap.item(0).getNodeName());
            System.out.print("=");
            System.out.println(namedNodeMap.item(0).getNodeValue());
            //读取标签值
            String content = element.getElementsByTagName("姓名").item(0).getFirstChild().getNodeValue();
            String contentAttr = element.getElementsByTagName("姓名").item(0).getAttributes().item(0).getNodeName();
            String contentvalue = element.getElementsByTagName("姓名").item(0).getAttributes().item(0).getNodeValue();
            System.out.println(contentAttr + "=" + contentvalue);
            System.out.println("姓名: " + content);
            content = element.getElementsByTagName("邮箱").item(0).getFirstChild().getNodeValue();
            System.out.println("邮箱: " + content);
            content = element.getElementsByTagName("地址").item(0).getFirstChild().getNodeValue();
            System.out.println("地址: " + content);
            System.out.println("=====================================================================");
        }
    }
}
```

DOM读取到的XML内容，控制台输出如下

```
该XML文档的根元素节点为: people
根元素节点下的孩子数目为: 11
根元素节点下的孩子名字为: 如下所示
                        #text
                        #comment
                        #text
                        person
                        #text
                        person
                        #text
                        person
                        #text
                        person
                        #text
=====================================================================
personID=P01
userID=U01
姓名: 玄玉
邮箱: myjadyer@gmail.com
地址: 哈尔滨
=====================================================================
personID=P02
userID=U02
姓名: 玄玉道
邮箱: jadyer@yeah.net
地址: 重庆
=====================================================================
personID=P03
userID=U03
姓名: 查文斌
邮箱: zhawenbing@163.com
地址: 茅山天正道
=====================================================================
personID=P04
userID=U04
姓名: 杨露禅
邮箱: yangluchan@126.com
地址: 太极陈家沟
=====================================================================
```