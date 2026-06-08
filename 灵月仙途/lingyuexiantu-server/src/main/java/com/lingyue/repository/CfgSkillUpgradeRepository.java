package com.lingyue.repository;

import com.lingyue.entity.CfgSkillUpgrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 技能升级需求配置表Repository
 */
@Repository
public interface CfgSkillUpgradeRepository extends JpaRepository<CfgSkillUpgrade, Integer> {

    /**
     * 根据技能等级查询技能升级需求
     * @param skillLevel 技能等级
     * @return 技能升级需求信息
     */
    Optional<CfgSkillUpgrade> findBySkillLevel(String skillLevel);
}