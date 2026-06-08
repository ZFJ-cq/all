package com.lingyue.repository;

import com.lingyue.entity.CfgPillEffect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 丹药效果配置表Repository
 */
@Repository
public interface CfgPillEffectRepository extends JpaRepository<CfgPillEffect, Integer> {

    /**
     * 根据丹药名称查询丹药效果信息
     * @param pillName 丹药名称
     * @return 丹药效果信息
     */
    Optional<CfgPillEffect> findByPillName(String pillName);
}