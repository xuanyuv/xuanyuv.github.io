---
layout: post
title: "iBatis调用存储过程"
categories: iBatis
tags: ibatis 存储过程
author: 玄玉
excerpt: 详细介绍了iBatis调用存储过程的写法。
---

* content
{:toc}


首先是实体类映射文件中的写法

```xml
<parameterMap id="pro_init_Map" class="java.util.Map">
    <parameter property="username" javaType="java.lang.String" jdbcType="VARCHAR" mode="IN"/>
    <parameter property="userId" javaType="java.lang.Integer" jdbcType="INT" mode="OUT"/>
</parameterMap>
<procedure id="pro_init" parameterMap="pro_init_Map">
    {call pro_init(?, ?)}
</procedure>
```

其次是DAO中的写法

```java
public int teamInit(String username) {
    int userId = 0;
    Map<String, Object> paramMap = new HashMap<String, Object>();
    paramMap.put("username", username);
    paramMap.put("userId", userId);
    this.getSqlMapClientTemplate().queryForObject("worldcup_guess.pro_init", paramMap);
    return (Integer)paramMap.get("userId");
}
```

最后补充一下创建MySQL存储过程的SQL

```sql
DROP PROCEDURE IF EXISTS pro_init; -- 删除一个已存在的存储过程
DELIMITER //                       -- 声明当前MySQL分隔符为//
CREATE PROCEDURE pro_init(username VARCHAR(60), OUT userId INT)
BEGIN
    SELECT user_id INTO userId FROM t_user_info ui WHERE ui.username=username;
    IF userId IS NULL OR userId='' THEN
        SELECT 0 INTO userId;
    ELSE
        INSERT INTO t_worldcup(userId, teamAA, teamBB) VALUES (userId, '巴西', '俄罗斯');
        INSERT INTO t_worldcup(userId, teamAA, teamBB) VALUES (userId, '法国', '西班牙');
        INSERT INTO t_worldcup(userId, teamAA, teamBB) VALUES (userId, '荷兰', '英格兰');
        INSERT INTO t_worldcup(userId, teamAA, teamBB) VALUES (userId, '智利', '意大利');
        INSERT INTO t_worldcup(userId, teamAA, teamBB) VALUES (userId, '伊朗', '葡萄牙');
        INSERT INTO t_worldcup(userId, teamAA, teamBB) VALUES (userId, '希腊', '阿根廷');
    END IF;
END
//                                 -- 分隔符，表示此SQL语句结束
```