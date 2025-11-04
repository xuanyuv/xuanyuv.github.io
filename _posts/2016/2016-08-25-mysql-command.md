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
    id             BIGINT         PRIMARY KEY AUTO_INCREMENT         COMMENT '主键',
    user_id        BIGINT         NOT NULL                           COMMENT '用户ID',
    status         TINYINT        NOT NULL DEFAULT 0                 COMMENT '账户状态：0-未认证、1-已认证',
    password       CHAR(102)      NOT NULL                           COMMENT '登录密码',
    email          VARCHAR(64)    NOT NULL                           COMMENT '登录邮箱',
    money_max      DECIMAL(16,6)                                     COMMENT '最高额度（元）',
    biz_date       DATE           NOT NULL                           COMMENT '业务日期',
    send_time      DATETIME                                          COMMENT '发送时间',
    resp_data      MEDIUMTEXT     NOT NULL                           COMMENT '应答报文',
    deleted        BIGINT         NOT NULL DEFAULT 0                 COMMENT '逻辑删除：0-未删除、1-已删除',
    version        BIGINT         NOT NULL DEFAULT 0                 COMMENT '乐观锁',
    tenant_id      BIGINT         NOT NULL                           COMMENT '租户ID',
    create_by      BIGINT         NOT NULL DEFAULT 0                 COMMENT '创建人',
    create_by_name VARCHAR(99)    NOT NULL DEFAULT 'SEED'            COMMENT '创建人名称',
    update_by      BIGINT         NOT NULL DEFAULT 0                 COMMENT '修改人',
    update_by_name VARCHAR(99)    NOT NULL DEFAULT 'SEED'            COMMENT '修改人名称',
    create_time    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    user_realname  VARCHAR(50)    NOT NULL                           COMMENT '用户真实姓名',
    INDEX idx_tenantId_email(tenant_id, email),
    UNIQUE INDEX unique_tenantId_userId(tenant_id, user_id)
)ENGINE=InnoDB DEFAULT CHARSET=UTF8MB4 COLLATE=UTF8MB4_UNICODE_CI COMMENT='渠道信息表';
```

## 表碎片

```sql
-- 查看单张表是否存在碎片（data_free字段不为0，则表示有碎片存在）
SHOW TABLE STATUS FROM mpp LIKE 't_fans_info';

-- 查看当前实例下，所有数据库的所有表的，碎片大小超过30MB的情况
SELECT
     CONCAT(TABLE_SCHEMA, '.', TABLE_NAME)                                AS 表名,
     TABLE_ROWS                                                           AS 表行数,
     CONCAT( ROUND( (data_length + index_length) / 1024 / 1024, 2), 'MB') AS 表大小,
     CONCAT( ROUND( data_length                  / 1024 / 1024, 2), 'MB') AS 数据大小,
     CONCAT( ROUND( index_length                 / 1024 / 1024, 2), 'MB') AS 索引大小,
     CONCAT( ROUND( data_free                    / 1024 / 1024, 2), 'MB') AS 碎片大小
FROM
     information_schema.TABLES
WHERE
     TABLE_SCHEMA NOT IN ('sys', 'mysql', 'information_schema', 'performance_schema')
     # AND TABLE_NAME = 't_fans_info'
     AND DATA_FREE >= 1024*1024*30
ORDER BY data_free DESC;

-- 清理表碎片：方式一（会锁表，只能读，不能写）
ALTER TABLE mpp.t_fans_info ENGINE = InnoDB;
ANALYZE NO_WRITE_TO_BINLOG TABLE mpp.t_fans_info;

-- 清理表碎片：方式二（会锁表，只能读，不能写）
OPTIMIZE NO_WRITE_TO_BINLOG TABLE t_fans_info;
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
CALL pro_init('xuanyu', @userId);
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

-- MODIFY COLUMN 与 CHANGE COLUMN 唯一不同是：它不能重命名列
ALTER TABLE t_account CHANGE COLUMN money_total money_max VARCHAR(50) COMMENT '总额度';
ALTER TABLE t_account CHANGE COLUMN money_total money_max VARCHAR(50) COMMENT '总额度' AFTER id;
ALTER TABLE t_account MODIFY COLUMN money_max DECIMAL(16,6) NOT NULL  COMMENT '最高额度（元）';
ALTER TABLE t_account MODIFY COLUMN money_max DECIMAL(16,6) NOT NULL  COMMENT '最高额度（元）' AFTER id;

