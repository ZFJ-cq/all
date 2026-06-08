package com.lingyue.repository;

import com.lingyue.entity.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceTypeRepository extends JpaRepository<ResourceType, Long> {
    ResourceType findByCode(String code);
}