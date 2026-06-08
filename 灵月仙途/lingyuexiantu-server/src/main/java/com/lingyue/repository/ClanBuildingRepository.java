package com.lingyue.repository;

import com.lingyue.entity.ClanBuilding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 宗门建筑 Repository
 */
@Repository
public interface ClanBuildingRepository extends JpaRepository<ClanBuilding, Long> {
    
    /**
     * 查询宗门的所有建筑
     */
    List<ClanBuilding> findByClanIdOrderByCreateTimeDesc(Long clanId);
    
    /**
     * 查询宗门的特定建筑
     */
    Optional<ClanBuilding> findByClanIdAndName(Long clanId, String name);
}
