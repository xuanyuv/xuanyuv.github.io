---
layout: post
title: "JUnit基本用法"
categories: 单元测试
tags: junit demo
author: 玄玉
excerpt: 演示JUnit4.x的基本用法。
---

* content
{:toc}


> **记着：** *单元测试不是证明您是对的，而是证明您没有错误！*

JUnit主要分为`JUnit4.x`和`JUnit3.8`

JUnit3.8是JUnit3.x系统的最后一个版本，也是非常经典的版本

从JUnit4.x开始，便有了翻天覆地的变化，它开始支持`JavaAnnotation`

但它与JUnit3.8的本质的理论基础都是一样的

JUnit应用了大量的设计模式，其本身代码非常少，但可扩展性极强，所以目前很多测试框架都是基于JUnit的

**Tips：** *比如说`JUnitPerf`，它也是基于JUnit的，是用来做性能测试的*

下面在演示`JUnit4.x`与`JUnit3.8`的示例用法之前，先看下二者的一些不同点

| JUnit4.x | JUnit3.8 |
|:-------------:|:------------------:|
| 无            | extends TestCase   |
| @Before       | void setUp()       |
| @After        | void tearDown()    |
| @Test         | void testXxx()     |
| @BeforeClass  | 无                  |
| @AfterClass   | 无                  |
| @SuiteClasses | static Test suite() |

## 公共的待测试类

```java
package com.jadyer.service;
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
    public int minus(int a, int b) {
        return a - b;
    }
    public int multiply(int a, int b) {
        return a * b;
    }
    public int divide(int a, int b) throws Exception {
        if (0 == b) {
            throw new Exception("除数不能为零!");
        }
        return a / b;
    }
    // The private method for JUnit4.x test
    private int addPrivate(int a, int b){
        return a + b;
    }
}
```

## JUnit4.x

```java
package com.jadyer.demo;
import java.lang.reflect.Method;
import org.junit.Assert;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import com.jadyer.service.Calculator;

/**
 * JUnit4中不需要继承JUnit框架提供的相关类，它的测试方法应该满足如下原则
 * 1..public
 * 2..void
 * 3..无参
 * 4..方法名随意
 * 5..使用@Test指明该方法为测试方法
 * Created by 玄玉<https://jadyer.github.io/> on 2010/11/17 00:39.
 */
public class CalculatorTest {
    private Calculator cal;

    /**
     * @BeforeClass标注的方法，会在整个类加载前被执行一次，因此它是执行最早的，比@Before执行的时机还要早
     * 比如连接数据库，通常初始时连一次就行，不需要执行每个测试方法时都连接一次，此时可以使用@BeforeClass
     * 但使用@BeforeClass注解的方法，要求是public static void的，而方法名随意
     * 由于该方法是在类被加载时执行一次，若不定义成static，那么执行该方法时就必须生成类的实例
     * 但是该类刚被JVM加载时，还没有生成对象。而一个方法被类调用，那么该方法就必然是static的
     * 所以这里的方法名中的static不是随便写的，而是根据Java的语法规则来定义的
     * 同样使用@AfterClass注解标识的方法的作用，与@BeforeClass作用完全相反
     * 而这也是JUnit3.8所没有的
     */
    @BeforeClass
    public static void globalInit(){
        System.out.println("---globalInit invoked---");
    }

    @AfterClass
    public static void globalDestroy(){
        System.out.println("---globalDestroy invoked---");
    }

    /**
     * JUnit4中使用@Before标识的方法的作用，与JUnit3的setUp()是完全相同的
     * 而且JUnit4中该方法的名字可随意，只需要提供@Before注解标识即可
     * 同理使用@After标注的方法，完全等价于JUnit3.8中的tearDown()
     */
    @Before
    public void init(){
        System.out.println("---init invoked---");
        //由于每执行一个测试方法前，都会运行一次该方法
        //所以每一个测试方法中的cal指向的都是不同的Calculator对象
        cal = new Calculator();
    }

    @After
    public void destroy(){
        System.out.println("---destroy invoked---");
        cal = null;
    }

    @Test
    public void myAdd(){
        int result = cal.add(1, 2);
        Assert.assertEquals(3, result);
    }

    @Test
    public void myMinus(){
        int result = cal.minus(1, 2);
        Assert.assertEquals(-1, result);
    }

    @Test
    public void myMultiply(){
        int result = cal.multiply(2, 3);
        Assert.assertEquals(6, result);
    }

    @Test
    public void myDivide(){
        try{
            int result = cal.divide(6, 5);
            Assert.assertEquals(1, result);
        }catch(Exception ex){
            ex.printStackTrace();
        }
    }

    /**
     * 通过expected指定-->期望该测试方法所要抛出的异常，若该方法未抛出expected指定异常，认为测试失败；反之认为测试成功
     * 但使用expected后，就不应该在测试方法中使用try{}catch()了，因为try{}catch()会捕获异常并处理，而不是把异常抛出
     * 但我们可以在测试方法上使用throws Exception。这是JUnit4中测试异常的方式，远比JUnit3.8中测试异常的方式简单的多
     */
    @Test(expected = Exception.class)
    public void myDivide22()throws Exception{
        cal.divide(1, 0);
    }

    /**
     * 使用timeout指定-->期望当前测试方法的执行时间，单位是毫秒
     * 下面的timeout=100即指定该测试方法的执行时间不能超过100毫秒，否则视为测试失败
     */
    @Test(timeout = 100)
    public void myDivide33(){
        try {
            cal.divide(4, 2);
            //让当前线程沉睡110毫秒
            //Thread.sleep(110);
            //TimeUnit.MILLISECONDS.sleep(110);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 使用@Ignore标注的测试方法，在测试时将会被忽略掉，而不被执行
     * 也可以写为@Ignore("This is ...")来描述一些提示信息
     */
    @Ignore
    @Test(expected = Exception.class)
    public void myDivide44()throws Exception{
        cal.divide(1, 0);
    }

    /**
     * 测试私有方法时，绝对不要把源私有方法中的private改为public
     * 也就是说，绝对不要为了测试而修改源代码，除非通过测试发现了BUG
     * 但我们可以通过反射的方式突破私有的限制，然后来测试私有方法
     */
    @Test
    public void myAddPrivate(){
        Object result = null;
        try{
            Class<Calculator> clazz = Calculator.class;
            //Integer.TYPE == int.class -->获取int对应的class对象
            //Integer.class -------------->获得Integer对应的class对象
            //尽管Java中可以自动装箱和拆箱，但int和Integer使用的class对象是不一样的
            //因此这里可以使用int.class或者Integer.TYPE，但是不可以使用Integer.class
            Method method = clazz.getDeclaredMethod("addPrivate", new Class[]{int.class, Integer.TYPE});
            //将其值设为true之后，就可以访问任何级别的方法了
            method.setAccessible(true);
            result = method.invoke(cal, new Object[]{1,2});
        }catch(Exception ex){
            ex.printStackTrace();
            //不过一旦执行流程进入到catch{}里面，说明期望的跟实际的是不一致的，表明测试失败了
            //因此为了完善整个测试，就在这里加上了Assert.fail()，即立刻断言，让testXxx()失败
            //这是JUnit进行单元测试的一些小的技巧，也是在实际工作当中用得比较多的一些经验的积累
            Assert.fail();
        }
        Assert.assertEquals(3, result);
    }
}
```

