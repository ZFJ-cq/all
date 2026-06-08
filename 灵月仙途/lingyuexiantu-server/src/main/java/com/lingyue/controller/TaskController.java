package com.lingyue.controller;

import com.lingyue.entity.*;
import com.lingyue.repository.*;
import com.lingyue.service.RewardService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/task")
public class TaskController {
    
    private final TaskRepository taskRepository;
    private final RoleTaskRepository roleTaskRepository;
    private final RoleActivityRepository roleActivityRepository;
    private final RewardService rewardService;
    
    public TaskController(TaskRepository taskRepository,
                         RoleTaskRepository roleTaskRepository,
                         RoleActivityRepository roleActivityRepository,
                         RewardService rewardService) {
        this.taskRepository = taskRepository;
        this.roleTaskRepository = roleTaskRepository;
        this.roleActivityRepository = roleActivityRepository;
        this.rewardService = rewardService;
    }
    
    /**
     * 获取任务列表
     * GET /task/list/{roleId}
     */
    @GetMapping("/list/{roleId}")
    public Map<String, Object> getTaskList(@PathVariable Long roleId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 获取所有任务
            List<Task> allTasks = taskRepository.findByIsActiveTrueOrderBySortOrderAsc();
            
            // 按类型分组
            Map<String, List<Map<String, Object>>> tasksByType = new HashMap<>();
            tasksByType.put("daily", new ArrayList<>());
            tasksByType.put("main", new ArrayList<>());
            tasksByType.put("achievement", new ArrayList<>());
            
            // 获取角色任务进度
            List<RoleTask> roleTasks = roleTaskRepository.findByRoleId(roleId);
            Map<Long, RoleTask> taskProgressMap = new HashMap<>();
            for (RoleTask rt : roleTasks) {
                taskProgressMap.put(rt.getTaskId(), rt);
            }
            
            // 组装数据
            for (Task task : allTasks) {
                Map<String, Object> taskData = new HashMap<>();
                taskData.put("id", task.getId());
                taskData.put("name", task.getName());
                taskData.put("description", task.getDescription());
                taskData.put("taskType", task.getTaskType());
                taskData.put("conditionType", task.getConditionType());
                taskData.put("conditionValue", task.getConditionValue());
                taskData.put("activityPoints", task.getActivityPoints());
                taskData.put("rewards", parseRewards(task.getRewards()));
                
                // 进度
                RoleTask roleTask = taskProgressMap.get(task.getId());
                if (roleTask != null) {
                    taskData.put("progress", roleTask.getProgress());
                    taskData.put("status", roleTask.getStatus());
                } else {
                    taskData.put("progress", 0);
                    taskData.put("status", "in_progress");
                }
                
                List<Map<String, Object>> targetList = tasksByType.get(task.getTaskType());
                if (targetList != null) {
                    targetList.add(taskData);
                }
            }
            
            // 获取活跃度
            RoleActivity activity = roleActivityRepository.findByRoleId(roleId).orElse(null);
            Integer activityPoints = activity != null ? activity.getDailyActivity() : 0;
            boolean chestClaimed = activity != null && activity.getClaimedRewards() != null 
                && activity.getClaimedRewards().contains("5");
            
            Map<String, Object> data = new HashMap<>();
            data.put("tasks", tasksByType);
            data.put("activityPoints", activityPoints);
            data.put("chestClaimed", chestClaimed);
            
            result.put("code", 200);
            result.put("message", "success");
            result.put("data", data);
            
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("message", "获取任务列表失败：" + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 领取任务奖励
     * POST /task/{taskId}/claim
     */
    @PostMapping("/{taskId}/claim")
    public Map<String, Object> claimTaskReward(@PathVariable Long taskId,
                                               @RequestBody Map<String, Object> request) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 验证参数
            if (request == null || request.get("roleId") == null) {
                result.put("code", 400);
                result.put("message", "参数不完整");
                return result;
            }
            
            Long roleId = Long.parseLong(request.get("roleId").toString());
            
            // 验证参数有效性
            if (taskId <= 0 || roleId <= 0) {
                result.put("code", 400);
                result.put("message", "参数无效");
                return result;
            }
            
            // 获取任务
            Task task = taskRepository.findById(taskId).orElse(null);
            if (task == null) {
                result.put("code", 404);
                result.put("message", "任务不存在");
                return result;
            }
            
            // 获取角色任务进度
            RoleTask roleTask = roleTaskRepository.findByRoleIdAndTaskIdCustom(roleId, taskId).orElse(null);
            if (roleTask == null) {
                result.put("code", 400);
                result.put("message", "任务未开始");
                return result;
            }
            
            if (!"completed".equals(roleTask.getStatus())) {
                result.put("code", 400);
                result.put("message", "任务未完成，无法领取奖励");
                return result;
            }
            
            // 更新状态为已领取
            roleTask.setStatus("claimed");
            roleTask.setClaimTime(LocalDateTime.now());
            roleTaskRepository.save(roleTask);
            
            // 发放奖励
            Map<String, Object> rewards = parseRewards(task.getRewards());
            Map<String, Integer> resourceRewards = (Map<String, Integer>) rewards.get("resourceRewards");
            List<Map<String, Object>> itemRewards = (List<Map<String, Object>>) rewards.get("itemRewards");
            
            String title = "任务奖励：" + task.getName();
            String content = task.getDescription();
            
            Map<String, Object> rewardResult = rewardService.distributeRewards(
                roleId, roleId, title, content, itemRewards, resourceRewards);
            
            Map<String, Object> data = new HashMap<>();
            data.put("taskId", taskId);
            data.put("activityPoints", task.getActivityPoints());
            data.put("rewards", rewardResult);
            
            result.put("code", 200);
            result.put("message", "领取成功");
            result.put("data", data);
            
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("message", "领取奖励失败：" + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 更新任务进度（由其他模块调用）
     * POST /task/progress
     */
    @PostMapping("/progress")
    public Map<String, Object> updateTaskProgress(@RequestBody Map<String, Object> request) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Long roleId = Long.parseLong(request.get("roleId").toString());
            String conditionType = request.get("conditionType").toString();
            Integer progress = Integer.parseInt(request.get("progress").toString());
            
            // 查找符合条件的每日任务
            List<Task> tasks = taskRepository.findActiveTasksByType("daily");
            
            for (Task task : tasks) {
                if (conditionType.equals(task.getConditionType())) {
                    RoleTask roleTask = roleTaskRepository.findByRoleIdAndTaskIdCustom(roleId, task.getId()).orElse(null);
                    
                    if (roleTask == null) {
                        // 创建新进度
                        roleTask = new RoleTask();
                        roleTask.setRoleId(roleId);
                        roleTask.setTaskId(task.getId());
                        roleTask.setProgress(0);
                        roleTask.setTarget(task.getConditionValue());
                        roleTask.setStatus("in_progress");
                        roleTask.setCreateTime(LocalDateTime.now());
                    }
                    
                    // 更新进度
                    if ("in_progress".equals(roleTask.getStatus())) {
                        int newProgress = roleTask.getProgress() + progress;
                        roleTask.setProgress(Math.min(newProgress, task.getConditionValue()));
                        
                        // 检查是否完成
                        if (roleTask.getProgress() >= task.getConditionValue()) {
                            roleTask.setStatus("completed");
                        }
                        
                        roleTask.setUpdateTime(LocalDateTime.now());
                        roleTaskRepository.save(roleTask);
                    }
                }
            }
            
            result.put("code", 200);
            result.put("message", "进度更新成功");
            
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("message", "更新进度失败：" + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 领取活跃度宝箱
     * POST /task/activity/chest
     */
    @PostMapping("/activity/chest")
    public Map<String, Object> claimActivityChest(@RequestBody Map<String, Object> request) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Long roleId = Long.parseLong(request.get("roleId").toString());
            
            RoleActivity activity = roleActivityRepository.findByRoleId(roleId).orElse(null);
            if (activity == null) {
                result.put("code", 400);
                result.put("message", "活跃度数据不存在");
                return result;
            }
            
            if (activity.getDailyActivity() < 100) {
                result.put("code", 400);
                result.put("message", "活跃度不足 100");
                return result;
            }
            
            String claimed = activity.getClaimedRewards();
            if (claimed != null && claimed.contains("chest")) {
                result.put("code", 400);
                result.put("message", "宝箱已领取");
                return result;
            }
            
            activity.setClaimedRewards(claimed == null || claimed.isEmpty() ? "chest" : claimed + ",chest");
            activity.setUpdatedAt(LocalDateTime.now());
            roleActivityRepository.save(activity);
            
            // 发放宝箱奖励（固定奖励）
            Map<String, Integer> resourceRewards = new HashMap<>();
            resourceRewards.put("lingshi", 500);
            resourceRewards.put("xiuwei", 2000);
            
            List<Map<String, Object>> itemRewards = new ArrayList<>();
            Map<String, Object> item = new HashMap<>();
            item.put("itemId", 100L);
            item.put("quantity", 1);
            itemRewards.add(item);
            
            String title = "活跃度宝箱";
            String content = "恭喜您完成今日目标，获得宝箱奖励！";
            
            Map<String, Object> rewardResult = rewardService.distributeRewards(
                roleId, roleId, title, content, itemRewards, resourceRewards);
            
            Map<String, Object> data = new HashMap<>();
            data.put("rewards", rewardResult);
            
            result.put("code", 200);
            result.put("message", "领取成功");
            result.put("data", data);
            
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("message", "领取宝箱失败：" + e.getMessage());
        }
        
        return result;
    }
    
    // ========== 辅助方法 ==========
    
    @SuppressWarnings("unchecked")
    private Map<String, Object> parseRewards(String rewardsJson) {
        Map<String, Object> rewards = new HashMap<>();
        Map<String, Object> resourceRewards = new HashMap<>();
        List<Map<String, Object>> itemRewards = new ArrayList<>();
        
        if (rewardsJson != null && !rewardsJson.trim().isEmpty() && !rewardsJson.equals("null")) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Map<String, Object> parsed = mapper.readValue(rewardsJson, Map.class);
                
                if (parsed.containsKey("resources")) {
                    Object resources = parsed.get("resources");
                    if (resources instanceof Map) {
                        resourceRewards = (Map<String, Object>) resources;
                    }
                }
                
                if (parsed.containsKey("items")) {
                    Object items = parsed.get("items");
                    if (items instanceof List) {
                        itemRewards = (List<Map<String, Object>>) items;
                    }
                }
                
                if (parsed.containsKey("xiuwei")) {
                    resourceRewards.put("xiuwei", parsed.get("xiuwei"));
                }
                if (parsed.containsKey("lingshi")) {
                    resourceRewards.put("lingshi", parsed.get("lingshi"));
                }
                if (parsed.containsKey("exp")) {
                    resourceRewards.put("exp", parsed.get("exp"));
                }
            } catch (Exception e) {
                try {
                    String[] pairs = rewardsJson.split(",");
                    for (String pair : pairs) {
                        String[] kv = pair.split(":");
                        if (kv.length == 2) {
                            String key = kv[0].trim().replace("\"", "").replace("{", "").replace("}", "");
                            String value = kv[1].trim().replace("\"", "").replace("{", "").replace("}", "");
                            try {
                                resourceRewards.put(key, Integer.parseInt(value));
                            } catch (NumberFormatException nfe) {
                                resourceRewards.put(key, value);
                            }
                        }
                    }
                } catch (Exception e2) {
                    // ignore
                }
            }
        }
        
        rewards.put("resourceRewards", resourceRewards);
        rewards.put("itemRewards", itemRewards);
        return rewards;
    }
}
