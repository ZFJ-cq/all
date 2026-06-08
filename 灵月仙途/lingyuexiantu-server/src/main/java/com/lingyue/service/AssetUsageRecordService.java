package com.lingyue.service;

import com.lingyue.entity.AssetUsageRecord;
import java.util.List;

public interface AssetUsageRecordService {
    List<AssetUsageRecord> getUsageRecordsByRoleId(Long roleId);
    AssetUsageRecord createUsageRecord(AssetUsageRecord record);
}