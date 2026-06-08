package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyuexiantu.common.Result;
import com.lingyue.entity.GameRole;
import com.lingyue.entity.RoleResource;
import com.lingyue.entity.RoleAsset;
import com.lingyue.entity.ResourceType;
import com.lingyue.service.GameRoleService;
import com.lingyue.service.RoleResourceService;
import com.lingyue.service.RoleAssetService;
import com.lingyue.service.ResourceTypeService;
import com.lingyue.service.AssetTypeService;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class UserProfileController {

    private final GameRoleService gameRoleService;
    private final RoleResourceService roleResourceService;
    private final RoleAssetService roleAssetService;
    private final ResourceTypeService resourceTypeService;
    private final AssetTypeService assetTypeService;

    public UserProfileController(
            GameRoleService gameRoleService,
            RoleResourceService roleResourceService,
            RoleAssetService roleAssetService,
            ResourceTypeService resourceTypeService,
            AssetTypeService assetTypeService) {
        this.gameRoleService = gameRoleService;
        this.roleResourceService = roleResourceService;
        this.roleAssetService = roleAssetService;
        this.resourceTypeService = resourceTypeService;
        this.assetTypeService = assetTypeService;
    }

    @GetMapping("/user/profile")
    public Result<Map<String, Object>> getUserProfile(@RequestParam Long roleId) {
        try {
            Map<String, Object> profile = new HashMap<>();

            GameRole role = gameRoleService.getRoleById(roleId);
            if (role == null) {
                return Result.error("角色不存在");
            }

            profile.put("role", convertRoleToDTO(role));
            profile.put("resources", getRoleResources(roleId));
            profile.put("assets", getRoleAssets(roleId));
            profile.put("status", getStatusInfo(role));

            return Result.success(profile);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取用户资料失败: " + e.getMessage());
        }
    }

    @GetMapping("/resources")
    public Result<List<Map<String, Object>>> getResources(@RequestParam Long roleId) {
        try {
            return Result.success(getRoleResources(roleId));
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取资源失败: " + e.getMessage());
        }
    }

    private Map<String, Object> convertRoleToDTO(GameRole role) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", role.getId());
        dto.put("name", role.getRoleName());
        dto.put("realm", role.getRealm() != null ? role.getRealm() : "凡人");
        dto.put("spiritRoot", role.getSpiritRoot());
        dto.put("avatar", getAvatarBySpiritRoot(role.getSpiritRoot()));
        dto.put("level", role.getLevel() != null ? role.getLevel() : 1);
        return dto;
    }

    private List<Map<String, Object>> getRoleResources(Long roleId) {
        List<RoleResource> resources = roleResourceService.getRoleResources(roleId);
        List<ResourceType> resourceTypes = resourceTypeService.getAllResourceTypes();

        Map<Long, ResourceType> typeMap = resourceTypes.stream()
                .collect(Collectors.toMap(ResourceType::getId, rt -> rt));

        Map<String, Map<String, Object>> defaultResources = getDefaultResourcesMap();

        resources.forEach(res -> {
            ResourceType type = typeMap.get(res.getResourceTypeId());
            if (type != null && defaultResources.containsKey(type.getCode())) {
                Map<String, Object> resMap = defaultResources.get(type.getCode());
                resMap.put("value", res.getQuantity() != null ? res.getQuantity() : 0);
            }
        });

        return new ArrayList<>(defaultResources.values());
    }

    private Map<String, Map<String, Object>> getDefaultResourcesMap() {
        Map<String, Map<String, Object>> map = new LinkedHashMap<>();
        map.put("xianli", createResourceMap("仙力", "⚡", 0));
        map.put("xianshi", createResourceMap("仙石", "💎", 0));
        map.put("lingshi", createResourceMap("灵石", "💰", 0));
        map.put("xiuwei", createResourceMap("修为", "✨", 0));
        map.put("hunshi", createResourceMap("魂石", "🪨", 0));
        map.put("lingqi", createResourceMap("灵气", "🌬️", 0));
        return map;
    }

    private Map<String, Object> createResourceMap(String name, String icon, int value) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", name);
        map.put("icon", icon);
        map.put("value", value);
        return map;
    }

    private List<Map<String, Object>> getRoleAssets(Long roleId) {
        List<RoleAsset> assets = roleAssetService.getRoleAssets(roleId);
        return assets.stream().map(asset -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", asset.getId());
            
            // 根据AssetTypeCode查找AssetType
            com.lingyue.entity.AssetType assetType = null;
            if (asset.getAssetTypeCode() != null) {
                assetType = assetTypeService.getAssetTypeByCode(asset.getAssetTypeCode());
            }
            
            dto.put("name", assetType != null ? assetType.getName() : "未知");
            dto.put("type", assetType != null ? assetType.getType() : "其他");
            dto.put("quantity", asset.getQuantity() != null ? asset.getQuantity() : 0);
            dto.put("description", assetType != null ? assetType.getDescription() : "");
            return dto;
        }).collect(Collectors.toList());
    }

    private Map<String, Object> getStatusInfo(GameRole role) {
        Map<String, Object> status = new HashMap<>();
        status.put("onlineTime", 0);
        status.put("checkinStatus", false);
        status.put("taskProgress", 0);
        status.put("taskTotal", 10);
        status.put("achievementPoints", 0);
        return status;
    }

    private String getAvatarBySpiritRoot(String root) {
        if (root == null) return "👤";
        Map<String, String> map = new HashMap<>();
        map.put("fire", "🔥");
        map.put("water", "💧");
        map.put("wood", "🌿");
        map.put("metal", "⚔️");
        map.put("earth", "⛰️");
        map.put("five", "🌈");
        map.put("lightning", "⚡");
        return map.getOrDefault(root, "👤");
    }
}
