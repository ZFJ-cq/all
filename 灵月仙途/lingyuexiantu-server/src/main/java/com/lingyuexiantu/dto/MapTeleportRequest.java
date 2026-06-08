package com.lingyuexiantu.dto;

public class MapTeleportRequest {
    private Long roleId;
    private Long mapNodeId;

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    public Long getMapNodeId() {
        return mapNodeId;
    }

    public void setMapNodeId(Long mapNodeId) {
        this.mapNodeId = mapNodeId;
    }
}
