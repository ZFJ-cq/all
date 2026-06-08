package com.lingyue.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "role_equipment")
public class RoleEquipment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "role_id")
    private Long roleId;
    
    @Column(name = "equipment_id")
    private Long equipmentId;
    
    @Column(name = "slot")
    private Integer slot;
    
    @Column(name = "status")
    private Integer status;
    
    @Column(name = "equip_time")
    private Date equipTime;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public Integer getSlot() {
        return slot;
    }

    public void setSlot(Integer slot) {
        this.slot = slot;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Date getEquipTime() {
        return equipTime;
    }

    public void setEquipTime(Date equipTime) {
        this.equipTime = equipTime;
    }
}