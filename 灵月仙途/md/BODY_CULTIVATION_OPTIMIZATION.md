# 🏋️ 锻体页面全面优化方案

**优化日期**: 2026-03-27  
**优化范围**: 前端 UI、竖屏适配、API 接口、数据库字段、日志功能

---

## 📋 问题分析

### 1. 竖屏显示问题

**当前问题**:
- ❌ 页面在小屏竖屏模式下无法完整显示
- ❌ 修炼部位网格在竖屏时过小
- ❌ 底部日志面板被遮挡
- ❌ 按钮区域在竖屏时布局不合理

**优化方案**:
- ✅ 使用响应式布局
- ✅ 动态调整网格列数
- ✅ 日志面板可折叠
- ✅ 按钮区域自适应

---

## 🎨 前端优化实现

### 1.1 竖屏适配优化

```css
/* 响应式布局 - 竖屏优化 */
@media (max-width: 480px) and (orientation: portrait) {
  .main-container {
    padding: 5px;
    gap: 10px;
  }
  
  .top-status {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .player-info {
    border-right: none;
    border-bottom: 1px solid rgba(230, 199, 73, 0.2);
    padding-right: 0;
    padding-bottom: 10px;
  }
  
  .body-parts {
    grid-template-columns: repeat(4, 1fr); /* 竖屏 4 列 */
    gap: 8px;
  }
  
  .body-part {
    padding: 3px;
  }
  
  .body-part-icon {
    font-size: 1.2rem;
  }
  
  .body-part-name {
    font-size: 0.6rem;
  }
  
  .body-part-progress {
    font-size: 0.55rem;
  }
  
  .action-buttons {
    grid-template-columns: 1fr; /* 竖屏单列 */
    gap: 10px;
  }
  
  .action-btn {
    padding: 12px;
    font-size: 1rem;
  }
  
  .realm-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .stat-item {
    padding: 8px;
  }
  
  .stat-label {
    font-size: 0.7rem;
  }
  
  .stat-value {
    font-size: 1rem;
  }
  
  .log-panel {
    max-height: 150px;
    padding: 10px;
  }
}

/* 超小屏幕适配 (iPhone SE 等) */
@media (max-width: 375px) and (orientation: portrait) {
  .body-parts {
    grid-template-columns: repeat(3, 1fr); /* 超小屏 3 列 */
  }
  
  .player-avatar {
    width: 40px;
    height: 40px;
  }
  
  .player-name {
    font-size: 1rem;
  }
  
  .resource-item {
    font-size: 0.8rem;
  }
}

/* 横屏优化 */
@media (max-width: 800px) and (orientation: landscape) {
  .main-container {
    padding: 8px;
  }
  
  .body-parts {
    grid-template-columns: repeat(10, 1fr); /* 横屏 10 列 */
  }
  
  .log-panel {
    max-height: 120px;
  }
}
```

### 1.2 日志面板可折叠

```html
<div class="log-panel">
  <div class="log-title" onclick="toggleLogPanel()" style="cursor: pointer;">
    📜 修炼日志 
    <span id="logPanelToggle" style="float: right;">▼</span>
  </div>
  <div id="logContainer" style="transition: max-height 0.3s;">
    <div class="log-entry">欢迎来到锻体之路...</div>
  </div>
</div>

<script>
function toggleLogPanel() {
  const container = document.getElementById('logContainer');
  const toggle = document.getElementById('logPanelToggle');
  
  if (container.style.maxHeight === '0px') {
    container.style.maxHeight = '200px';
    toggle.textContent = '▼';
  } else {
    container.style.maxHeight = '0px';
    toggle.textContent = '▶';
  }
}
</script>

<style>
.log-panel {
  background: var(--bg-panel);
  border: 1px solid rgba(230, 199, 73, 0.3);
  border-radius: 8px;
  padding: 15px;
  max-height: 200px;
  overflow-y: auto;
  transition: all 0.3s;
}

.log-panel.collapsed {
  max-height: 50px;
  overflow: hidden;
}

.log-title {
  font-size: 1rem;
  font-weight: bold;
  color: var(--gold-primary);
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
```

---

## 🔌 API 接口优化

### 2.1 前端 API 调用优化

