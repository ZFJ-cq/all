package com.lingyue.repository;

import com.lingyue.entity.CfgRealmSkillCapacity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 境界技能容量配置数据访问层
 */
@Repository
public interface CfgRealmSkillCapacityRepository extends JpaRepository<CfgRealmSkillCapacity, Long> {
    
    /**
     * 根据境界名称查询
     */
    Optional<CfgRealmSkillCapacity> findByRealmName(String realmName);
    
    /**
     * 根据境界等级查询
     */
    Optional<CfgRealmSkillCapacity> findByRealmLevel(Integer realmLevel);
    
    /**
     * 根据境界名称获取最大技能数量
     */
    @Query("SELECT c.maxSkills FROM CfgRealmSkillCapacity c WHERE c.realmName = :realmName")
    Optional<Integer> findMaxSkillsByRealmName(@Param("realmName") String realmName);
}
