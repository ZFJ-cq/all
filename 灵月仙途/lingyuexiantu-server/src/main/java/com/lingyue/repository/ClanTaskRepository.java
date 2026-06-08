package com.lingyue.repository;

import com.lingyue.entity.ClanTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClanTaskRepository extends JpaRepository<ClanTask, Long> {
    
    List<ClanTask> findByStatusOrderByCreateTimeDesc(Integer status);
    
    List<ClanTask> findByClanIdAndStatusOrderByCreateTimeDesc(Long clanId, Integer status);
    
    default List<ClanTask> findAllAvailable() {
        return findByStatusOrderByCreateTimeDesc(1);
    }
    
    default List<ClanTask> findAvailableByClanId(Long clanId) {
        return findByClanIdAndStatusOrderByCreateTimeDesc(clanId, 1);
    }
}
