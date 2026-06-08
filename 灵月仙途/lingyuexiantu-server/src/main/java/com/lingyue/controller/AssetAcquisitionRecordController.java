package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.AssetAcquisitionRecord;
import com.lingyue.service.AssetAcquisitionRecordService;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/assets/acquisition")
public class AssetAcquisitionRecordController {

    private final AssetAcquisitionRecordService assetAcquisitionRecordService;
    
    public AssetAcquisitionRecordController(AssetAcquisitionRecordService assetAcquisitionRecordService) {
        this.assetAcquisitionRecordService = assetAcquisitionRecordService;
    }

    // 获取角色资产获取记录
    @GetMapping("/{roleId}")
    public List<AssetAcquisitionRecord> getAcquisitionRecordsByRoleId(@PathVariable Long roleId) {
        return assetAcquisitionRecordService.getAcquisitionRecordsByRoleId(roleId);
    }

    // 创建资产获取记录
    @PostMapping
    public AssetAcquisitionRecord createAcquisitionRecord(@RequestBody AssetAcquisitionRecord record) {
        return assetAcquisitionRecordService.createAcquisitionRecord(record);
    }
}