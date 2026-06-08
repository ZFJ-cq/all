package com.lingyue.controller;

import com.lingyuexiantu.common.Result;
import com.lingyue.entity.Item;
import com.lingyue.entity.ShopItem;
import com.lingyue.repository.ShopItemRepository;
import com.lingyue.service.InventoryService;
import com.lingyue.service.ItemService;
import com.lingyue.service.RoleAssetService;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/mall")
public class MallController {
    
    private final RoleAssetService roleAssetService;
    private final InventoryService inventoryService;
    private final ItemService itemService;
    private final ShopItemRepository shopItemRepository;
    
    public MallController(RoleAssetService roleAssetService, InventoryService inventoryService, ItemService itemService, ShopItemRepository shopItemRepository) {
        this.roleAssetService = roleAssetService;
        this.inventoryService = inventoryService;
        this.itemService = itemService;
        this.shopItemRepository = shopItemRepository;
    }
    
    @GetMapping("/products")
    public Result<Map<String, Object>> getProducts() {
        try {
            List<Map<String, Object>> products = new ArrayList<>();
            
            // 从数据库获取商品数据
            List<Item> items = itemService.getAllItems();
            List<ShopItem> shopItems = shopItemRepository.findAll();
            
            // 处理Item表中的商品
            for (Item item : items) {
                Map<String, Object> product = new HashMap<>();
                product.put("id", item.getId());
                product.put("name", item.getName());
                product.put("type", getItemTypeString(item.getType()));
                product.put("price", item.getPrice());
                product.put("description", item.getDescription());
                product.put("icon", getProductIcon(item.getType()));
                product.put("isMallItem", true); // 商城标识
                products.add(product);
            }
            
            // 处理ShopItem表中的商品
            for (ShopItem shopItem : shopItems) {
                Map<String, Object> product = new HashMap<>();
                product.put("id", shopItem.getId());
                product.put("name", shopItem.getName());
                product.put("type", shopItem.getType());
                product.put("price", shopItem.getPrice());
                product.put("description", shopItem.getName() + " - " + shopItem.getType());
                product.put("icon", getProductIconByType(shopItem.getType()));
                product.put("isMallItem", true); // 商城标识
                product.put("currency", shopItem.getCurrency());
                product.put("rarity", shopItem.getRarity());
                product.put("isHot", shopItem.getIsHot());
                product.put("isLimited", shopItem.getIsLimited());
                products.add(product);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("products", products);
            result.put("total", products.size());
            
            return Result.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取商品列表失败：" + e.getMessage());
        }
    }
    
    // 辅助方法：获取物品类型字符串
    private String getItemTypeString(Integer type) {
        if (type == null) return "其他";
        switch (type) {
            case 1: return "丹药";
            case 2: return "药品";
            case 3: return "装备";
            case 4: return "材料";
            default: return "其他";
        }
    }
    
    // 辅助方法：根据物品类型获取图标
    private String getProductIcon(Integer type) {
        if (type == null) return "🛒";
        switch (type) {
            case 1: return "🧪";
            case 2: return "💊";
            case 3: return "⚔️";
            case 4: return "📦";
            default: return "🛒";
        }
    }
    
    // 辅助方法：根据类型字符串获取图标
    private String getProductIconByType(String type) {
        switch (type) {
            case "dan_yao": return "🧪";
            case "cai_liao": return "📦";
            case "zhuang_bei": return "⚔️";
            default: return "🛒";
        }
    }
    
    @PostMapping("/buy")
    public Result<Map<String, Object>> buyProduct(@RequestBody Map<String, Object> request) {
        try {
            Long roleId = Long.parseLong(request.get("roleId").toString());
            Long productId = Long.parseLong(request.get("productId").toString());
            Integer quantity = Integer.parseInt(request.getOrDefault("quantity", 1).toString());
            
            // 计算商品价格
            int price = 0;
            switch (productId.intValue()) {
                case 1: price = 100; break; // 小还丹
                case 2: price = 500; break; // 大还丹
                case 3: price = 200; break; // 聚气丹
                case 4: price = 800; break; // 培元丹
                case 5: price = 50; break;  // 金疮药
                case 6: price = 80; break;  // 跌打药
                default: return Result.error("商品不存在");
            }
            
            int totalPrice = price * quantity;
            
            // 扣除货币
            try {
                roleAssetService.updateAsset(roleId, "灵石", -totalPrice);
            } catch (Exception e) {
                return Result.error("货币不足");
            }
            
            // 添加物品到背包
            Map<String, Object> addResult = inventoryService.addItemToInventory(roleId, productId, quantity);
            if (!addResult.containsKey("success") || !((Boolean) addResult.get("success"))) {
                // 回滚货币
                roleAssetService.updateAsset(roleId, "灵石", totalPrice);
                return Result.error("背包空间不足");
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "购买成功");
            result.put("success", true);
            result.put("productId", productId);
            result.put("quantity", quantity);
            result.put("totalPrice", totalPrice);
            
            return Result.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("操作失败: " + e.getMessage());
        }
    }
}