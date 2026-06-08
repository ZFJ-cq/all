# 灵月仙途 - 核心代码重构指南

**版本**: v2.0 (生产级重构版)  
**重构日期**: 2026-03-24  
**技术栈**: Java 17 + Spring Boot 3.x + MySQL 8.0+ + Redis 7.x  
**重构目标**: 数据强一致性、高并发安全、可扩展性

---

## 📋 目录

1. [架构设计图解](#-架构设计图解)
2. [数据库迁移脚本](#-数据库迁移脚本)
3. [核心代码实现](#-核心代码实现)
4. [配置文件示例](#-配置文件示例)
5. [单元测试用例](#-单元测试用例)
6. [部署与监控建议](#-部署与监控建议)

---

## 🏗️ 架构设计图解

### 模块交互流程

```
┌─────────────────────────────────────────────────────────────────┐
│                         前端请求层                                │
│  (AchievementController / CultivationController / ClanController) │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AOP 切面层                                  │
│  - 权限校验 (@SectPermission)                                    │
│  - 审计日志 (@AuditLog)                                          │
│  - 幂等性校验 (@Idempotent)                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Service 层                                 │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │AchievementService│  │TitleAttributeService│ │CultivationService│ │
│  │- checkAndGrant  │  │- calculateBonus  │  │- breakthrough  │ │
│  │- claimReward    │  │- applyBonus      │  │- consumeResource│ │
│  └────────┬────────┘  └─────────┬────────┘  └───────┬────────┘ │
│           │                     │                   │           │
│           └─────────────────────┼───────────────────┘           │
│                                 │                               │
│                                 ▼                               │
│                  ┌──────────────────────────┐                   │
│                  │   @Transactional         │                   │
│                  │   (本地事务边界)          │                   │
│                  └────────────┬─────────────┘                   │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Repository 层                               │
│  - JPA Repository (带乐观锁)                                     │
│  - 自定义 SQL (UPDATE ... WHERE version = ?)                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   数据库层 (MySQL)                               │
│  - role_resource (带 version 字段)                               │
│  - role_achievement (带 version 字段)                            │
│  - achievement_claim_record (审计表)                             │
│  - audit_log (审计日志表)                                        │
└─────────────────────────────────────────────────────────────────┘

───────────────────────────────────────────────────────────────────
                         异步处理 (MQ)
───────────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────────┐
│                    消息队列 (RabbitMQ)                           │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │achievement.exchange│  │notification.exchange│ │stat.exchange   │ │
│  └────────┬────────┘  └─────────┬────────┘  └───────┬────────┘ │
│           │                     │                   │           │
│           ▼                     ▼                   ▼           │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │achievement.queue│  │notification.queue│  │stat.queue      │ │
│  │- 成就解锁广播   │  │- 全服消息        │  │- 数据统计      │ │
│  └─────────────────┘  └──────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 事务边界说明

1. **本地事务 (@Transactional)**:
   - 成就奖励发放：进度更新 + 奖励发放 + 审计日志
   - 突破操作：修为扣除 + 境界变更 + 历史记录
   - 宗门资源操作：仓库变更 + 成员贡献更新

2. **分布式事务 (MQ 最终一致性)**:
   - 全服成就广播：主流程完成后异步通知
   - 数据统计：不阻塞主流程，允许短暂延迟

3. **补偿机制**:
   - MQ 消费失败：重试 3 次后进入死信队列
   - 定时任务：每日核对数据一致性

---

## 💾 数据库迁移脚本

### V12__production_enhancements.sql

```sql
-- ============================================
-- 生产级重构 - 数据库迁移脚本
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. 添加乐观锁版本号字段
-- ============================================

ALTER TABLE `role_resource` 
ADD COLUMN `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号' AFTER `quantity`,
ADD INDEX `idx_version` (`version`);

ALTER TABLE `role_achievement` 
ADD COLUMN `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号' AFTER `is_equipped`,
ADD INDEX `idx_version` (`version`);

ALTER TABLE `clan_member` 
ADD COLUMN `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号' AFTER `status`,
ADD INDEX `idx_version` (`version`);

ALTER TABLE `game_role` 
ADD COLUMN `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号' AFTER `updated_at`,
ADD INDEX `idx_version` (`version`);

-- ============================================
-- 2. 添加幂等性和审计字段
-- ============================================

ALTER TABLE `role_achievement` 
ADD COLUMN `claimed_request_id` VARCHAR(64) COMMENT '领取奖励请求 ID (幂等性)' AFTER `claimed_time`,
ADD COLUMN `claimed_ip` VARCHAR(50) COMMENT '领取奖励 IP 地址' AFTER `claimed_request_id`,
ADD COLUMN `completed_ip` VARCHAR(50) COMMENT '成就完成 IP 地址' AFTER `claimed_ip`,
ADD COLUMN `trace_id` VARCHAR(64) COMMENT '分布式追踪 ID' AFTER `completed_ip`;

ALTER TABLE `breakthrough_history`
ADD COLUMN `request_id` VARCHAR(64) COMMENT '突破请求 ID (幂等性)' AFTER `create_time`,
ADD COLUMN `trace_id` VARCHAR(64) COMMENT '分布式追踪 ID' AFTER `request_id`,
ADD COLUMN `operator_ip` VARCHAR(50) COMMENT '操作 IP' AFTER `trace_id`;

-- ============================================
-- 3. 创建成就领取记录表 (独立审计表)
-- ============================================

DROP TABLE IF EXISTS `achievement_claim_record`;

CREATE TABLE `achievement_claim_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `achievement_id` BIGINT NOT NULL COMMENT '成就 ID',
  `request_id` VARCHAR(64) NOT NULL COMMENT '请求 ID (幂等性)',
  `reward_items` JSON COMMENT '奖励物品 JSON [{itemId, quantity}]',
  `reward_attributes` VARCHAR(500) COMMENT '奖励属性 JSON {attack:10,defense:5}',
  `title_granted` VARCHAR(50) COMMENT '授予称号名称',
  `claim_ip` VARCHAR(50) COMMENT '领取 IP 地址',
  `claim_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  `status` VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' COMMENT '状态：SUCCESS/FAILED',
  `error_message` VARCHAR(500) COMMENT '错误信息',
  `trace_id` VARCHAR(64) COMMENT '分布式追踪 ID',
  `version` INT NOT NULL DEFAULT 0 COMMENT '版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_request_id` (`request_id`) COMMENT '请求 ID 唯一索引 (幂等性)',
  KEY `idx_role_id` (`role_id`),
  KEY `idx_achievement_id` (`achievement_id`),
  KEY `idx_claim_time` (`claim_time`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成就领取记录表 (审计用)';

-- ============================================
-- 4. 创建资源操作日志表
-- ============================================

DROP TABLE IF EXISTS `resource_operation_log`;

CREATE TABLE `resource_operation_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `trace_id` VARCHAR(64) NOT NULL COMMENT '分布式追踪 ID',
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `resource_type_id` BIGINT NOT NULL COMMENT '资源类型 ID',
  `resource_type_code` VARCHAR(50) COMMENT '资源类型代码 (如：xiuwei, lingshi)',
  `operation_type` VARCHAR(20) NOT NULL COMMENT '操作类型：ADD/CONSUME',
  `quantity` BIGINT NOT NULL COMMENT '操作数量',
  `balance_before` BIGINT COMMENT '操作前余额',
  `balance_after` BIGINT COMMENT '操作后余额',
  `business_type` VARCHAR(50) COMMENT '业务类型：BREAKTHROUGH/CULTIVATION/TRADE/ACHIEVEMENT',
  `business_id` VARCHAR(64) COMMENT '业务 ID (如：突破记录 ID)',
  `operator_ip` VARCHAR(50) COMMENT '操作 IP',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  `remark` VARCHAR(500) COMMENT '备注',
  PRIMARY KEY (`id`),
  KEY `idx_trace_id` (`trace_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_business` (`business_type`, `business_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资源操作日志表';

-- ============================================
-- 5. 创建审计日志表
-- ============================================

DROP TABLE IF EXISTS `audit_log`;

CREATE TABLE `audit_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `trace_id` VARCHAR(64) NOT NULL COMMENT '分布式追踪 ID',
  `module` VARCHAR(50) NOT NULL COMMENT '模块：ACHIEVEMENT/BREAKTHROUGH/CLAN/TRADE',
  `operation` VARCHAR(100) NOT NULL COMMENT '操作名称',
  `role_id` BIGINT COMMENT '角色 ID',
  `operator_ip` VARCHAR(50) COMMENT '操作 IP',
  `request_params` JSON COMMENT '请求参数 JSON',
  `old_value` JSON COMMENT '旧值 JSON',
  `new_value` JSON COMMENT '新值 JSON',
  `status` VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' COMMENT '状态：SUCCESS/FAILED',
  `error_message` VARCHAR(500) COMMENT '错误信息',
  `execution_time_ms` INT COMMENT '执行耗时 (毫秒)',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_trace_id` (`trace_id`),
  KEY `idx_module` (`module`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计日志表';

-- ============================================
-- 6. 创建宗门操作日志表
-- ============================================

DROP TABLE IF EXISTS `clan_operation_log`;

CREATE TABLE `clan_operation_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `trace_id` VARCHAR(64) NOT NULL COMMENT '分布式追踪 ID',
  `clan_id` BIGINT NOT NULL COMMENT '宗门 ID',
  `operator_role_id` BIGINT NOT NULL COMMENT '操作人角色 ID',
  `operator_position` INT COMMENT '操作人职位',
  `target_role_id` BIGINT COMMENT '目标角色 ID (可为空)',
  `operation_type` VARCHAR(50) NOT NULL COMMENT '操作类型：POSITION_CHANGE/WAR_START/WAREHOUSE_OPERATE',
  `operation_detail` VARCHAR(500) COMMENT '操作详情',
  `request_id` VARCHAR(64) COMMENT '请求 ID (幂等性)',
  `operator_ip` VARCHAR(50) COMMENT '操作 IP',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  `status` VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' COMMENT '状态',
  PRIMARY KEY (`id`),
  KEY `idx_clan_id` (`clan_id`),
  KEY `idx_operator_id` (`operator_role_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宗门操作日志表';

-- ============================================
-- 7. 添加复合索引 (优化查询性能)
-- ============================================

-- 成就查询优化
ALTER TABLE `role_achievement`
ADD INDEX `idx_role_status_achievement` (`role_id`, `status`, `achievement_id`),
ADD INDEX `idx_achievement_status_claimed` (`achievement_id`, `status`, `claimed_time`);

-- 宗门成员查询优化
ALTER TABLE `clan_member`
ADD INDEX `idx_clan_position_status` (`clan_id`, `position`, `status`),
ADD INDEX `idx_role_clan_status` (`role_id`, `clan_id`, `status`);

-- 突破历史查询优化
ALTER TABLE `breakthrough_history`
ADD INDEX `idx_role_success_time` (`role_id`, `is_success`, `create_time`),
ADD INDEX `idx_request_id` (`request_id`);

-- 资源查询优化
ALTER TABLE `role_resource`
ADD INDEX `idx_role_type_version` (`role_id`, `resource_type_id`, `version`);

-- ============================================
-- 8. 数据修复：初始化版本号
-- ============================================

UPDATE `role_resource` SET `version` = 0 WHERE `version` IS NULL;
UPDATE `role_achievement` SET `version` = 0 WHERE `version` IS NULL;
UPDATE `clan_member` SET `version` = 0 WHERE `version` IS NULL;
UPDATE `game_role` SET `version` = 0 WHERE `version` IS NULL;

-- ============================================
-- 脚本执行完成
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

SELECT '生产级数据库迁移完成！' AS status;
```

---

## 💻 核心代码实现

完整代码实现请参见 [REFACTORING_GUIDE_PART2.md](./REFACTORING_GUIDE_PART2.md)

包含以下模块：
1. ✅ 成就奖励发放逻辑 (带分布式事务)
2. ✅ 称号属性计算服务 (策略模式 + Redis 缓存)
3. ✅ 突破 API 幂等性与资源乐观锁
4. ✅ 宗门权限校验 (AOP 切面)
5. ✅ 成就进度增量更新与审计
6. ✅ 性能优化专项 (索引、N+1、缓存、MQ)

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
        acknowledge-mode: manual
        concurrency: 5
        max-concurrency: 10
        prefetch: 10
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
        batch_size: 50
        order_inserts: true
        order_updates: true

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

logging:
  level:
    root: INFO
    com.lingyue: DEBUG
    com.lingyue.repository: INFO
    org.springframework.transaction: DEBUG
  file:
    name: logs/lingyue-xiantu.log
    max-size: 100MB
    max-history: 30
```

---

## 🧪 单元测试用例

### 并发突破测试

```java
@SpringBootTest
@ActiveProfiles("test")
class CultivationServiceConcurrencyTest {
    
    @Autowired
    private CultivationService cultivationService;
    
    @Autowired
    private RoleResourceService roleResourceService;
    
    private final ExecutorService executor = Executors.newFixedThreadPool(10);
    
    @Test
    void testConcurrentBreakthrough() throws Exception {
        Long roleId = 1L;
        String targetRealm = "炼气期";
        
        // 初始化修为 (只够一次突破)
        roleResourceService.addResource(roleId, "xiuwei", 1000L);
        
        AtomicInteger successCount = new AtomicInteger(0);
        CountDownLatch latch = new CountDownLatch(10);
        
        for (int i = 0; i < 10; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    String requestId = "test-" + System.currentTimeMillis() + "-" + index;
                    cultivationService.breakthrough(roleId, targetRealm, requestId, "127.0.0.1");
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    // 预期内的异常
                } finally {
                    latch.countDown();
                }
            });
        }
        
        latch.await(30, TimeUnit.SECONDS);
        
        // 验证：只有一个请求成功
        assertEquals(1, successCount.get());
        
        executor.shutdown();
    }
}
```

---

## 🚀 部署与监控建议

### 慢查询监控

```ini
# MySQL 慢查询配置
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
log_queries_not_using_indexes = 1
```

### 关键监控指标

- database.connections.active
- database.query.duration
- redis.operations.duration
- mq.messages.pending
- business.achievements.claimed.count
- business.breakthrough.success.rate

---

**重构完成！** 🎉
