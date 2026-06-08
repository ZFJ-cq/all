package com.lingyue.service;

import com.lingyue.entity.GameRole;

import java.util.Map;

public interface RoleStatsService {
    /**
     * 为新角色计算初始基础属性
     * @param role 角色对象
     * @return 计算后的基础属性
     */
    Map<String, Integer> calculateInitialBaseStats(GameRole role);
    
    /**
     * 获取角色的基础属性
     * @param roleId 角色ID
     * @return 基础属性
     */
    Map<String, Integer> getBaseStats(Long roleId);
    
    /**
     * 更新角色的基础属性
     * @param roleId 角色ID
     * @param stats 基础属性
     */
    void updateBaseStats(Long roleId, Map<String, Integer> stats);
}
