package com.lingyue.service;

import com.lingyue.entity.Item;
import java.util.List;

public interface ItemService {
    List<Item> getAllItems();
    Item getItemById(Long id);
    Item createItem(Item item);
    Item updateItem(Long id, Item item);
    void deleteItem(Long id);
    List<Item> searchItems(String keyword);
    List<Item> filterItems(Integer type, Integer status);
}
