package com.lingyue.service;

import com.lingyue.entity.RoleRealmBreakthrough;
import com.lingyue.repository.RoleRealmBreakthroughRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 角色境界突破记录服务
 */
@Service
@Transactional
public class RoleRealmBreakthroughService {

    private final RoleRealmBreakthroughRepository breakthroughRepository;

    public RoleRealmBreakthroughService(RoleRealmBreakthroughRepository breakthroughRepository) {
        this.breakthroughRepository = breakthroughRepository;
    }

    // 获取所有突破记录
    public List<RoleRealmBreakthrough> getAllBreakthroughRecords() {
        return breakthroughRepository.findAll();
    }

    // 根据 ID 获取突破记录
    public RoleRealmBreakthrough getBreakthroughRecordById(Long id) {
        return breakthroughRepository.findById(id).orElse(null);
    }

    // 根据角色 ID 获取突破记录
    public List<RoleRealmBreakthrough> getBreakthroughRecordsByRoleId(Long roleId) {
        return breakthroughRepository.findByRoleIdOrderByBreakthroughTimeDesc(roleId);
    }

    // 搜索突破记录
    public List<RoleRealmBreakthrough> searchBreakthroughRecords(String keyword) {
        return breakthroughRepository.searchBreakthroughRecords(keyword);
    }

    // 创建突破记录
    public RoleRealmBreakthrough createBreakthroughRecord(RoleRealmBreakthrough record) {
        record.setBreakthroughTime(LocalDateTime.now());
        return breakthroughRepository.save(record);
    }

    // 更新突破记录
    public RoleRealmBreakthrough updateBreakthroughRecord(RoleRealmBreakthrough record) {
        return breakthroughRepository.findById(record.getId())
            .map(existing -> {
                existing.setRoleId(record.getRoleId());
                existing.setRoleName(record.getRoleName());
                existing.setOldRealm(record.getOldRealm());
                existing.setNewRealm(record.getNewRealm());
                existing.setSuccess(record.getSuccess());
                existing.setCostXiuwei(record.getCostXiuwei());
                return breakthroughRepository.save(existing);
            })
            .orElse(null);
    }

    // 删除突破记录
    public boolean deleteBreakthroughRecord(Long id) {
        if (breakthroughRepository.existsById(id)) {
            breakthroughRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
