package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.service.RewardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/reward")
public class RewardController {
    
    private final RewardService rewardService;
    
    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }
    
    @PostMapping("/distribute")
    public Map<String, Object> distributeRewards(@RequestBody Map<String, Object> request) {
        Long roleId = request.get("roleId") != null ? Long.valueOf(request.get("roleId").toString()) : null;
        Long userId = request.get("userId") != null ? Long.valueOf(request.get("userId").toString()) : null;
        String title = (String) request.get("title");
        String content = (String) request.get("content");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = request.get("items") != null ? (List<Map<String, Object>>) request.get("items") : null;
        @SuppressWarnings("unchecked")
        Map<String, Integer> resources = request.get("resources") != null ? (Map<String, Integer>) request.get("resources") : null;
        return rewardService.distributeRewards(roleId, userId, title, content, items, resources);
    }
    
    @PostMapping("/mail/claim")
    public Map<String, Object> claimMailAttachment(@RequestParam Long mailId,
                                                    @RequestParam Long roleId) {
        return rewardService.claimMailAttachment(mailId, roleId);
    }
}
