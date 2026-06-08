package com.lingyue.repository;

import com.lingyue.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    
    // 查询所有启用的成就，按排序顺序
    List<Achievement> findByStatusOrderBySortOrderAsc(Integer status);
    
    // 根据类型查询成就
    List<Achievement> findByTypeAndStatusOrderBySortOrderAsc(String type, Integer status);
}
