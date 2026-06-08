package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyuexiantu.common.Result;
import com.lingyue.entity.RoleSkill;
import com.lingyue.entity.Skill;
import com.lingyue.entity.GameRole;
import com.lingyue.entity.CfgRealmSkillCapacity;
import com.lingyue.service.RoleSkillService;
import com.lingyue.service.SkillService;
import com.lingyue.service.CfgRealmSkillCapacityService;
import com.lingyue.service.GameRoleService;
import com.lingyue.service.InventorySkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/role-skill")
public class RoleSkillController {
    
    @Autowired
    private RoleSkillService roleSkillService;
    
    @Autowired
    private SkillService skillService;
    
    @Autowired
    private CfgRealmSkillCapacityService realmCapacityService;
    
    @Autowired
    private GameRoleService gameRoleService;
    
    @Autowired
    private InventorySkillService inventorySkillService;
    
    @GetMapping
    public Result<List<Map<String, Object>>> getAllRoleSkills() {
        try {
            List<RoleSkill> roleSkills = roleSkillService.getAllRoleSkills();
            List<Map<String, Object>> result = roleSkills.stream().map(rs -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", rs.getId());
                map.put("roleId", rs.getRoleId());
                map.put("skillId", rs.getSkillId());
                map.put("skillLevel", rs.getSkillLevel());
                map.put("experience", rs.getExperience());
                map.put("equipped", rs.getEquipped());
                
                // 获取技能信息
                Skill skill = skillService.getSkillById(rs.getSkillId());
                if (skill != null) {
                    map.put("skillName", skill.getSkillName());
                    map.put("skillType", skill.getSkillType());
                    map.put("attackBonus", skill.getAttackBonus());
                    map.put("defenseBonus", skill.getDefenseBonus());
                    map.put("xiuweiBonus", skill.getXiuweiBonus());
                }
                
                return map;
            }).collect(Collectors.toList());
            
            return Result.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取角色技能失败：" + e.getMessage());
        }
    }
    
    @GetMapping("/role/{roleId}")
    public Result<Map<String, Object>> getRoleSkillsByRoleId(@PathVariable Long roleId) {
        try {
            List<RoleSkill> roleSkills = roleSkillService.getRoleSkillsByRoleId(roleId);
            
            // 获取角色信息
            GameRole role = gameRoleService.getRoleById(roleId);
            String realm = role != null ? role.getRealm() : "练气期";
            
            // 获取境界对应的最大技能数量
            int maxSkills = realmCapacityService.getMaxSkillsByRealm(realm);
            int currentSkills = roleSkills.size();
            
            // 构建返回结果
            Map<String, Object> result = new HashMap<>();
            result.put("skills", roleSkills.stream().map(rs -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", rs.getId());
                map.put("roleId", rs.getRoleId());
                map.put("skillId", rs.getSkillId());
                map.put("skillLevel", rs.getSkillLevel());
                map.put("experience", rs.getExperience());
                map.put("equipped", rs.getEquipped());
                
                // 获取技能信息
                Skill skill = skillService.getSkillById(rs.getSkillId());
                if (skill != null) {
                    map.put("skillName", skill.getSkillName());
                    map.put("skillType", skill.getSkillType());
                    map.put("attackBonus", skill.getAttackBonus());
                    map.put("defenseBonus", skill.getDefenseBonus());
                    map.put("xiuweiBonus", skill.getXiuweiBonus());
                    map.put("description", skill.getDescription());
                    map.put("icon", skill.getIcon());
                    map.put("rank", skill.getRank());
                    map.put("rankName", skill.getRankName());
                }
                
                return map;
            }).collect(Collectors.toList()));
            
            // 添加技能容量信息
            result.put("currentSkillCount", currentSkills);
            result.put("maxSkillCount", maxSkills);
            result.put("realm", realm);
            
            return Result.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取角色技能失败：" + e.getMessage());
        }
    }
    
    /**
     * 遗忘技能（消耗技能书简）
     */
    @PostMapping("/forget")
    public Result<Map<String, Object>> forgetSkill(@RequestBody Map<String, Object> request) {
        try {
            Long roleId = Long.valueOf(request.get("roleId").toString());
            Long skillId = Long.valueOf(request.get("skillId").toString());
            
            // 使用服务层处理遗忘技能逻辑
            Map<String, Object> result = inventorySkillService.forgetSkill(roleId, skillId);
            
            if ((Boolean) result.get("success")) {
                return Result.success(result);
            } else {
                return Result.error((String) result.get("message"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("遗忘技能失败：" + e.getMessage());
        }
    }
    
    /**
     * 获取境界技能容量配置
     */
    @GetMapping("/capacity")
    public Result<List<CfgRealmSkillCapacity>> getRealmCapacity() {
        try {
            List<CfgRealmSkillCapacity> capacities = realmCapacityService.getAll();
            return Result.success(capacities);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取境界配置失败：" + e.getMessage());
        }
    }
}
