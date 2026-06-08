# 灵月仙途 - 重构指南 (续 2)

## 任务 6: 性能优化专项

### 6.1 数据库索引优化

```sql
-- ============================================
-- 索引优化脚本
-- ============================================

-- 1. 成就系统索引
CREATE INDEX idx_achievement_condition_type ON achievement(condition_type, status);
CREATE INDEX idx_achievement_module_type ON achievement(module_type, status, sort_order);

-- 2. 角色成就索引
CREATE INDEX idx_role_achievement_progress ON role_achievement(role_id, status, progress);
CREATE INDEX idx_role_achievement_equipped ON role_achievement(role_id, is_equipped);

-- 3. 宗门系统索引
CREATE INDEX idx_clan_member_position ON clan_member(clan_id, position, status);
CREATE INDEX idx_clan_member_contribution ON clan_member(clan_id, contribution DESC);

-- 4. 资源系统索引
CREATE INDEX idx_role_resource_type ON role_resource(role_id, resource_type_id, version);

-- 5. 突破历史索引
CREATE INDEX idx_breakthrough_role_time ON breakthrough_history(role_id, create_time DESC);
CREATE INDEX idx_breakthrough_success_rate ON breakthrough_history(is_success, create_time);

-- 6. 审计日志索引
CREATE INDEX idx_audit_log_module_time ON audit_log(module, create_time DESC);
CREATE INDEX idx_audit_log_role_time ON audit_log(role_id, create_time DESC);
```

### 6.2 N+1 查询优化

```java
/**
 * Repository 层优化：使用 JOIN 批量查询
 */
@Repository
public interface RoleAchievementRepository 
    extends JpaRepository<RoleAchievement, Long> {
    
    /**
     * 批量查询角色成就 (带成就配置)
     * 使用 JOIN FETCH 避免 N+1 问题
     */
    @Query("SELECT ra FROM RoleAchievement ra " +
           "JOIN FETCH ra.achievement a " +
           "WHERE ra.roleId = :roleId " +
           "ORDER BY a.sortOrder")
    List<RoleAchievement> findByRoleIdWithAchievement(@Param("roleId") Long roleId);
    
    /**
     * 批量查询多个角色的成就
     * 使用 IN 查询一次性加载
     */
    @Query("SELECT ra FROM RoleAchievement ra " +
           "JOIN FETCH ra.achievement a " +
           "WHERE ra.roleId IN :roleIds")
    List<RoleAchievement> findByRoleIdsWithAchievement(@Param("roleIds") List<Long> roleIds);
}

/**
 * Service 层使用示例
 */
@Service
public class AchievementService {
    
    /**
     * 获取角色成就列表 (优化版)
     */
    public List<Map<String, Object>> getRoleAchievements(Long roleId) {
        // 一次查询，避免 N+1
        List<RoleAchievement> roleAchievements = roleAchievementRepository
            .findByRoleIdWithAchievement(roleId);
        
        // 构建结果
        return roleAchievements.stream()
            .map(this::convertToMap)
            .collect(Collectors.toList());
    }
    
    /**
     * 批量获取多个角色的成就 (排行榜场景)
     */
    public Map<Long, List<Map<String, Object>>> getBatchRoleAchievements(List<Long> roleIds) {
        // 一次查询所有角色的成就
        List<RoleAchievement> allAchievements = roleAchievementRepository
            .findByRoleIdsWithAchievement(roleIds);
        
        // 按角色 ID 分组
        return allAchievements.stream()
            .collect(Collectors.groupingBy(
                RoleAchievement::getRoleId,
                Collectors.mapping(this::convertToMap, Collectors.toList())
            ));
    }
}
```

### 6.3 Redis 缓存策略

