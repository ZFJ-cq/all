package com.lingyue.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.lingyue.dto.WorldLocationDTO;
import com.lingyue.entity.GameRole;
import com.lingyue.entity.WorldLocation;
import com.lingyue.entity.WorldLocationFeature;
import com.lingyue.service.GameRoleService;
import com.lingyue.service.RoleLocationLogService;
import com.lingyue.service.WorldLocationService;
import com.lingyuexiantu.common.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "World Location", description = "世界地点管理接口")
@RestController
@RequestMapping("/world")
public class WorldLocationController {

    private static final Logger logger = LoggerFactory.getLogger(WorldLocationController.class);

    private final WorldLocationService locationService;
    private final GameRoleService roleService;
    private final RoleLocationLogService logService;

    public WorldLocationController(WorldLocationService locationService,
                                    GameRoleService roleService,
                                    RoleLocationLogService logService) {
        this.locationService = locationService;
        this.roleService = roleService;
        this.logService = logService;
    }

    @Operation(summary = "获取所有活跃地点")
    @GetMapping("/locations")
    public Result<List<WorldLocationDTO>> getAllLocations(
            @RequestParam(required = false) Long roleId) {
        try {
            List<WorldLocation> locations = locationService.getAllActiveLocations();
            List<WorldLocationDTO> dtos = locations.stream()
                    .map(loc -> convertToDTO(loc, roleId))
                    .collect(Collectors.toList());
            return Result.success(dtos);
        } catch (Exception e) {
            logger.error("获取世界地点失败", e);
            return Result.error("获取世界地点失败: " + e.getMessage());
        }
    }

    @Operation(summary = "获取地点详情")
    @GetMapping("/location/{id}")
    public Result<WorldLocationDTO> getLocationById(
            @PathVariable Long id,
            @RequestParam(required = false) Long roleId) {
        try {
            WorldLocation location = locationService.getLocationById(id);
            if (location == null) {
                return Result.error("地点不存在");
            }
            return Result.success(convertToDTO(location, roleId));
        } catch (Exception e) {
            logger.error("获取地点详情失败", e);
            return Result.error("获取地点详情失败: " + e.getMessage());
        }
    }

    @Operation(summary = "按分类获取地点")
    @GetMapping("/locations/category/{category}")
    public Result<List<WorldLocationDTO>> getLocationsByCategory(
            @PathVariable String category,
            @RequestParam(required = false) Long roleId) {
        try {
            List<WorldLocation> locations = locationService.getLocationsByCategory(category);
            List<WorldLocationDTO> dtos = locations.stream()
                    .map(loc -> convertToDTO(loc, roleId))
                    .collect(Collectors.toList());
            return Result.success(dtos);
        } catch (Exception e) {
            logger.error("按分类获取地点失败", e);
            return Result.error("按分类获取地点失败: " + e.getMessage());
        }
    }

    @Operation(summary = "访问地点")
    @PostMapping("/visit/{locationId}")
    public Result<WorldLocationDTO> visitLocation(
            @PathVariable Long locationId,
            @RequestParam Long roleId) {
        try {
            WorldLocation location = locationService.getLocationById(locationId);
            if (location == null) {
                return Result.error("地点不存在");
            }

            if (!checkAccess(location, roleId)) {
                return Result.error("条件不足，无法进入该地点");
            }

            logService.recordVisit(roleId, locationId);

            return Result.success(convertToDTO(location, roleId));
        } catch (Exception e) {
            logger.error("访问地点失败", e);
            return Result.error("访问地点失败: " + e.getMessage());
        }
    }

    @Operation(summary = "获取角色访问历史")
    @GetMapping("/history/{roleId}")
    public Result<?> getVisitHistory(@PathVariable Long roleId) {
        try {
            return Result.success(logService.getRoleVisitHistory(roleId));
        } catch (Exception e) {
            logger.error("获取访问历史失败", e);
            return Result.error("获取访问历史失败: " + e.getMessage());
        }
    }

    @Operation(summary = "创建地点（管理）")
    @PostMapping("/admin/location")
    public Result<WorldLocation> createLocation(@RequestBody WorldLocation location) {
        try {
            return Result.success(locationService.createLocation(location));
        } catch (Exception e) {
            logger.error("创建地点失败", e);
            return Result.error("创建地点失败: " + e.getMessage());
        }
    }

    @Operation(summary = "更新地点（管理）")
    @PutMapping("/admin/location/{id}")
    public Result<WorldLocation> updateLocation(
            @PathVariable Long id,
            @RequestBody WorldLocation location) {
        try {
            WorldLocation updated = locationService.updateLocation(id, location);
            if (updated == null) {
                return Result.error("地点不存在");
            }
            return Result.success(updated);
        } catch (Exception e) {
            logger.error("更新地点失败", e);
            return Result.error("更新地点失败: " + e.getMessage());
        }
    }

    @Operation(summary = "删除地点（管理）")
    @DeleteMapping("/admin/location/{id}")
    public Result<Void> deleteLocation(@PathVariable Long id) {
        try {
            locationService.deleteLocation(id);
            return Result.success(null);
        } catch (Exception e) {
            logger.error("删除地点失败", e);
            return Result.error("删除地点失败: " + e.getMessage());
        }
    }

    private WorldLocationDTO convertToDTO(WorldLocation location, Long roleId) {
        WorldLocationDTO dto = new WorldLocationDTO();
        dto.setId(location.getId());
        dto.setName(location.getName());
        dto.setDescription(location.getDescription());
        dto.setIcon(location.getIcon());
        dto.setBgColor(location.getBgColor());
        dto.setSortOrder(location.getSortOrder());
        dto.setCategory(location.getCategory());
        dto.setRequiredLevel(location.getRequiredLevel());
        dto.setRequiredRealm(location.getRequiredRealm());
        dto.setPageUrl(location.getPageUrl());

        List<WorldLocationFeature> features = locationService.getLocationFeatures(location.getId());
        List<WorldLocationDTO.FeatureDTO> featureDTOs = features.stream().map(f -> {
            WorldLocationDTO.FeatureDTO fDto = new WorldLocationDTO.FeatureDTO();
            fDto.setId(f.getId());
            fDto.setFeatureName(f.getFeatureName());
            fDto.setFeatureDesc(f.getFeatureDesc());
            fDto.setFeatureIcon(f.getFeatureIcon());
            fDto.setFeatureType(f.getFeatureType());
            return fDto;
        }).collect(Collectors.toList());
        dto.setFeatures(featureDTOs);

        dto.setCanEnter(checkAccess(location, roleId));

        return dto;
    }

    private boolean checkAccess(WorldLocation location, Long roleId) {
        if (roleId == null) return true;

        try {
            GameRole role = roleService.getRoleById(roleId);
            if (role == null) return false;

            if (location.getRequiredLevel() != null && location.getRequiredLevel() > 0) {
                if (role.getLevel() == null || role.getLevel() < location.getRequiredLevel()) {
                    return false;
                }
            }

            return true;
        } catch (Exception e) {
            return true;
        }
    }
}
