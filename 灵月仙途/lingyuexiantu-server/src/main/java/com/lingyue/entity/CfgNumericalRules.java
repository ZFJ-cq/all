package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_cfg_numerical_rules")
public class CfgNumericalRules {
    
    @Id
    @Column(name = "config_key", nullable = false, length = 64)
    private String configKey;
    
    @Column(name = "config_version", nullable = false, columnDefinition = "INT DEFAULT 1")
    private Integer configVersion;
    
    @Column(name = "content", nullable = false, columnDefinition = "JSON")
    private String content;
    
    @Column(name = "description", length = 255)
    private String description;
    
    @Column(name = "updated_by", length = 32)
    private String updatedBy;
    
    @Column(name = "updated_at", columnDefinition = "DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)")
    private LocalDateTime updatedAt;
    
    public CfgNumericalRules() {
    }
    
    public CfgNumericalRules(String configKey, Integer configVersion, String content, String description, String updatedBy) {
        this.configKey = configKey;
        this.configVersion = configVersion;
        this.content = content;
        this.description = description;
        this.updatedBy = updatedBy;
    }
    
    // Getters and Setters
    public String getConfigKey() { return configKey; }
    public void setConfigKey(String configKey) { this.configKey = configKey; }
    public Integer getConfigVersion() { return configVersion; }
    public void setConfigVersion(Integer configVersion) { this.configVersion = configVersion; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}