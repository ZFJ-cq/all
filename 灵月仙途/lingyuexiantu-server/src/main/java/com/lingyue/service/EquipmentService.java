package com.lingyue.service;

import java.util.Map;

public interface EquipmentService {
    
    Map<String, Object> equipItem(Long roleId, Long roleEquipmentId);
    
    Map<String, Object> equipItemFromAsset(Long roleId, Long roleAssetId);
    
    Map<String, Object> unequipItem(Long roleId, Integer slot);
    
    Map<String, Object> getRoleEquipmentStats(Long roleId);
    
    Map<String, Object> getRoleEquippedItems(Long roleId);
    
    Map<String, Object> autoEquip(Long roleId);
    
    Map<String, Object> autoEquipFromAssets(Long roleId);
    
    Map<String, Object> unequipAll(Long roleId);
}
