---
layout: post
title: "EasyMock测试Servlet"
categories: 单元测试
tags: easymock demo
author: 玄玉
excerpt: 演示了EasyMock测试Servlet的用法。
---

* content
{:toc}


这里只是用`EasyMock`模拟`HttpServletRequest`等对象，实际应用`Cactus`框架来测试`Servlet`

下面是演示代码，首先是用到的实体类`User.Java`

```java
package com.jadyer.model;
public class User {
    private int id;
    private String username;
    private String password;
    /*-- 三个属性的setter和getter略 --*/
    public User(){}
    public User(int id, String username, String password) {
        this.id = id;
        this.username = username;
        this.password = password;
    }
}
```

下面是待测试的`LoginServlet.java`

```java
package com.jadyer.servlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import com.jadyer.model.User;

public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 6655227641354075528L;
    public boolean isLogin(HttpServletRequest request){
        HttpSession session = request.getSession();
        if(null == session){
            return false;
        }
        User user = (User)session.getAttribute("loginUser");
        if(null == user){
            return false;
        }
        return true;
    }
}
```

最后是使用`EasyMock`编写的测试用例`LoginServletTest.java`

```java
package com.jadyer.servlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import org.easymock.EasyMock;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import com.jadyer.model.User;

/**
 * EasyMock测试Servlet
 * 虽然示例代码是一个WebProject，但不需配置web.xml，因为EasyMock用不上它
 * Created by 玄玉<https://jadyer.github.io/> on 2013/07/09 14:30.
 */
public class LoginServletTest {
    private LoginServlet servlet;
    private HttpServletRequest request;
    private HttpSession session;

    @Before
    public void init(){
        servlet = new LoginServlet();
        request = EasyMock.createStrictMock(HttpServletRequest.class);
        session = EasyMock.createStrictMock(HttpSession.class);
    }

    /**
     * 测试登录失败的情况（session为空）
     */
    @Test
    public void testIsLoginFailSessionIsNull(){
        //声明HttpServletRequest获取到的HttpSession是空的
        EasyMock.expect(request.getSession()).andReturn(null);
        EasyMock.replay(request, session);
        //验证HttpSession为空时登录应该是失败的
        Assert.assertFalse(servlet.isLogin(request));
        EasyMock.verify(request, session);
    }

    /**
     * 测试登录失败的情况（session中无用户）
     */
    @Test
    public void testIsLoginFailSessionNoUser(){
        //声明HttpServletRequest获取到的是正常的HttpSession
        EasyMock.expect(request.getSession()).andReturn(session);
        //声明HttpSession中无用户
        EasyMock.expect(session.getAttribute("loginUser")).andReturn(null);
        EasyMock.replay(request, session);
        //验证HttpSession中无用户时登录应该是失败的
        Assert.assertFalse(servlet.isLogin(request));
        EasyMock.verify(request, session);
    }

    /**
     * 测试登录成功的情况
     */
    @Test
    public void testIsLoginSuccess(){
        //声明HttpServletRequest获取到的是正常的HttpSession
        EasyMock.expect(request.getSession()).andReturn(session);
        //声明HttpSession中存在用户
        EasyMock.expect(session.getAttribute("loginUser")).andReturn(new User());
        EasyMock.replay(request, session);
        //验证HttpSession有效且存在用户时登录应该是成功的
        Assert.assertTrue(servlet.isLogin(request));
        EasyMock.verify(request, session);
    }
}
```