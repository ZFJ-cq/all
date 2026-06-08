# 宗门系统功能梳理与完善方案

## 一、现有功能分析

### 1. 已有页面
- ✅ `clan/index.html` - 宗门主页（功能入口）
- ✅ `clan/clan.html` - 宗门详情页
- ✅ `clan/clan-list.html` - 宗门列表页
- ✅ `clan/sect-select.html` - 宗门选择页
- ✅ `clan/clan2.html` - 宗门地图页
- ✅ `clan/war.html` - 宗门战争（未完善）
- ✅ `clan/treasure.html` - 藏宝阁（未完善）
- ✅ `clan/contribution.html` - 宗门贡献（未完善）
- ✅ `clan/position.html` - 职位管理（未完善）

### 2. 已实现功能
- ✅ 宗门列表展示
- ✅ 加入宗门
- ✅ 退出宗门（叛出）
- ✅ 宗门信息展示
- ✅ 宗门建筑点击交互
- ✅ 新建宗门入口

### 3. 待完善功能
- ❌ 宗门成员管理
- ❌ 宗门职位系统
- ❌ 宗门贡献系统
- ❌ 宗门资源管理
- ❌ 宗门任务系统
- ❌ 宗门活动
- ❌ 宗门战争
- ❌ 宗门商店
- ❌ 宗门技能

---

## 二、完整功能体系设计

### 1. 宗门基础功能模块

#### 1.1 宗门创建
- [ ] 创建宗门表单
  - 宗门名称
  - 宗门宣言
  - 宗门图标选择
  - 初始资源消耗
- [ ] 宗门审核机制
- [ ] 创建者自动成为宗主

#### 1.2 加入/退出宗门
- [x] 浏览宗门列表
- [x] 申请加入宗门
- [x] 退出宗门（叛出）
- [ ] 宗门审核加入申请
- [ ] 被踢出宗门
- [ ] 宗门解散

#### 1.3 宗门信息展示
- [x] 宗门基本信息
  - 名称、等级、图标
  - 宗主、长老信息
  - 成员数量
  - 宗门资源
- [ ] 宗门公告
- [ ] 宗门历史
- [ ] 宗门成就

### 2. 宗门管理模块

#### 2.1 职位体系
```
职位层级：
- 宗主 (1 人)：最高权限
  - 修改宗门信息
  - 任免长老
  - 审批加入申请
  - 解散宗门
  - 发起宗门战争

- 副宗主 (2 人)：辅助管理
  - 审批加入申请
  - 任命精英弟子
  - 发布宗门任务

- 长老 (4 人)：核心成员
  - 审批加入申请
  - 任命/罢免普通弟子
  - 管理宗门资源

- 精英弟子：优秀成员
  - 更多资源配给
  - 特殊功法学习

- 普通弟子：基础成员
```

#### 2.2 成员管理
- [ ] 成员列表展示
- [ ] 成员信息查看
  - 贡献值
  - 活跃度
  - 加入时间
  - 职位
- [ ] 职位升降
- [ ] 踢出成员
- [ ] 成员活跃度统计

#### 2.3 宗门审核
- [ ] 加入申请列表
- [ ] 审核通过/拒绝
- [ ] 批量审核
- [ ] 申请黑名单

### 3. 宗门资源模块

#### 3.1 资源类型
```
- 宗门灵石：宗门货币
- 宗门贡献：个人贡献值
- 宗门建设度：宗门等级
- 宗门人气：影响力
```

#### 3.2 资源获取
- [ ] 成员每日贡献
- [ ] 宗门任务奖励
- [ ] 宗门战争掠夺
- [ ] 宗门副本奖励
- [ ] 成员充值返利

#### 3.3 资源消耗
- [ ] 宗门升级
- [ ] 建筑升级
- [ ] 资源兑换
- [ ] 宗门技能学习
- [ ] 宗门活动举办

#### 3.4 宗门商店
- [ ] 功法兑换
- [ ] 丹药兑换
- [ ] 法器兑换
- [ ] 材料兑换
- [ ] 特殊物品

### 4. 宗门互动模块

#### 4.1 宗门任务
- [ ] 日常任务
  - 签到任务
  - 贡献任务
  - 建设任务
- [ ] 周常任务
  - 团队副本
  - 宗门狩猎
- [ ] 特殊任务
  - 宗门庆典
  - 节日活动

