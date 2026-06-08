package com.lingyue.repository;

import com.lingyue.entity.SectApply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SectApplyRepository extends JpaRepository<SectApply, Long> {
    
    // 根据宗门ID和状态查询申请
    List<SectApply> findBySectIdAndStatus(Long sectId, Integer status);
    
    // 根据用户ID和状态查询申请
    List<SectApply> findByUserIdAndStatus(Long userId, Integer status);
    
    // 根据用户ID查询所有申请
    List<SectApply> findByUserId(Long userId);
    
    // 检查用户是否已向该宗门提交申请
    @Query("SELECT COUNT(a) FROM SectApply a WHERE a.userId = :userId AND a.sectId = :sectId AND a.status = 0")
    int countPendingApplications(@Param("userId") Long userId, @Param("sectId") Long sectId);
    
    // 获取宗门的待审核申请
    @Query("SELECT a FROM SectApply a WHERE a.sectId = :sectId AND a.status = 0 ORDER BY a.applyTime DESC")
    List<SectApply> findPendingApplicationsBySectId(@Param("sectId") Long sectId);
}
