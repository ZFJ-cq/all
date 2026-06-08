package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RestController
@RequestMapping("/role-asset")
public class RoleAssetController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    // 获取角色资产列表（按角色 ID）
    @GetMapping("/{roleId}")
    public Map<String, Object> getRoleAssets(@PathVariable Long roleId) {
        try {
            String sql = "SELECT ra.role_id, ra.asset_type_code, " +
                        "SUM(ra.quantity) as quantity, " +
                        "MAX(ra.created_at) as created_at, " +
                        "MAX(ra.updated_at) as updated_at, " +
                        "at.name as asset_type_name, at.type as asset_type, at.category " +
                        "FROM role_asset ra " +
                        "LEFT JOIN asset_types at ON ra.asset_type_code = at.code " +
                        "WHERE ra.role_id = ? " +
                        "GROUP BY ra.role_id, ra.asset_type_code, at.name, at.type, at.category";
            
            List<Map<String, Object>> assets = jdbcTemplate.queryForList(sql, roleId);
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (Map<String, Object> asset : assets) {
                Map<String, Object> item = new HashMap<>();
                item.put("roleId", asset.get("role_id"));
                item.put("assetTypeCode", asset.get("asset_type_code"));
                item.put("assetTypeName", asset.get("asset_type_name"));
                item.put("assetType", asset.get("asset_type"));
                item.put("category", asset.get("category"));
                item.put("quantity", asset.get("quantity"));
                item.put("createdAt", asset.get("created_at"));
                item.put("updatedAt", asset.get("updated_at"));
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
            error.put("message", "获取角色资产列表失败：" + e.getMessage());
            return error;
        }
    }
}
