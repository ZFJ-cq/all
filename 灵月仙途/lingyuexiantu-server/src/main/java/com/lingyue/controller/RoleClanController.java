package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.RoleClan;
import com.lingyue.service.RoleClanService;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/role/clans")
public class RoleClanController {
    
    private final RoleClanService roleClanService;
    
    public RoleClanController(RoleClanService roleClanService) {
        this.roleClanService = roleClanService;
    }

    // 获取角色的宗门信息
    @GetMapping("/{roleId}")
    public RoleClan getRoleClan(@PathVariable Long roleId) {
        return roleClanService.getRoleClan(roleId);
    }

    // 获取宗门成员列表
    @GetMapping("/clan/{clanId}")
    public List<RoleClan> getClanMembers(@PathVariable Long clanId) {
        return roleClanService.getClanMembers(clanId);
    }

    // 获取宗门长老列表
    @GetMapping("/clan/{clanId}/elders")
    public List<RoleClan> getClanElders(@PathVariable Long clanId) {
        return roleClanService.getClanElders(clanId);
    }

    // 加入宗门
    @PostMapping("/{roleId}/join/{clanId}")
    public RoleClan joinClan(@PathVariable Long roleId, @PathVariable Long clanId) {
        return roleClanService.joinClan(roleId, clanId);
    }

    // 离开宗门
    @PostMapping("/{roleId}/leave")
    public RoleClan leaveClan(@PathVariable Long roleId) {
        return roleClanService.leaveClan(roleId);
    }

    // 更新贡献值
    @PutMapping("/{roleId}/contribution")
    public RoleClan updateContribution(@PathVariable Long roleId, @RequestParam int contribution) {
        return roleClanService.updateContribution(roleId, contribution);
    }

    // 提升成员职位
    @PutMapping("/{roleId}/promote")
    public RoleClan promoteMember(@PathVariable Long roleId, @RequestParam String position) {
        return roleClanService.promoteMember(roleId, position);
    }

    // 降级成员职位
    @PutMapping("/{roleId}/demote")
    public RoleClan demoteMember(@PathVariable Long roleId, @RequestParam String position) {
        return roleClanService.demoteMember(roleId, position);
    }

    // 踢出成员
    @DeleteMapping("/{roleId}/kick")
    public void kickMember(@PathVariable Long roleId) {
        roleClanService.kickMember(roleId);
    }
}
