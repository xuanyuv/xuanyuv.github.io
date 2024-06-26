---
layout: post
title: "My97DatePicker日期控件用法"
categories: 前端
tags: My97DatePicker 日期 控件
author: 玄玉
excerpt: 介绍My97DatePicker日期控件的一些常用功能。
---

* content
{:toc}


用法很简单，主要演示代码在`myDate.html`

说明：下文中的`｛%`故意写成了全角的，实际应该是半角的`{`（这是为了避免生成静态博文时语义冲突）

```html
<!DOCTYPE HTML>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <!-- 它的官网是http://www.my97.net/ -->
    <!-- 引入它的js(这里用的是My97.DatePicker.4.72.Release) -->
    <!--
    My97DatePicker引入到项目中后的目录结构如下
    WebRoot
      |--js
      |  |--My97DatePicker
      |  |  |--lang
      |  |  |  |--zh-cn.js
      |  |  |--skin
      |  |  |  |--default
      |  |  |  |  |--datepicker.css
      |  |  |  |  |--img.gif
      |  |  |  |--datePicker.gif
      |  |  |  |--WdatePicker.css
      |  |  |--calendar.js
      |  |  |--config.js
      |  |  |--My97DatePicker.htm
      |  |  |--WdatePicker.js
     -->
    <script src="js/My97DatePicker/WdatePicker.js"></script>
</head>
<body>
<!-- 下面演示My97DatePicker的一些效果 -->
<font color="blue">常规调用(若想在文本框中尾部显示日期图标，可以设置<input class="Wdate"/>)</font>
<br/>
<input type="text" onClick="WdatePicker()"/>
<br/>
<br/>
<font color="blue">图标触发(此时只有点击图标才能弹出日期选择框)</font>
<br/>
<input id="iconInvoke" type="text"/>
<img onclick="WdatePicker({el:'iconInvoke'})" src="js/My97DatePicker/skin/datePicker.gif" width="16" height="22" align="absmiddle">
<br/>
<br/>
<font color="blue">禁止清空(即用户选择完日期后，不能直接在文本框中按detele键删掉或清空，只能重新选择日期)</font>
<br/>
<input type="text" class="Wdate" onFocus="WdatePicker({isShowClear:false, readOnly:true})"/>
<br/>
<br/>
<font color="blue">自定义每周的第一天(4.6新增：设置周一为每周第一天)</font>
<br/>
<input type="text" onfocus="WdatePicker({firstDayOfWeek:1})"/>
<br/>
<br/>
<font color="blue">自定义日期显示格式(这里设置为yyyy-MM-dd HH:mm，这一点和Java相同，还可设置其它的如'yyyy年MM月')</font>
<br/>
<input type="text" onfocus="WdatePicker({dateFmt:'yyyy-MM-dd HH:mm'})"/>
<br/>
<br/>
<font color="blue">双月日历功能(4.6新增：可以同时弹出两个月的日历)</font>
<br/>
<input type="text" onfocus="WdatePicker({doubleCalendar:true, dateFmt:'yyyy-MM-dd'})"/>
<br/>
<br/>
<font color="blue">限制日期范围为2013-09-14到2013-9-20</font>
<br/>
<input type="text" onfocus="WdatePicker({minDate:'2013-09-14', maxDate:'2013-9-20'})"/>
<br/>
<br/>
<font color="blue">限制日期范围为2013年9月到2013年10月</font>
<br/>
<input type="text" onfocus="WdatePicker({minDate:'2013-9', maxDate:'2013-10-31'})"/>
<br/>
<br/>
<font color="blue">限制日期范围为10:00:20到14:30:00</font>
<br/>
<input type="text" onfocus="WdatePicker({dateFmt:'HH:mm:ss', minDate:'10:00:20', maxDate:'14:30:00'})"/>
<br/>
<br/>
<font color="blue">限制日期范围为2013-9-14 10:30到2013-9-15 16:40</font>
<br/>
<input type="text" onfocus="WdatePicker({dateFmt:'yyyy-MM-dd HH:mm', minDate:'2013-09-14 10:30', maxDate:'2013-09-15 16:40'})"/>
<br/>
<br/>
<font color="blue">只能选择今天以前的日期(包括今天)</font>
<br/>
<input type="text" onfocus="WdatePicker({maxDate:'%y-%M-%d'})"/>
<br/>
<br/>
<font color="blue">只能选择今天以后的日期(不包括今天)(这里使用了My97DatePicker的运算表达式)</font>
<br/>
<input type="text" onfocus="WdatePicker({minDate:'%y-%M-｛%d+1}'})"/>
<br/>
<br/>
<font color="blue">只能选择本月日期的第一天到最后一天</font>
<br/>
<input type="text" onfocus="WdatePicker({minDate:'%y-%M-01', maxDate:'%y-%M-%ld'})"/>
<br/>
<br/>
<font color="blue">只能选择今天10:20至明天14:28的日期</font>
<br/>
<input type="text" onfocus="WdatePicker({dateFmt:'yyyy-MM-dd HH:mm', minDate:'%y-%M-%d 10:20', maxDate:'%y-%M-｛%d+1} 14:28'})"/>
<br/>
<br/>
<font color="blue">只能选择20个小时前到30个小时后的日期(这里使用了My97DatePicker的运算表达式)</font>
<br/>
<input type="text" onClick="WdatePicker({dateFmt:'yyyy-MM-dd HH:mm', minDate:'%y-%M-%d ｛%H-20}:%m:%s', maxDate:'%y-%M-%d ｛%H+30}:%m:%s'})"/>
<br/>
<br/>
<font color="blue">后面的日期大于前面的日期，且两个日期都不能大于2020-10-01</font>
<br/>
<input type="text" id="date01" onFocus="WdatePicker({maxDate:'#F{$dp.$D(\'date02\')||\'2020-10-01\'}'})"/>
到
<input type="text" id="date02" onFocus="WdatePicker({minDate:'#F{$dp.$D(\'date01\')}', maxDate:'2020-10-01'})"/>
<br/>
<br/>
<font color="blue">后面的日期最少要比前面的日期大3天</font>
<br/>
<input type="text" id="date03" onFocus="WdatePicker({maxDate:'#F{$dp.$D(\'date04\',{d:-3});}'})"/>
到
<input type="text" id="date04" onFocus="WdatePicker({minDate:'#F{$dp.$D(\'date03\',{d:3});}'})"/>
<br/>
<br/>
<font color="blue">禁用周六日</font>
<br/>
<input type="text" onFocus="WdatePicker({disabledDays:[0,6]})"/>
<br/>
<br/>
<font color="blue">禁用每月的5日15日25日('5$'表示以5结尾)</font>
<br/>
<input type="text" onFocus="WdatePicker({disabledDates:['5$']})"/>
<br/>
<br/>
<font color="blue">禁用所有早于2000-01-01的日期('^19'表示以19开头，可用minDate实现类似功能，这里主要是演示^的用法)</font>
<br/>
<input type="text" onFocus="WdatePicker({disabledDates:['^19']})"/>
<br/>
<br/>
<font color="blue">将本月可用日期分隔成五段，分别是: 1-3、8-10、16-24、26、27、29到月末</font>
<br/>
<input type="text" onFocus="WdatePicker({minDate:'%y-%M-01', maxDate:'%y-%M-%ld', disabledDates:['0[4-7]$','1[1-5]$','2[58]$']})"/>
<br/>
<br/>
<font color="blue">将本月可用日期分隔成五段，分别是: 1-3、8-10、16-24、26、27、29到月末，并禁用每个周一、三、六</font>
<br/>
<input type="text" onFocus="WdatePicker({minDate:'%y-%M-01', maxDate:'%y-%M-%ld', disabledDates:['0[4-7]$','1[1-5]$','2[58]$'], disabledDays:[1,3,6]})"/>
<br/>
<br/>
<font color="blue">禁用前一个小时和后一个小时内所有时间(鼠标点击日期输入框时，你会发现当前时间对应的前一个小时和后一个小时是灰色的)</font>
<br/>
<input type="text" onFocus="WdatePicker({dateFmt:'yyyy-MM-dd HH:mm', disabledDates:['%y-%M-%d ｛%H-1}\:..\:..','%y-%M-%d ｛%H+1}\:..\:..']})"/>
<br/>
<br/>
<form action="servlet/DatePickerServlet" method="POST">
    <font color="blue">
        只能选择7天以内日期(包括今天)<br/>
        注意：假设用户先选择后面日期为后天，然后再选择前面日期，此时前面日期允许选择今天以前的5天<br/>
        注意：这是为了将来的编辑用途(比方说这俩日期是一个活动的起止日期，用户有权在发布活动后回来修改日期)
    </font>
    <br/>
    <input type="text" id="startTime" name="startTime" onFocus="WdatePicker({isShowClear:false, readOnly:true, dateFmt:'yyyy-MM-dd HH:mm', maxDate:'#F{$dp.$D(\'endTime\')}', minDate:'#F{$dp.$D(\'endTime\',{d:-7})||\'%y-%M-%d\'}'})"/>
    到
    <input type="text" id="endTime" name="endTime" onFocus="WdatePicker({isShowClear:false, readOnly:true, dateFmt:'yyyy-MM-dd HH:mm', minDate:'#F{$dp.$D(\'startTime\')}', maxDate:'#F{$dp.$D(\'startTime\',{d:7});}'})"/>
    <br/>
    <br/>
    <input type="submit" value="提交活动日期到服务器">
</form>
</body>
</html>
```

下面是用于处理`myDate.html`中的表单时，需要的`web.xml`以及`DatePickerServlet.java`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="2.5"
    xmlns="http://java.sun.com/xml/ns/javaee"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd">
    <servlet>
        <servlet-name>DatePickerServlet</servlet-name>
        <servlet-class>com.xuanyuv.datepicker.DatePickerServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>DatePickerServlet</servlet-name>
        <url-pattern>/servlet/DatePickerServlet</url-pattern>
    </servlet-mapping>

    <welcome-file-list>
        <welcome-file>myDate.html</welcome-file>
    </welcome-file-list>
</web-app>
```

```java
package com.xuanyuv.datepicker;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DatePickerServlet extends HttpServlet {
    private static final long serialVersionUID = 4451017213106489231L;

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String startTime = request.getParameter("startTime");
        String endTime = request.getParameter("endTime");
        Date beginDate = null;
        Date endDate = null;
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
            beginDate = sdf.parse(startTime);
            endDate = sdf.parse(endTime);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        long betweenDays = (endDate.getTime()-beginDate.getTime()) / (24*60*60*1000);
        System.out.println("[" + startTime + "]-->[" + endTime + "]相隔[" + betweenDays + "]天");
    }
}
```