package com.lingyue;

import java.sql.*;
import java.nio.file.*;
import java.util.stream.*;

public class ExecuteSqlScript {
    
    private static final String DB_URL = "jdbc:mysql://localhost:3306/lingyuexiantu?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "12345678";
    
    public static void main(String[] args) {
        String sqlFilePath = "fix_checkin_rewards.sql";
        
        if (args.length > 0) {
            sqlFilePath = args[0];
        }
        
        System.out.println("=== 开始执行 SQL 脚本 ===");
        System.out.println("SQL 文件路径：" + sqlFilePath);
        System.out.println("数据库 URL: " + DB_URL);
        System.out.println();
        
        try {
            // 读取 SQL 文件
            String sqlContent = new String(Files.readAllBytes(Paths.get(sqlFilePath)));
            
            // 连接到数据库
            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
                System.out.println("数据库连接成功!");
                
                // 分割 SQL 语句 (按分号分割)
                String[] sqlStatements = sqlContent.split(";");
                
                int successCount = 0;
                int errorCount = 0;
                
                for (String sql : sqlStatements) {
                    String trimmedSql = sql.trim();
                    if (trimmedSql.isEmpty() || trimmedSql.startsWith("--")) {
                        continue;
                    }
                    
                    try (Statement stmt = conn.createStatement()) {
                        // 判断是否是查询语句
                        if (trimmedSql.toLowerCase().startsWith("select")) {
                            try (ResultSet rs = stmt.executeQuery(trimmedSql)) {
                                ResultSetMetaData metaData = rs.getMetaData();
                                int columnCount = metaData.getColumnCount();
                                
                                // 打印表头
                                StringBuilder header = new StringBuilder();
                                for (int i = 1; i <= columnCount; i++) {
                                    header.append(metaData.getColumnName(i)).append("\t");
                                }
                                System.out.println(header.toString());
                                System.out.println("=".repeat(header.length()));
                                
                                // 打印数据
                                int rowCount = 0;
                                while (rs.next()) {
                                    StringBuilder row = new StringBuilder();
                                    for (int i = 1; i <= columnCount; i++) {
                                        row.append(rs.getString(i)).append("\t");
                                    }
                                    System.out.println(row.toString());
                                    rowCount++;
                                }
                                System.out.println("查询返回 " + rowCount + " 行\n");
                            }
                        } else {
                            // 执行更新语句
                            int rowsAffected = stmt.executeUpdate(trimmedSql);
                            System.out.println("执行成功：" + trimmedSql.substring(0, Math.min(50, trimmedSql.length())) + "...");
                            if (rowsAffected > 0) {
                                System.out.println("  -> 影响行数：" + rowsAffected);
                            }
                            successCount++;
                        }
                    } catch (SQLException e) {
                        System.err.println("执行失败：" + trimmedSql.substring(0, Math.min(50, trimmedSql.length())) + "...");
                        System.err.println("  -> 错误：" + e.getMessage());
                        errorCount++;
                    }
                }
                
                System.out.println();
                System.out.println("=== SQL 脚本执行完成 ===");
                System.out.println("成功：" + successCount + " 条语句");
                System.out.println("失败：" + errorCount + " 条语句");
                
            }
            
        } catch (Exception e) {
            System.err.println("执行 SQL 脚本时发生错误:");
            e.printStackTrace();
            System.exit(1);
        }
    }
}