ALTER TABLE t_account DROP   COLUMN money_type;
ALTER TABLE t_account ADD    COLUMN money_type TINYINT COMMENT '金额类型：1-RMB、2-USD' AFTER id;
-- 如果不加AFTER，默认会添加在尾部
ALTER TABLE t_account
    ADD COLUMN gender   TINYINT    NOT NULL DEFAULT 0 COMMENT '性别：0-未知、1-男、2-女' AFTER id,
    ADD COLUMN realname VARCHAR(4) NOT NULL           COMMENT '姓名' AFTER gender,
    ADD COLUMN nickname VARCHAR(8)                    COMMENT '昵称' AFTER realname;

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
-- 查询结果集添加自增序号
-- 通过【@变量名】来定义用户变量，赋值时可以用【=】或【:=】，但是SELECT时必须用【:=】赋值
SET @i=16;
SET @i:=32;
SELECT (@i:=@i+1) AS rowNum, realname from t_user_info;
-- 举例
SET @lastId = (SELECT max(id)+1 FROM t_user_info);
INSERT INTO t_user_info VALUE(@lastId,   '卢云');
INSERT INTO t_user_info VALUE(@lastId+1, '顾倩兮');
INSERT INTO t_user_info VALUES
((@lastId:=@lastId+1), '卢云'),
((@lastId:=@lastId+1), '顾倩兮');

-- 更新某字段值为另一个表的同名字段值
SET @id_202507 = (SELECT min(id)-1 FROM t_user WHERE birthday=20250701);
SET @id_202504 = (SELECT min(id)-1 FROM t_user WHERE birthday=20250401);
UPDATE t_user SET birthday_month = FLOOR(birthday/100) WHERE id > @id_202507;
UPDATE t_user SET birthday_month = FLOOR(birthday/100) WHERE id > @id_202504 AND id <= @id_202507;
UPDATE t_user SET birthday_month = FLOOR(birthday/100) WHERE id <= @id_202504;

UPDATE t_user u, t_account a SET u.account_type = a.type WHERE u.account_id = a.id

UPDATE t_user u LEFT JOIN t_account a ON u.account_id = a.id SET u.account_type = IFNULL(a.type, 0)

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
SHOW INDEX FROM xuanyu.t_admin;
SHOW INDEX FROM t_admin FROM xuanyu;
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

## 分组查询并排序

```sql
-- 根据区域分组，并根据组内的新闻发生时间先后排序
SELECT * FROM t_news_info WHERE news_type='1' GROUP BY news_area, news_time desc, id

-- 如果想让某区域的新闻优先显示，则像下面这样写
-- 注意：union all之后会发生查询到的记录的顺序被打乱了，那么可以加上limit使之严格按照union all的先后返回结果
(SELECT * FROM t_news_info WHERE news_type='1' AND news_area='chongqing' ORDER BY news_time desc limit 999999)
UNION ALL
(SELECT * FROM t_news_info WHERE news_type='1' AND news_area!='chongqing' GROUP BY news_area, news_time desc, id limit 999999)

-- 同一张表分别统计后汇总结果
SELECT t1.totalApply, t2.totalSign, IF(t3.money IS NULL,0,t3.money) money FROM
(SELECT COUNT(t.id) totalApply FROM t_apply_info t WHERE t.apply_date=20160810) t1,
(SELECT COUNT(t.id) totalSign FROM t_apply_info t WHERE t.sign_date=20160810) t2,
(SELECT SUM(t.pay_money) totalMoney FROM t_apply_info t WHERE t.pay_date=20160810) t3;

-- 使用窗口函数实现：查询每个商户下，下单金额最高的前三名用户的，用户ID/总订单数量/总订单金额
SELECT * FROM (
    SELECT t1.*, row_number() OVER (PARTITION BY t1.merchant_id ORDER BY t1.totalPrice DESC) AS row_num
    FROM (
        SELECT merchant_id, user_id, count(id) orderNum, sum(price) totalPrice
        FROM t_order_info
        WHERE tenant_id=200010001 AND status=2
        GROUP BY merchant_id, user_id
    ) t1
) t2
WHERE t2.row_num <= 3
```

