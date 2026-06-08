package com.lingyue.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lingyue.dto.AssetUpdateRequest;
import com.lingyue.entity.AssetType;
import com.lingyue.entity.CfgRealmAttributeMult;
import com.lingyue.entity.GameRole;
import com.lingyue.entity.RoleRealm;
import com.lingyue.entity.SystemSetting;
import com.lingyue.repository.CfgRealmAttributeMultRepository;
import com.lingyue.repository.GameRoleRepository;
import com.lingyue.repository.RoleRealmRepository;
import com.lingyue.service.AssetTypeService;
import com.lingyue.service.GameRoleService;
import com.lingyue.service.RewardService;
import com.lingyue.service.RoleAssetService;
import com.lingyue.service.RoleStatsService;
import com.lingyue.service.SystemSettingService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;

@Service
public class GameRoleServiceImpl implements GameRoleService {
    
    private final GameRoleRepository roleRepository;
    private final RoleAssetService roleAssetService;
    private final AssetTypeService assetTypeService;
    private final RewardService rewardService;
    private final SystemSettingService systemSettingService;
    private final RoleStatsService roleStatsService;
    private final CfgRealmAttributeMultRepository cfgRealmAttributeMultRepository;
    private final RoleRealmRepository roleRealmRepository;
    private final ObjectMapper objectMapper;
    private final RedisCacheServiceImpl redisCacheService;
    
    public GameRoleServiceImpl(GameRoleRepository roleRepository, RoleAssetService roleAssetService, AssetTypeService assetTypeService, RewardService rewardService, SystemSettingService systemSettingService, RoleStatsService roleStatsService, CfgRealmAttributeMultRepository cfgRealmAttributeMultRepository, RoleRealmRepository roleRealmRepository, RedisCacheServiceImpl redisCacheService) {
        this.roleRepository = roleRepository;
        this.roleAssetService = roleAssetService;
        this.assetTypeService = assetTypeService;
        this.rewardService = rewardService;
        this.systemSettingService = systemSettingService;
        this.roleStatsService = roleStatsService;
        this.cfgRealmAttributeMultRepository = cfgRealmAttributeMultRepository;
        this.roleRealmRepository = roleRealmRepository;
        this.objectMapper = new ObjectMapper();
        this.redisCacheService = redisCacheService;
    }

