package com.lingyue.service;

import java.util.Map;

public interface StatsService {
    
    // 获取统计数据
    Map<String, Object> getStats();
    
    // 获取游戏用户数量
    long getGameUserCount();
    
    // 获取后台用户数量
    long getSysUserCount();
    
    // 获取角色数量
    long getRoleCount();
    
    // 获取今日活跃用户数量
    long getActiveUserCount();
}