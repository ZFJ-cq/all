package com.lingyue.repository;

import com.lingyue.entity.RealmConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RealmConfigRepository extends JpaRepository<RealmConfig, Long> {
    
    Optional<RealmConfig> findByRealmNameAndLevel(String realmName, Integer level);
    
    List<RealmConfig> findByRealmIndexOrderBySortOrder(Integer realmIndex);
    
    List<RealmConfig> findAllByOrderBySortOrderAsc();
    
    Optional<RealmConfig> findTopByRealmIndexGreaterThanOrderByRealmIndexAscSortOrderAsc(Integer realmIndex);
    
    Optional<RealmConfig> findTopBySortOrderGreaterThanOrderBySortOrderAsc(Integer sortOrder);
}
