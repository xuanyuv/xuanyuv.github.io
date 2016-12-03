---
layout: post
title: "WebServices之简述DTD和Schema"
categories: JAX-WS
tags: jax-ws webservices
author: 玄玉
excerpt: 介绍WebServices-wsdl文件的一些基本语义。
---

* content
{:toc}


## DTD

#### 参数实体

该实体不在具体实例化文档中使用，而是在DTD文档内部被使用

比如我们定义这样的一个实体：`<!ENTITY %地址 "街道,城市,邮编,国家">`

然后可以在DTD内部通过`%地址;`来引用它：`<!ELEMENT 联系(人名,电话,%地址;)>`

这就是参数实体的概念

![](/img/2013/2013-03-19-jaxws-dtd-and-schema-01.png)

#### 实体引用

实际上XML已经内置了5个实体（也就是我们常说的实体引用）

这是为了避免把字符数据和标签中需要用到的一些特殊符号相混淆

| 字符 | 实体引用 |
|:-----:|:--------------:|
| **&** | **&amp;amp;**  |
| **>** | **&amp;gt;**   |
| **<** | **&amp;lt;**   |
| **“** | **&amp;quot;** |
| **’** | **&amp;apos;** |

#### 注释CDATA

注释：`<!--`和`-->`引起来的

CDATA：该标签中的所有标签或实体引用都会被忽略，而被XML处理程序一视同仁地当作字符数据看待

```xml
<!-- 运行时会出错 -->
<name><<"“XML应用大全”">></name>
<!-- 运行时正常输出<<"“XML应用大全”">> -->
<name><![CDATA[<<"“XML应用大全”">>]]></name>
```

## Schema

`web.xml`的顶部会看到类似[http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd](http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd)的标志

这说明`web.xml`文件使用了`web-app_2_5.xsd`的`Schema`作为限制标准，并且Schema的后缀是xsd

该文件看似是在SUN网站上，实则位于`tomcat6\\lib\\servlet-api.jar\\javax\\servlet\\resources中`

#### 为何要Schema

DTD的局限性

* DTD不遵守XML语法（写XML文档实例时用一种语法，写DTD时用另外一种语法）
* DTD数据类型有限（与数据库数据类型不一致）
* DTD不可扩展

Schema的新特性

* Schema基于XML语法
* Schema可以用能处理XML闻到那股的工具处理
* Schema大大扩充了数据类型，可以自定义数据类型
* Schema支持元素的继承：`Object-Oriented`
* Schema支持属性组

#### Schema的文档结构