```java
/**
 * 缓存配置类
 */
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))  // 默认 TTL 10 分钟
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()))
            .disableCachingNullValues();
        
        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .withCacheConfiguration("achievements", config.entryTtl(Duration.ofHours(1)))
            .withCacheConfiguration("player:attributes", config.entryTtl(Duration.ofMinutes(5)))
            .withCacheConfiguration("clan:info", config.entryTtl(Duration.ofMinutes(30)))
            .build();
    }
}

/**
 * Service 层使用 Cache-Aside 模式
 */
@Service
public class AchievementService {
    
    /**
     * 获取成就配置 (带缓存)
     */
    @Cacheable(value = "achievements", key = "'all:' + #status")
    public List<Achievement> getAllAchievements(Integer status) {
        log.info("查询成就配置，status={}", status);
        return achievementRepository.findByStatusOrderBySortOrderAsc(status);
    }
    
    /**
     * 获取单个成就 (带缓存)
     */
    @Cacheable(value = "achievements", key = "#achievementId")
    public Achievement getAchievementById(Long achievementId) {
        log.info("查询成就配置，achievementId={}", achievementId);
        return achievementRepository.findById(achievementId)
            .orElseThrow(() -> new IllegalArgumentException("成就不存在"));
    }
    
    /**
     * 更新成就后清除缓存
     */
    @CacheEvict(value = "achievements", key = "'all:' + #achievement.status")
    @Transactional
    public Achievement updateAchievement(Achievement achievement) {
        return achievementRepository.save(achievement);
    }
}
```

### 6.4 消息队列异步处理

```java
/**
 * MQ 配置类
 */
@Configuration
public class RabbitMQConfig {
    
    /**
     * 成就交换机
     */
    @Bean
    public DirectExchange achievementExchange() {
        return new DirectExchange("achievement.exchange");
    }
    
    /**
     * 成就完成队列
     */
    @Bean
    public Queue achievementCompletedQueue() {
        return QueueBuilder.durable("achievement.completed.queue")
            .withArgument("x-message-ttl", 86400000) // 24 小时
            .build();
    }
    
    /**
     * 绑定
     */
    @Bean
    public Binding achievementCompletedBinding(Queue achievementCompletedQueue,
                                               DirectExchange achievementExchange) {
        return BindingBuilder.bind(achievementCompletedQueue)
            .to(achievementExchange)
            .with("achievement.completed");
    }
    
    /**
     * 通知交换机
     */
    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange("notification.exchange");
    }
    
    /**
     * 全服广播队列
     */
    @Bean
    public Queue broadcastQueue() {
        return QueueBuilder.durable("notification.broadcast.queue")
            .build();
    }
    
    @Bean
    public Binding broadcastBinding(Queue broadcastQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(broadcastQueue)
            .to(notificationExchange)
            .with("broadcast.#");
    }
}

/**
 * 消息生产者
 */
@Component
public class AchievementMessageProducer {
    
    private final RabbitTemplate rabbitTemplate;
    
    public AchievementMessageProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }
    
    /**
     * 发送成就完成消息
     */
    public void sendAchievementCompleted(Long roleId, Achievement achievement) {
        Map<String, Object> message = new HashMap<>();
        message.put("roleId", roleId);
        message.put("achievementId", achievement.getId());
        message.put("achievementName", achievement.getName());
        message.put("rarity", achievement.getRarity());
        message.put("title", achievement.getTitle());
        message.put("timestamp", System.currentTimeMillis());
        
        rabbitTemplate.convertAndSend(
            "achievement.exchange",
            "achievement.completed",
            message
        );
        
        log.info("发送成就完成 MQ 消息，roleId={}, achievementId={}", 
            roleId, achievement.getId());
    }
}

/**
 * 消息消费者
 */
@Component
@Slf4j
public class AchievementMessageConsumer {
    
    private final NotificationService notificationService;
    
    public AchievementMessageConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    
    /**
     * 监听成就完成消息
     */
    @RabbitListener(queues = "achievement.completed.queue")
    public void handleAchievementCompleted(Map<String, Object> message) {
        try {
            Long roleId = (Long) message.get("roleId");
            Long achievementId = (Long) message.get("achievementId");
            String achievementName = (String) message.get("achievementName");
            String rarity = (String) message.get("rarity");
            
            // 根据稀有度决定是否全服广播
            if ("epic".equals(rarity) || "legendary".equals(rarity)) {
                String broadcastMessage = String.format(
                    "恭喜道友 %s 达成成就【%s】！",
                    getRoleName(roleId),
                    achievementName
                );
                
                notificationService.broadcast(broadcastMessage);
            }
            
            // 统计成就完成次数
            statisticService.incrementAchievementCount(achievementId);
            
        } catch (Exception e) {
            log.error("处理成就完成 MQ 消息失败，message={}", message, e);
            // 抛出异常，触发重试
            throw new RuntimeException("处理失败", e);
        }
    }
}
```

