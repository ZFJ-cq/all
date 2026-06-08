package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.SystemSetting;
import com.lingyue.service.SystemSettingService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/admin/newbie-gift")
public class NewbieGiftController {
    
    private static final String NEWBIE_GIFT_KEY = "newbie_gift_config";
    
    private final SystemSettingService systemSettingService;
    
    public NewbieGiftController(SystemSettingService systemSettingService) {
        this.systemSettingService = systemSettingService;
    }
    
    @GetMapping("/config")
    public Map<String, Object> getNewbieGiftConfig() {
        Map<String, Object> result = new HashMap<>();
        SystemSetting setting = systemSettingService.getSettingByKey(NEWBIE_GIFT_KEY);
        
        if (setting != null) {
            result.put("success", true);
            result.put("config", setting.getValue());
        } else {
            result.put("success", true);
            result.put("config", getDefaultConfig());
        }
        
        return result;
    }
    
    @PostMapping("/config")
    public Map<String, Object> saveNewbieGiftConfig(@RequestBody Map<String, Object> request) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String config = (String) request.get("config");
            systemSettingService.saveSetting(NEWBIE_GIFT_KEY, config, "新手礼包配置");
            
            result.put("success", true);
            result.put("message", "新手礼包配置保存成功");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "保存失败: " + e.getMessage());
        }
        
        return result;
    }
    
    private String getDefaultConfig() {
        return "{\n" +
            "  \"title\": \"欢迎来到灵月仙途！\",\n" +
            "  \"content\": \"亲爱的{roleName}道友，欢迎来到灵月仙途！以下是您的新手礼包，祝您修仙之路一帆风顺！\",\n" +
            "  \"items\": [\n" +
            "    {\"itemId\": 1, \"quantity\": 1000},\n" +
            "    {\"itemId\": 2, \"quantity\": 500},\n" +
            "    {\"itemId\": 3, \"quantity\": 100},\n" +
            "    {\"itemId\": 10, \"quantity\": 1},\n" +
            "    {\"itemId\": 11, \"quantity\": 1},\n" +
            "    {\"itemId\": 20, \"quantity\": 10},\n" +
            "    {\"itemId\": 21, \"quantity\": 5},\n" +
            "    {\"itemId\": 22, \"quantity\": 3}\n" +
            "  ],\n" +
            "  \"randomWeapons\": [30, 31, 32],\n" +
            "  \"randomArmors\": [33, 34, 35],\n" +
            "  \"randomAccessories\": [36, 37, 38]\n" +
            "}";
    }
}