#### 4.2 宗门活动
- [ ] 宗门会议
- [ ] 宗门大比
- [ ] 团队副本
- [ ] 资源争夺战
- [ ] 宗门联欢

#### 4.3 宗门聊天
- [ ] 宗门频道
- [ ] 宗门邮件
- [ ] 私信系统
- [ ] 公告通知

### 5. 宗门战争模块

#### 5.1 战争类型
- [ ] 宗门资源战
- [ ] 宗门排名战
- [ ] 宗门领地战
- [ ] 宗门荣誉战

#### 5.2 战争机制
- [ ] 宣战系统
- [ ] 应战系统
- [ ] 参战人员选择
- [ ] 战争奖励
- [ ] 战争惩罚

#### 5.3 战争统计
- [ ] 战绩统计
- [ ] 贡献排名
- [ ] 战利品分配
- [ ] 荣誉记录

### 6. 宗门建筑模块

#### 6.1 基础建筑
```
1. 宗门大殿
   - 宗门管理中心
   - 发布宗门公告
   - 查看宗门信息

2. 藏经阁
   - 学习宗门功法
   - 兑换秘籍
   - 功法研究

3. 炼丹房
   - 炼制丹药
   - 学习丹方
   - 丹药兑换

4. 炼器室
   - 炼制法器
   - 学习器谱
   - 法器强化

5. 演武场
   - 弟子切磋
   - 功法练习
   - 战力提升

6. 藏宝阁
   - 资源存储
   - 物品兑换
   - 宝物展示

7. 任务堂
   - 发布任务
   - 接取任务
   - 任务奖励

8. 聚灵阵
   - 提升修炼速度
   - 增加灵气浓度
   - 修炼加成
```

#### 6.2 建筑升级
- [ ] 建筑等级提升
- [ ] 解锁新功能
- [ ] 提升资源产量
- [ ] 增加容量上限

---

## 三、优先级规划

### Phase 1 - 核心功能（1-2 周）
1. ✅ 宗门加入/退出流程优化
2. ✅ 宗门信息展示完善
3. ⏳ 宗门成员列表
4. ⏳ 宗门职位系统基础
5. ⏳ 个人贡献系统

### Phase 2 - 管理功能（2-3 周）
1. ⏳ 职位权限管理
2. ⏳ 成员管理（升降职、踢出）
3. ⏳ 宗门审核系统
4. ⏳ 宗门公告系统
5. ⏳ 宗门商店基础

### Phase 3 - 互动功能（3-4 周）
1. ⏳ 宗门任务系统
2. ⏳ 宗门聊天系统
3. ⏳ 宗门活动系统
4. ⏳ 宗门建筑升级

### Phase 4 - 高级功能（4-6 周）
1. ⏳ 宗门战争系统
2. ⏳ 宗门副本
3. ⏳ 宗门排名
4. ⏳ 宗门联盟

---

## 四、数据库设计建议

### 4.1 宗门表 (clans)
```sql
CREATE TABLE clans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '宗门名称',
    logo VARCHAR(10) COMMENT '宗门图标 emoji',
    description VARCHAR(500) COMMENT '宗门描述',
    level INT DEFAULT 1 COMMENT '宗门等级',
    leader_id BIGINT NOT NULL COMMENT '宗主角色 ID',
    leader_name VARCHAR(50) COMMENT '宗主名称',
    members_count INT DEFAULT 1 COMMENT '成员数量',
    max_members INT DEFAULT 50 COMMENT '最大成员数',
    contribution BIGINT DEFAULT 0 COMMENT '宗门总贡献',
    spirit_stone BIGINT DEFAULT 0 COMMENT '宗门灵石',
    location VARCHAR(50) COMMENT '宗门位置',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4.2 宗门成员表 (clan_members)
```sql
CREATE TABLE clan_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    clan_id BIGINT NOT NULL COMMENT '宗门 ID',
    role_id BIGINT NOT NULL COMMENT '角色 ID',
    position TINYINT DEFAULT 0 COMMENT '职位：0 弟子，1 精英，2 长老，3 副宗主，4 宗主',
    contribution BIGINT DEFAULT 0 COMMENT '个人贡献',
    total_contribution BIGINT DEFAULT 0 COMMENT '累计贡献',
    join_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_time DATETIME,
    status TINYINT DEFAULT 1 COMMENT '状态：0 离线，1 在线',
    UNIQUE KEY uk_clan_role (clan_id, role_id)
);
```

### 4.3 宗门申请记录表 (clan_applications)
```sql
CREATE TABLE clan_applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    clan_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    role_name VARCHAR(50),
    role_level INT,
    realm VARCHAR(50),
    message VARCHAR(200) COMMENT '申请留言',
    status TINYINT DEFAULT 0 COMMENT '状态：0 待审核，1 通过，2 拒绝',
    reviewer_id BIGINT COMMENT '审核人 ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME
);
```

### 4.4 宗门任务表 (clan_tasks)
```sql
CREATE TABLE clan_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    clan_id BIGINT NOT NULL,
    task_type VARCHAR(20) COMMENT '任务类型',
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    requirement VARCHAR(200) COMMENT '完成要求',
    reward_contribution INT COMMENT '贡献奖励',
    reward_spirit_stone INT COMMENT '灵石奖励',
    publisher_id BIGINT COMMENT '发布者 ID',
    acceptor_id BIGINT COMMENT '接取者 ID',
    status TINYINT DEFAULT 0 COMMENT '状态',
    deadline DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.5 宗门公告表 (clan_notices)
