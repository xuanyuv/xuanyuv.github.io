---
layout: post
title: "JUnit借助Cobertura生成测试覆盖率报告"
categories: 单元测试
tags: junit cobertura
author: 玄玉
excerpt: 演示了Cobertura的用法，以生成JUnit测试覆盖率报告。
---

* content
{:toc}


`Cobertura`本身不是英文，它是西班牙语

`Cobertura`是用来统计测试覆盖率的（是相对应被测试的代码【即源代码】来说的）

比如100行源代码，统计一下到底有多少行被我们的单元测试所执行了（即覆盖了）

> 测试覆盖率能达到70%甚至80%的话，就表示目前系统基本上是测试良好的<br>
对于有的公司来说，则要求测试覆盖率达到80%，这是个非常非常高的要求了<br>
因为有一些情况是无法模拟出来的，比如网络突然断线或者数据库突然当掉

`Cobertura`生成测试覆盖率报告共有三种方式：`Maven`、`Ant`、`命令行`

其中Maven插件的方式是最简单的，Ant脚本次之，最麻烦的是命令行（后两种基本很少使用）

下面针对这三种方式，依次介绍

## Maven插件生成报告

这是待测试的服务`Calculator.java`

```java
package com.jadyer.demo;
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
    public int divide(int a, int b) {
        if(0 == b){
            throw new IllegalArgumentException("非法参数：除数不能为零！！");
        }
        return a / b;
    }
}
```

这是测试用例`CalculatorTest.java`

```java
package com.jadyer.demo.test;
import com.jadyer.demo.Calculator;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

/**
 * JUnit借助Cobertura生成测试覆盖率报告
 * Created by 玄玉<https://jadyer.cn/> on 2013/07/09 13:13.
 */
public class CalculatorTest {
    private Calculator calService;

    @Before
    public void init(){
        this.calService = new Calculator();
    }

    @Test
    public void myAdd() {
        int result = this.calService.add(1, 2);
        Assert.assertEquals(3, result);
    }

    @Test
    public void myDivide() {
        int result = this.calService.divide(3, 2);
        Assert.assertEquals(1, result);
    }

    //@Test(expected=IllegalArgumentException.class)
    //public void myDivideException() {
    //    this.calService.divide(3, 0);
    //}
}
```

用到的`pom.xml`文件如下

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.jadyer.demo</groupId>
    <artifactId>demo-cobertura</artifactId>
    <version>1.0</version>
    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.12</version>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>cobertura-maven-plugin</artifactId>
                <version>2.5.1</version>
            </plugin>
        </plugins>
    </build>
