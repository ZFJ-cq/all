package com.lingyue;

import java.sql.*;

public class CheckRole45Assets {
    
    private static final String DB_URL = "jdbc:mysql://localhost:3306/lingyuexiantu?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "12345678";
    
    public static void main(String[] args) {
        System.out.println("=== 检查角色 45 的资产状况 ===\n");
        
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            System.out.println("数据库连接成功!\n");
            
            // 查询角色 45 的资产
            String sql = "SELECT ra.role_id, ra.asset_type_id, at.code, at.name, ra.quantity " +
                        "FROM role_assets ra " +
                        "INNER JOIN asset_types at ON ra.asset_type_id = at.id " +
                        "WHERE ra.role_id = 45 " +
                        "ORDER BY at.code";
            
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(sql)) {
                
                System.out.println("角色 45 的资产:");
                System.out.println("=".repeat(60));
                System.out.printf("%-10s %-15s %-20s %-15s%n", "AssetID", "Code", "Name", "Quantity");
                System.out.println("=".repeat(60));
                
                int count = 0;
                while (rs.next()) {
                    long assetTypeId = rs.getLong("asset_type_id");
                    String code = rs.getString("code");
                    String name = rs.getString("name");
                    long quantity = rs.getLong("quantity");
                    
                    System.out.printf("%-10d %-15s %-20s %-15d%n", assetTypeId, code, name, quantity);
                    count++;
                }
                
                if (count == 0) {
                    System.out.println("角色 45 没有任何资产记录!");
                } else {
                    System.out.println("=".repeat(60));
                    System.out.println("共 " + count + " 条资产记录");
                }
            }
            
            // 查询 game_role 表结构
            System.out.println("\n=== game_role 表结构 ===");
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("DESCRIBE game_role")) {
                
                while (rs.next()) {
                    String field = rs.getString("Field");
                    String type = rs.getString("Type");
                    System.out.printf("%-20s %-20s%n", field, type);
                }
            }
            
        } catch (Exception e) {
            System.err.println("检查数据库时发生错误:");
            e.printStackTrace();
        }
    }
}
