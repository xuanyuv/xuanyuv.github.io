---
layout: post
title: "jQuery操作SelectOption上下移动"
categories: 前端
tags: 前端
author: 玄玉
excerpt: 演示jQuery操作Select标签的各种用法。
---

* content
{:toc}


效果是这样的

![](https://ae01.alicdn.com/kf/Ua1248ceb4ce34e50975988d89a2cd2b1A.png)

这里主要是通过`jQuery`实现对`<select>`标签的`上下移动`、`添加`、`删除`、`获取Option的值`等功能

代码是这样的

```html
<!DOCTYPE HTML>
<html>
<head>
    <title>jQuery操作SelectOption上下移动</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <script src="//cdn.bootcss.com/jquery/1.7.2/jquery.min.js"></script>
</head>
<script>
/**
 * 向上移动选中的option
 */
function upSelectedOption(){
    if(null == $('#where').val()){
        alert('请选择一项');
        return false;
    }
    //选中的索引,从0开始
    var optionIndex = $('#where').get(0).selectedIndex;
    //如果选中的不在最上面,表示可以移动
    if(optionIndex > 0){
        $('#where option:selected').insertBefore($('#where option:selected').prev('option'));
    }
}

/**
 * 向下移动选中的option
 */
function downSelectedOption(){
    if(null == $('#where').val()){
        alert('请选择一项');
        return false;
    }
    //索引的长度,从1开始
    var optionLength = $('#where')[0].options.length;
    //选中的索引,从0开始
    var optionIndex = $('#where').get(0).selectedIndex;
    //如果选择的不在最下面,表示可以向下
    if(optionIndex < (optionLength-1)){
        $('#where option:selected').insertAfter($('#where option:selected').next('option'));
    }
}

/**
 * 移除选中的option
 */
function removeSelectedOption(){
    if(null == $('#where').val()){
        alert('请选择一项');
        return false;
    }
    $('#where option:selected').remove();
}

/**
 * 获取所有的option值
 */
function getSelectedOption(){
    //获取Select选择的Text
    var checkText = $('#where').find('option:selected').text();
    //获取Select选择的Value
    var checkValue = $('#where').val();
    alert('当前被选中的text=' + checkText + ', value=' + checkValue);
    var ids = '';
    var options = $('#where')[0].options;
    for(var i=0; i<options.length; i++){
        ids = ids + '`' + options[i].id;
    }
    alert('当前被选中的编号顺序为' + ids);
}

/**
 * 添加option
 */
function addSelectedOption(){
    //添加在第一个位置
    $('#where').prepend('<option value="hbin" id="where06">Haerbin</option>');
    //添加在最后一个位置
    $('#where').append('<option value="hlj" id="where07">HeiLongJiang</option>');
    $('#where').attr('size', 7);
}
</script>
<body>
    <div id="updown">
        <select id="where" name="where" size="5">
            <option value="hk" id="where01">Hong Kong</option>
            <option value="tw" id="where02">Taiwan</option>
            <option value="cn" id="where03">China</option>
            <option value="us" id="where04">United States</option>
            <option value="ca" id="where05">Canada</option>
        </select>
    </div>
    <br/>
    <input type="button" value="上移" onclick="upSelectedOption()"/>
    <input type="button" value="下移" onclick="downSelectedOption()"/>
    <input type="button" value="删除" onclick="removeSelectedOption()"/>
    <input type="button" value="确定" onclick="getSelectedOption()"/>
    <input type="button" value="添加" onclick="addSelectedOption()"/>
</body>
</html>
```