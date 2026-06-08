package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "map_node")
public class MapNode {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String mapCode; // 地图编码
    
    @Column(nullable = false)
    private String mapName; // 地图名称
    
    @Column(nullable = false)
    private Integer mapType; // 地图类型：1-主城，2-野外，3-副本，4-秘境，5-宗门
    
    @Column(nullable = false)
    private Integer layerLevel; // 层级等级（1-9 层）
    
    @Column(nullable = false)
    private Integer recommendLevel; // 推荐等级
    
    @Column(nullable = false)
    private Integer recommendCombat; // 推荐战力
    
    @Column(length = 1000)
    private String environmentDesc; // 环境描述
    
    @Column(length = 500)
    private String monsterDensity; // 怪物分布密度：低、中、高、极高
    
    @Column(length = 500)
    private String dropWeight; // 掉落权重：普通、优秀、稀有、史诗、传说
    
    @Column(length = 500)
    private String backgroundResource; // 背景资源路径
    
    @Column(length = 500)
    private String mainProducts; // 主要产出描述
    
    @Column(nullable = false)
    private Integer status; // 状态：0-关闭，1-开启，2-维护
    
    @Column(length = 500)
    private String weatherType; // 天气类型（扩展字段）
    
    @Column(length = 500)
    private String specialEvent; // 特殊事件标识（扩展字段）
    
    @Column(length = 500)
    private String extensionField1; // 扩展字段 1
    
    @Column(length = 500)
    private String extensionField2; // 扩展字段 2
    
    @Column(nullable = false)
    private Integer onlineCount; // 当前在线人数
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (this.onlineCount == null) {
            this.onlineCount = 0;
        }
        if (this.status == null) {
            this.status = 1;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getMapCode() {
        return mapCode;
    }
    
    public void setMapCode(String mapCode) {
        this.mapCode = mapCode;
    }
    
    public String getMapName() {
        return mapName;
    }
    
    public void setMapName(String mapName) {
        this.mapName = mapName;
    }
    
    public Integer getMapType() {
        return mapType;
    }
    
    public void setMapType(Integer mapType) {
        this.mapType = mapType;
    }
    
    public Integer getLayerLevel() {
        return layerLevel;
    }
    
    public void setLayerLevel(Integer layerLevel) {
        this.layerLevel = layerLevel;
    }
    
    public Integer getRecommendLevel() {
        return recommendLevel;
    }
    
    public void setRecommendLevel(Integer recommendLevel) {
        this.recommendLevel = recommendLevel;
    }
    
    public Integer getRecommendCombat() {
        return recommendCombat;
    }
    
    public void setRecommendCombat(Integer recommendCombat) {
        this.recommendCombat = recommendCombat;
    }
    
    public String getEnvironmentDesc() {
        return environmentDesc;
    }
    
    public void setEnvironmentDesc(String environmentDesc) {
        this.environmentDesc = environmentDesc;
    }
    
    public String getMonsterDensity() {
        return monsterDensity;
    }
    
    public void setMonsterDensity(String monsterDensity) {
        this.monsterDensity = monsterDensity;
    }
    
    public String getDropWeight() {
        return dropWeight;
    }
    
    public void setDropWeight(String dropWeight) {
        this.dropWeight = dropWeight;
    }
    
    public String getBackgroundResource() {
        return backgroundResource;
    }
    
    public void setBackgroundResource(String backgroundResource) {
        this.backgroundResource = backgroundResource;
    }
    
    public String getMainProducts() {
        return mainProducts;
    }
    
    public void setMainProducts(String mainProducts) {
        this.mainProducts = mainProducts;
    }
    
    public Integer getStatus() {
        return status;
    }
    
    public void setStatus(Integer status) {
        this.status = status;
    }
    
    public String getWeatherType() {
        return weatherType;
    }
    
    public void setWeatherType(String weatherType) {
        this.weatherType = weatherType;
    }
    
    public String getSpecialEvent() {
        return specialEvent;
    }
    
    public void setSpecialEvent(String specialEvent) {
        this.specialEvent = specialEvent;
    }
    
    public String getExtensionField1() {
        return extensionField1;
    }
    
    public void setExtensionField1(String extensionField1) {
        this.extensionField1 = extensionField1;
    }
    
    public String getExtensionField2() {
        return extensionField2;
    }
    
    public void setExtensionField2(String extensionField2) {
        this.extensionField2 = extensionField2;
    }
    
    public Integer getOnlineCount() {
        return onlineCount;
    }
    
    public void setOnlineCount(Integer onlineCount) {
        this.onlineCount = onlineCount;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
