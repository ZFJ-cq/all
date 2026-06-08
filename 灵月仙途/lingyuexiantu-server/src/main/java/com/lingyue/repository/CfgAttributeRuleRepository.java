package com.lingyue.repository;

import com.lingyue.entity.CfgAttributeRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 属性计算规则 Repository
 */
@Repository
public interface CfgAttributeRuleRepository extends JpaRepository<CfgAttributeRule, Long> {
    List<CfgAttributeRule> findByIsActiveTrue();
}
