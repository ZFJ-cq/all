package com.lingyue.service.impl;

import com.lingyue.entity.AssetInformation;
import com.lingyue.entity.AssetModificationLog;
import com.lingyue.entity.AssetType;
import com.lingyue.repository.AssetInformationRepository;
import com.lingyue.repository.AssetModificationLogRepository;
import com.lingyue.repository.AssetTypeRepository;
import com.lingyue.service.AssetInformationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.DecimalFormat;
import java.util.List;

@Service
public class AssetInformationServiceImpl implements AssetInformationService {
    
    private final AssetInformationRepository assetInformationRepository;
    private final AssetModificationLogRepository assetModificationLogRepository;
    private final AssetTypeRepository assetTypeRepository;
    
    public AssetInformationServiceImpl(AssetInformationRepository assetInformationRepository, 
                                    AssetModificationLogRepository assetModificationLogRepository, 
                                    AssetTypeRepository assetTypeRepository) {
        this.assetInformationRepository = assetInformationRepository;
        this.assetModificationLogRepository = assetModificationLogRepository;
        this.assetTypeRepository = assetTypeRepository;
    }
    
    @Override
    public Page<AssetInformation> getAssetInformation(String assetTypeCode, String name, Pageable pageable) {
        return assetInformationRepository.findByAssetTypeCodeAndName(assetTypeCode, name, pageable);
    }
    
    @Override
    public AssetInformation getAssetInformationById(Long id) {
        return assetInformationRepository.findById(id).orElse(null);
    }
    
    @Override
    public List<AssetInformation> getAssetInformationByType(String assetTypeCode) {
        return assetInformationRepository.findByAssetTypeCodeAndDeletedAtIsNull(assetTypeCode);
    }
    
    @Override
    @Transactional
    public AssetInformation createAssetInformation(AssetInformation assetInformation) {
        // 验证资产类型是否存在
        AssetType assetType = assetTypeRepository.findByCode(assetInformation.getAssetTypeCode());
        if (assetType == null) {
            throw new IllegalArgumentException("资产类型不存在");
        }
        
        // 根据资产类型的精度格式化数值
        if (assetType.getDecimalPrecision() != null) {
            assetInformation.setValue(assetInformation.getValue().setScale(assetType.getDecimalPrecision(), java.math.RoundingMode.HALF_UP));
        }
        
        return assetInformationRepository.save(assetInformation);
    }
    
    @Override
    @Transactional
    public AssetInformation updateAssetInformation(Long id, AssetInformation assetInformation) {
        AssetInformation existingAsset = assetInformationRepository.findById(id).orElse(null);
        if (existingAsset == null) {
            throw new IllegalArgumentException("资产信息不存在");
        }
        
        // 验证资产类型是否存在
        AssetType assetType = assetTypeRepository.findByCode(assetInformation.getAssetTypeCode());
        if (assetType == null) {
            throw new IllegalArgumentException("资产类型不存在");
        }
        
        // 记录修改日志
        if (!existingAsset.getName().equals(assetInformation.getName())) {
            logModification(id, "name", existingAsset.getName(), assetInformation.getName());
        }
        if (!existingAsset.getDescription().equals(assetInformation.getDescription())) {
            logModification(id, "description", existingAsset.getDescription(), assetInformation.getDescription());
        }
        if (!existingAsset.getValue().equals(assetInformation.getValue())) {
            logModification(id, "value", existingAsset.getValue().toString(), assetInformation.getValue().toString());
        }
        if (!existingAsset.getAssetTypeCode().equals(assetInformation.getAssetTypeCode())) {
            logModification(id, "assetTypeCode", existingAsset.getAssetTypeCode(), assetInformation.getAssetTypeCode());
        }
        if (!existingAsset.getIsActive().equals(assetInformation.getIsActive())) {
            logModification(id, "isActive", existingAsset.getIsActive().toString(), assetInformation.getIsActive().toString());
        }
        
        // 根据资产类型的精度格式化数值
        if (assetType.getDecimalPrecision() != null) {
            assetInformation.setValue(assetInformation.getValue().setScale(assetType.getDecimalPrecision(), java.math.RoundingMode.HALF_UP));
        }
        
        assetInformation.setId(id);
        return assetInformationRepository.save(assetInformation);
    }
    
    @Override
    @Transactional
    public void deleteAssetInformation(Long id) {
        assetInformationRepository.softDeleteById(id);
    }
    
    @Override
    public List<AssetInformation> searchAssetInformationByName(String name) {
        return assetInformationRepository.findByNameContainingAndDeletedAtIsNull(name);
    }
    
    // 记录资产修改日志
    private void logModification(Long assetId, String fieldName, String oldValue, String newValue) {
        AssetModificationLog log = new AssetModificationLog();
        log.setAssetId(assetId);
        log.setFieldName(fieldName);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setModifiedBy("system"); // 实际应用中应该从登录用户获取
        assetModificationLogRepository.save(log);
    }
}