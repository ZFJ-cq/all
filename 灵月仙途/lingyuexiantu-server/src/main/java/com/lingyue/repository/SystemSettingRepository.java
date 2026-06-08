package com.lingyue.repository;

import com.lingyue.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
    // 根据键名查询设置
    Optional<SystemSetting> findByKey(String key);
}
