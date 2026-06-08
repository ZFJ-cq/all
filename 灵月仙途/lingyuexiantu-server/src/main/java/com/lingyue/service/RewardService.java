package com.lingyue.service;

import java.util.List;
import java.util.Map;

public interface RewardService {
    
    Map<String, Object> distributeRewards(Long roleId, Long userId, String title, String content, 
                                     List<Map<String, Object>> items, 
                                     Map<String, Integer> resources);
    
    Map<String, Object> sendMailWithItems(Long userId, String title, String content, 
                                           List<Map<String, Object>> items);
    
    Map<String, Object> claimMailAttachment(Long mailId, Long roleId);
}
