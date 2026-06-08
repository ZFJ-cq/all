package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.GameRole;
import com.lingyue.service.GameRoleService;
import com.lingyue.service.RoleDataService;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/character")
public class CharacterCreationController {
    
    private final GameRoleService gameRoleService;
    private final RoleDataService roleDataService;
    
    public CharacterCreationController(GameRoleService gameRoleService, RoleDataService roleDataService) {
        this.gameRoleService = gameRoleService;
        this.roleDataService = roleDataService;
    }
    
    // 检查名字是否已存在
    @GetMapping("/check-name")
    public Map<String, Object> checkName(@RequestParam String name) {
        Map<String, Object> result = new HashMap<>();
        boolean exists = gameRoleService.existsByName(name);
        result.put("exists", exists);
        result.put("message", exists ? "名字已被使用" : "名字可用");
        return result;
    }
    
    // 获取灵根类型列表
    @GetMapping("/spirit-roots")
    public List<Map<String, String>> getSpiritRoots() {
        List<Map<String, String>> spiritRoots = new ArrayList<>();
        
        Map<String, String> root1 = new HashMap<>();
        root1.put("name", "金灵根");
        root1.put("description", "金属性灵根，攻击力强");
        root1.put("icon", "⚡");
        spiritRoots.add(root1);
        
        Map<String, String> root2 = new HashMap<>();
        root2.put("name", "木灵根");
        root2.put("description", "木属性灵根，生命力强");
        root2.put("icon", "🌿");
        spiritRoots.add(root2);
        
        Map<String, String> root3 = new HashMap<>();
        root3.put("name", "水灵根");
        root3.put("description", "水属性灵根，防御力强");
        root3.put("icon", "💧");
        spiritRoots.add(root3);
        
        Map<String, String> root4 = new HashMap<>();
        root4.put("name", "火灵根");
        root4.put("description", "火属性灵根，爆发力强");
        root4.put("icon", "🔥");
        spiritRoots.add(root4);
        
        Map<String, String> root5 = new HashMap<>();
        root5.put("name", "土灵根");
        root5.put("description", "土属性灵根，耐力强");
        root5.put("icon", "⛰️");
        spiritRoots.add(root5);
        
        Map<String, String> root6 = new HashMap<>();
        root6.put("name", "雷灵根");
        root6.put("description", "雷属性灵根，速度快");
        root6.put("icon", "⚡");
        spiritRoots.add(root6);
        
        Map<String, String> root7 = new HashMap<>();
        root7.put("name", "五灵根");
        root7.put("description", "五行灵根，潜力无限");
        root7.put("icon", "🌈");
        spiritRoots.add(root7);
        
        return spiritRoots;
    }
    
    // 随机分配灵根
    @GetMapping("/random-spirit-root")
    public Map<String, String> randomSpiritRoot() {
        List<Map<String, String>> spiritRoots = getSpiritRoots();
        Random random = new Random();
        int index = random.nextInt(spiritRoots.size());
        return spiritRoots.get(index);
    }
    
    // 获取出身命格列表
    @GetMapping("/origins")
    public List<Map<String, String>> getOrigins() {
        List<Map<String, String>> origins = new ArrayList<>();
        
        Map<String, String> origin1 = new HashMap<>();
        origin1.put("name", "世家子弟");
        origin1.put("description", "出身修仙世家，资源丰富");
        origins.add(origin1);
        
        Map<String, String> origin2 = new HashMap<>();
        origin2.put("name", "散修孤儿");
        origin2.put("description", "无依无靠，但心性坚韧");
        origins.add(origin2);
        
        Map<String, String> origin3 = new HashMap<>();
        origin3.put("name", "宗门弃徒");
        origin3.put("description", "曾被逐出师门，怀恨在心");
        origins.add(origin3);
        
        Map<String, String> origin4 = new HashMap<>();
        origin4.put("name", "山野村夫");
        origin4.put("description", "偶得奇遇，踏入仙途");
        origins.add(origin4);
        
        Map<String, String> origin5 = new HashMap<>();
        origin5.put("name", "皇室贵胄");
        origin5.put("description", "拥有皇道龙气，气运加身");
        origins.add(origin5);
        
        Map<String, String> origin6 = new HashMap<>();
        origin6.put("name", "商贾之子");
        origin6.put("description", "富可敌国，以财入道");
        origins.add(origin6);
        
        Map<String, String> origin7 = new HashMap<>();
        origin7.put("name", "书香门第");
        origin7.put("description", "饱读诗书，悟性极高");
        origins.add(origin7);
        
        Map<String, String> origin8 = new HashMap<>();
        origin8.put("name", "异域来客");
        origin8.put("description", "来自海外仙山，神秘莫测");
        origins.add(origin8);
        
        return origins;
    }
    
    // 随机分配出身命格
    @GetMapping("/random-origin")
    public Map<String, String> randomOrigin() {
        List<Map<String, String>> origins = getOrigins();
        Random random = new Random();
        int index = random.nextInt(origins.size());
        return origins.get(index);
    }
    
    // 创建角色
    @PostMapping("/create")
    public Map<String, Object> createCharacter(@RequestBody GameRole role) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 创建角色
            GameRole createdRole = gameRoleService.createRole(role);
            
            // 初始化角色数据
            if (createdRole != null && createdRole.getId() != null) {
                roleDataService.initializeRoleData(createdRole.getId());
            }
            
            result.put("code", 200);
            result.put("message", "创建成功");
            result.put("data", createdRole);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "创建失败：" + e.getMessage());
        }
        
        return result;
    }
}
