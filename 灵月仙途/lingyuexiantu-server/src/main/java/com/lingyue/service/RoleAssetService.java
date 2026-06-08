package com.lingyue.service;

import com.lingyue.dto.AssetUpdateRequest;
import com.lingyue.entity.RoleAsset;

import java.util.List;
import java.util.Map;

public interface RoleAssetService {
    List<RoleAsset> getAllRoleAssets();
    List<RoleAsset> getRoleAssets(Long roleId);
    RoleAsset getRoleAsset(Long roleId, Long assetTypeId);
    RoleAsset updateRoleAsset(Long roleId, Long assetTypeId, Long quantity);
    List<RoleAsset> batchUpdateRoleAssets(Long roleId, List<AssetUpdateRequest> updates);
    List<RoleAsset> getRoleAssetsByType(Long roleId, String type);
    void useItem(Long roleId, Long assetTypeId, int quantity);
    void equipItem(Long roleId, Long assetTypeId);
    void unequipItem(Long roleId, Long assetTypeId);
    void dropItem(Long roleId, Long assetTypeId, int quantity);
    void updateAsset(Long roleId, String assetName, int quantity);
    void addAsset(Long roleId, Long assetTypeId, int quantity);
    void addAttributes(Long roleId, Map<String, Object> attributes);
}