* `<xs:schema`表示所有Schema文档使用schema作为其根元素
* `xmlns:xs`表示用于构造schema的元素和数据类型来自[http://www.w3.org/2001/XMLSchema](http://www.w3.org/2001/XMLSchema)命名空间
* `targetNamespace`表示本schema定义的元素和数据类型属于[http://mynamespace/mychema](http://mynamespace/mychema)命名空间

```xml
<?xml version="1.0"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
        targetNamespace="http://mynamespace/mychema">
<!-- 放入实际内容 -->
</xs:schema>
```

#### Schema的数据类型

简单类型

* 1、内置的数据类型（built-in data types）
* 　　1.1、基本的数据类型
* 　　1.2、扩展的数据类型
* 2、用户自定义数据类型（通过simpleType定义）

复杂类型（通过complexType定义，在WebServices中经常会用到它，属于必用）

##### 基本数据类型

| 基本数据类型 | 描述 |
|:--------------|:----------------------------|
| **string**    | 表示字符串                   |
| **boolean**   | 布尔型                       |
| **decimal**   | 代表特定精度的数字             |
| **float**     | 表示单精度32位浮点数           |
| **double**    | 表示双精度64位浮点数           |
| **duration**  | 表示持续时间                  |
| **dateTime**  | 代表特定的时间                 |
| **time**      | 代表特定的时间，但是是每天重复的 |
| **date**      | 代表日期                      |
| **hexBinary** | 表示十六进制数                 |
| **anyURI**    | 表示一个URI，用来定位文件       |
| **NOTATION**  | 代表NOTATION类型              |

##### 扩展数据类型

| 扩展数据类型 | 描述 |
|:-------------|:--------------------------------------------------------------|
| **ID**       | 用于唯一标识元素                                                |
| **IDREF**    | 参考ID类型的元素或属性                                           |
| **ENTITY**   | 实体类型                                                       |
| **NMTOKEN**  | NMTOKEN类型                                                    |
| **NMTOKENS** | NMTOKEN类型集                                                  |
| **long**     | 表示整型数，大小介于-9223372036854775808和9223372036854775807之间 |
| **int**      | 表示整型数，大小介于-2147483648和2147483647之间                   |
| **short**    | 表示整型数，大小介于-32768和32767之间                             |
| **byte**     | 表示整型数，大小介于-128和127之间                                 |

##### 数据类型的特性

| 数据类型的特性 | 描述 |
|:-------------------|:-----------------------------------------------------|
| **enumeration**    | 在指定的数据集中选择，限定用户的选值                      |
| **totalDigits**    | 精确指定数字个数                                       |
| **fractionDigits** | 限定最大的小数位，用于控制精度（必须大于或等于零）          |
| **length**         | 指定数据的长度，即精确指定允许的最大字符长度               |
| **maxLength**      | 指定允许的最大字符长度                                  |
| **minLength**      | 指定允许的最小字符长度                                  |
| **maxExclusive**   | 指定数据的最大值（小于）                                |
| **maxInclusive**   | 指定数据的最大值（小于等于）                             |
| **minExclusive**   | 指定最小值（大于）                                      |
| **minInclusive**   | 指定最小值（大于等于）                                  |
| **Pattern**        | 指定数据的显示规范，即指定允许值的模式，类似正则表达式      |
| **whiteSpace**     | 处理空白（保留：preserve，替换：replace，合并：collapse） |

#### Schema的元素类型

schema，element，attribute，group，attributeGroup，simpleType，simpleContent，complexType

choice，list，union，unique，sequence，restriction等等

补充：在Schema中使用`<any>`和`<anyAttribute>`两个元素可以放宽Schema对XML文件内容的限制

　　　即它容许我们在XML文件中使用没有在Schema中定义的元素和属性

　　　它们均可用于制作可扩展的文档，它们使文档有能力包含未在Schema中声明过的附加元素

##### schema

作用：包含已经定义的schema

用法：`<xs:schema>`

属性：xmlsn：后面跟命名空间的前缀

　　　targetNamespace：当前schema所定义的元素or属性所从属的命名空间

##### element

作用：声明一个元素

属性：name/type/ref/minOccurs/maxOccurs/substitutionGroup/fixed(表示确定或固定的值)/default(指明默认值)

示例如下

```xml
<!-- 这里定义了一个名为cat的类型为string的元素 -->
<!-- 这里之所以写成"xs:string",是因为string来自于<xs:schema>命名空间,而该命名空间的前缀是xs -->
<!-- 如果直接写成"type=string",那么它会在当前命名空间下找,即在targetNamespace里面去找 -->
<!-- 而我们所定义的cat,它是在当前命名空间里的,所以后面引用时直接写成cat,它就会在当前命名空间里找到 -->
<!-- 就是说,当使用schema属性or元素时,一定要加上命名空间前缀才可以 -->
<xs:element name="cat" type="xs:string"/>
<xs:element name="dog" type="xs:string"/>
<xs:element name="pets">
    <xs:complexType>
        <!-- sequence元素用于给一组元素一个特定的序列,即cat要在dog前面 -->
        <!-- 并且它们最小出现次数为零次..最大出现次数为未绑定,即不限制 -->
        <!-- 若未指明minOccurs和maxOccurs属性，则表示cat和dog要按顺序出现,且只能出现一次 -->
        <xs:sequence minOccurs="0" maxOccurs="unbounded">
            <xs:element ref="cat"/>
            <xs:element ref="dog"/>
        </xs:sequence>
        <!-- all元素表示不限制子元素的出现顺序，但每个子元素必须出现且只能出现一次 -->
        <!-- 它也是complexType元素默认值，即若在complexType中直接定义element元素，它会采用all -->
        <xs:all>
            <xs:element name="pig" type="xs:string"/>
            <xs:element name="horse" type="xs:string"/>
        </xs:all>
    </xs:complexType>
</xs:element>
```

##### group

作用：把一组元素声明组合在一起，以便它们能够一起被复合类型使用

属性：name/ref

示例如下

```xml
<!--
实际上它对应的XML就是
<myComplexType myAttribute="2.2">
    <thing11>aa</thing11>
    <thing22>bb</thing22>
</myComplexType>
 -->
<xs:element name="thing11" type="xs:string"/>
<xs:element name="thing22" type="xs:string"/>
<xs:attribute name="myAttribute" type="xs:decimal"/>
<xs:group name="myGroupOfThings">
    <xs:sequence>
        <xs:element ref="thing11"/>
        <xs:element ref="thing22"/>
    </xs:sequence>
</xs:group>
<xs:complexType name="myComplexType">
    <xs:group ref="myGroupOfThings"/>
    <xs:attribute ref="myAttribute"/>
</xs:complexType>
```

##### attribute

作用：声明一个属性

属性：name/type/ref/use

示例如下

```xml
<xs:complexType name="myComplexType">
    <!-- use表示属性的使用方法,它还有两个值:optional和prohibited,其中use默认值为optional -->
    <xs:attribute name="myBaseAttribute" type="xs:string" use="required"/>
</xs:complexType>
```

##### attributeGroup

作用：把一组属性声明组合在一起，以便可以被复合类型应用

属性：name/ref

示例如下

```xml
<xs:attributeGroup name="myAttributeGroup">
    <xs:attribute name="someAttribute11" type="xs:integer"/>
    <xs:attribute name="someAttribute22" type="xs:string"/>
</xs:attributeGroup>
<xs:complexType name="myElementType">
    <xs:attributeGroup ref="myAttributeGroup"/>
</xs:complexType>
```

##### simpleType

作用：定义一个简单类型，它决定了元素和属性值的约束和相关信息

属性：name

内容：应用已经存在的简单类型

　　　三种方式：restrict（限定一个范围），list（从列表中选择），union（包含一个值的结合）

示例如下

```xml
<!-- 定义了一个myType类型,其值是基于整型的,可取值5,6,7 -->
<!-- 也就是说这里的hello元素的值,只能是5,6,7,如<hello>6</hello> -->
<xs:simpleType name="myType">
    <xs:restriction base="xs:integer">
        <xs:enumeration value="5"/>
        <xs:enumeration value="6"/>
        <xs:enumeration value="7"/>
    </xs:restriction>
</xs:simpleType>
<xs:element name="hello" type="myType"/>

<!-- 定义名为hello的元素,其值为date类型,且可以有多个值,空格隔开即可 -->
<!-- 如<hello>2013-03-15 2013-11-02 2013-12-12</hello>是允许的 -->
<!-- 经测试,这里月和日必须是两位,且有效的,比如32号是无效的,不被验证通过 -->
<xs:simpleType name="myType">
    <xs:list itemType="xs:date"/>
</xs:simpleType>
<xs:element name="hello" type="myType"/>

<!-- 定义了一个名为java的元素,其子元素为string类型的level,其有一个version属性 -->
<!-- version属性有两类可选值,一类为number类型的正整数,可取值为11,22,33 -->
<!-- 另一类为size类型的字符串,可取值为small,medium,large -->
<!-- 最后的xml文档就像下面这样 -->
<!--
<java version="22">
    <level/>
</java>
 -->
<xs:attribute name="version">
    <xs:simpleType>
        <xs:union memberTypes="number size"/>
        <!-- 也可以直接写成下面这个样子 -->
        <!--
        <xs:union>
            <xs:simpleType>
                <xs:restriction base="number"/>
            </xs:simpleType>
            <xs:simpleType>
                <xs:restriction base="size"/>
            </xs:simpleType>
        </xs:union>
         -->
    </xs:simpleType>
</xs:attribute>
<xs:simpleType name="number">
    <xs:restriction base="xs:positiveInteger">
        <xs:enumeration value="11"/>
        <xs:enumeration value="22"/>
        <xs:enumeration value="55"/>
    </xs:restriction>
</xs:simpleType>
<xs:simpleType name="size">
    <xs:restriction base="xs:string">
        <xs:enumeration value="small"/>
        <xs:enumeration value="medium"/>
        <xs:enumeration value="large"/>
    </xs:restriction>
</xs:simpleType>
<xs:element name="java">
    <xs:complexType>
        <xs:sequence>
            <xs:element name="level" type="xs:string"/>
        </xs:sequence>
        <xs:attribute ref="version" use="required"/>
    </xs:complexType>
</xs:element>
```

##### complexType

作用：定义一个复合类型，它决定了一组元素和属性的约束和相关信息

属性：name

示例如下

```xml
<!-- 定义一个名为myComType的复合类型,该类型的元素内容是基于decimal的,即decimal类型的内容 -->
<!-- 即extension表示元素类型，并且它还有一个名为sizing的，类型为字符串的属性 -->
<!-- 最后在定义myShoeSize元素时指定了其类型为myComType类型 -->
<!-- 注意：若指明mixed属性，即<complexType mixed="true">则表示该复合类型里面既可以有文本内容，也可以包含子元素 -->
<!-- 注意：如<message>This message comes from<from>Jadyer</from></message> -->
<xs:complexType name="myComType">
    <!-- simpleContent元素通常应用于complexType，用于对complexType的内容进行约束和扩展 -->
    <!-- 如果一个元素的类型是用simpleContent表示的，则该元素是没有子元素的，而只有内容 -->
    <xs:simpleContent>
        <xs:extension base="xs:decimal">
            <xs:attribute name="sizing" type="xs:string"/>
            <!-- 如果想限定sizing属性的取值，那么就可以通过下面这种方式 -->
            <!--
            <xs:attribute name="sizing">
                <xs:simpleType>
                    <xs:restriction base="xs:string">
                        <xs:enumeration value="US"/>
                        <xs:enumeration value="European"/>
                        <xs:enumeration value="UK"/>
                    </xs:restriction>
                </xs:simpleType>
            </xs:attribute>
             -->
        </xs:extension>
    </xs:simpleContent>
</xs:complexType>
<xs:element name="myShoeSize" type="myComType"/>
<!-- simpleType与complexType的区别 -->
<!-- simpleType类型的元素中不能包含元素或者属性 -->
<!-- 当需要声明一个元素的子元素或属性时，用complexType -->
<!-- 当需要基于内置的基本数据类型定义一个新的数据类型时，用simpleType -->
```

##### choice

作用：允许唯一的一个元素从一个组中被选择

属性：minOccurs/maxOccurs

示例如下

```xml
<xs:complexType name="chadState">
    <!-- 即以下四个元素最少出现一次,最多出现一次,即必须出现一次,而出现的这个元素就来源于这四个元素中的一个 -->
    <!-- minOccurs和maxOccurs属性默认取值为1，即直接写成<xs:choice>......</xs:choice>和下面效果是一样的 -->
    <xs:choice minOccurs="1" maxOccurs="1">
        <xs:element ref="selected"/>
        <xs:element ref="unselected"/>
        <xs:element ref="dimpled"/>
        <xs:element ref="perforated"/>
    </xs:choice>
</xs:complexType>
```