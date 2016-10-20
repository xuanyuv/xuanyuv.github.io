---
layout: post
title: "MySQL命令小结"
categories: MySQL
tags: sql mysql schema tablespace
author: 玄玉
excerpt: 一些常用的MySQL命令，诸如元数据查询、统计、建表、修改表结构等等。
---

* content
{:toc}


## 建表

```sql
DROP TABLE IF EXISTS t_account_info;
CREATE TABLE t_account_info(
id          INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
status      TINYINT(1)    NOT NULL COMMENT '账户状态：0--未认证，1--已认证，2--认证未通过',
password    CHAR(102)     NOT NULL COMMENT '登录密码',
email       VARCHAR(64)   NOT NULL COMMENT '登录邮箱',
resp_data   MEDIUMTEXT    NOT NULL COMMENT '接口应答报文',
money_max   DECIMAL(16,4) COMMENT '最高贷款额度，单位：元',
biz_time    DATETIME      NOT NULL COMMENT '业务时间',
send_time   DATETIME      DEFAULT NULL COMMENT '发送时间',
create_time TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
update_time TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
INDEX index_password(password),
UNIQUE INDEX unique_email_status(email, status)
)ENGINE=InnoDB DEFAULT CHARSET=UTF8 AUTO_INCREMENT=10001001 COMMENT='渠道账户信息表';
```

## 修改表结构

```sql
ALTER TABLE t_account COMMENT '这是渠道账户信息表';
ALTER TABLE t_account MODIFY money_max DECIMAL(16,4) NOT NULL COMMENT '最高额度，单位：元';
ALTER TABLE t_account ADD COLUMN type TINYINT(1) COMMENT '类型：1--个人，2--企业' AFTER id;
```

## 查询某张表的建表语句

```sql
SHOW CREATE TABLE t_admin;
```

## 查询某张表的所有列名

```sql
SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_NAME='t_admin';
```

## 查询拥有某字段的所有表名

```sql
SELECT TABLE_NAME FROM information_schema.COLUMNS WHERE COLUMN_NAME='file_id';
```

## 查询某数据库中的所有表名

```sql
SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='数据库名';
```

## 统计昨日、今日、本周数据

```sql
SELECT t.tag 渠道, count(*) 累计扫描量 FROM t_qq_qrcode t GROUP BY t.tag;

SELECT t.tag 渠道, count(*) 今日扫描量 FROM t_qq_qrcode t
WHERE datediff(now(),t.create_time)=0 GROUP BY t.tag;

SELECT t.tag 渠道, count(*) 昨日扫描量 FROM t_qq_qrcode t
WHERE datediff(now(),t.create_time)=1 GROUP BY t.tag;

SELECT t.tag 渠道, count(*) 本周扫描量 FROM t_qq_qrcode t
WHERE yearweek(date_format(t.create_time,'%Y-%m-%d'))=yearweek(now()) GROUP BY t.tag;

SELECT t.tag 渠道, date_format(t.create_time, '%Y%m%d') 日期, count(*) 当日扫描量 FROM t_qq_qrcode t
WHERE date_format(t.create_time, '%Y%m%d')='20160503' GROUP BY t.tag;
```

## 表中存在重复数据时的统计

```sql
-- 对于表中存在重复数据的，查詢出过滤掉重复数据后的
SELECT id FROM coop_push_user GROUP BY mobile HAVING count(mobile)=1;

-- 对于表中存在重复数据的，查詢重复数据中最旧的那条
SELECT id FROM coop_push_user GROUP BY mobile HAVING count(mobile)>1;

-- 对于表中存在重复数据的，查詢重复数据中最新的那条，对于其它无重复数据的則原样查出
SELECT mobile, status-1, create_time FROM coop_push_user
WHERE id in(SELECT max(id) FROM coop_push_user GROUP BY mobile);
```

## 同一张表分别统计后汇总结果

```sql
SELECT t1.totalApply, t2.totalSign, IF(t3.money IS NULL,0,t3.money) money FROM
(SELECT COUNT(t.id) totalApply FROM t_apply_info t WHERE t.apply_date=20160810) t1,
(SELECT COUNT(t.id) totalSign FROM t_apply_info t WHERE t.sign_date=20160810) t2,
(SELECT SUM(t.pay_money) totalMoney FROM t_apply_info t WHERE t.pay_date=20160810) t3;
```