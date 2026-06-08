package com.lingyue.service;

import com.lingyue.entity.TradeItem;
import com.lingyue.entity.TradeRecord;

import java.util.List;

public interface TradeService {
    List<TradeItem> getAllTradeItems();
    List<TradeItem> getTradeItemsByCategory(String category);
    TradeItem getTradeItemById(Long id);
    TradeRecord buyItem(Long roleId, Long itemId, int quantity);
    List<TradeRecord> getTradeRecordsByRoleId(Long roleId);
}