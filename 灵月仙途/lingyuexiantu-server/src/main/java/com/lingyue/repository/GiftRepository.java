package com.lingyue.repository;

import com.lingyue.entity.Gift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GiftRepository extends JpaRepository<Gift, Long> {
    long countByUserIdAndStatus(Long userId, Integer status);
}