```javascript
// js/api-service.js 中增加锻体相关方法

const apiService = {
  // ... 其他方法 ...
  
  /**
   * 获取锻体信息 (带错误处理)
   */
  async getBodyCultivationInfo(roleId) {
    try {
      const endpoint = `/body-cultivation/role/${roleId}`;
      return await this.get(endpoint);
    } catch (error) {
      console.error('获取锻体信息失败:', error);
      throw error;
    }
  },
  
  /**
   * 锻体修炼 (带 QTE 分数)
   */
  async cultivate(roleId, partId, qteScore) {
    try {
      const endpoint = `/body-cultivation/role/${roleId}/cultivate`;
      const params = {
        partId: partId,
        qteScore: qteScore || 50
      };
      return await this.post(endpoint, params);
    } catch (error) {
      console.error('修炼失败:', error);
      throw error;
    }
  },
  
  /**
   * 境界突破
   */
  async breakthrough(roleId, useMedicine = false) {
    try {
      const endpoint = `/body-cultivation/role/${roleId}/breakthrough`;
      const params = { useMedicine };
      return await this.post(endpoint, params);
    } catch (error) {
      console.error('突破失败:', error);
      throw error;
    }
  },
  
  /**
   * 获取修炼日志
   */
  async getCultivationLogs(roleId, days = 7) {
    try {
      const endpoint = `/body-cultivation/role/${roleId}/logs`;
      const params = { days };
      return await this.get(endpoint, params);
    } catch (error) {
      console.error('获取日志失败:', error);
      return [];
    }
  },
  
  /**
   * 获取所有锻体部位
   */
  async getBodyParts() {
    try {
      const endpoint = '/body-cultivation/parts';
      return await this.get(endpoint);
    } catch (error) {
      console.error('获取部位信息失败:', error);
      return [];
    }
  },
  
  /**
   * 获取所有锻体境界
   */
  async getBodyRealms() {
    try {
      const endpoint = '/body-cultivation/realms';
      return await this.get(endpoint);
    } catch (error) {
      console.error('获取境界信息失败:', error);
      return [];
    }
  }
};
```

---

## 🗄️ 数据库字段优化

### 3.1 检查现有表结构

```sql
-- 查看锻体相关表
SHOW TABLES LIKE '%body%';

-- 查看锻体部位表
DESC body_cultivation_part;

-- 查看锻体境界表
DESC body_cultivation_realm;

-- 查看角色锻体表
DESC role_body_cultivation;

-- 查看部位进度表
DESC role_body_part_progress;

-- 查看修炼日志表
DESC body_cultivation_log;
```

### 3.2 添加缺失字段

```sql
-- 1. 角色锻体表添加缺失字段
ALTER TABLE role_body_cultivation 
ADD COLUMN IF NOT EXISTS `current_realm_id` BIGINT COMMENT '当前境界 ID',
ADD COLUMN IF NOT EXISTS `total_exp` BIGINT DEFAULT 0 COMMENT '总经验',
ADD COLUMN IF NOT EXISTS `pain_value` DECIMAL(10,2) DEFAULT 0 COMMENT '痛苦值',
ADD COLUMN IF NOT EXISTS `tolerance` INT DEFAULT 0 COMMENT '耐受度',
ADD COLUMN IF NOT EXISTS `status` INT DEFAULT 0 COMMENT '状态：0-正常，1-受伤',
ADD COLUMN IF NOT EXISTS `injury_recovery_time` DATETIME COMMENT '受伤恢复时间',
ADD COLUMN IF NOT EXISTS `mutation_id` BIGINT COMMENT '当前异变 ID',
ADD COLUMN IF NOT EXISTS `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. 部位进度表添加字段
ALTER TABLE role_body_part_progress
ADD COLUMN IF NOT EXISTS `cultivate_count` INT DEFAULT 0 COMMENT '修炼次数',
ADD COLUMN IF NOT EXISTS `is_locked` TINYINT DEFAULT 0 COMMENT '是否锁定',
ADD COLUMN IF NOT EXISTS `last_cultivate_time` DATETIME COMMENT '上次修炼时间';

