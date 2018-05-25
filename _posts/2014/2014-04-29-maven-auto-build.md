---
layout: post
title: "结合Maven实现的自动打包工程的批处理脚本"
categories: 工具
tags: 工具 maven 打包 批处理
author: 玄玉
excerpt: 通过在批处理脚本中调用Maven命令实现的自动打包工程的工具，并把生成的war自动拷贝到桌面，还有自动上传至FTP的功能。
---

* content
{:toc}


这只是针对我现在的工程结构编写的

它能够自动调用Maven命令打包，并把生成的war复制到桌面上

```bash
@echo off
title 自动打包工具【玄玉制作】
color 02
set project=%~n0
set curdir=%~dp0
set partition=%curdir:~0,1%
cd %curdir:~0,20%

REM 此文件需保存为ANSI编码，方可在Windows下执行
REM java -cp .;jacob.jar test.CameraTest
REM rem------------表示行注释，相当于Java中的//
REM @echo off------表示关闭回显，即不显示本行即下面的命令行(默认DOS编程会把命令显示出来)
REM color----------设置为02表示DOS窗口背景为黑色，前景(即字体)为绿色
REM xcopy----------拷贝命令，/Y表示自动覆盖同名文件(否则会在DOS窗口询问Y还是N)
REM del------------删除文件命令，/S用于删除目录树(即删除目录及目录下的所有子目录和文件)，/Q表示确认要删除(否则DOS会提示用户是否确认删除)
REM rd-------------删除文件夹命令，/S和/Q含义与del命令的含义相同
REM ren------------重命名文件，用法：[ren 11.exe 22.exe]
REM echo 此批处理文件名为：%project%
REM echo 此批处理文件所在路径为：%curdir%
REM echo 此批处理文件所在盘符为：%partition%
REM echo 此批处理文件所在工程为：%curdir:~0,30%

echo 开始打包Maven工程 =================================
xcopy %curdir:~0,19%\fxpgy-parent\pom.xml %curdir:~0,20% /Y
REM call mvn clean package
call mvn package
echo Maven工程打包完毕 =================================

echo;
echo 准备清除临时文件 =================================
REM rd %curdir:~0,19%\.settings /S /Q
del %curdir:~0,19%\pom.xml /Q
echo 临时文件清除完毕 =================================

echo;
echo 开始拷贝War包至桌面 =================================
if exist "%userprofile%\Desktop\" (
    REM 适用于Win7系统
    xcopy %curdir:~0,19%\fxpgy-wth\target\wth.war %userprofile%\Desktop\ /Y
) else if exist "%userprofile%\桌面\" (
    REM 适用于XP系统
    xcopy %curdir:~0,19%\fxpgy-wth\target\wth.war %userprofile%\桌面\ /Y
)
echo War包已经拷贝至桌面 =================================

echo;
pause
```

时隔两年后的`2016-07-27 20:30`更新：增加了自动上传war包到FTP的功能（**也是我前阵子在用的**）

```bash
@echo off
title 自动打包工具【玄玉制作】
color 02
set curdir=%~dp0
set curDate=%date:~0,4%%date:~5,2%%date:~8,2%
set curtime=%Date:~0,4%%Date:~5,2%%Date:~8,2%%Time:~0,2%%Time:~3,2%
set ftphost=ftp.github.com
set ftpusername=jadyer
set ftppassword=123456
set ftpfilepath=/public/%curDate%

echo 开始打包Maven工程 ==========================================
echo;
call mvn clean install -DskipTests
echo;
echo Maven工程打包完毕 ==========================================

echo;
echo;
if exist "%userprofile%\Desktop\" (
    echo 开始拷贝War包至桌面 ==========================================
    echo;
    xcopy %curdir%\target\*.war %userprofile%\Desktop\ /F/Y
    c:
    cd %userprofile%\Desktop\
    if exist "seed-*.zip" (
        del seed-*.zip /Q
    )
    REM ren seed*.war seed.war
    REM ren seed*.war seed-%curtime%.zip
    REM 該文件所在目錄路徑可以有中文，但不能有空格，否則for會報告参数数量錯誤
    REM seed-2.5.2.war
    for /f "delims=. tokens=1,2,3" %%i in ('dir /a-d/b seed*.war') do ren seed*.war %%i.%%j.%%k-%curtime%.zip
    REM seed-2.5.2-201607271822.zip
    for /f "delims=- tokens=1,2,3,4" %%i in ('dir /a-d/b seed*.zip') do ren seed*.zip %%j-%%k-%%l
    echo;
    echo War包已经拷贝至桌面 ==========================================
) else if exist "%userprofile%\桌面\" (
    REM xcopy %curdir%\target\*.war %userprofile%\桌面\ /Y
    REM c:
    REM cd %userprofile%\桌面\
    echo 請升級操作系統至Win7
)

echo;
echo;
echo 开始上传zip包至FTP ==========================================
echo;
for /f "delims=" %%i in ('dir /b *.zip') do (
    set fileFullpath=%%~dpi%%~nxi
    set filename=%%~i
)
REM 指定FTP临時配置文件（FTP上传完會自動刪除）
set ftptmpcfg=ftptmp.cfg
echo open %ftphost%>%ftptmpcfg%
echo %ftpusername%>>%ftptmpcfg%
echo %ftppassword%>>%ftptmpcfg%
echo bin>>%ftptmpcfg%
echo cd %ftpfilepath%>>%ftptmpcfg%
echo put %fileFullpath%>>%ftptmpcfg%
echo bye>>%ftptmpcfg%
ftp -s:%ftptmpcfg%
del %ftptmpcfg%
del %filename%
echo wget --ftp-user=testdownload --ftp-password=testdownload ftp://%ftphost%%ftpfilepath%/%filename%
echo;
echo zip包传上传至FTP ==========================================

echo;
pause
```