package com.lingyue.service.impl;

import com.lingyue.entity.Item;
import com.lingyue.entity.RoleItem;
import com.lingyue.repository.ItemRepository;
import com.lingyue.repository.RoleItemRepository;
import com.lingyue.service.InventoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class InventoryServiceImpl implements InventoryService {
    
    private static final int DEFAULT_MAX_STACK = 99;
    private static final int MAX_INVENTORY_SIZE = 100;
    
    private final RoleItemRepository roleItemRepository;
    private final ItemRepository itemRepository;
    
    public InventoryServiceImpl(RoleItemRepository roleItemRepository, 
                                ItemRepository itemRepository) {
        this.roleItemRepository = roleItemRepository;
        this.itemRepository = itemRepository;
    }
    
    @Override
    public List<RoleItem> getRoleInventory(Long roleId) {
        return roleItemRepository.findByRoleId(roleId);
    }
    
    @Override
    @Transactional
    public Map<String, Object> addItemToInventory(Long roleId, Long itemId, int quantity) {
        Map<String, Object> result = new HashMap<>();
        
        Optional<Item> itemOpt = itemRepository.findById(itemId);
        if (itemOpt.isEmpty()) {
            result.put("success", false);
            result.put("message", "物品不存在");
            return result;
        }
        
        Item item = itemOpt.get();
        boolean stackable = item.getStackable() != null && item.getStackable() == 1;
        int maxStack = item.getMaxStack() != null ? item.getMaxStack() : (stackable ? DEFAULT_MAX_STACK : 1);
        
        int remainingQuantity = quantity;
        List<RoleItem> existingItems = roleItemRepository.findByRoleIdAndItemId(roleId, itemId);
        
        if (stackable && !existingItems.isEmpty()) {
            for (RoleItem existingItem : existingItems) {
                if (remainingQuantity <= 0) break;
                
                int currentQuantity = existingItem.getQuantity() != null ? existingItem.getQuantity() : 0;
                int availableSpace = maxStack - currentQuantity;
                
                if (availableSpace > 0) {
                    int addQuantity = Math.min(availableSpace, remainingQuantity);
                    existingItem.setQuantity(currentQuantity + addQuantity);
                    roleItemRepository.save(existingItem);
                    remainingQuantity -= addQuantity;
                }
            }
        }
        
        if (remainingQuantity > 0) {
            List<RoleItem> allItems = roleItemRepository.findByRoleId(roleId);
            int usedSlots = allItems.size();
            
            while (remainingQuantity > 0 && usedSlots < MAX_INVENTORY_SIZE) {
                int addQuantity = stackable ? Math.min(maxStack, remainingQuantity) : 1;
                
                RoleItem newItem = new RoleItem();
                newItem.setRoleId(roleId);
                newItem.setItemId(itemId);
                newItem.setQuantity(addQuantity);
                newItem.setPosition(usedSlots);
                newItem.setAcquireTime(new Date());
                roleItemRepository.save(newItem);
                
                remainingQuantity -= addQuantity;
                usedSlots++;
            }
        }
        
        if (remainingQuantity > 0) {
            result.put("success", false);
            result.put("message", "背包空间不足");
            result.put("remainingQuantity", remainingQuantity);
            result.put("addedQuantity", quantity - remainingQuantity);
        } else {
            result.put("success", true);
            result.put("message", "物品添加成功");
            result.put("addedQuantity", quantity);
        }
        
        return result;
    }
    
    @Override
    @Transactional
    public Map<String, Object> addItemsToInventory(Long roleId, List<Map<String, Object>> items) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> failedItems = new ArrayList<>();
        int totalAdded = 0;
        
        for (Map<String, Object> itemData : items) {
            Long itemId = Long.parseLong(itemData.get("itemId").toString());
            int quantity = Integer.parseInt(itemData.get("quantity").toString());
            
            Map<String, Object> addResult = addItemToInventory(roleId, itemId, quantity);
            
            if (!(Boolean) addResult.get("success")) {
                failedItems.add(itemData);
            } else {
                totalAdded += (Integer) addResult.get("addedQuantity");
            }
        }
        
        result.put("success", failedItems.isEmpty());
        result.put("totalAdded", totalAdded);
        result.put("failedItems", failedItems);
        result.put("message", failedItems.isEmpty() ? "所有物品添加成功" : "部分物品添加失败");
        
        return result;
    }
    
    @Override
    @Transactional
    public boolean removeItemFromInventory(Long roleId, Long itemId, int quantity) {
        List<RoleItem> items = roleItemRepository.findByRoleIdAndItemId(roleId, itemId);
        
        if (items.isEmpty()) {
            return false;
        }
        
        int remainingToRemove = quantity;
        
        for (RoleItem item : items) {
            if (remainingToRemove <= 0) break;
            
            int currentQuantity = item.getQuantity() != null ? item.getQuantity() : 0;
            
            if (currentQuantity <= remainingToRemove) {
                roleItemRepository.delete(item);
                remainingToRemove -= currentQuantity;
            } else {
                item.setQuantity(currentQuantity - remainingToRemove);
                roleItemRepository.save(item);
                remainingToRemove = 0;
            }
        }
        
        return remainingToRemove == 0;
    }
    
    @Override
    public boolean hasSpaceForItem(Long roleId, Long itemId, int quantity) {
        Optional<Item> itemOpt = itemRepository.findById(itemId);
        if (itemOpt.isEmpty()) {
            return false;
        }
        
        Item item = itemOpt.get();
        boolean stackable = item.getStackable() != null && item.getStackable() == 1;
        int maxStack = item.getMaxStack() != null ? item.getMaxStack() : (stackable ? DEFAULT_MAX_STACK : 1);
        
        int availableSpace = calculateAvailableSpace(roleId, itemId);
        return availableSpace >= quantity;
    }
    
    @Override
    public int calculateAvailableSpace(Long roleId, Long itemId) {
        Optional<Item> itemOpt = itemRepository.findById(itemId);
        if (itemOpt.isEmpty()) {
            return 0;
        }
        
        Item item = itemOpt.get();
        boolean stackable = item.getStackable() != null && item.getStackable() == 1;
        int maxStack = item.getMaxStack() != null ? item.getMaxStack() : (stackable ? DEFAULT_MAX_STACK : 1);
        
        List<RoleItem> existingItems = roleItemRepository.findByRoleIdAndItemId(roleId, itemId);
        int availableSpace = 0;
        
        if (stackable && !existingItems.isEmpty()) {
            for (RoleItem existingItem : existingItems) {
                int currentQuantity = existingItem.getQuantity() != null ? existingItem.getQuantity() : 0;
                availableSpace += maxStack - currentQuantity;
            }
        }
        
        List<RoleItem> allItems = roleItemRepository.findByRoleId(roleId);
        int usedSlots = allItems.size();
        int emptySlots = MAX_INVENTORY_SIZE - usedSlots;
        
        if (stackable) {
            availableSpace += emptySlots * maxStack;
        } else {
            availableSpace += emptySlots;
        }
        
        return availableSpace;
    }
}
