package com.lingyue.repository;

import com.lingyue.entity.RoleResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Date;
import java.util.List;

@Repository
public interface RoleResourceRepository extends JpaRepository<RoleResource, Long> {
    
    List<RoleResource> findByRoleId(Long roleId);
    
    RoleResource findByRoleIdAndResourceTypeId(Long roleId, Long resourceTypeId);
    
    void deleteByRoleId(Long roleId);
    
    /**
     * 使用悲观锁查询资源 (防并发)
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM RoleResource r WHERE r.roleId = :roleId AND r.resourceTypeId = :resourceTypeId")
    RoleResource findByRoleIdAndResourceTypeIdForUpdate(
        @Param("roleId") Long roleId,
        @Param("resourceTypeId") Long resourceTypeId
    );
    
    /**
     * 乐观锁更新：减少资源数量
     * 
     * @return 受影响的行数 (0 表示更新失败，version 不匹配或余额不足)
     */
    @Modifying
    @Query("UPDATE RoleResource r SET " +
           "r.quantity = r.quantity - :quantity, " +
           "r.version = r.version + 1, " +
           "r.updatedAt = :now " +
           "WHERE r.roleId = :roleId " +
           "AND r.resourceTypeId = :resourceTypeId " +
           "AND r.quantity >= :quantity " +
           "AND r.version = :version")
    int decrementQuantityWithVersion(
        @Param("roleId") Long roleId,
        @Param("resourceTypeId") Long resourceTypeId,
        @Param("quantity") Long quantity,
        @Param("version") Integer version,
        @Param("now") Date now
    );
    
    /**
     * 乐观锁更新：增加资源数量
     */
    @Modifying
    @Query("UPDATE RoleResource r SET " +
           "r.quantity = r.quantity + :quantity, " +
           "r.version = r.version + 1, " +
           "r.updatedAt = :now " +
           "WHERE r.roleId = :roleId " +
           "AND r.resourceTypeId = :resourceTypeId " +
           "AND r.version = :version")
    int incrementQuantityWithVersion(
        @Param("roleId") Long roleId,
        @Param("resourceTypeId") Long resourceTypeId,
        @Param("quantity") Long quantity,
        @Param("version") Integer version,
        @Param("now") Date now
    );
}