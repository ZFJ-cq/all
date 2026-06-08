package com.lingyue.repository;

import com.lingyue.entity.SysMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 系统菜单 Repository
 */
@Repository
public interface SysMenuRepository extends JpaRepository<SysMenu, Long> {

    // 获取所有菜单（按排序）
    List<SysMenu> findAllByOrderBySortAsc();

    // 根据父 ID 查询菜单
    List<SysMenu> findByParentIdOrderBySortAsc(Long parentId);

    // 根据状态查询菜单
    List<SysMenu> findByStatusOrderBySortAsc(Integer status);

    // 搜索菜单
    @Query("SELECT m FROM SysMenu m WHERE m.menuName LIKE %:keyword% OR m.perm LIKE %:keyword%")
    List<SysMenu> searchMenus(@Param("keyword") String keyword);

    // 根据菜单类型查询
    List<SysMenu> findByMenuTypeOrderBySortAsc(Integer menuType);
}
