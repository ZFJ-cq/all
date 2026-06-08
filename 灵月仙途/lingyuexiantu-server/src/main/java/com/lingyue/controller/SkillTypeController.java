package com.lingyue.controller;

import com.lingyue.entity.SkillType;
import com.lingyue.service.SkillTypeService;
import com.lingyuexiantu.common.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/skill-type")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class SkillTypeController {
    
    private static final Logger logger = LoggerFactory.getLogger(SkillTypeController.class);
    
    @Autowired
    private SkillTypeService skillTypeService;
    
    /**
     * 获取所有启用的技能类型
     */
    @GetMapping("/active")
    public Result<List<SkillType>> getActiveTypes() {
        try {
            List<SkillType> types = skillTypeService.getAllActiveTypes();
            logger.info("获取启用的技能类型，数量：{}", types.size());
            return Result.success(types);
        } catch (Exception e) {
            logger.error("获取启用的技能类型失败", e);
            return Result.error("获取技能类型失败：" + e.getMessage());
        }
    }
    
    /**
     * 获取所有技能类型
     */
    @GetMapping("/all")
    public Result<List<SkillType>> getAllTypes() {
        try {
            List<SkillType> types = skillTypeService.getAllTypes();
            logger.info("获取所有技能类型，数量：{}", types.size());
            return Result.success(types);
        } catch (Exception e) {
            logger.error("获取所有技能类型失败", e);
            return Result.error("获取技能类型失败：" + e.getMessage());
        }
    }
    
    /**
     * 根据类型代码获取技能类型
     */
    @GetMapping("/{typeCode}")
    public Result<SkillType> getTypeByCode(@PathVariable String typeCode) {
        try {
            SkillType type = skillTypeService.getTypeByCode(typeCode);
            if (type == null) {
                return Result.error("技能类型不存在");
            }
            return Result.success(type);
        } catch (Exception e) {
            logger.error("获取技能类型失败：{}", typeCode, e);
            return Result.error("获取技能类型失败：" + e.getMessage());
        }
    }
    
    /**
     * 创建技能类型
     */
    @PostMapping
    public Result<SkillType> createType(@RequestBody SkillType skillType) {
        try {
            SkillType created = skillTypeService.createType(skillType);
            return Result.success(created);
        } catch (Exception e) {
            logger.error("创建技能类型失败", e);
            return Result.error("创建技能类型失败：" + e.getMessage());
        }
    }
    
    /**
     * 更新技能类型
     */
    @PutMapping("/{id}")
    public Result<SkillType> updateType(@PathVariable Long id, @RequestBody SkillType skillType) {
        try {
            SkillType updated = skillTypeService.updateType(id, skillType);
            return Result.success(updated);
        } catch (Exception e) {
            logger.error("更新技能类型失败", e);
            return Result.error("更新技能类型失败：" + e.getMessage());
        }
    }
    
    /**
     * 删除技能类型
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteType(@PathVariable Long id) {
        try {
            skillTypeService.deleteType(id);
            return Result.success(null);
        } catch (Exception e) {
            logger.error("删除技能类型失败", e);
            return Result.error("删除技能类型失败：" + e.getMessage());
        }
    }
}
