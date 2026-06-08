package com.lingyue.service;

import com.lingyue.entity.AssetAcquisitionRecord;
import java.util.List;

public interface AssetAcquisitionRecordService {
    List<AssetAcquisitionRecord> getAcquisitionRecordsByRoleId(Long roleId);
    AssetAcquisitionRecord createAcquisitionRecord(AssetAcquisitionRecord record);
}