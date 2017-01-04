---
layout: post
title: "SpringMVC整合Shiro"
categories: Spring
tags: spring springmvc
author: 玄玉
excerpt: 介绍了SpringMVC-3.2.4整合Shiro-1.2.2的完整例子。
---

* content
{:toc}


本文涉及的相关环境和版本为：`SpringMVC-3.2.4`、`Shiro-1.2.2`

本文源码下载：（下面两个地址的文件的内容，都是一样的）

[http://oirr30q6q.bkt.clouddn.com/jadyer/code/springmvcshiro.rar](http://oirr30q6q.bkt.clouddn.com/jadyer/code/springmvcshiro.rar)

[http://download.csdn.net/detail/jadyer/9727097](http://download.csdn.net/detail/jadyer/9727097)

## 示例代码

首先是 `web.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="2.5" xmlns="http://java.sun.com/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd">
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:applicationContext.xml</param-value>
    </context-param>

    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <servlet>
        <servlet-name>SpringMVC</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:applicationContext.xml</param-value>
        </init-param>
    </servlet>
    <servlet-mapping>
        <servlet-name>SpringMVC</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>

    <!--
    配置Shiro过滤器
    这里filter-name必须对应applicationContext.xml中定义的<bean id="shiroFilter"/>
    使用[/*]匹配所有请求，保证所有的可控请求都经过Shiro的过滤
    通常会将此filter-mapping放置到最前面（即其他filter-mapping前面），以保证它是过滤器链中第一个起作用的
    -->
    <filter>
        <filter-name>shiroFilter</filter-name>
        <filter-class>org.springframework.web.filter.DelegatingFilterProxy</filter-class>
        <init-param>
            <!-- 缺省为false，表示由SpringApplicationContext管理生命周期，置为true则表示由ServletContainer管理 -->
            <param-name>targetFilterLifecycle</param-name>
            <param-value>true</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>shiroFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

	<!-- 设置Session超时时间为45分钟 -->
    <session-config>
        <session-timeout>45</session-timeout>
    </session-config>
</web-app>
```

然后是 `/src/applicationContext.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:mvc="http://www.springframework.org/schema/mvc" xmlns:context="http://www.springframework.org/schema/context" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.2.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc-3.2.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-3.2.xsd">
<context:component-scan base-package="com.jadyer"/>
<mvc:annotation-driven/>
<mvc:view-controller path="/" view-name="forward:/login.jsp"/>
<mvc:view-controller path="/tomain" view-name="forward:/main.jsp"/>
<bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
    <property name="prefix" value="/"/>
    <property name="suffix" value=".jsp"/>
</bean>

<bean id="securityManager" class="org.apache.shiro.web.mgt.DefaultWebSecurityManager">
    <!-- 指定Shiro验证用户登录的类为自定义的Realm（若有多个Realm，可用[realms]属性代替） -->
    <property name="realm">
        <bean class="com.jadyer.demo.realm.MyRealm"/>
    </property>
    <!--
    Shiro默认会使用Servlet容器的Session，此时修改超时时间的话，可以修改web.xml或者这里自定义的MyRealm
    而若想使用Shiro原生Session则可以设置sessionMode属性为native，此时修改超时时间则只能修改MyRealm
    -->
    <!-- <property name="sessionMode" value="native"/> -->
</bean>

<!-- Shiro主过滤器本身功能十分强大，其强大之处就在于它支持任何基于URL路径表达式的、自定义的过滤器的执行 -->
<!-- Web应用中，Shiro可控制的Web请求必须经过Shiro主过滤器的拦截，并且Shiro对基于Spring的Web应用提供了完美的支持 -->
<bean id="shiroFilter" class="org.apache.shiro.spring.web.ShiroFilterFactoryBean">
    <!-- Shiro的核心安全接口，这个属性是必须的 -->
    <property name="securityManager" ref="securityManager"/>
    <!-- 要求登录时的链接（可根据项目的URL进行替换），非必须的属性，默认会找Web工程根目录下的[/login.jsp] -->
    <property name="loginUrl" value="/"/>
    <!-- 登录成功后要跳转的连接（本例中此属性用不到，因为登录成功后的处理逻辑已在LoginController中硬编码为main.jsp） -->
    <!-- <property name="successUrl" value="/system/main"/> -->
    <!--
    用户访问未授权的资源时，所显示的连接
    若想更明显的测试此属性可以修改它的值，比如unauthor.jsp
    然后用[xuanyu]登录后访问/admin/list.jsp就看见浏览器会显示unauthor.jsp
    -->
    <property name="unauthorizedUrl" value="/"/>
    <!--
    Shiro连接约束配置，即过滤链的定义
    更详细介绍，请见本文下方提供的Shiro-1.2.2内置的FilterChain说明
    下面value值的第一个'/'代表的路径是相对于HttpServletRequest.getContextPath()的值来的
    anon：它对应的过滤器里面是空的，什么都没做，另外.do和.jsp后面的*表示参数，比方说[login.jsp?main]这种
    authc：该过滤器下的页面必须验证后才能访问，它是内置的org.apache.shiro.web.filter.authc.FormAuthenticationFilter
    注意：对于相似的资源，需要将anon的设置放在authc前面，anon才会生效，因为Shiro是从上往下匹配URL的，匹配成功便不再匹配了
    -->
    <property name="filterChainDefinitions">
        <value>
            /main**           = authc
            /admin/list**     = authc,perms[admin:manage]
            /user/info-anon** = anon
            /user/info**      = authc
        </value>
    </property>
</bean>

<!-- 保证实现了Shiro内部lifecycle函数的bean执行 -->
<!-- http://shiro.apache.org/static/1.2.1/apidocs/org/apache/shiro/spring/LifecycleBeanPostProcessor.html -->
<bean id="lifecycleBeanPostProcessor" class="org.apache.shiro.spring.LifecycleBeanPostProcessor"/>

<!--
开启Shiro的注解（比如@RequiresRoles、@RequiresPermissions）
配置以下两个bean即可实现此功能（其需借助SpringAOP扫描使用Shiro注解的类，并在必要时进行安全逻辑验证）
并且：Enable Shiro Annotations for Spring-configured beans. Only run after the lifecycleBeanProcessor has run
说明：本例并未使用Shiro注解，个人觉得将权限通过注解的方式硬编码在程序中，查看起来不是很方便
-->
<!--
<bean class="org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator" depends-on="lifecycleBeanPostProcessor"/>
<bean class="org.apache.shiro.spring.security.interceptor.AuthorizationAttributeSourceAdvisor">
    <property name="securityManager" ref="securityManager"/>
</bean>
-->
</beans>
```

下面是自定义的用于指定Shiro验证用户登录的类 `MyRealm.java`

这里定义了两个用户：**jadyer**（拥有admin角色和admin:manage权限）、**xuanyu**（无任何角色和权限）

```java
package com.jadyer.demo.realm;
import org.apache.commons.lang3.builder.ReflectionToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.session.Session;
import org.apache.shiro.subject.PrincipalCollection;
import org.apache.shiro.subject.Subject;

/**
 * 自定义的指定Shiro验证用户登录的类
 * 这里定义了两个用户：jadyer（拥有admin角色和admin:manage权限）、xuanyu（无任何角色和权限）
 * Created by 玄玉<https://jadyer.github.io/> on 2013/09/29 15:15.
 */
public class MyRealm extends AuthorizingRealm {
    /**
     * 为当前登录的Subject授予角色和权限
     * -----------------------------------------------------------------------------------------------
     * 经测试：本例中该方法的调用时机为需授权资源被访问时
     * 经测试：并且每次访问需授权资源时都会执行该方法中的逻辑，这表明本例中默认并未启用AuthorizationCache
     * 个人感觉若使用了Spring3.1开始提供的ConcurrentMapCache支持，则可灵活决定是否启用AuthorizationCache
     * 比如说这里从数据库获取权限信息时，先去访问Spring3.1提供的缓存，而不使用Shior提供的AuthorizationCache
     * -----------------------------------------------------------------------------------------------
     */
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals){
        //获取当前登录的用户名
        String currentUsername = (String)super.getAvailablePrincipal(principals);
        ////从数据库中获取当前登录用户的详细信息
        //List<String> roleList = new ArrayList<String>();
        //List<String> permissionList = new ArrayList<String>();
        //User user = userService.getByUsername(currentUsername);
        //if(null != user){
        //    //实体类User中包含有用户角色的实体类信息
        //    if(null!=user.getRoles() && user.getRoles().size()>0){
        //        //获取当前登录用户的角色
        //        for(Role role : user.getRoles()){
        //            roleList.add(role.getName());
        //            //实体类Role中包含有角色权限的实体类信息
        //            if(null!=role.getPermissions() && role.getPermissions().size()>0){
        //                //获取权限
        //                for(Permission pmss : role.getPermissions()){
        //                    if(StringUtils.isNotBlank(pmss.getPermission())){
        //                        permissionList.add(pmss.getPermission());
        //                    }
        //                }
        //            }
        //        }
        //    }
        //}else{
        //    throw new AuthorizationException();
        //}
        ////为当前用户设置角色和权限
        //SimpleAuthorizationInfo simpleAuthorInfo = new SimpleAuthorizationInfo();
        //simpleAuthorInfo.addRoles(roleList);
        //simpleAuthorInfo.addStringPermissions(permissionList);
        //实际中可能会像上面注释的那样，从数据库或缓存中取得用户的角色和权限信息
        SimpleAuthorizationInfo simpleAuthorInfo = new SimpleAuthorizationInfo();
        if(null!=currentUsername && "jadyer".equals(currentUsername)){
            //添加一个角色，不是配置意义上的添加，而是证明该用户拥有admin角色
            simpleAuthorInfo.addRole("admin");
            //添加权限
            simpleAuthorInfo.addStringPermission("admin:manage");
            System.out.println("已为用户[jadyer]赋予了[admin]角色和[admin:manage]权限");
            return simpleAuthorInfo;
        }
        if(null!=currentUsername && "xuanyu".equals(currentUsername)){
            System.out.println("当前用户[xuanyu]无授权（不需要为其赋予角色和权限）");
            return simpleAuthorInfo;
        }
        //若该方法什么都不做直接返回null的话
        //就会导致任何用户访问/admin/listUser.jsp时都会自动跳转到unauthorizedUrl指定的地址
        //详见applicationContext.xml中的<bean id="shiroFilter">的配置
        return null;
    }

    /**
     * 验证当前登录的Subject
     * 经测试：本例中该方法的调用时机为LoginController.login()方法中执行Subject.login()的时候
     */
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authcToken) throws AuthenticationException {
        //获取基于用户名和密码的令牌
        //实际上这个authcToken是从LoginController里面currentUser.login(token)传过来的
        //两个token的引用都是一样的，本例中是：org.apache.shiro.authc.UsernamePasswordToken@33799a1e
        UsernamePasswordToken token = (UsernamePasswordToken)authcToken;
        System.out.print("验证当前Subject时获取到Token：");
        System.out.println(ReflectionToStringBuilder.toString(token, ToStringStyle.MULTI_LINE_STYLE));
        //User user = userService.getByUsername(token.getUsername());
        //if(null != user){
        //    String username = user.getUsername();
        //    String password = user.getPassword();
        //    String nickname = user.getNickname();
        //    AuthenticationInfo authcInfo = new SimpleAuthenticationInfo(username, password, nickname);
        //    this.setSession("currentUser", user);
        //    return authcInfo;
        //}else{
        //    return null;
        //}
        //此处无需比对，比对的逻辑Shiro会做，我们只需返回一个和令牌相关的正确的验证信息
        //说白了就是第一个参数填登录用户名，第二个参数填合法的登录密码（可以是从数据库中取到的，本例中为了演示就硬编码了）
        //这样一来，在随后的登录页面上就只有这里指定的用户和密码才能通过验证
        if("jadyer".equals(token.getUsername())){
            AuthenticationInfo authcInfo = new SimpleAuthenticationInfo("jadyer", "jadyer", this.getName());
            this.setAuthenticationSession("jadyer");
            return authcInfo;
        }
        if("xuanyu".equals(token.getUsername())){
            AuthenticationInfo authcInfo = new SimpleAuthenticationInfo("xuanyu", "xuanyu", this.getName());
            this.setAuthenticationSession("xuanyu");
            return authcInfo;
        }
        //没有返回登录用户名对应的SimpleAuthenticationInfo对象时，就会在LoginController中抛出UnknownAccountException异常
        return null;
    }

    /**
     * 将一些数据放到ShiroSession中，以便于其它地方使用
     * 比如Controller里面，使用时直接用HttpSession.getAttribute(key)就可以取到
     */
    private void setAuthenticationSession(Object value){
        Subject currentUser = SecurityUtils.getSubject();
        if(null != currentUser){
            Session session = currentUser.getSession();
            System.out.println("当前Session超时时间为[" + session.getTimeout() + "]毫秒");
            session.setTimeout(1000 * 60 * 60 * 2);
            System.out.println("修改Session超时时间为[" + session.getTimeout() + "]毫秒");
            session.setAttribute("currentUser", value);
        }
    }
}
```

下面是用到的控制器 `UserController.java`

```java
package com.jadyer.demo.controller;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.builder.ReflectionToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.ExcessiveAttemptsException;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.LockedAccountException;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.web.util.WebUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.view.InternalResourceViewResolver;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

/**
 * SpringMVC-3.2.4整合Shiro-1.2.2
 * Created by 玄玉<https://jadyer.github.io/> on 2013/09/30 23:37.
 */
@Controller
@RequestMapping("mydemo")
public class UserController {
    @RequestMapping("/logout")
    public String logout(HttpSession session){
        String currentUser = (String)session.getAttribute("currentUser");
        System.out.println("用户[" + currentUser + "]准备登出");
        SecurityUtils.getSubject().logout();
        System.out.println("用户[" + currentUser + "]已登出");
        return InternalResourceViewResolver.REDIRECT_URL_PREFIX + "/";
    }

    @RequestMapping(value="/login", method=RequestMethod.POST)
    public String login(String username, String password, HttpServletRequest request){
        System.out.println("-------------------------------------------------------");
        String rand = (String)request.getSession().getAttribute("rand");
        String captcha = WebUtils.getCleanParam(request, "captcha");
        System.out.println("用户["+username+"]登录时输入的验证码为["+captcha+"]，HttpSession中的验证码为["+rand+"]");
        if(!StringUtils.equals(rand, captcha)){
            request.setAttribute("message_login", "验证码不正确");
            return InternalResourceViewResolver.FORWARD_URL_PREFIX + "/";
        }
        UsernamePasswordToken token = new UsernamePasswordToken(username, password);
        token.setRememberMe(true);
        System.out.print("为验证登录用户而封装的Token：");
        System.out.println(ReflectionToStringBuilder.toString(token, ToStringStyle.MULTI_LINE_STYLE));
        //获取当前的Subject
        Subject currentUser = SecurityUtils.getSubject();
        try {
            //在调用了login方法后，SecurityManager会收到AuthenticationToken，并将其发送给已配置的Realm执行必须的认证检查
            //每个Realm都能在必要时对提交的AuthenticationTokens作出反应
            //所以这一步在调用login(token)方法时，它会走到MyRealm.doGetAuthenticationInfo()方法中，具体验证方式详见此方法
            System.out.println("对用户[" + username + "]进行登录验证...验证开始");
            currentUser.login(token);
            System.out.println("对用户[" + username + "]进行登录验证...验证通过");
        }catch(UnknownAccountException uae){
            System.out.println("对用户[" + username + "]进行登录验证...验证未通过，未知账户");
            request.setAttribute("message_login", "未知账户");
        }catch(IncorrectCredentialsException ice){
            System.out.println("对用户[" + username + "]进行登录验证...验证未通过，错误的凭证");
            request.setAttribute("message_login", "密码不正确");
        }catch(LockedAccountException lae){
            System.out.println("对用户[" + username + "]进行登录验证...验证未通过，账户已锁定");
            request.setAttribute("message_login", "账户已锁定");
        }catch(ExcessiveAttemptsException eae){
            System.out.println("对用户[" + username + "]进行登录验证...验证未通过，错误次数过多");
            request.setAttribute("message_login", "用户名或密码错误次数过多");
        }catch(AuthenticationException ae){
            //通过处理Shiro的运行时AuthenticationException就可以控制用户登录失败或密码错误时的情景
            System.out.println("对用户[" + username + "]进行登录验证...验证未通过，堆栈轨迹如下");
            ae.printStackTrace();
            request.setAttribute("message_login", "用户名或密码不正确");
        }
        //验证是否登录成功
        if(currentUser.isAuthenticated()){
            System.out.println("用户[" + username + "]登录认证通过（这里可进行一些认证通过后的系统参数初始化操作）");
            return "main";
        }else{
            token.clear();
            return InternalResourceViewResolver.FORWARD_URL_PREFIX + "/";
        }
    }
}
```

下面是登录页面 `/WebRoot/login.jsp`

```html
<%@ page language="java" pageEncoding="UTF-8"%>

<div style="color:red; font-size:22px;">${message_login}</div>

<form action="${pageContext.request.contextPath}/mydemo/login" method="POST">
    姓名：<input type="text" name="username"/><br/>
    密码：<input type="text" name="password"/><br/>
    验证：<input type="text" name="captcha"/>&nbsp;
         <img style="cursor:pointer;" src="/captcha.jsp" onClick="this.src='/captcha.jsp?time'+Math.random();"/><br/>
         <input type="submit"/>
</form>
<!-- captcha.jsp源码见https://github.com/jadyer/JadyerEngine/blob/master/JadyerEngine-web/src/main/webapp/captcha.jsp -->
```

下面这个是登录后的首页 `/WebRoot/main.jsp`

注：本例中设置了 **/tomain** 请求也能访问到该页面，详见applicationContext.xml

```html
<%@ page language="java" pageEncoding="UTF-8"%>
当前登录的用户为：${currentUser}
<br>
<br>
<a href="${pageContext.request.contextPath}/user/info-anon.jsp" target="_blank">匿名用户可访问的页面</a>
<br>
<br>
<a href="${pageContext.request.contextPath}/user/info.jsp" target="_blank">普通用户可访问的页面</a>
<br>
<br>
<a href="${pageContext.request.contextPath}/admin/list.jsp" target="_blank">管理员可访问的页面</a>
<br>
<br>
<a href="${pageContext.request.contextPath}/mydemo/logout" target="_blank">Logout</a>
```

最后分别依次列出：匿名用户、普通用户、管理员，各自能够访问的页面

```sh
# 这是匿名用户能够访问的/WebRoot/user/info-anon.jsp
<%@ page language="java" pageEncoding="UTF-8"%>
这是允许匿名用户查看的页面

# 这是普通用户能够访问的/WebRoot/user/info.jsp
<%@ page language="java" pageEncoding="UTF-8"%>
当前登录的用户为：${currentUser}
<br>
<br>
这是允许普通用户查看的页面

# 这是管理员能够访问的/WebRoot/admin/list.jsp
<%@ page language="java" pageEncoding="UTF-8"%>
当前登录的用户为：${currentUser}
<br>
<br>
这是允许管理员查看的页面
```

## 控制台输出

这是不同用户登录的控制台输出（先用 xuanyu 登录，后用 jadyer 登录）

```
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.
*****************************************************************
[INFO] Server running in 2328ms at http://127.0.0.1/
*****************************************************************

-------------------------------------------------------
用户[xuanyu]登录时输入的验证码为[5910]，HttpSession中的验证码为[5912]
-------------------------------------------------------
用户[xuanyu]登录时输入的验证码为[3254]，HttpSession中的验证码为[3254]
为验证登录用户而封装的Token：org.apache.shiro.authc.UsernamePasswordToken@4057627c[
  username=xuanyu
  password={t,e,s,t,p,w,d}
  rememberMe=true
  host=<null>
]
对用户[xuanyu]进行登录验证...验证开始
验证当前Subject时获取到token：org.apache.shiro.authc.UsernamePasswordToken@4057627c[
  username=xuanyu
  password={t,e,s,t,p,w,d}
  rememberMe=true
  host=<null>
]
当前Session超时时间为[2700000]毫秒
修改Session超时时间为[7200000]毫秒
对用户[xuanyu]进行登录验证...验证未通过，错误的凭证
-------------------------------------------------------
用户[xuanyu]登录时输入的验证码为[4660]，HttpSession中的验证码为[4660]
为验证登录用户而封装的Token：org.apache.shiro.authc.UsernamePasswordToken@6e6b4b4a[
  username=xuanyu
  password={x,u,a,n,y,u}
  rememberMe=true
  host=<null>
]
对用户[xuanyu]进行登录验证...验证开始
验证当前Subject时获取到token：org.apache.shiro.authc.UsernamePasswordToken@6e6b4b4a[
  username=xuanyu
  password={x,u,a,n,y,u}
  rememberMe=true
  host=<null>
]
当前Session超时时间为[7200000]毫秒
修改Session超时时间为[7200000]毫秒
对用户[xuanyu]进行登录验证...验证通过
用户[xuanyu]登录认证通过（这里可进行一些认证通过后的系统参数初始化操作）
用户[xuanyu]准备登出
用户[xuanyu]已登出
-------------------------------------------------------
用户[jadyer]登录时输入的验证码为[2596]，HttpSession中的验证码为[2596]
为验证登录用户而封装的Token：org.apache.shiro.authc.UsernamePasswordToken@6deaf3ce[
  username=jadyer
  password={j,a,d,y,e,r}
  rememberMe=true
  host=<null>
]
对用户[jadyer]进行登录验证...验证开始
验证当前Subject时获取到token：org.apache.shiro.authc.UsernamePasswordToken@6deaf3ce[
  username=jadyer
  password={j,a,d,y,e,r}
  rememberMe=true
  host=<null>
]
当前Session超时时间为[2700000]毫秒
修改Session超时时间为[7200000]毫秒
对用户[jadyer]进行登录验证...验证通过
用户[jadyer]登录认证通过（这里可进行一些认证通过后的系统参数初始化操作）
已为用户[jadyer]赋予了[admin]角色和[admin:manage]权限
```

下面是对应控制台输出的一些辅助截图

![](/img/2013/2013-09-30-springmvc-shiro-01.png)

![](/img/2013/2013-09-30-springmvc-shiro-02.png)

![](/img/2013/2013-09-30-springmvc-shiro-03.png)

![](/img/2013/2013-09-30-springmvc-shiro-04.png)

![](/img/2013/2013-09-30-springmvc-shiro-05.png)

![](/img/2013/2013-09-30-springmvc-shiro-06.png)

## 内置的FilterChain

运行 Web 应用时，Shiro会创建一些有用的默认 Filter 实例，并自动地在 [main] 项中将它们置为可用

这些可用的默认的 Filter 实例是被 DefaultFilter 枚举类定义的（枚举的名称字段就是可供配置的名称）

通常可将这些过滤器分为以下两组

1. 第一组认证过滤器：anon、authc、authcBasic、user
2. 第二组授权过滤器：perms、port、rest、roles、ssl

 * ssl                ：org.apache.shiro.web.filter.authz.SslFilter
 * user               ：org.apache.shiro.web.filter.authz.UserFilter
 * anon               ：org.apache.shiro.web.filter.authc.AnonymousFilter
 * port               ：org.apache.shiro.web.filter.authz.PortFilter
 * rest               ：org.apache.shiro.web.filter.authz.HttpMethodPermissionFilter
 * authc              ：org.apache.shiro.web.filter.authc.FormAuthenticationFilter
 * perms              ：org.apache.shiro.web.filter.authz.PermissionAuthorizationFilter
 * roles              ：org.apache.shiro.web.filter.authz.RolesAuthorizationFilter
 * logout             ：org.apache.shiro.web.filter.authc.LogoutFilter
 * authcBasic         ：org.apache.shiro.web.filter.authc.BasicHttpAuthenticationFilter
 * noSessionCreation  ：org.apache.shiro.web.filter.session.NoSessionCreationFilter
 * 注意 user 和 authc 不同

    > 当应用开启了rememberMe时，用户下次访问时可以是一个user，但绝不会是authc，因为authc是需要重新认证的<br>
    user表示用户不一定已通过认证，只要曾被Shiro记住过登录状态的用户就可以正常发起请求，比如rememberMe<br>
    说白了：以前的一个用户登录时开启了rememberMe，然后他关闭浏览器，下次再访问时他就是一个user，而不会authc

下面举几个例子介绍一下（注意URLPattern写的是两颗星，这样才能实现任意层次的全匹配）

1. `/admin/**=anon`               ：无参，表示可匿名访问
2. `/admin/user/**=authc`         ：无参，表示需要认证才能访问
3. `/admin/user/**=authcBasic`    ：无参，表示需要httpBasic认证才能访问
4. `/admin/user/**=ssl`           ：无参，表示需要安全的URL请求，协议为https
5. `/home=user`                   ：表示用户不一定需要通过认证，只要曾被 Shiro 记住过登录状态就可以正常发起 /home 请求
6. `/edit=authc,perms[admin:edit]`：表示用户必需已通过认证，并拥有 admin:edit 权限才可以正常发起 /edit 请求
7. `/admin=authc,roles[admin]`    ：表示用户必需已通过认证，并拥有 admin 角色才可以正常发起 /admin 请求
8. `/admin/user/**=port[8081]`    ：当请求的URL端口不是8081时，跳转到schemal://serverName:8081?queryString
9. `/admin/user/**=rest[user]`    ：根据请求方式来识别，相当于 `/admins/user/**=perms[user:get]或perms[user:post]` 等等
10. `/admin**=roles["admin,guest"]`          ：允许多个参数（逗号分隔），此时要全部通过才算通过，相当于hasAllRoles()
11. `/admin**=perms["user:add:*,user:del:*"]`：允许多个参数（逗号分隔），此时要全部通过才算通过，相当于isPermitedAll()