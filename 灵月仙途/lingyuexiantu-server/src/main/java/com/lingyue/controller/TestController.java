package com.lingyue.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class TestController {
    
    /**
     * 测试接口 - 验证后端连通性
     * GET /api/test/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "healthy");
        result.put("message", "后端服务正常");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }
    
    /**
     * 测试接口 - 验证数据库连接
     * GET /api/test/db
     */
    @GetMapping("/db")
    public ResponseEntity<Map<String, Object>> testDb() {
        Map<String, Object> result = new HashMap<>();
        result.put("database", "connected");
        result.put("message", "数据库连接正常");
        return ResponseEntity.ok(result);
    }
}
