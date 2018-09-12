---
layout: post
title: "借助POI生成Excel报表"
categories: JavaSE
tags: poi 报表
author: 玄玉
excerpt: 演示了Apache-POI框架操作Excel报表模板文件填充数据后生成Excel报表的用法。
---

* content
{:toc}


## POI依赖

```xml
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>3.9</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>3.9</version>
</dependency>
```

## 模板文件

[点此下载模板文件](/img/2013/2013-07-11-excel-report-ReportTemplate.xls)，内容截图如下

![](/img/2013/2013-07-11-excel-report-ReportTemplate.png)

## 报表生成类

```java
package com.jadyer.report;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * 报表生成类
 * ---------------------------------------------------------------------------
 * 这里要用到：poi-3.9-20121203.jar和poi-ooxml-3.9-20121203.jar
 * ---------------------------------------------------------------------------
 * Created by 玄玉<https://jadyer.cn/> on 2013/7/5 21:54.
 */
public enum ExcelReport {
    INSTANCE;

    /** 报表模板文件完整路径 */
    private static final String REPORT_TEMPLATE_FILE_FULLPATH = "/templates/settleorder/ReportTemplate.xls";
    /** 初始行的下标（指的是填充数据的第一个单元格下标） */
    private int initRowIndex;
    /** 初始列的下标（指的是填充数据的第一个单元格下标）*/
    private int initColIndex;
    /** 当前行的下标（指的是填充数据的当前单元格下标） */
    private int currRowIndex;
    /** 当前列的下标（指的是填充数据的当前单元格下标） */
    private int currColIndex;
    /** 最后一行的下标 */
    private int lastRowIndex;
    /** 序号列的第一个单元格的下标 */
    private int serialColIndex;
    /** 默认行高（指的是填充数据的第一个单元格的行高） */
    private float defaultRowHeight;
    /** 本列开始填充序号的标识 */
    private static final String SERIAL_NO = "serialNo";
    /** 本行开始填充数据的标识 */
    private static final String DATA_BEGIN = "dataBegin";
    /** 表格采用同列样式的标识 */
    private static final String USE_STYLES = "useStyles";
    /** 表格样式采用的默认样式 */
    private static final String DEFAULT_STYLES = "defaultStyles";
    /** 表格样式采用的默认样式的ID */
    private static final int DEFAULT_STYLES_ID = 99;
    /** 存放模板中所有表格样式（键为99表示表格的默认样式） */
    private Map<Integer, CellStyle> allCellStyle = new HashMap<>();
    private Row currRow;
    private Sheet sheet;
    private Workbook wb;

    /**
     * 基础数据初始化
     */
    ExcelReport(){
        try {
            //从指定目录中读取
            //wb = WorkbookFactory.create(new File(REPORT_TEMPLATE_FILE_FULLPATH));
            //从classpath中读取模板文档
            wb = WorkbookFactory.create(ExcelReport.class.getResourceAsStream(REPORT_TEMPLATE_FILE_FULLPATH));
            //获取模板中的第一个Sheet
            sheet = wb.getSheetAt(0);
        } catch (Exception e) {
            throw new RuntimeException("加载报表模板文件发生异常，堆栈轨迹如下", e);
        }
        for(Row row : sheet){
            for(Cell cell : row){
                //报表模板文件中约定：serialNo、dataBegin、useStyles、defaultStyles等都是String类型的
                if(Cell.CELL_TYPE_STRING != cell.getCellType()){
                    continue;
                }
                String str = cell.getStringCellValue().trim();
                //收集默认的表格样式
                if(DEFAULT_STYLES.equals(str)){
                    this.allCellStyle.put(DEFAULT_STYLES_ID, cell.getCellStyle());
                }
                //收集除默认表格样式以外的所有表格样式
                if(USE_STYLES.equals(str)){
                    this.allCellStyle.put(cell.getColumnIndex(), cell.getCellStyle());
                }
                //定位序号列的第一个单元格下标
                if(SERIAL_NO.equals(str)){
                    this.serialColIndex = cell.getColumnIndex();
                }
                //定位开始填充数据的第一个单元格的下标
                if(DATA_BEGIN.equals(str)){
                    this.initColIndex = cell.getColumnIndex();
                    this.initRowIndex = row.getRowNum();
                    this.currColIndex = this.initColIndex;
                    this.currRowIndex = this.initRowIndex;
                    this.lastRowIndex = sheet.getLastRowNum();
                    this.defaultRowHeight = row.getHeightInPoints();
                }
            }
        }
    }


    /**
     * 创建行
     */
    public void createNewRow(){
        //下移行的条件有2个：当前行非初始行，且当前行没有超过最后一行
        if(this.currRowIndex!=this.initRowIndex && this.currRowIndex<this.lastRowIndex){
            //将指定的几行进行下移一行
            sheet.shiftRows(this.currRowIndex, this.lastRowIndex, 1, true, true);
            //既然下移了那么最后一行下标就也要增大了
            this.lastRowIndex++;
        }
        //在指定的行上创建一个空行（如果此行原本有单元格和数据，那么也会被空行覆盖，且创建出来的空行是没有单元格的）
        this.currRow = sheet.createRow(this.currRowIndex);
        this.currRow.setHeightInPoints(this.defaultRowHeight);
        this.currRowIndex++;
        this.currColIndex = this.initColIndex;
    }


    /**
     * 创建单元格并填充数据
     */
    public void buildCell(String value){
        Cell cell = this.currRow.createCell(this.currColIndex);
        if(this.allCellStyle.containsKey(this.currColIndex)){
            cell.setCellStyle(this.allCellStyle.get(this.currColIndex));
        }else{
            cell.setCellStyle(this.allCellStyle.get(DEFAULT_STYLES_ID));
        }
        cell.setCellValue(value);
        this.currColIndex++;
    }


    /**
     * 插入序号
     */
    private void insertSerialNo(){
        int index = 1;
        Row row;
        Cell cell;
        for(int i=this.initRowIndex; i<this.currRowIndex; i++){
            row = sheet.getRow(i);
            cell = row.createCell(this.serialColIndex);
            cell.setCellValue(index++);
        }
    }


    /**
     * 替换模板文件中的常量
     */
    private void replaceConstantData(){
        Map<String, String> constantData = new HashMap<>();
        constantData.put("#title", "优秀学生名单");
        constantData.put("#date", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
        constantData.put("#developer", "玄玉<https://jadyer.cn/>");
        for(Row row : sheet){
            for(Cell cell : row){
                if(Cell.CELL_TYPE_STRING != cell.getCellType()){
                    continue;
                }
                String str = cell.getStringCellValue().trim();
                if(str.startsWith("#") && constantData.containsKey(str)){
                    cell.setCellValue(constantData.get(str));
                }
            }
        }
    }


    /**
     * 将生成的excel文件写到输出流中（适用于文件下载）
     */
    public void writeToStream(OutputStream os){
        this.insertSerialNo();
        this.replaceConstantData();
        try {
            wb.write(os);
        } catch (Exception e) {
            throw new RuntimeException("Workbook写入流失败，堆栈轨迹如下", e);
        }
    }


    /**
     * 将生成的excel文件写到指定的文件中（适用于本地保存）
     */
    public void writeToFile(String filepath){
        this.insertSerialNo();
        this.replaceConstantData();
        FileOutputStream fos = null;
        try {
            fos = new FileOutputStream(filepath);
            wb.write(fos);
        } catch (Exception e) {
            throw new RuntimeException("Workbook写入文件失败，堆栈轨迹如下", e);
        } finally {
            if(null != fos){
                try {
                    fos.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

## 单元测试类

```java
package com.jadyer.test;
import com.jadyer.report.ExcelReport;
import org.junit.Assert;
import org.junit.Test;
import java.io.File;

