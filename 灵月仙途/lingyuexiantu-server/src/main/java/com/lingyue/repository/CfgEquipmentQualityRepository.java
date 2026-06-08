package com.lingyue.repository;

import com.lingyue.entity.CfgEquipmentQuality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 装备品质属性范围配置表Repository
 */
@Repository
public interface CfgEquipmentQualityRepository extends JpaRepository<CfgEquipmentQuality, Integer> {

    /**
     * 根据品质查询装备品质信息
     * @param quality 装备品质
     * @return 装备品质信息
     */
    Optional<CfgEquipmentQuality> findByQuality(String quality);
}