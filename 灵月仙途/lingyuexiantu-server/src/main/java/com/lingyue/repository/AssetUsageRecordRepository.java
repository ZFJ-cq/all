package com.lingyue.repository;

import com.lingyue.entity.AssetUsageRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssetUsageRecordRepository extends JpaRepository<AssetUsageRecord, Long> {
    List<AssetUsageRecord> findByRoleId(Long roleId);
}