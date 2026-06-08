package com.lingyue.repository;

import com.lingyue.entity.RoleRealm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRealmRepository extends JpaRepository<RoleRealm, Long> {
    RoleRealm findByRoleId(Long roleId);
}