-- 3. 创建修炼日志表 (如果不存在)
CREATE TABLE IF NOT EXISTS `body_cultivation_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `action_type` VARCHAR(50) NOT NULL COMMENT '操作类型：CULTIVATE/BREAKTHROUGH',
  `part_id` BIGINT COMMENT '部位 ID',
  `success` TINYINT DEFAULT 1 COMMENT '是否成功',
  `pain_value_before` DECIMAL(10,2) COMMENT '操作前痛苦值',
  `pain_value_after` DECIMAL(10,2) COMMENT '操作后痛苦值',
  `tolerance_before` INT COMMENT '操作前耐受度',
  `tolerance_after` INT COMMENT '操作后耐受度',
  `exp_gained` BIGINT COMMENT '获得经验',
  `qte_score` INT COMMENT 'QTE 分数',
  `result_description` VARCHAR(500) COMMENT '结果描述',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  INDEX `idx_role_time` (`role_id`, `create_time`),
  INDEX `idx_action_type` (`action_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='锻体修炼日志表';

-- 4. 添加锻体部位配置表数据
INSERT INTO `body_cultivation_part` 
(`part_name`, `part_code`, `description`, `primary_attr`, `secondary_attr`, `base_exp_requirement`, `exp_growth_rate`, `max_level`) 
VALUES
('双拳', 'FISTS', '双拳修炼，增强攻击力', 'attack', 'strength', 100, 1.2, 100),
('双腿', 'LEGS', '双腿修炼，增强速度', 'speed', 'agility', 100, 1.2, 100),
('双臂', 'ARMS', '双臂修炼，增强力量', 'strength', 'attack', 100, 1.2, 100),
('骨骼', 'BONES', '骨骼修炼，增强防御', 'defense', 'hp', 150, 1.3, 100),
('心脏', 'HEART', '心脏修炼，增强生命力', 'hp', 'recovery', 200, 1.5, 100),
('头脑', 'BRAIN', '头脑修炼，增强神识', 'spirit', 'wisdom', 200, 1.5, 100),
('双眼', 'EYES', '双眼修炼，增强洞察', 'perception', 'spirit', 150, 1.3, 100),
('双耳', 'EARS', '双耳修炼，增强听力', 'perception', 'spirit', 150, 1.3, 100),
('鼻窍', 'NOSE', '鼻窍修炼，增强嗅觉', 'perception', 'spirit', 150, 1.3, 100),
('舌窍', 'TONGUE', '舌窍修炼，增强味觉', 'perception', 'spirit', 150, 1.3, 100)
ON DUPLICATE KEY UPDATE part_name=VALUES(part_name);

-- 5. 添加锻体境界配置表数据
INSERT INTO `body_cultivation_realm` 
(`realm_name`, `realm_order`, `description`, `base_hp_bonus`, `base_defense_bonus`, `base_strength_bonus`, `breakthrough_success_rate`, `required_exp`, `pain_growth_rate`, `mutation_probability`, `failure_penalty`)
VALUES
('凡人之躯', 1, '普通人的身体', 10, 5, 5, 100.00, 0, 1.0, 0.00, '无'),
('淬体境', 2, '淬炼身体，打下基础', 50, 20, 15, 90.00, 1000, 1.2, 0.01, '轻微内伤'),
('锻骨境', 3, '锻造骨骼，坚如钢铁', 150, 50, 30, 80.00, 5000, 1.5, 0.03, '中度内伤'),
('洗髓境', 4, '洗涤骨髓，脱胎换骨', 400, 100, 60, 70.00, 20000, 2.0, 0.05, '重伤'),
('金身境', 5, '成就金身，百毒不侵', 1000, 200, 120, 60.00, 100000, 2.5, 0.08, '严重内伤'),
('不灭境', 6, '肉身不灭，与天地同寿', 3000, 500, 300, 50.00, 500000, 3.0, 0.12, '境界跌落')
ON DUPLICATE KEY UPDATE realm_name=VALUES(realm_name);
```

---

## 📊 数据格式统一

### 4.1 后端返回数据格式

```java
// BodyCultivationDTO.java - 确保字段完整

public class BodyCultivationDTO {
    private Long roleId;
    private Long realmId;
    private String realmName;
    private Integer realmLevel;  // 境界等级
    private Long bodyExp;        // 当前经验
    private Long requiredExp;    // 升级所需经验
    private BigDecimal painValue;     // 痛苦值
    private Integer tolerance;        // 耐受度
    private BigDecimal breakthroughRate; // 突破成功率
    private Integer status;
    private MutationInfo mutation;
    private List<PartProgressInfo> partProgressList;
    