## 按时间段统计数据

```sql
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

## 重复数据时的统计

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

## 查询所有的父子级

| id  | pid | name |
|:----|:----|:-----|
| 80  | 0   | 系统管理 |
| 113 | 80  | 租户管理 |
| 115 | 113 | 我的租户 |
| 126 | 115 | 租户查看 |
| 127 | 115 | 租户编辑 |

```sql
-- 基于上面的表结构和数据：查询所有的父级（包含自身），查询结果如下
-- +-----+--------+---------------+
-- |index|identity|parent_identity|
-- +-----+--------+---------------+
-- |1    |126     |115            |
-- |2    |115     |113            |
-- |3    |113     |80             |
-- |4    |80      |0              |
-- +-----+--------+---------------+
SELECT
       @idx := @idx + 1                                         AS `index`,
       @id                                                      AS identity,
       (SELECT @id := pid FROM t_menu_info WHERE id = identity) AS parent_identity
FROM
     t_menu_info mi,
     (SELECT @idx := 0, @id := 126) vars
WHERE
      @id != 0 AND pid > 0;

-- 基于上面的表结构和数据：查询所有的子级（不包含自身），查询结果如下
-- +---+
-- |id |
-- +---+
-- |115|
-- |127|
-- |126|
-- +---+
SELECT
       id
FROM
     t_menu_info mi,
     (SELECT @pid := 113) vars
WHERE
      FIND_IN_SET(pid, @pid) > 0 AND @pid := concat(@pid, ',', id);

-- 还有一种写法：根据父节点递归查询所有子节点（不包含自身）
SELECT t3.*
FROM(
    SELECT t1.*, IF(FIND_IN_SET(pid, @pid) > 0, @pid := CONCAT(@pid, ',', id), 'www.xuanyuv.com') AS ischild
    FROM (SELECT id, pid, name FROM t_menu_info WHERE tenant_id=200010001 ORDER BY id ASC) t1,
         (SELECT @pid := 113) t2
) t3
WHERE ischild != 'www.xuanyuv.com'

-- 还有一种写法：根据子节点递归查询所有父节点（包含自身）
SELECT t3.*
FROM(
    SELECT t1.*, IF(FIND_IN_SET(id, @id) > 0, @id := CONCAT(@id, ',', pid), 'www.xuanyuv.com') AS isparent
    FROM (SELECT id, pid, name FROM t_menu_info WHERE tenant_id=200010001 ORDER BY id DESC) t1,
         (SELECT @id := 113) t2
) t3
WHERE isparent != 'www.xuanyuv.com'
```

## 数据的备份与恢复

物理备份除了要拷贝 mysql_data 目录下的数据库文件夹，还要处理 mysql.ibd 文件，比较繁琐且易出错

因此下面列出的是通过 mysqldump 来进行备份和恢复的方式

```shell
# 进入命令目录
cd /app/software/mysql-8.0.37/mysql/bin
# 备份
mysqldump -h127.0.0.1 -uroot -pxuanyu --default-character-set=utf8mb4 --single-transaction --flush-logs --databases mpp > /app/software/mysql-8.0.37/mpp.sql
# 恢复（也可以登录MySQL命令行，直接执行：source /app/software/mysql-8.0.37/mpp.sql，作用是一样的）
mysql -h127.0.0.1 -uroot -pxuanyu < /app/software/xuanyu.sql
```

### mysqldump参数

整理自网络，仅供参考，更详细的见：<https://www.cnblogs.com/qidaii/articles/17370167.html>

* **--all-databases, -A**：导出全部数据库
* **--databases, -B**：导出指定的数据库（参数后面的所有名字参量都被看作数据库名）<br/>
  如果没有该选项，mysqldump把第一个名字参数作为数据库名，后面的作为表名<br/>
  使用该选项，mysqldum把每个名字都当作为数据库名
* **--no-data, -d**：不导出任何数据，只导出数据库表结构
* **--tables**：覆盖 --databases (-B) 选项，指定需要导出的表名（后面所跟参数被视作表名）
* **--ignore-table**：不导出指定表。指定忽略多个表时，需要重复多次，每次一个表<br/>
  每个表必须同时指定数据库和表名：`--ignore-table=mydb.table1 --ignore-table=mydb.table2`
* **--default-character-set**：设置默认字符集，默认值为utf8
* **--set-charset**：添加'SET NAMES  default_character_set'到输出文件<br/>
  默认为打开状态，使用--skip-set-charset关闭选项
* **--add-drop-table**：每个数据表创建之前添加drop数据表语句<br/>
  默认为打开状态，使用--skip-add-drop-table取消选项
* **--add-locks**：在每个表导出之前增加LOCK TABLES并且之后UNLOCK  TABLE<br/>
  默认为打开状态，使用--skip-add-locks取消选项
* **--comments**：附加注释信息。默认为打开，可以用--skip-comments取消
* **--compress, -C**：在客户端和服务器之间启用压缩传递所有信息
* **--extended-insert, -e**：使用具有多个VALUES列的INSERT语法<br/>
  这样使导出文件更小，并加速导入时的速度。默认为打开状态，使用--skip-extended-insert取消选项
* **--force**：在导出过程中忽略出现的SQL错误
* **--no-create-db, -n**：只导出数据，而不添加CREATE DATABASE 语句
* **--no-create-info, -t**：只导出数据，而不添加CREATE TABLE 语句
* **--quick, -q**：不缓冲查询，直接导出到标准输出。默认为打开状态，使用--skip-quick取消该选项
* **--quote-names, -Q**：使用（`）引起表和列名。默认为打开状态，使用--skip-quote-names取消该选项
* **--max_allowed_packet**：服务器发送和接受的最大包长度<br/>
  例如：--max_allowed_packet=10240或者--max_allowed_packet=512M
