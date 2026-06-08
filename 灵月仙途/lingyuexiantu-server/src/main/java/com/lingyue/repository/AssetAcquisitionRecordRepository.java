package com.lingyue.repository;

import com.lingyue.entity.AssetAcquisitionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssetAcquisitionRecordRepository extends JpaRepository<AssetAcquisitionRecord, Long> {
    List<AssetAcquisitionRecord> findByRoleId(Long roleId);
}