public class ExcelReportTest {
    @Test
    public void testExcelReportUtil(){
        ExcelReport eru = ExcelReport.INSTANCE;
        eru.createNewRow();
        eru.buildCell("aa");
        eru.buildCell("玄玉");
        eru.buildCell("cc");
        eru.buildCell("dd");
        eru.createNewRow();
        eru.buildCell("aa");
        eru.buildCell("https://jadyer.cn/");
        eru.buildCell("cc");
        eru.buildCell("dd");
        eru.createNewRow();
        eru.buildCell("aa");
        eru.buildCell("蓄机而动");
        eru.buildCell("cc");
        eru.buildCell("dd");
        eru.writeToFile("D:/test.xls");
        Assert.assertTrue(new File("D:/test.xls").exists());
    }
}
```

## 另附POIDemo

```java
package com.jadyer.demo;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;

/**
 * POI读写Excel的示例
 * ---------------------------------------------------------------------------
 * 这里要用到：poi-3.9-20121203.jar和poi-ooxml-3.9-20121203.jar
 * ---------------------------------------------------------------------------
 * Created by 玄玉<https://jadyer.cn/> on 2013/7/9 19:54.
 */
public class POIDemo {
    public static void write() throws IOException {
        //创建一个Excel
        //Workbook wb = new XSSFWorkbook();
        Workbook wb = new HSSFWorkbook();
        //创建表格
        Sheet sheet = wb.createSheet("测试Sheet_01");
        //创建行
        Row row = sheet.createRow(0);
        //设置行高
        row.setHeightInPoints(30);
        //创建样式
        CellStyle cs = wb.createCellStyle();
        cs.setAlignment(CellStyle.ALIGN_CENTER);
        cs.setVerticalAlignment(CellStyle.VERTICAL_CENTER);
        cs.setBorderBottom(CellStyle.BORDER_DOTTED);
        cs.setBorderLeft(CellStyle.BORDER_THIN);
        cs.setBorderRight(CellStyle.BORDER_THIN);
        cs.setBorderTop(CellStyle.BORDER_THIN);
        //创建单元格
        Cell cell = row.createCell(0);
        //设置单元格样式
        cell.setCellStyle(cs);
        //设置单元格的值
        cell.setCellValue("序号");
        cell = row.createCell(1);
        cell.setCellStyle(cs);
        cell.setCellValue("用户");
        row = sheet.createRow(1);
        cell = row.createCell(0);
        cell.setCellValue("1");
        cell = row.createCell(1);
        cell.setCellValue("张起灵");
        FileOutputStream fos = new FileOutputStream("D:/测试的Excel.xls");
        wb.write(fos);
        fos.close();
    }


