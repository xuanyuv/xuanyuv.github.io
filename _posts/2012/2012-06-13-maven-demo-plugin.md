---
layout: post
title: "Maven入门及常用插件"
categories: 工具
tags: maven nexus plugin 插件 仓库 私服
author: 玄玉
excerpt: 描述了Maven的一些基础知识，以及常用到的插件。
---

* content
{:toc}


## 安装

1、解压缩`apache-maven-3.0.3-bin.zip`到本地，比如`D:/Develop/apache-maven-3.0.3/`

2、设置环境变量`M2_HOME=D:\Develop\apache-maven-3.0.3`，以及`Path=%M2_HOME%\bin;`

3、`Win+R-->cmd-->mvn -v`打印Apache Maven 3.0.3等信息即表示安装成功

## 配置

修改Maven目录的`settings.xml`第53行`<localRepository>D:/Develop/MavenRepository</localRepository>`

上面的修改用于指定本地仓库目录，接下来将修改后的`settings.xml`拷贝一份到`D:/Develop/MavenRepository/`

剩下的就是到`Intellij idea`或者`MyEclipse`中配置Maven了

注意：`MyEclipse`里面配置时，最好取消勾选`Download repository index updates on startup`

## 其它

常用命令如下

```
mvn clean              -->运行清理操作。默认会清理target文件夹中的数据
mvn clean compile      -->先运行清理，之后运行编译操作。默认会将代码编译到target文件夹中
mvn clean test         -->运行清理和测试操作
mvn clean package      -->运行清理和打包操作。包的名称就是项目模块名称加版本名称
mvn clean install      -->运行清理和安装。所谓安装，就是将打好的包安装到本地仓库中，以便被其它项目调用
mvn clean deploy       -->运行清理和发布。它会将其发布到私服上
mvn archetype:generate -->Maven有一些固定的生成模式，其中使用该可以自动完成骨架的建立
```

Maven中的依赖都是通过坐标进行存储的`GAV：groupId,artifactId,version`

