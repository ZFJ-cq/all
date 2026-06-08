package com.lingyue.service.impl;

import com.lingyue.entity.AssetAcquisitionRecord;
import com.lingyue.repository.AssetAcquisitionRecordRepository;
import com.lingyue.service.AssetAcquisitionRecordService;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AssetAcquisitionRecordServiceImpl implements AssetAcquisitionRecordService {

    private final AssetAcquisitionRecordRepository assetAcquisitionRecordRepository;
    
    public AssetAcquisitionRecordServiceImpl(AssetAcquisitionRecordRepository assetAcquisitionRecordRepository) {
        this.assetAcquisitionRecordRepository = assetAcquisitionRecordRepository;
    }

    @Override
    public List<AssetAcquisitionRecord> getAcquisitionRecordsByRoleId(Long roleId) {
        return assetAcquisitionRecordRepository.findByRoleId(roleId);
    }

    @Override
    public AssetAcquisitionRecord createAcquisitionRecord(AssetAcquisitionRecord record) {
        return assetAcquisitionRecordRepository.save(record);
    }
}