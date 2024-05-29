---
layout: post
title: "CentOS搭建开发环境"
categories: Linux
tags: linux centos
author: 玄玉
excerpt: 主要介绍CentOS-7.9版系统中，搭建Java开发环境的细节，包括JDK、Nginx、Nacos、Nexus、Redis等等。
---

* content
{:toc}


本文使用的是 `CentOS-7.9.2009` 版的操作系统

## 安装JDK

下面使用的是`.tar.gz`文件

如果是`.bin`文件，可以先执行`./jdk-6u45-linux-x64.bin`命令，再配置环境变量，即可。

```sh
[root@CentOS79 ~]# cd /
[root@CentOS79 /]# mkdir -p app/software/backup
[root@CentOS79 /]# groupadd Develop                          # 添加Develop组
[root@CentOS79 /]# useradd -g Develop Jadyer                 # 创建Jadyer用户并分配到Develop组
[root@CentOS79 /]# passwd Jadyer                             # 设置或修改Jadyer用户密码
[root@CentOS79 /]# chown -R Jadyer:Develop /app              # 修改目录的拥有者为新建的用户和组
[Jadyer@CentOS79 ~]$ cd /app/software/backup/                # 使用普通用户来安装
[Jadyer@CentOS79 backup]$ tar zxvf jdk-8u40-linux-x64.tar.gz # 解压jdk
[Jadyer@CentOS79 backup]$ mv jdk1.8.0_40/ /app/software/     # 统一安装在/app/software/目录下
[root@CentOS79 ~]# vi /etc/profile                           # 用root配置环境变量，再用[:x]保存
                      # Set Java Environment Variable
                      JAVA_HOME=/app/software/jdk1.8.0_40
                      PATH=$JAVA_HOME/bin:$PATH
                      export JAVA_HOME PATH
[root@CentOS79 ~]# echo $PATH                                # 查看当前PATH
[root@CentOS79 ~]# source /etc/profile                       # 令环境变量生效
[root@CentOS79 ~]# echo $PATH                                # 再看下PATH
[root@CentOS79 ~]# java -version                             # 验证是否成功
[Jadyer@CentOS79 ~]$ java -version                           # 普通用户重连服务器，再次验证
```

## 安装Redis

Redis 的所有版本下载地址：https://download.redis.io/releases/

这里下载 5.0.14：https://download.redis.io/releases/redis-5.0.14.tar.gz

> Redis 是由 C 语言编写的，其运行需要 C 环境，所以编译前需安装 gcc

```sh
[Jadyer@CentOS79 ~]$ cd /app/software/backup/
[Jadyer@CentOS79 backup]$ wget https://download.redis.io/releases/redis-5.0.14.tar.gz
[Jadyer@CentOS79 backup]$ su root
[root@CentOS79 backup]# tar zxvf redis-5.0.14.tar.gz
[root@CentOS79 backup]# mkdir -pv /app/software/redis-5.0.14/conf
[root@CentOS79 backup]# mkdir -v /app/software/redis-5.0.14/bin
[root@CentOS79 backup]# mkdir -v /app/software/redis-5.0.14/log
[root@CentOS79 backup]# mkdir -v /app/software/redis-5.0.14/rdb
[root@CentOS79 backup]# mv redis-5.0.14 /app/software/redis-5.0.14/redis/
[root@CentOS79 backup]# cd /app/software/redis-5.0.14/redis/
[root@CentOS79 redis]# make # 过程稍慢，输出下面两行则编译完成（不用执行 make test，它执行的更慢，也没必要）
Hint: It's a good idea to run 'make test' ;)

make[1]: Leaving directory '/app/software/redis-5.0.14/redis/src'
[root@CentOS79 redis]# cd src/
[root@CentOS79 src]# make install # 过程很快（注意：是在 src 目录下执行的，同样也不用去执行 make test）
    CC Makefile.dep

Hint: It's a good idea to run 'make test' ;)

    INSTALL install
    INSTALL install
    INSTALL install
    INSTALL install
    INSTALL install
[root@CentOS79 src]# mv mkreleasehdr.sh redis-benchmark redis-check-aof redis-check-rdb redis-cli redis-sentinel redis-server redis-trib.rb /app/software/redis-5.0.14/bin/
[root@CentOS79 src]# cd ..
[root@CentOS79 redis]# mv redis.conf /app/software/redis-5.0.14/conf/
[root@CentOS79 redis]# cd /app/software/redis-5.0.14/conf/
[root@CentOS79 conf]# vim redis.conf
# bind 127.0.0.1                   # 注释掉（对于多网卡机器，注释掉后，就可以接受来自任意一个网卡的redis请求）
protected-mode no                  # 保护模式将默认的 yes 改为 no（即关闭保护模式，不然会阻止远程访问）
daemonize yes                      # 后台启动将默认的 no 改为 yes
requirepass 123                    # 设置连接密码
dir /app/software/redis-5.0.14/rdb # 数据库目录
logfile "/app/software/redis-5.0.14/log/redis.log"
[root@CentOS79 conf]# cd /app/software/redis-5.0.14/bin/
[root@CentOS79 bin]# ./redis-server /app/software/redis-5.0.14/conf/redis.conf # 启动redis
[root@CentOS79 bin]# ./redis-cli                                               # 客户端命令行连接
127.0.0.1:6379> ping                                                           # 尝试执行一个命令
(error) NOAUTH Authentication required.                                        # 报错，说明配置文件设定密码生效了
127.0.0.1:6379> auth 123                                                       # 提供密码
OK
127.0.0.1:6379> ping
PONG
127.0.0.1:6379> quit
[root@CentOS79 bin]# vim /etc/rc.d/rc.local                                            # 添加自启动
/app/software/redis-5.0.14/bin/redis-server /app/software/redis-5.0.14/conf/redis.conf # 添加这一行即可（绝对路径）
[root@CentOS79 nginx-1.24.0]# chmod +x /etc/rc.d/rc.local                              # 赋权，使其变成可执行文件
[root@CentOS79 nginx-1.24.0]# reboot                                                   # 最后，重启系统，验证
```

