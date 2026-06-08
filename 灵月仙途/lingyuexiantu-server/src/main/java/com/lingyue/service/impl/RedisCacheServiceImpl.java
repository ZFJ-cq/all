package com.lingyue.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Redis缓存服务实现
 * 用于减少数据库查询，提高系统性能
 */
@Service
public class RedisCacheServiceImpl {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * 设置缓存
     * @param key 缓存键
     * @param value 缓存值
     * @param expireTime 过期时间（秒）
     */
    public void setCache(String key, Object value, long expireTime) {
        try {
            redisTemplate.opsForValue().set(key, value, expireTime, TimeUnit.SECONDS);
        } catch (Exception e) {
            // Redis连接失败，忽略异常，继续执行
        }
    }

    /**
     * 获取缓存
     * @param key 缓存键
     * @return 缓存值
     */
    public Object getCache(String key) {
        try {
            return redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            // Redis连接失败，返回null，继续从数据库获取
            return null;
        }
    }

    /**
     * 删除缓存
     * @param key 缓存键
     */
    public void deleteCache(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            // Redis连接失败，忽略异常，继续执行
        }
    }

    /**
     * 清除所有缓存
     */
    public void clearCache() {
        try {
            redisTemplate.getConnectionFactory().getConnection().flushAll();
        } catch (Exception e) {
            // Redis连接失败，忽略异常，继续执行
        }
    }

    /**
     * 生成缓存键
     * @param prefix 前缀
     * @param id ID
     * @return 缓存键
     */
    public String generateKey(String prefix, Long id) {
        return prefix + ":" + id;
    }
}
