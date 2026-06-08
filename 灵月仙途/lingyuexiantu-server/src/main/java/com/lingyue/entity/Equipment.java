package com.lingyue.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "equipment")
public class Equipment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "type")
    private Integer type;
    
    @Column(name = "level")
    private Integer level;
    
    @Column(name = "attack")
    private Integer attack;
    
    @Column(name = "defense")
    private Integer defense;
    
    @Column(name = "hp_bonus")
    private Integer hpBonus;
    
    @Column(name = "mp_bonus")
    private Integer mpBonus;
    
    @Column(name = "rarity")
    private Integer rarity;
    
    @Column(name = "status")
    private Integer status;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getType() {
        return type;
    }

    public void setType(Integer type) {
        this.type = type;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Integer getAttack() {
        return attack;
    }

    public void setAttack(Integer attack) {
        this.attack = attack;
    }

    public Integer getDefense() {
        return defense;
    }

    public void setDefense(Integer defense) {
        this.defense = defense;
    }

    public Integer getHpBonus() {
        return hpBonus;
    }

    public void setHpBonus(Integer hpBonus) {
        this.hpBonus = hpBonus;
    }

    public Integer getMpBonus() {
        return mpBonus;
    }

    public void setMpBonus(Integer mpBonus) {
        this.mpBonus = mpBonus;
    }

    public Integer getRarity() {
        return rarity;
    }

    public void setRarity(Integer rarity) {
        this.rarity = rarity;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}