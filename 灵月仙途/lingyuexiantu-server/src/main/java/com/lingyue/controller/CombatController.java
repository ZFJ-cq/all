package com.lingyue.controller;

import com.lingyuexiantu.common.Result;
import com.lingyue.entity.BattleRecord;
import com.lingyue.entity.GameRole;
import com.lingyue.entity.RoleAttributeCache;
import com.lingyue.entity.ResourceType;
import com.lingyue.repository.BattleRecordRepository;
import com.lingyue.service.AttributeCalculatorService;
import com.lingyue.service.GameRoleService;
import com.lingyue.service.ResourceTypeService;
import com.lingyue.service.RoleAssetService;
import com.lingyue.service.RoleResourceService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/combat")
public class CombatController {
    
    private static final Logger logger = LoggerFactory.getLogger(CombatController.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int MAX_BATTLE_RECORDS_PER_HOUR = 60;
    
    private final GameRoleService gameRoleService;
    private final RoleResourceService roleResourceService;
    private final ResourceTypeService resourceTypeService;
    private final AttributeCalculatorService attributeCalculatorService;
    private final RoleAssetService roleAssetService;
    private final BattleRecordRepository battleRecordRepository;
    
    public CombatController(GameRoleService gameRoleService, 
                           RoleResourceService roleResourceService,
                           ResourceTypeService resourceTypeService,
                           AttributeCalculatorService attributeCalculatorService,
                           RoleAssetService roleAssetService,
                           BattleRecordRepository battleRecordRepository) {
        this.gameRoleService = gameRoleService;
        this.roleResourceService = roleResourceService;
        this.resourceTypeService = resourceTypeService;
        this.attributeCalculatorService = attributeCalculatorService;
        this.roleAssetService = roleAssetService;
        this.battleRecordRepository = battleRecordRepository;
    }
    
    @PostMapping("/simulate")
    @Transactional(rollbackFor = Exception.class)
    public Result<Map<String, Object>> simulateCombat(@RequestBody Map<String, Object> request,
                                                       HttpServletRequest httpRequest) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Long roleId = request.get("roleId") != null ? Long.parseLong(request.get("roleId").toString()) : null;
            String enemyType = request.get("enemyType") != null ? request.get("enemyType").toString() : "default";
            
            if (roleId == null || roleId <= 0) {
                return Result.error("角色 ID 无效");
            }
            
            GameRole role = gameRoleService.getRoleById(roleId);
            if (role == null) {
                return Result.error("角色不存在");
            }
            
            long recentBattles = battleRecordRepository.countRecentBattles(roleId, 
                java.time.LocalDateTime.now().minusHours(1));
            if (recentBattles >= MAX_BATTLE_RECORDS_PER_HOUR) {
                return Result.error("战斗次数已达上限，请稍后再试");
            }
            
            RoleAttributeCache attrs = attributeCalculatorService.getAttributes(roleId, true);
            
            int roleHp, roleAttack, roleDefense, roleSpeed;
            double roleCritRate, roleDodgeRate;
            
            if (attrs != null) {
                roleHp = (int)(attrs.getHpMax() != null ? attrs.getHpMax() : 100);
                roleAttack = (int)(attrs.getAtk() != null ? attrs.getAtk() : 10);
                roleDefense = (int)(attrs.getDef() != null ? attrs.getDef() : 5);
                roleSpeed = (int)(attrs.getSpeed() != null ? attrs.getSpeed() : 10);
                roleCritRate = attrs.getCritRate() != null ? attrs.getCritRate().doubleValue() : 5.0;
                roleDodgeRate = attrs.getDodgeRate() != null ? attrs.getDodgeRate().doubleValue() : 0.0;
            } else {
                roleHp = role.getHp() != null ? role.getHp() : 100;
                roleAttack = 50 + (role.getLevel() != null ? role.getLevel() : 1) * 5;
                roleDefense = 20 + (role.getLevel() != null ? role.getLevel() : 1) * 2;
                roleSpeed = 10;
                roleCritRate = 5.0;
                roleDodgeRate = 0.0;
            }
            
            Map<String, Object> enemyStats = getEnemyStats(enemyType);
            int enemyHp = (int) enemyStats.get("hp");
            int enemyAttack = (int) enemyStats.get("attack");
            int enemyDefense = (int) enemyStats.get("defense");
            
            int originalRoleHp = roleHp;
            int originalEnemyHp = enemyHp;
            boolean victory = false;
            int rounds = 0;
            StringBuilder combatLog = new StringBuilder();
            
            while (roleHp > 0 && enemyHp > 0) {
                rounds++;
                boolean isCrit = RANDOM.nextDouble() * 100 < roleCritRate;
                int damage = Math.max(1, roleAttack - enemyDefense + RANDOM.nextInt(10));
                if (isCrit) damage = (int)(damage * 1.5);
                enemyHp -= damage;
                combatLog.append("你造成").append(damage).append(isCrit ? "(暴击)" : "").append("点伤害；");
                
                if (enemyHp <= 0) { victory = true; break; }
                
                boolean isDodge = RANDOM.nextDouble() * 100 < roleDodgeRate;
                if (isDodge) {
                    combatLog.append("你闪避了攻击；");
                } else {
                    int enemyDmg = Math.max(1, enemyAttack - roleDefense + RANDOM.nextInt(5));
                    roleHp -= enemyDmg;
                    combatLog.append("敌人造成").append(enemyDmg).append("点伤害；");
                }
            }
            
            int xiuweiChange = 0;
            int lingshiChange = 0;
            int hunshiChange = 0;
            
            if (victory) {
                Map<String, Integer> rewards = calculateRewards(enemyType);
                
                try {
                    for (Map.Entry<String, Integer> entry : rewards.entrySet()) {
                        String code = entry.getKey().toUpperCase();
                        if ("XIUWEI".equals(code)) {
                            ResourceType rt = resourceTypeService.getResourceTypeByCode(entry.getKey());
                            if (rt != null) {
                                roleResourceService.addResource(roleId, rt.getId(), entry.getValue());
                                xiuweiChange = entry.getValue();
                            }
                        } else if ("LINGSHI".equals(code)) {
                            ResourceType rt = resourceTypeService.getResourceTypeByCode(entry.getKey());
                            if (rt != null) {
                                roleResourceService.addResource(roleId, rt.getId(), entry.getValue());
                                lingshiChange = entry.getValue();
                            }
                        } else if ("HUNSHI".equals(code)) {
                            ResourceType rt = resourceTypeService.getResourceTypeByCode(entry.getKey());
                            if (rt != null) {
                                roleResourceService.addResource(roleId, rt.getId(), entry.getValue());
                                hunshiChange = entry.getValue();
                            }
                        }
                    }
                } catch (Exception e) {
                    logger.error("发放战斗奖励失败: {}", e.getMessage());
                }
                
                result.put("success", true);
                result.put("message", "战斗胜利");
                result.put("victory", true);
                result.put("rewards", rewards);
            } else {
                int penalty = 50 + RANDOM.nextInt(100);
                try {
                    ResourceType xiuweiType = resourceTypeService.getResourceTypeByCode("xiuwei");
                    if (xiuweiType != null) {
                        roleResourceService.addResource(roleId, xiuweiType.getId(), -penalty);
                        xiuweiChange = -penalty;
                    }
                } catch (Exception e) {
                    logger.error("扣除修为失败: {}", e.getMessage());
                }
                
                result.put("success", true);
                result.put("message", "战斗失败");
                result.put("victory", false);
                result.put("penalty", "损失" + penalty + "修为");
            }
            
            saveBattleRecord(role, enemyType, victory, originalRoleHp, roleAttack, roleDefense,
                originalEnemyHp, enemyAttack, enemyDefense, rounds,
                xiuweiChange, lingshiChange, hunshiChange, combatLog.toString(), httpRequest);
            
            Map<String, Object> combatDetails = new HashMap<>();
            combatDetails.put("roleLevel", role.getLevel());
            combatDetails.put("roleRealm", role.getRealm());
            combatDetails.put("roleHp", originalRoleHp);
            combatDetails.put("roleAttack", roleAttack);
            combatDetails.put("roleDefense", roleDefense);
            combatDetails.put("roleSpeed", roleSpeed);
            combatDetails.put("roleCritRate", roleCritRate);
            combatDetails.put("roleDodgeRate", roleDodgeRate);
            combatDetails.put("enemyHp", enemyStats.get("hp"));
            combatDetails.put("enemyAttack", enemyStats.get("attack"));
            combatDetails.put("enemyDefense", enemyStats.get("defense"));
            combatDetails.put("victory", victory);
            combatDetails.put("rounds", rounds);
            combatDetails.put("combatLog", combatLog.toString());
            result.put("combatDetails", combatDetails);
            
            return Result.success(result);
            
        } catch (NumberFormatException e) {
            return Result.error("参数格式错误");
        } catch (Exception e) {
            logger.error("战斗失败: {}", e.getMessage(), e);
            return Result.error("战斗失败：" + e.getMessage());
        }
    }
    
    @PostMapping("/result")
    @Transactional(rollbackFor = Exception.class)
    public Result<Map<String, Object>> reportCombatResult(@RequestBody Map<String, Object> request,
                                                           HttpServletRequest httpRequest) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Long roleId = request.get("roleId") != null ? Long.parseLong(request.get("roleId").toString()) : null;
            Boolean victory = request.get("victory") != null ? Boolean.parseBoolean(request.get("victory").toString()) : null;
            String enemyType = request.get("enemyType") != null ? request.get("enemyType").toString() : "default";
            String enemyName = request.get("enemyName") != null ? request.get("enemyName").toString() : null;
            Integer rounds = request.get("rounds") != null ? Integer.parseInt(request.get("rounds").toString()) : 1;
            Integer expAmount = request.get("expAmount") != null ? Integer.parseInt(request.get("expAmount").toString()) : 0;
            Integer spiritStonesChange = request.get("spiritStonesChange") != null ? 
                Integer.parseInt(request.get("spiritStonesChange").toString()) : 0;
            
            if (roleId == null || roleId <= 0) {
                return Result.error("角色 ID 无效");
            }
            if (victory == null) {
                return Result.error("战斗结果不能为空");
            }
            
            GameRole role = gameRoleService.getRoleById(roleId);
            if (role == null) {
                return Result.error("角色不存在");
            }
            
            long recentBattles = battleRecordRepository.countRecentBattles(roleId, 
                java.time.LocalDateTime.now().minusHours(1));
            if (recentBattles >= MAX_BATTLE_RECORDS_PER_HOUR) {
                return Result.error("战斗次数已达上限，请稍后再试");
            }
            
            int xiuweiChange = 0;
            int lingshiChange = 0;
            
            if (victory) {
                if (expAmount > 0) {
                    try {
                        ResourceType xiuweiType = resourceTypeService.getResourceTypeByCode("xiuwei");
                        if (xiuweiType != null) {
                            int cappedExp = Math.min(expAmount, 5000);
                            roleResourceService.addResource(roleId, xiuweiType.getId(), cappedExp);
                            xiuweiChange = cappedExp;
                        }
                    } catch (Exception e) {
                        logger.error("发放战斗修为失败: {}", e.getMessage());
                    }
                }
                if (spiritStonesChange > 0) {
                    try {
                        ResourceType lingshiType = resourceTypeService.getResourceTypeByCode("lingshi");
                        if (lingshiType != null) {
                            int cappedLingshi = Math.min(spiritStonesChange, 2000);
                            roleResourceService.addResource(roleId, lingshiType.getId(), cappedLingshi);
                            lingshiChange = cappedLingshi;
                        }
                    } catch (Exception e) {
                        logger.error("发放战斗灵石失败: {}", e.getMessage());
                    }
                }
            } else {
                if (spiritStonesChange < 0) {
                    try {
                        ResourceType lingshiType = resourceTypeService.getResourceTypeByCode("lingshi");
                        if (lingshiType != null) {
                            int penalty = Math.min(Math.abs(spiritStonesChange), 500);
                            roleResourceService.addResource(roleId, lingshiType.getId(), -penalty);
                            lingshiChange = -penalty;
                        }
                    } catch (Exception e) {
                        logger.error("扣除灵石失败: {}", e.getMessage());
                    }
                }
            }
            
            RoleAttributeCache attrs = attributeCalculatorService.getAttributes(roleId, false);
            int roleHp = 0, roleAttack = 0, roleDefense = 0;
            if (attrs != null) {
                roleHp = attrs.getHpMax() != null ? attrs.getHpMax().intValue() : 0;
                roleAttack = attrs.getAtk() != null ? attrs.getAtk().intValue() : 0;
                roleDefense = attrs.getDef() != null ? attrs.getDef().intValue() : 0;
            }
            
            BattleRecord record = new BattleRecord();
            record.setRoleId(roleId);
            record.setRoleName(role.getRoleName());
            record.setEnemyType(enemyType);
            record.setEnemyName(enemyName);
            record.setVictory(victory);
            record.setRoleHp(roleHp);
            record.setRoleAttack(roleAttack);
            record.setRoleDefense(roleDefense);
            record.setRounds(rounds);
            record.setXiuweiChange(xiuweiChange);
            record.setLingshiChange(lingshiChange);
            record.setIpAddress(getClientIp(httpRequest));
            battleRecordRepository.save(record);
            
            result.put("success", true);
            result.put("victory", victory);
            result.put("xiuweiChange", xiuweiChange);
            result.put("lingshiChange", lingshiChange);
            result.put("message", victory ? "战斗胜利" : "战斗失败");
            
            return Result.success(result);
            
        } catch (NumberFormatException e) {
            return Result.error("参数格式错误");
        } catch (Exception e) {
            logger.error("保存战斗结果失败: {}", e.getMessage(), e);
            return Result.error("保存战斗结果失败：" + e.getMessage());
        }
    }
    
    @GetMapping("/history/{roleId}")
    public Result<Map<String, Object>> getBattleHistory(@PathVariable Long roleId,
                                                         @RequestParam(defaultValue = "20") int limit) {
        try {
            List<BattleRecord> records = battleRecordRepository.findByRoleIdOrderByCreateTimeDesc(roleId);
            if (records.size() > limit) {
                records = records.subList(0, limit);
            }
            
            long totalBattles = battleRecordRepository.countByRoleIdAndVictory(roleId, null);
            long wins = battleRecordRepository.countByRoleIdAndVictory(roleId, true);
            long losses = battleRecordRepository.countByRoleIdAndVictory(roleId, false);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("records", records);
            result.put("totalBattles", totalBattles);
            result.put("wins", wins);
            result.put("losses", losses);
            result.put("winRate", totalBattles > 0 ? String.format("%.1f%%", wins * 100.0 / totalBattles) : "0%");
            
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("获取战斗记录失败");
        }
    }
    
    @GetMapping("/enemy/{enemyType}")
    public Result<Map<String, Object>> getEnemyInfo(@PathVariable String enemyType) {
        Map<String, Object> result = new HashMap<>();
        result.put("enemyType", enemyType);
        result.put("stats", getEnemyStats(enemyType));
        result.put("rewards", calculateRewards(enemyType));
        return Result.success(result);
    }
    
    @GetMapping("/player-stats/{roleId}")
    public Result<Map<String, Object>> getPlayerCombatStats(@PathVariable Long roleId) {
        try {
            GameRole role = gameRoleService.getRoleById(roleId);
            if (role == null) return Result.error("角色不存在");
            
            RoleAttributeCache attrs = attributeCalculatorService.getAttributes(roleId, false);
            Map<String, Object> stats = new HashMap<>();
            
            if (attrs != null) {
                stats.put("hp", attrs.getHpMax());
                stats.put("mp", attrs.getMpMax());
                stats.put("attack", attrs.getAtk());
                stats.put("defense", attrs.getDef());
                stats.put("speed", attrs.getSpeed());
                stats.put("critRate", attrs.getCritRate());
                stats.put("dodgeRate", attrs.getDodgeRate());
                stats.put("expBonus", attrs.getExpBonus());
            } else {
                stats.put("hp", role.getHp() != null ? role.getHp() : 100);
                stats.put("mp", role.getMp() != null ? role.getMp() : 80);
                stats.put("attack", 10);
                stats.put("defense", 5);
                stats.put("speed", 10);
                stats.put("critRate", 5.0);
                stats.put("dodgeRate", 0.0);
                stats.put("expBonus", 1.0);
            }
            
            stats.put("realm", role.getRealm());
            stats.put("level", role.getLevel());
            return Result.success(stats);
        } catch (Exception e) {
            return Result.error("获取战斗属性失败");
        }
    }
    
    private void saveBattleRecord(GameRole role, String enemyType, boolean victory,
                                   int roleHp, int roleAttack, int roleDefense,
                                   int enemyHp, int enemyAttack, int enemyDefense,
                                   int rounds, int xiuweiChange, int lingshiChange, int hunshiChange,
                                   String combatLog, HttpServletRequest httpRequest) {
        try {
            BattleRecord record = new BattleRecord();
            record.setRoleId(role.getId());
            record.setRoleName(role.getRoleName());
            record.setEnemyType(enemyType);
            record.setVictory(victory);
            record.setRoleHp(roleHp);
            record.setRoleAttack(roleAttack);
            record.setRoleDefense(roleDefense);
            record.setEnemyHp(enemyHp);
            record.setEnemyAttack(enemyAttack);
            record.setEnemyDefense(enemyDefense);
            record.setRounds(rounds);
            record.setXiuweiChange(xiuweiChange);
            record.setLingshiChange(lingshiChange);
            record.setHunshiChange(hunshiChange);
            record.setCombatLog(combatLog.length() > 2000 ? combatLog.substring(0, 2000) : combatLog);
            record.setIpAddress(getClientIp(httpRequest));
            battleRecordRepository.save(record);
        } catch (Exception e) {
            logger.error("保存战斗记录失败: {}", e.getMessage());
        }
    }
    
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
    
    private Map<String, Object> getEnemyStats(String enemyType) {
        Map<String, Object> stats = new HashMap<>();
        
        switch (enemyType.toLowerCase()) {
            case "goblin":
                stats.put("hp", 100);
                stats.put("attack", 20);
                stats.put("defense", 5);
                break;
            case "orc":
                stats.put("hp", 200);
                stats.put("attack", 30);
                stats.put("defense", 10);
                break;
            case "dragon":
                stats.put("hp", 500);
                stats.put("attack", 50);
                stats.put("defense", 20);
                break;
            case "boss":
                stats.put("hp", 1000);
                stats.put("attack", 80);
                stats.put("defense", 30);
                break;
            default:
                stats.put("hp", 50);
                stats.put("attack", 10);
                stats.put("defense", 2);
        }
        
        return stats;
    }
    
    private Map<String, Integer> calculateRewards(String enemyType) {
        Map<String, Integer> rewards = new HashMap<>();
        
        switch (enemyType.toLowerCase()) {
            case "goblin":
                rewards.put("xiuwei", 50 + RANDOM.nextInt(50));
                rewards.put("lingshi", 10 + RANDOM.nextInt(10));
                break;
            case "orc":
                rewards.put("xiuwei", 100 + RANDOM.nextInt(100));
                rewards.put("lingshi", 20 + RANDOM.nextInt(20));
                rewards.put("hunshi", 5 + RANDOM.nextInt(5));
                break;
            case "dragon":
                rewards.put("xiuwei", 300 + RANDOM.nextInt(200));
                rewards.put("lingshi", 50 + RANDOM.nextInt(50));
                rewards.put("hunshi", 20 + RANDOM.nextInt(10));
                break;
            case "boss":
                rewards.put("xiuwei", 1000 + RANDOM.nextInt(500));
                rewards.put("lingshi", 200 + RANDOM.nextInt(100));
                rewards.put("hunshi", 50 + RANDOM.nextInt(30));
                break;
            default:
                rewards.put("xiuwei", 20 + RANDOM.nextInt(30));
                rewards.put("lingshi", 5 + RANDOM.nextInt(5));
        }
        
        return rewards;
    }
}
