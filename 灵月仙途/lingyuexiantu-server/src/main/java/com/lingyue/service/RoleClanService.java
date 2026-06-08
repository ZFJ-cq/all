package com.lingyue.service;

import com.lingyue.entity.RoleClan;
import java.util.List;

public interface RoleClanService {
    RoleClan getRoleClan(Long roleId);
    List<RoleClan> getClanMembers(Long clanId);
    List<RoleClan> getClanElders(Long clanId);
    RoleClan joinClan(Long roleId, Long clanId);
    RoleClan leaveClan(Long roleId);
    RoleClan updateContribution(Long roleId, int contribution);
    RoleClan promoteMember(Long roleId, String position);
    RoleClan demoteMember(Long roleId, String position);
    void kickMember(Long roleId);
}
