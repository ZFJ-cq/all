package com.lingyue.service.impl;

import com.lingyue.entity.*;
import com.lingyue.repository.*;
import com.lingyue.service.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class RewardServiceImpl implements RewardService {
    
    private final InventoryService inventoryService;
    private final RoleResourceService roleResourceService;
    private final ResourceTypeService resourceTypeService;
    private final MailRepository mailRepository;
    private final MailItemRepository mailItemRepository;
    private final RoleAssetService roleAssetService;
    private final AssetTypeService assetTypeService;
    
    public RewardServiceImpl(InventoryService inventoryService,
                            RoleResourceService roleResourceService,
                            ResourceTypeService resourceTypeService,
                            MailRepository mailRepository,
                            MailItemRepository mailItemRepository,
                            RoleAssetService roleAssetService,
                            AssetTypeService assetTypeService) {
        this.inventoryService = inventoryService;
        this.roleResourceService = roleResourceService;
        this.resourceTypeService = resourceTypeService;
        this.mailRepository = mailRepository;
        this.mailItemRepository = mailItemRepository;
        this.roleAssetService = roleAssetService;
        this.assetTypeService = assetTypeService;
    }
    
    @Override
    @Transactional
    public Map<String, Object> distributeRewards(Long roleId, Long userId, String title, String content,
                                                 List<Map<String, Object>> items,
                                                 Map<String, Integer> resources) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> itemsToMail = new ArrayList<>();
        List<Map<String, Object>> itemsToInventory = new ArrayList<>();
        
        if (items != null && !items.isEmpty()) {
            for (Map<String, Object> item : items) {
                Long itemId = Long.parseLong(item.get("itemId").toString());
                int quantity = Integer.parseInt(item.get("quantity").toString());
                
                Map<String, Object> addResult = inventoryService.addItemToInventory(roleId, itemId, quantity);
                
                if (!(Boolean) addResult.get("success")) {
                    int remaining = (Integer) addResult.getOrDefault("remainingQuantity", quantity);
                    if (remaining > 0) {
                        Map<String, Object> failedItem = new HashMap<>();
                        failedItem.put("itemId", itemId);
                        failedItem.put("quantity", remaining);
                        itemsToMail.add(failedItem);
                    }
                    int added = (Integer) addResult.getOrDefault("addedQuantity", 0);
                    if (added > 0) {
                        Map<String, Object> addedItem = new HashMap<>();
                        addedItem.put("itemId", itemId);
                        addedItem.put("quantity", added);
                        itemsToInventory.add(addedItem);
                    }
                } else {
                    itemsToInventory.add(item);
                }
            }
        }
        
        if (resources != null && !resources.isEmpty()) {
            for (Map.Entry<String, Integer> entry : resources.entrySet()) {
                String resourceCode = entry.getKey();
                int quantity = entry.getValue();
                Long assetTypeId = getAssetTypeIdByCode(resourceCode);
                if (assetTypeId != null) {
                    roleAssetService.updateRoleAsset(roleId, assetTypeId, (long)quantity);
                }
            }
        }
        
        boolean sentToMail = false;
        if (!itemsToMail.isEmpty()) {
            sendMailWithItems(userId, title, content, itemsToMail);
            sentToMail = true;
        }
        
        result.put("success", true);
        result.put("itemsToInventory", itemsToInventory);
        result.put("itemsToMail", itemsToMail);
        result.put("sentToMail", sentToMail);
        result.put("message", sentToMail ? 
            "部分奖励已存入背包，剩余奖励已发送至邮件" : 
            "所有奖励已存入背包");
        
        return result;
    }
    
    @Override
    @Transactional
    public Map<String, Object> sendMailWithItems(Long userId, String title, String content,
                                                 List<Map<String, Object>> items) {
        Map<String, Object> result = new HashMap<>();
        
        Mail mail = new Mail();
        mail.setUserId(userId);
        mail.setTitle(title);
        mail.setContent(content);
        mail.setType(1);
        mail.setHasAttachment(items != null && !items.isEmpty() ? 1 : 0);
        mail.setIsRead(0);
        mail.setSendTime(new Date());
        
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, 30);
        mail.setExpireTime(calendar.getTime());
        
        Mail savedMail = mailRepository.save(mail);
        
        if (items != null && !items.isEmpty()) {
            for (Map<String, Object> item : items) {
                MailItem mailItem = new MailItem();
                mailItem.setMailId(savedMail.getId());
                mailItem.setItemId(Long.parseLong(item.get("itemId").toString()));
                mailItem.setQuantity(Integer.parseInt(item.get("quantity").toString()));
                mailItemRepository.save(mailItem);
            }
        }
        
        result.put("success", true);
        result.put("mailId", savedMail.getId());
        result.put("message", "邮件发送成功");
        
        return result;
    }
    
    @Override
    @Transactional
    public Map<String, Object> claimMailAttachment(Long mailId, Long roleId) {
        Map<String, Object> result = new HashMap<>();
        
        Optional<Mail> mailOpt = mailRepository.findById(mailId);
        if (mailOpt.isEmpty()) {
            result.put("success", false);
            result.put("message", "邮件不存在");
            return result;
        }
        
        Mail mail = mailOpt.get();
        List<MailItem> mailItems = mailItemRepository.findByMailId(mailId);
        
        if (mailItems.isEmpty()) {
            result.put("success", false);
            result.put("message", "邮件没有附件");
            return result;
        }
        
        List<Map<String, Object>> items = new ArrayList<>();
        for (MailItem mailItem : mailItems) {
            Map<String, Object> item = new HashMap<>();
            item.put("itemId", mailItem.getItemId());
            item.put("quantity", mailItem.getQuantity());
            items.add(item);
        }
        
        for (Map<String, Object> item : items) {
            Long itemId = (Long) item.get("itemId");
            int quantity = (Integer) item.get("quantity");
            
            if (!inventoryService.hasSpaceForItem(roleId, itemId, quantity)) {
                result.put("success", false);
                result.put("message", "背包空间不足，请先清理背包");
                return result;
            }
        }
        
        Map<String, Object> addResult = inventoryService.addItemsToInventory(roleId, items);
        
        if (!(Boolean) addResult.get("success")) {
            result.put("success", false);
            result.put("message", "领取失败，背包空间不足");
            return result;
        }
        
        mailItemRepository.deleteAll(mailItems);
        mail.setHasAttachment(0);
        mailRepository.save(mail);
        
        result.put("success", true);
        result.put("message", "附件领取成功");
        result.put("items", items);
        
        return result;
    }
    
    private Long getResourceTypeIdByCode(String code) {
        ResourceType resourceType = resourceTypeService.getResourceTypeByCode(code);
        return resourceType != null ? resourceType.getId() : null;
    }
    
    private Long getAssetTypeIdByCode(String code) {
        // 将资源代码转换为资产类型代码
        String assetTypeCode = convertResourceCodeToAssetCode(code);
        AssetType assetType = assetTypeService.getAssetTypeByCode(assetTypeCode);
        return assetType != null ? assetType.getId() : null;
    }
    
    private String convertResourceCodeToAssetCode(String resourceCode) {
        // 资源代码到资产代码的映射
        switch (resourceCode.toLowerCase()) {
            case "lingshi":
                return "LINGSHI";
            case "xiuwei":
                return "XIUWEI";
            case "hunshi":
                return "HUNSHI";
            case "shouming":
                return "SHOUMING";
            case "xianshi":
                return "XIANSHI";
            default:
                return resourceCode.toUpperCase();
        }
    }
}
