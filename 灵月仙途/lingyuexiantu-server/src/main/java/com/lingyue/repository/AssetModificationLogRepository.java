package com.lingyue.repository;

import com.lingyue.entity.AssetModificationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetModificationLogRepository extends JpaRepository<AssetModificationLog, Long> {
    
    // 根据资产ID查询修改日志
    List<AssetModificationLog> findByAssetIdOrderByModifiedAtDesc(Long assetId);
    
    // 分页查询修改日志
    Page<AssetModificationLog> findAllByOrderByModifiedAtDesc(Pageable pageable);
}