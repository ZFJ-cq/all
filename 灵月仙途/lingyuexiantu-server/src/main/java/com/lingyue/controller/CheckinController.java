package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.GameRole;
import com.lingyue.entity.RoleCheckin;
import com.lingyue.repository.RoleCheckinRepository;
import com.lingyue.service.GameRoleService;
import com.lingyue.service.RewardService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/checkin")
public class CheckinController {
    
    private final RewardService rewardService;
    private final GameRoleService gameRoleService;
    private final RoleCheckinRepository roleCheckinRepository;
    
    public CheckinController(RewardService rewardService, 
                            GameRoleService gameRoleService,
                            RoleCheckinRepository roleCheckinRepository) {
        this.rewardService = rewardService;
        this.gameRoleService = gameRoleService;
        this.roleCheckinRepository = roleCheckinRepository;
    }
    
    /**
     * 获取月度签到状态
     * GET /checkin/monthly/{roleId}
     */
    @GetMapping("/monthly/{roleId}")
    public Map<String, Object> getMonthlyCheckinStatus(@PathVariable Long roleId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            LocalDate now = LocalDate.now();
            int year = now.getYear();
            int month = now.getMonthValue();
            
            // 先删除可能存在的重复记录
            var existingCheckins = roleCheckinRepository.findAll().stream()
                .filter(rc -> rc.getRoleId().equals(roleId) && rc.getYear().equals(year) && rc.getMonth().equals(month))
                .toList();
            if (existingCheckins.size() > 1) {
                roleCheckinRepository.deleteAll(existingCheckins.subList(1, existingCheckins.size()));
            }
            
            Optional<RoleCheckin> checkinOpt = roleCheckinRepository.findByRoleIdAndYearAndMonth(roleId, year, month);
            
            Map<String, Object> data = new HashMap<>();
            data.put("year", year);
            data.put("month", month);
            data.put("roleId", roleId);
            
            int currentDay = now.getDayOfMonth();
            
            if (checkinOpt.isPresent()) {
                RoleCheckin checkin = checkinOpt.get();
                List<Integer> checkinDays = parseCheckinDays(checkin.getCheckinDays());
                data.put("checkinDays", checkinDays);
                data.put("continuousDays", checkin.getContinuousDays());
                data.put("totalDays", checkin.getTotalDays());
                data.put("supplementCount", checkin.getSupplementCount());
                data.put("lastCheckinDate", checkin.getLastCheckinDate());
                
                // 检查今日是否已签到
                boolean todayChecked = checkinDays.contains(currentDay);
                data.put("todayChecked", todayChecked);
            } else {
                data.put("checkinDays", new ArrayList<Integer>());
                data.put("continuousDays", 0);
                data.put("totalDays", 0);
                data.put("supplementCount", 0);
                data.put("todayChecked", false);
            }
            
            YearMonth yearMonth = YearMonth.of(year, month);
            data.put("daysInMonth", yearMonth.lengthOfMonth());
            
            result.put("code", 200);
            result.put("message", "success");
            result.put("data", data);
            
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("message", "获取签到状态失败：" + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 执行签到
     * POST /checkin/do
     */
    @PostMapping("/do")
    public Map<String, Object> doCheckin(@RequestBody Map<String, Object> request) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Long roleId = Long.parseLong(request.get("roleId").toString());
            
            GameRole role = gameRoleService.getRoleById(roleId);
            if (role == null) {
                result.put("code", 404);
                result.put("message", "角色不存在");
                return result;
            }
            
            LocalDate now = LocalDate.now();
            int year = now.getYear();
            int month = now.getMonthValue();
            int day = now.getDayOfMonth();
            
            // 先删除可能存在的重复记录
            var existingCheckins = roleCheckinRepository.findAll().stream()
                .filter(rc -> rc.getRoleId().equals(roleId) && rc.getYear().equals(year) && rc.getMonth().equals(month))
                .toList();
            if (existingCheckins.size() > 1) {
                roleCheckinRepository.deleteAll(existingCheckins.subList(1, existingCheckins.size()));
            }
            
            RoleCheckin checkin = roleCheckinRepository.findByRoleIdAndYearAndMonth(roleId, year, month)
                    .orElse(createNewCheckin(roleId, year, month));
            
            String checkinDaysStr = checkin.getCheckinDays();
            String[] days;
            if (checkinDaysStr == null || checkinDaysStr.trim().isEmpty()) {
                days = new String[31];
                for (int i = 0; i < 31; i++) {
                    days[i] = "0";
                }
            } else {
                String[] tempDays = checkinDaysStr.split(",");
                days = new String[31];
                for (int i = 0; i < 31; i++) {
                    if (i < tempDays.length && tempDays[i] != null && !tempDays[i].trim().isEmpty()) {
                        days[i] = tempDays[i].trim();
                    } else {
                        days[i] = "0";
                    }
                }
            }
            
            if (days.length >= day && !"0".equals(days[day - 1])) {
                result.put("code", 400);
                result.put("message", "今日已签到");
                return result;
            }
            
            if (days.length < day) {
                days = Arrays.copyOf(days, day);
            }
            
            days[day - 1] = "1";
            checkin.setCheckinDays(String.join(",", days));
            checkin.setLastCheckinDate(now);
            
            int continuousDays = calculateContinuousDays(days, day);
            checkin.setContinuousDays(continuousDays);
            checkin.setTotalDays(checkin.getTotalDays() + 1);
            
            roleCheckinRepository.save(checkin);
            
            Map<String, Integer> resourceRewards = getResourceRewards(day, continuousDays);
            List<Map<String, Object>> itemRewards = getItemRewards(day, continuousDays);
            
            String title = "签到奖励 - 第" + day + "天";
            String content = "感谢您的每日签到，连续签到" + continuousDays + "天！";
            
            Map<String, Object> rewardResult = rewardService.distributeRewards(
                roleId, role.getUserId(), title, content, itemRewards, resourceRewards);
            
            Map<String, Object> data = new HashMap<>();
            data.put("day", day);
            data.put("continuousDays", continuousDays);
            data.put("rewards", rewardResult);
            
            result.put("code", 200);
            result.put("message", "签到成功");
            result.put("data", data);
            
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("message", "签到失败：" + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 补签
     * POST /checkin/supplement
     */
    @PostMapping("/supplement")
    public Map<String, Object> supplementCheckin(@RequestBody Map<String, Object> request) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Long roleId = Long.parseLong(request.get("roleId").toString());
            int supplementDay = Integer.parseInt(request.get("day").toString());
            
            GameRole role = gameRoleService.getRoleById(roleId);
            if (role == null) {
                result.put("code", 404);
                result.put("message", "角色不存在");
                return result;
            }
            
            LocalDate now = LocalDate.now();
            int year = now.getYear();
            int month = now.getMonthValue();
            
            // 先删除可能存在的重复记录
            var existingCheckins = roleCheckinRepository.findAll().stream()
                .filter(rc -> rc.getRoleId().equals(roleId) && rc.getYear().equals(year) && rc.getMonth().equals(month))
                .toList();
            if (existingCheckins.size() > 1) {
                roleCheckinRepository.deleteAll(existingCheckins.subList(1, existingCheckins.size()));
            }
            
            RoleCheckin checkin = roleCheckinRepository.findByRoleIdAndYearAndMonth(roleId, year, month)
                    .orElse(null);
            
            if (checkin == null) {
                result.put("code", 400);
                result.put("message", "没有签到记录，无法补签");
                return result;
            }
            
            if (checkin.getSupplementCount() >= 3) {
                result.put("code", 400);
                result.put("message", "本月补签次数已达上限（3 次）");
                return result;
            }
            
            String checkinDaysStr = checkin.getCheckinDays();
            String[] days;
            if (checkinDaysStr == null || checkinDaysStr.trim().isEmpty()) {
                days = new String[31];
                for (int i = 0; i < 31; i++) {
                    days[i] = "0";
                }
            } else {
                String[] tempDays = checkinDaysStr.split(",");
                days = new String[31];
                for (int i = 0; i < 31; i++) {
                    if (i < tempDays.length && tempDays[i] != null && !tempDays[i].trim().isEmpty()) {
                        days[i] = tempDays[i].trim();
                    } else {
                        days[i] = "0";
                    }
                }
            }
            
            if (supplementDay > now.getDayOfMonth()) {
                result.put("code", 400);
                result.put("message", "不能补签未来的日期");
                return result;
            }
            
            if (days.length >= supplementDay && !days[supplementDay - 1].equals("0")) {
                result.put("code", 400);
                result.put("message", "该日已签到，无需补签");
                return result;
            }
            
            if (days.length < supplementDay) {
                days = Arrays.copyOf(days, supplementDay);
            }
            
            days[supplementDay - 1] = "2";
            checkin.setCheckinDays(String.join(",", days));
            checkin.setSupplementCount(checkin.getSupplementCount() + 1);
            checkin.setTotalDays(checkin.getTotalDays() + 1);
            
            roleCheckinRepository.save(checkin);
            
            Map<String, Integer> resourceRewards = getResourceRewards(supplementDay, 0);
            resourceRewards.replaceAll((k, v) -> v / 2);
            
            String title = "补签奖励 - 第" + supplementDay + "天";
            String content = "补签奖励（50%）";
            
            Map<String, Object> rewardResult = rewardService.distributeRewards(
                roleId, role.getUserId(), title, content, new ArrayList<>(), resourceRewards);
            
            Map<String, Object> data = new HashMap<>();
            data.put("day", supplementDay);
            data.put("supplementCount", checkin.getSupplementCount());
            data.put("rewards", rewardResult);
            
            result.put("code", 200);
            result.put("message", "补签成功");
            result.put("data", data);
            
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("message", "补签失败：" + e.getMessage());
        }
        
        return result;
    }
    
    // ========== 辅助方法 ==========
    
    private RoleCheckin createNewCheckin(Long roleId, int year, int month) {
        RoleCheckin checkin = new RoleCheckin();
        checkin.setRoleId(roleId);
        checkin.setYear(year);
        checkin.setMonth(month);
        checkin.setCheckinDays("");
        checkin.setContinuousDays(0);
        checkin.setTotalDays(0);
        checkin.setSupplementCount(0);
        checkin.setCreateTime(LocalDate.now());
        return roleCheckinRepository.save(checkin);
    }
    
    private List<Integer> parseCheckinDays(String checkinDays) {
        if (checkinDays == null || checkinDays.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        List<Integer> days = new ArrayList<>();
        for (String day : checkinDays.split(",")) {
            if (day != null && !day.trim().isEmpty()) {
                try {
                    days.add(Integer.parseInt(day.trim()));
                } catch (NumberFormatException e) {
                    days.add(0);
                }
            } else {
                days.add(0);
            }
        }
        return days;
    }
    
    private int calculateContinuousDays(String[] days, int currentDay) {
        int continuous = 0;
        for (int i = currentDay - 1; i >= 0; i--) {
            if (i < days.length && days[i] != null && !"0".equals(days[i])) {
                continuous++;
            } else {
                break;
            }
        }
        return continuous;
    }
    
    private Map<String, Integer> getResourceRewards(int day, int continuousDays) {
        Map<String, Integer> rewards = new HashMap<>();
        
        rewards.put("lingshi", 50);
        rewards.put("xiuwei", 200);
        
        if (day == 1) {
            rewards.put("lingshi", 100);
            rewards.put("xiuwei", 500);
        } else if (day == 7) {
            rewards.put("lingshi", 500);
            rewards.put("xiuwei", 2000);
            rewards.put("hunshi", 50);
        } else if (day == 15) {
            rewards.put("lingshi", 1000);
            rewards.put("xiuwei", 5000);
            rewards.put("hunshi", 100);
        } else if (day == 30) {
            rewards.put("lingshi", 2000);
            rewards.put("xiuwei", 10000);
            rewards.put("hunshi", 200);
        }
        
        if (continuousDays >= 7) {
            rewards.put("lingshi", rewards.getOrDefault("lingshi", 0) + 100);
            rewards.put("xiuwei", rewards.getOrDefault("xiuwei", 0) + 500);
        }
        
        return rewards;
    }
    
    private List<Map<String, Object>> getItemRewards(int day, int continuousDays) {
        List<Map<String, Object>> items = new ArrayList<>();
        
        if (day == 7 || day == 15 || day == 30) {
            Map<String, Object> item = new HashMap<>();
            item.put("itemId", 1L);
            item.put("quantity", 1);
            items.add(item);
        }
        
        return items;
    }
    
    /**
     * 获取签到奖励配置
     * GET /checkin/rewards
     */
    @GetMapping("/rewards")
    public Map<String, Object> getCheckinRewards() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Map<String, Map<String, Object>> rewards = new HashMap<>();
            
            // 第1天奖励
            Map<String, Object> day1 = new HashMap<>();
            day1.put("lingshi", 100);
            day1.put("xiuwei", 500);
            day1.put("isBigReward", true);
            rewards.put("1", day1);
            
            // 第7天奖励
            Map<String, Object> day7 = new HashMap<>();
            day7.put("lingshi", 500);
            day7.put("xiuwei", 2000);
            day7.put("hunshi", 50);
            day7.put("isBigReward", true);
            rewards.put("7", day7);
            
            // 第15天奖励
            Map<String, Object> day15 = new HashMap<>();
            day15.put("lingshi", 1000);
            day15.put("xiuwei", 5000);
            day15.put("hunshi", 100);
            day15.put("isBigReward", true);
            rewards.put("15", day15);
            
            // 第30天奖励
            Map<String, Object> day30 = new HashMap<>();
            day30.put("lingshi", 2000);
            day30.put("xiuwei", 10000);
            day30.put("hunshi", 200);
            day30.put("isBigReward", true);
            rewards.put("30", day30);
            
            // 其他天奖励
            for (int i = 2; i <= 29; i++) {
                if (i != 7 && i != 15) {
                    Map<String, Object> dayReward = new HashMap<>();
                    dayReward.put("lingshi", 50);
                    dayReward.put("xiuwei", 200);
                    dayReward.put("isBigReward", false);
                    rewards.put(String.valueOf(i), dayReward);
                }
            }
            
            result.put("code", 200);
            result.put("message", "success");
            result.put("data", rewards);
            
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("message", "获取签到奖励配置失败：" + e.getMessage());
        }
        
        return result;
    }
}
