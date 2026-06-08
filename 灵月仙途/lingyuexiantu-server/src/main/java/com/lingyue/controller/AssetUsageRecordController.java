package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.AssetUsageRecord;
import com.lingyue.service.AssetUsageRecordService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/assets/usage")
public class AssetUsageRecordController {

    private final AssetUsageRecordService assetUsageRecordService;
    
    public AssetUsageRecordController(AssetUsageRecordService assetUsageRecordService) {
        this.assetUsageRecordService = assetUsageRecordService;
    }

    // 获取角色资产使用记录
    @GetMapping("/{roleId}")
    public List<AssetUsageRecord> getUsageRecordsByRoleId(@PathVariable Long roleId) {
        return assetUsageRecordService.getUsageRecordsByRoleId(roleId);
    }

    // 创建资产使用记录
    @PostMapping
    public AssetUsageRecord createUsageRecord(@RequestBody AssetUsageRecord record) {
        return assetUsageRecordService.createUsageRecord(record);
    }
}