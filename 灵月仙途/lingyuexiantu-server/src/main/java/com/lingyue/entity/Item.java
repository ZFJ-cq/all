package com.lingyue.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "item")
public class Item {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "type")
    private Integer type;
    
    @Column(name = "use_effect")
    private String useEffect;
    
    @Column(name = "stackable")
    private Integer stackable;
    
    @Column(name = "max_stack")
    private Integer maxStack;
    
    @Column(name = "price")
    private Integer price;
    
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

    public String getUseEffect() {
        return useEffect;
    }

    public void setUseEffect(String useEffect) {
        this.useEffect = useEffect;
    }

    public Integer getStackable() {
        return stackable;
    }

    public void setStackable(Integer stackable) {
        this.stackable = stackable;
    }

    public Integer getMaxStack() {
        return maxStack;
    }

    public void setMaxStack(Integer maxStack) {
        this.maxStack = maxStack;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}