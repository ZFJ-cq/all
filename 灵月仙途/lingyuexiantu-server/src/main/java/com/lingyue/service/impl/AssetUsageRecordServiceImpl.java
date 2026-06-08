package com.lingyue.service.impl;

import com.lingyue.entity.AssetUsageRecord;
import com.lingyue.repository.AssetUsageRecordRepository;
import com.lingyue.service.AssetUsageRecordService;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AssetUsageRecordServiceImpl implements AssetUsageRecordService {

    private final AssetUsageRecordRepository assetUsageRecordRepository;
    
    public AssetUsageRecordServiceImpl(AssetUsageRecordRepository assetUsageRecordRepository) {
        this.assetUsageRecordRepository = assetUsageRecordRepository;
    }

    @Override
    public List<AssetUsageRecord> getUsageRecordsByRoleId(Long roleId) {
        return assetUsageRecordRepository.findByRoleId(roleId);
    }

    @Override
    public AssetUsageRecord createUsageRecord(AssetUsageRecord record) {
        return assetUsageRecordRepository.save(record);
    }
}