package com.lingyue.service;

import com.lingyue.entity.ResourceType;
import java.util.List;

public interface ResourceTypeService {
    List<ResourceType> getAllResourceTypes();
    ResourceType getResourceTypeByCode(String code);
    ResourceType getResourceTypeById(Long id);
}
