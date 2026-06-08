package com.lingyue.controller;

import com.lingyue.repository.GameRoleRepository;
import com.lingyue.repository.GameUserRepository;
import com.lingyue.repository.PaymentRecordRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/statistics")
@CrossOrigin(originPatterns = "*")
public class StatisticsController {
    
    private final GameUserRepository gameUserRepository;
    private final GameRoleRepository gameRoleRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    
    public StatisticsController(GameUserRepository gameUserRepository, 
                              GameRoleRepository gameRoleRepository, 
                              PaymentRecordRepository paymentRecordRepository) {
        this.gameUserRepository = gameUserRepository;
        this.gameRoleRepository = gameRoleRepository;
        this.paymentRecordRepository = paymentRecordRepository;
    }
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getStatistics() {
        try {
            // 获取统计数据
            long totalUsers = gameUserRepository.count();
            long totalRoles = gameRoleRepository.count();
            long totalTransactions = paymentRecordRepository.count();
            
            Map<String, Object> result = new HashMap<>();
            result.put("totalUsers", totalUsers);
            result.put("totalRoles", totalRoles);
            result.put("totalTransactions", totalTransactions);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "获取统计数据失败: " + e.getMessage()));
        }
    }
}
