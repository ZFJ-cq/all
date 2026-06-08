package com.lingyue.service;

import com.lingyue.entity.AssetInformation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AssetInformationService {
    
    // 分页查询资产信息
    Page<AssetInformation> getAssetInformation(String assetTypeCode, String name, Pageable pageable);
    
    // 根据ID获取资产信息
    AssetInformation getAssetInformationById(Long id);
    
    // 根据资产类型获取资产信息
    List<AssetInformation> getAssetInformationByType(String assetTypeCode);
    
    // 创建资产信息
    AssetInformation createAssetInformation(AssetInformation assetInformation);
    
    // 更新资产信息
    AssetInformation updateAssetInformation(Long id, AssetInformation assetInformation);
    
    // 软删除资产信息
    void deleteAssetInformation(Long id);
    
    // 根据名称搜索资产信息
    List<AssetInformation> searchAssetInformationByName(String name);
}