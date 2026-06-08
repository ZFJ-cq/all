package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.AssetType;
import com.lingyue.entity.SysOperationLog;
import com.lingyue.repository.SysOperationLogRepository;
import com.lingyue.service.AssetTypeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/asset-type")
public class AssetTypeController {

    private final AssetTypeService assetTypeService;
    private final SysOperationLogRepository sysOperationLogRepository;
    
    public AssetTypeController(AssetTypeService assetTypeService, SysOperationLogRepository sysOperationLogRepository) {
        this.assetTypeService = assetTypeService;
        this.sysOperationLogRepository = sysOperationLogRepository;
    }

    // 获取所有资产类型（带分页和筛选）
    @GetMapping("/list")
    public Map<String, Object> getAssetTypes(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Map<String, Object> result = new HashMap<>();
        List<AssetType> allTypes = assetTypeService.getAllAssetTypes();
        
        // 筛选
        if (name != null && !name.isEmpty()) {
            allTypes = allTypes.stream()
                .filter(t -> t.getName().contains(name))
                .collect(Collectors.toList());
        }
        if (category != null && !category.isEmpty()) {
            allTypes = allTypes.stream()
                .filter(t -> category.equals(t.getCategory()))
                .collect(Collectors.toList());
        }
        if (status != null && !status.isEmpty()) {
            allTypes = allTypes.stream()
                .filter(t -> status.equals(t.getStatus()))
                .collect(Collectors.toList());
        }
        
        // 分页（前端从1开始，后端从0开始）
        int total = allTypes.size();
        int totalPages = (int) Math.ceil((double) total / size);
        int pageIndex = page - 1;
        if (pageIndex < 0) pageIndex = 0;
        int fromIndex = pageIndex * size;
        int toIndex = Math.min(fromIndex + size, total);
        
        List<AssetType> content;
        if (fromIndex < total) {
            content = allTypes.subList(fromIndex, toIndex);
        } else {
            content = allTypes;
        }
        
        result.put("list", content);
        result.put("total", total);
        result.put("totalPages", totalPages);
        result.put("page", page);
        result.put("size", size);
        
        return result;
    }

    // 获取所有资产类型（简单列表）
    @GetMapping
    public List<AssetType> getAllAssetTypes() {
        return assetTypeService.getAllAssetTypes();
    }

    // 获取单个资产类型
    @GetMapping("/{id}")
    public AssetType getAssetTypeById(@PathVariable Long id) {
        return assetTypeService.getAssetTypeById(id);
    }

    // 创建资产类型
    @PostMapping
    public AssetType createAssetType(@RequestBody AssetType assetType) {
        return assetTypeService.createAssetType(assetType);
    }

    // 更新资产类型
    @PutMapping("/{id}")
    public AssetType updateAssetType(@PathVariable Long id, @RequestBody AssetType assetType) {
        return assetTypeService.updateAssetType(id, assetType);
    }

    // 删除资产类型
    @DeleteMapping("/{id}")
    public void deleteAssetType(@PathVariable Long id) {
        assetTypeService.deleteAssetType(id);
    }
    
    // 更新资产类型状态
    @PutMapping("/{id}/status")
    public AssetType updateAssetTypeStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        AssetType assetType = assetTypeService.getAssetTypeById(id);
        if (assetType != null) {
            assetType.setStatus(status);
            return assetTypeService.updateAssetType(id, assetType);
        }
        return null;
    }
    
    // 获取操作日志（资产类型相关）
    @GetMapping("/logs")
    public Map<String, Object> getLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 转换页码（前端1开始，后端0开始）
            int pageIndex = page - 1;
            if (pageIndex < 0) pageIndex = 0;
            
            Pageable pageable = PageRequest.of(pageIndex, size, Sort.by(Sort.Direction.DESC, "createTime"));
            
            Page<SysOperationLog> logPage;
            
            // 根据时间范围查询
            if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
                LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
                LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
                logPage = sysOperationLogRepository.findByCreateTimeBetween(start, end, pageable);
            } else {
                logPage = sysOperationLogRepository.findAll(pageable);
            }
            
            // 转换为前端需要的格式
            List<Map<String, Object>> logList = logPage.getContent().stream()
                .map(log -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", log.getId());
                    item.put("operateTime", log.getCreateTime() != null ? log.getCreateTime().toString() : "");
                    item.put("operator", log.getOperatorUsername());
                    item.put("actionType", log.getOperationType());
                    item.put("assetTypeName", log.getModule());
                    item.put("details", log.getApiPath() + " - " + (log.getErrorMessage() != null ? log.getErrorMessage() : "成功"));
                    return item;
                })
                .collect(Collectors.toList());
            
            result.put("list", logList);
            result.put("total", logPage.getTotalElements());
            result.put("totalPages", logPage.getTotalPages());
            result.put("page", page);
            result.put("size", size);
            
        } catch (Exception e) {
            e.printStackTrace();
            result.put("list", List.of());
            result.put("total", 0);
            result.put("totalPages", 0);
        }
        
        return result;
    }
}