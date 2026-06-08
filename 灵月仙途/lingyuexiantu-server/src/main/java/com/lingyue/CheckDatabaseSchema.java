package com.lingyue;

import java.sql.*;
import java.util.*;

public class CheckDatabaseSchema {
    
    private static final String DB_URL = "jdbc:mysql://localhost:3306/lingyuexiantu?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "12345678";
    
    public static void main(String[] args) {
        System.out.println("=== 检查数据库表结构 ===\n");
        
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            System.out.println("数据库连接成功!\n");
            
            // 获取所有表
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet tables = metaData.getTables("lingyuexiantu", null, "%", new String[]{"TABLE"});
            
            List<String> assetTables = new ArrayList<>();
            System.out.println("所有表:");
            while (tables.next()) {
                String tableName = tables.getString("TABLE_NAME");
                if (tableName.toLowerCase().contains("asset") || tableName.toLowerCase().contains("resource")) {
                    assetTables.add(tableName);
                    System.out.println("  - " + tableName + " ⭐");
                } else {
                    System.out.println("  - " + tableName);
                }
            }
            
            System.out.println("\n=== 资产相关表结构 ===");
            for (String table : assetTables) {
                System.out.println("\n表：" + table);
                System.out.println("=".repeat(50));
                
                try (Statement stmt = conn.createStatement();
                     ResultSet columns = stmt.executeQuery("DESCRIBE " + table)) {
                    
                    while (columns.next()) {
                        String fieldName = columns.getString("Field");
                        String fieldType = columns.getString("Type");
                        String isNull = columns.getString("Null");
                        String key = columns.getString("Key");
                        System.out.printf("  %-20s %-20s %-5s %-5s%n", fieldName, fieldType, isNull, key);
                    }
                }
            }
            
        } catch (Exception e) {
            System.err.println("检查数据库时发生错误:");
            e.printStackTrace();
        }
    }
}
