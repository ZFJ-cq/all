package com.lingyue.service.impl;

import com.lingyue.entity.RoleResource;
import com.lingyue.repository.RoleResourceRepository;
import com.lingyue.service.RoleResourceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoleResourceServiceImpl implements RoleResourceService {
    
    private static final Logger logger = LoggerFactory.getLogger(RoleResourceServiceImpl.class);
    private static final int MAX_RETRY_COUNT = 3;
    
    private final RoleResourceRepository roleResourceRepository;
    
    public RoleResourceServiceImpl(RoleResourceRepository roleResourceRepository) {
        this.roleResourceRepository = roleResourceRepository;
    }
    
    @Override
    public List<RoleResource> getRoleResources(Long roleId) {
        return roleResourceRepository.findByRoleId(roleId);
    }
    
    @Override
    public RoleResource getResourceByType(Long roleId, Long resourceTypeId) {
        return roleResourceRepository.findByRoleIdAndResourceTypeId(roleId, resourceTypeId);
    }
    
    @Override
    public int getResourceQuantity(Long roleId, Long resourceTypeId) {
        RoleResource resource = roleResourceRepository.findByRoleIdAndResourceTypeId(roleId, resourceTypeId);
        return resource != null ? resource.getQuantity().intValue() : 0;
    }
    
    @Override
    public RoleResource addResource(Long roleId, Long resourceTypeId, int quantity) {
        RoleResource resource = roleResourceRepository.findByRoleIdAndResourceTypeId(roleId, resourceTypeId);
        
        if (resource == null) {
            // 资源不存在，创建新资源
            resource = new RoleResource();
            resource.setRoleId(roleId);
            resource.setResourceTypeId(resourceTypeId);
            resource.setQuantity((long) quantity);
        } else {
            // 资源存在，更新数量
            resource.setQuantity(resource.getQuantity() + quantity);
        }
        
        return roleResourceRepository.save(resource);
    }
    
    @Override
    public List<RoleResource> batchUpdateRoleResources(Long roleId, List<RoleResource> resources) {
        resources.forEach(resource -> resource.setRoleId(roleId));
        return roleResourceRepository.saveAll(resources);
    }
    
    @Override
    public RoleResource updateResource(Long roleId, Long resourceTypeId, int quantity) {
        RoleResource resource = roleResourceRepository.findByRoleIdAndResourceTypeId(roleId, resourceTypeId);
        
        if (resource == null) {
            // 资源不存在，创建新资源
            resource = new RoleResource();
            resource.setRoleId(roleId);
            resource.setResourceTypeId(resourceTypeId);
        }
        
        resource.setQuantity((long) quantity);
        return roleResourceRepository.save(resource);
    }
    
    @Override
    @Retryable(
        value = {OptimisticLockingFailureException.class},
        maxAttempts = MAX_RETRY_COUNT,
        backoff = @Backoff(delay = 100, multiplier = 2)
    )
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public boolean consumeResource(Long roleId, Long resourceTypeId, int quantity) {
        logger.info("消耗资源：roleId={}, resourceTypeId={}, quantity={}", roleId, resourceTypeId, quantity);
        
        if (quantity <= 0) {
            throw new IllegalArgumentException("消耗数量必须大于 0");
        }
        
        // 使用悲观锁获取资源 (防止并发)
        RoleResource resource = roleResourceRepository.findByRoleIdAndResourceTypeIdForUpdate(roleId, resourceTypeId);
        
        if (resource == null) {
            logger.warn("资源不存在：roleId={}, resourceTypeId={}", roleId, resourceTypeId);
            return false;
        }
        
        Long currentQuantity = resource.getQuantity();
        if (currentQuantity < quantity) {
            logger.warn("资源不足：roleId={}, resourceTypeId={}, current={}, required={}", 
                roleId, resourceTypeId, currentQuantity, quantity);
            return false;
        }
        
        // 使用乐观锁更新
        int updated = roleResourceRepository.decrementQuantityWithVersion(
            roleId, resourceTypeId, (long) quantity, resource.getVersion(), new java.util.Date());
        
        if (updated == 0) {
            logger.warn("乐观锁更新失败，重试中：roleId={}, resourceTypeId={}", roleId, resourceTypeId);
            throw new OptimisticLockingFailureException("资源已被其他操作修改");
        }
        
        logger.info("资源消耗成功：roleId={}, resourceTypeId={}, oldQuantity={}, newQuantity={}", 
            roleId, resourceTypeId, currentQuantity, currentQuantity - quantity);
        
        return true;
    }
}
