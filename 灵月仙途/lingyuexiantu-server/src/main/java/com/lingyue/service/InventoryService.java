package com.lingyue.service;

import com.lingyue.entity.Item;
import com.lingyue.entity.RoleItem;
import java.util.List;
import java.util.Map;

public interface InventoryService {
    
    List<RoleItem> getRoleInventory(Long roleId);
    
    Map<String, Object> addItemToInventory(Long roleId, Long itemId, int quantity);
    
    Map<String, Object> addItemsToInventory(Long roleId, List<Map<String, Object>> items);
    
    boolean removeItemFromInventory(Long roleId, Long itemId, int quantity);
    
    boolean hasSpaceForItem(Long roleId, Long itemId, int quantity);
    
    int calculateAvailableSpace(Long roleId, Long itemId);
}
