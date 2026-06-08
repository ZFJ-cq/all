package com.lingyue.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 境界技能容量配置实体
 */
@Data
@Entity
@Table(name = "cfg_realm_skill_capacity")
public class CfgRealmSkillCapacity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "realm_name", nullable = false, length = 50)
    private String realmName;
    
    @Column(name = "realm_level", nullable = false)
    private Integer realmLevel;
    
    @Column(name = "max_skills", nullable = false)
    private Integer maxSkills;
    
    @Column(length = 200)
    private String description;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
