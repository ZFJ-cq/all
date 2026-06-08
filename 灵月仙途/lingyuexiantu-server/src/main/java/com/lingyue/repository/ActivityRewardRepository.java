package com.lingyue.repository;

import com.lingyue.entity.ActivityReward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRewardRepository extends JpaRepository<ActivityReward, Long> {
    List<ActivityReward> findByIsEnabledOrderBySortOrderAsc(Boolean isEnabled);
    List<ActivityReward> findByActivityThresholdLessThanEqualOrderByActivityThresholdAsc(Integer activity);
}
