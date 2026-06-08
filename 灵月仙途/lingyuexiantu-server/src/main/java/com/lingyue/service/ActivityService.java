package com.lingyue.service;

import com.lingyue.dto.ActivityDTO;
import com.lingyue.entity.*;
import com.lingyue.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ActivityRewardRepository activityRewardRepository;
    private final RoleActivityRepository roleActivityRepository;
    private final RoleAssetService roleAssetService;
    private final AssetTypeService assetTypeService;

    public ActivityService(ActivityRepository activityRepository,
                           ActivityRewardRepository activityRewardRepository,
                           RoleActivityRepository roleActivityRepository,
                           RoleAssetService roleAssetService,
                           AssetTypeService assetTypeService) {
        this.activityRepository = activityRepository;
        this.activityRewardRepository = activityRewardRepository;
        this.roleActivityRepository = roleActivityRepository;
        this.roleAssetService = roleAssetService;
        this.assetTypeService = assetTypeService;
    }

    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

    public List<Activity> getActiveActivities() {
        return activityRepository.findByStatus(1);
    }

    public List<Activity> getHotActivities() {
        return activityRepository.findByStatusAndIsHotTrue(1);
    }

    public List<Activity> getActivitiesByType(String type) {
        return activityRepository.findByStatusAndType(1, type);
    }

    public Activity getActivityById(Long id) {
        return activityRepository.findById(id).orElse(null);
    }

    @Transactional
    public Activity createActivity(Activity activity) {
        return activityRepository.save(activity);
    }

    @Transactional
    public Activity updateActivity(Long id, Activity activity) {
        activity.setId(id);
        return activityRepository.save(activity);
    }

    @Transactional
    public void deleteActivity(Long id) {
        activityRepository.deleteById(id);
    }

    @Transactional
    public Map<String, Object> participateActivity(Long roleId, Long activityId) {
        Map<String, Object> result = new HashMap<>();
        Activity activity = activityRepository.findById(activityId).orElse(null);
        if (activity == null) {
            result.put("success", false);
            result.put("message", "活动不存在");
            return result;
        }
        if (activity.getStatus() == null || activity.getStatus() != 1) {
            result.put("success", false);
            result.put("message", "活动未开启");
            return result;
        }
        Date now = new Date();
        if (activity.getEndTime() != null && now.after(activity.getEndTime())) {
            activity.setStatus(2);
            activityRepository.save(activity);
            result.put("success", false);
            result.put("message", "活动已结束");
            return result;
        }

        addActivityPoints(roleId, 10);

        String rewardsJson = activity.getRewards();
        if (rewardsJson != null && !rewardsJson.isEmpty()) {
            try {
                distributeActivityRewards(roleId, rewardsJson);
            } catch (Exception e) {
                System.err.println("发放活动奖励失败: " + e.getMessage());
            }
        }

        result.put("success", true);
        result.put("message", "参与活动成功");
        result.put("activityPoints", 10);
        return result;
    }

    @Transactional
    public void addActivityPoints(Long roleId, int points) {
        RoleActivity roleActivity = roleActivityRepository.findByRoleId(roleId).orElse(null);
        if (roleActivity == null) {
            roleActivity = new RoleActivity();
            roleActivity.setRoleId(roleId);
            roleActivity.setDailyActivity(0);
            roleActivity.setTotalActivity(0);
            roleActivity.setClaimedRewards("");
            roleActivity.setDailyResetTime(LocalDateTime.now());
        }

        checkAndResetDaily(roleActivity);

        roleActivity.setDailyActivity(roleActivity.getDailyActivity() + points);
        roleActivity.setTotalActivity(roleActivity.getTotalActivity() + points);
        roleActivityRepository.save(roleActivity);
    }

    private void checkAndResetDaily(RoleActivity roleActivity) {
        LocalDateTime resetTime = roleActivity.getDailyResetTime();
        LocalDateTime now = LocalDateTime.now();
        if (resetTime == null || !resetTime.toLocalDate().equals(now.toLocalDate())) {
            roleActivity.setDailyActivity(0);
            roleActivity.setClaimedRewards("");
            roleActivity.setDailyResetTime(now);
        }
    }

    public ActivityDTO getActivityInfo(Long roleId) {
        RoleActivity roleActivity = roleActivityRepository.findByRoleId(roleId).orElse(null);
        List<ActivityReward> allRewards = activityRewardRepository.findByIsEnabledOrderBySortOrderAsc(true);

        ActivityDTO dto = new ActivityDTO();
        dto.setRoleId(roleId);

        if (roleActivity != null) {
            checkAndResetDaily(roleActivity);
            roleActivityRepository.save(roleActivity);
            dto.setDailyActivity(roleActivity.getDailyActivity());
            dto.setTotalActivity(roleActivity.getTotalActivity());

            String claimed = roleActivity.getClaimedRewards();
            List<Long> claimedIds = new ArrayList<>();
            if (claimed != null && !claimed.isEmpty()) {
                for (String idStr : claimed.split(",")) {
                    try { claimedIds.add(Long.parseLong(idStr.trim())); }
                    catch (NumberFormatException ignored) {}
                }
            }
            dto.setClaimedRewards(claimedIds);
        } else {
            dto.setDailyActivity(0);
            dto.setTotalActivity(0);
            dto.setClaimedRewards(new ArrayList<>());
        }

        List<ActivityDTO.ActivityRewardDTO> rewardDTOs = new ArrayList<>();
        for (ActivityReward reward : allRewards) {
            ActivityDTO.ActivityRewardDTO rDto = new ActivityDTO.ActivityRewardDTO();
            rDto.setId(reward.getId());
            rDto.setActivityThreshold(reward.getActivityThreshold());
            rDto.setName(reward.getName());
            rDto.setDescription(reward.getDescription());
            rDto.setRewardXiuwei(reward.getRewardXiuwei());
            rDto.setRewardLingshi(reward.getRewardLingshi());
            rDto.setRewardItems(reward.getRewardItems());
            rDto.setClaimed(dto.getClaimedRewards().contains(reward.getId()));
            rDto.setAvailable(dto.getDailyActivity() >= reward.getActivityThreshold());
            rewardDTOs.add(rDto);
        }
        dto.setAvailableRewards(rewardDTOs);

        return dto;
    }

    @Transactional
    public Map<String, Object> claimActivityReward(Long roleId, Long rewardId) {
        Map<String, Object> result = new HashMap<>();

        ActivityReward reward = activityRewardRepository.findById(rewardId).orElse(null);
        if (reward == null) {
            result.put("success", false);
            result.put("message", "奖励不存在");
            return result;
        }

        RoleActivity roleActivity = roleActivityRepository.findByRoleId(roleId).orElse(null);
        if (roleActivity == null) {
            result.put("success", false);
            result.put("message", "活跃度数据不存在");
            return result;
        }

        checkAndResetDaily(roleActivity);

        if (roleActivity.getDailyActivity() < reward.getActivityThreshold()) {
            result.put("success", false);
            result.put("message", "活跃度不足，需要" + reward.getActivityThreshold() + "点");
            return result;
        }

        String claimed = roleActivity.getClaimedRewards();
        List<String> claimedList = new ArrayList<>();
        if (claimed != null && !claimed.isEmpty()) {
            claimedList = new ArrayList<>(Arrays.asList(claimed.split(",")));
        }
        if (claimedList.contains(String.valueOf(rewardId))) {
            result.put("success", false);
            result.put("message", "奖励已领取");
            return result;
        }

        claimedList.add(String.valueOf(rewardId));
        roleActivity.setClaimedRewards(String.join(",", claimedList));
        roleActivityRepository.save(roleActivity);

        if (reward.getRewardLingshi() != null && reward.getRewardLingshi() > 0) {
            try {
                AssetType lingshiType = assetTypeService.getAssetTypeByCode("LINGSHI");
                if (lingshiType != null) {
                    roleAssetService.updateRoleAsset(roleId, lingshiType.getId(), (long) reward.getRewardLingshi());
                }
            } catch (Exception e) {
                System.err.println("发放灵石奖励失败: " + e.getMessage());
            }
        }
        if (reward.getRewardXiuwei() != null && reward.getRewardXiuwei() > 0) {
            try {
                AssetType xiuweiType = assetTypeService.getAssetTypeByCode("XIUWEI");
                if (xiuweiType != null) {
                    roleAssetService.updateRoleAsset(roleId, xiuweiType.getId(), (long) reward.getRewardXiuwei());
                }
            } catch (Exception e) {
                System.err.println("发放修为奖励失败: " + e.getMessage());
            }
        }

        result.put("success", true);
        result.put("message", "领取成功：+" + reward.getRewardLingshi() + "灵石 +" + reward.getRewardXiuwei() + "修为");
        return result;
    }

    private void distributeActivityRewards(Long roleId, String rewardsJson) {
        try {
            String[] rewardEntries = rewardsJson.split(";");
            for (String entry : rewardEntries) {
                String[] parts = entry.split(":");
                if (parts.length >= 2) {
                    String code = parts[0].trim().toUpperCase();
                    int qty = Integer.parseInt(parts[1].trim());
                    AssetType assetType = assetTypeService.getAssetTypeByCode(code);
                    if (assetType != null) {
                        roleAssetService.updateRoleAsset(roleId, assetType.getId(), (long) qty);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("解析活动奖励失败: " + e.getMessage());
        }
    }
}