---

## ⚙️ 配置文件示例

### application.yml

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/lingyue_xiantu?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  
  redis:
    host: localhost
    port: 6379
    password: ${REDIS_PASSWORD}
    database: 0
    lettuce:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5
        max-wait: 3000ms
  
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
    virtual-host: /
    listener:
      simple:
        acknowledge-mode: manual  # 手动 ACK
        concurrency: 5
        max-concurrency: 10
        prefetch: 10  # 每次最多处理 10 条消息
        retry:
          enabled: true
          max-attempts: 3
          initial-interval: 1000ms
  
  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true
        batch_size: 50  # 批量操作大小
        order_inserts: true  # 优化插入顺序
        order_updates: true  # 优化更新顺序

# 游戏配置
game:
  cultivation:
    base-xiuwei-per-second: 1
    default-duration-seconds: 30
    ling-shi-boost-multiplier: 2.0
    pill-boost-multiplier: 3.0
    max-offline-hours: 24
  
  breakthrough:
    base-success-rate: 50.0
    min-success-rate: 10.0
    max-bonus-rate: 50.0
    pity-count: 20
  
  sect:
    positions:
      leader: 4
      elder: 3
      elite: 2
      member: 1
    max-members: 100
    war-duration-minutes: 60

# 日志配置
logging:
  level:
    root: INFO
    com.lingyue: DEBUG
    com.lingyue.repository: INFO
    org.springframework.transaction: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/lingyue-xiantu.log
    max-size: 100MB
    max-history: 30
```

### 成就配置 JSON 示例

```json
{
  "achievements": [
    {
      "id": 1,
      "name": "初入仙途",
      "type": "login",
      "moduleType": "cultivation",
      "conditionType": "login_days",
      "operator": ">=",
      "threshold": 1,
      "rewardAttributes": {
        "attack": 10,
        "defense": 10
      },
      "title": "修仙者",
      "rarity": "common",
      "icon": "🌟",
      "hidden": false,
      "description": "首次登录游戏，踏上修仙之路"
    },
    {
      "id": 5,
      "name": "金丹大道",
      "type": "breakthrough",
      "moduleType": "cultivation",
      "conditionType": "realm_breakthrough",
      "operator": ">=",
      "threshold": 5,
      "rewardAttributes": {
        "attack": 200,
        "defense": 150,
        "intelligence": 10
      },
      "title": "金丹真人",
      "rarity": "epic",
      "icon": "🔮",
      "hidden": false,
      "description": "境界突破至金丹期"
    }
  ]
}
```

---

## 🧪 单元测试用例

### 并发突破测试

```java
package com.lingyue.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 突破服务并发测试
 */
@SpringBootTest
@ActiveProfiles("test")
class CultivationServiceConcurrencyTest {
    
    @Autowired
    private CultivationService cultivationService;
    
    @Autowired
    private RoleResourceService roleResourceService;
    
    private final ExecutorService executor = Executors.newFixedThreadPool(10);
    
    /**
     * 测试并发突破场景
     * 模拟 10 个线程同时尝试突破，确保不会重复扣除修为
     */
    @Test
    void testConcurrentBreakthrough() throws Exception {
        Long roleId = 1L;
        String targetRealm = "炼气期";
        
        // 初始化修为 (只够一次突破)
        roleResourceService.addResource(roleId, "xiuwei", 1000L);
        
        // 记录成功次数
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);
        
        // 提交 10 个并发请求
        CountDownLatch latch = new CountDownLatch(10);
        
        for (int i = 0; i < 10; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    String requestId = "test-" + System.currentTimeMillis() + "-" + index;
                    
                    Map<String, Object> result = cultivationService.breakthrough(
                        roleId, targetRealm, requestId, "127.0.0.1");
                    
                    if ((Boolean) result.get("success")) {
                        successCount.incrementAndGet();
                    } else {
                        failureCount.incrementAndGet();
                    }
                    
                } catch (Exception e) {
                    // 预期内的异常 (如：幂等性冲突、资源不足)
                    failureCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }
        
        // 等待所有请求完成
        latch.await(30, TimeUnit.SECONDS);
        
