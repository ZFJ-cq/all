package com.lingyue.repository;

import com.lingyue.entity.GameUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;

public interface GameUserRepository extends JpaRepository<GameUser, Long> {
    
    // 根据用户名查询用户
    GameUser findByUsername(String username);
    
    // 根据手机号查询用户
    GameUser findByPhone(String phone);
    
    // 统计今日活跃用户数量
    @Query("SELECT COUNT(u) FROM GameUser u WHERE u.lastLoginTime >= ?1")
    long countByLastLoginTimeAfter(LocalDateTime time);
}