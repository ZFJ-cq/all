package com.lingyue.repository;

import com.lingyue.entity.WorldLocationFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorldLocationFeatureRepository extends JpaRepository<WorldLocationFeature, Long> {
    List<WorldLocationFeature> findByLocationIdOrderBySortOrderAsc(Long locationId);
    List<WorldLocationFeature> findByLocationIdAndIsActiveOrderBySortOrderAsc(Long locationId, Integer isActive);
}