注：bin 和 conf 目录是为了便于管理，对于启动（或集群）都比较方便（bin 存放命令，conf 存放配置）

## 安装Nginx

这里采用的是源码编译安装，下载地址为：https://nginx.org/download/nginx-1.24.0.tar.gz

```sh
# 先安装依赖项：编译时依赖gcc环境、pcre可以解析正则以支持rewrite等、 zlib对http包内容进行gzip压缩、openssl支持https
[root@CentOS79 ~]# yum -y install gcc gcc-c++ pcre pcre-devel zlib zlib-devel openssl openssl-devel
[root@CentOS79 ~]# groupadd Nginx                             # 添加Nginx组
[root@CentOS79 ~]# useradd -s /sbin/nologin -M -g Nginx nginx # 创建nginx用户并分配组，且不能shell登录系统
[root@CentOS79 ~]# cd /app/software/backup/                   # 普通用户不能监听1024以内的端口，故用root安装
[root@CentOS79 backup]# tar zxvf nginx-1.24.0.tar.gz
[root@CentOS79 backup]# cd nginx-1.24.0/
[root@CentOS79 nginx-1.24.0]# pwd
/app/software/backup/nginx-1.24.0
[root@CentOS79 nginx-1.24.0]# ./configure --prefix=/app/software/nginx-1.24.0 --user=nginx --group=Nginx --with-compat --with-debug --with-threads --with-file-aio --with-http_sub_module --with-http_v2_module --with-http_addition_module --with-http_auth_request_module --with-http_degradation_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_stub_status_module --with-http_ssl_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module
[root@CentOS79 nginx-1.24.0]# make && make install
[root@CentOS79 nginx-1.24.0]# cd ..
[root@CentOS79 backup]# rm -rf nginx-1.24.0
[root@CentOS79 backup]# cd /app/software/nginx-1.24.0/
[root@CentOS79 nginx-1.24.0]# ./sbin/nginx -V
nginx version: nginx/1.24.0
built by gcc 4.8.5 20150623 (Red Hat 4.8.5-44) (GCC) 
built with OpenSSL 1.0.2k-fips  26 Jan 2017
TLS SNI support enabled
configure arguments: --prefix=/app/software/nginx-1.24.0 --user=nginx --group=Nginx --with-compat --with-debug --with-threads --with-file-aio --with-http_sub_module --with-http_v2_module --with-http_addition_module --with-http_auth_request_module --with-http_degradation_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_stub_status_module --with-http_ssl_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module
[root@CentOS79 nginx-1.24.0]# vim conf/nginx.conf
user nginx Nginx;
[root@CentOS79 nginx-1.24.0]# ./sbin/nginx                # 启动
[root@CentOS79 nginx-1.24.0]# ./sbin/nginx -s reload      # 重载配置
[root@CentOS79 nginx-1.24.0]# ./sbin/nginx -s stop        # 停止
[root@CentOS79 nginx-1.24.0]# vim /etc/rc.d/rc.local      # 添加自启动（/etc/rc.local 是 /etc/rc.d/rc.local 的软连接）
/app/software/nginx-1.24.0/sbin/nginx                     # 添加这一行即可（绝对路径）
[root@CentOS79 nginx-1.24.0]# chmod +x /etc/rc.d/rc.local # 赋权，使其变成可执行文件
[root@CentOS79 nginx-1.24.0]# reboot                      # 最后，重启系统，验证
```