</project>
```

获取报告的方法为：运行`mvn cobertura:cobertura`命令

执行完后生成的报告为`target/site/cobertura/index.html`

下面为201612031536补充的测试报告截图

![](/img/2013/2013-07-09-junit-cobertura-01.png)

![](/img/2013/2013-07-09-junit-cobertura-02.png)

## Ant脚本生成报告

主要是配置`build.xml`，如下所示

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project name="cobertura.junit.report" default="coverage" basedir=".">
    <!-- 这是一个JavaProject，目录结构属很典型的，即src下存放应用代码，test下存放测试代码，bin下存放应用代码和测试代码的class文件 -->
    <property name="dir.lib" location="lib"/>
    <property name="dir.src" location="src"/>
    <property name="dir.test" location="test"/>
    <!-- 将生成测试覆盖率报告的有关文件都统一放到report目录下 -->
    <property name="dir.report" location="report"/>
    <!-- 将生成测试覆盖率报告时所生成的JUnit测试报告也统一放到report目录下 -->
    <property name="dir.report.junit" location="report/junit"/>
    <!-- 将生成测试覆盖率报告所需的应用代码和测试代码的class也统一放到report目录下 -->
    <property name="dir.report.class" location="report/class"/>
    <!-- 存放测试覆盖率报告结果的目录，最后浏览该目录下的index.html就能看到报告了 -->
    <property name="dir.report.result" location="report/result"/>
    <!-- 用于存放生成测试覆盖率报告时所需的被Cobertura标记过的应用代码class文件的目录 -->
    <property name="dir.report.instrument" location="report/instrument"/>

    <!-- 指明下面<javac/>时需用到的jar包，这里最基本的需要用到下面6个jar -->
    <!-- junit-4.10.jar -->
    <!-- cobertura.jar    (取自下载到的cobertura-1.9.4.1-bin.zip) -->
    <!-- asm-3.0          (取自下载到的cobertura-1.9.4.1-bin.zip中的lib目录) -->
    <!-- asm-tree-3.0     (取自下载到的cobertura-1.9.4.1-bin.zip中的lib目录) -->
    <!-- jakarta-oro-2.0.8(取自下载到的cobertura-1.9.4.1-bin.zip中的lib目录) -->
    <!-- log4j-1.2.9      (取自下载到的cobertura-1.9.4.1-bin.zip中的lib目录) -->
    <path id="app.classpath">
        <fileset dir="${dir.lib}">
            <include name="*.jar"/>
        </fileset>
    </path>

    <!-- 配置Cobatura ant扩展任务（实这个tasks.properties是位于lib/cobertura.jar中的） -->
    <taskdef classpathref="app.classpath" resource="tasks.properties"/>

    <target name="init">
        <delete dir="${dir.report}"/>
        <mkdir dir="${dir.report.junit}"/>
        <mkdir dir="${dir.report.class}"/>
        <mkdir dir="${dir.report.instrument}"/>
    </target>

    <!-- 同时编译应用代码和测试代码 -->
    <target name="compile" depends="init">
        <javac srcdir="${dir.src}:${dir.test}" destdir="${dir.report.class}" debug="true" encoding="UTF-8">
            <classpath refid="app.classpath"/>
        </javac>
    </target>

    <!-- 生成测试覆盖率报告（期间会进行JUnit测试） -->
    <target name="coverage" depends="compile">
        <cobertura-instrument todir="${dir.report.instrument}">
            <ignore regex="org.apache.log4j.*"/>
            <!-- 指定需要生成代码覆盖率报告的class -->
            <fileset dir="${dir.report.class}">
                <include name="**/**.class"/>
                <exclude name="**/*Test.class"/>
            </fileset>
        </cobertura-instrument>
        <!-- printsummary表示是否打印基本信息，haltonfailure表示测试失败是否中止，fork必须启用，可设置为"on/true/yes"等-->
        <junit printsummary="on" haltonerror="on" haltonfailure="on" fork="on">
            <!-- instrumented classes should be before the original (uninstrumented) classes -->
            <classpath location="${dir.report.instrument}"/>
            <classpath location="${dir.report.class}"/>
            <classpath refid="app.classpath"/>
            <!-- 同时运行多个测试用例，todir用来存放测试的输出结果，如果不指定<formatter/>是不会输出结果到todir中的 -->
            <formatter type="plain"/>
            <batchtest todir="${dir.report.junit}">
                <fileset dir="${dir.report.class}">
                    <include name="**/*Test.class"/>
                </fileset>
            </batchtest>
        </junit>
        <!-- srcdir指定被测试的Java源码目录，destdir指定存放生成的报告的目录（默认就会生成html格式的报告） -->
        <cobertura-report srcdir="${dir.src}" destdir="${dir.report.result}"/>
        <!-- 最后将ser文件统一备份到报告目录中（默认的会在build.xml的同一目录下生成cobertura.ser） -->
        <move file="cobertura.ser" todir="${dir.report}"/>
    </target>
</project>
```

## 命令行生成报告

先交待下工程的目录结构

src下存放应用代码，test下存放测试代码，bin下存放应用代码和测试代码的class文件

具体步骤如下

**第一步**

解压`cobertura-1.9.4.1-bin.zip`到本地，并将`D:\Develop\cobertura-1.9.4.1`加入环境变量`path`

**第二步**

将要测试的应用代码、编译之后的class文件和所需jar拷到一个单独的目录中

拷贝完毕后的目录结构为`D:\report\lib,D:\report\src,D:\report\bin(含所有的class文件)`

**第三步**

在命令提示行中使用命令为要生成测试覆盖率报告的代码生成一个`ser`文件

这一步主要目的是为需要生成报告的class文件加入`Cobertura标记`，用来告诉Cobertura哪些文件需要生成测试覆盖率报告

命令为：`D:\report\bin>cobertura-instrument --destination instrumented com/jadyer/demo`

**第四步**

这一步主要是基于`ser`文件运行测试

目的是跑一遍JUnit测试，并将测试结果加入到第三步标记的相对应的class文件内，以便于下一步生成覆盖率报告

命令为`D:\report\bin>java -cp ../lib/junit-4.10.jar;../lib/cobertura.jar;instrumented;.;-Dnet.sourceforge.cobertura.datafile=cobertura.ser org.junit.runner.JUnitCore com.jadyer.demo.test.CalculatorTest`

**第五步**

这是最后一步，主要根据`ser`文件生成测试覆盖率报告，同时关联第三步所标记的class文件的源码

命令为：`D:\report\bin>cobertura-report --format html --datafile cobertura.ser --destination reports ../src`