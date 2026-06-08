package com.lingyue.controller;

import com.lingyue.entity.Inventory;
import com.lingyue.repository.InventoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/inventory")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class InventoryController {
    
    private final InventoryRepository inventoryRepository;
    
    public InventoryController(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }
    
    @GetMapping("/{roleId}")
    public ResponseEntity<List<Map<String, Object>>> getInventory(@PathVariable Long roleId,
                                                           @RequestParam(required = false) String type) {
        try {
            List<Inventory> items;
            
            if (type != null && !type.isEmpty()) {
                items = inventoryRepository.findByRoleIdAndItemType(roleId, type);
            } else {
                items = inventoryRepository.findByRoleId(roleId);
            }
            
            List<Map<String, Object>> itemList = items.stream().map(item -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", item.getId());
                map.put("itemId", item.getItemId());
                map.put("name", item.getItemName());
                map.put("type", item.getItemType());
                map.put("rarity", item.getRarity());
                map.put("count", item.getStackSize());
                map.put("icon", getItemIcon(item.getItemType(), item.getItemName()));
                map.put("description", getItemDescription(item.getItemName(), item.getRarity()));
                return map;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(itemList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Collections.emptyList());
        }
    }
    
    @PostMapping("/use")
    public ResponseEntity<Map<String, Object>> useItem(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long roleId = request.get("roleId") != null ? Long.valueOf(request.get("roleId").toString()) : null;
            Long itemId = request.get("itemId") != null ? Long.valueOf(request.get("itemId").toString()) : null;
            int count = request.get("count") != null ? Integer.parseInt(request.get("count").toString()) : 1;
            
            if (roleId == null || itemId == null) {
                response.put("success", false);
                response.put("message", "参数不完整");
                return ResponseEntity.badRequest().body(response);
            }
            
            Optional<Inventory> itemOpt = inventoryRepository.findById(itemId);
            if (!itemOpt.isPresent() || !itemOpt.get().getRoleId().equals(roleId)) {
                response.put("success", false);
                response.put("message", "物品不存在");
                return ResponseEntity.badRequest().body(response);
            }
            
            Inventory item = itemOpt.get();
            int currentCount = item.getStackSize() != null ? item.getStackSize() : 0;
            if (currentCount <= count) {
                inventoryRepository.delete(item);
            } else {
                item.setStackSize(currentCount - count);
                inventoryRepository.save(item);
            }
            
            response.put("success", true);
            response.put("message", "使用成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "使用物品失败：" + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PostMapping("/sell")
    public ResponseEntity<Map<String, Object>> sellItem(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long roleId = request.get("roleId") != null ? Long.valueOf(request.get("roleId").toString()) : null;
            Long itemId = request.get("itemId") != null ? Long.valueOf(request.get("itemId").toString()) : null;
            int count = request.get("count") != null ? Integer.parseInt(request.get("count").toString()) : 1;
            
            if (roleId == null || itemId == null) {
                response.put("success", false);
                response.put("message", "参数不完整");
                return ResponseEntity.badRequest().body(response);
            }
            
            Optional<Inventory> itemOpt = inventoryRepository.findById(itemId);
            if (!itemOpt.isPresent() || !itemOpt.get().getRoleId().equals(roleId)) {
                response.put("success", false);
                response.put("message", "物品不存在");
                return ResponseEntity.badRequest().body(response);
            }
            
            Inventory item = itemOpt.get();
            int sellPrice = calculateSellPrice(item.getRarity());
            int currentCount = item.getStackSize() != null ? item.getStackSize() : 0;
            
            if (currentCount <= count) {
                inventoryRepository.delete(item);
            } else {
                item.setStackSize(currentCount - count);
                inventoryRepository.save(item);
            }
            
            response.put("success", true);
            response.put("message", "出售成功");
            response.put("sellPrice", sellPrice * count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "出售物品失败：" + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PostMapping("/split")
    public ResponseEntity<Map<String, Object>> splitItem(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long roleId = request.get("roleId") != null ? Long.valueOf(request.get("roleId").toString()) : null;
            Long itemId = request.get("itemId") != null ? Long.valueOf(request.get("itemId").toString()) : null;
            int count = request.get("count") != null ? Integer.parseInt(request.get("count").toString()) : 1;
            
            if (roleId == null || itemId == null) {
                response.put("success", false);
                response.put("message", "参数不完整");
                return ResponseEntity.badRequest().body(response);
            }
            
            Optional<Inventory> itemOpt = inventoryRepository.findById(itemId);
            if (!itemOpt.isPresent() || !itemOpt.get().getRoleId().equals(roleId)) {
                response.put("success", false);
                response.put("message", "物品不存在");
                return ResponseEntity.badRequest().body(response);
            }
            
            Inventory item = itemOpt.get();
            int currentCount = item.getStackSize() != null ? item.getStackSize() : 0;
            if (currentCount <= count) {
                response.put("success", false);
                response.put("message", "拆分数量不能大于等于物品数量");
                return ResponseEntity.badRequest().body(response);
            }
            
            item.setStackSize(currentCount - count);
            inventoryRepository.save(item);
            
            Inventory newItem = new Inventory();
            newItem.setRoleId(roleId);
            newItem.setItemId(item.getItemId());
            newItem.setItemName(item.getItemName());
            newItem.setItemType(item.getItemType());
            newItem.setRarity(item.getRarity());
            newItem.setStackSize(count);
            inventoryRepository.save(newItem);
            
            response.put("success", true);
            response.put("message", "拆分成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "拆分物品失败：" + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PostMapping("/organize")
    public ResponseEntity<Map<String, Object>> organizeBag(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long roleId = request.get("roleId") != null ? Long.valueOf(request.get("roleId").toString()) : null;
            if (roleId == null) {
                response.put("success", false);
                response.put("message", "参数不完整");
                return ResponseEntity.badRequest().body(response);
            }
            
            List<Inventory> items = inventoryRepository.findByRoleId(roleId);
            Map<String, Inventory> merged = new LinkedHashMap<>();
            List<Inventory> toDelete = new ArrayList<>();
            
            for (Inventory item : items) {
                String key = item.getItemId() != null ? item.getItemId().toString() : item.getItemName();
                if (merged.containsKey(key)) {
                    Inventory existing = merged.get(key);
                    existing.setStackSize((existing.getStackSize() != null ? existing.getStackSize() : 0) + 
                                         (item.getStackSize() != null ? item.getStackSize() : 0));
                    toDelete.add(item);
                } else {
                    merged.put(key, item);
                }
            }
            
            for (Inventory item : toDelete) {
                inventoryRepository.delete(item);
            }
            inventoryRepository.saveAll(merged.values());
            
            response.put("success", true);
            response.put("message", "整理完成");
            response.put("mergedCount", toDelete.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "整理背包失败：" + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PostMapping("/expand")
    public ResponseEntity<Map<String, Object>> expandBag(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long roleId = request.get("roleId") != null ? Long.valueOf(request.get("roleId").toString()) : null;
            if (roleId == null) {
                response.put("success", false);
                response.put("message", "参数不完整");
                return ResponseEntity.badRequest().body(response);
            }
            
            response.put("success", true);
            response.put("message", "背包扩容成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "背包扩容失败：" + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    private int calculateSellPrice(String rarity) {
        if (rarity == null) return 1;
        switch (rarity) {
            case "common": return 5;
            case "uncommon": return 15;
            case "rare": return 50;
            case "epic": return 200;
            case "legendary": return 1000;
            default: return 1;
        }
    }
    
    private String getItemIcon(String type, String name) {
        if (name != null) {
            if (name.contains("丹")) return "🧪";
            if (name.contains("药")) return "💊";
            if (name.contains("剑")) return "⚔️";
            if (name.contains("刀")) return "🗡️";
            if (name.contains("甲")) return "🛡️";
            if (name.contains("袍")) return "👘";
            if (name.contains("石")) return "💰";
            if (name.contains("玉")) return "💎";
            if (name.contains("草")) return "🌿";
            if (name.contains("木")) return "🪵";
        }
        
        if (type != null) {
            switch (type) {
                case "dan_yao": return "🧪";
                case "cai_liao": return "🌿";
                case "zhuang_bei": return "⚔️";
                case "fa_bao": return "✨";
            }
        }
        return "📦";
    }
    
    private String getItemDescription(String name, String rarity) {
        String rarityDesc = "";
        if (rarity != null) {
            switch (rarity) {
                case "common": rarityDesc = "普通"; break;
                case "uncommon": rarityDesc = "精良"; break;
                case "rare": rarityDesc = "稀有"; break;
                case "epic": rarityDesc = "史诗"; break;
                case "legendary": rarityDesc = "传说"; break;
            }
        }
        return rarityDesc + "品阶 · " + name;
    }
}