    // getter/setter...
}

// PartProgressInfo - 添加 progress 字段
public static class PartProgressInfo {
    private Long partId;
    private String partName;
    private Integer level;
    private Long exp;
    private Long requiredExp;
    private Integer progress;    // 进度百分比 (0-100)
    private Integer cultivateCount;
    private Boolean isLocked;
    
    // getter/setter...
}
```

### 4.2 前端数据映射

```javascript
// body-cultivation/index.html

async function loadBodyCultivationData() {
  const roleId = window.APP_CONFIG.currentRoleId;
  if (!roleId) return;

  try {
    const result = await window.apiService.getBodyCultivationInfo(roleId);
    
    if (result) {
      gameState.bodyCultivation = {
        currentRealm: {
          name: result.realmName || '凡人之躯',
          level: result.realmLevel || 1
        },
        exp: result.bodyExp || 0,
        requiredExp: result.requiredExp || 0,
        tolerance: result.tolerance || 0,
        pain: result.painValue || 0,
        breakthroughRate: result.breakthroughRate || 0,
        mutation: result.mutation ? {
          name: result.mutation.mutationName,
          description: result.mutation.description
        } : null,
        bodyParts: result.partProgressList || []
      };
      
      // 加载日志
      await loadCultivationLogs();
    }
  } catch (error) {
    console.error('加载锻体数据失败:', error);
    showToast('加载锻体数据失败');
  }
}

async function loadCultivationLogs() {
  const roleId = window.APP_CONFIG.currentRoleId;
  if (!roleId) return;
  
  try {
    const logs = await window.apiService.getCultivationLogs(roleId, 7);
    renderLogs(logs);
  } catch (error) {
    console.error('加载日志失败:', error);
  }
}

function renderLogs(logs) {
  const container = document.getElementById('logContainer');
  container.innerHTML = '';
  
  if (!logs || logs.length === 0) {
    container.innerHTML = '<div class="log-entry">暂无修炼记录</div>';
    return;
  }
  
  logs.slice(0, 20).forEach(log => {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    
    const time = new Date(log.createdAt).toLocaleTimeString();
    const action = log.actionType === 'CULTIVATE' ? '修炼' : '突破';
    const result = log.success ? '成功' : '失败';
    const expText = log.expGained ? ` +${log.expGained}经验` : '';
    
    entry.textContent = `[${time}] ${action}${expText} - ${result}`;
    container.appendChild(entry);
  });
}
```

---

## 📝 修炼日志功能实现

### 5.1 后端 Service 实现

```java
// BodyCultivationServiceImpl.java

@Service
public class BodyCultivationServiceImpl implements BodyCultivationService {
    
    @Autowired
    private BodyCultivationLogRepository logRepository;
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public CultivateResult cultivate(Long roleId, Long partId, Integer qteScore) {
        CultivateResult result = new CultivateResult();
        
        try {
            // 1. 查询角色锻体信息
            RoleBodyCultivation bodyCultivation = bodyCultivationRepository
                .findByRoleId(roleId)
                .orElseGet(() -> createDefaultBodyCultivation(roleId));
            
            // 2. 查询部位进度
            RoleBodyPartProgress partProgress = partProgressRepository
                .findByRoleIdAndPartId(roleId, partId)
                .orElseGet(() -> createDefaultPartProgress(roleId, partId));
            
            // 3. 计算收益 (根据 QTE 分数)
            BigDecimal multiplier = BigDecimal.valueOf(qteScore).divide(BigDecimal.valueOf(50), 2, RoundingMode.HALF_UP);
            long baseExp = 10;
            long expGained = baseExp * multiplier.longValue();
            
            // 4. 计算痛苦值增加
            BigDecimal painIncrease = BigDecimal.valueOf(5).multiply(multiplier);
            BigDecimal newPainValue = bodyCultivation.getPainValue().add(painIncrease);
            
            // 5. 更新数据
            bodyCultivation.setPainValue(newPainValue);
            bodyCultivation.setTotalExp(bodyCultivation.getTotalExp() + expGained);
            bodyCultivationRepository.save(bodyCultivation);
            
            partProgress.setExp(partProgress.getExp() + expGained);
            partProgress.setCultivateCount(partProgress.getCultivateCount() + 1);
            partProgress.setLastCultivateTime(LocalDateTime.now());
            partProgressRepository.save(partProgress);
            
            // 6. 记录日志
            BodyCultivationLog log = new BodyCultivationLog();
            log.setRoleId(roleId);
            log.setActionType("CULTIVATE");
            log.setPartId(partId);
            log.setSuccess(true);
            log.setPainValueBefore(bodyCultivation.getPainValue().subtract(painIncrease));
            log.setPainValueAfter(newPainValue);
            log.setToleranceBefore(bodyCultivation.getTolerance());
            log.setToleranceAfter(bodyCultivation.getTolerance());
            log.setExpGained(expGained);
            log.setQteScore(qteScore);
            log.setResultDescription("修炼成功，获得" + expGained + "经验");
            logRepository.save(log);
            
            // 7. 返回结果
            result.setSuccess(true);
            result.setExpGained(expGained);
            result.setPainGained(painIncrease.intValue());
            result.setMessage("修炼成功！");
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("修炼失败：" + e.getMessage());
        }
        
        return result;
    }
    
