package com.lingyue.dto;

import java.util.List;

public class WorldLocationDTO {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String bgColor;
    private Integer sortOrder;
    private String category;
    private Integer requiredLevel;
    private String requiredRealm;
    private String pageUrl;
    private List<FeatureDTO> features;
    private Boolean canEnter;

    public static class FeatureDTO {
        private Long id;
        private String featureName;
        private String featureDesc;
        private String featureIcon;
        private String featureType;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getFeatureName() { return featureName; }
        public void setFeatureName(String featureName) { this.featureName = featureName; }

        public String getFeatureDesc() { return featureDesc; }
        public void setFeatureDesc(String featureDesc) { this.featureDesc = featureDesc; }

        public String getFeatureIcon() { return featureIcon; }
        public void setFeatureIcon(String featureIcon) { this.featureIcon = featureIcon; }

        public String getFeatureType() { return featureType; }
        public void setFeatureType(String featureType) { this.featureType = featureType; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getBgColor() { return bgColor; }
    public void setBgColor(String bgColor) { this.bgColor = bgColor; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(Integer requiredLevel) { this.requiredLevel = requiredLevel; }

    public String getRequiredRealm() { return requiredRealm; }
    public void setRequiredRealm(String requiredRealm) { this.requiredRealm = requiredRealm; }

    public String getPageUrl() { return pageUrl; }
    public void setPageUrl(String pageUrl) { this.pageUrl = pageUrl; }

    public List<FeatureDTO> getFeatures() { return features; }
    public void setFeatures(List<FeatureDTO> features) { this.features = features; }

    public Boolean getCanEnter() { return canEnter; }
    public void setCanEnter(Boolean canEnter) { this.canEnter = canEnter; }
}
