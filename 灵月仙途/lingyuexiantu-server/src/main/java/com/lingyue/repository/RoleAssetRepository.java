package com.lingyue.repository;

import com.lingyue.entity.RoleAsset;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoleAssetRepository extends JpaRepository<RoleAsset, Long> {
    List<RoleAsset> findByRoleId(Long roleId);
    
    RoleAsset findByRoleIdAndAssetTypeCode(Long roleId, String assetTypeCode);
    
    List<RoleAsset> findByRoleIdAndAssetTypeCodeIn(Long roleId, List<String> assetTypeCodes);
}