## 安装Nacos

下载地址：https://github.com/alibaba/nacos/releases/download/2.3.1/nacos-server-2.3.1.tar.gz

```sh
[Jadyer@CentOS79 ~]$ cd /app/software/backup/
[Jadyer@CentOS79 backup]$ tar zxvf nacos-server-2.3.1.tar.gz
[Jadyer@CentOS79 backup]$ mv nacos /app/software/nacos-2.3.1
[Jadyer@CentOS79 backup]$ cd /app/software/nacos-2.3.1/
[Jadyer@CentOS79 nacos-2.3.1]$ vim conf/application.properties
spring.sql.init.platform=mysql
# 首次启动前，应先初始化数据库，初始化文件位于：/app/software/nacos-2.3.1/conf/mysql-schema.sql
db.num=1
# 连接mysql8.0时可能报错：java.sql.SQLNonTransientConnectionException: Public Key Retrieval is not allowed
# 此时，在连接参数上增加：allowPublicKeyRetrieval=true
db.url.0=jdbc:mysql://127.0.0.1:3306/nacos?allowPublicKeyRetrieval=true&characterEncoding=utf8&connectTimeout...
db.user.0=nacos
db.password.0=nacos456
# 开启鉴权（此时程序的bootstrap.yml需要配置spring.cloud.nacos.username/password两个值，才能允许连接nacos）
nacos.core.auth.enabled=true
nacos.core.auth.caching.enabled=true
# 关闭使用user-agent判断服务端请求并放行鉴权的功能
nacos.core.auth.enable.userAgentAuthWhite=false
# identity.key和identity.value是配置请求头白名单的（即白名单的Header：JadyerAuthKey=Jadyer123）
nacos.core.auth.server.identity.key=JadyerAuthKey
nacos.core.auth.server.identity.value=Jadyer123
# 这是一个base64字符串（其原始密钥可以随意指定，但长度不得低于32字符）
nacos.core.auth.plugin.nacos.token.secret.key=aHR0cHM6Ly9qYWR5ZXIuY24vMjAxMy8wOS8wNy9jZW50b3MtY29uZmlnLWRldmVsb3Av
[Jadyer@CentOS79 nacos-2.3.1]$ cd bin/
[Jadyer@CentOS79 bin]$ vim startup-standalone.sh
nohup sh /app/software/nacos-2.3.1/bin/startup.sh -m standalone > /app/software/nacos-2.3.1/bin/nohup.log 2>&1 &
[Jadyer@CentOS79 bin]$ chmod +x startup-standalone.sh
[Jadyer@CentOS79 bin]$ ./startup-standalone.sh      # 启动nacos（默认用户名密码均为nacos，首次登录后记得修改密码）
[Jadyer@CentOS79 bin]$ su root
[root@CentOS79 bin]# vim /etc/rc.d/rc.local         # 添加自启动
JAVA_HOME=/app/software/jdk-21.0.2                  # （由于rc.local要早于/etc/profiles运行）
PATH=$JAVA_HOME/bin:$PATH                           # （因此rc.local执行时看不到任何环境变量）
export JAVA_HOME PATH                               # （故手动指定JAVA_HOME，为nacos的启动提供java环境）
/app/software/nacos-2.3.1/bin/startup-standalone.sh # 添加这一行即可（绝对路径）
[root@CentOS79 bin]# chmod +x /etc/rc.d/rc.local    # 赋权，使其变成可执行文件
[root@CentOS79 bin]# reboot                         # 重启验证（注意：应用程序连接时，需要开放8848、9848端口）
```

另外，再补充一下：将 Nacos 安装成为 win10 系统服务的方法，步骤如下

