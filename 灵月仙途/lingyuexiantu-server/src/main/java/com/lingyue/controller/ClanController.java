package com.lingyue.controller;

import com.lingyuexiantu.common.Result;
import com.lingyue.entity.Clan;
import com.lingyue.entity.ClanBuilding;
import com.lingyue.entity.ClanChatMessage;
import com.lingyue.entity.ClanMember;
import com.lingyue.entity.ClanMemberTask;
import com.lingyue.entity.ClanShopItem;
import com.lingyue.entity.ClanSkill;
import com.lingyue.entity.ClanTask;
import com.lingyue.entity.GameRole;
import com.lingyue.entity.RoleClanSkill;
import com.lingyue.entity.SectApply;
import com.lingyue.handler.ClanWebSocketHandler;
import com.lingyue.repository.ClanBuildingRepository;
import com.lingyue.repository.ClanChatMessageRepository;
import com.lingyue.repository.ClanMemberRepository;
import com.lingyue.repository.ClanMemberTaskRepository;
import com.lingyue.repository.ClanRepository;
import com.lingyue.repository.ClanShopItemRepository;
import com.lingyue.repository.ClanSkillRepository;
import com.lingyue.repository.ClanTaskRepository;
import com.lingyue.repository.GameRoleRepository;
import com.lingyue.repository.RoleClanSkillRepository;
import com.lingyue.repository.SectApplyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/clan")
public class ClanController {
    
    private static final Logger logger = LoggerFactory.getLogger(ClanController.class);
    
    private final ClanRepository clanRepository;
    private final ClanMemberRepository clanMemberRepository;
    private final GameRoleRepository gameRoleRepository;
    private final SectApplyRepository sectApplyRepository;
    private final ClanSkillRepository clanSkillRepository;
    private final RoleClanSkillRepository roleClanSkillRepository;
    private final ClanWebSocketHandler clanWebSocketHandler;
    
    @Autowired
    private ClanChatMessageRepository clanChatMessageRepository;
    
    @Autowired
    private ClanShopItemRepository clanShopItemRepository;
    
    @Autowired
    private ClanTaskRepository clanTaskRepository;
    
    @Autowired
    private ClanBuildingRepository clanBuildingRepository;
    
    @Autowired
    private ClanMemberTaskRepository clanMemberTaskRepository;
    
    public ClanController(ClanRepository clanRepository, ClanMemberRepository clanMemberRepository, GameRoleRepository gameRoleRepository, SectApplyRepository sectApplyRepository, ClanSkillRepository clanSkillRepository, RoleClanSkillRepository roleClanSkillRepository, ClanWebSocketHandler clanWebSocketHandler) {
        this.clanRepository = clanRepository;
        this.clanMemberRepository = clanMemberRepository;
        this.gameRoleRepository = gameRoleRepository;
        this.sectApplyRepository = sectApplyRepository;
        this.clanSkillRepository = clanSkillRepository;
        this.roleClanSkillRepository = roleClanSkillRepository;
        this.clanWebSocketHandler = clanWebSocketHandler;
    }
    
