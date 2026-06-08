package com.lingyue.service.impl;

import com.lingyue.entity.GameRole;
import com.lingyue.entity.SysUser;
import com.lingyue.repository.GameRoleRepository;
import com.lingyue.repository.GameUserRepository;
import com.lingyue.repository.SysUserRepository;
import com.lingyue.service.StatsService;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatsServiceImpl implements StatsService {
    
    private final SysUserRepository sysUserRepository;
    private final GameUserRepository gameUserRepository;
    private final GameRoleRepository gameRoleRepository;
    
    public StatsServiceImpl(SysUserRepository sysUserRepository, GameUserRepository gameUserRepository, GameRoleRepository gameRoleRepository) {
        this.sysUserRepository = sysUserRepository;
        this.gameUserRepository = gameUserRepository;
        this.gameRoleRepository = gameRoleRepository;
    }
    
    @Override
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("gameUserCount", getGameUserCount());
        stats.put("sysUserCount", getSysUserCount());
        stats.put("roleCount", getRoleCount());
        stats.put("activeUserCount", getActiveUserCount());
        stats.put("highestRealm", getHighestRealm());
        return stats;
    }
    
    @Override
    public long getGameUserCount() {
        return gameUserRepository.count();
    }
    
    @Override
    public long getSysUserCount() {
        return sysUserRepository.count();
    }
    
    @Override
    public long getRoleCount() {
        return gameRoleRepository.count();
    }
    
    @Override
    public long getActiveUserCount() {
        // 获取今天的开始时间（00:00:00）
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        return gameUserRepository.countByLastLoginTimeAfter(today);
    }
    
    private String getHighestRealm() {
        // 定义境界等级映射
        Map<String, Integer> realmOrder = new HashMap<>();
        realmOrder.put("未入门", 0);
        realmOrder.put("练气期", 1);
        realmOrder.put("练气", 1);
        realmOrder.put("筑基期", 2);
        realmOrder.put("筑基", 2);
        realmOrder.put("金丹期", 3);
        realmOrder.put("金丹", 3);
        realmOrder.put("元婴期", 4);
        realmOrder.put("元婴", 4);
        realmOrder.put("化神期", 5);
        realmOrder.put("化神", 5);
        realmOrder.put("合体期", 6);
        realmOrder.put("合体", 6);
        realmOrder.put("大乘期", 7);
        realmOrder.put("大乘", 7);
        realmOrder.put("渡劫期", 8);
        realmOrder.put("渡劫", 8);
        realmOrder.put("仙人", 9);
        
        List<GameRole> allRoles = gameRoleRepository.findAll();
        if (allRoles.isEmpty()) {
            return "未入门";
        }
        
        // 找出最高境界
        return allRoles.stream()
            .filter(role -> role.getStatus() == 1)
            .max(Comparator.comparingInt(role -> {
                String realm = role.getRealm() != null ? role.getRealm() : "未入门";
                return realmOrder.getOrDefault(realm, 0);
            }))
            .map(GameRole::getRealm)
            .orElse("未入门");
    }
}