1. 下载文件：https://github.com/winsw/winsw/releases/download/v2.12.0/WinSW.NET4.exe
2. WinSW.NET4.exe 放到 D:\Develop\nacos\bin\ 目录下，并重命名为 nacos-service.exe
3. 在该目录 D:\Develop\nacos\bin\ 下创建 nacos-service.xml 文件
4. 在该目录 D:\Develop\nacos\bin\ 的上方文件夹路径位置，输入 cmd 打开命令提示行窗口
5. 执行该命令即可：nacos-service.exe install （若要卸载，则将 install 参数换为 uninstall）

其中，nacos-service.xml 内容如下：

```xml
<service>
   <!-- 唯一服务ID-->
   <id>nacos</id>
   <!-- 显示服务的名称 -->
   <name>nacos</name>
   <!-- 服务描述 -->
   <description>本地的Nacos服务</description>
   <!-- 日志路径 -->
   <logpath>D:\Develop\nacos\bin\logs\</logpath>
   <!-- 日志模式 -->
   <logmode>roll</logmode>
   <!-- 可执行文件的命令 -->
   <executable>D:\Develop\nacos\bin\startup.cmd</executable>
   <arguments>-m standalone</arguments>
   <!-- 停止可执行文件的命令 -->
   <stopexecutable>D:\Develop\nacos\bin\shutdown.cmd</stopexecutable>
</service>
```

## 安装Nexus

下载地址：https://help.sonatype.com/en/download.html，这里使用的是 [nexus-3.68.1-02-java11-unix.tar.gz](https://sonatype-download.global.ssl.fastly.net/repository/downloads-prod-group/3/nexus-3.68.1-02-java11-unix.tar.gz)

```sh
[Jadyer@CentOS79 ~]$ cd /app/software/backup/
[Jadyer@CentOS79 backup]$ mkdir -p /app/software/nexus-3.68.1-02
[Jadyer@CentOS79 backup]$ tar zxvf nexus-3.68.1-02-java11-unix.tar.gz -C /app/software/nexus-3.68.1-02
[Jadyer@CentOS79 backup]$ cd /app/software/nexus-3.68.1-02
[Jadyer@CentOS79 nexus-3.68.1-02]$ vim nexus-3.68.1-02/bin/nexus.rc      # 修改运行Nexus所使用的用户（默认为root）
[Jadyer@CentOS79 nexus-3.68.1-02]$ vim nexus-3.68.1-02/bin/nexus         # 修改运行Nexus所使用的JDK
INSTALL4J_JAVA_HOME_OVERRIDE="/app/software/nexus-3.68.1-02/jdk-11.0.23" # 修改第14行的值（含双引号）
[Jadyer@CentOS79 nexus-3.68.1-02]$ vim nexus-3.68.1-02/etc/nexus-default.properties # 修改Nexus的默认访问端口
application-port=8081                                                               # 默认端口即为8081
[root@CentOS79 /]# vim /etc/rc.d/rc.local                     # 添加自启动
/app/software/nexus-3.68.1-02/nexus-3.68.1-02/bin/nexus start # 添加这一行即可（绝对路径）
[root@CentOS79 /]# chmod +x /etc/rc.d/rc.local                # 赋权，使其变成可执行文件
[root@CentOS79 /]# reboot                                     # 最后，重启系统，验证
```

其中，以下几点可以注意一下：

1. 解压完 nexus-3.68.1-02-java11-unix.tar.gz 文件后，会出现 2 个目录
   * nexus-3.68.1-02：该目录包含了 Nexus 运行所需的启动脚本、依赖 jar 等等
   * sonatype-work：该目录用于存储数据，比如 Nexus 生成的配置文件、日志文件、仓库文件等
2. bin 目录下的 nexus 命令，有以下几个参数：
   * start：以后台进程启动服务，日志以文件形式保存
   * run：以当前进程启动服务，日志直接打印在控制台
   * stop：停止服务
   * restart：重启服务
   * status：查看服务状态
3. 之所以单独指定 `jdk-11.0.23`，是因为实测：当指定 `jdk-21.0.2` 时会启动失败，并有下面的提示
   ```text
   No suitable Java Virtual Machine could be found on your system.
   The version of the JVM must be at least 1.8 and at most 11.
   Please define INSTALL4J_JAVA_HOME to point to a suitable JVM.
   ```
