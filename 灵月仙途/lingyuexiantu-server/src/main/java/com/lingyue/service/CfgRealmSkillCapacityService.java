package com.lingyue.service;

import com.lingyue.entity.CfgRealmSkillCapacity;
import com.lingyue.repository.CfgRealmSkillCapacityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CfgRealmSkillCapacityService {
    
    private static final Logger logger = LoggerFactory.getLogger(CfgRealmSkillCapacityService.class);
    
    private static final Map<String, Integer> DEFAULT_CAPACITY = new HashMap<>();
    
    static {
        DEFAULT_CAPACITY.put("练气期", 5);
        DEFAULT_CAPACITY.put("练气", 5);
        DEFAULT_CAPACITY.put("筑基期", 10);
        DEFAULT_CAPACITY.put("筑基", 10);
        DEFAULT_CAPACITY.put("金丹期", 15);
        DEFAULT_CAPACITY.put("金丹", 15);
        DEFAULT_CAPACITY.put("元婴期", 20);
        DEFAULT_CAPACITY.put("元婴", 20);
        DEFAULT_CAPACITY.put("化神期", 25);
        DEFAULT_CAPACITY.put("化神", 25);
        DEFAULT_CAPACITY.put("炼虚期", 30);
        DEFAULT_CAPACITY.put("炼虚", 30);
        DEFAULT_CAPACITY.put("合体期", 35);
        DEFAULT_CAPACITY.put("合体", 35);
        DEFAULT_CAPACITY.put("大乘期", 40);
        DEFAULT_CAPACITY.put("大乘", 40);
        DEFAULT_CAPACITY.put("渡劫期", 45);
        DEFAULT_CAPACITY.put("渡劫", 45);
    }
    
    @Autowired
    private CfgRealmSkillCapacityRepository repository;
    
    public Optional<CfgRealmSkillCapacity> getByRealmName(String realmName) {
        try {
            return repository.findByRealmName(realmName);
        } catch (Exception e) {
            logger.warn("查询境界配置失败，使用默认值: {}", e.getMessage());
            return Optional.empty();
        }
    }
    
    public Optional<CfgRealmSkillCapacity> getByRealmLevel(Integer realmLevel) {
        try {
            return repository.findByRealmLevel(realmLevel);
        } catch (Exception e) {
            logger.warn("查询境界配置失败，使用默认值: {}", e.getMessage());
            return Optional.empty();
        }
    }
    
    public int getMaxSkillsByRealm(String realmName) {
        try {
            Optional<Integer> maxSkills = repository.findMaxSkillsByRealmName(realmName);
            if (maxSkills.isPresent()) {
                return maxSkills.get();
            }
        } catch (Exception e) {
            logger.warn("查询境界技能容量失败，使用默认值: {}", e.getMessage());
        }
        
        // 使用默认配置
        if (realmName != null && DEFAULT_CAPACITY.containsKey(realmName)) {
            return DEFAULT_CAPACITY.get(realmName);
        }
        
        // 尝试模糊匹配
        if (realmName != null) {
            for (Map.Entry<String, Integer> entry : DEFAULT_CAPACITY.entrySet()) {
                if (realmName.contains(entry.getKey()) || entry.getKey().contains(realmName)) {
                    return entry.getValue();
                }
            }
        }
        
        return 10;
    }
    
    public List<CfgRealmSkillCapacity> getAll() {
        try {
            return repository.findAll();
        } catch (Exception e) {
            logger.warn("查询所有境界配置失败: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