    // 获取所有宗门
    @GetMapping("/all")
    public Result<List<Map<String, Object>>> getAllClans() {
        try {
            List<Clan> clans = clanRepository.findAll();
            
            List<Map<String, Object>> clanList = clans.stream().map(clan -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", clan.getId());
                item.put("name", clan.getName());
                item.put("level", clan.getLevel());
                item.put("memberCount", clan.getMembersCount());
                item.put("maxMembers", clan.getMaxMembers());
                item.put("leaderName", clan.getLeaderName());
                item.put("activityPercent", 50);
                item.put("activityLevel", "中");
                item.put("createTime", "");
                item.put("status", clan.getStatus() != null ? clan.getStatus() : "normal");
                // 添加前端需要的字段
                item.put("strength", clan.getLevel() * 100 + clan.getMembersCount() * 10);
                item.put("joinDifficulty", clan.getLevel() * 20); // 加入难度
                item.put("minRealm", clan.getLevel()); // 最低境界要求
                item.put("joinContribution", clan.getLevel() * 100); // 加入贡献要求
                item.put("recommendedAttributes", getRecommendedAttributes(clan.getLevel())); // 推荐属性
                item.put("description", clan.getDescription() != null ? clan.getDescription() : "这是一个古老的宗门，传承着强大的修炼之法。"); // 宗门描述
                item.put("type", clan.getLevel() >= 4 ? "top" : "element"); // 宗门类型
                return item;
            }).collect(Collectors.toList());
            
            return Result.success(clanList);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取宗门列表失败：" + e.getMessage());
        }
    }
    
    // 根据宗门等级获取推荐属性
    private String getRecommendedAttributes(int level) {
        switch (level) {
            case 5:
                return "悟性,根骨,福缘";
            case 4:
                return "悟性,根骨";
            case 3:
                return "根骨,灵力";
            case 2:
                return "灵力,体质";
            case 1:
                return "体质,敏捷";
            default:
                return "无";
        }
    }
    
    // 获取宗门详情
    @GetMapping("/{id}")
    public Result<Map<String, Object>> getClanDetail(@PathVariable Long id) {
        try {
            Clan clan = clanRepository.findById(id).orElse(null);
            if (clan == null) {
                return Result.error("宗门不存在");
            }
            
            Map<String, Object> detail = new HashMap<>();
            detail.put("id", clan.getId());
            detail.put("name", clan.getName());
            detail.put("level", clan.getLevel());
            detail.put("description", clan.getDescription() != null ? clan.getDescription() : "这是一个古老的宗门，传承着强大的修炼之法。");
            detail.put("memberCount", clan.getMembersCount());
            detail.put("maxMembers", clan.getMaxMembers());
            detail.put("leaderName", clan.getLeaderName());
            detail.put("status", clan.getStatus() != null ? clan.getStatus() : "normal");
            detail.put("clanFund", 0);
            detail.put("strength", clan.getLevel() * 100 + clan.getMembersCount() * 10);
            detail.put("joinDifficulty", clan.getLevel() * 20); // 加入难度
            detail.put("minRealm", clan.getLevel()); // 最低境界要求
            detail.put("joinContribution", clan.getLevel() * 100); // 加入贡献要求
            detail.put("recommendedAttributes", getRecommendedAttributes(clan.getLevel())); // 推荐属性
            detail.put("type", clan.getLevel() >= 4 ? "top" : "element"); // 宗门类型
            
            List<ClanMember> members = clanMemberRepository.findByClanId(id);
            List<Map<String, Object>> memberList = members.stream().map(member -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", member.getId());
                item.put("roleId", member.getRoleId());
                item.put("roleName", getRoleNameById(member.getRoleId()));
                item.put("position", getPositionName(member.getPosition()));
                item.put("joinTime", member.getJoinTime());
                item.put("contribution", member.getContribution());
                return item;
            }).collect(Collectors.toList());
            
            detail.put("members", memberList);
            
            return Result.success(detail);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取宗门详情失败：" + e.getMessage());
        }
    }
    
    private String getRoleNameById(Long roleId) {
        return gameRoleRepository.findById(roleId)
            .map(GameRole::getRoleName)
            .orElse("未知角色");
    }
    
    private String getPositionName(Integer position) {
        if (position == null) return "普通弟子";
        switch (position) {
            case 1: return "宗主";
            case 2: return "长老";
            case 3: return "精英弟子";
            case 4: return "普通弟子";
            default: return "普通弟子";
        }
    }
    
    // 获取宗门列表（带分页）
    @GetMapping("/list")
    public Result<Map<String, Object>> getClanList(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            List<Clan> allClans = clanRepository.findAll();
            
            // 筛选
            if (name != null && !name.isEmpty()) {
                allClans = allClans.stream()
                    .filter(c -> c.getName() != null && c.getName().contains(name))
                    .collect(Collectors.toList());
            }
            
            // 分页
            int total = allClans.size();
            int totalPages = (int) Math.ceil((double) total / size);
            int pageIndex = page - 1;
            if (pageIndex < 0) pageIndex = 0;
            int fromIndex = pageIndex * size;
            int toIndex = Math.min(fromIndex + size, total);
            
            List<Map<String, Object>> clanList;
            if (fromIndex < total) {
                clanList = allClans.subList(fromIndex, toIndex).stream().map(clan -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", clan.getId());
                    item.put("name", clan.getName());
                    item.put("level", clan.getLevel());
                    item.put("memberCount", clan.getMembersCount());
                    item.put("maxMembers", clan.getMaxMembers());
                    item.put("leaderName", clan.getLeaderName());
                    item.put("activityPercent", 50);
                    item.put("activityLevel", "中");
                    item.put("status", clan.getStatus() != null ? clan.getStatus() : "normal");
                    return item;
                }).collect(Collectors.toList());
            } else {
                clanList = List.of();
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("list", clanList);
            result.put("total", total);
            result.put("totalPages", totalPages);
            result.put("pageNum", page);
            result.put("pageSize", size);
            
            return Result.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取宗门列表失败：" + e.getMessage());
        }
    }
    
    // 获取宗门统计信息
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getClanStatistics() {
        try {
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalClans", clanRepository.count());
            statistics.put("activeClans", clanRepository.findAll().stream().filter(c -> "active".equals(c.getStatus())).count());
            statistics.put("totalMembers", clanMemberRepository.count());
            statistics.put("avgLevel", clanRepository.findAll().stream().mapToInt(Clan::getLevel).average().orElse(0.0));
            statistics.put("todayActive", 0);
            statistics.put("warningClans", 0);
            
            return Result.success(statistics);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取宗门统计信息失败：" + e.getMessage());
        }
    }
    
    // 申请加入宗门
    @PostMapping("/apply/join")
    @Transactional(rollbackFor = Exception.class)
    public Result<Map<String, Object>> applyJoinClan(@RequestBody Map<String, Object> request) {
        try {
            Long roleId = Long.valueOf(request.get("roleId").toString());
            Long clanId = Long.valueOf(request.get("clanId").toString());
            String message = request.get("message") != null ? request.get("message").toString() : "";
            
            GameRole role = gameRoleRepository.findById(roleId).orElse(null);
            if (role == null) {
                return Result.error("角色不存在");
            }
            
            Clan clan = clanRepository.findById(clanId).orElse(null);
            if (clan == null) {
                return Result.error("宗门不存在");
            }
            
            // 检查角色是否已加入其他宗门
            ClanMember existingMember = clanMemberRepository.findByRoleId(roleId);
            if (existingMember != null) {
                return Result.error("您已加入其他宗门");
            }
            
            // 检查宗门是否已满
            if (clan.getMembersCount() >= clan.getMaxMembers()) {
                return Result.error("宗门已满");
            }
            
            // 检查是否已有待审核的申请
            int pendingCount = sectApplyRepository.countPendingApplications(roleId, clanId);
            if (pendingCount > 0) {
                return Result.error("您已提交申请，请等待审批");
            }
            
            // 检查角色等级是否满足要求
            if (role.getLevel() < clan.getRequiredLevel()) {
                return Result.error("等级不足，需要达到" + clan.getRequiredLevel() + "级");
            }
            
            // 创建申请记录
            SectApply apply = new SectApply();
            apply.setUserId(roleId);
            apply.setSectId(clanId);
            apply.setMessage(message);
            apply.setStatus(0); // 待审核
            apply.setApplyTime(new Date());
            
            sectApplyRepository.save(apply);
            
            Map<String, Object> data = new HashMap<>();
            data.put("applyId", apply.getId());
            data.put("clanId", clanId);
            data.put("clanName", clan.getName());
            data.put("roleId", roleId);
            data.put("status", "待审核");
            
            return Result.success(data);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("申请加入宗门失败：" + e.getMessage());
        }
    }
    
    // 审批申请
    @PostMapping("/apply/process")
    @Transactional(rollbackFor = Exception.class)
    public Result<Map<String, Object>> processApply(@RequestBody Map<String, Object> request) {
        try {
            Long applyId = Long.valueOf(request.get("applyId").toString());
            Integer status = Integer.valueOf(request.get("status").toString()); // 1: 同意, 2: 拒绝
            Long handlerId = Long.valueOf(request.get("handlerId").toString());
            
            // 获取申请记录
            SectApply apply = sectApplyRepository.findById(applyId).orElse(null);
            if (apply == null) {
                return Result.error("申请记录不存在");
            }
            
            if (apply.getStatus() != 0) {
                return Result.error("该申请已处理");
            }
            
            // 验证处理人权限
            ClanMember handler = clanMemberRepository.findByRoleId(handlerId);
            if (handler == null || handler.getClanId() != apply.getSectId()) {
                return Result.error("权限不足");
            }
            
            // 只有宗主和长老可以审批
            if (handler.getPosition() != 1 && handler.getPosition() != 2) {
                return Result.error("只有宗主和长老可以审批");
            }
            
            // 更新申请状态
            apply.setStatus(status);
            apply.setHandleTime(new Date());
            apply.setHandlerId(handlerId);
            sectApplyRepository.save(apply);
            
            Map<String, Object> data = new HashMap<>();
            data.put("applyId", applyId);
            data.put("status", status == 1 ? "同意" : "拒绝");
            
            // 如果同意加入，执行加入逻辑
            if (status == 1) {
                Clan clan = clanRepository.findById(apply.getSectId()).orElse(null);
                if (clan == null) {
                    return Result.error("宗门不存在");
                }
                
                // 再次检查宗门人数
                if (clan.getMembersCount() >= clan.getMaxMembers()) {
                    return Result.error("宗门已满，无法加入");
                }
                
                // 检查角色是否已加入其他宗门
                ClanMember existingMember = clanMemberRepository.findByRoleId(apply.getUserId());
                if (existingMember != null) {
                    return Result.error("玩家已加入其他宗门");
                }
                
                // 创建成员记录
                ClanMember member = new ClanMember();
                member.setClanId(apply.getSectId());
                member.setRoleId(apply.getUserId());
                member.setPosition(4); // 普通弟子
                member.setJoinTime(new Date());
                member.setContribution(0);
                member.setTotalContribution(0L);
                member.setLastLoginTime(new Date());
                member.setIsApproved(1);
                
                clanMemberRepository.save(member);
                
                // 更新宗门人数
                clan.setMembersCount(clan.getMembersCount() + 1);
                clanRepository.save(clan);
                
                data.put("joined", true);
                data.put("clanName", clan.getName());
                
                // 发送实时通知
                String notification = "恭喜您加入" + clan.getName() + "宗门！";
                clanWebSocketHandler.sendClanNotification(apply.getUserId(), notification);
            } else {
                // 发送拒绝通知
                Clan clan = clanRepository.findById(apply.getSectId()).orElse(null);
                if (clan != null) {
                    String notification = "您加入" + clan.getName() + "宗门的申请被拒绝了";
                    clanWebSocketHandler.sendClanNotification(apply.getUserId(), notification);
                }
            }
            
            return Result.success(data);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("处理申请失败：" + e.getMessage());
        }
    }
    
    // 获取宗门申请列表
    @GetMapping("/apply/list/{clanId}")
    public Result<List<Map<String, Object>>> getApplyList(@PathVariable Long clanId, @RequestParam(required = false) Integer status) {
        try {
            List<SectApply> applies;
            if (status != null) {
                applies = sectApplyRepository.findBySectIdAndStatus(clanId, status);
            } else {
                applies = sectApplyRepository.findPendingApplicationsBySectId(clanId);
            }
            
            List<Map<String, Object>> applyList = applies.stream().map(apply -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", apply.getId());
                item.put("userId", apply.getUserId());
                item.put("userName", getRoleNameById(apply.getUserId()));
                item.put("message", apply.getMessage());
                item.put("status", apply.getStatus());
                item.put("applyTime", apply.getApplyTime());
                item.put("handleTime", apply.getHandleTime());
                item.put("handlerId", apply.getHandlerId());
                return item;
            }).collect(Collectors.toList());
            
            return Result.success(applyList);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取申请列表失败：" + e.getMessage());
        }
    }
    
    // 直接加入宗门（免审批）
    @PostMapping("/role/{roleId}/join/{clanId}")
    @Transactional(rollbackFor = Exception.class)
    public Result<Map<String, Object>> joinClan(@PathVariable Long roleId, @PathVariable Long clanId) {
        try {
            GameRole role = gameRoleRepository.findById(roleId).orElse(null);
            if (role == null) {
                return Result.error("角色不存在");
            }
            
            Clan clan = clanRepository.findById(clanId).orElse(null);
            if (clan == null) {
                return Result.error("宗门不存在");
            }
            
            ClanMember existingMember = clanMemberRepository.findByRoleId(roleId);
            if (existingMember != null) {
                return Result.error("您已加入其他宗门");
            }
            
            if (clan.getMembersCount() >= clan.getMaxMembers()) {
                return Result.error("宗门已满");
            }
            
            // 检查角色等级是否满足要求
            if (role.getLevel() < clan.getRequiredLevel()) {
                return Result.error("等级不足，需要达到" + clan.getRequiredLevel() + "级");
            }
            
            ClanMember member = new ClanMember();
            member.setClanId(clanId);
            member.setRoleId(roleId);
            member.setPosition(4); // 普通弟子
            member.setJoinTime(new Date());
            member.setContribution(0);
            member.setTotalContribution(0L);
            member.setLastLoginTime(new Date());
            member.setIsApproved(1);
            
            clanMemberRepository.save(member);
            
            clan.setMembersCount(clan.getMembersCount() + 1);
            clanRepository.save(clan);
            
            Map<String, Object> data = new HashMap<>();
            data.put("clanId", clanId);
            data.put("clanName", clan.getName());
            data.put("roleId", roleId);
            data.put("position", "普通弟子");
            
            return Result.success(data);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("加入宗门失败：" + e.getMessage());
        }
    }
    
    // 离开宗门
    @PostMapping("/member/{memberId}/leave")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> leaveClan(@PathVariable Long memberId) {
        try {
            ClanMember member = clanMemberRepository.findById(memberId).orElse(null);
            if (member == null) {
                return Result.error("成员不存在");
            }
            
            if (member.getPosition() != null && member.getPosition() == 1) {
                return Result.error("宗主无法离开宗门，请先转让宗主之位");
            }
            
            Clan clan = clanRepository.findById(member.getClanId()).orElse(null);
            if (clan != null) {
                clan.setMembersCount(Math.max(0, clan.getMembersCount() - 1));
                clanRepository.save(clan);
            }
            
            clanMemberRepository.delete(member);
            
            return Result.success(null);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("离开宗门失败：" + e.getMessage());
        }
    }
    
    /**
     * 更新宗门成员职位 (增加权限校验)
     */
    @PostMapping("/member/{memberId}/position")
    @Transactional(rollbackFor = Exception.class)
    public Result<Map<String, Object>> updateMemberPosition(
            @PathVariable Long memberId,
            @RequestParam Integer position,
            @RequestParam Long operatorRoleId) {
        try {
            // 获取目标成员
            ClanMember targetMember = clanMemberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("成员不存在"));
            
            // 获取操作人
            ClanMember operator = clanMemberRepository.findByRoleId(operatorRoleId);
            if (operator == null) {
                throw new IllegalArgumentException("操作人不是宗门成员");
            }
            
            // 权限校验：只有宗主 (1) 和长老 (2) 可以调整职位
            if (operator.getPosition() != 1 && operator.getPosition() != 2) {
                return Result.error("权限不足：只有宗主和长老可以调整职位");
            }
            
            // 不能调整比自己职位高的成员 (除非是宗主)
            if (operator.getPosition() != 1 && position <= operator.getPosition()) {
                return Result.error("不能任命比自己职位高的成员");
            }
            
            // 职位合法性校验
            if (position < 1 || position > 4) {
                return Result.error("职位不合法：1-宗主，2-长老，3-精英弟子，4-普通弟子");
            }
            
            // 检查职位人数上限
            int currentCount = clanMemberRepository.countByClanIdAndPosition(
                targetMember.getClanId(), position);
            
            int positionLimit = getPositionLimit(position);
            if (currentCount >= positionLimit) {
                return Result.error("该职位人数已达上限：" + positionLimit);
            }
            
            // 更新职位
            targetMember.setPosition(position);
            clanMemberRepository.save(targetMember);
            
            // 记录操作日志 (可以添加 ClanLog 表)
            logger.info("宗门职位调整：clanId={}, operatorRoleId={}, targetRoleId={}, newPosition={}",
                targetMember.getClanId(), operatorRoleId, targetMember.getRoleId(), position);
            
            Map<String, Object> result = new HashMap<>();
            result.put("memberId", memberId);
            result.put("roleId", targetMember.getRoleId());
            result.put("newPosition", position);
            result.put("positionName", getPositionName(position));
            
            return Result.success(result);
            
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("更新职位失败：" + e.getMessage());
        }
    }
    
    // 获取职位人数上限
    private int getPositionLimit(int position) {
        switch (position) {
            case 1: return 1;  // 宗主 1 人
            case 2: return 3;  // 长老 3 人
            case 3: return 10; // 精英弟子 10 人
            case 4: return 999; // 普通弟子不限
            default: return 0;
        }
    }
    
    // 获取职位名称
    private String getPositionName(int position) {
        switch (position) {
            case 1: return "宗主";
            case 2: return "长老";
            case 3: return "精英弟子";
            case 4: return "普通弟子";
            default: return "未知";
        }
    }
    
    // 获取角色的宗门成员信息
    @GetMapping("/member/role/{roleId}")
    public Result<ClanMember> getClanMemberByRoleId(@PathVariable Long roleId) {
        try {
            ClanMember member = clanMemberRepository.findByRoleId(roleId);
            if (member == null) {
                return Result.error("角色未加入任何宗门");
            }
            return Result.success(member);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取宗门成员信息失败：" + e.getMessage());
        }
    }
    
    // 获取角色的宗门申请状态
    @GetMapping("/apply/status/{roleId}")
    public Result<List<Map<String, Object>>> getClanApplicationStatus(@PathVariable Long roleId) {
        try {
            List<SectApply> applies = sectApplyRepository.findByUserId(roleId);
            List<Map<String, Object>> statusList = applies.stream().map(apply -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", apply.getId());
                item.put("clanId", apply.getSectId());
                item.put("clanName", getClanNameById(apply.getSectId()));
                item.put("status", apply.getStatus() == 0 ? "pending" : (apply.getStatus() == 1 ? "approved" : "rejected"));
                item.put("applyTime", apply.getApplyTime());
                return item;
            }).collect(Collectors.toList());
            return Result.success(statusList);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取宗门申请状态失败：" + e.getMessage());
        }
    }
    
    // 根据宗门ID获取宗门名称
    private String getClanNameById(Long clanId) {
        return clanRepository.findById(clanId)
            .map(Clan::getName)
            .orElse("未知宗门");
    }
    
    /**
     * 获取宗门成员列表
     */
    @GetMapping("/{clanId}/members")
    public Result<List<Map<String, Object>>> getClanMembers(@PathVariable Long clanId) {
        try {
            List<ClanMember> members = clanMemberRepository.findByClanId(clanId);
            List<Map<String, Object>> memberList = members.stream().map(member -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", member.getId());
                item.put("roleId", member.getRoleId());
                item.put("roleName", getRoleNameById(member.getRoleId()));
                item.put("position", getPositionName(member.getPosition()));
                item.put("joinTime", member.getJoinTime());
                item.put("contribution", member.getContribution());
                return item;
            }).collect(Collectors.toList());
            return Result.success(memberList);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取成员列表失败：" + e.getMessage());
        }
    }
    
    // 获取宗门资源
    @GetMapping("/{clanId}/resources")
    public Result<Map<String, Object>> getClanResources(@PathVariable Long clanId) {
        try {
            Clan clan = clanRepository.findById(clanId).orElse(null);
            if (clan == null) {
                return Result.error("宗门不存在");
            }
            
            Map<String, Object> resources = new HashMap<>();
            resources.put("lingshi", clan.getContribution());
            resources.put("gongxian", 0);
            resources.put("material", 0);
            resources.put("item", 0);
            
            return Result.success(resources);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取宗门资源失败：" + e.getMessage());
        }
    }
    
    // 获取宗门公告
    @GetMapping("/{clanId}/announcement")
    public Result<Map<String, Object>> getClanAnnouncement(@PathVariable Long clanId) {
        try {
            Clan clan = clanRepository.findById(clanId).orElse(null);
            if (clan == null) {
                return Result.error("宗门不存在");
            }
            
            Map<String, Object> announcement = new HashMap<>();
            announcement.put("content", clan.getDescription() != null ? clan.getDescription() : "暂无公告");
            announcement.put("publishTime", LocalDateTime.now());
            announcement.put("publisher", clan.getLeaderName() != null ? clan.getLeaderName() : "宗主");
            
            return Result.success(announcement);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取宗门公告失败：" + e.getMessage());
        }
    }
    
    // 获取宗门技能列表
    @GetMapping("/{clanId}/skills")
    public Result<List<Map<String, Object>>> getClanSkills(@PathVariable Long clanId) {
        try {
            Clan clan = clanRepository.findById(clanId).orElse(null);
            if (clan == null) {
                return Result.error("宗门不存在");
            }
            
            List<ClanSkill> skills = clanSkillRepository.findByClanId(clanId);
            List<Map<String, Object>> skillList = skills.stream().map(skill -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", skill.getId());
                item.put("skillName", skill.getSkillName());
                item.put("skillLevel", skill.getSkillLevel());
                item.put("skillEffect", skill.getSkillEffect());
                item.put("requiredLevel", skill.getRequiredLevel());
                item.put("requiredContribution", skill.getRequiredContribution());
                return item;
            }).collect(Collectors.toList());
            
            return Result.success(skillList);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取宗门技能列表失败：" + e.getMessage());
        }
    }
    
    // 学习宗门技能
    @PostMapping("/skill/learn")
    @Transactional(rollbackFor = Exception.class)
    public Result<Map<String, Object>> learnClanSkill(@RequestBody Map<String, Object> request) {
        try {
            Long roleId = Long.valueOf(request.get("roleId").toString());
            Long skillId = Long.valueOf(request.get("skillId").toString());
            
            // 检查角色是否存在
            GameRole role = gameRoleRepository.findById(roleId).orElse(null);
            if (role == null) {
                return Result.error("角色不存在");
            }
            
            // 检查技能是否存在
            ClanSkill skill = clanSkillRepository.findById(skillId).orElse(null);
            if (skill == null) {
                return Result.error("技能不存在");
            }
            
            // 检查角色是否属于该宗门
            ClanMember member = clanMemberRepository.findByRoleId(roleId);
            if (member == null || member.getClanId() != skill.getClanId()) {
                return Result.error("您不属于该宗门");
            }
            
            // 检查角色是否已学习该技能
            RoleClanSkill existingSkill = roleClanSkillRepository.findByRoleIdAndClanSkillId(roleId, skillId);
            if (existingSkill != null) {
                return Result.error("您已经学习了该技能");
            }
            
            // 检查角色贡献是否足够
            Integer currentContribution = member.getContribution();
            Long requiredContribution = skill.getRequiredContribution();
            if (currentContribution == null || currentContribution < requiredContribution.intValue()) {
                return Result.error("贡献不足，需要" + requiredContribution + "点贡献");
            }
            
            // 检查宗门等级是否满足要求
            Clan clan = clanRepository.findById(skill.getClanId()).orElse(null);
            if (clan == null || clan.getLevel() < skill.getRequiredLevel()) {
                return Result.error("宗门等级不足，需要达到" + skill.getRequiredLevel() + "级");
            }
            
            // 扣除贡献
            if (currentContribution != null && requiredContribution != null) {
                member.setContribution(currentContribution - requiredContribution.intValue());
            }
            clanMemberRepository.save(member);
            
            // 记录学习技能
            RoleClanSkill roleSkill = new RoleClanSkill();
            roleSkill.setRoleId(roleId);
            roleSkill.setClanSkillId(skillId);
            roleSkill.setSkillLevel(skill.getSkillLevel());
            roleSkill.setLearnTime(new Date());
            roleClanSkillRepository.save(roleSkill);
            
            // 发送实时通知
            String notification = "您成功学习了" + skill.getSkillName() + "技能！";
            clanWebSocketHandler.sendClanNotification(roleId, notification);
            
            Map<String, Object> data = new HashMap<>();
            data.put("skillId", skillId);
            data.put("skillName", skill.getSkillName());
            data.put("remainingContribution", member.getContribution());
            
            return Result.success(data);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("学习技能失败：" + e.getMessage());
        }
    }
    
    // 获取角色已学习的宗门技能
    @GetMapping("/skill/role/{roleId}")
    public Result<List<Map<String, Object>>> getRoleClanSkills(@PathVariable Long roleId) {
        try {
            List<RoleClanSkill> roleSkills = roleClanSkillRepository.findByRoleId(roleId);
            List<Map<String, Object>> skillList = roleSkills.stream().map(roleSkill -> {
                ClanSkill skill = clanSkillRepository.findById(roleSkill.getClanSkillId()).orElse(null);
                Map<String, Object> item = new HashMap<>();
                if (skill != null) {
                    item.put("id", skill.getId());
                    item.put("skillName", skill.getSkillName());
                    item.put("skillLevel", roleSkill.getSkillLevel());
                    item.put("skillEffect", skill.getSkillEffect());
                    item.put("learnTime", roleSkill.getLearnTime());
                }
                return item;
            }).collect(Collectors.toList());
            
            return Result.success(skillList);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取角色技能失败：" + e.getMessage());
        }
    }
    
    // ====================  宗门聊天相关接口 ====================
    
    /**
     * 获取宗门聊天消息
     */
    @GetMapping("/chat/{clanId}")
    public Result<List<ClanChatMessage>> getChatMessages(
            @PathVariable Long clanId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "50") Integer size) {
        try {
            List<ClanChatMessage> messages = clanChatMessageRepository.findByClanIdOrderByCreateTimeDesc(clanId, PageRequest.of(page - 1, size));
            return Result.success(messages);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取聊天消息失败：" + e.getMessage());
        }
    }
    
    /**
     * 发送聊天消息
     */
    @PostMapping("/chat/send")
    public Result<ClanChatMessage> sendChatMessage(@RequestBody Map<String, Object> params) {
        try {
            Long clanId = Long.valueOf(params.get("clanId").toString());
            Long roleId = Long.valueOf(params.get("roleId").toString());
            String roleName = params.get("roleName").toString();
            String message = params.get("message").toString();
            
            ClanChatMessage chatMessage = new ClanChatMessage();
            chatMessage.setClanId(clanId);
            chatMessage.setRoleId(roleId);
            chatMessage.setRoleName(roleName);
            chatMessage.setMessage(message);
            
            clanChatMessageRepository.save(chatMessage);
            return Result.success(chatMessage);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("发送消息失败：" + e.getMessage());
        }
    }
    
    // ==================== 宗门商城相关接口 ====================
    
    /**
     * 获取商城商品列表
     */
    @GetMapping("/shop/{clanId}")
    public Result<List<ClanShopItem>> getShopItems(@PathVariable Long clanId) {
        try {
            List<ClanShopItem> items = clanShopItemRepository.findAvailableByClanId(clanId);
            return Result.success(items);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取商品列表失败：" + e.getMessage());
        }
    }
    
    /**
     * 购买商品
     */
    @PostMapping("/shop/buy")
    @Transactional(rollbackFor = Exception.class)
    public Result<?> buyItem(@RequestBody Map<String, Object> params) {
        try {
            Long clanId = Long.valueOf(params.get("clanId").toString());
            Long roleId = Long.valueOf(params.get("roleId").toString());
            Long itemId = Long.valueOf(params.get("itemId").toString());
            Integer count = Integer.valueOf(params.get("count").toString());
            
            // 1. 检查商品是否存在
            ClanShopItem item = clanShopItemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("商品不存在"));
            
            // 2. 检查库存
            if (item.getStock() != -1 && item.getStock() < count) {
                return Result.error("库存不足");
            }
            
            // 3. 检查角色贡献度是否足够
            ClanMember member = clanMemberRepository.findByRoleId(roleId);
            if (member == null) {
                return Result.error("您不是宗门成员");
            }
            
            Integer contribution = member.getContribution();
            if (contribution == null || contribution < item.getPrice() * count) {
                return Result.error("贡献度不足，需要" + (item.getPrice() * count) + "点");
            }
            
            // 4. 扣除贡献度
            member.setContribution(contribution - item.getPrice() * count);
            clanMemberRepository.save(member);
            
            // 5. 减少库存
            if (item.getStock() != -1) {
                item.setStock(item.getStock() - count);
                clanShopItemRepository.save(item);
            }
            
            // 6. 添加到角色背包（TODO: 需要实现背包系统）
            // 暂时只返回成功
            
            return Result.success("购买成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("购买失败：" + e.getMessage());
        }
    }
    
    // ==================== 宗门任务相关接口 ====================
    
    /**
     * 获取任务列表
     */
    @GetMapping("/tasks/{clanId}")
    public Result<List<Map<String, Object>>> getTasks(@PathVariable Long clanId,
                                                       @RequestParam(required = false) Long roleId) {
        try {
            List<ClanTask> tasks = clanTaskRepository.findAvailableByClanId(clanId);
            
            // 如果有 roleId，返回任务进度
            List<Map<String, Object>> result = tasks.stream().map(task -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", task.getId());
                item.put("title", task.getTitle());
                item.put("description", task.getDescription());
                item.put("target", task.getTarget());
                item.put("reward", task.getReward());
                item.put("type", task.getType());
                item.put("difficulty", task.getDifficulty());
                
                // 如果有 roleId，查询任务进度
                if (roleId != null) {
                    Optional<ClanMemberTask> memberTaskOpt = clanMemberTaskRepository.findByRoleIdAndTaskId(roleId, task.getId());
                    if (memberTaskOpt.isPresent()) {
                        ClanMemberTask memberTask = memberTaskOpt.get();
                        item.put("status", memberTask.getStatus());
                        item.put("progress", memberTask.getProgress());
                    } else {
                        item.put("status", "available");
                        item.put("progress", 0);
                    }
                } else {
                    item.put("status", "available");
                    item.put("progress", 0);
                }
                
                return item;
            }).collect(Collectors.toList());
            
            return Result.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取任务列表失败：" + e.getMessage());
        }
    }
    
    /**
     * 接受任务
     */
    @PostMapping("/task/accept")
    @Transactional(rollbackFor = Exception.class)
    public Result<?> acceptTask(@RequestBody Map<String, Object> params) {
        try {
            Long clanId = Long.valueOf(params.get("clanId").toString());
            Long roleId = Long.valueOf(params.get("roleId").toString());
            Long taskId = Long.valueOf(params.get("taskId").toString());
            
            // 检查角色是否是宗门成员
            ClanMember member = clanMemberRepository.findByRoleId(roleId);
            if (member == null || !member.getClanId().equals(clanId)) {
                return Result.error("您不是该宗门成员");
            }
            
            // 检查任务是否存在
            ClanTask task = clanTaskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("任务不存在"));
            
            // 检查是否已经接受过该任务
            Optional<ClanMemberTask> existingTask = clanMemberTaskRepository.findByRoleIdAndTaskId(roleId, taskId);
            if (existingTask.isPresent()) {
                ClanMemberTask memberTask = existingTask.get();
                if ("in_progress".equals(memberTask.getStatus())) {
                    return Result.error("任务已在进行中");
                } else if ("completed".equals(memberTask.getStatus())) {
                    return Result.error("任务已完成，无法再次接受");
                }
            }
            
            // 创建或更新任务进度
            ClanMemberTask memberTask = existingTask.orElse(new ClanMemberTask());
            memberTask.setClanId(clanId);
            memberTask.setRoleId(roleId);
            memberTask.setTaskId(taskId);
            memberTask.setProgress(0);
            memberTask.setStatus("in_progress");
            memberTask.setAcceptTime(new Date());
            
            clanMemberTaskRepository.save(memberTask);
            
            return Result.success("接受任务成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("接受任务失败：" + e.getMessage());
        }
    }
    
    /**
     * 提交任务
     */
    @PostMapping("/task/submit")
    @Transactional(rollbackFor = Exception.class)
    public Result<?> submitTask(@RequestBody Map<String, Object> params) {
        try {
            Long clanId = Long.valueOf(params.get("clanId").toString());
            Long roleId = Long.valueOf(params.get("roleId").toString());
            Long taskId = Long.valueOf(params.get("taskId").toString());
            
            // 检查角色是否是宗门成员
            ClanMember member = clanMemberRepository.findByRoleId(roleId);
            if (member == null || !member.getClanId().equals(clanId)) {
                return Result.error("您不是该宗门成员");
            }
            
            // 检查任务是否存在
            ClanTask task = clanTaskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("任务不存在"));
            
            // 查询任务进度
            Optional<ClanMemberTask> memberTaskOpt = clanMemberTaskRepository.findByRoleIdAndTaskId(roleId, taskId);
            if (!memberTaskOpt.isPresent()) {
                return Result.error("请先接受任务");
            }
            
            ClanMemberTask memberTask = memberTaskOpt.get();
            if (!"in_progress".equals(memberTask.getStatus())) {
                return Result.error("任务状态不正确");
            }
            
            // 更新任务进度为已完成
            memberTask.setProgress(task.getTarget());
            memberTask.setStatus("completed");
            memberTask.setCompleteTime(new Date());
            clanMemberTaskRepository.save(memberTask);
            
            // 增加角色贡献度
            Integer currentContribution = member.getContribution();
            if (currentContribution == null) {
                currentContribution = 0;
            }
            member.setContribution(currentContribution + task.getReward());
            
            // 增加总贡献
            Long totalContribution = member.getTotalContribution();
            if (totalContribution == null) {
                totalContribution = 0L;
            }
            member.setTotalContribution(totalContribution + task.getReward());
            
            clanMemberRepository.save(member);
            
            return Result.success("提交任务成功，获得" + task.getReward() + "点贡献");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("提交任务失败：" + e.getMessage());
        }
    }
    
    // ==================== 宗门建筑相关接口 ====================
    
    /**
     * 获取建筑列表
     */
    @GetMapping("/buildings/{clanId}")
    public Result<List<ClanBuilding>> getBuildings(@PathVariable Long clanId) {
        try {
            List<ClanBuilding> buildings = clanBuildingRepository.findByClanIdOrderByCreateTimeDesc(clanId);
            return Result.success(buildings);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取建筑列表失败：" + e.getMessage());
        }
    }
    
    /**
     * 升级建筑
     */
    @PostMapping("/building/upgrade")
    @Transactional(rollbackFor = Exception.class)
    public Result<?> upgradeBuilding(@RequestBody Map<String, Object> params) {
        try {
            Long clanId = Long.valueOf(params.get("clanId").toString());
            Long roleId = Long.valueOf(params.get("roleId").toString());
            Long buildingId = Long.valueOf(params.get("buildingId").toString());
            
            ClanBuilding building = clanBuildingRepository.findById(buildingId)
                    .orElseThrow(() -> new RuntimeException("建筑不存在"));
            
            if (!building.getClanId().equals(clanId)) {
                return Result.error("建筑不属于该宗门");
            }
            
            if (building.getLevel() >= building.getMaxLevel()) {
                return Result.error("建筑已满级");
            }
            
            // 检查角色是否是宗门成员
            ClanMember member = clanMemberRepository.findByRoleId(roleId);
            if (member == null || !member.getClanId().equals(clanId)) {
                return Result.error("您不是该宗门成员");
            }
            
            // 检查贡献度是否足够
            Integer contribution = member.getContribution();
            if (contribution == null || contribution < building.getUpgradeCost()) {
                return Result.error("贡献度不足，需要" + building.getUpgradeCost() + "点");
            }
            
            // 扣除贡献度
            member.setContribution(contribution - building.getUpgradeCost());
            clanMemberRepository.save(member);
            
            // 升级建筑
            building.setLevel(building.getLevel() + 1);
            clanBuildingRepository.save(building);
            
            return Result.success("升级成功，建筑等级提升至" + building.getLevel() + "级");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("升级失败：" + e.getMessage());
        }
    }

    @PostMapping("/donate")
    @Transactional(rollbackFor = Exception.class)
    public Result<Map<String, Object>> donate(@RequestBody Map<String, Object> params) {
        try {
            Long clanId = Long.valueOf(params.get("clanId").toString());
            Long roleId = Long.valueOf(params.get("roleId").toString());
            Integer amount = Integer.valueOf(params.get("amount").toString());

            if (amount == null || amount <= 0) {
                return Result.error("捐赠金额必须大于0");
            }

            ClanMember member = clanMemberRepository.findByRoleId(roleId);
            if (member == null || !member.getClanId().equals(clanId)) {
                return Result.error("您不是该宗门成员");
            }

            Integer contribution = member.getContribution();
            if (contribution == null) {
                contribution = 0;
            }
            member.setContribution(contribution + amount);
            Long totalContribution = member.getTotalContribution();
            if (totalContribution == null) {
                totalContribution = 0L;
            }
            member.setTotalContribution(totalContribution + amount);
            clanMemberRepository.save(member);

            Clan clan = clanRepository.findById(clanId).orElse(null);
            if (clan != null) {
                Integer currentFund = clan.getContribution();
                if (currentFund == null) {
                    currentFund = 0;
                }
                clan.setContribution(currentFund + amount);
                clanRepository.save(clan);
            }

            Map<String, Object> data = new HashMap<>();
            data.put("amount", amount);
            data.put("contribution", member.getContribution());
            data.put("totalContribution", member.getTotalContribution());
            return Result.success(data);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("捐赠失败：" + e.getMessage());
        }
    }
}
