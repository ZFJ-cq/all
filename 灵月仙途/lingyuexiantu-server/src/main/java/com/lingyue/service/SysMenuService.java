package com.lingyue.service;

import com.lingyue.entity.SysMenu;
import com.lingyue.repository.SysMenuRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 系统菜单服务
 */
@Service
@Transactional
public class SysMenuService {

    private final SysMenuRepository menuRepository;

    public SysMenuService(SysMenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }

    // 获取所有菜单
    public List<SysMenu> getAllMenus() {
        return menuRepository.findAllByOrderBySortAsc();
    }

    // 根据 ID 获取菜单
    public SysMenu getMenuById(Long id) {
        Optional<SysMenu> optional = menuRepository.findById(id);
        return optional.orElse(null);
    }

    // 搜索菜单
    public List<SysMenu> searchMenus(String keyword) {
        return menuRepository.searchMenus(keyword);
    }

    // 根据父 ID 获取菜单
    public List<SysMenu> getMenusByParentId(Long parentId) {
        return menuRepository.findByParentIdOrderBySortAsc(parentId);
    }

    // 创建菜单
    public SysMenu createMenu(SysMenu menu) {
        menu.setCreateTime(LocalDateTime.now());
        menu.setUpdateTime(LocalDateTime.now());
        return menuRepository.save(menu);
    }

    // 更新菜单
    public SysMenu updateMenu(SysMenu menu) {
        Optional<SysMenu> optional = menuRepository.findById(menu.getId());
        if (optional.isPresent()) {
            SysMenu existingMenu = optional.get();
            existingMenu.setMenuName(menu.getMenuName());
            existingMenu.setParentId(menu.getParentId());
            existingMenu.setMenuType(menu.getMenuType());
            existingMenu.setPath(menu.getPath());
            existingMenu.setComponent(menu.getComponent());
            existingMenu.setPerm(menu.getPerm());
            existingMenu.setIcon(menu.getIcon());
            existingMenu.setSort(menu.getSort());
            existingMenu.setStatus(menu.getStatus());
            existingMenu.setUpdateTime(LocalDateTime.now());
            return menuRepository.save(existingMenu);
        }
        return null;
    }

    // 删除菜单
    public boolean deleteMenu(Long id) {
        if (menuRepository.existsById(id)) {
            menuRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // 根据状态获取菜单
    public List<SysMenu> getMenusByStatus(Integer status) {
        return menuRepository.findByStatusOrderBySortAsc(status);
    }
}
