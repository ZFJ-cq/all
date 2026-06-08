package com.lingyue.repository;

import com.lingyue.entity.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssetTypeRepository extends JpaRepository<AssetType, Long> {
    AssetType findByName(String name);
    AssetType findByCode(String code);
    List<AssetType> findByType(String type);
}