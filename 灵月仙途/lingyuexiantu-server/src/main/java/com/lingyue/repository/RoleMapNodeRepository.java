package com.lingyue.repository;

import com.lingyue.entity.RoleMapNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleMapNodeRepository extends JpaRepository<RoleMapNode, Long> {
    List<RoleMapNode> findByRoleId(Long roleId);
    RoleMapNode findByRoleIdAndMapNodeId(Long roleId, Long mapNodeId);
    List<RoleMapNode> findByRoleIdAndUnlockedTrue(Long roleId);
}