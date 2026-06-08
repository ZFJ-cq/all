package com.lingyue.service.impl;

import com.lingyue.entity.SystemSetting;
import com.lingyue.repository.SystemSettingRepository;
import com.lingyue.service.SystemSettingService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class SystemSettingServiceImpl implements SystemSettingService {
    
    private final SystemSettingRepository systemSettingRepository;
    
    public SystemSettingServiceImpl(SystemSettingRepository systemSettingRepository) {
        this.systemSettingRepository = systemSettingRepository;
    }
    
    @Override
    public SystemSetting getSettingByKey(String key) {
        return systemSettingRepository.findByKey(key).orElse(null);
    }
    
    @Override
    public SystemSetting saveSetting(String key, String value, String description) {
        Optional<SystemSetting> existingSetting = systemSettingRepository.findByKey(key);
        SystemSetting setting;
        
        if (existingSetting.isPresent()) {
            setting = existingSetting.get();
            setting.setValue(value);
        } else {
            setting = new SystemSetting();
            setting.setKey(key);
            setting.setValue(value);
            setting.setDescription(description);
        }
        
        return systemSettingRepository.save(setting);
    }
}