    private CfgRealmAttributeMult getRealmConfig(String realmName) {
        if (realmName == null) {
            return null;
        }
        try {
            return cfgRealmAttributeMultRepository.findByRealmName(realmName).orElse(null);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    private String resolveRealmName(Long roleId, GameRole role) {
        try {
            RoleRealm roleRealm = roleRealmRepository.findByRoleId(roleId);
            if (roleRealm != null && roleRealm.getRealmName() != null) {
                return normalizeRealmName(roleRealm.getRealmName());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return role != null ? normalizeRealmName(role.getRealm()) : null;
    }
    
    private String normalizeRealmName(String realmName) {
        if (realmName == null) {
            return "凡人";
        }
        if ("无修为".equals(realmName) || "凡人".equals(realmName)) {
            return "凡人";
        }
        return realmName;
    }
    
    private int getMaxAgeFromRealmConfig(String realmName) {
        if (realmName != null) {
            CfgRealmAttributeMult config = getRealmConfig(realmName);
            if (config != null && config.getMaxAge() != null) {
                return config.getMaxAge();
            }
            if (!realmName.endsWith("期")) {
                config = getRealmConfig(realmName + "期");
                if (config != null && config.getMaxAge() != null) {
                    return config.getMaxAge();
                }
            } else {
                String baseName = realmName.substring(0, realmName.length() - 1);
                config = getRealmConfig(baseName);
                if (config != null && config.getMaxAge() != null) {
                    return config.getMaxAge();
                }
            }
        }
        CfgRealmAttributeMult defaultConfig = getRealmConfig("凡人");
        if (defaultConfig != null && defaultConfig.getMaxAge() != null) {
            return defaultConfig.getMaxAge();
        }
        return 100;
    }

    @Override
    @Transactional
    public GameRole createRole(GameRole role) {
        if (role.getRealm() == null) {
            role.setRealm("凡人");
        }
        if (role.getLevel() == null) {
            role.setLevel(1);
        }
        if (role.getHp() == null) {
            CfgRealmAttributeMult realmConfig = getRealmConfig(role.getRealm());
            if (realmConfig != null && realmConfig.getHpMult() != null) {
                role.setHp((int)(100 * realmConfig.getHpMult().doubleValue()));
            } else {
                role.setHp(100);
            }
        }
        if (role.getMp() == null) {
            CfgRealmAttributeMult realmConfig = getRealmConfig(role.getRealm());
            if (realmConfig != null && realmConfig.getSpiBonus() != null) {
                role.setMp(80 + realmConfig.getSpiBonus());
            } else if (realmConfig != null && realmConfig.getHpMult() != null) {
                role.setMp((int)(80 * realmConfig.getHpMult().doubleValue()));
            } else {
                role.setMp(80);
            }
        }
        if (role.getBodyLevel() == null) {
            role.setBodyLevel("凡人");
        }
        if (role.getStatus() == null) {
            role.setStatus(1);
        }
        if (role.getCreateTime() == null) {
            role.setCreateTime(java.time.LocalDateTime.now());
        }
        if (role.getAge() == null) {
            role.setAge(18);
        }
        if (role.getMaxAge() == null) {
            role.setMaxAge(getMaxAgeFromRealmConfig(role.getRealm()));
        }
        if (role.getLifeStatus() == null) {
            role.setLifeStatus(0);
        }
        if (role.getReincarnationCount() == null) {
            role.setReincarnationCount(0);
        }
        if (role.getCultivationBase() == null) {
            role.setCultivationBase(1.0);
        }
        if (role.getLongevityBonus() == null) {
            role.setLongevityBonus(0);
        }
        
        // 保存角色
        GameRole savedRole = roleRepository.save(role);
        
        // 计算并保存初始基础属性
        try {
            Map<String, Integer> initialStats = roleStatsService.calculateInitialBaseStats(savedRole);
            roleStatsService.updateBaseStats(savedRole.getId(), initialStats);
            System.out.println("角色基础属性初始化成功，roleId: " + savedRole.getId() + "，属性: " + initialStats);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("角色基础属性初始化失败: " + e.getMessage());
        }
        
        // 初始化所有资产类型为0
        try {
            // 获取所有资产类型
            List<AssetType> assetTypes = assetTypeService.getAllAssetTypes();
            
            // 为每种资产类型创建初始化请求
            List<AssetUpdateRequest> updateRequests = new java.util.ArrayList<>();
            for (AssetType assetType : assetTypes) {
                AssetUpdateRequest request = new AssetUpdateRequest();
                request.setAssetTypeId(assetType.getId());
                request.setQuantity(BigDecimal.ZERO);
                updateRequests.add(request);
            }
            
            // 批量更新角色资产
            if (!updateRequests.isEmpty()) {
                roleAssetService.batchUpdateRoleAssets(savedRole.getId(), updateRequests);
            }
        } catch (Exception e) {
            // 记录错误但不影响角色创建
            e.printStackTrace();
        }
        
        // 发送新手礼包邮件
        try {
            sendNewbieGift(savedRole.getUserId(), savedRole.getRoleName());
        } catch (Exception e) {
            // 记录错误但不影响角色创建
            e.printStackTrace();
        }
        
        return savedRole;
    }
    
    /**
     * 发送新手礼包邮件
     */
    private void sendNewbieGift(Long userId, String roleName) {
        try {
            // 获取新手礼包配置
            SystemSetting setting = systemSettingService.getSettingByKey("newbie_gift_config");
            Map<String, Object> config;
            
            if (setting != null && setting.getValue() != null) {
                config = objectMapper.readValue(setting.getValue(), Map.class);
            } else {
                config = getDefaultConfig();
            }
            
            String title = (String) config.getOrDefault("title", "欢迎来到灵月仙途！");
            String content = (String) config.getOrDefault("content", "亲爱的{roleName}道友，欢迎来到灵月仙途！以下是您的新手礼包，祝您修仙之路一帆风顺！");
            content = content.replace("{roleName}", roleName);
            
            List<Map<String, Object>> items = new ArrayList<>();
            
            // 添加固定物品
            List<Map<String, Object>> fixedItems = (List<Map<String, Object>>) config.get("items");
            if (fixedItems != null) {
                for (Map<String, Object> item : fixedItems) {
                    Long itemId = Long.parseLong(item.get("itemId").toString());
                    int quantity = Integer.parseInt(item.getOrDefault("quantity", 1).toString());
                    addItemIfNotNull(items, itemId, quantity);
                }
            }
            
            // 添加随机装备
            Random random = new Random();
            
            List<Integer> randomWeapons = (List<Integer>) config.get("randomWeapons");
            if (randomWeapons != null && !randomWeapons.isEmpty()) {
                Long weaponId = randomWeapons.get(random.nextInt(randomWeapons.size())).longValue();
                addItemIfNotNull(items, weaponId, 1);
            }
            
            List<Integer> randomArmors = (List<Integer>) config.get("randomArmors");
            if (randomArmors != null && !randomArmors.isEmpty()) {
                Long armorId = randomArmors.get(random.nextInt(randomArmors.size())).longValue();
                addItemIfNotNull(items, armorId, 1);
            }
            
            List<Integer> randomAccessories = (List<Integer>) config.get("randomAccessories");
            if (randomAccessories != null && !randomAccessories.isEmpty()) {
                Long accessoryId = randomAccessories.get(random.nextInt(randomAccessories.size())).longValue();
                addItemIfNotNull(items, accessoryId, 1);
            }
            
            // 发送邮件
            rewardService.sendMailWithItems(userId, title, content, items);
        } catch (Exception e) {
            e.printStackTrace();
            // 如果配置解析失败，使用默认配置
            sendDefaultNewbieGift(userId, roleName);
        }
    }
    
    /**
     * 发送默认新手礼包（后备方案）
     */
    private void sendDefaultNewbieGift(Long userId, String roleName) {
        String title = "欢迎来到灵月仙途！";
        String content = "亲爱的" + roleName + "道友，欢迎来到灵月仙途！以下是您的新手礼包，祝您修仙之路一帆风顺！";
        
        List<Map<String, Object>> items = new ArrayList<>();
        
        addItemIfNotNull(items, 1L, 1000);
        addItemIfNotNull(items, 2L, 500);
        addItemIfNotNull(items, 3L, 100);
        addItemIfNotNull(items, 10L, 1);
        addItemIfNotNull(items, 11L, 1);
        addItemIfNotNull(items, 20L, 10);
        addItemIfNotNull(items, 21L, 5);
        addItemIfNotNull(items, 22L, 3);
        
        Random random = new Random();
        Long[] weaponIds = {30L, 31L, 32L};
        Long[] armorIds = {33L, 34L, 35L};
        Long[] accessoryIds = {36L, 37L, 38L};
        
        addItemIfNotNull(items, weaponIds[random.nextInt(weaponIds.length)], 1);
        addItemIfNotNull(items, armorIds[random.nextInt(armorIds.length)], 1);
        addItemIfNotNull(items, accessoryIds[random.nextInt(accessoryIds.length)], 1);
        
        rewardService.sendMailWithItems(userId, title, content, items);
    }
    
    /**
     * 获取默认配置
     */
    private Map<String, Object> getDefaultConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("title", "欢迎来到灵月仙途！");
        config.put("content", "亲爱的{roleName}道友，欢迎来到灵月仙途！以下是您的新手礼包，祝您修仙之路一帆风顺！");
        
        List<Map<String, Object>> items = new ArrayList<>();
        addItemToList(items, 1L, 1000);
        addItemToList(items, 2L, 500);
        addItemToList(items, 3L, 100);
        addItemToList(items, 10L, 1);
        addItemToList(items, 11L, 1);
        addItemToList(items, 20L, 10);
        addItemToList(items, 21L, 5);
        addItemToList(items, 22L, 3);
        config.put("items", items);
        
        config.put("randomWeapons", Arrays.asList(30, 31, 32));
        config.put("randomArmors", Arrays.asList(33, 34, 35));
        config.put("randomAccessories", Arrays.asList(36, 37, 38));
        
        return config;
    }
    
    private void addItemToList(List<Map<String, Object>> items, Long itemId, int quantity) {
        Map<String, Object> item = new HashMap<>();
        item.put("itemId", itemId);
        item.put("quantity", quantity);
        items.add(item);
    }
    
    private void addItemIfNotNull(List<Map<String, Object>> items, Long itemId, int quantity) {
        if (itemId != null) {
            Map<String, Object> item = new HashMap<>();
            item.put("itemId", itemId);
            item.put("quantity", quantity);
            items.add(item);
        }
    }

    @Override
    public List<GameRole> getRolesByUserId(Long userId) {
        List<GameRole> roles = roleRepository.findByUserId(userId);
        for (GameRole role : roles) {
            if (role.getAge() == null) {
                role.setAge(18);
            }
            String realmName = resolveRealmName(role.getId(), role);
            role.setMaxAge(getMaxAgeFromRealmConfig(realmName));
        }
        return roles;
    }

    @Override
    public GameRole getRoleById(Long roleId) {
        String cacheKey = redisCacheService.generateKey("role", roleId);
        Object cachedRole = redisCacheService.getCache(cacheKey);
        if (cachedRole != null) {
            if (cachedRole instanceof GameRole) {
                GameRole cachedGameRole = (GameRole) cachedRole;
                if (cachedGameRole.getAge() == null) {
                    cachedGameRole.setAge(18);
                }
                String realmName = resolveRealmName(roleId, cachedGameRole);
                cachedGameRole.setMaxAge(getMaxAgeFromRealmConfig(realmName));
                return cachedGameRole;
            } else if (cachedRole instanceof String) {
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    GameRole role = mapper.readValue((String) cachedRole, GameRole.class);
                    if (role.getAge() == null) {
                        role.setAge(18);
                    }
                    String realmName = resolveRealmName(roleId, role);
                    role.setMaxAge(getMaxAgeFromRealmConfig(realmName));
                    return role;
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        
        GameRole role = roleRepository.findById(roleId)
                .orElse(null);
        
        if (role != null) {
            if (role.getAge() == null) {
                role.setAge(18);
            }
            String realmName = resolveRealmName(roleId, role);
            role.setMaxAge(getMaxAgeFromRealmConfig(realmName));
            
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String roleJson = mapper.writeValueAsString(role);
                redisCacheService.setCache(cacheKey, roleJson, 60);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        
        return role;
    }

    @Override
    public GameRole updateRole(Long roleId, GameRole role) {
        GameRole existingRole = roleRepository.findById(roleId)
                .orElse(null);
        
        if (existingRole == null) {
            return null;
        }
        
        if (role.getRoleName() != null) existingRole.setRoleName(role.getRoleName());
        if (role.getRealm() != null) existingRole.setRealm(role.getRealm());
        if (role.getRealmLevel() != null) existingRole.setRealmLevel(role.getRealmLevel());
        if (role.getLevel() != null) existingRole.setLevel(role.getLevel());
        if (role.getHp() != null) existingRole.setHp(role.getHp());
        if (role.getMp() != null) existingRole.setMp(role.getMp());
        if (role.getGender() != null) existingRole.setGender(role.getGender());
        if (role.getSpiritRoot() != null) existingRole.setSpiritRoot(role.getSpiritRoot());
        if (role.getOrigin() != null) existingRole.setOrigin(role.getOrigin());
        if (role.getAvatar() != null) existingRole.setAvatar(role.getAvatar());
        if (role.getBodyLevel() != null) existingRole.setBodyLevel(role.getBodyLevel());
        if (role.getBodyStrength() != null) existingRole.setBodyStrength(role.getBodyStrength());
        if (role.getCultivationBase() != null) existingRole.setCultivationBase(role.getCultivationBase());
        if (role.getLongevityBonus() != null) existingRole.setLongevityBonus(role.getLongevityBonus());
        if (role.getMaxAge() != null) existingRole.setMaxAge(role.getMaxAge());
        if (role.getLifeStatus() != null) existingRole.setLifeStatus(role.getLifeStatus());
        if (role.getStatus() != null) existingRole.setStatus(role.getStatus());
        if (role.getLastCultivationTime() != null) existingRole.setLastCultivationTime(role.getLastCultivationTime());
        if (role.getWalkFireUntil() != null) existingRole.setWalkFireUntil(role.getWalkFireUntil());
        if (role.getConsecutiveBreakthroughFailures() != null) existingRole.setConsecutiveBreakthroughFailures(role.getConsecutiveBreakthroughFailures());
        
        if (role.getRealm() != null && !role.getRealm().equals(existingRole.getRealm())) {
            RoleRealm roleRealm = roleRealmRepository.findByRoleId(roleId);
            if (roleRealm == null) {
                roleRealm = new RoleRealm();
                roleRealm.setRoleId(roleId);
                roleRealm.setCreatedAt(java.time.LocalDateTime.now());
            }
            roleRealm.setRealmName(role.getRealm());
            roleRealm.setUpdatedAt(java.time.LocalDateTime.now());
            roleRealmRepository.save(roleRealm);
        }
        
        GameRole updatedRole = roleRepository.save(existingRole);
        
        String cacheKey = redisCacheService.generateKey("role", roleId);
        redisCacheService.deleteCache(cacheKey);
        
        return updatedRole;
    }

    @Override
    public GameRole deleteRole(Long roleId) {
        GameRole role = roleRepository.findById(roleId)
                .orElse(null);
        
        if (role == null) {
            return null;
        }
        
        // 真正删除角色
        roleRepository.delete(role);
        
        // 清除缓存
        String cacheKey = redisCacheService.generateKey("role", roleId);
        redisCacheService.deleteCache(cacheKey);
        
        return role;
    }

    @Override
    @Transactional
    public GameRole updateRealm(Long roleId, String realm) {
        GameRole role = roleRepository.findById(roleId)
                .orElse(null);
        
        if (role == null) {
            return null;
        }
        
        role.setRealm(realm);
        
        RoleRealm roleRealm = roleRealmRepository.findByRoleId(roleId);
        if (roleRealm == null) {
            roleRealm = new RoleRealm();
            roleRealm.setRoleId(roleId);
            roleRealm.setCreatedAt(java.time.LocalDateTime.now());
        }
        roleRealm.setRealmName(realm);
        roleRealm.setUpdatedAt(java.time.LocalDateTime.now());
        roleRealmRepository.save(roleRealm);
        
        CfgRealmAttributeMult realmConfig = getRealmConfig(realm);
        if (realmConfig != null) {
            if (realmConfig.getHpMult() != null) {
                role.setHp((int)(100 * realmConfig.getHpMult().doubleValue()));
            }
            if (realmConfig.getSpiBonus() != null) {
                role.setMp(80 + realmConfig.getSpiBonus());
            } else if (realmConfig.getHpMult() != null) {
                role.setMp((int)(80 * realmConfig.getHpMult().doubleValue()));
            }
            if (realmConfig.getMaxAge() != null) {
                role.setMaxAge(realmConfig.getMaxAge());
            }
        }
        
        GameRole updatedRole = roleRepository.save(role);
        
        String cacheKey = redisCacheService.generateKey("role", roleId);
        redisCacheService.deleteCache(cacheKey);
        
        return updatedRole;
    }

    @Override
    public int getRoleLevel(Long roleId) {
        GameRole role = roleRepository.findById(roleId)
                .orElse(null);
        
        if (role == null) {
            throw new RuntimeException("角色不存在");
        }
        
        return role.getLevel();
    }
    
    @Override
    public List<GameRole> getAllRoles() {
        // 返回所有角色（包括禁用的）
        return roleRepository.findAll();
    }

    @Override
    public boolean existsByName(String name) {
        return roleRepository.existsByRoleName(name);
    }
}