    public static void read() throws InvalidFormatException, IOException{
        long startTime = System.currentTimeMillis();
        int count = 0;
        //老版本POI是使用这种方式创建Workbook的，新版本中可以使用WorkbookFactory，它能自动根据文档的类型打开一个Excel
        //Workbook wb = new HSSFWorkbook(new FileInputStream("D:/5月业务定制对账文件汇总.xls"));
        Workbook wb = WorkbookFactory.create(new File("D:/5月业务定制对账文件汇总.xls"));
        //获取Excel中的某一个数据表，也可以通过Sheet名称来获取：Workbook.getSheet("定制对账文件")
        Sheet sheet = wb.getSheetAt(0);
        Row row;
        //获取Excel的总行数：Sheet.getLastRowNum()+1（注意需要加一）
        for(/*int i=0*/ int i=sheet.getFirstRowNum(); i<sheet.getLastRowNum()+1; i++){
            //获取数据表里面的某一行
            row = sheet.getRow(i);
            //获取Excel的总列数：Row.getLastCellNum()（不用加一）
            for(/*int j=0*/ int j=row.getFirstCellNum(); j<row.getLastCellNum(); j++){
                //获取一行中的一个单元格
                String cellData = getCellValue(row.getCell(j)).trim();
                System.out.print(j == 0 ? count + 1 + "----" + cellData + "----" : cellData + "----");
            }
            count++;
            //打印完一行的数据之后，再输入一个空行
            System.out.println();
        }
        long endTime = System.currentTimeMillis();
        long useTime = endTime - startTime;
        System.out.println("导入文件完毕，导入数据[" + count + "]条，耗时" + useTime + "ms");
        String suffix = String.valueOf(useTime % 1000);
        while(suffix.endsWith("0")){
            suffix = suffix.substring(0, suffix.length()-1);
        }
        System.out.println("导入文件完毕，导入数据[" + count + "]条，耗时" + (useTime/1000) + "." + suffix + "秒");
    }


    /**
     * for-each读取Excel
     */
    public static void readByForeach() throws InvalidFormatException, IOException {
        for(Row row : WorkbookFactory.create(new File("D:/5月业务定制对账文件汇总.xls")).getSheetAt(0)){
            for(Cell cell : row){
                System.out.print(getCellValue(cell) + "----");
            }
            System.out.println();
        }
    }


    /**
     * 获取单元格的值
     */
    private static String getCellValue(Cell cell){
        String str;
        switch (cell.getCellType()) {
            //根据实际值的格式来决定，其中数字格式需要处理一下科学计数法问题
            case Cell.CELL_TYPE_NUMERIC :
                if(DateUtil.isCellDateFormatted(cell)){
                    str = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss").format(cell.getDateCellValue());
                }else{
                    str = new DecimalFormat("0").format(cell.getNumericCellValue());
                }
                break;
            case Cell.CELL_TYPE_BLANK   : str = "";                                                                                  break;
            case Cell.CELL_TYPE_ERROR   : str = "Error";                                                                             break;
            case Cell.CELL_TYPE_STRING  : str = cell.getStringCellValue();                                                           break;
            case Cell.CELL_TYPE_BOOLEAN : str = String.valueOf(cell.getBooleanCellValue());                                          break;
            case Cell.CELL_TYPE_FORMULA : str = String.valueOf(cell.getCellFormula());                                               break;
            default                     : str = null==cell.getRichStringCellValue() ? "" : cell.getRichStringCellValue().toString(); break;
        }
        return str.trim();
    }
}
```