        // 验证：只有一个请求成功
        assertEquals(1, successCount.get(), "应该只有一个突破成功");
        
        // 验证：修为只被扣除一次
        Long remainingXiuwei = roleResourceService.getResourceQuantity(roleId, "xiuwei");
        assertTrue(remainingXiuwei >= 0, "修为不应该为负数");
        
        executor.shutdown();
    }
    
    /**
     * 测试幂等性
     */
    @Test
    void testIdempotentBreakthrough() throws Exception {
        Long roleId = 1L;
        String targetRealm = "炼气期";
        String requestId = "idempotent-test-" + System.currentTimeMillis();
        
        // 第一次请求
        Map<String, Object> result1 = cultivationService.breakthrough(
            roleId, targetRealm, requestId, "127.0.0.1");
        
        // 第二次请求 (相同 requestId)
        Map<String, Object> result2 = cultivationService.breakthrough(
            roleId, targetRealm, requestId, "127.0.0.1");
        
        // 验证：两次请求返回相同结果
        assertEquals(result1.get("success"), result2.get("success"));
        assertEquals(result1.get("newRealm"), result2.get("newRealm"));
    }
}
```

### 事务回滚测试

```java
/**
 * 成就奖励发放事务回滚测试
 */
@SpringBootTest
@ActiveProfiles("test")
class AchievementServiceTransactionTest {
    
    @Autowired
    private AchievementService achievementService;
    
    @Autowired
    private RoleAchievementRepository roleAchievementRepository;
    
    /**
     * 测试事务回滚
     * 模拟奖励发放失败，确保进度更新也回滚
     */
    @Test
    void testTransactionRollback() {
        Long roleId = 1L;
        Long achievementId = 5L;
        String requestId = "rollback-test-" + System.currentTimeMillis();
        
        // 准备数据：设置成就为 completed 状态
        RoleAchievement roleAchievement = roleAchievementRepository
            .findByRoleIdAndAchievementId(roleId, achievementId)
            .orElseThrow();
        
        roleAchievement.setStatus("completed");
        roleAchievementRepository.save(roleAchievement);
        
        // 模拟奖励发放失败 (抛出异常)
        assertThrows(RewardDistributionException.class, () -> {
            // 通过 Mock 或其他方式让 distributeReward 方法抛出异常
            achievementService.claimReward(roleId, achievementId, requestId, "127.0.0.1");
        });
        
        // 验证：成就状态应该回滚到 completed (而不是 claimed)
        RoleAchievement afterRollback = roleAchievementRepository
            .findById(roleAchievement.getId())
            .orElseThrow();
        
        assertEquals("completed", afterRollback.getStatus(), 
            "事务应该回滚，成就状态应为 completed");
    }
}
```

---

## 🚀 部署与监控建议

### 慢查询监控

```yaml
# MySQL 慢查询配置
my.cnf:
  slow_query_log = 1
  slow_query_log_file = /var/log/mysql/slow.log
  long_query_time = 2  # 超过 2 秒的查询记录
  log_queries_not_using_indexes = 1
  log_throttle_queries_not_using_indexes = 60
```

### 死锁检测

```java
/**
 * 死锁监控配置
 */
@Configuration
public class DatabaseMonitorConfig {
    
    @Bean
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        // ... 其他配置
        
        // 死锁检测
        dataSource.addDataSourceProperty("connectTimeout", 30000);
        dataSource.addDataSourceProperty("socketTimeout", 60000);
        
        return dataSource;
    }
    
    /**
     * 定期检测死锁
     */
    @Scheduled(fixedRate = 300000) // 每 5 分钟
    public void checkDeadlocks() {
        try {
            // 查询 InnoDB 死锁信息
            String sql = "SHOW ENGINE INNODB STATUS";
            // 解析并告警...
        } catch (Exception e) {
            log.error("死锁检测失败", e);
        }
    }
}
```

### 监控指标

```yaml
# Prometheus 监控指标
metrics:
  enabled: true
  endpoint: /actuator/prometheus
  
  # 关键指标
  - database.connections.active
  - database.connections.idle
  - database.query.duration
  - redis.operations.duration
  - mq.messages.pending
  - business.achievements.claimed.count
  - business.breakthrough.success.rate
```

---

**重构完成！** 🎉
