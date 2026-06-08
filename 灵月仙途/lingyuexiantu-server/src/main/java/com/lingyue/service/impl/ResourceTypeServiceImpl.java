package com.lingyue.service.impl;

import com.lingyue.entity.ResourceType;
import com.lingyue.repository.ResourceTypeRepository;
import com.lingyue.service.ResourceTypeService;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ResourceTypeServiceImpl implements ResourceTypeService {
    
    private final ResourceTypeRepository resourceTypeRepository;
    
    private final Map<String, ResourceType> resourceTypeCacheByCode = new ConcurrentHashMap<>();
    private final Map<Long, ResourceType> resourceTypeCacheById = new ConcurrentHashMap<>();
    
    public ResourceTypeServiceImpl(ResourceTypeRepository resourceTypeRepository) {
        this.resourceTypeRepository = resourceTypeRepository;
    }
    
    @PostConstruct
    public void init() {
        refreshCache();
    }
    
    public void refreshCache() {
        List<ResourceType> resourceTypes = resourceTypeRepository.findAll();
        resourceTypeCacheByCode.clear();
        resourceTypeCacheById.clear();
        
        for (ResourceType type : resourceTypes) {
            if (type.getCode() != null) {
                resourceTypeCacheByCode.put(type.getCode(), type);
            }
            resourceTypeCacheById.put(type.getId(), type);
        }
    }
    
    @Override
    public List<ResourceType> getAllResourceTypes() {
        return resourceTypeRepository.findAll();
    }
    
    @Override
    public ResourceType getResourceTypeByCode(String code) {
        ResourceType type = resourceTypeCacheByCode.get(code);
        if (type == null) {
            type = resourceTypeRepository.findByCode(code);
            if (type != null) {
                resourceTypeCacheByCode.put(code, type);
                resourceTypeCacheById.put(type.getId(), type);
            }
        }
        return type;
    }
    
    @Override
    public ResourceType getResourceTypeById(Long id) {
        ResourceType type = resourceTypeCacheById.get(id);
        if (type == null) {
            type = resourceTypeRepository.findById(id).orElse(null);
            if (type != null) {
                resourceTypeCacheById.put(id, type);
                if (type.getCode() != null) {
                    resourceTypeCacheByCode.put(type.getCode(), type);
                }
            }
        }
        return type;
    }
}
