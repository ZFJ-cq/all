package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.Item;
import com.lingyue.service.ItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/item")
public class ItemController {
    
    private final ItemService itemService;
    
    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }
    
    @GetMapping("/list")
    public List<Item> getAllItems() {
        return itemService.getAllItems();
    }
    
    @GetMapping("/{id}")
    public Item getItemById(@PathVariable Long id) {
        return itemService.getItemById(id);
    }
    
    @PostMapping("/create")
    public Item createItem(@RequestBody Item item) {
        return itemService.createItem(item);
    }
    
    @PutMapping("/update/{id}")
    public Item updateItem(@PathVariable Long id, @RequestBody Item item) {
        return itemService.updateItem(id, item);
    }
    
    @DeleteMapping("/delete/{id}")
    public void deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
    }
    
    @GetMapping("/search")
    public List<Item> searchItems(@RequestParam String keyword) {
        return itemService.searchItems(keyword);
    }
    
    @GetMapping("/filter")
    public List<Item> filterItems(
            @RequestParam(required = false) Integer type,
            @RequestParam(required = false) Integer status) {
        return itemService.filterItems(type, status);
    }
}
