package com.lingyue.repository;

import com.lingyue.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByStatus(Integer status);
    List<Activity> findByStatusAndType(Integer status, String type);
    List<Activity> findByStatusAndIsHotTrue(Integer status);
}
