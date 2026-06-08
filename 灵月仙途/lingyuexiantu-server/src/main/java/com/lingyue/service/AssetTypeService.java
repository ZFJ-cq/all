package com.lingyue.service;

import com.lingyue.entity.AssetType;
import java.util.List;

public interface AssetTypeService {
    List<AssetType> getAllAssetTypes();
    AssetType getAssetTypeById(Long id);
    AssetType getAssetTypeByName(String name);
    AssetType getAssetTypeByCode(String code);
    AssetType createAssetType(AssetType assetType);
    AssetType updateAssetType(Long id, AssetType assetType);
    void deleteAssetType(Long id);
}