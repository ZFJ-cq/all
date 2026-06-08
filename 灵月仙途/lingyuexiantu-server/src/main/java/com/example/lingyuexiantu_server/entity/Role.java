package com.example.lingyuexiantu_server.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "role")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 100)
    private String description;

    @Column(nullable = false)
    private Integer level = 1;

    @Column(nullable = false)
    private Integer experience = 0;

    @Column(nullable = false)
    private Integer health = 100;

    @Column(nullable = false)
    private Integer healthMax = 100;

    @Column(nullable = false)
    private Integer mana = 80;

    @Column(nullable = false)
    private Integer manaMax = 80;

    @Column(nullable = false)
    private Integer spiritStones = 0;

    @Column(nullable = false, length = 20)
    private String realm = "炼体";

    @Column(nullable = false, length = 10)
    private String realmStage = "初期";

    @Column(nullable = false)
    private Long userId; // 关联用户ID

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public Integer getExperience() { return experience; }
    public void setExperience(Integer experience) { this.experience = experience; }

    public Integer getHealth() { return health; }
    public void setHealth(Integer health) { this.health = health; }

    public Integer getHealthMax() { return healthMax; }
    public void setHealthMax(Integer healthMax) { this.healthMax = healthMax; }

    public Integer getMana() { return mana; }
    public void setMana(Integer mana) { this.mana = mana; }

    public Integer getManaMax() { return manaMax; }
    public void setManaMax(Integer manaMax) { this.manaMax = manaMax; }

    public Integer getSpiritStones() { return spiritStones; }
    public void setSpiritStones(Integer spiritStones) { this.spiritStones = spiritStones; }

    public String getRealm() { return realm; }
    public void setRealm(String realm) { this.realm = realm; }

    public String getRealmStage() { return realmStage; }
    public void setRealmStage(String realmStage) { this.realmStage = realmStage; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}