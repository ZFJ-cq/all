package com.lingyue.repository;

import com.lingyue.entity.RoleAutoCultivationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleAutoCultivationConfigRepository extends JpaRepository<RoleAutoCultivationConfig, Long> {
    
    /**
     * 按角色 ID 查询配置
     */
    RoleAutoCultivationConfig findByRoleId(Long roleId);
}