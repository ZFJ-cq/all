package com.lingyue.controller;

import com.lingyuexiantu.common.Result;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.RoleRealmBreakthrough;
import com.lingyue.service.RoleRealmBreakthroughService;
import com.lingyue.service.BreakthroughService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 角色境界突破记录 Controller
 */
@RestController
@RequestMapping("/realm/break")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class RoleRealmBreakthroughController {

    private final RoleRealmBreakthroughService breakthroughService;
    private final BreakthroughService breakthroughExecuteService;

    public RoleRealmBreakthroughController(RoleRealmBreakthroughService breakthroughService,
                                         BreakthroughService breakthroughExecuteService) {
        this.breakthroughService = breakthroughService;
        this.breakthroughExecuteService = breakthroughExecuteService;
    }

    // 获取所有突破记录
    @GetMapping
    public ResponseEntity<List<RoleRealmBreakthrough>> getAllBreakthroughRecords() {
        List<RoleRealmBreakthrough> records = breakthroughService.getAllBreakthroughRecords();
        return new ResponseEntity<>(records, HttpStatus.OK);
    }

    // 根据 ID 获取突破记录
    @GetMapping("/{id}")
    public ResponseEntity<RoleRealmBreakthrough> getBreakthroughRecordById(@PathVariable Long id) {
        RoleRealmBreakthrough record = breakthroughService.getBreakthroughRecordById(id);
        if (record != null) {
            return new ResponseEntity<>(record, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // 根据角色 ID 获取突破记录
    @GetMapping("/role/{roleId}")
    public ResponseEntity<List<RoleRealmBreakthrough>> getBreakthroughRecordsByRoleId(@PathVariable Long roleId) {
        List<RoleRealmBreakthrough> records = breakthroughService.getBreakthroughRecordsByRoleId(roleId);
        return new ResponseEntity<>(records, HttpStatus.OK);
    }

    // 搜索突破记录
    @GetMapping("/search")
    public ResponseEntity<List<RoleRealmBreakthrough>> searchBreakthroughRecords(@RequestParam String keyword) {
        List<RoleRealmBreakthrough> records = breakthroughService.searchBreakthroughRecords(keyword);
        return new ResponseEntity<>(records, HttpStatus.OK);
    }

    // 创建突破记录
    @PostMapping
    public ResponseEntity<RoleRealmBreakthrough> createBreakthroughRecord(@RequestBody RoleRealmBreakthrough record) {
        RoleRealmBreakthrough createdRecord = breakthroughService.createBreakthroughRecord(record);
        return new ResponseEntity<>(createdRecord, HttpStatus.CREATED);
    }

    // 更新突破记录
    @PutMapping("/{id}")
    public ResponseEntity<RoleRealmBreakthrough> updateBreakthroughRecord(
            @PathVariable Long id, 
            @RequestBody RoleRealmBreakthrough record) {
        record.setId(id);
        RoleRealmBreakthrough updatedRecord = breakthroughService.updateBreakthroughRecord(record);
        if (updatedRecord != null) {
            return new ResponseEntity<>(updatedRecord, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // 删除突破记录
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBreakthroughRecord(@PathVariable Long id) {
        boolean deleted = breakthroughService.deleteBreakthroughRecord(id);
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * 执行境界突破 (带幂等性保护)
     */
    @PostMapping("/execute")
    public Result<Map<String, Object>> executeBreakthrough(@RequestBody Map<String, Object> request,
                                                           HttpServletRequest httpRequest) {
        try {
            Long roleId = Long.parseLong(request.get("roleId").toString());
            
            // 获取或生成请求 ID (幂等性)
            String requestId = request.get("requestId") != null 
                ? request.get("requestId").toString() 
                : UUID.randomUUID().toString();
            
            // 获取客户端 IP
            String clientIp = httpRequest.getRemoteAddr();
            
            // 执行突破 (带幂等性保护)
            Map<String, Object> result = breakthroughExecuteService.executeBreakthrough(
                roleId, requestId, clientIp);
            
            return Result.success(result);
            
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
            return Result.error(e.getMessage());
        } catch (IllegalStateException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("突破失败：" + e.getMessage());
        }
    }
}
