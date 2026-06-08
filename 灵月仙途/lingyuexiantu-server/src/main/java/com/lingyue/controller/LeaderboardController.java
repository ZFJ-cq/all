package com.lingyue.controller;

import com.lingyue.entity.GameRole;
import com.lingyue.entity.GameUser;
import com.lingyue.repository.GameRoleRepository;
import com.lingyue.repository.GameUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/leaderboard")
public class LeaderboardController {
    
    private final GameRoleRepository roleRepository;
    private final GameUserRepository userRepository;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public LeaderboardController(GameRoleRepository roleRepository, 
                                 GameUserRepository userRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }
    
    private static final Map<String, Integer> REALM_ORDER = new LinkedHashMap<>();
    static {
        REALM_ORDER.put("未入门", 0);
        REALM_ORDER.put("练气期", 1);
        REALM_ORDER.put("筑基期", 2);
        REALM_ORDER.put("金丹期", 3);
        REALM_ORDER.put("元婴期", 4);
        REALM_ORDER.put("化神期", 5);
        REALM_ORDER.put("合体期", 6);
        REALM_ORDER.put("大乘期", 7);
        REALM_ORDER.put("渡劫期", 8);
        REALM_ORDER.put("仙人", 9);
    }
    
    @GetMapping("/realm")
    public ResponseEntity<Map<String, Object>> getRealmLeaderboard(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<GameRole> allRoles = roleRepository.findAll();
            
            List<Map<String, Object>> allLeaderboard = allRoles.stream()
                .filter(role -> role.getStatus() == null || role.getStatus() == 1)
                .sorted((r1, r2) -> {
                    String realm1 = r1.getRealm() != null ? r1.getRealm() : "未入门";
                    String realm2 = r2.getRealm() != null ? r2.getRealm() : "未入门";
                    int order1 = REALM_ORDER.getOrDefault(realm1, 0);
                    int order2 = REALM_ORDER.getOrDefault(realm2, 0);
                    if (order1 != order2) return Integer.compare(order2, order1);
                    int level1 = r1.getLevel() != null ? r1.getLevel() : 0;
                    int level2 = r2.getLevel() != null ? r2.getLevel() : 0;
                    return Integer.compare(level2, level1);
                })
                .map(role -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("rank", 0);
                    item.put("roleId", role.getId());
                    item.put("roleName", role.getRoleName());
                    item.put("realm", role.getRealm() != null ? role.getRealm() : "未入门");
                    item.put("level", role.getLevel() != null ? role.getLevel() : 0);
                    item.put("userId", role.getUserId());
                    
                    GameUser user = userRepository.findById(role.getUserId()).orElse(null);
                    if (user != null) {
                        item.put("username", user.getUsername());
                        item.put("nickname", user.getNickname());
                    } else {
                        item.put("username", "未知");
                        item.put("nickname", "未知");
                    }
                    
                    return item;
                })
                .collect(Collectors.toList());
            
            for (int i = 0; i < allLeaderboard.size(); i++) {
                allLeaderboard.get(i).put("rank", i + 1);
            }
            
            int total = allLeaderboard.size();
            int totalPages = (int) Math.ceil((double) total / size);
            int fromIndex = (page - 1) * size;
            int toIndex = Math.min(fromIndex + size, total);
            
            List<Map<String, Object>> pageData = fromIndex < total 
                ? allLeaderboard.subList(fromIndex, toIndex) 
                : new ArrayList<>();
            
            Map<String, Object> result = new HashMap<>();
            result.put("data", pageData);
            result.put("total", total);
            result.put("page", page);
            result.put("size", size);
            result.put("totalPages", totalPages);
            
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("获取境界排行榜失败：" + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(new HashMap<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/wealth")
    public ResponseEntity<Map<String, Object>> getWealthLeaderboard(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<GameRole> allRoles = roleRepository.findAll();
            
            List<Map<String, Object>> allLeaderboard = allRoles.stream()
                .filter(role -> role.getStatus() == null || role.getStatus() == 1)
                .map(role -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("rank", 0);
                    item.put("roleId", role.getId());
                    item.put("roleName", role.getRoleName());
                    item.put("realm", role.getRealm() != null ? role.getRealm() : "未入门");
                    item.put("level", role.getLevel() != null ? role.getLevel() : 0);
                    item.put("userId", role.getUserId());
                    
                    int wealth = 0;
                    try {
                        String wealthSql = "SELECT COALESCE(SUM(quantity), 0) FROM role_asset WHERE role_id = ? AND asset_type_code = 'LINGSHI'";
                        Long wealthVal = jdbcTemplate.queryForObject(wealthSql, Long.class, role.getId());
                        wealth = wealthVal != null ? wealthVal.intValue() : 0;
                    } catch (Exception e) {
                        wealth = 0;
                    }
                    item.put("wealth", wealth);
                    
                    GameUser user = userRepository.findById(role.getUserId()).orElse(null);
                    if (user != null) {
                        item.put("username", user.getUsername());
                        item.put("nickname", user.getNickname());
                    } else {
                        item.put("username", "未知");
                        item.put("nickname", "未知");
                    }
                    
                    return item;
                })
                .sorted((r1, r2) -> {
                    int w1 = (Integer) r1.getOrDefault("wealth", 0);
                    int w2 = (Integer) r2.getOrDefault("wealth", 0);
                    return Integer.compare(w2, w1);
                })
                .collect(Collectors.toList());
            
            for (int i = 0; i < allLeaderboard.size(); i++) {
                allLeaderboard.get(i).put("rank", i + 1);
            }
            
            int total = allLeaderboard.size();
            int totalPages = (int) Math.ceil((double) total / size);
            int fromIndex = (page - 1) * size;
            int toIndex = Math.min(fromIndex + size, total);
            
            List<Map<String, Object>> pageData = fromIndex < total 
                ? allLeaderboard.subList(fromIndex, toIndex) 
                : new ArrayList<>();
            
            Map<String, Object> result = new HashMap<>();
            result.put("data", pageData);
            result.put("total", total);
            result.put("page", page);
            result.put("size", size);
            result.put("totalPages", totalPages);
            
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("获取财富排行榜失败：" + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(new HashMap<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
