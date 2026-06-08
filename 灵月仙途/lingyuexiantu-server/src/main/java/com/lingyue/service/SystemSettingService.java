package com.lingyue.service;

import com.lingyue.entity.SystemSetting;

public interface SystemSettingService {
    SystemSetting getSettingByKey(String key);
    SystemSetting saveSetting(String key, String value, String description);
}
