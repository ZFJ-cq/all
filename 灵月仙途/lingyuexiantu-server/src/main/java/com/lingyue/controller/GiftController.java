package com.lingyue.controller;

import com.lingyue.entity.Gift;
import com.lingyue.repository.GiftRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/gift")
@CrossOrigin(originPatterns = "*")
public class GiftController {
    
    private final GiftRepository giftRepository;
    
    public GiftController(GiftRepository giftRepository) {
        this.giftRepository = giftRepository;
    }
    
    // 获取未领取礼物数量
    @GetMapping("/unclaimed/count/{userId}")
    public ResponseEntity<Map<String, Object>> getUnclaimedGiftCount(@PathVariable Long userId) {
        try {
            long count = giftRepository.countByUserIdAndStatus(userId, 0);
            
            Map<String, Object> result = new HashMap<>();
            result.put("count", count);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "获取礼物数量失败: " + e.getMessage()));
        }
    }
}
