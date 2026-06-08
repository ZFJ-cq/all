package com.lingyue.service.impl;

import com.lingyue.entity.RoleRealm;
import com.lingyue.repository.RoleRealmRepository;
import com.lingyue.service.RoleRealmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoleRealmServiceImpl implements RoleRealmService {

    @Autowired
    private RoleRealmRepository roleRealmRepository;

    @Override
    public RoleRealm getRealmByRoleId(Long roleId) {
        return roleRealmRepository.findByRoleId(roleId);
    }

    @Override
    public RoleRealm createOrUpdateRealm(RoleRealm realm) {
        return roleRealmRepository.save(realm);
    }

    @Override
    public void deleteRealm(Long id) {
        roleRealmRepository.deleteById(id);
    }
}
