package com.lingyue.repository;

import com.lingyue.entity.CfgRealmBreakthrough;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 境界突破需求配置表Repository
 */
@Repository
public interface CfgRealmBreakthroughRepository extends JpaRepository<CfgRealmBreakthrough, Integer> {

    /**
     * 根据起始境界查询突破需求
     * @param fromRealm 起始境界
     * @return 突破需求信息
     */
    @Query("SELECT c FROM CfgRealmBreakthrough c WHERE c.fromRealm = :fromRealm")
    Optional<CfgRealmBreakthrough> findByFromRealm(@Param("fromRealm") String fromRealm);

    /**
     * 根据起始境界和目标境界查询突破需求
     * @param fromRealm 起始境界
     * @param toRealm 目标境界
     * @return 突破需求信息
     */
    Optional<CfgRealmBreakthrough> findByFromRealmAndToRealm(String fromRealm, String toRealm);
}