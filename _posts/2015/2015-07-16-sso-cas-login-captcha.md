---
layout: post
title: "CAS系列第03节之登录页添加验证码"
categories: SSO
tags: sso cas
author: 玄玉
excerpt: 主要描述CAS-4.0.3服务端登录页添加验证码的方法。
---

* content
{:toc}


## 原理

> 啰嗦一句：这年头验证码一般用来防止帐号被暴力破解，若系统走专线（也就是说放在内网），那完全没必要搞验证码

1、由于CAS使用了SpringWebFlow，所以我们想在登录页表单中增加属性就直接找`\WEB-INF\login-webflow.xml`

2、在第84行`<view-state id="viewLoginForm">`中找到表单的两个属性，我们加一个**<binding property="captcha"/>**

　　同样该标签中会发现model="credential"配置，所以我们就在该文件找credential对应的实体类配置

　　发现是在第27行设置的，其值为org.jasig.cas.authentication.UsernamePasswordCredential

　　这是一个用来接收前台表单参数的JavaBean，我们这里要在表单上加一个参数captcha，所以继承它就行了

3、创建com.jadyer.sso.model.UsernamePasswordCaptchaCredential extends UsernamePasswordCredential

　　再加上captcha属性，及其对应的setter和getter

　　再修改login-webflow.xml第27行credential对应实体类为com.jadyer.sso.model.UsernamePasswordCaptchaCredential

4、接下来添加校验验证码的流程

　　继续看<view-state id="viewLoginForm">，这里我们会发现表单实际的提交等动作是由authenticationViaFormAction处理的

　　authenticationViaFormAction是被配置在cas-servlet.xml中的第233行

　　我们要在原有表单处理逻辑的基础上增加验证码，所以就扩展authenticationViaFormAction

　　创建com.jadyer.sso.authentication.AuthenticationViaCaptchaFormAction extends AuthenticationViaFormAction

　　在AuthenticationViaCaptchaFormAction中增加一个validateCaptcha()方法用来校验验证码

　　然后将cas-servlet.xml中的authenticationViaFormAction改为新扩展的AuthenticationViaCaptchaFormAction

　　同样login-webflow.xml中的三处authenticationViaFormAction改为新扩展的AuthenticationViaCaptchaFormAction

5、最后把messages.properties的一些提示文字改为中文

　　required.username=必须输入帐号

　　required.password=必须输入密码

　　required.captcha=必须输入验证码

　　error.authentication.captcha.bad=验证码不正确

　　authenticationFailure.AccountNotFoundException=登录失败--帐号不正确

　　authenticationFailure.FailedLoginException=登录失败--密码不正确

　　authenticationFailure.UNKNOWN=未知错误

## 代码

