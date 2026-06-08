package com.lingyue.repository;

import com.lingyue.entity.RoleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoleItemRepository extends JpaRepository<RoleItem, Long> {
    List<RoleItem> findByRoleId(Long roleId);
    List<RoleItem> findByRoleIdAndItemId(Long roleId, Long itemId);
    void deleteByRoleIdAndItemId(Long roleId, Long itemId);
}