package com.lingyue.service.impl;

import com.lingyue.entity.RoleClan;
import com.lingyue.repository.RoleClanRepository;
import com.lingyue.service.RoleClanService;

import org.springframework.stereotype.Service;
import java.util.Date;
import java.text.SimpleDateFormat;
import java.util.List;

@Service
public class RoleClanServiceImpl implements RoleClanService {
    
    private final RoleClanRepository roleClanRepository;
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    
    public RoleClanServiceImpl(RoleClanRepository roleClanRepository) {
        this.roleClanRepository = roleClanRepository;
    }

    @Override
    public RoleClan getRoleClan(Long roleId) {
        return roleClanRepository.findByRoleId(roleId);
    }

    @Override
    public List<RoleClan> getClanMembers(Long clanId) {
        return roleClanRepository.findByClanId(clanId);
    }

    @Override
    public List<RoleClan> getClanElders(Long clanId) {
        return roleClanRepository.findByClanIdAndPosition(clanId, "elder");
    }

    @Override
    public RoleClan joinClan(Long roleId, Long clanId) {
        RoleClan existingRoleClan = roleClanRepository.findByRoleId(roleId);
        if (existingRoleClan == null) {
            RoleClan roleClan = new RoleClan();
            roleClan.setRoleId(roleId);
            roleClan.setClanId(clanId);
            roleClan.setPosition("member");
            roleClan.setContribution(0);
            roleClan.setJoinDate(dateFormat.format(new Date()));
            roleClan.setStatus("active");
            roleClan.setRank(0);
            return roleClanRepository.save(roleClan);
        }
        return existingRoleClan;
    }

    @Override
    public RoleClan leaveClan(Long roleId) {
        RoleClan roleClan = roleClanRepository.findByRoleId(roleId);
        if (roleClan != null) {
            roleClan.setStatus("inactive");
            return roleClanRepository.save(roleClan);
        }
        return null;
    }

    @Override
    public RoleClan updateContribution(Long roleId, int contribution) {
        RoleClan roleClan = roleClanRepository.findByRoleId(roleId);
        if (roleClan != null) {
            roleClan.setContribution(roleClan.getContribution() + contribution);
            return roleClanRepository.save(roleClan);
        }
        return null;
    }

    @Override
    public RoleClan promoteMember(Long roleId, String position) {
        RoleClan roleClan = roleClanRepository.findByRoleId(roleId);
        if (roleClan != null) {
            roleClan.setPosition(position);
            return roleClanRepository.save(roleClan);
        }
        return null;
    }

    @Override
    public RoleClan demoteMember(Long roleId, String position) {
        RoleClan roleClan = roleClanRepository.findByRoleId(roleId);
        if (roleClan != null) {
            roleClan.setPosition(position);
            return roleClanRepository.save(roleClan);
        }
        return null;
    }

    @Override
    public void kickMember(Long roleId) {
        RoleClan roleClan = roleClanRepository.findByRoleId(roleId);
        if (roleClan != null) {
            roleClan.setStatus("kicked");
            roleClanRepository.save(roleClan);
        }
    }
}
