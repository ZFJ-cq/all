package com.lingyue.repository;

import com.lingyue.entity.TradeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeRecordRepository extends JpaRepository<TradeRecord, Long> {
    List<TradeRecord> findByRoleIdOrderByTradeTimeDesc(Long roleId);
}