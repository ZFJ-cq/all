package com.lingyue.service.impl;

import com.lingyue.entity.Item;
import com.lingyue.repository.ItemRepository;
import com.lingyue.service.ItemService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemServiceImpl implements ItemService {
    
    private final ItemRepository itemRepository;
    
    public ItemServiceImpl(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }
    
    @Override
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }
    
    @Override
    public Item getItemById(Long id) {
        return itemRepository.findById(id).orElse(null);
    }
    
    @Override
    public Item createItem(Item item) {
        return itemRepository.save(item);
    }
    
    @Override
    public Item updateItem(Long id, Item item) {
        Item existingItem = itemRepository.findById(id).orElse(null);
        if (existingItem != null) {
            existingItem.setName(item.getName());
            existingItem.setDescription(item.getDescription());
            existingItem.setType(item.getType());
            existingItem.setUseEffect(item.getUseEffect());
            existingItem.setStackable(item.getStackable());
            existingItem.setMaxStack(item.getMaxStack());
            existingItem.setPrice(item.getPrice());
            existingItem.setStatus(item.getStatus());
            return itemRepository.save(existingItem);
        }
        return null;
    }
    
    @Override
    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }
    
    @Override
    public List<Item> searchItems(String keyword) {
        List<Item> allItems = itemRepository.findAll();
        return allItems.stream()
                .filter(item -> item.getName().contains(keyword) || item.getDescription().contains(keyword))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<Item> filterItems(Integer type, Integer status) {
        List<Item> allItems = itemRepository.findAll();
        return allItems.stream()
                .filter(item -> (type == null || item.getType().equals(type)) &&
                               (status == null || item.getStatus().equals(status)))
                .collect(Collectors.toList());
    }
}
