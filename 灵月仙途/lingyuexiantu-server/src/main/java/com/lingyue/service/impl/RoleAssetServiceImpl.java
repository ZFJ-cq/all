package com.lingyue.service.impl;

import com.lingyue.dto.AssetUpdateRequest;
import com.lingyue.dto.RoleAssetDTO;
import com.lingyue.entity.AssetType;
import com.lingyue.entity.GameRole;
import com.lingyue.entity.RoleAsset;
import com.lingyue.repository.AssetTypeRepository;
import com.lingyue.repository.GameRoleRepository;
import com.lingyue.repository.RoleAssetRepository;
import com.lingyue.service.RoleAssetService;

import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
@Transactional
public class RoleAssetServiceImpl implements RoleAssetService {
    
    private static final Logger logger = LoggerFactory.getLogger(RoleAssetServiceImpl.class);
    private static final int MAX_RETRY_COUNT = 3;

    private final RoleAssetRepository roleAssetRepository;
    private final AssetTypeRepository assetTypeRepository;
    private final GameRoleRepository gameRoleRepository;
    
    public RoleAssetServiceImpl(RoleAssetRepository roleAssetRepository, 
                                AssetTypeRepository assetTypeRepository,
                                GameRoleRepository gameRoleRepository) {
        this.roleAssetRepository = roleAssetRepository;
        this.assetTypeRepository = assetTypeRepository;
        this.gameRoleRepository = gameRoleRepository;
    }

    @Override
    public List<RoleAsset> getAllRoleAssets() {
        return roleAssetRepository.findAll();
    }

    @Override
    public List<RoleAsset> getRoleAssets(Long roleId) {
        return roleAssetRepository.findByRoleId(roleId);
    }

