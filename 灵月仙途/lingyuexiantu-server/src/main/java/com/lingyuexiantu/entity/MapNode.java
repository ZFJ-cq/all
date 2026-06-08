package com.lingyuexiantu.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "map_node")
public class MapNode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type;
    private String description;
    private Integer requiredLevel;
    private Integer cost;
    private String status;

    public MapNode() {
    }

    public MapNode(Long id, String name, String type, String description, Integer requiredLevel, Integer cost, String status) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
        this.requiredLevel = requiredLevel;
        this.cost = cost;
        this.status = status;
    }

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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getRequiredLevel() {
        return requiredLevel;
    }

    public void setRequiredLevel(Integer requiredLevel) {
        this.requiredLevel = requiredLevel;
    }

    public Integer getCost() {
        return cost;
    }

    public void setCost(Integer cost) {
        this.cost = cost;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
