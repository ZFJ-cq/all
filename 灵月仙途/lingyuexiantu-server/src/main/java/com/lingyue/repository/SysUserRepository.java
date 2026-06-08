package com.lingyue.repository;

import com.lingyue.entity.SysUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SysUserRepository extends JpaRepository<SysUser, Long> {
    
    // 根据用户名查询用户
    SysUser findByUsername(String username);
    
    // 根据状态查询用户
    List<SysUser> findByStatus(Integer status);
    
    // 搜索用户（根据用户名或昵称）
    @Query("SELECT u FROM SysUser u WHERE u.username LIKE %:keyword% OR u.nickname LIKE %:keyword%")
    List<SysUser> searchByKeyword(@Param("keyword") String keyword);
    
    // 根据手机号查询用户
    SysUser findByPhone(String phone);
}
