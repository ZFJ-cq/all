package com.lingyue.repository;

import com.lingyue.entity.RoleEquipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RoleEquipmentRepository extends JpaRepository<RoleEquipment, Long> {
    List<RoleEquipment> findByRoleId(Long roleId);
    List<RoleEquipment> findByRoleIdAndStatus(Long roleId, Integer status);
    Optional<RoleEquipment> findByRoleIdAndSlotAndStatus(Long roleId, Integer slot, Integer status);
    void deleteByRoleIdAndEquipmentId(Long roleId, Long equipmentId);
}