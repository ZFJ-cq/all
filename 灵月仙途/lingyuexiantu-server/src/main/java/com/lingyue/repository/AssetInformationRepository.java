package com.lingyue.repository;

import com.lingyue.entity.AssetInformation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssetInformationRepository extends JpaRepository<AssetInformation, Long> {
    
    // 分页查询资产信息，支持类型和名称模糊筛选
    @Query("SELECT a FROM AssetInformation a WHERE a.deletedAt IS NULL AND (:assetTypeCode IS NULL OR a.assetTypeCode = :assetTypeCode) AND (:name IS NULL OR a.name LIKE %:name%)")
    Page<AssetInformation> findByAssetTypeCodeAndName(@Param("assetTypeCode") String assetTypeCode, @Param("name") String name, Pageable pageable);
    
    // 根据资产类型编码查询资产信息
    List<AssetInformation> findByAssetTypeCodeAndDeletedAtIsNull(String assetTypeCode);
    
    // 根据名称查询资产信息
    List<AssetInformation> findByNameContainingAndDeletedAtIsNull(String name);
    
    // 软删除：更新删除时间
    @Query("UPDATE AssetInformation a SET a.deletedAt = CURRENT_TIMESTAMP WHERE a.id = :id")
    void softDeleteById(@Param("id") Long id);
}