package com.lingyue.controller;

import com.lingyue.entity.GameRole;
import com.lingyue.repository.GameRoleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/fix")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class FixRoleDataController {
    
    private final GameRoleRepository roleRepository;
    
    public FixRoleDataController(GameRoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }
    
    /**
     * 修复角色缺失字段
     * POST /api/fix/role/{roleId}
     */
    @PostMapping("/role/{roleId}")
    public ResponseEntity<Map<String, Object>> fixRoleData(@PathVariable Long roleId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            GameRole role = roleRepository.findById(roleId).orElse(null);
            
            if (role == null) {
                result.put("code", 404);
                result.put("message", "角色不存在");
                return ResponseEntity.badRequest().body(result);
            }
            
            boolean updated = false;
            
            // 修复性别字段 (gender 是 Integer 类型：1=男，2=女)
            if (role.getGender() == null) {
                role.setGender(1); // 默认男性
                updated = true;
            }
            
            // 修复境界字段
            if (role.getRealm() == null || "null".equals(role.getRealm())) {
                role.setRealm("炼气一层");
                updated = true;
            }
            
            // 修复等级
            if (role.getLevel() == null) {
                role.setLevel(1);
                updated = true;
            }
            
            if (updated) {
                roleRepository.save(role);
                result.put("code", 200);
                result.put("message", "修复成功");
                result.put("data", role);
            } else {
                result.put("code", 200);
                result.put("message", "角色数据完整，无需修复");
                result.put("data", role);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "修复失败：" + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
}
