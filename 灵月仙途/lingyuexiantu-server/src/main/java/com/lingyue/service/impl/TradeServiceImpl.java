package com.lingyue.service.impl;

import com.lingyue.entity.TradeItem;
import com.lingyue.entity.TradeRecord;
import com.lingyue.repository.TradeItemRepository;
import com.lingyue.repository.TradeRecordRepository;
import com.lingyue.service.RoleAssetService;
import com.lingyue.service.TradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TradeServiceImpl implements TradeService {
    
    @Autowired
    private TradeItemRepository tradeItemRepository;
    
    @Autowired
    private TradeRecordRepository tradeRecordRepository;
    
    @Autowired
    private RoleAssetService roleAssetService;
    
    @Override
    public List<TradeItem> getAllTradeItems() {
        return tradeItemRepository.findByActiveTrue();
    }
    
    @Override
    public List<TradeItem> getTradeItemsByCategory(String category) {
        return tradeItemRepository.findByCategoryAndActiveTrue(category);
    }
    
    @Override
    public TradeItem getTradeItemById(Long id) {
        return tradeItemRepository.findById(id).orElse(null);
    }
    
    @Override
    @Transactional
    public TradeRecord buyItem(Long roleId, Long itemId, int quantity) {
        TradeItem item = tradeItemRepository.findById(itemId).orElse(null);
        if (item == null || !item.isActive() || item.getStock() < quantity) {
            throw new RuntimeException("物品不存在或库存不足");
        }
        
        int totalPrice = item.getPrice() * quantity;
        
        // 检查并扣除角色的灵石
        roleAssetService.updateAsset(roleId, "灵石", -totalPrice);
        
        // 增加角色的物品
        roleAssetService.addAsset(roleId, itemId, quantity);
        
        // 更新物品库存
        item.setStock(item.getStock() - quantity);
        tradeItemRepository.save(item);
        
        // 创建交易记录
        TradeRecord record = new TradeRecord();
        record.setRoleId(roleId);
        record.setItemId(itemId);
        record.setItemName(item.getName());
        record.setQuantity(quantity);
        record.setTotalPrice(totalPrice);
        record.setType("buy");
        
        return tradeRecordRepository.save(record);
    }
    
    @Override
    public List<TradeRecord> getTradeRecordsByRoleId(Long roleId) {
        return tradeRecordRepository.findByRoleIdOrderByTradeTimeDesc(roleId);
    }
}