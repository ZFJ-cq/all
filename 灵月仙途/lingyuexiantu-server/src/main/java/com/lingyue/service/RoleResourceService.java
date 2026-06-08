package com.lingyue.service;

import com.lingyue.entity.RoleResource;
import java.util.List;

public interface RoleResourceService {
    // 根据角色 ID 获取所有资源
    List<RoleResource> getRoleResources(Long roleId);
    
    // 根据角色 ID 和资源类型获取资源
    RoleResource getResourceByType(Long roleId, Long resourceTypeId);
    
    // 获取资源数量
    int getResourceQuantity(Long roleId, Long resourceTypeId);
    
    // 增加或减少资源
    RoleResource addResource(Long roleId, Long resourceTypeId, int quantity);
    
    // 批量更新角色资源
    List<RoleResource> batchUpdateRoleResources(Long roleId, List<RoleResource> resources);
    
    // 更新单个资源
    RoleResource updateResource(Long roleId, Long resourceTypeId, int quantity);
    
    // 消费资源（如果不足则返回 false）
    boolean consumeResource(Long roleId, Long resourceTypeId, int quantity);
}
