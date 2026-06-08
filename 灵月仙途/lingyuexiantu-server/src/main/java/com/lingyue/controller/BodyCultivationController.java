package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.dto.*;
import com.lingyue.service.BodyCultivationService;
import com.lingyuexiantu.common.Result;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/body-cultivation")
public class BodyCultivationController {
    
    private final BodyCultivationService bodyCultivationService;
    
    public BodyCultivationController(BodyCultivationService bodyCultivationService) {
        this.bodyCultivationService = bodyCultivationService;
    }
    
    @GetMapping("/role/{roleId}")
    public Result<BodyCultivationDTO> getBodyCultivationInfo(@PathVariable Long roleId) {
        try {
            BodyCultivationDTO dto = bodyCultivationService.getBodyCultivationInfo(roleId);
            return Result.success(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取锻体信息失败：" + e.getMessage());
        }
    }
    
    @PostMapping("/role/{roleId}/cultivate")
    public Result<CultivateResult> cultivate(
            @PathVariable Long roleId,
            @RequestParam Long partId,
            @RequestParam Integer qteScore) {
        try {
            CultivateResult result = bodyCultivationService.cultivate(roleId, partId, qteScore);
            return Result.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("修炼失败：" + e.getMessage());
        }
    }
    
    @PostMapping("/role/{roleId}/breakthrough")
    public Result<BreakthroughResult> breakthrough(
            @PathVariable Long roleId,
            @RequestParam(required = false, defaultValue = "false") Boolean useMedicine) {
        try {
            BreakthroughResult result = bodyCultivationService.breakthrough(roleId, useMedicine);
            return Result.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("突破失败：" + e.getMessage());
        }
    }
    
    @GetMapping("/realms")
    public Result<List<BodyCultivationDTO.RealmInfo>> getAllRealms() {
        try {
            List<BodyCultivationDTO.RealmInfo> realms = bodyCultivationService.getAllRealms();
            return Result.success(realms);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取境界列表失败：" + e.getMessage());
        }
    }
    
    @GetMapping("/parts")
    public Result<List<BodyCultivationDTO.PartInfo>> getAllParts() {
        try {
            List<BodyCultivationDTO.PartInfo> parts = bodyCultivationService.getAllParts();
            return Result.success(parts);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取部位列表失败：" + e.getMessage());
        }
    }
    
    @GetMapping("/role/{roleId}/logs")
    public Result<List<BodyCultivationDTO.LogInfo>> getCultivationLogs(
            @PathVariable Long roleId,
            @RequestParam(required = false, defaultValue = "7") Integer days) {
        try {
            List<BodyCultivationDTO.LogInfo> logs = bodyCultivationService.getCultivationLogs(roleId, days);
            return Result.success(logs);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取修炼日志失败：" + e.getMessage());
        }
    }
}
