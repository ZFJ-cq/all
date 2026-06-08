package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.Item;
import com.lingyue.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/admin/item")
public class ItemInitController {
    
    @Autowired
    private ItemRepository itemRepository;
    
    @PostMapping("/init")
    public Map<String, Object> initItems() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 先清空现有数据
            itemRepository.deleteAll();
            
            // 插入示例物品数据
            String[][] items = {
                // 货币类 (type: 1)
                {"灵石", "修仙世界的基础货币", "1", "1", "9999", "10", "1"},
                {"仙石", "修仙世界的高级货币", "1", "1", "9999", "100", "1"},
                {"魂石", "用于提升灵魂强度", "1", "1", "9999", "50", "1"},
                // 功法类 (type: 2)
                {"基础心法", "修仙入门心法", "2", "0", "1", "100", "1"},
                {"炼气诀", "炼气期修炼功法", "2", "0", "1", "500", "1"},
                // 丹药类 (type: 3)
                {"聚气丹", "快速恢复灵气", "3", "1", "99", "10", "1"},
                {"筑基丹", "辅助突破筑基期", "3", "1", "10", "100", "1"},
                {"疗伤丹", "恢复生命值", "3", "1", "99", "20", "1"},
                // 武器类 (type: 4)
                {"铁剑", "普通铁制长剑", "4", "0", "1", "50", "1"},
                {"精钢剑", "精钢打造的长剑", "4", "0", "1", "200", "1"},
                {"灵剑", "蕴含灵气的宝剑", "4", "0", "1", "1000", "1"},
                // 护甲类 (type: 5)
                {"布衣", "普通布制护甲", "5", "0", "1", "30", "1"},
                {"皮甲", "皮革制作的护甲", "5", "0", "1", "150", "1"},
                {"灵甲", "蕴含灵气的护甲", "5", "0", "1", "800", "1"},
                // 饰品类 (type: 6)
                {"木戒指", "普通木质戒指", "6", "0", "1", "20", "1"},
                {"银项链", "银质项链", "6", "0", "1", "120", "1"},
                {"灵玉佩", "蕴含灵气的玉佩", "6", "0", "1", "600", "1"}
            };
            
            for (String[] itemData : items) {
                Item item = new Item();
                item.setName(itemData[0]);
                item.setDescription(itemData[1]);
                item.setType(Integer.parseInt(itemData[2]));
                item.setStackable(Integer.parseInt(itemData[3]));
                item.setMaxStack(Integer.parseInt(itemData[4]));
                item.setPrice(Integer.parseInt(itemData[5]));
                item.setStatus(Integer.parseInt(itemData[6]));
                itemRepository.save(item);
            }
            
            result.put("success", true);
            result.put("message", "物品数据初始化成功，共插入 " + items.length + " 个物品");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "初始化失败: " + e.getMessage());
        }
        
        return result;
    }
}