## JUnit3.8

```java
package com.jadyer.demo;
import com.jadyer.service.Calculator;
import junit.framework.Assert;
import junit.framework.TestCase;

/**
 * JUnit3.8中的测试类必须继承TestCase，它的测试方法应该满足如下原则
 * 1..public
 * 2..void
 * 3..无参
 * 4..方法名以test开头，即testXxx()
 * Created by 玄玉<https://jadyer.github.io/> on 2010/11/17 00:39.
 */
public class CalculatorTest extends TestCase {
    private Calculator cal;

    /**
     * 执行每一个testXxx()之前，都会先执行setUp()
     * 就是说有几个testXxx()，便执行几次setUp()
     */
    public void setUp(){
        System.out.println("------setUp is invoked------");
        cal = new Calculator();
    }

    /**
     * setUp()用来完成初始化，tearDown()用来完成资源的回收
     * 在执行完每一个testXxx()之后，都会去执行一次tearDown()
     */
    public void tearDown(){
        System.out.println("------tearDown is invoked------");
        cal = null;
    }

    public void testAdd() {
        int result = cal.add(1, 2);
        Assert.assertEquals(3, result);
    }

    public void testMinus() {
        int result = cal.minus(1, 2);
        Assert.assertEquals(-1, result);
    }

    public void testMultiply() {
        int result = cal.multiply(2, 3);
        Assert.assertEquals(6, result);
    }

    /**
     * 这里不能public void testDivide()throws Exception{}，尽管符合语法规则，但不符合JUnit测试规则
     * 因为它本来就是要测试我们的代码是否有问题，若这里也把异常抛出的话，那么这里的测试也就没有任何意义了
     */
    public void testDivide() {
        int result = 0;
        try {
            result = cal.divide(6, 4);
        } catch (Exception e) {
            e.printStackTrace();
            Assert.fail();
        }
        Assert.assertEquals(1, result);
    }
}
```

再补充一个`JUnit3.8`自身提供的，执行单元测试类的`TestRunner.class`的使用方式

```java
package com.jadyer.junit3;

/**
 * 在junit.awtui和junit.swingui和junit.textui三个包中都提供了TestRunner.class类
 * 这是JUnit本身提供的三种运行方式，不依赖于任何IDE，它可以通过命令行或者图形界面来独立运行
 * 当JUnit和Ant结合时，它还是使用命令行的方式运行的，然后把结果输出给Ant，最后产生测试报告
 * Created by 玄玉<https://jadyer.github.io/> on 2010/11/17 00:39.
 */
public class TestRunnerDemo {
    public static void main(String[] args) {
        //以命令行的方式运行
        junit.textui.TestRunner.run(CalculatorTest.class);
        //以AWT方式运行
        junit.awtui.TestRunner.run(CalculatorTest.class);
        //以Swing方式运行
        junit.swingui.TestRunner.run(CalculatorTest.class);
    }
}
```