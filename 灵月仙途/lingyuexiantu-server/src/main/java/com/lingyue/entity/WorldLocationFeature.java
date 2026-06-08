package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "world_location_feature", indexes = {
    @Index(name = "idx_location_id", columnList = "location_id")
})
public class WorldLocationFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "location_id", nullable = false)
    private Long locationId;

    @Column(name = "feature_name", nullable = false, length = 50)
    private String featureName;

    @Column(name = "feature_desc", length = 200)
    private String featureDesc;

    @Column(name = "feature_icon", length = 10)
    private String featureIcon;

    @Column(name = "feature_type", length = 50)
    private String featureType;

    @Column(name = "feature_data", columnDefinition = "JSON")
    private String featureData;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "is_active")
    private Integer isActive = 1;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }

    public String getFeatureName() { return featureName; }
    public void setFeatureName(String featureName) { this.featureName = featureName; }

    public String getFeatureDesc() { return featureDesc; }
    public void setFeatureDesc(String featureDesc) { this.featureDesc = featureDesc; }

    public String getFeatureIcon() { return featureIcon; }
    public void setFeatureIcon(String featureIcon) { this.featureIcon = featureIcon; }

    public String getFeatureType() { return featureType; }
    public void setFeatureType(String featureType) { this.featureType = featureType; }

    public String getFeatureData() { return featureData; }
    public void setFeatureData(String featureData) { this.featureData = featureData; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public Integer getIsActive() { return isActive; }
    public void setIsActive(Integer isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
