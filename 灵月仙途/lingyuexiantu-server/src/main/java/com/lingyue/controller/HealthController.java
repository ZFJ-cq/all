package com.lingyue.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查控制器
 * 用于检查服务是否正常运行
 */
@RestController
@RequestMapping("/health")
public class HealthController {
    
    /**
     * 健康检查端点
     * @return 健康状态
     */
    @GetMapping
    public Map<String, Object> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 0);
        response.put("message", "服务运行正常");
        response.put("data", new HashMap<String, Object>() {
            {
                put("status", "healthy");
                put("timestamp", System.currentTimeMillis());
            }
        });
        return response;
    }
}
