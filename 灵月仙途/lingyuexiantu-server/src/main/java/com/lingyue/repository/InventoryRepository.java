package com.lingyue.repository;

import com.lingyue.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    
    List<Inventory> findByRoleId(Long roleId);
    
    List<Inventory> findByRoleIdAndItemType(Long roleId, String itemType);
    
    Inventory findByRoleIdAndItemId(Long roleId, Long itemId);
    
    void deleteByRoleIdAndItemId(Long roleId, Long itemId);
}
