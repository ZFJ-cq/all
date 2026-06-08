package com.lingyue.repository;

import com.lingyue.entity.GameRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GameRoleRepository extends JpaRepository<GameRole, Long> {
    // 根据用户ID查询角色列表
    List<GameRole> findByUserId(Long userId);
    
    // 根据用户ID和状态查询角色列表
    List<GameRole> findByUserIdAndStatus(Long userId, Integer status);
    
    // 检查角色名字是否存在
    boolean existsByRoleName(String roleName);
    
    // 根据角色名称查询
    List<GameRole> findByRoleName(String roleName);
}