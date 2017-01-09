---
layout: post
title: "SpringCloud入门"
categories: SpringCloud
tags: springcloud spring
author: 玄玉
excerpt: 这是一个持续更新的一些关于SpringCloud周边的文章，比如它那不走寻常路的版本号，它里面各个组件的功能简介等。
---

* content
{:toc}


这是一个持续更新的、一些关于 [SpringCloud](http://projects.spring.io/spring-cloud/) 周边的文章

比如它那不走寻常路的版本名、其各组件的功能描述等等

## 版本名

目前，官网中会看到三个版本名：Angel、Brixton、Camden（注意我的用语是版本名，没说版本号）

这是由于：SpringCloud 是一个包含了诸多子项目的大型综合项目，其各子项目分别维护自己的版本号

于是为了管理子项目，避免混淆版本名与子项目版本号，才采用了命名的方式（这些命名目前来看是根据英文字母顺序表的）

比如最先发布的综合版本叫做 Angel，接着就是 Brixton，现在到了 Camden（相信以后会更多，26个字母，应该足够用吧）

而版本号后面的 `.SR` 指的是：service releases，简称 `SRX`（X 是一个递增数字）

通过其官网下方的 **Release train contents:** 表格，可以看到目前各版本名所包含的子项目

*注意：关于其各版本与 Spring-Boot 版本之间的关系，也会在这里面看到*

| Component | Angel.SR6 | Brixton.SR7 | Camden.SR3 | Camden.BUILD-SNAPSHOT |
|:---------:|:---------:|:-----------:|:----------:|:---------------------:|
| spring-cloud-aws     | 1.0.4.RELEASE | 1.1.3.RELEASE | 1.1.3.RELEASE | 1.1.4.BUILD-SNAPSHOT |
| spring-cloud-bus     | 1.0.3.RELEASE | 1.1.2.RELEASE | 1.2.1.RELEASE | 1.2.2.BUILD-SNAPSHOT |
| spring-cloud-cli     | 1.0.6.RELEASE | 1.1.6.RELEASE | 1.2.0.RC1     | 1.2.0.BUILD-SNAPSHOT |
| spring-cloud-commons | 1.0.5.RELEASE | 1.1.3.RELEASE | 1.1.6.RELEASE | 1.1.7.BUILD-SNAPSHOT |
| ...                  | ...           | ...           | ...           | ...                  |
| ...                  | ...           | ...           | ...           | ...                  |