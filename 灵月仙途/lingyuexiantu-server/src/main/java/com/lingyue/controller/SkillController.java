package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyuexiantu.common.Result;
import com.lingyue.entity.Skill;
import com.lingyue.service.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/skill")
public class SkillController {
    
    @Autowired
    private SkillService skillService;
    
    @GetMapping
    public Result<List<Skill>> getAllSkills() {
        try {
            List<Skill> skills = skillService.getAllSkills();
            return Result.success(skills);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取技能列表失败：" + e.getMessage());
        }
    }
    
    @GetMapping("/enabled")
    public Result<List<Skill>> getEnabledSkills() {
        try {
            List<Skill> skills = skillService.getEnabledSkills();
            return Result.success(skills);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取可用技能失败：" + e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    public Result<Skill> getSkillById(@PathVariable Long id) {
        try {
            Skill skill = skillService.getSkillById(id);
            if (skill != null) {
                return Result.success(skill);
            }
            return Result.error("技能不存在");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取技能详情失败：" + e.getMessage());
        }
    }
    
    @PostMapping
    public Result<Skill> createSkill(@RequestBody Skill skill) {
        try {
            Skill createdSkill = skillService.createSkill(skill);
            return Result.success(createdSkill);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("创建技能失败：" + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public Result<Skill> updateSkill(@PathVariable Long id, @RequestBody Skill skill) {
        try {
            Skill updatedSkill = skillService.updateSkill(id, skill);
            if (updatedSkill != null) {
                return Result.success(updatedSkill);
            }
            return Result.error("技能不存在");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("更新技能失败：" + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> deleteSkill(@PathVariable Long id) {
        try {
            skillService.deleteSkill(id);
            return Result.success(null);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("删除技能失败：" + e.getMessage());
        }
    }
    
    @GetMapping("/type/{type}")
    public Result<List<Skill>> getSkillsByType(@PathVariable String type) {
        try {
            List<Skill> skills = skillService.getSkillsByType(type);
            return Result.success(skills);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取技能类型失败：" + e.getMessage());
        }
    }
    
    @GetMapping("/search")
    public Result<List<Skill>> searchSkills(@RequestParam String keyword) {
        try {
            List<Skill> skills = skillService.searchSkills(keyword);
            return Result.success(skills);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("搜索技能失败：" + e.getMessage());
        }
    }
    
    @GetMapping("/types")
    public Result<List<String>> getSkillTypes() {
        try {
            List<String> types = List.of("攻击", "防御", "辅助", "身法", "功法");
            return Result.success(types);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取技能类型失败：" + e.getMessage());
        }
    }
}
