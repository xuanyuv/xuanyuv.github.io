---
layout: post
title: "EasyMock测试普通Service"
categories: 单元测试
tags: easymock demo
author: 玄玉
excerpt: 演示了EasyMock测试普通Service的用法。
---

* content
{:toc}


## Mock简介

`Mock`的意思就是`模拟`，`EasyMock`本身就是进行模拟测试的一个框架

单元测试时，可能我们的代码要依赖于其它的类，但这些类可能位于Jar包中

而我们还要去使用这些类，这时就可以通过EasyMock来模拟它

其实EasyMock本身所采用的底层的原理就是`Java的动态代理`

**Tips：**`JMock`也是用来进行模拟测试的，但是它与EasyMock的侧重点不太一样

#### mock和stub的区别

`mock`关注的是交互，主要解决的问题是对象之间的交互，而`stub`关注的是状态

`EasyMock`就是实现Mock对象的框架，`Mock对象`是用来对一些未实现关联对象的类进行测试的对象

EasyMock框架在使用时只需要一个`easymock-3.1.jar`

其下载地址为[http://sourceforge.net/projects/easymock/files/](http://sourceforge.net/projects/easymock/files/)

#### Mock生命周期

比如说`UserService`依赖于`UserDao`，如果UserDao没有实现，那么我们就可以`通过Mock来模拟UserDao的实现`

这个过程可以分为以下三步

1、record：记录UserDao可能会发生的操作的结果，并记录下所有交互过程

2、replay：创建UserServiceImpl和UserDao的关联并完成测试

3、verify：验证交互关系是否正确

#### Mock创建方式

也有以下三种方式可以创建Mock

1、createMock

　　此时创建的mock对象在进行verify时仅仅检查关联方法是否正常完成调用，只要完成次数一致就认为测试通过

2、createNiceMock

　　很少使用，略掉

3、createStrictMock

　　与createMock不同的是，它还要验证关联方法的调用顺序，即verify时要同时验证完成调用的次数和调用顺序

#### 小结

还是以`UserService`依赖于`UserDao`为例

如果UserService开发完毕，但UserDao未开发完，这时又想测试UserService，那么便可借助Mock方式来测试

具体做法如下

用EasyMock虚拟一个UserDao对象，然后在它上面针对UserService方法所需的各方法进行声明其可能出现的调用结果

即声明UserDao各方法所需的入参和返回结果，再调用UserService中的方法（即内部调用了UserDao的方法）并验证结果

如果对UserService方法的Mock测试全部通过，则表明UserService是编写正确的

如果实际应用中发现UserService发生错误，则说明UserDao出错，而非UserService出错

**说白了：**当我们发现所依赖的对象没有实现，而此时又想做测试的话，就可以考虑用Mock来做测试

## 示例代码

首先是用到的实体类`User.java`

```java
package com.jadyer.model;
public class User {
    private int id;
    private String username;
    private String password;
    /*--三个属性的setter和getter略--*/
    public User(){}
    public User(int id, String username, String password) {
        this.id = id;
        this.username = username;
        this.password = password;
    }
}
```

然后是用到的两个DAO接口类`UserDao.java`以及`Blog.java`

```java
package com.jadyer.dao;
import com.jadyer.model.User;
public interface UserDao {
    public User load(String username);
    public void delete(String username);
    public User save(User user);
}
```

```java
package com.jadyer.dao;
public interface BlogDao {
    public void update(String username);
}
```

下面是Service接口类`UserService.java`

```java
package com.jadyer.service;
import com.jadyer.model.User;
public interface UserService {
    public User get(String username);
    public User list(String username);
    public void update(String username);
    public User insert(User user);
    public User login(String username, String password);
}
```

下面是Service接口实现类`UserServiceImpl.java`

```java
package com.jadyer.service.impl;
import com.jadyer.dao.BlogDao;
import com.jadyer.dao.UserDao;
import com.jadyer.model.User;
import com.jadyer.service.UserService;

public class UserServiceImpl implements UserService {
    private UserDao userDao;
    private BlogDao blogDao;

    public UserServiceImpl(){}

    public UserServiceImpl(UserDao userDao){
        this.userDao = userDao;
    }

    public UserServiceImpl(UserDao userDao, BlogDao blogDao){
        this.userDao = userDao;
        this.blogDao = blogDao;
    }

    @Override
    public User get(String username) {
        return userDao.load(username);
    }

    @Override
    public User list(String username) {
        userDao.load("https://jadyer.github.io/");
        userDao.delete(username);
        return userDao.load(username);
    }

    @Override
    public void update(String username) {
        blogDao.update(username);
        userDao.delete(username);
    }

    @Override
    public User insert(User user) {
        if(null != userDao.load(user.getUsername())){
            throw new RuntimeException("用户[" + user.getUsername() + "]已存在");
        }
        return userDao.save(user);
    }

    @Override
    public User login(String username, String password) {
        User user = userDao.load(username);
        if(null == user){
            throw new RuntimeException("用户[" + username + "]不存在");
        }
        if(!user.getPassword().equals(password)){
            throw new RuntimeException("用户[" + user.getUsername() + "]密码错误");
        }
        return user;
    }
}
```

最后是包含了`EasyMock`简单用法的测试用例`UserServiceTest.java`

```java
package com.jadyer.service;
import org.easymock.EasyMock;
import org.easymock.IMocksControl;
import org.junit.Assert;
import org.junit.Test;
import com.jadyer.dao.BlogDao;
import com.jadyer.dao.UserDao;
import com.jadyer.model.User;
import com.jadyer.service.UserService;
import com.jadyer.service.impl.UserServiceImpl;

/**
 * EasyMock测试普通Service
 * Created by 玄玉<https://jadyer.github.io/> on 2013/07/09 14:15.
 */
public class UserServiceTest {
    /**
     * 测试普通Mock的使用
     */
    @Test
    public void testMock(){
        //创建DAO的Mock对象
        UserDao dao = EasyMock.createMock(UserDao.class);
        //进入record阶段
        //下面这行代码意思是：当调用dao.load()方法且传入参数为jadyer时，其返回值为user对象
        User user = new User(2, "jadyer", "xuanyu");
        //如果UserService.get()里面调用了两次dao.load()，那么这里就要指定其次数
        //EasyMock.expect(dao.load("jadyer")).andReturn(user).times(2);
        EasyMock.expect(dao.load("jadyer")).andReturn(user);
        //进入replay阶段
        EasyMock.replay(dao);
        UserService service = new UserServiceImpl(dao);
        User user22 = service.get("jadyer");
        Assert.assertNotNull(user22);
        Assert.assertEquals(user22.getId(), user.getId());
        Assert.assertEquals(user22.getUsername(), user.getUsername());
        Assert.assertEquals(user22.getPassword(), user.getPassword());
        //进入verify阶段
        EasyMock.verify(dao);
    }

    /**
     * 测试StrictMock的使用
     */
    @Test
    public void testStrictMock(){
        UserDao dao = EasyMock.createStrictMock(UserDao.class);
        User user = new User(2, "jadyer", "xuanyu");
        //关键在这里：必须把交互的所有过程都记录下来
        //也就是说dao方法被调用了几次，分别是调用的哪个方法，包括传的参数及返回值
        //若UserServiceImpl.getTwice()中调用两次load()传入参数都是jadyer
        //那么下面这两次的expect()操作便可写成一行
        //EasyMock.expect(dao.load("jadyer")).andReturn(user).times(2);
        EasyMock.expect(dao.load("https://jadyer.github.io/")).andReturn(user);
        //expectLastCall()是用来操作没有返回值的方法
        //此时要先执行dao中没有返回值的方法，然后再调用expectLastCall()方法
        dao.delete("jadyer");
        EasyMock.expectLastCall();
        EasyMock.expect(dao.load("jadyer")).andReturn(user);
        EasyMock.replay(dao);
        UserService service = new UserServiceImpl(dao);
        User user22 = service.list("jadyer");
        Assert.assertNotNull(user22);
        Assert.assertEquals(user22.getId(), user.getId());
        Assert.assertEquals(user22.getUsername(), user.getUsername());
        Assert.assertEquals(user22.getPassword(), user.getPassword());
        EasyMock.verify(dao);
    }

    /**
     * 使用MocksControl可以检查一组调用对象之间的关系
     * 它比较适用于这种情景：UserService中的某个方法依赖于UserDao和BlogDao等多个对象的情况
     */
    @Test
    public void testMocksControl(){
        //也可以通过Control创建一组Mock对象：如EasyMock.createControl()
        IMocksControl control = EasyMock.createStrictControl();
        //这时创建的Mock对象就类似于EasyMock.createStrictMock(UserDao.class);
        UserDao userDao = control.createMock(UserDao.class);
        BlogDao blogDao = control.createMock(BlogDao.class);
        blogDao.update("jadyer");
        EasyMock.expectLastCall();
        userDao.delete("jadyer");
        EasyMock.expectLastCall();
        //让MocksControl进行操作
        control.replay();
        new UserServiceImpl(userDao, blogDao).update("jadyer");
        //验证MocksControl中的所有mock调用
        control.verify();
    }

    /**
     * 测试添加一个不存在的用户
     */
    @Test
    public void testInsertNotExistUser(){
        //先做好准备工作
        UserDao dao = EasyMock.createStrictMock(UserDao.class);
        User user = new User(2, "jadyer", "xuanyu");
        UserService service = new UserServiceImpl(dao);
        //然后开始EasyMock的测试
        //先要保证用户不存在，所以要先andReturn(null)
        EasyMock.expect(dao.load(user.getUsername())).andReturn(null);
        EasyMock.expect(dao.save(user)).andReturn(user);
        EasyMock.replay(dao);
        User user22 = service.insert(user);
        Assert.assertNotNull(user22);
        Assert.assertEquals(user22.getId(), user.getId());
        Assert.assertEquals(user22.getUsername(), user.getUsername());
        Assert.assertEquals(user22.getPassword(), user.getPassword());
        EasyMock.verify(dao);
    }

    /**
     * 测试添加一个存在的用户
     * 为了查看效果，可以将expected=RuntimeException.class删去
     */
    @Test(expected=RuntimeException.class)
    public void testInsertExistUser(){
        //先做好准备工作
        UserDao dao = EasyMock.createStrictMock(UserDao.class);
        User user = new User(2, "jadyer", "xuanyu");
        UserService service = new UserServiceImpl(dao);
        //然后开始EasyMock的测试
        //先要保证用户存在，所以要先andReturn(user)
        EasyMock.expect(dao.load(user.getUsername())).andReturn(user);
        EasyMock.expect(dao.save(user)).andReturn(user);
        EasyMock.replay(dao);
        User user22 = service.insert(user);
        Assert.assertNotNull(user22);
        Assert.assertEquals(user22.getId(), user.getId());
        Assert.assertEquals(user22.getUsername(), user.getUsername());
        Assert.assertEquals(user22.getPassword(), user.getPassword());
        EasyMock.verify(dao);
    }

    /**
     * 测试用户登录成功
     */
    @Test
    public void testLoginSuccess(){
        //同样先做好准备工作
        UserDao dao = EasyMock.createStrictMock(UserDao.class);
        User user = new User(2, "jadyer", "xuanyu");
        UserService service = new UserServiceImpl(dao);
        //开始测试
        //指定测试时所要登录的用户名和密码
        //由于这里是要测试登录成功的情况，所以这里用户名密码就要与准备数据中的相同
        String username = "jadyer";
        String password = "xuanyu";
        //先要保证用户存在，所以要先andReturn(user)
        EasyMock.expect(dao.load(username)).andReturn(user);
        EasyMock.replay(dao);
        User user22 = service.login(username, password);
        Assert.assertNotNull(user22);
        Assert.assertEquals(user22.getId(), user.getId());
        Assert.assertEquals(user22.getUsername(), user.getUsername());
        Assert.assertEquals(user22.getPassword(), user.getPassword());
        EasyMock.verify(dao);
    }

    /**
     * 测试用户登录失败（用户不存在）
     * 为了查看效果，可以将expected=RuntimeException.class删去
     */
    @Test(expected=RuntimeException.class)
    public void testLoginFailNotExistUser(){
        //同样先做好准备工作
        UserDao dao = EasyMock.createStrictMock(UserDao.class);
        UserService service = new UserServiceImpl(dao);
        //开始测试
        //指定测试时所要登录的是一个不存在的用户
        String username = "jaders";
        String password = "xuanyu";
        //为了保证用户存在，这里就要andReturn(null)，因为dao.load一个不存在用户时取到的是null
        EasyMock.expect(dao.load(username)).andReturn(null);
        EasyMock.replay(dao);
        service.login(username, password);
        EasyMock.verify(dao);
    }

    /**
     * 测试用户登录失败（用户密码错误）
     * 为了查看效果，可以将expected=RuntimeException.class删去
     */
    @Test(expected=RuntimeException.class)
    public void testLoginFailPasswordError(){
        //同样先做好准备工作
        UserDao dao = EasyMock.createStrictMock(UserDao.class);
        User user = new User(2, "jadyer", "xuanyu");
        UserService service = new UserServiceImpl(dao);
        //开始测试
        //指定测试时所要登录的是一个密码错误的用户
        String username = "jadyer";
        String password = "banbuduo";
        //密码错误时用户是存在的，所以要andReturn(user)
        EasyMock.expect(dao.load(username)).andReturn(user);
        EasyMock.replay(dao);
        service.login(username, password);
        EasyMock.verify(dao);
    }
}
```