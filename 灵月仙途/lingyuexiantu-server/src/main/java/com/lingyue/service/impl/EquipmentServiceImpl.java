package com.lingyue.service.impl;

import com.lingyue.entity.*;
import com.lingyue.repository.*;
import com.lingyue.service.EquipmentService;
import com.lingyue.service.AttributeCalculatorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class EquipmentServiceImpl implements EquipmentService {
    
    private static final Logger logger = LoggerFactory.getLogger(EquipmentServiceImpl.class);
    
    private final RoleEquipmentRepository roleEquipmentRepository;
    private final EquipmentRepository equipmentRepository;
    private final GameRoleRepository gameRoleRepository;
    
    @Autowired
    private AttributeCalculatorService attributeCalculatorService;
    
    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    
    public EquipmentServiceImpl(RoleEquipmentRepository roleEquipmentRepository,
                               EquipmentRepository equipmentRepository,
                               GameRoleRepository gameRoleRepository) {
        this.roleEquipmentRepository = roleEquipmentRepository;
        this.equipmentRepository = equipmentRepository;
        this.gameRoleRepository = gameRoleRepository;
    }
    
    @Override
    @Transactional
    public Map<String, Object> equipItem(Long roleId, Long roleEquipmentId) {
        Map<String, Object> result = new HashMap<>();
        
        Optional<RoleEquipment> roleEquipmentOpt = roleEquipmentRepository.findById(roleEquipmentId);
        if (roleEquipmentOpt.isEmpty()) {
            result.put("success", false);
            result.put("message", "装备不存在");
            return result;
        }
        
        RoleEquipment roleEquipment = roleEquipmentOpt.get();
        if (!roleEquipment.getRoleId().equals(roleId)) {
            result.put("success", false);
            result.put("message", "无权操作此装备");
            return result;
        }
        
        Optional<Equipment> equipmentOpt = equipmentRepository.findById(roleEquipment.getEquipmentId());
        if (equipmentOpt.isEmpty()) {
            result.put("success", false);
            result.put("message", "装备数据不存在");
            return result;
        }
        
        Equipment equipment = equipmentOpt.get();
        Integer slot = equipment.getType();
        
        Optional<RoleEquipment> existingEquipped = roleEquipmentRepository
            .findByRoleIdAndSlotAndStatus(roleId, slot, 1);
        
        if (existingEquipped.isPresent()) {
            RoleEquipment existing = existingEquipped.get();
            existing.setStatus(0);
            existing.setSlot(null);
            roleEquipmentRepository.save(existing);
        }
        
        roleEquipment.setSlot(slot);
        roleEquipment.setStatus(1);
        roleEquipment.setEquipTime(new Date());
        roleEquipmentRepository.save(roleEquipment);
        
        recalculateRoleStats(roleId);
        
        result.put("success", true);
        result.put("message", "装备穿戴成功");
        result.put("equipment", equipment);
        result.put("stats", getRoleEquipmentStats(roleId));
        
        return result;
    }
    
    @Override
    @Transactional
    public Map<String, Object> equipItemFromAsset(Long roleId, Long roleAssetId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String assetSql = "SELECT * FROM role_asset WHERE id = ? AND role_id = ?";
            Map<String, Object> assetMap = jdbcTemplate.queryForMap(assetSql, roleAssetId, roleId);
            
            if (assetMap == null) {
                result.put("success", false);
                result.put("message", "资产不存在或无权操作");
                return result;
            }
            
            String assetTypeCode = (String) assetMap.get("asset_type_code");
            String subtype = (String) assetMap.get("subtype");
            
            String assetTypeSql = "SELECT * FROM asset_types WHERE code = ?";
            Map<String, Object> assetTypeMap = jdbcTemplate.queryForMap(assetTypeSql, assetTypeCode);
            
            if (assetTypeMap == null) {
                result.put("success", false);
                result.put("message", "资产类型不存在");
                return result;
            }
            
            String assetType = (String) assetTypeMap.get("type");
            String assetTypeName = (String) assetTypeMap.get("name");
            
            if (!"EQUIPMENT".equals(assetType)) {
                result.put("success", false);
                result.put("message", "该物品不是装备");
                return result;
            }
            
            int slot = getSlotFromSubtype(subtype);
            
            String equipmentSql = "SELECT * FROM equipment WHERE name = ?";
            Map<String, Object> equipmentMap = null;
            try {
                equipmentMap = jdbcTemplate.queryForMap(equipmentSql, assetTypeName);
            } catch (Exception e) {
                int defaultAtk = getStatBySlot(slot, "attack");
                int defaultDef = getStatBySlot(slot, "defense");
                int defaultHp = getStatBySlot(slot, "hp");
                int defaultMp = getStatBySlot(slot, "mp");
                
                String insertEquipmentSql = "INSERT INTO equipment (name, type, rarity, level, attack, defense, hp_bonus, mp_bonus, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                jdbcTemplate.update(insertEquipmentSql, 
                    assetTypeName, 
                    slot,
                    1,
                    1,
                    defaultAtk,
                    defaultDef,
                    defaultHp,
                    defaultMp,
                    assetTypeName,
                    1
                );
                
                equipmentMap = jdbcTemplate.queryForMap(equipmentSql, assetTypeName);
            }
            
            Long equipmentId = ((Number) equipmentMap.get("id")).longValue();
            
            String roleEquipmentSql = "SELECT * FROM role_equipment WHERE role_id = ? AND equipment_id = ?";
            Map<String, Object> roleEquipmentMap = null;
            try {
                roleEquipmentMap = jdbcTemplate.queryForMap(roleEquipmentSql, roleId, equipmentId);
            } catch (Exception e) {
                String insertRoleEquipmentSql = "INSERT INTO role_equipment (role_id, equipment_id, slot, status, equip_time) VALUES (?, ?, ?, ?, ?)";
                jdbcTemplate.update(insertRoleEquipmentSql, roleId, equipmentId, null, 0, new Date());
                
                roleEquipmentMap = jdbcTemplate.queryForMap(roleEquipmentSql, roleId, equipmentId);
            }
            
            Long roleEquipmentId = ((Number) roleEquipmentMap.get("id")).longValue();
            
            return equipItem(roleId, roleEquipmentId);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "装备穿戴失败：" + e.getMessage());
            return result;
        }
    }
    
    private int getSlotFromSubtype(String subtype) {
        if (subtype == null) return 1;
        switch (subtype.toLowerCase()) {
            case "weapon": return 1;
            case "head": return 2;
            case "body": return 3;
            case "legs": return 4;
            case "feet": return 5;
            case "accessory":
            case "pet": return 6;
            default: return 1;
        }
    }
    
    private int getStatBySlot(int slot, String statType) {
        switch (statType) {
            case "attack":
                switch (slot) {
                    case 1: return 10;
                    case 2: return 3;
                    case 3: return 5;
                    case 4: return 2;
                    case 5: return 2;
                    case 6: return 5;
                    default: return 5;
                }
            case "defense":
                switch (slot) {
                    case 1: return 2;
                    case 2: return 8;
                    case 3: return 10;
                    case 4: return 5;
                    case 5: return 6;
                    case 6: return 3;
                    default: return 5;
                }
            case "hp":
                switch (slot) {
                    case 1: return 20;
                    case 2: return 30;
                    case 3: return 50;
                    case 4: return 25;
                    case 5: return 20;
                    case 6: return 30;
                    default: return 30;
                }
            case "mp":
                switch (slot) {
                    case 1: return 30;
                    case 2: return 10;
                    case 3: return 15;
                    case 4: return 10;
                    case 5: return 10;
                    case 6: return 20;
                    default: return 15;
                }
            default: return 0;
        }
    }
    
    @Override
    @Transactional
    public Map<String, Object> unequipItem(Long roleId, Integer slot) {
        Map<String, Object> result = new HashMap<>();
        
        Optional<RoleEquipment> roleEquipmentOpt = roleEquipmentRepository
            .findByRoleIdAndSlotAndStatus(roleId, slot, 1);
        
        if (roleEquipmentOpt.isEmpty()) {
            result.put("success", false);
            result.put("message", "该位置没有装备");
            return result;
        }
        
        RoleEquipment roleEquipment = roleEquipmentOpt.get();
        
        roleEquipment.setSlot(null);
        roleEquipment.setStatus(0);
        roleEquipmentRepository.save(roleEquipment);
        
        recalculateRoleStats(roleId);
        
        result.put("success", true);
        result.put("message", "装备卸下成功");
        result.put("stats", getRoleEquipmentStats(roleId));
        
        return result;
    }
    
    @Override
    public Map<String, Object> getRoleEquipmentStats(Long roleId) {
        Map<String, Object> stats = new HashMap<>();
        
        int totalAttack = 0;
        int totalDefense = 0;
        int totalHpBonus = 0;
        int totalMpBonus = 0;
        
        List<RoleEquipment> equippedItems = roleEquipmentRepository.findByRoleIdAndStatus(roleId, 1);
        
        for (RoleEquipment roleEquip : equippedItems) {
            Optional<Equipment> equipOpt = equipmentRepository.findById(roleEquip.getEquipmentId());
            if (equipOpt.isPresent()) {
                Equipment equip = equipOpt.get();
                totalAttack += equip.getAttack() != null ? equip.getAttack() : 0;
                totalDefense += equip.getDefense() != null ? equip.getDefense() : 0;
                totalHpBonus += equip.getHpBonus() != null ? equip.getHpBonus() : 0;
                totalMpBonus += equip.getMpBonus() != null ? equip.getMpBonus() : 0;
            }
        }
        
        stats.put("attack", totalAttack);
        stats.put("defense", totalDefense);
        stats.put("hpBonus", totalHpBonus);
        stats.put("mpBonus", totalMpBonus);
        
        return stats;
    }
    
    @Override
    public Map<String, Object> getRoleEquippedItems(Long roleId) {
        Map<String, Object> result = new HashMap<>();
        
        List<RoleEquipment> equippedItems = roleEquipmentRepository.findByRoleIdAndStatus(roleId, 1);
        Map<Integer, Equipment> slotEquipment = new HashMap<>();
        List<Map<String, Object>> equippedList = new ArrayList<>();
        
        for (RoleEquipment roleEquip : equippedItems) {
            Optional<Equipment> equipOpt = equipmentRepository.findById(roleEquip.getEquipmentId());
            if (equipOpt.isPresent() && roleEquip.getSlot() != null) {
                Equipment equip = equipOpt.get();
                slotEquipment.put(roleEquip.getSlot(), equip);
                
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("id", equip.getId());
                itemMap.put("name", equip.getName());
                itemMap.put("slot", roleEquip.getSlot());
                itemMap.put("slotId", roleEquip.getSlot());
                itemMap.put("slot_id", roleEquip.getSlot());
                itemMap.put("assetType", "装备");
                itemMap.put("assetName", equip.getName());
                itemMap.put("item_type", "zhuang_bei");
                itemMap.put("attack", equip.getAttack() != null ? equip.getAttack() : 0);
                itemMap.put("defense", equip.getDefense() != null ? equip.getDefense() : 0);
                itemMap.put("hpBonus", equip.getHpBonus() != null ? equip.getHpBonus() : 0);
                itemMap.put("mpBonus", equip.getMpBonus() != null ? equip.getMpBonus() : 0);
                itemMap.put("rarity", equip.getRarity());
                itemMap.put("level", equip.getLevel());
                itemMap.put("description", equip.getDescription());
                itemMap.put("roleEquipmentId", roleEquip.getId());
                equippedList.add(itemMap);
            }
        }
        
        result.put("equippedItems", slotEquipment);
        result.put("equippedList", equippedList);
        result.put("stats", getRoleEquipmentStats(roleId));
        
        return result;
    }
    
    private void updateRoleStats(Long roleId, Equipment equipment, boolean isEquipping) {
        try {
            attributeCalculatorService.clearCache(roleId);
        } catch (Exception e) {
            logger.warn("清除属性缓存失败，roleId={}", roleId);
        }
    }
    
    private void recalculateRoleStats(Long roleId) {
        try {
            attributeCalculatorService.clearCache(roleId);
            attributeCalculatorService.calculateAttributes(roleId);
        } catch (IllegalArgumentException e) {
            logger.debug("角色属性数据不存在，跳过属性重算，roleId={}", roleId);
        } catch (Exception e) {
            logger.warn("重新计算属性失败，roleId={}, error={}", roleId, e.getMessage());
        }
    }
    
    @Override
    @Transactional
    public Map<String, Object> autoEquip(Long roleId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 首先卸下所有装备
            unequipAll(roleId);
            
            // 获取角色所有装备
            List<RoleEquipment> roleEquipments = roleEquipmentRepository.findByRoleId(roleId);
            
            // 按装备类型分组
            Map<Integer, List<RoleEquipment>> equipmentBySlot = new HashMap<>();
            for (RoleEquipment roleEquip : roleEquipments) {
                Optional<Equipment> equipOpt = equipmentRepository.findById(roleEquip.getEquipmentId());
                if (equipOpt.isPresent()) {
                    Equipment equipment = equipOpt.get();
                    int slot = equipment.getType();
                    equipmentBySlot.computeIfAbsent(slot, k -> new ArrayList<>()).add(roleEquip);
                }
            }
            
            // 为每个槽位选择最好的装备
            for (Map.Entry<Integer, List<RoleEquipment>> entry : equipmentBySlot.entrySet()) {
                int slot = entry.getKey();
                List<RoleEquipment> equipments = entry.getValue();
                
                // 按装备等级排序，选择最高级的
                RoleEquipment bestEquipment = null;
                int bestLevel = 0;
                
                for (RoleEquipment roleEquip : equipments) {
                    Optional<Equipment> equipOpt = equipmentRepository.findById(roleEquip.getEquipmentId());
                    if (equipOpt.isPresent()) {
                        Equipment equipment = equipOpt.get();
                        if (equipment.getLevel() != null && equipment.getLevel() > bestLevel) {
                            bestLevel = equipment.getLevel();
                            bestEquipment = roleEquip;
                        }
                    }
                }
                
                // 装备最好的装备
                if (bestEquipment != null) {
                    equipItem(roleId, bestEquipment.getId());
                }
            }
            
            result.put("success", true);
            result.put("message", "一键穿戴成功");
            result.put("stats", getRoleEquipmentStats(roleId));
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "一键穿戴失败：" + e.getMessage());
        }
        
        return result;
    }
    
    @Override
    @Transactional
    public Map<String, Object> autoEquipFromAssets(Long roleId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 首先卸下所有装备
            unequipAll(roleId);
            
            // 从 role_asset 表中获取所有装备类型的资产
            String assetSql = "SELECT ra.id, ra.asset_type_code, at.name, at.type FROM role_asset ra JOIN asset_types at ON ra.asset_type_code = at.code WHERE ra.role_id = ? AND at.type = 'EQUIPMENT'";
            List<Map<String, Object>> assets = jdbcTemplate.queryForList(assetSql, roleId);
            
            // 为每个装备创建装备记录并装备
            for (Map<String, Object> asset : assets) {
                Long assetId = ((Number) asset.get("id")).longValue();
                equipItemFromAsset(roleId, assetId);
            }
            
            result.put("success", true);
            result.put("message", "一键穿戴成功");
            result.put("stats", getRoleEquipmentStats(roleId));
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "一键穿戴失败：" + e.getMessage());
        }
        
        return result;
    }
    
    @Override
    @Transactional
    public Map<String, Object> unequipAll(Long roleId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<RoleEquipment> equippedItems = roleEquipmentRepository.findByRoleIdAndStatus(roleId, 1);
            
            for (RoleEquipment roleEquip : equippedItems) {
                roleEquip.setSlot(null);
                roleEquip.setStatus(0);
                roleEquipmentRepository.save(roleEquip);
            }
            
            recalculateRoleStats(roleId);
            
            result.put("success", true);
            result.put("message", "卸下全部装备成功");
            result.put("stats", getRoleEquipmentStats(roleId));
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "卸下全部装备失败：" + e.getMessage());
        }
        
        return result;
    }
}
