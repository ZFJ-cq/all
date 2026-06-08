package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset_types")
public class AssetType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", unique = true)
    private String code;

    @Column(name = "name")
    private String name;

    @Column(name = "type")
    private String type;

    @Column(name = "category")
    private String category;

    @Column(name = "description")
    private String description;

    @Column(name = "unit_of_measure")
    private String unitOfMeasure;

    @Column(name = "decimal_places")
    private Integer decimalPlaces;

    @Column(name = "status")
    private String status;

    @Column(name = "icon")
    private String icon;

    @Column(name = "icon_path")
    private String iconPath;

    @Column(name = "decimal_precision")
    private Integer decimalPrecision;

    @Column(name = "tradable")
    private Boolean tradable;

    @Column(name = "droppable")
    private Boolean droppable;

    @Column(name = "max_stack")
    private Integer maxStack;

    @Column(name = "destroy_policy")
    private String destroyPolicy;

    @Column(name = "modules")
    private String modules;

    @Column(name = "is_system")
    private Boolean isSystem;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (unitOfMeasure == null) unitOfMeasure = "个";
        if (decimalPlaces == null) decimalPlaces = 0;
        if (decimalPrecision == null) decimalPrecision = 0;
        if (tradable == null) tradable = true;
        if (droppable == null) droppable = true;
        if (maxStack == null) maxStack = 99;
        if (destroyPolicy == null) destroyPolicy = "none";
        if (isSystem == null) isSystem = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }
    
    public Integer getDecimalPlaces() { return decimalPlaces; }
    public void setDecimalPlaces(Integer decimalPlaces) { this.decimalPlaces = decimalPlaces; }
    
    public Integer getDecimalPrecision() { return decimalPrecision; }
    public void setDecimalPrecision(Integer decimalPrecision) { this.decimalPrecision = decimalPrecision; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    
    public String getIconPath() { return iconPath; }
    public void setIconPath(String iconPath) { this.iconPath = iconPath; }
    
    public Boolean getTradable() { return tradable; }
    public void setTradable(Boolean tradable) { this.tradable = tradable; }
    
    public Boolean getDroppable() { return droppable; }
    public void setDroppable(Boolean droppable) { this.droppable = droppable; }
    
    public Integer getMaxStack() { return maxStack; }
    public void setMaxStack(Integer maxStack) { this.maxStack = maxStack; }
    
    public String getDestroyPolicy() { return destroyPolicy; }
    public void setDestroyPolicy(String destroyPolicy) { this.destroyPolicy = destroyPolicy; }
    
    public String getModules() { return modules; }
    public void setModules(String modules) { this.modules = modules; }
    
    public Boolean getIsSystem() { return isSystem; }
    public void setIsSystem(Boolean isSystem) { this.isSystem = isSystem; }
    
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
