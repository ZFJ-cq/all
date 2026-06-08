package com.lingyue.controller;

import com.lingyue.dto.ActivityDTO;
import com.lingyue.entity.Activity;
import com.lingyue.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/activity")
public class ActivityController {
    
    private final ActivityService activityService;
    
    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllActivities() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Activity> activities = activityService.getAllActivities();
            response.put("success", true);
            response.put("data", activities);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取活动列表失败：" + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getActivityById(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Activity activity = activityService.getActivityById(id);
            if (activity != null) {
                response.put("success", true);
                response.put("data", activity);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "活动不存在");
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取活动详情失败：" + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createActivity(@RequestBody Activity activity) {
        Map<String, Object> response = new HashMap<>();
        try {
            Activity created = activityService.createActivity(activity);
            response.put("success", true);
            response.put("data", created);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "创建活动失败：" + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateActivity(@PathVariable Long id, @RequestBody Activity activity) {
        Map<String, Object> response = new HashMap<>();
        try {
            Activity updated = activityService.updateActivity(id, activity);
            response.put("success", true);
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "更新活动失败：" + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteActivity(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            activityService.deleteActivity(id);
            response.put("success", true);
            response.put("message", "删除成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "删除活动失败：" + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @GetMapping("/status/active")
    public ResponseEntity<Map<String, Object>> getActiveActivities() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Activity> activities = activityService.getActiveActivities();
            response.put("success", true);
            response.put("data", activities);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取活动列表失败：" + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @PostMapping("/{id}/participate")
    public ResponseEntity<Map<String, Object>> participateActivity(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long roleId = request.get("roleId") != null ? 
                Long.valueOf(request.get("roleId").toString()) : null;
            if (roleId == null) {
                response.put("success", false);
                response.put("message", "角色ID不能为空");
                return ResponseEntity.badRequest().body(response);
            }
            Map<String, Object> result = activityService.participateActivity(roleId, id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "参与活动失败：" + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/activity-info/{roleId}")
    public ResponseEntity<Map<String, Object>> getActivityInfo(@PathVariable Long roleId) {
        Map<String, Object> response = new HashMap<>();
        try {
            ActivityDTO dto = activityService.getActivityInfo(roleId);
            response.put("success", true);
            response.put("data", dto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取活跃度信息失败：" + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/activity-claim/{roleId}/{rewardId}")
    public ResponseEntity<Map<String, Object>> claimActivityReward(
            @PathVariable Long roleId,
            @PathVariable Long rewardId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> result = activityService.claimActivityReward(roleId, rewardId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "领取奖励失败：" + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
