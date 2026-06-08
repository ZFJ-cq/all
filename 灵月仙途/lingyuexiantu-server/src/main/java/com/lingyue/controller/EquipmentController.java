package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.service.EquipmentService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/equipment")
public class EquipmentController {
    
    private final EquipmentService equipmentService;
    
    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }
    
    @PostMapping("/equip")
    public Map<String, Object> equipItem(@RequestBody Map<String, Object> request) {
        Long roleId = ((Number) request.get("roleId")).longValue();
        Long roleAssetId = ((Number) request.get("roleAssetId")).longValue();
        return equipmentService.equipItemFromAsset(roleId, roleAssetId);
    }
    
    @PostMapping("/equip-by-equipment")
    public Map<String, Object> equipByEquipmentId(@RequestParam Long roleId, 
                                                    @RequestParam Long roleEquipmentId) {
        return equipmentService.equipItem(roleId, roleEquipmentId);
    }
    
    @PostMapping("/unequip")
    public Map<String, Object> unequipItem(@RequestParam Long roleId, 
                                            @RequestParam Integer slot) {
        return equipmentService.unequipItem(roleId, slot);
    }
    
    @GetMapping("/stats/{roleId}")
    public Map<String, Object> getEquipmentStats(@PathVariable Long roleId) {
        return equipmentService.getRoleEquipmentStats(roleId);
    }
    
    @GetMapping("/equipped/{roleId}")
    public Map<String, Object> getEquippedItems(@PathVariable Long roleId) {
        return equipmentService.getRoleEquippedItems(roleId);
    }
    
    @PostMapping("/auto-equip")
    public Map<String, Object> autoEquip(@RequestBody Map<String, Long> request) {
        Long roleId = request.get("roleId");
        return equipmentService.autoEquipFromAssets(roleId);
    }
    
    @PostMapping("/unequip-all")
    public Map<String, Object> unequipAll(@RequestBody Map<String, Long> request) {
        Long roleId = request.get("roleId");
        return equipmentService.unequipAll(roleId);
    }
}