本文源码下载：[http://download.csdn.net/detail/jadyer/8906831](http://download.csdn.net/detail/jadyer/8906831)

下面是`login-webflow.xml`中的改动部分

```xml
<!-- <var name="credential" class="org.jasig.cas.authentication.UsernamePasswordCredential"/> -->
<!-- 新加的用于接收前台表单验证码字段captcha的JavaBean -->
<var name="credential" class="com.jadyer.sso.model.UsernamePasswordCaptchaCredential"/>

<view-state id="viewLoginForm" view="casLoginView" model="credential">
    <binder>
        <binding property="username"/>
        <binding property="password"/>
        <!-- 前台添加表单添加验证码字段captcha -->
        <binding property="captcha"/>
    </binder>
    <on-entry>
        <set name="viewScope.commandName" value="'credential'"/>
    </on-entry>
    <transition on="submit" bind="true" validate="true" to="validateCaptcha">
        <evaluate expression="authenticationViaCaptchaFormAction.doBind(flowRequestContext, flowScope.credential)"/>
    </transition>
</view-state>

<!-- 新添加的校验验证码 -->
<action-state id="validateCaptcha">
    <evaluate expression="authenticationViaCaptchaFormAction.validateCaptcha(flowRequestContext, flowScope.credential, messageContext)"/>
    <transition on="error" to="generateLoginTicket"/>
    <transition on="success" to="realSubmit"/>
</action-state>

<action-state id="realSubmit">
    <evaluate expression="authenticationViaCaptchaFormAction.submit(flowRequestContext, flowScope.credential, messageContext)"/>
    <transition on="warn" to="warn"/>
    <transition on="success" to="sendTicketGrantingTicket"/>
    <transition on="successWithWarnings" to="showMessages"/>
    <transition on="authenticationFailure" to="handleAuthenticationFailure"/>
    <transition on="error" to="generateLoginTicket"/>
</action-state>
```

下面是扩展的`UsernamePasswordCaptchaCredential.java`

```java
package com.jadyer.sso.model;
import org.jasig.cas.authentication.UsernamePasswordCredential;

/**
 * 自定义的接收登录验证码的实体类
 * Created by 玄玉<https://jadyer.github.io/> on 2015/07/14 16:28.
 */
public class UsernamePasswordCaptchaCredential extends UsernamePasswordCredential {
    private static final long serialVersionUID = 8317889802836113837L;
    private String captcha;
    /*-- setter和getter略 --*/
}
```

下面是扩展的`AuthenticationViaCaptchaFormAction.java`

```java
package com.jadyer.sso.authentication;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import org.jasig.cas.authentication.Credential;
import org.jasig.cas.web.flow.AuthenticationViaFormAction;
import org.jasig.cas.web.support.WebUtils;
import org.springframework.binding.message.MessageBuilder;
import org.springframework.binding.message.MessageContext;
import org.springframework.util.StringUtils;
import org.springframework.webflow.execution.RequestContext;
import com.jadyer.sso.model.UsernamePasswordCaptchaCredential;

/**
 * 自定义的处理验证码登录逻辑的Action
 * Created by 玄玉<https://jadyer.github.io/> on 2015/07/14 16:28.
 */
public class AuthenticationViaCaptchaFormAction extends AuthenticationViaFormAction {
    public final String validateCaptcha(final RequestContext context, final Credential credential, final MessageContext messageContext){
        final HttpServletRequest request = WebUtils.getHttpServletRequest(context);
        HttpSession session = request.getSession();
        String rand = (String)session.getAttribute("rand");
        session.removeAttribute("rand");
        UsernamePasswordCaptchaCredential upc = (UsernamePasswordCaptchaCredential)credential;
        String captcha = upc.getCaptcha();
        System.out.println("获取Session验证码-->" + rand);
        System.out.println("获取表单输入验证码-->" + captcha);
        if(!StringUtils.hasText(rand) || !StringUtils.hasText(captcha)){
            messageContext.addMessage(new MessageBuilder().error().code("required.captcha").build());
            return "error";
        }
        if(captcha.equals(rand)){
            return "success";
        }
        //这段网上这么写的messageContext.addMessage(new MessageBuilder().code("required.captcha").build());
        //实际上这么写是org.springframework.binding.message.INFO级别的，这会导致前台表单无法显示这里的错误信息
        messageContext.addMessage(new MessageBuilder().error().code("error.authentication.captcha.bad").build());
        return "error";
    }
}
```

下面是`cas-servlet.xml`中的改动部分

```xml
<!--
<bean id="authenticationViaFormAction" class="org.jasig.cas.web.flow.AuthenticationViaFormAction"
        p:centralAuthenticationService-ref="centralAuthenticationService"
        p:warnCookieGenerator-ref="warnCookieGenerator"
        p:ticketRegistry-ref="ticketRegistry"/>
 -->
<!-- 新添加的用于校验验证码的Action -->
<bean id="authenticationViaCaptchaFormAction" class="com.jadyer.sso.authentication.AuthenticationViaCaptchaFormAction"
        p:centralAuthenticationService-ref="centralAuthenticationService"
        p:warnCookieGenerator-ref="warnCookieGenerator"
        p:ticketRegistry-ref="ticketRegistry"/>
```

下面是我的登录成功页`\WEB-INF\view\jsp\jadyer\ui\casGenericSuccess.jsp`

```html
<%@ page pageEncoding="UTF-8"%>
<body style="background-color:#CBE0C9;">
    <span style="color:red; font-size:64px; font-weight:bold;">登录成功</span>
</body>
```

下面是我的登录页`\WEB-INF\view\jsp\jadyer\ui\casLoginView.jsp`

```html
<%@ page pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>

<c:set var="ctx" value="${pageContext.request.contextPath}" scope="session"/>

<!DOCTYPE HTML>
<html>
<head>
    <meta charset="UTF-8"/>
    <title>CAS单点登录系统</title>
    <link rel="icon" type="image/x-icon" href="${ctx}/favicon.ico"/>
    <script type="text/javascript" src="${ctx}/js/jquery-1.10.2.min.js"></script>
    <script type="text/javascript" src="${ctx}/js/jquery-ui-1.10.2.min.js"></script>
    <script type="text/javascript" src="${ctx}/js/cas.js"></script>
    <!--[if lt IE 9]>
        <script src="${ctx}/js/html5shiv-3.7.2.min.js" type="text/javascript"></script>
    <![endif]-->
</head>

<style>
body {background-color: #CBE0C9;}
#msg {padding:20px; margin-bottom:10px;}
#msg.errors {border:1px dotted #BB0000; color:#BB0000; padding-left:100px; background:url(${ctx}/images/error.gif) no-repeat 20px center;}
</style>

<body>
<c:if test="${not pageContext.request.secure}">
    <div id="msg" class="errors">
        <h2>Non-secure Connection</h2>
        <p>You are currently accessing CAS over a non-secure connection.  Single Sign On WILL NOT WORK.  In order to have single sign on work, you MUST log in over HTTPS.</p>
    </div>
</c:if>
<form:form method="post" commandName="${commandName}" htmlEscape="true">
    <!--
    cssClass用于指定表单元素CSS样式名,相当于HTML元素的class属性
    cssStyle用于指定表单元素样式,相当于HTML元素的style属性
    cssErrorClass用于指定表单元素发生错误时对应的样式
    path属性用于绑定表单对象的属性值,它支持级联属性,比如path="user.userName"将调用表单对象getUser.getUserName()绑定表单对象的属性值
     -->
    <form:errors path="*" id="msg" cssClass="errors" element="div" htmlEscape="false"/>
    <input type="hidden" name="lt" value="${loginTicket}"/>
    <input type="hidden" name="execution" value="${flowExecutionKey}"/>
    <input type="hidden" name="_eventId" value="submit"/>
    <table border="9">
        <tr>
            <td>
                <c:if test="${not empty sessionScope.openIdLocalId}">
                    <strong>${sessionScope.openIdLocalId}</strong>
                    <input type="hidden" name="username" value="${sessionScope.openIdLocalId}"/>
                </c:if>
                <c:if test="${empty sessionScope.openIdLocalId}">
                    <form:input tabindex="1" path="username" placeholder="帐号" htmlEscape="true" maxlength="16" size="25"/>
                </c:if>
            </td>
        </tr>
        <tr>
            <td>
                <form:password tabindex="2" path="password" placeholder="密码" htmlEscape="true" maxlength="16" size="25"/>
            </td>
        </tr>
        <tr>
            <td>
                <form:input tabindex="3" path="captcha" placeholder="验证码" htmlEscape="true" maxlength="4" size="15"/>
                <img style="cursor:pointer; vertical-align:middle;" src="captcha.jsp" onClick="this.src='captcha.jsp?time'+Math.random();">
            </td>
        </tr>
        <%--
        <tr>
            <td>
                <input type="checkbox" tabindex="3" name="warn" value="true"/>
                <label for="warn">转向其他站点前提示我</label>
            </td>
        </tr>
        --%>
        <tr>
            <td>
                <input type="submit" tabindex="3" value="登录"/>
            </td>
        </tr>
    </table>
</form:form>
</body>
</html>
```

最后是用到的用于生成验证码的`\WebRoot\captcha.jsp`

```java
<%@ page contentType="image/jpeg; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.awt.Color"%>
<%@ page import="java.util.Random"%>
<%@ page import="java.awt.image.BufferedImage"%>
<%@ page import="java.awt.Graphics"%>
<%@ page import="java.awt.Font"%>
<%@ page import="javax.imageio.ImageIO"%>

<%--
这是一个用于生成随机验证码图片的JSP文件
这里contentType="image/jpeg"用来告诉容器:该JSP文件的输出格式为图片格式
登录网站时,通常要求输入随机生成的验证码,这是为了防止有些软件会自动生成破解密码
这些验证码一般都是通过图片显示出来的,并且图片上有很多不规则的线条或者图案来干扰,使得软件不容易识别图案上的验证码
--%>

<%!
/**
 * 定义验证码类型
 * @see 1--纯数字,2--纯汉字
 * @see 这里也支持数字和英文字母组合,但考虑到不好辨认,故注释了这部分代码,详见69行
 */
int captchaType = 1;

/**
 * 生成给定范围内的随机颜色
 */
Color getRandColor(Random random, int fc, int bc){
    if(fc>255) fc = 255;
    if(bc>255) bc = 255;
    int r = fc + random.nextInt(bc-fc);
    int g = fc + random.nextInt(bc-fc);
    int b = fc + random.nextInt(bc-fc);
    return new Color(r, g, b);
}
%>

<%
//设置页面不缓存
response.setHeader("Pragma", "No-cache");
response.setHeader("Cache-Control", "no-cache");
response.setDateHeader("Expires", 0);

//创建随机类实例
Random random = new Random();
//定义图片尺寸
int width=60*this.captchaType, height=(this.captchaType==1)?20:30;
//创建内存图像
BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
//获取图形上下文
Graphics g = image.getGraphics();
//设定背景色
g.setColor(this.getRandColor(random, 200, 250));
//设定图形的矩形坐标及尺寸
g.fillRect(0, 0, width, height);

String sRand = "";
if(this.captchaType == 1){
    //图片背景随机产生50条干扰线作为噪点
    g.setColor(this.getRandColor(random, 160, 200));
    g.setFont(new Font("Times New Roman", Font.PLAIN, 18));
    for(int i=0; i<50; i++){
        int x11 = random.nextInt(width);
        int y11 = random.nextInt(height);
        int x22 = random.nextInt(width);
        int y22 = random.nextInt(height);
        g.drawLine(x11, y11, x11+x22, y11+y22);
    }
    //取随机产生的4个数字作为验证码
    //String str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    //String str = "abcdefghkmnpqrstwxyABCDEFGHJKLMNPRSTWXYZ123456789";
    for(int i=0; i<4; i++){
        //String rand = String.valueOf(str.charAt(random.nextInt(62)));
        //String rand = String.valueOf(str.charAt(random.nextInt(49)));
        String rand = String.valueOf(random.nextInt(10));
        sRand += rand;
        g.setColor(this.getRandColor(random, 10, 150));
        //将此数字画到图片上
        g.drawString(rand, 13*i+6, 16);
    }
}else{
    //设定备选汉字
    String base = "\u7684\u4e00\u4e86\u662f\u6211\u4e0d\u5728\u4eba\u4eec\u6709\u6765\u4ed6\u8fd9\u4e0a\u7740" +
                  "\u4e2a\u5730\u5230\u5927\u91cc\u8bf4\u5c31\u53bb\u5b50\u5f97\u4e5f\u548c\u90a3\u8981\u4e0b" +
                  "\u770b\u5929\u65f6\u8fc7\u51fa\u5c0f\u4e48\u8d77\u4f60\u90fd\u628a\u597d\u8fd8\u591a\u6ca1" +
                  "\u4e3a\u53c8\u53ef\u5bb6\u5b66\u53ea\u4ee5\u4e3b\u4f1a\u6837\u5e74\u60f3\u751f\u540c\u8001" +
                  "\u4e2d\u5341\u4ece\u81ea\u9762\u524d\u5934\u9053\u5b83\u540e\u7136\u8d70\u5f88\u50cf\u89c1" +
                  "\u4e24\u7528\u5979\u56fd\u52a8\u8fdb\u6210\u56de\u4ec0\u8fb9\u4f5c\u5bf9\u5f00\u800c\u5df1" +
                  "\u4e9b\u73b0\u5c71\u6c11\u5019\u7ecf\u53d1\u5de5\u5411\u4e8b\u547d\u7ed9\u957f\u6c34\u51e0" +
                  "\u4e49\u4e09\u58f0\u4e8e\u9ad8\u624b\u77e5\u7406\u773c\u5fd7\u70b9\u5fc3\u6218\u4e8c\u95ee" +
                  "\u4f46\u8eab\u65b9\u5b9e\u5403\u505a\u53eb\u5f53\u4f4f\u542c\u9769\u6253\u5462\u771f\u5168" +
                  "\u624d\u56db\u5df2\u6240\u654c\u4e4b\u6700\u5149\u4ea7\u60c5\u8def\u5206\u603b\u6761\u767d" +
                  "\u8bdd\u4e1c\u5e2d\u6b21\u4eb2\u5982\u88ab\u82b1\u53e3\u653e\u513f\u5e38\u6c14\u4e94\u7b2c" +
                  "\u4f7f\u5199\u519b\u5427\u6587\u8fd0\u518d\u679c\u600e\u5b9a\u8bb8\u5feb\u660e\u884c\u56e0" +
                  "\u522b\u98de\u5916\u6811\u7269\u6d3b\u90e8\u95e8\u65e0\u5f80\u8239\u671b\u65b0\u5e26\u961f" +
                  "\u5148\u529b\u5b8c\u5374\u7ad9\u4ee3\u5458\u673a\u66f4\u4e5d\u60a8\u6bcf\u98ce\u7ea7\u8ddf" +
                  "\u7b11\u554a\u5b69\u4e07\u5c11\u76f4\u610f\u591c\u6bd4\u9636\u8fde\u8f66\u91cd\u4fbf\u6597" +
                  "\u9a6c\u54ea\u5316\u592a\u6307\u53d8\u793e\u4f3c\u58eb\u8005\u5e72\u77f3\u6ee1\u65e5\u51b3" +
                  "\u767e\u539f\u62ff\u7fa4\u7a76\u5404\u516d\u672c\u601d\u89e3\u7acb\u6cb3\u6751\u516b\u96be" +
                  "\u65e9\u8bba\u5417\u6839\u5171\u8ba9\u76f8\u7814\u4eca\u5176\u4e66\u5750\u63a5\u5e94\u5173" +
                  "\u4fe1\u89c9\u6b65\u53cd\u5904\u8bb0\u5c06\u5343\u627e\u4e89\u9886\u6216\u5e08\u7ed3\u5757" +
                  "\u8dd1\u8c01\u8349\u8d8a\u5b57\u52a0\u811a\u7d27\u7231\u7b49\u4e60\u9635\u6015\u6708\u9752" +
                  "\u534a\u706b\u6cd5\u9898\u5efa\u8d76\u4f4d\u5531\u6d77\u4e03\u5973\u4efb\u4ef6\u611f\u51c6" +
                  "\u5f20\u56e2\u5c4b\u79bb\u8272\u8138\u7247\u79d1\u5012\u775b\u5229\u4e16\u521a\u4e14\u7531" +
                  "\u9001\u5207\u661f\u5bfc\u665a\u8868\u591f\u6574\u8ba4\u54cd\u96ea\u6d41\u672a\u573a\u8be5" +
                  "\u5e76\u5e95\u6df1\u523b\u5e73\u4f1f\u5fd9\u63d0\u786e\u8fd1\u4eae\u8f7b\u8bb2\u519c\u53e4" +
                  "\u9ed1\u544a\u754c\u62c9\u540d\u5440\u571f\u6e05\u9633\u7167\u529e\u53f2\u6539\u5386\u8f6c" +
                  "\u753b\u9020\u5634\u6b64\u6cbb\u5317\u5fc5\u670d\u96e8\u7a7f\u5185\u8bc6\u9a8c\u4f20\u4e1a" +
                  "\u83dc\u722c\u7761\u5174\u5f62\u91cf\u54b1\u89c2\u82e6\u4f53\u4f17\u901a\u51b2\u5408\u7834" +
                  "\u53cb\u5ea6\u672f\u996d\u516c\u65c1\u623f\u6781\u5357\u67aa\u8bfb\u6c99\u5c81\u7ebf\u91ce" +
                  "\u575a\u7a7a\u6536\u7b97\u81f3\u653f\u57ce\u52b3\u843d\u94b1\u7279\u56f4\u5f1f\u80dc\u6559" +
                  "\u70ed\u5c55\u5305\u6b4c\u7c7b\u6e10\u5f3a\u6570\u4e61\u547c\u6027\u97f3\u7b54\u54e5\u9645" +
                  "\u65e7\u795e\u5ea7\u7ae0\u5e2e\u5566\u53d7\u7cfb\u4ee4\u8df3\u975e\u4f55\u725b\u53d6\u5165" +
                  "\u5cb8\u6562\u6389\u5ffd\u79cd\u88c5\u9876\u6025\u6797\u505c\u606f\u53e5\u533a\u8863\u822c" +
                  "\u62a5\u53f6\u538b\u6162\u53d4\u80cc\u7ec6";
    //图片背景增加噪点
    g.setColor(this.getRandColor(random, 160, 200));
    g.setFont(new Font("Times New Roman", Font.PLAIN, 14));
    for(int i=0; i<6; i++){
        g.drawString("*********************************************", 0, 5*(i+2));
    }
    //设定验证码汉字的备选字体{"宋体", "新宋体", "黑体", "楷体", "隶书"}
    String[] fontTypes = {"\u5b8b\u4f53", "\u65b0\u5b8b\u4f53", "\u9ed1\u4f53", "\u6977\u4f53", "\u96b6\u4e66"};
    //取随机产生的4个汉字作为验证码
    for(int i=0; i<4; i++){
        int start = random.nextInt(base.length());
        String rand = base.substring(start, start+1);
        sRand += rand;
        g.setColor(this.getRandColor(random, 10, 150));
        g.setFont(new Font(fontTypes[random.nextInt(fontTypes.length)], Font.BOLD, 18+random.nextInt(4)));
        //将此汉字画到图片上
        g.drawString(rand, 24*i+10+random.nextInt(8), 24);
    }
}

//将验证码存入SESSION
session.setAttribute("rand", sRand);
//图像生效
g.dispose();
//输出图像到页面
ImageIO.write(image, "PNG", response.getOutputStream());

//若无下面两行代码,则每次请求生成验证码图片时,尽管不会影响到图片的生成以及验证码的校验,但控制台都会滚动下面的异常
//java.lang.IllegalStateException: getOutputStream() has already been called for this response
out.clear();
out = pageContext.pushBody();
%>
```

## 效果图

![](/img/2015/2015-07-16-sso-cas-login-captcha-01.png)

![](/img/2015/2015-07-16-sso-cas-login-captcha-02.png)

![](/img/2015/2015-07-16-sso-cas-login-captcha-03.png)

![](/img/2015/2015-07-16-sso-cas-login-captcha-04.png)

![](/img/2015/2015-07-16-sso-cas-login-captcha-05.png)

![](/img/2015/2015-07-16-sso-cas-login-captcha-06.png)