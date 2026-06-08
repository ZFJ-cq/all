package com.lingyue.repository;

import com.lingyue.entity.BodyCultivationRealm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BodyCultivationRealmRepository extends JpaRepository<BodyCultivationRealm, Long> {
    
    @Query("SELECT r FROM BodyCultivationRealm r WHERE r.status = 1 ORDER BY r.realmOrder ASC")
    List<BodyCultivationRealm> findAllActiveRealms();
    
    @Query("SELECT r FROM BodyCultivationRealm r WHERE r.realmOrder = ?1 AND r.status = 1")
    List<BodyCultivationRealm> findNextRealms(Integer currentRealmOrder);
}
