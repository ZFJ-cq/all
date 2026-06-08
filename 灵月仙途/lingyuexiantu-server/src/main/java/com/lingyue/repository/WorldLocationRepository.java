package com.lingyue.repository;

import com.lingyue.entity.WorldLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorldLocationRepository extends JpaRepository<WorldLocation, Long> {
    List<WorldLocation> findByIsActiveOrderBySortOrderAsc(Integer isActive);
    List<WorldLocation> findByCategoryOrderBySortOrderAsc(String category);
    WorldLocation findByName(String name);
}
