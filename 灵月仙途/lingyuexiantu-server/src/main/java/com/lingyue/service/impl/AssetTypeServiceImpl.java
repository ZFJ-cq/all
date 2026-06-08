package com.lingyue.service.impl;

import com.lingyue.entity.AssetType;
import com.lingyue.repository.AssetTypeRepository;
import com.lingyue.service.AssetTypeService;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AssetTypeServiceImpl implements AssetTypeService {

    private final AssetTypeRepository assetTypeRepository;
    
    public AssetTypeServiceImpl(AssetTypeRepository assetTypeRepository) {
        this.assetTypeRepository = assetTypeRepository;
    }

    @Override
    public List<AssetType> getAllAssetTypes() {
        return assetTypeRepository.findAll();
    }

    @Override
    public AssetType getAssetTypeById(Long id) {
        return assetTypeRepository.findById(id).orElse(null);
    }

    @Override
    public AssetType getAssetTypeByName(String name) {
        return assetTypeRepository.findByName(name);
    }

    @Override
    public AssetType getAssetTypeByCode(String code) {
        try {
            return assetTypeRepository.findByCode(code);
        } catch (Exception e) {
            // 如果返回多个结果，尝试使用原生 SQL 查询获取第一个结果
            try {
                List<AssetType> assetTypes = assetTypeRepository.findAll();
                for (AssetType assetType : assetTypes) {
                    if (assetType.getCode().equals(code)) {
                        return assetType;
                    }
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }
            return null;
        }
    }

    @Override
    public AssetType createAssetType(AssetType assetType) {
        return assetTypeRepository.save(assetType);
    }

    @Override
    public AssetType updateAssetType(Long id, AssetType assetType) {
        AssetType existingAssetType = assetTypeRepository.findById(id).orElse(null);
        if (existingAssetType != null) {
            existingAssetType.setName(assetType.getName());
            existingAssetType.setType(assetType.getType());
            existingAssetType.setDescription(assetType.getDescription());
            return assetTypeRepository.save(existingAssetType);
        }
        return null;
    }

    @Override
    public void deleteAssetType(Long id) {
        assetTypeRepository.deleteById(id);
    }
}