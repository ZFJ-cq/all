package com.lingyue.repository;

import com.lingyue.entity.RoleAttributeCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 角色属性缓存 Repository
 */
@Repository
public interface RoleAttributeCacheRepository extends JpaRepository<RoleAttributeCache, Long> {
}
