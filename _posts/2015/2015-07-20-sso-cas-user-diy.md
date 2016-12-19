---
layout: post
title: "CAS系列第05节之服务端自定义返回的用户信息"
categories: SSO
tags: sso cas
author: 玄玉
excerpt: 主要描述CAS-4.0.3服务端自定义返回的用户信息的功能。
---

* content
{:toc}


## 原理

返回的用户信息是在`deployerConfigContext.xml`中的<bean id="attributeRepository">配置的

既然想自定义返回的用户信息，那么继承org.jasig.services.persondir.support.StubPersonAttributeDao就好了

1、创建com.jadyer.sso.authentication extends StubPersonAttributeDao并复写getPerson()方法

　　使用@Component(value="attributeRepository")定义它的BeanID

2、注释`deployerConfigContext.xml`中的`<bean id="attributeRepository">`和`<util:map id="attrRepoBackingMap">`配置

3、修改`\WEB-INF\view\jsp\protocol\2.0\casServiceValidationSuccess.jsp`（不要改3.0下面的）

**具体改动，详见下方贴出的代码**

另外：返回给客户端的相关信息是由org.jasig.services.persondir.IPersonAttributeDao接口定义的

StubPersonAttributeDao就是IPersonAttributeDao的实现之一

其它实现如SingleRowJdbcPersonAttributeDao、LdapPersonAttributeDao等

所以也可在deployerConfigContext.xml中配置<bean id="attributeRepository">的实现为SingleRowJdbcPersonAttributeDao

也就是`<bean id="attributeRepository" class="org.jasig...persondir.support.jdbc.SingleRowJdbcPersonAttributeDao">`

不过，个人觉得这样不是很灵活，所以就不贴示例代码了

## 代码

下面是自定义的控制返回的用户信息的`UserStubPersonAttributeDao.java`

```java
package com.jadyer.sso.authentication;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.Resource;
import org.jasig.services.persondir.IPersonAttributes;
import org.jasig.services.persondir.support.AttributeNamedPersonImpl;
import org.jasig.services.persondir.support.StubPersonAttributeDao;
import org.springframework.stereotype.Component;
import com.jadyer.sso.model.User;

/**
 * 自定义的返回给客户端相关信息
 * Created by 玄玉<https://jadyer.github.io/> on 2015/07/18 17:52.
 */
@Component(value="attributeRepository")
public class UserStubPersonAttributeDao extends StubPersonAttributeDao {
    @Resource
    private UserDaoJdbc userDaoJdbc;
    @Override
    public IPersonAttributes getPerson(String uid) {
        Map<String, List<Object>> attributes = new HashMap<String, List<Object>>();
        try {
            User user = userDaoJdbc.getByUsername(uid);
            attributes.put("userId", Collections.singletonList((Object)user.getUsercode()));
            attributes.put("username", Collections.singletonList((Object)user.getUsername()));
            attributes.put("usernamePlain", Collections.singletonList((Object)URLEncoder.encode(user.getUsernamePlain(), "UTF-8")));
            attributes.put("blogURL", Collections.singletonList((Object)"http://blog.csdn.net/jadyer"));
            attributes.put("blogger", Collections.singletonList((Object)URLEncoder.encode("玄玉", "UTF-8")));
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return new AttributeNamedPersonImpl(attributes);
    }
}
```

下面是用到的查询数据库的`UserDaoJdbc.java`

```java
package com.jadyer.sso.authentication;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.annotation.Resource;
import javax.sql.DataSource;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import com.msxf.sso.model.User;

@Repository
public class UserDaoJdbc {
    private static final String SQL_USER_VERIFY = "SELECT COUNT(*) FROM permission_operator WHERE operator_login=? AND operator_pwd=SHA1(?)";
    private static final String SQL_USER_GET = "SELECT * FROM permission_operator WHERE operator_login=?";
    private JdbcTemplate jdbcTemplate;
    @Resource
    public void setDataSource(DataSource dataSource){
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }
    public boolean verifyAccount(String username, String password){
        try{
            //验证用户名和密码是否正确
            return 1==this.jdbcTemplate.queryForObject(SQL_USER_VERIFY, new Object[]{username, password}, Integer.class);
        }catch(EmptyResultDataAccessException e){
            return false;
        }
    }
    public User getByUsername(String username){
        try{
            //根据用户名获取用户信息
            return (User)this.jdbcTemplate.queryForObject(SQL_USER_GET, new Object[]{username}, new UserRowMapper());
        }catch(EmptyResultDataAccessException e){
            return new User();
        }
    }
}

class UserRowMapper implements RowMapper<User> {
    @Override
    public User mapRow(ResultSet rs, int index) throws SQLException {
        User user = new User();
        user.setUsercode(rs.getString("operator_code"));
        user.setUsername(rs.getString("operator_login"));
        user.setUsernamePlain(rs.getString("operator_name"));
        return user;
    }
}
```

下面是用到的`User.java`

```java
package com.jadyer.sso.model;
public class User {
    private String usercode;
    private String username;
    private String usernamePlain;
    /*-- setter和getter略 --*/
}
```