* **--single-transaction**：该选项在导出数据之前提交一个BEGIN SQL语句<br/>
  BEGIN 不会阻塞任何应用程序且能保证导出时数据库的一致性状态。它只适用于多版本存储引擎，仅InnoDB<br/>
  本选项和 --lock-tables 选项是互斥的，因为LOCK  TABLES会使任何挂起的事务隐含提交<br/>
  要想导出大表的话，应结合使用 --quick 选项
* **--flush-logs**：导出前刷新服务器的日志文件


### 网上的备份脚本

```shell
#!/bin/bash
#NAME:数据库备份
#DATE:*/*/*
#USER:***

#设置本机数据库登录信息
mysql_user="user"
mysql_password="passwd"
mysql_host="localhost"
mysql_port="3306"
mysql_charset="utf8mb4"
date_time=`date +%Y-%m-%d-%H-%M`

#保存目录中的文件个数
count=10
#备份路径
path=/***/

#备份数据库sql文件并指定目录
mysqldump --all-databases --single-transaction --flush-logs --master-data=2 -h$mysql_host -u$mysql_user -p$mysql_password > $path_$(date +%Y%m%d_%H:%M).sql
[ $? -eq 0 ] && echo "-----------------数据备份成功_$date_time-----------------" || echo "-----------------数据备份失败-----------------"

#找出需要删除的备份
delfile=`ls -l -crt $path/*.sql | awk '{print $9 }' | head -1`
#判断现在的备份数量是否大于阈值
number=`ls -l -crt $path/*.sql | awk '{print $9 }' | wc -l`
if [ $number -gt $count ] then
    rm $delfile  #删除最早生成的备份，只保留count数量的备份
    #更新删除文件日志
    echo "-----------------已删除过去备份sql $delfile-----------------"
fi
```

```text
# 增加定时备份
crontab -e

*    *    *    *    *
-    -    -    -    -
|    |    |    |    |
|    |    |    |    +----------星期中星期几 (0 - 6) (星期天 为0)
|    |    |    +---------------月份 (1 - 12)
|    |    +--------------------一个月中的第几天 (1 - 31)
|    +-------------------------小时 (0 - 23)
+------------------------------分钟 (0 - 59)

添加定时任务(每天12:50以及23:50执行备份操作)
50 12,23 * * * cd /home/;sh backup.sh >> log.txt
```