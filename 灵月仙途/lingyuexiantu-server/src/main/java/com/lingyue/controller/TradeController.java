package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.TradeItem;
import com.lingyue.entity.TradeRecord;
import com.lingyue.service.TradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/trade")
public class TradeController {
    
    @Autowired
    private TradeService tradeService;
    
    @GetMapping("/items")
    public List<TradeItem> getTradeItems(@RequestParam(required = false) String category) {
        if (category != null) {
            return tradeService.getTradeItemsByCategory(category);
        }
        return tradeService.getAllTradeItems();
    }
    
    @GetMapping("/items/{id}")
    public TradeItem getTradeItemById(@PathVariable Long id) {
        return tradeService.getTradeItemById(id);
    }
    
    @PostMapping("/buy")
    public TradeRecord buyItem(@RequestParam Long roleId, @RequestParam Long itemId, @RequestParam int quantity) {
        // 参数验证
        if (roleId == null || roleId <= 0) {
            throw new IllegalArgumentException("角色ID无效");
        }
        if (itemId == null || itemId <= 0) {
            throw new IllegalArgumentException("物品ID无效");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("购买数量必须大于0");
        }
        return tradeService.buyItem(roleId, itemId, quantity);
    }
    
    @GetMapping("/records/{roleId}")
    public List<TradeRecord> getTradeRecords(@PathVariable Long roleId) {
        return tradeService.getTradeRecordsByRoleId(roleId);
    }
}