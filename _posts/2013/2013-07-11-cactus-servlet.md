---
layout: post
title: "Cactus测试Servlet"
categories: 单元测试
tags: cactus demo
author: 玄玉
excerpt: 演示了Cactus分别基于Tomcat和Jetty两种服务器，测试Servlet的用法。
---

* content
{:toc}


## 简介

容器内测试主要是面向`JSP、Servlet、Filter`等等，它们依赖于Servlet容器

它们所使用的某些对象都是由容器来产生的，我们自己是无法`new`出来的

其中比较出名的，比如本文中的`Cactus`框架

Cactus框架可以模拟`JavaEE`容器进行测试`JSP、Servlet、Filter`等等

它本身是基于`JUnit3.8`的，所以不支持`JUnit4.x`的注解

它已经很长时间没有更新了，其下载地址为[http://archive.apache.org/dist/jakarta/cactus/](http://archive.apache.org/dist/jakarta/cactus/)

但不更新不代表它不好，它还是很好用的，在公司和企业中，它的使用还是很多的

## 工作流程

Cactus分为`ClientSide`和`ServerSide`

ClientSide中包括beginXxx()和endXxx()方法

ServerSide中包括setUp()和testXxx()和tearDown()等方法

执行顺序为：`beginXxx-->setUp-->testXxx-->tearDown-->endXxx-->beginYyy-->setUp-->testYyy-->tearDown-->endYyy`

可以粗略的将beginXxx和endXxx方法理解为`JUnit4.x`中的`@BeforeClass`和`@AfterClass`，尽管它们之间并啥联系

**注意：**这里beginXxx和testXxx方法中的`Xxx`应该是相同的，比如beginLogin()和testLogin()才能对应上

## 示例代码

#### 公共部分

下面是待测试的`LoginServlet.Java`

```java
package com.xuanyuv.servlet;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 6655227641354075528L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        PrintWriter out = response.getWriter();
        out.println("<table><tr><td>username</td><td>password</td></tr></table>");
        out.flush();
        out.close();
    }

    public boolean login(HttpServletRequest request){
        String loginUser = (String)request.getSession().getAttribute("loginUser");
        if(null==loginUser || !"https://www.xuanyuv.com/".equals(loginUser)){
            System.out.println("用户[" + loginUser + "]登录失败");
            return false;
        }
        System.out.println("用户[" + loginUser + "]登录成功");
        return true;
    }
}
```

下面是使用`Cactus`编写的位于`test SourceFolder`下的测试用例`LoginServletTest.java`

```java
package com.xuanyuv.servlet;
import java.io.IOException;
import javax.servlet.ServletException;
import junit.framework.Assert;
import org.apache.cactus.ServletTestCase;
import org.apache.cactus.WebRequest;
import org.xml.sax.SAXException;
import com.meterware.httpunit.WebResponse;

/**
 * ----------------------------------------------------------------------------------------------------
 * 本类是一个继承了org.apache.cactus.ServletTestCase的类（它内部间接继承了junit.framework.TestCase）
 * 这样此类便自动拥有了ServletAPI引用，比如要使用HttpSession就可以直接session.setAttribute()
 * ----------------------------------------------------------------------------------------------------
 * 它所依赖的基础jar，如下所示
 * aspectjrt-1.5.3.jar
 * cactus.core.framework.uberjar.javaEE.14-1.8.1.jar
 * cactus.integration.ant-1.8.1.jar
 * cactus.integration.shared.api-1.8.1.jar
 * commons-codec-1.6.jar（需单独下载）
 * commons-discovery-0.4.jar
 * commons-httpclient-3.1.jar
 * commons-logging-1.1.jar
 * geronimo-j2ee-management_1.0_spec-1.1.jar
 * httpunit-1.6.jar
 * Tidy.jar或者nekoHTML.jar和xercesMinimal.jar（本例中的endDoGet()方法要用到）
 * ----------------------------------------------------------------------------------------------------
 * Tidy.jar需要单独下载
 * nekoHTML.jar和xercesMinimal.jar均可从下载到的nekohtml-1.9.18.zip找到
 * nekoHTML的下载地址为http://sourceforge.net/projects/nekohtml/files/
 * ----------------------------------------------------------------------------------------------------
 * Created by 玄玉<https://www.xuanyuv.com/> on 2013/07/11 10:49.
 */
public class LoginServletTest extends ServletTestCase {
    private LoginServlet loginServlet;

    //它是在ServerSide执行的
    public void setUp(){
        loginServlet = new LoginServlet();
    }

    //beginXxx()方法是在ClientSide执行的
    //若想在testLogin()中获取到这里request添加的username参数，则该方法就应命名为beginLogin()
    public void beginLogin(WebRequest request){
        request.addParameter("username", "xuanyu");
    }

    //它是在ServerSide执行的
    public void testLogin(){
        //获取GET参数
        Assert.assertEquals(request.getParameter("username"), "xuanyu");
        //登录失败
        //session.setAttribute("loginUser", "玄玉<https://www.xuanyuv.com/>");
        Assert.assertFalse(loginServlet.login(request));
        //登录成功
        session.setAttribute("loginUser", "https://www.xuanyuv.com/");
        Assert.assertTrue(loginServlet.login(request));
    }

    //它是在ServerSide执行的
    public void testDoGet() throws ServletException, IOException {
        loginServlet.doGet(request, response);
    }

    //endXxx()方法是在ClientSide执行的，该方法对应testDoGet()
    public void endDoGet(WebResponse resp) throws SAXException {
        //这里使用com.meterware.httpunit.WebResponse，而非org.apache.cactus.WebResponse
        //前者提供了很多增强功能（它要额外借助Tidy.jar或者nekoHTML.jar和xercesMinimal.jar作为辅助包）
        Assert.assertEquals(resp.getTables()[0].getCellAsText(0,0), "username");
        Assert.assertEquals(resp.getTables()[0].getCellAsText(0,1), "password");
    }
}
```

#### 基于Jetty测试Servlet

除公共部分的两个文件外，只需要写一个`JUnit3.8`的测试套件，就可以了

**Tips：**关于JUnit测试套件，可参考我的另一篇博文<https://www.xuanyuv.com/blog/20101117/junit-suite-param.html>

```java
package com.xuanyuv.servlet;
import junit.framework.Test;
import junit.framework.TestSuite;
import org.apache.cactus.extension.jetty.Jetty5xTestSetup;

/**
 * 我们要在beginXxx之前启动Jetty，而Cactus不支持JUnit4中的@BeforeClass
 * 所以为了实现类似功能，我们就借助JUnit3.8的测试套件，最后测试时直接运行此测试套件即可
 * Created by 玄玉<https://www.xuanyuv.com/> on 2013/07/11 10:49.
 */
public class TestAllUseJetty {
    public static Test suite(){
        //由于使用的是Jetty，所以就不用像基于Tomcat的那样麻烦的配置web.xml和cactus.properties
        //只是要注意：这里的值不能以下划线结尾（端口可任意设定）
        System.setProperty("cactus.contextURL", "http://127.0.0.1:8088/testJettyAndCactus");
        TestSuite suite = new TestSuite();
        suite.addTestSuite(LoginServletTest.class);
        //需要额外引入org.mortbay.jetty-5.1.9.jar（取自cactus-1.8.1-bin.zip）
        //否则会报告java.lang.ClassNotFoundException: org.mortbay.jetty.Server
        return new Jetty5xTestSetup(suite);
    }
}
```

#### 基于Tomcat测试Servlet

除公共部分的两个文件外，与基于Jetty测试Servlet不同的地方在于：

基于Jetty时只要写一个`JUnit3.8`测试套件就行了，**基于Tomcat**则需要配置`web.xml`和`cactus.properties`

首先是`web.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" version="2.5">
    <servlet>
        <servlet-name>ServletTestRedirector</servlet-name>
        <servlet-class>org.apache.cactus.server.ServletTestRedirector</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>ServletTestRedirector</servlet-name>
        <!-- 这里要求是固定的"/ServletRedirector" -->
        <url-pattern>/ServletRedirector</url-pattern>
    </servlet-mapping>
</web-app>
```

最后是`Cactus`运行时要用到的，位于`test SourceFolder`中的（classpath下面）`cactus.properties`

```ruby
#键名固定，键值模式为http://localhost:port/contextRoot/
#是否以斜线结尾均可，但这里的端口要与Tomcat的启动端口一致
cactus.contextURL=http://127.0.0.1:8088/cactus_demo/
```