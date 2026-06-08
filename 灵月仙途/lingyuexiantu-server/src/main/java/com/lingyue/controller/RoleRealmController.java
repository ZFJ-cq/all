package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.RoleRealm;
import com.lingyue.service.RoleRealmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/role-realm")
public class RoleRealmController {

    @Autowired
    private RoleRealmService roleRealmService;

    @GetMapping("/role/{roleId}")
    public RoleRealm getRealmByRoleId(@PathVariable Long roleId) {
        RoleRealm realm = roleRealmService.getRealmByRoleId(roleId);
        if (realm == null) {
            // 如果角色没有境界信息，返回一个默认的境界对象
            realm = new RoleRealm();
            realm.setRoleId(roleId);
            realm.setRealmName("凡人");
            realm.setRealmLevel(1);
            realm.setTotalCultivation(new java.math.BigDecimal(0));
            realm.setNextRealmCultivation(new java.math.BigDecimal(1000));
        }
        return realm;
    }

    @PostMapping
    public RoleRealm createOrUpdateRealm(@RequestBody RoleRealm realm) {
        return roleRealmService.createOrUpdateRealm(realm);
    }

    @DeleteMapping("/{id}")
    public void deleteRealm(@PathVariable Long id) {
        roleRealmService.deleteRealm(id);
    }
}