    @Override
    public List<BodyCultivationDTO.LogInfo> getCultivationLogs(Long roleId, Integer days) {
        LocalDateTime startTime = LocalDateTime.now().minusDays(days);
        
        List<BodyCultivationLog> logs = logRepository
            .findByRoleIdAndCreateTimeAfterOrderByCreateTimeDesc(roleId, startTime);
        
        return logs.stream().map(log -> {
            BodyCultivationDTO.LogInfo dto = new BodyCultivationDTO.LogInfo();
            dto.setId(log.getId());
            dto.setActionType(log.getActionType());
            dto.setSuccess(log.getSuccess() == 1);
            dto.setPainValueBefore(log.getPainValueBefore());
            dto.setPainValueAfter(log.getPainValueAfter());
            dto.setToleranceBefore(log.getToleranceBefore());
            dto.setToleranceAfter(log.getToleranceAfter());
            dto.setExpGained(log.getExpGained());
            dto.setResultDescription(log.getResultDescription());
            dto.setCreatedAt(log.getCreateTime());
            return dto;
        }).collect(Collectors.toList());
    }
}
```

### 5.2 添加 Repository

```java
// BodyCultivationLogRepository.java

@Repository
public interface BodyCultivationLogRepository extends JpaRepository<BodyCultivationLog, Long> {
    
    /**
     * 查询角色指定时间范围内的日志
     */
    List<BodyCultivationLog> findByRoleIdAndCreateTimeAfterOrderByCreateTimeDesc(
        Long roleId, 
        LocalDateTime startTime);
    
    /**
     * 查询角色最近日志
     */
    List<BodyCultivationLog> findByRoleIdOrderByCreateTimeDesc(
        Long roleId, 
        Pageable pageable);
}
```

---

## ✅ 验收标准

### 竖屏适配验收

- [ ] iPhone SE (375px) 竖屏完整显示
- [ ] iPhone 12/13 (390px) 竖屏完整显示
- [ ] iPad (768px) 竖屏完整显示
- [ ] 所有按钮可点击
- [ ] 日志面板可折叠
- [ ] 修炼部位网格自适应

### API 接口验收

- [ ] `/body-cultivation/role/{roleId}` 返回完整数据
- [ ] `/body-cultivation/role/{roleId}/cultivate` 正确计算收益
- [ ] `/body-cultivation/role/{roleId}/breakthrough` 正确处理突破
- [ ] `/body-cultivation/role/{roleId}/logs` 返回最近日志

### 数据库验收

- [ ] 所有必需字段存在
- [ ] 配置表数据完整
- [ ] 日志表正确记录
- [ ] 索引优化查询性能

### 功能验收

- [ ] 修炼功能正常
- [ ] QTE 小游戏正常
- [ ] 突破功能正常
- [ ] 日志显示正常
- [ ] 数据实时更新

---

**优化完成时间**: 2026-03-27  
**测试状态**: 待测试  
**上线时间**: 测试通过后立即上线