```sql
CREATE TABLE clan_notices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    clan_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    publisher_id BIGINT NOT NULL,
    publisher_name VARCHAR(50),
    is_top BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 五、API 接口设计

### 5.1 宗门基础接口
```
GET    /api/clan              - 获取所有宗门列表
GET    /api/clan/{id}         - 获取宗门详情
POST   /api/clan              - 创建宗门
PUT    /api/clan/{id}         - 更新宗门信息
DELETE /api/clan/{id}         - 解散宗门
POST   /api/clan/{id}/join    - 申请加入宗门
POST   /api/clan/leave        - 退出宗门
```

### 5.2 成员管理接口
```
GET    /api/clan/{id}/members        - 获取成员列表
GET    /api/clan/member/{roleId}     - 获取角色宗门信息
PUT    /api/clan/member/{id}/position - 更新成员职位
DELETE /api/clan/member/{id}         - 踢出成员
GET    /api/clan/{id}/applications   - 获取申请列表
PUT    /api/clan/application/{id}    - 审核申请
```

### 5.3 资源管理接口
```
GET    /api/clan/{id}/resources      - 获取宗门资源
POST   /api/clan/contribute          - 提交贡献
GET    /api/clan/{id}/shop           - 获取商店物品
POST   /api/clan/shop/exchange       - 兑换物品
```

### 5.4 任务接口
```
GET    /api/clan/{id}/tasks          - 获取任务列表
POST   /api/clan/task                - 发布任务
PUT    /api/clan/task/{id}/accept    - 接取任务
PUT    /api/clan/task/{id}/complete  - 完成任务
DELETE /api/clan/task/{id}           - 取消任务
```

### 5.5 公告接口
```
GET    /api/clan/{id}/notices        - 获取公告列表
POST   /api/clan/notice              - 发布公告
PUT    /api/clan/notice/{id}         - 更新公告
DELETE /api/clan/notice/{id}         - 删除公告
```

---

## 六、前端页面优化建议

### 6.1 UI/UX 优化
1. 统一设计风格
2. 优化加载动画
3. 添加操作反馈
4. 完善错误提示
5. 优化移动端适配

### 6.2 性能优化
1. 数据缓存策略
2. 图片懒加载
3. 分页加载
4. 减少 API 请求
5. 使用 Web Worker

### 6.3 用户体验
1. 新手引导
2. 操作提示
3. 快捷操作
4. 收藏功能
5. 搜索功能

---

## 七、实施建议

### 7.1 开发顺序
1. 后端 API 优先
2. 数据库设计先行
3. 前端页面跟进
4. 联调测试
5. 优化迭代

### 7.2 测试重点
1. 权限控制测试
2. 数据一致性测试
3. 并发操作测试
4. 边界条件测试
5. 安全测试

### 7.3 上线计划
1. 内部测试（1 周）
2. 小范围公测（2 周）
3. 全量上线
4. 持续优化

---

## 八、风险与注意事项

### 8.1 技术风险
- 并发操作冲突
- 数据一致性
- 性能瓶颈
- 安全问题

### 8.2 运营风险
- 宗门垄断
- 恶意刷资源
- 玩家流失
- 平衡性问题

### 8.3 解决方案
- 完善的日志记录
- 数据备份机制
- 监控告警系统
- 快速回滚方案

---

**文档版本**: v1.0  
**创建时间**: 2026-03-11  
**最后更新**: 2026-03-11
