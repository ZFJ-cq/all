package com.lingyuexiantu.service;

import com.lingyuexiantu.entity.MapNode;
import java.util.List;

public interface MapNodeService {
    List<MapNode> getMapNodesByRoleId(Long roleId);
    MapNode getById(Long id);
    List<MapNode> list();
    boolean isMapNodeUnlocked(Long roleId, Long mapNodeId);
}
