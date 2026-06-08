package com.lingyue.repository;

import com.lingyue.entity.RoleRealmBreakthrough;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 角色境界突破记录 Repository
 */
@Repository
public interface RoleRealmBreakthroughRepository extends JpaRepository<RoleRealmBreakthrough, Long> {

    // 根据角色 ID 查询突破记录
    List<RoleRealmBreakthrough> findByRoleIdOrderByBreakthroughTimeDesc(Long roleId);

    // 根据成功状态查询
    List<RoleRealmBreakthrough> findBySuccessOrderByBreakthroughTimeDesc(Integer success);

    // 搜索突破记录
    @Query("SELECT r FROM RoleRealmBreakthrough r WHERE r.roleName LIKE %:keyword% OR r.oldRealm LIKE %:keyword% OR r.newRealm LIKE %:keyword%")
    List<RoleRealmBreakthrough> searchBreakthroughRecords(@Param("keyword") String keyword);
}