4. 启动后，浏览器默认访问地址为：[http://127.1.1.1:8081/](http://127.1.1.1:8081/)<br/>
   默认用户为admin，默认密码位于：/app/software/nexus-3.68.1-02/sonatype-work/nexus3/admin.password<br/>
   首次登录后，会提示修改密码，修改完密码后，admin.password 文件也就会消失
5. 首次登陆时，会提示是否打开允许匿名访问（后面也可以在Nexus管理台：Security：Anonymous Access菜单进行修改）
6. 启动后，会发现控制台（../sonatype-work/nexus3/log/nexus.log）经常会输出下面的异常日志
   ```text
   2024-04-18 12:31:43,187+0800 WARN  [pool-6-thread-9]  admin com.sonatype.nexus.plugins.outreach.internal.outreach.SonatypeOutreach - Could not download page bundle
   org.apache.http.conn.ConnectTimeoutException: Connect to sonatype-download.global.ssl.fastly.net:443 [sonatype-download.global.ssl.fastly.net/31.13.86.21] failed: connect timed out
   ```
   关闭也简单：Nexus管理台：System：Capabilities菜单：编辑Outreach.Management：点击Disable，再重启Nexus即可

### 增加代理源

通常在安装完 Nexus 后，都会增加新的代理源，具体步骤如下：

1. Nexus管理台：Repository：Repositories菜单：点击右侧Create repository：选择 `maven2 (proxy)`
2. **Name、Remote storage、Negative Cache TTL** 填入 aliyun、https://maven.aliyun.com/repository/public、288000
3. 以此类推，再把 **apache** 的也创建进来（其地址为：https://repository.apache.org/content/repositories/releases/）
4. 修改 maven-public：将这 2 个代理源加入 Member repositories，并将其排在最前面，再把 maven-central 排在最后

通过上面的操作，就成功增加了 2 个新的代理源，并加入到了 maven-public 这个 Group 里面

关于仓库的不同类型，是这样的：

* hosted：宿主仓库，也就是内部项目的发布仓库，用于存储企业内部生成的jar，也可以放第三方的jar（比如Oracle驱动）
* proxy：代理仓库，用于代替企业成员去远程下载jar，然后企业成员就可以统一从该仓库下载jar，节省了远程下载的消耗
* group：分组仓库，用于把仓库组合在一起，统一提供服务，企业成员在settings.xml或者pom.xml里只配置这一个地址即可

> 补充：有的企业会再新建一个库，叫做 `3rd party`，类型是 `hosted`，专门存放第三方的 jar

### 创建普通用户

为了不暴露 admin 用户，我们创建一个普通用户并赋予角色

1. Nexus管理台：Security：Roles菜单：点击右侧Create Role：选择 Role Type 为 `Nexus role`
2. `Role ID` 填入 **xxx-dev-role**，`Role Name` 填入 **xxx研发角色**
3. `Applied Privileges` 处搜索并添加一条这样的权限：**nx-repository-view-maven2-maven-snapshots-edit**
4. `Applied Roles` 处搜索并添加一个这样的角色：**nx-anonymous**<br/>
   即此举等于是复用一份匿名角色的权限，到当前新建的角色中，下面是**nx-anonymous**角色默认拥有的权限：
   ```text
   nx-healthcheck-read
   nx-search-read
   nx-repository-view-*-*-read
   nx-repository-view-*-*-browse
   ```
5. 最后创建用户时，赋予新建的 **xxx-dev-role** 角色即可

另外有几点需要注意：

* 实测同时添加 nx-component-upload 和 nx-repository-view-maven2-maven-snapshots-add 权限<br/>
  也无法上传 jar 包，会提示：authorization failed for http://127.0.0.1:8081..., status: 403 Forbidden<br/>
  而仅添加一个 nx-repository-view-maven2-maven-snapshots-edit 权限，就能够成功上传 jar 包
* maven-snapshots 仓库的 Deployment policy 可以修改为 Disable redeploy，即不允许重新部署<br/>
  所以只能打新包，防止恶意篡改，就跟 maven-releases 仓库的默认配置一样（它不会影响 jar 包的上传）

### 修改Maven配置

```xml
<localRepository>D:/Develop/Code/repo_mvn</localRepository>

<server>
    <id>xuanyu-public</id>
    <username>xuanyu</username>
    <password>xuanyu</password>
</server>
<server>
   <id>xuanyu-admin</id>
   <username>admin</username>
   <password>admin</password>
</server>

<!-- mirror-id 要和 server-id 保持一致 -->
<mirror>
    <id>xuanyu-public</id>
    <url>http://127.0.0.1:8081/repository/maven-public/</url>
    <mirrorOf>*</mirrorOf>
</mirror>
```

对于 Maven 的配置，仅此三项就够了（不用配置<profile>）

对于 pom.xml 而言，也不用再配置 &lt;repositories&gt; 和 &lt;pluginRepositories&gt; 了

只需要配置 &lt;distributionManagement&gt; 即可，如下所示

```xml
<!-- 这里的两个 id 可以相同，并保持和 <maven-settings-server-id> 一致即可 -->
<distributionManagement>
    <repository>
        <id>xuanyu-public</id>
        <url>http://127.0.0.1:8081/repository/maven-releases/</url>
    </repository>
    <snapshotRepository>
        <id>xuanyu-public</id>
        <url>http://127.0.0.1:8081/repository/maven-snapshots/</url>
    </snapshotRepository>
</distributionManagement>
```

### 手动上传三方jar

由于上面创建的 **xxx-dev-role** 角色，只是针对 maven-snapshots 仓库配置了 edit 权限

因此它是没有权限往 maven-releases 仓库中上传 jar 包的

此时要么给它增加 maven-releases-edit 权限，要么换成用 admin 用户来上传，命令举例如下：

```shell
# 注意：参数 **-DrepositoryId** 的值，其实就是 <maven-settings-server-id> 的值
mvn deploy:deploy-file -DgroupId=com.jadyer.oracle -DartifactId=ojdbc6 -Dversion=11.2.0.4 -Dpackaging=jar -Dfile=ojdbc6-11.2.0.4.jar -Dsources=ojdbc6-11.2.0.4-sources.jar -DrepositoryId=xuanyu-admin -Durl=http://127.0.0.1:8081/repository/maven-releases/
```

## 安装wkhtmltopdf

下载地址为：https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox-0.12.6-1.centos7.x86_64.rpm

```sh
[Jadyer@localhost ~]$ cd /app/software/backup/
[Jadyer@localhost backup]$ rpm -ivh --badreloc --relocate /usr/local=/app/software/wkhtmltox-0.12.6-1 wkhtmltox-0.12.6-1.centos7.x86_64.rpm
error: Failed dependencies:
	fontconfig is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	libX11 is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	libXext is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	libXrender is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	libjpeg is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	xorg-x11-fonts-75dpi is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
	xorg-x11-fonts-Type1 is needed by wkhtmltox-1:0.12.6-1.centos7.x86_64
[Jadyer@localhost backup]$
[Jadyer@localhost backup]$ su root
[root@localhost backup]# yum install -y libXrender*
[root@localhost backup]# yum install -y libXext*
[root@localhost backup]# yum install -y xorg-x11-fonts-Type1
[root@localhost backup]# yum install -y xorg-x11-fonts-75dpi
[root@localhost backup]# yum install -y libjpeg              # 注意：接下来还是要用root安装，普通用户会失败
[root@localhost backup]# rpm -ivh --badreloc --relocate /usr/local=/app/software/wkhtmltox-0.12.6-1 wkhtmltox-0.12.6-1.centos7.x86_64.rpm
Preparing...                          ################################# [100%]
Updating / installing...
   1:wkhtmltox-1:0.12.6-1.centos7     ################################# [100%]
[root@localhost backup]# vim /etc/profile
                             # Set wkhtmltox Environment Variable
                             WKHTMLTOPDF_HOME=/app/software/wkhtmltox-0.12.6-1
                             PATH=$WKHTMLTOPDF_HOME/bin:$PATH
                             export WKHTMLTOPDF_HOME PATH
[root@localhost backup]# source /etc/profile
[root@localhost backup]# echo $PATH
[root@localhost backup]# wkhtmltopdf -V
wkhtmltopdf 0.12.6 (with patched qt)
[root@localhost backup]# yum install -y fontconfig mkfontscale  # 安装字体
[root@localhost backup]# fc-list                                # 查看系统中已安装的字体
[root@localhost backup]# fc-list :lang=zh                       # 查看系统中已安装的中文字体
[root@localhost backup]# cd /usr/share/fonts/
[root@localhost fonts]# rz simsun.ttc                           # 上传字体文件至/usr/share/fonts/
[root@localhost fonts]# mkfontscale
[root@localhost fonts]# mkfontdir
[root@localhost fonts]# fc-cache                                # 通过这三个命令建立字体索引信息、更新字体缓存
[root@localhost fonts]# fc-list :lang=zh                        # 查看系统中已安装的中文字体
```