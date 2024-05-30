---
layout: post
title: "MySQL命令小结"
categories: 数据库
tags: 数据库 sql mysql schema tablespace
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
INDEX idx_password(password),
UNIQUE INDEX uniq_email_status(email, status)
)ENGINE=InnoDB DEFAULT CHARSET=UTF8 AUTO_INCREMENT=10001001 COMMENT='渠道账户信息表';
```

## 存储过程

```sql
-- 列出所有的存储过程
SHOW PROCEDURE STATUS;

-- 查看一个已存在的存储过程的创建语句，若此存储过程不存在，会提示SQL错误（1305）：PROCEDURE pro_init does not exist
SHOW CREATE PROCEDURE pro_init;

-- 创建存储过程
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

-- 调用存储过程
CALL pro_init('jadyer', @userId);
SELECT @userId;

-- 将相同的更新时间改为不同（按照一秒逐个累加）
DROP PROCEDURE IF EXISTS task_updatetime_fix;
DELIMITER //
CREATE PROCEDURE task_updatetime_fix()
BEGIN
    DECLARE i int;
    DECLARE d datetime;
    SET i = 1;
    SET d = '2023-08-24 17:36:40';
    WHILE i <= 169 DO
        SELECT i, d;
        SET i = i + 1;
        SET d = date_add(d, INTERVAL 1 SECOND);
        UPDATE t_task_info SET update_time = d WHERE update_time = '2023-08-24 17:36:40' LIMIT 1;
    END WHILE;
END //
CALL task_updatetime_fix();
```

## 修改表结构

```sql
ALTER TABLE t_account COMMENT '账户信息表';
ALTER TABLE t_account CHANGE COLUMN money_total money_max VARCHAR(50) COMMENT '总额度';
ALTER TABLE t_account MODIFY COLUMN money_max DECIMAL(16,4) NOT NULL COMMENT '最高额度，单位：元';
ALTER TABLE t_account ADD    COLUMN money_type TINYINT(1) COMMENT '金额类型：1--RMB，2--USD' AFTER id;
ALTER TABLE t_account DROP   COLUMN money_type;

ALTER TABLE t_account ADD PRIMARY KEY(account_id);
ALTER TABLE t_account ADD INDEX idx_password(password);
ALTER TABLE t_account ADD INDEX idx_name_password(name, password);
ALTER TABLE t_account ADD UNIQUE INDEX uniq_name_email(name, email);

CREATE INDEX idx_name_password ON t_account(name, password);
CREATE UNIQUE INDEX uniq_name_email ON t_account(name, email);

ALTER TABLE t_account DROP PRIMARY KEY;
ALTER TABLE t_account DROP INDEX idx_name_password;
DROP INDEX idx_name_password ON t_account;
```

## 修改表数据

```sql
-- 更新某字段值为另一个表的同名字段值
UPDATE t_user u, t_account a SET u.account_type=a.type WHERE u.account_id=a.id

-- 清空表数据（效率高于DELETE，不可带WHERE，不记录日志，不可恢复数据，序号ID重新从1开始）
TRUNCATE TABLE t_user;
-- 清空表数据（效率低于TRUNCATE，可带WHERE，记录日志，可恢复数据，序号ID会延续之前的而继续编号）
DELETE FROM t_user;

-- CASE WHEN 批量更新（若有条id=6的数据，因其未出现在WHEN中，会导致其realname&nickname被更新为NULL）
UPDATE t_user SET
    realname = CASE id
        WHEN  8 THEN '卢云'
        WHEN  9 THEN '秦仲海'
        WHEN 10 THEN '伍定远'
    END,
    nickname = CASE id
        WHEN  8 THEN '剑神'
        WHEN  9 THEN '怒王'
        WHEN 10 THEN '一代真龙'
    END
WHERE realname IS NULL;
```

## 查询元数据

```sql
-- 查询某张表的建表语句
SHOW CREATE TABLE t_admin;

-- 查询某张表存在的索引类型
SHOW INDEX FROM jadyer.t_admin;
SHOW INDEX FROM t_admin FROM jadyer;
SELECT INDEX_NAME, INDEX_TYPE FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_NAME='t_admin';

-- 查询某张表的所有列名
SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_NAME='t_admin';

-- 查询数据库uuc中，拥有字段uid的所有表名
SELECT TABLE_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='uuc' AND COLUMN_NAME='uid';

-- 查询某数据库的所有表信息
SELECT TABLE_NAME, TABLE_COMMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA='数据库名';

-- 查询某张表的所有列信息
SELECT
COLUMN_NAME as name,
COLUMN_COMMENT as comment,
DATA_TYPE as type,
ifnull(CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION) as length,
if(IS_NULLABLE='yes', true, false) as nullable,
if(COLUMN_KEY='pri', true, false) as isPrikey,
if(EXTRA='auto_increment', true, false) as isAutoIncrement
FROM information_schema.COLUMNS WHERE TABLE_NAME='表名' ORDER BY ORDINAL_POSITION;
```

## 查询字符集

```sql
mysql> SHOW VARIABLES LIKE 'character_set_%';
mysql> SHOW VARIABLES LIKE 'collation_%';
mysql> SHOW VARIABLES WHERE Variable_name LIKE 'character_set_%' OR Variable_name LIKE 'collation_%';
+--------------------------+--------------------------------------------------+
| Variable_name            | Value                                            |
+--------------------------+--------------------------------------------------+
| character_set_client     | utf8mb4                                          |
| character_set_connection | utf8mb4                                          |
| character_set_database   | utf8mb4                                          |
| character_set_filesystem | binary                                           |
| character_set_results    | utf8mb4                                          |
| character_set_server     | utf8mb4                                          |
| character_set_system     | utf8mb3                                          |
| character_sets_dir       | /app/software/mysql-8.0.32/mysql/share/charsets/ |
| collation_connection     | utf8mb4_0900_ai_ci                               |
| collation_database       | utf8mb4_unicode_ci                               |
| collation_server         | utf8mb4_0900_ai_ci                               |
+--------------------------+--------------------------------------------------+
11 rows in set, 1 warning (0.00 sec)

