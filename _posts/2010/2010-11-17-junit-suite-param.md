---
layout: post
title: "JUnit中的测试套件和参数化测试"
categories: 单元测试
tags: junit
author: 玄玉
excerpt: 演示JUnit中的测试套件和参数化测试的用法。
---

* content
{:toc}


## 测试套件

这里以`Junit4.x`为例，介绍测试套件用途以及写法

JUnit为单元测试提供了默认的测试运行器，它的测试方法都是由它负责执行的

我们也可以定制自己的运行器，所有的运行器都继承自`org.junit.runner.Runner`

还可以使用`org.junit.runer.RunWith`注解，为每个测试类指定使用具体的运行器

一般情况下，默认测试运行器可以应对绝大多数的单元测试要求

当使用JUnit的一些高级特性，或针对特殊需求定制测试方式时，显式的声明测试运行就必不可少了

下面是`JUnit4.x`中创建测试套件类的示例代码

```java
package com.jadyer.junit4;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

/**
 * JUnit4.x测试套件的创建步骤，大体如下
 * 1、创建一个public的空类作为测试套件的入口，并保证存在不含任何参数的构造函数
 * 2、使用org.junit.runner.RunWith和org.junit.runners.Suite.SuiteClasses注解标注该空类
 * 3、将org.junit.runners.Suite作为参数传入RunWith注解，即表明使用套件运行器执行此类
 * 4、将需要放入此测试套件的测试类组成数组，作为SuiteClasses注解的参数
 * Created by 玄玉<http://jadyer.cn/> on 2010/11/17 00:43.
 */
@RunWith(Suite.class)
@SuiteClasses({MyStackTest.class, CalculatorTest.class})
public class TestAll {}
```

下面是`JUnit3.8`中创建测试套件类的示例代码

```java
package com.jadyer.junit3;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

/**
 * JUnit3.8中批量运行所有的测试类（直接在该类上Run As JUnit Test）
 * Created by 玄玉<http://jadyer.cn/> on 2010/11/17 00:43.
 */
public class TestAll extends TestCase {
    //方法名固定的：必须为public static Test suite()
    public static Test suite() {
        //TestSuite类实现了Test接口
        TestSuite suite = new TestSuite();
        //这里传递的是测试类的Class对象。该方法还可以接收TestSuite类型对象
        suite.addTestSuite(MyStackTest.class);
        suite.addTestSuite(CalculatorTest.class);
        return suite;
    }
}
```

## 参数化测试

只有`JUnit4.x`才提供了参数化测试的支持，`JUnit3.8`则没有

下面简单介绍下什么是参数化测试

为保证单元测试的严谨性，通常会模拟不同的测试数据来测试方法的处理能力

为此我们需要编写大量的单元测试的方法，可是这些测试方法都是大同小异的

它们的代码结构都是相同的，不同的仅仅是测试数据和期望值

这时可以使用参数化测试，提取测试方法中相同代码，提高代码重用度

* 参数化测试也有缺点
     > 一般来说，在一个类里面只执行一个测试方法，因为所准备的数据是无法共用的<br>
这就要求，所要测试的方法是大数据量的方法，所以才有必要写一个参数化测试<br>
而在实际开发中，参数化测试用到的并不是特别多

下面演示一下`JUnit4.x`中参数化测试的示例代码

首先是一个待测试的类

```java
package com.jadyer.junit4;
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
}
```

下面就是`JUnit4.x`参数化测试的写法

```java
package com.jadyer.junit4;
import java.util.Arrays;
import java.util.Collection;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;
import com.jadyer.junit4.Calculator;

/**
 * JUnit4.x的参数化测试的几个要点
 * 1、准备使用参数化测试的测试类必须由org.junit.runners.Parameterized运行器修饰
 * 2、准备数据。数据的准备需要在一个方法中进行，该方法需要满足的要求如下
 *    2.1、该方法必须由org.junit.runners.Parameterized.Parameters注解修饰
 *    2.2、该方法必须为返回值是Java.util.Collection 类型的public static方法
 *    2.3、该方法没有参数，方法名可随意（并且该方法是在该类实例化之前执行的）
 * 3、为测试类声明几个变量，分别用于存放期望值和测试所用的数据
 * 4、为测试类声明一个带有参数的公共构造函数，并在其中为上一步声明的变量赋值
 * 5、编写测试方法，使用定义的变量作为参数进行测试
 * Created by 玄玉<http://jadyer.cn/> on 2010/11/17 00:43.
 */
@RunWith(Parameterized.class)
public class ParameterTest {
    private int expected;
    private int input11;
    private int input22;

    public ParameterTest(int expected, int input11, int input22){
        this.expected = expected;
        this.input11 = input11;
        this.input22 = input22;
    }

    /**
     * 该测试的执行流程，如下描述
     * 1、首先会执行prepareData()方法，将准备好的数据作为一个Collection返回
     * 2、接下来根据准备好的数据调用构造方法（Collection中有几个元素，该构造方法就会被调用几次）
     * 这里Collection中有4个元素，所以ParameterTest()构造方法会被调用4次，于是会产生4个该测试类的对象
     * 对于每一个测试类的对象，都会去执行testAdd()方法
     * 而Collection中的数据是由JUnit传给ParameterTest(int expected, int input11, int input22)构造方法的
     * 于是testAdd()用到的三个私有参数，就被ParameterTest()构造方法设置好值了，而它们三个的值就来自于Collection
     */
    @Parameters
    public static Collection prepareData(){
        //该二维数组的类型必须是Object，其数据是为测试Calculator中的add()方法而准备的
        //该二维数组中的每一个元素中的数据都对应着构造方法ParameterTest()中的参数的位置
        //所以依据构造方法的参数位置判断，该二维数组中的第一个元素里面的第一个数据等于后两个数据的和
        //有关这种使用规则，请参考JUnit4.x的API文档中的org.junit.runners.Parameterized类的说明
        Object[][] object = { {3,1,2}, {0,0,0}, {-4,-1,-3}, {6,-3,9} };
        return Arrays.asList(object);
    }

    @Test
    public void testAdd(){
        Calculator cal = new Calculator();
        Assert.assertEquals(expected, cal.add(input11, input22));
    }
}
```