    public List<RoleAssetDTO> getAllRoleAssetsWithDetails() {
        List<RoleAsset> allAssets = roleAssetRepository.findAll();
        return allAssets.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<RoleAssetDTO> getRoleAssetsWithDetails(Long roleId) {
        List<RoleAsset> assets = roleAssetRepository.findByRoleId(roleId);
        return assets.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    private RoleAssetDTO convertToDTO(RoleAsset roleAsset) {
        GameRole role = gameRoleRepository.findById(roleAsset.getRoleId()).orElse(null);
        String roleName = role != null ? role.getRoleName() : "未知角色";
        String username = role != null && role.getUserId() != null ? 
            role.getUserId().toString() : "未知用户";
        
        // 查找资产类型
        AssetType assetType = null;
        if (roleAsset.getAssetTypeCode() != null) {
            assetType = assetTypeRepository.findByCode(roleAsset.getAssetTypeCode());
        }
        
        return new RoleAssetDTO(
            roleAsset.getId(),
            roleAsset.getRoleId(),
            roleName,
            username,
            assetType != null ? assetType.getId() : null,
            assetType != null ? assetType.getName() : "未知",
            roleAsset.getQuantity() != null ? BigDecimal.valueOf(roleAsset.getQuantity()) : BigDecimal.ZERO,
            roleAsset.getCreatedAt(),
            roleAsset.getUpdatedAt()
        );
    }

    @Override
    public RoleAsset getRoleAsset(Long roleId, Long assetTypeId) {
        // 查找资产类型
        AssetType assetType = assetTypeRepository.findById(assetTypeId).orElse(null);
        if (assetType == null) {
            return null;
        }
        return roleAssetRepository.findByRoleIdAndAssetTypeCode(roleId, assetType.getCode());
    }

    @Override
    @Retryable(
        value = {OptimisticLockingFailureException.class},
        maxAttempts = MAX_RETRY_COUNT,
        backoff = @Backoff(delay = 100, multiplier = 2)
    )
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public RoleAsset updateRoleAsset(Long roleId, Long assetTypeId, Long quantity) {
        logger.info("更新角色资产：roleId={}, assetTypeId={}, quantity={}", roleId, assetTypeId, quantity);
        
        if (roleId == null || roleId <= 0) {
            throw new IllegalArgumentException("角色 ID 无效");
        }
        if (assetTypeId == null || assetTypeId <= 0) {
            throw new IllegalArgumentException("资产类型 ID 无效");
        }
        if (quantity == null) {
            throw new IllegalArgumentException("数量不能为空");
        }
        
        // 查找资产类型
        AssetType assetType = assetTypeRepository.findById(assetTypeId)
            .orElseThrow(() -> new IllegalArgumentException("资产类型不存在"));
        
        // 查找角色资产
        RoleAsset roleAsset = roleAssetRepository.findByRoleIdAndAssetTypeCode(roleId, assetType.getCode());
        
        if (roleAsset == null) {
            if (quantity < 0) {
                throw new IllegalArgumentException("资产不存在，无法扣除");
            }
            
            roleAsset = new RoleAsset();
            roleAsset.setRoleId(roleId);
            roleAsset.setAssetTypeCode(assetType.getCode());
            roleAsset.setQuantity(Math.max(0L, quantity));
            logger.info("创建新资产：roleId={}, assetType={}, quantity={}", roleId, assetType.getName(), quantity);
            return roleAssetRepository.save(roleAsset);
        } else {
            Long oldQuantity = roleAsset.getQuantity() != null ? roleAsset.getQuantity() : 0L;
            Long newQuantity = oldQuantity + quantity;
            
            if (newQuantity < 0) {
                throw new IllegalArgumentException("资产不足，无法扣除");
            }
            
            roleAsset.setQuantity(newQuantity);
            logger.info("更新资产数量：roleId={}, assetType={}, oldQuantity={}, newQuantity={}", 
                roleId, assetType.getName(), oldQuantity, newQuantity);
            
            try {
                return roleAssetRepository.save(roleAsset);
            } catch (OptimisticLockingFailureException e) {
                logger.warn("乐观锁冲突，重试中：roleId={}, assetTypeId={}", roleId, assetTypeId);
                throw e;
            }
        }
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public List<RoleAsset> batchUpdateRoleAssets(Long roleId, List<AssetUpdateRequest> updates) {
        return updates.stream()
                .map(update -> updateRoleAsset(roleId, update.getAssetTypeId(), update.getQuantity().longValue()))
                .filter(asset -> asset != null)
                .toList();
    }

    @Override
    public List<RoleAsset> getRoleAssetsByType(Long roleId, String type) {
        // 查找该类型的所有资产类型
        List<AssetType> assetTypes = assetTypeRepository.findByType(type);
        if (assetTypes.isEmpty()) {
            return List.of();
        }
        
        // 获取所有资产类型代码
        List<String> assetTypeCodes = assetTypes.stream()
                .map(AssetType::getCode)
                .collect(Collectors.toList());
        
        // 查找角色的这些资产
        return roleAssetRepository.findByRoleIdAndAssetTypeCodeIn(roleId, assetTypeCodes);
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public void useItem(Long roleId, Long assetTypeId, int quantity) {
        logger.info("使用物品：roleId={}, assetTypeId={}, quantity={}", roleId, assetTypeId, quantity);
        
        if (quantity <= 0) {
            throw new IllegalArgumentException("使用数量必须大于 0");
        }
        
        // 查找资产类型
        AssetType assetType = assetTypeRepository.findById(assetTypeId).orElse(null);
        if (assetType == null) {
            throw new IllegalArgumentException("物品类型不存在");
        }
        
        // 查找角色资产
        RoleAsset roleAsset = roleAssetRepository.findByRoleIdAndAssetTypeCode(roleId, assetType.getCode());
        if (roleAsset == null || (roleAsset.getQuantity() != null && roleAsset.getQuantity() < quantity)) {
            logger.warn("使用物品失败：roleId={}, assetTypeId={}, quantity={}, 原因：物品不存在或数量不足", roleId, assetTypeId, quantity);
            throw new IllegalArgumentException("物品不存在或数量不足");
        }
        
        Long oldQuantity = roleAsset.getQuantity() != null ? roleAsset.getQuantity() : 0L;
        Long newQuantity = oldQuantity - quantity;
        
        if (newQuantity <= 0) {
            logger.info("物品数量为零，删除资产：roleId={}, assetType={}", roleId, assetType.getName());
            roleAssetRepository.delete(roleAsset);
        } else {
            roleAsset.setQuantity(newQuantity);
            logger.info("更新物品数量：roleId={}, assetType={}, oldQuantity={}, newQuantity={}", 
                roleId, assetType.getName(), oldQuantity, newQuantity);
            roleAssetRepository.save(roleAsset);
        }
    }

    @Override
    @Transactional
    public void equipItem(Long roleId, Long assetTypeId) {
        // 查找资产类型
        AssetType assetType = assetTypeRepository.findById(assetTypeId).orElse(null);
        if (assetType == null) {
            throw new IllegalArgumentException("物品类型不存在");
        }
        
        // 查找角色资产
        RoleAsset roleAsset = roleAssetRepository.findByRoleIdAndAssetTypeCode(roleId, assetType.getCode());
        if (roleAsset == null) {
            throw new IllegalArgumentException("物品不存在");
        }
    }

    @Override
    @Transactional
    public void unequipItem(Long roleId, Long assetTypeId) {
    }

    @Override
    @Transactional
    public void dropItem(Long roleId, Long assetTypeId, int quantity) {
        useItem(roleId, assetTypeId, quantity);
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public void updateAsset(Long roleId, String assetName, int quantity) {
        AssetType assetType = assetTypeRepository.findByName(assetName);
        if (assetType == null) {
            throw new IllegalArgumentException("资产类型不存在：" + assetName);
        }
        
        if (quantity < 0) {
            RoleAsset roleAsset = roleAssetRepository.findByRoleIdAndAssetTypeCode(roleId, assetType.getCode());
            if (roleAsset == null || (roleAsset.getQuantity() != null && roleAsset.getQuantity() < Math.abs(quantity))) {
                throw new IllegalArgumentException(assetName + "不足");
            }
        }
        updateRoleAsset(roleId, assetType.getId(), (long) quantity);
    }

    @Override
    @Transactional
    public void addAsset(Long roleId, Long assetTypeId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("增加数量必须大于 0");
        }
        updateRoleAsset(roleId, assetTypeId, (long) quantity);
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public void addAttributes(Long roleId, Map<String, Object> attributes) {
        logger.info("添加角色属性：roleId={}, attributes={}", roleId, attributes);
        
        if (attributes == null || attributes.isEmpty()) {
            return;
        }
        
        // 遍历所有属性并添加到角色资产中
        for (Map.Entry<String, Object> entry : attributes.entrySet()) {
            String attrName = entry.getKey();
            Object attrValue = entry.getValue();
            
            // 解析属性值
            long value = 0;
            if (attrValue instanceof Number) {
                value = ((Number) attrValue).longValue();
            } else if (attrValue instanceof String) {
                String strValue = (String) attrValue;
                if (strValue.contains("%")) {
                    // 百分比加成 (简化处理)
                    double percent = Double.parseDouble(strValue.replace("%", "")) / 100.0;
                    value = (long) (1000 * percent);
                } else {
                    value = Long.parseLong(strValue);
                }
            }
            
            if (value == 0) continue;
            
            // 查找对应的资产类型
            AssetType assetType = assetTypeRepository.findByName(attrName.toUpperCase());
            if (assetType == null) {
                logger.warn("资产类型不存在：{}", attrName);
                continue;
            }
            
            // 更新角色资产
            updateRoleAsset(roleId, assetType.getId(), value);
        }
        
        logger.info("角色属性添加完成：roleId={}, addedCount={}", roleId, attributes.size());
    }
}