mysql>
```

| 变量                       | 描述                                              |
|:-------------------------|:------------------------------------------------|
| character_set_client     | 客户端使用的字符集（客户端请求数据的字符集）                          |
| character_set_connection | 连接数据库时的字符集（接收客户端数据并传输的字符集）                      |
| character_set_database   | 创建数据库时的默认字符集（创建数据库时未设置则取character_set_server）   |
| character_set_filesystem | 文件系统的编码格式，把操作系统上的文件名转化成此字符集，默认binary是不做任何转换的    |
| character_set_results    | 数据库给客户端返回结果集时的编码格式（未设置则取character_set_server）   |
| character_set_server     | 数据库服务器的默认字符集                                    |
| character_set_system     | 存储系统元数据的字符集（不需要设置）                              |
| character_sets_dir       | 字符集安装的目录                                        |

其中，后三个系统变量基本不需要关心，只有前五个才会影响到数据乱码等问题

## 分组查询并组内排序

```sql
-- 根据区域分组，并根据组内的新闻发生时间先后排序
SELECT * FROM t_news_info WHERE news_type='1' GROUP BY news_area, news_time desc, id

-- 如果想让某区域的新闻优先显示，则像下面这样写
-- 注意：union all之后会发生查询到的记录的顺序被打乱了，那么可以加上limit使之严格按照union all的先后返回结果
(SELECT * FROM t_news_info WHERE news_type='1' AND news_area='chongqing' ORDER BY news_time desc limit 999999)
UNION ALL
(SELECT * FROM t_news_info WHERE news_type='1' AND news_area!='chongqing' GROUP BY news_area, news_time desc, id limit 999999)
```

## 统计时间段内的数据

```sql
-- 查询结果集添加自增序号
SET @i:=32;
SELECT (@i:=@i+1) AS rowNum, realname from t_user_info;

-- 11月份的注册量
-- SELECT count(1) FROM t_account_info t WHERE month(t.create_time)=11;
SELECT count(1) FROM t_account_info t WHERE date_format(t.apply_time, '%Y%m')=201611

-- 累计扫描量
SELECT t.tag, count(*) scanCounts FROM t_qq_qrcode t GROUP BY t.tag;

-- 指定日期的扫描量
SELECT t.tag, date_format(t.create_time, '%Y%m%d') theDate, count(*) scanCountsOfToday FROM t_qq_qrcode t
WHERE date_format(t.create_time, '%Y%m%d')='20160503' GROUP BY t.tag;

-- 今日：datediff(now(), t.create_time)=0
-- 昨日：datediff(now(), t.create_time)=1
-- 本周：yearweek(now())=yearweek(date_format(t.create_time, '%Y-%m-%d'))
-- 上周：yearweek(date_sub(now(), INTERVAL 7 DAY), 1)=yearweek(date_format(t.create_time, '%Y-%m-%d'), 1)
-- 本月：date_format(now(), '%Y%m')=date_format(t.create_time, '%Y%m')
-- 上月：period_diff(date_format(now(), '%Y%m'), date_format(t.create_time, '%Y%m'))=1
-- 近半年（自然月）：period_diff(date_format(now(), '%Y%m'), date_format(t.create_time, '%Y%m'))<6
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

-- 对于一对多的表统计，根据[一]把[多]里面的某个字段都查出来在一起
SELECT t.email, t.name, IF(t.type=1, '个人', IF(t.type=2,'企业','未知')) AS accountType,
GROUP_CONCAT(ac.channel_no) AS channelList, aco.cooper_no
FROM t_account t
LEFT JOIN t_account_channel ac ON t.id=ac.account_id
LEFT JOIN t_account_cooper aco ON t.id=aco.account_id
GROUP BY t.id;
-- 上面这个查询，在 5.7 及以上版本会报错：...this is incompatible with sql_mode=only_full_group_by...
-- 就是说 SELECT 后面的字段没有出现在 GROUP BY 当中，此时要么改SQL，要么临时关闭 ONLY_FULL_GROUP_BY 规则
-- 临时关闭的话，先通过SHOW VARIABLES LIKE 'sql_mode'（或者SELECT @@GLOBAL.sql_mode）查看当前的sql_mode
-- 得到结果ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
-- 然后把ONLY_FULL_GROUP_BY去掉，重新设置sql_mode即可
-- SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
-- 注：这样修改，也只是这一次的会话有效（若想永久有效，就得修改配置文件）
```

## 同一张表分别统计后汇总结果

```sql
SELECT t1.totalApply, t2.totalSign, IF(t3.money IS NULL,0,t3.money) money FROM
(SELECT COUNT(t.id) totalApply FROM t_apply_info t WHERE t.apply_date=20160810) t1,
(SELECT COUNT(t.id) totalSign FROM t_apply_info t WHERE t.sign_date=20160810) t2,
(SELECT SUM(t.pay_money) totalMoney FROM t_apply_info t WHERE t.pay_date=20160810) t3;
```