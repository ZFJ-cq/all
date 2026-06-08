package com.lingyue.repository;

import com.lingyue.entity.CfgRealmAttributeMult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 境界属性倍率 Repository
 */
@Repository
public interface CfgRealmAttributeMultRepository extends JpaRepository<CfgRealmAttributeMult, Long> {
    Optional<CfgRealmAttributeMult> findByRealmLevel(Integer realmLevel);
    Optional<CfgRealmAttributeMult> findByRealmName(String realmName);
}
