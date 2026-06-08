package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.GameUser;
import com.lingyue.repository.GameUserRepository;
import com.lingyue.service.RewardService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/admin/mail")
public class AdminMailController {
    
    private final RewardService rewardService;
    private final GameUserRepository gameUserRepository;
    
    public AdminMailController(RewardService rewardService, 
                              GameUserRepository gameUserRepository) {
        this.rewardService = rewardService;
        this.gameUserRepository = gameUserRepository;
    }
    
    @PostMapping("/send-to-user")
    public Map<String, Object> sendMailToUser(@RequestParam Long userId,
                                               @RequestParam String title,
                                               @RequestParam String content,
                                               @RequestBody(required = false) List<Map<String, Object>> items) {
        return rewardService.sendMailWithItems(userId, title, content, items);
    }
    
    @PostMapping("/send-to-all")
    public Map<String, Object> sendMailToAll(@RequestParam String title,
                                              @RequestParam String content,
                                              @RequestBody(required = false) List<Map<String, Object>> items) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<GameUser> allUsers = gameUserRepository.findAll();
            int successCount = 0;
            int failCount = 0;
            
            for (GameUser user : allUsers) {
                try {
                    rewardService.sendMailWithItems(user.getId(), title, content, items);
                    successCount++;
                } catch (Exception e) {
                    failCount++;
                }
            }
            
            result.put("success", true);
            result.put("message", "全服邮件发送完成");
            result.put("successCount", successCount);
            result.put("failCount", failCount);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "全服邮件发送失败: " + e.getMessage());
        }
        
        return result;
    }
    
    @PostMapping("/send-to-users")
    public Map<String, Object> sendMailToUsers(@RequestParam List<Long> userIds,
                                                @RequestParam String title,
                                                @RequestParam String content,
                                                @RequestBody(required = false) List<Map<String, Object>> items) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            int successCount = 0;
            int failCount = 0;
            
            for (Long userId : userIds) {
                try {
                    rewardService.sendMailWithItems(userId, title, content, items);
                    successCount++;
                } catch (Exception e) {
                    failCount++;
                }
            }
            
            result.put("success", true);
            result.put("message", "批量邮件发送完成");
            result.put("successCount", successCount);
            result.put("failCount", failCount);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "批量邮件发送失败: " + e.getMessage());
        }
        
        return result;
    }
}
