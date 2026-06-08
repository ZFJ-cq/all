package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.*;
import com.lingyue.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/test-data")
public class TestDataInitController {
    
    private final GameUserRepository gameUserRepository;
    private final GameRoleRepository gameRoleRepository;
    private final AssetTypeRepository assetTypeRepository;
    private final ClanRepository clanRepository;
    private final RoleResourceRepository roleResourceRepository;
    private final ResourceTypeRepository resourceTypeRepository;
    
    public TestDataInitController(
        GameUserRepository gameUserRepository,
        GameRoleRepository gameRoleRepository,
        AssetTypeRepository assetTypeRepository,
        ClanRepository clanRepository,
        RoleResourceRepository roleResourceRepository,
        ResourceTypeRepository resourceTypeRepository
    ) {
        this.gameUserRepository = gameUserRepository;
        this.gameRoleRepository = gameRoleRepository;
        this.assetTypeRepository = assetTypeRepository;
        this.clanRepository = clanRepository;
        this.roleResourceRepository = roleResourceRepository;
        this.resourceTypeRepository = resourceTypeRepository;
    }
    
    @PostMapping("/init-all")
    public ResponseEntity<String> initAllTestData() {
        StringBuilder result = new StringBuilder();
        
        try {
            if (assetTypeRepository.count() == 0) {
                initAssetTypes();
                result.append("资产类型数据初始化成功！\n");
            } else {
                result.append("资产类型数据已存在，跳过。\n");
            }
            
            if (gameUserRepository.count() == 0) {
                initGameUsersAndRoles();
                result.append("游戏用户和角色数据初始化成功！\n");
            } else {
                result.append("游戏用户数据已存在，跳过。\n");
            }
            
            if (clanRepository.count() == 0) {
                initClans();
                result.append("宗门数据初始化成功！\n");
            } else {
                result.append("宗门数据已存在，跳过。\n");
            }
            
            return new ResponseEntity<>(result.toString(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("初始化失败：" + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/asset-types")
    public ResponseEntity<String> initAssetTypes() {
        if (assetTypeRepository.count() > 0) {
            return new ResponseEntity<>("资产类型数据已存在", HttpStatus.OK);
        }
        
        String[][] assetTypeData = {
            {"灵石", "lingshi", "currency", "💎", "游戏通用货币，用于购买物品和提升修为", "true", "true", "9999", "none", "enabled", "cultivation,shop,auction,task,dungeon,pvp,all"},
            {"仙石", "xianshi", "currency", "💠", "高级货币，用于购买稀有物品", "true", "true", "9999", "none", "enabled", "cultivation,shop,auction"},
            {"寿命", "lifespan", "currency", "⏳", "角色的寿命值", "false", "false", "9999", "none", "enabled", "cultivation"},
            {"经验丹", "jingyandan", "consumable", "🍶", "使用后可获得大量经验值", "true", "true", "99", "auto", "enabled", "cultivation,all"},
            {"筑基丹", "zhujidan", "consumable", "💊", "筑基期突破必备丹药", "true", "true", "10", "none", "enabled", "cultivation"},
            {"下品法器", "xiaopinfaqi", "equipment", "⚔️", "基础攻击装备", "true", "true", "1", "none", "enabled", "combat,equipment"},
            {"中品法器", "zhongpinfaqi", "equipment", "🗡️", "中级攻击装备", "true", "true", "1", "none", "enabled", "combat,equipment"},
            {"上品法器", "shangpinfaqi", "equipment", "⚡", "高级攻击装备", "true", "true", "1", "none", "enabled", "combat,equipment"},
            {"传送符", "chuansongfu", "consumable", "📜", "可传送到指定地图", "true", "true", "99", "auto", "enabled", "map,shop"},
            {"修炼心得", "xiulianxinde", "material", "📖", "记录修炼心得的书籍", "true", "true", "99", "none", "enabled", "cultivation,task"},
            {"妖丹", "yaodan", "material", "🔮", "妖兽体内的精华，可用于炼丹", "true", "true", "999", "none", "enabled", "cultivation,shop"},
            {"灵草", "lingcao", "material", "🌿", "可用于炼制丹药的灵草", "true", "true", "999", "none", "enabled", "cultivation,shop"}
        };
        
        for (String[] data : assetTypeData) {
            AssetType assetType = new AssetType();
            assetType.setName(data[0]);
            assetType.setCode(data[1]);
            assetType.setCategory(data[2]);
            assetType.setIcon(data[3]);
            assetType.setDescription(data[4]);
            assetType.setTradable(Boolean.parseBoolean(data[5]));
            assetType.setDroppable(Boolean.parseBoolean(data[6]));
            assetType.setMaxStack(Integer.parseInt(data[7]));
            assetType.setDestroyPolicy(data[8]);
            assetType.setStatus(data[9]);
            assetType.setModules(data[10]);
            assetTypeRepository.save(assetType);
        }
        
        return new ResponseEntity<>("资产类型数据初始化成功！", HttpStatus.OK);
    }
    
    @PostMapping("/users-roles")
    public ResponseEntity<String> initGameUsersAndRoles() {
        if (gameUserRepository.count() > 0) {
            return new ResponseEntity<>("游戏用户数据已存在", HttpStatus.OK);
        }
        
        String[][] userData = {
            {"player1", "李逍遥", "13800138001", "lixiaoyao@test.com"},
            {"player2", "张小凡", "13900139002", "zhangxiaofan@test.com"},
            {"player3", "陆雪琪", "13700137003", "luxueqi@test.com"},
            {"player4", "林惊羽", "13600136004", "linjingyu@test.com"},
            {"player5", "碧瑶", "13500135005", "biyao@test.com"}
        };
        
        Object[][] roleData = {
            {"李逍遥", 1, "练气", "凡人", "https://api.dicebear.com/7.x/avataaars/svg?seed=player1"},
            {"赵灵儿", 0, "筑基", "仙族", "https://api.dicebear.com/7.x/avataaars/svg?seed=player1a"},
            {"张小凡", 1, "金丹", "凡人", "https://api.dicebear.com/7.x/avataaars/svg?seed=player2"},
            {"陆雪琪", 0, "元婴", "仙族", "https://api.dicebear.com/7.x/avataaars/svg?seed=player3"},
            {"林惊羽", 1, "筑基", "修士", "https://api.dicebear.com/7.x/avataaars/svg?seed=player4"},
            {"碧瑶", 0, "金丹", "魔族", "https://api.dicebear.com/7.x/avataaars/svg?seed=player5"}
        };
        
        for (int i = 0; i < userData.length; i++) {
            GameUser user = new GameUser();
            user.setUsername(userData[i][0]);
            user.setNickname(userData[i][1]);
            user.setPhone(userData[i][2]);
            user.setPassword("$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH");
            user.setStatus(1);
            user.setLastLoginTime(LocalDateTime.now());
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            GameUser savedUser = gameUserRepository.save(user);
            
            int startRole = i * 1;
            int endRole = Math.min(startRole + 2, roleData.length);
            for (int j = startRole; j < endRole && j < roleData.length; j++) {
                GameRole role = new GameRole();
                role.setRoleName((String) roleData[j][0]);
                role.setGender((Integer) roleData[j][1]);
                role.setRealm((String) roleData[j][2]);
                role.setSpiritRoot((String) roleData[j][3]);
                role.setAvatar((String) roleData[j][4]);
                role.setLevel(j + 1);
                role.setHp(1000 + j * 100);
                role.setMp(500 + j * 50);
                role.setBodyLevel("1");
                role.setBodyStrength(10);
                role.setUserId(savedUser.getId());
                role.setStatus(1);
                role.setCreateTime(LocalDateTime.now());
                gameRoleRepository.save(role);
            }
        }
        
        return new ResponseEntity<>("游戏用户和角色数据初始化成功！", HttpStatus.OK);
    }
    
    @PostMapping("/clans")
    public ResponseEntity<String> initClans() {
        if (clanRepository.count() > 0) {
            return new ResponseEntity<>("宗门数据已存在", HttpStatus.OK);
        }
        
        Object[][] clanData = {
            {"青云门", "正道第一大宗门，以剑修闻名", "🏔️", 1, 100, 5000, "道玄真人", "active", "青云山", 500, 1},
            {"天音寺", "佛门圣地，慈悲为怀", "⛩️", 2, 80, 4000, "普泓大师", "active", "天音山", 300, 1},
            {"焚香谷", "南疆大族，善用火焰", "🔥", 3, 60, 3000, "云易岚", "active", "焚香谷", 200, 1},
            {"鬼王宗", "魔教大宗，实力强横", "👹", 2, 90, 4500, "鬼王", "active", "狐岐山", 400, 1},
            {"合欢派", "魔教宗派，魅惑之术", "💮", 1, 40, 2000, "三妙仙子", "active", "合欢山", 150, 1}
        };
        
        for (Object[] data : clanData) {
            Clan clan = new Clan();
            clan.setName((String) data[0]);
            clan.setDescription((String) data[1]);
            clan.setLogo((String) data[2]);
            clan.setLevel((Integer) data[3]);
            clan.setMembersCount((Integer) data[4]);
            clan.setContribution((Integer) data[5]);
            clan.setLeaderName((String) data[6]);
            clan.setStatus((String) data[7]);
            clan.setLocation((String) data[8]);
            clan.setMaxMembers((Integer) data[9]);
            clan.setRequiredLevel((Integer) data[10]);
            clanRepository.save(clan);
        }
        
        return new ResponseEntity<>("宗门数据初始化成功！", HttpStatus.OK);
    }
    
    @DeleteMapping("/clear-all")
    public ResponseEntity<String> clearAllTestData() {
        try {
            gameRoleRepository.deleteAll();
            gameUserRepository.deleteAll();
            assetTypeRepository.deleteAll();
            clanRepository.deleteAll();
            return new ResponseEntity<>("所有测试数据已清除！", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("清除失败：" + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/leaderboard")
    public ResponseEntity<String> initLeaderboardTestData() {
        try {
            // 确保有游戏用户
            GameUser testUser = gameUserRepository.findById(1L).orElseGet(() -> {
                GameUser user = new GameUser();
                user.setUsername("testplayer");
                user.setNickname("测试玩家");
                user.setPhone("13800000000");
                user.setPassword("$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH");
                user.setStatus(1);
                user.setLastLoginTime(LocalDateTime.now());
                user.setCreatedAt(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());
                return gameUserRepository.save(user);
            });
            
            // 获取灵石资源类型
            ResourceType lingshiType = resourceTypeRepository.findByCode("lingshi");
            if (lingshiType == null) {
                lingshiType = new ResourceType();
                lingshiType.setCode("lingshi");
                lingshiType.setName("灵石");
                lingshiType = resourceTypeRepository.save(lingshiType);
            }
            
            // 创建测试角色和资源数据
            Object[][] leaderboardData = {
                {"道玄真人", 1, "金灵根", "练气期", 15, 1500, 800, 10000},
                {"普泓大师", 1, "木灵根", "筑基期", 35, 3500, 1800, 25000},
                {"云易岚", 1, "水灵根", "金丹期", 65, 6500, 3300, 50000},
                {"鬼王", 1, "火灵根", "元婴期", 85, 8500, 4300, 75000},
                {"三妙仙子", 2, "土灵根", "化神期", 105, 10500, 5300, 100000},
                {"陆雪琪", 2, "水灵根", "合体期", 125, 12500, 6300, 150000},
                {"张小凡", 1, "金土双灵根", "大乘期", 145, 14500, 7300, 200000},
                {"碧瑶", 2, "木灵根", "渡劫期", 165, 16500, 8300, 300000},
                {"青叶祖师", 1, "全灵根", "仙人", 200, 50000, 25000, 500000},
                {"富甲天下", 1, "土灵根", "练气期", 10, 1000, 500, 999999}
            };
            
            for (Object[] data : leaderboardData) {
                String roleName = (String) data[0];
                
                // 检查角色是否已存在
                List<GameRole> existingRoles = gameRoleRepository.findByRoleName(roleName);
                GameRole role;
                if (existingRoles != null && !existingRoles.isEmpty()) {
                    role = existingRoles.get(0);
                } else {
                    role = new GameRole();
                    role.setRoleName(roleName);
                    role.setGender((Integer) data[1]);
                    role.setSpiritRoot((String) data[2]);
                    role.setRealm((String) data[3]);
                    role.setLevel((Integer) data[4]);
                    role.setHp((Integer) data[5]);
                    role.setMp((Integer) data[6]);
                    role.setUserId(testUser.getId());
                    role.setStatus(1);
                    role.setCreateTime(LocalDateTime.now());
                    role = gameRoleRepository.save(role);
                }
                
                // 添加或更新灵石资源
                int wealth = (Integer) data[7];
                List<RoleResource> existingResources = roleResourceRepository.findByRoleId(role.getId());
                RoleResource lingshiResource = null;
                if (existingResources != null) {
                    for (RoleResource res : existingResources) {
                        if (res.getResourceTypeId() != null && res.getResourceTypeId().equals(lingshiType.getId())) {
                            lingshiResource = res;
                            break;
                        }
                    }
                }
                
                if (lingshiResource == null) {
                    lingshiResource = new RoleResource();
                    lingshiResource.setRoleId(role.getId());
                    lingshiResource.setResourceTypeId(lingshiType.getId());
                    lingshiResource.setUpdatedAt(java.util.Date.from(java.time.Instant.now()));
                }
                lingshiResource.setQuantity((long) wealth);
                lingshiResource.setUpdatedAt(java.util.Date.from(java.time.Instant.now()));
                roleResourceRepository.save(lingshiResource);
            }
            
            return new ResponseEntity<>("排行榜测试数据初始化成功！", HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("初始化失败：" + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
