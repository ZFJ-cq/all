package com.lingyue.controller;

import com.lingyue.entity.AssetInformation;
import com.lingyue.service.AssetInformationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/asset-information")
@CrossOrigin(originPatterns = "*")
public class AssetInformationController {
    
    private final AssetInformationService assetInformationService;
    
    public AssetInformationController(AssetInformationService assetInformationService) {
        this.assetInformationService = assetInformationService;
    }
    
    // 分页查询资产信息
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getAssetInformationList(
            @RequestParam(required = false) String assetTypeCode,
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            // 转换页码（前端1开始，后端0开始）
            int pageIndex = page - 1;
            if (pageIndex < 0) pageIndex = 0;
            
            // 构建分页参数
            Pageable pageable = PageRequest.of(pageIndex, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            
            // 查询数据
            Page<AssetInformation> assetPage = assetInformationService.getAssetInformation(assetTypeCode, name, pageable);
            
            // 构建响应
            Map<String, Object> response = new HashMap<>();
            response.put("list", assetPage.getContent());
            response.put("total", assetPage.getTotalElements());
            response.put("totalPages", assetPage.getTotalPages());
            response.put("pageNum", page);
            response.put("pageSize", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "查询资产信息失败: " + e.getMessage()));
        }
    }
    
    // 根据ID获取资产信息
    @GetMapping("/{id}")
    public ResponseEntity<AssetInformation> getAssetInformationById(@PathVariable Long id) {
        try {
            AssetInformation assetInformation = assetInformationService.getAssetInformationById(id);
            if (assetInformation == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(assetInformation);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    // 根据资产类型获取资产信息
    @GetMapping("/type/{assetTypeCode}")
    public ResponseEntity<List<AssetInformation>> getAssetInformationByType(@PathVariable String assetTypeCode) {
        try {
            List<AssetInformation> assetInformationList = assetInformationService.getAssetInformationByType(assetTypeCode);
            return ResponseEntity.ok(assetInformationList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    // 创建资产信息
    @PostMapping
    public ResponseEntity<AssetInformation> createAssetInformation(@RequestBody AssetInformation assetInformation) {
        try {
            AssetInformation createdAsset = assetInformationService.createAssetInformation(assetInformation);
            return ResponseEntity.ok(createdAsset);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    // 更新资产信息
    @PutMapping("/{id}")
    public ResponseEntity<AssetInformation> updateAssetInformation(@PathVariable Long id, @RequestBody AssetInformation assetInformation) {
        try {
            AssetInformation updatedAsset = assetInformationService.updateAssetInformation(id, assetInformation);
            return ResponseEntity.ok(updatedAsset);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    // 删除资产信息（软删除）
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssetInformation(@PathVariable Long id) {
        try {
            assetInformationService.deleteAssetInformation(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    // 根据名称搜索资产信息
    @GetMapping("/search")
    public ResponseEntity<List<AssetInformation>> searchAssetInformation(@RequestParam String name) {
        try {
            List<AssetInformation> assetInformationList = assetInformationService.searchAssetInformationByName(name);
            return ResponseEntity.ok(assetInformationList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}