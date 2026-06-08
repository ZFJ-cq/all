package com.lingyue.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/resource")
public class ResourceController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    // 获取所有资源类型 - 使用 asset_types 表
    @GetMapping("/types")
    public Map<String, Object> getAllResourceTypes() {
        try {
            String sql = "SELECT id, code, name, type, category, description, " +
                        "unit_of_measure as unit, decimal_places, status " +
                        "FROM asset_types";
            
            List<Map<String, Object>> types = jdbcTemplate.queryForList(sql);
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (Map<String, Object> type : types) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", type.get("id"));
                item.put("code", type.get("code"));
                item.put("name", type.get("name"));
                item.put("type", type.get("type"));
                item.put("category", type.get("category"));
                item.put("description", type.get("description"));
                item.put("unit", type.get("unit"));
                item.put("decimalPlaces", type.get("decimal_places"));
                item.put("status", type.get("status"));
                result.add(item);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", result);
            return response;
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "获取资源类型失败：" + e.getMessage());
            return error;
        }
    }
    
    // 根据角色ID获取资源 - 使用 role_asset 表
    @GetMapping("/role/{roleId}")
    public Map<String, Object> getRoleResources(@PathVariable Long roleId) {
        try {
            String sql = "SELECT ra.id, ra.role_id, ra.asset_type_code, ra.quantity, " +
                        "ra.created_at, ra.updated_at, " +
                        "at.name as asset_type_name, at.type as asset_type, at.category " +
                        "FROM role_asset ra " +
                        "LEFT JOIN asset_types at ON ra.asset_type_code = at.code " +
                        "WHERE ra.role_id = ?";
            
            List<Map<String, Object>> resources = jdbcTemplate.queryForList(sql, roleId);
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (Map<String, Object> resource : resources) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", resource.get("id"));
                item.put("roleId", resource.get("role_id"));
                item.put("assetTypeCode", resource.get("asset_type_code"));
                item.put("assetTypeName", resource.get("asset_type_name"));
                item.put("assetType", resource.get("asset_type"));
                item.put("category", resource.get("category"));
                item.put("quantity", resource.get("quantity"));
                item.put("createdAt", resource.get("created_at"));
                item.put("updatedAt", resource.get("updated_at"));
                result.add(item);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", result);
            return response;
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "获取角色资源失败：" + e.getMessage());
            return error;
        }
    }
}