下面是`deployerConfigContext.xml`的修改部分

```xml
<!-- 注释掉默认的attributeRepository实现，采用自定义的UserStubPersonAttributeDao -->
<!--
<bean id="attributeRepository" class="org.jasig.services.persondir.support.StubPersonAttributeDao"
       p:backingMap-ref="attrRepoBackingMap" />

<util:map id="attrRepoBackingMap">
   <entry key="uid" value="uid" />
   <entry key="eduPersonAffiliation" value="eduPersonAffiliation" />
   <entry key="groupMembership" value="groupMembership" />
</util:map>
-->
```

下面是`\WEB-INF\view\jsp\protocol\2.0\casServiceValidationSuccess.jsp`

```html
<%--

    Licensed to Jasig under one or more contributor license
    agreements. See the NOTICE file distributed with this work
    for additional information regarding copyright ownership.
    Jasig licenses this file to you under the Apache License,
    Version 2.0 (the "License"); you may not use this file
    except in compliance with the License.  You may obtain a
    copy of the License at the following location:

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.

--%>
<%@ page session="false" contentType="application/xml; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
    <cas:authenticationSuccess>
        <cas:user>${fn:escapeXml(assertion.primaryAuthentication.principal.id)}</cas:user>
        <c:if test="${not empty pgtIou}">
                <cas:proxyGrantingTicket>${pgtIou}</cas:proxyGrantingTicket>
        </c:if>
        <c:if test="${fn:length(assertion.chainedAuthentications) > 1}">
          <cas:proxies>
            <c:forEach var="proxy" items="${assertion.chainedAuthentications}" varStatus="loopStatus" begin="0" end="${fn:length(assertion.chainedAuthentications)-2}" step="1">
                 <cas:proxy>${fn:escapeXml(proxy.principal.id)}</cas:proxy>
            </c:forEach>
          </cas:proxies>
        </c:if>
        <!--
        新增部分如下：CASServer验证成功后，该页面负责生成与客户端交互的XML信息
        默认的casServiceValidationSuccess.jsp中只包括用户名，并不提供其他的属性信息，因此需要对该页面进行扩展
        -->
        <c:if test="${fn:length(assertion.chainedAuthentications[fn:length(assertion.chainedAuthentications)-1].principal.attributes) > 0}">
            <cas:attributes>
                <c:forEach var="attr" items="${assertion.chainedAuthentications[fn:length(assertion.chainedAuthentications)-1].principal.attributes}">
                    <cas:${fn:escapeXml(attr.key)}>${fn:escapeXml(attr.value)}</cas:${fn:escapeXml(attr.key)}>
                </c:forEach>
            </cas:attributes>
        </c:if>
    </cas:authenticationSuccess>
</cas:serviceResponse>
```

最后是客户端获取服务端返回的自定义用户信息的`index.jsp`

```java
<%@ page pageEncoding="UTF-8"%>
<%@ page import="java.util.Map"%>
<%@ page import="java.net.URLDecoder"%>
<%@ page import="org.jasig.cas.client.util.AssertionHolder"%>
<%@ page import="org.jasig.cas.client.authentication.AttributePrincipal"%>

<body style="background-color:#CBE0C9;">
    <span style="color:red; font-size:32px; font-weight:bold;">客户端登录成功</span>
</body>

<hr size="2">

<%
    AttributePrincipal principal = (AttributePrincipal)request.getUserPrincipal();
    Map<String, Object> attributes = principal.getAttributes();
    out.print("principal.getName()=" + principal.getName() + "<br/>");
    out.print("request.getRemoteUser()=" + request.getRemoteUser() + "<br/>");
    out.print("登录用户：" + attributes.get("userId") + "<br/>");
    out.print("登录时间：" + AssertionHolder.getAssertion().getAuthenticationDate() + "<br/>");
    out.print("-----------------------------------------------------------------------<br/>");
    for(Map.Entry<String, Object> entry : attributes.entrySet()){
        //服务端返回中文时需要encode，客户端接收显示中文时需要decode，否则会乱码
        out.print(entry.getKey() + "=" + URLDecoder.decode(entry.getValue().toString(), "UTF-8") + "<br/>");
    }
    out.print("-----------------------------------------------------------------------<br/>");
    Map<String, Object> attributes22 = AssertionHolder.getAssertion().getAttributes();
    for(Map.Entry<String, Object> entry : attributes22.entrySet()){
        out.print(entry.getKey() + "=" + entry.getValue() + "<br/>");
    }
    out.print("-----------------------------------------------------------------------<br/>");
    Map<String, Object> attributes33 = AssertionHolder.getAssertion().getPrincipal().getAttributes();
    for(Map.Entry<String, Object> entry : attributes33.entrySet()){
        out.print(entry.getKey() + "=" + entry.getValue() + "<br/>");
    }
%>
```

## 效果图

关于客户端如何配置（包括通过spring），详见本系列的下一篇博文

（今天头疼还发烧，明天再发客户端的配置方法）

![](/img/2015/2015-07-20-sso-cas-user-diy.png)