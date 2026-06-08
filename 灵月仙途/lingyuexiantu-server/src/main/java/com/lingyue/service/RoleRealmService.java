package com.lingyue.service;

import com.lingyue.entity.RoleRealm;

public interface RoleRealmService {
    RoleRealm getRealmByRoleId(Long roleId);
    RoleRealm createOrUpdateRealm(RoleRealm realm);
    void deleteRealm(Long id);
}