有一些网上的仓库提供了坐标的查询，比如[http://mvnrepository.com](http://mvnrepository.com)或者[http://search.maven.org](http://search.maven.org)

另外，关于版本的约定，通常是像下面这样的

```
版本管理（总版本号.分支版本号.小版本号-里程碑版本）
总版本号：一般表示框架的变动。如Struts1和Struts2，jBPM3和jBPM4
分支版本：一般表示增加了一些功能
小版本号：一般表示在分支版本上的BUG修复
里程碑版：SNAPSHOT-->Alpha-->Beta-->Release-->GA
         SNAPSHOT-->即快照版本，也就是开发中的版本，是最不安全的版本
            Alpha-->内部的测试版本
             Beta-->外部的公测版本
          Release-->已通过测试，并初步稳定，也叫RC版本
               GA-->稳定版本，此时就可以投入市场了
```

## Nexus

##### Nexus的安装

1、下载`nexus-2.0.3-bundle.zip`并解压缩

2、将该值`%NEXUS_HOME%\bin`加入环境变量：`NEXUS_HOME=D:\Develop\nexus-2.0.3-bundle\nexus-2.0.3`

3、安装到windows的服务中：`Win+R---cmd---nuxus install`

4、修改`%NEXUS_HOME%\bin\jsw\conf\wrapper.conf`第15行

　　改为`wrapper.java.command=D:\Develop\Java\jdk1.6.0_30\bin\java`

5、启动nexus服务：`Win+R---cmd---nuxus start`，出现`wrapper | nexus started.`表示启动成功

　　也可以在服务面板中启动nexus服务（`Win+R---services.msc`即可打开服务面板）

6、使用`帐号admin密码admin123`登录`http://127.0.0.1:8081/nexus`（其默认发布在端口为8081的jetty中）

　　nexus有两个版本，一个是war版本（可以发布到tomcat中），一个是zip版本（自带了jetty服务器）

##### Nexus的仓库类型

* virtual

    > 针对Maven1.x的转接仓库，由于我们用的是Maven3.0.5，故该仓库对我们没啥用

* hosted

    > 内部项目的发布仓库<br/>
Releases仓库表示内部模块中release模块的发布仓库<br/>
Snapshots仓库作用与Releases相同<br/>
3rd party仓库表示第三方依赖的仓库，这个数据通常是由内部人员自行下载后发布上去的

* proxy

    > 代理仓库。即从远程中央仓库中寻找数据的仓库<br/>
Apache Snapshots仓库是从Apache网站寻找快照版本的仓库<br/>
Central仓库即中央仓库，它访问的地址是在下面Configuration中Remote Storage Location值决定的<br/>
Codehaus Snapshots仓库从Codehaus开源组织中寻找快照版本的仓库

* group

    > 组仓库。用来方便开发人员进行设置的仓库

##### Nexus的索引更新

1、下载[http://repo1.maven.org/maven2/.index/nexus-maven-repository-index.zip](http://repo1.maven.org/maven2/.index/nexus-maven-repository-index.zip)

2、停止nexus服务：`cmd`窗口使用`nexus stop`或者在服务面板中右键`stop nexux`

3、删除`%NEXUS_HOME%\sonatype-work\nexus\indexer\central-ctx\`中的全部文件

4、将上面下的zip解压后的文件，放到`%NEXUS_HOME%\sonatype-work\nexus\indexer\central-ctx\`里面

5、重启nexus即自动更新索引

# Plugin

下面列举一下较为常见的插件用法

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
<!-- 当前POM模型的版本：目前其值只能是固定的4.0.0 -->
<modelVersion>4.0.0</modelVersion>

<!-- 这三个属性:groupId、artifactId、version即为项目的坐标，简称GAV -->
<!-- 项目的名称 -->
<groupId>com.jadyer.blog</groupId>

<!-- 项目的模块名称。建议用"项目名称-模块名称"。按照Maven约定，此时Java类的包名就应该是com.jadyer.blog.dao -->
<!-- 即通常项目中Java类包都应该基于项目的groupId和artifactId。虽然这不是必须的，但这些显然更加清晰、符合逻辑 -->
<artifactId>blog-dao</artifactId>

<!-- 项目的版本名称 -->
<version>0.0.1.Release</version>

<!-- 打包类型：不设置的话，默认即为jar -->
<packaging>jar</packaging>

<!-- 用于声明一个对于用户而言更为友好的项目名称 -->
<name>玄玉的手工博客系统之DAO模块</name>

<url>http://maven.apache.org</url>

<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <junit.version>4.10</junit.version>
    <mysql.driver.version>5.1.18</mysql.driver.version>
    <maven-source-plugin.version>2.1.2</maven-source-plugin.version>
    <maven-rar-plugin.version>2.2</maven-rar-plugin.version>
    <maven-shade-plugin.version>1.6</maven-shade-plugin.version>
    <maven-compiler-plugin.version>3.1</maven-compiler-plugin.version>
    <maven-surefire-plugin.version>2.14.1</maven-surefire-plugin.version>
    <maven-cobertura-plugin.version>2.5.1</maven-surefire-plugin.version>
    <sql-maven-plugin.version>1.5</sql-maven-plugin.version>
    <mysql.driver>com.mysql.jdbc.Driver</mysql.driver>
    <mysql.url>jdbc:mysql://127.0.0.1:3306/jadyer?characterEncoding=UTF-8</mysql.url>
    <mysql.username>root</mysql.username>
    <mysql.password>hongyu</mysql.password>
</properties>

<dependencies>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>${junit.version}</version>
        <!-- 依赖的范围:默认为compile -->
        <!--     test:测试范围有效。即编译和打包时不会加入该依赖包 -->
        <!--  compile:编译范围有效。即编译和打包时会将该依赖包一并加入 -->
        <!-- provided:编译和测试时有效，最后生成war包时不会加入该依赖。比如web容器本身已包含的servlet-api.jar，再打包则会冲突 -->
        <!--  runtime:运行范围有效，编译时则不依赖 -->
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>${mysql.driver.version}</version>
    </dependency>
</dependencies>

<build>
    <plugins>
        <!-- maven-source-plugin插件:打包项目源码 -->
        <!-- Run As Maven build : clean package -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-source-plugin</artifactId>
            <version>${maven-source-plugin.version}</version>
            <executions>
                <execution>
                    <!-- 绑定在哪个周期。这里设定为package后绑定，即package后再运行maven-source-plugin插件 -->
                    <!-- 注:maven生命周期中，package阶段负责接受编译好的代码并打包成可发布的格式，如JAR -->
                    <phase>package</phase>
                    <!-- 所要运行maven-source-plugin插件的目标 -->
                    <goals>
                        <goal>jar-no-fork</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
        <!-- 将之打成rar压缩包 -->
        <!-- Run As Maven build : clean package -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-rar-plugin</artifactId>
            <version>${maven-rar-plugin.version}</version>
            <executions>
                <execution>
                    <phase>package</phase>
                    <goals>
                        <goal>rar</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
        <!-- 默认打包生成的jar是不能够直接运行的，因为带有main()方法的类信息不会被添加到manifest中 -->
        <!-- 为了生成可执行的jar文件，我们需要借助maven-shade-plugin插件，其配置信息如下 -->
        <!-- Run As Maven build : clean package -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-shade-plugin</artifactId>
            <version>${maven-shade-plugin.version}</version>
            <executions>
                <execution>
                    <phase>package</phase>
                    <goals>
                        <goal>shade</goal>
                    </goals>
                    <configuration>
                        <transformers>
                            <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
    <!-- 配置<mainClass>为带有main()方法类。如此，项目在打包时就会将该信息放到/META-INF/MANIFEST.MF文件中 -->
    <!-- 构建完成后target目录会发现blog-dao-0.0.1.Release.jar和original-blog-dao-0.0.1.Release.jar -->
    <!-- 前者是带有Main-Class信息的可运行的jar，后者是原始的jar。然后我们到cmd中切换到项目根目录中执行该jar -->
    <!-- D:\Develop\MyWorkspace\MavenStudy>java -jar target\blog-dao-0.0.1.Release.jar -->
                                <mainClass>com.jadyer.util.ManiFestTest</mainClass>
                            </transformer>
                        </transformers>
                    </configuration>
                </execution>
            </executions>
        </plugin>
        <!-- 指明源码编译级别 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>${maven-compiler-plugin.version}</version>
            <configuration>
                <source>1.6</source>
                <target>1.6</target>
            </configuration>
        </plugin>
        <!-- 指明测试类的运行情况 -->
        <!-- Run As Maven build : clean package -->
        <!-- 可能由于历史原因，Maven中用于执行测试的插件不是maven-test-plugin，而是maven-surefire-plugin -->
        <!-- 若未使用该插件，Maven默认会执行符合约定格式的测试类（即以Test开头或结尾、或者以TestCase结尾的类） -->
        <!-- 然而我们想跳过测试，或者排除某些测试类，或者使用一些TestNG特性的时候，该插件就很有必要了 -->
        <!-- 也可以执行Run As Maven build : clean package -Dtest=FooTest，其效果是仅运行FooTest测试类 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>${maven-surefire-plugin.version}</version>
            <configuration>
                <!-- 设置包含的测试类 -->
                <includes>
                    <include>**/MyTest*</include>
                </includes>
                <!-- 设置不进行测试的类 -->
                <excludes>
                    <exclude>Test*</exclude>
                </excludes>
                <!-- 跳过测试阶段，并且也不会编译测试类。若仅仅想跳过测试并编译测试类，则可用<skipTests>标签 -->
                <!-- <skip>true</skip> -->
            </configuration>
        </plugin>
        <!-- 生成测试报告(我们可以在生成的报告中轻松查看测试覆盖率等等) -->
        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>cobertura-maven-plugin</artifactId>
            <version>${maven-cobertura-plugin.version}</version>
            <configuration>
                <formats>
                    <format>html</format>
                    <format>xml</format>
                </formats>
            </configuration>
            <executions>
                <execution>
                    <id>cobertura-report</id>
                    <!-- 测试完成后就生成测试报告 -->
                    <phase>test</phase>
                    <goals>
                        <goal>cobertura</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
        <!-- 通过Maven来执行配置好的数据库脚本。可以在POM中配置sql命令，或将脚本写在文件中并在POM中配置文件位置 -->
        <!-- 最后在cmd中运行[mvn sql:execute]执行所有脚本，或在MyEclipse中Run As Maven build:clean package -->
        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>sql-maven-plugin</artifactId>
            <version>${sql-maven-plugin.version}</version>
            <!-- 这是针对该插件的依赖包 -->
            <dependencies>
                <dependency>
                    <groupId>mysql</groupId>
                    <artifactId>mysql-connector-java</artifactId>
                    <version>${mysql.driver.version}</version>
                </dependency>
            </dependencies>
            <configuration>
                <driver>${mysql.driver}</driver>
                <url>${mysql.url}</url>
                <username>${mysql.username}</username>
                <password>${mysql.password}</password>
                <!-- 该插件连接数据库成功后，所要运行的命令 -->
                <sqlCommand>create database IF NOT EXISTS jadyer_maven</sqlCommand>
            </configuration>
            <executions>
                <execution>
                    <phase>package</phase>
                    <goals>
                        <goal>execute</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
</project>
```

补充一下`maven-war-plugin`的用法

```xml

......

<!-- 注意这里为war -->
<packaging>war</packaging>

......

<build>
    <!--
    下面，以aa代指生成的target下Web应用的文件夹名称，以bb代指发布到\tomcat\webapps\目录下的文件名称
    1、aa以<finalName>值为准，并且无视<warName>。若未指定<finalName>值，则默认为'artifactId-version'
    2、bb以<warName>值为优先。若未指定<warName>，则以<finalName>值为准。若二者均未指定，则默认为'artifactId-version'
    -->
    <finalName>myBlogServlet</finalName>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-war-plugin</artifactId>
            <version>2.2</version>
            <configuration>
                <!-- Run As Maven build : clean package 就可以发布到tomcat下了，并按照<warName>命名 -->
                <!-- 访问应用时，访问该地址即可：http://IP:Port/warName/ -->
                <warName>MyMavenStudyWebWarFile</warName>
                <outputDirectory>D:\Develop\apache-tomcat-6.0.35\webapps</outputDirectory>
            </configuration>
        </plugin>
    </plugins>
</build>
```