package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.SysMenu;
import com.lingyue.service.SysMenuService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 系统菜单管理 Controller
 */
@RestController
@RequestMapping("/sys/menu")
public class SysMenuController {

    private final SysMenuService menuService;

    public SysMenuController(SysMenuService menuService) {
        this.menuService = menuService;
    }

    // 获取所有菜单
    @GetMapping
    public ResponseEntity<List<SysMenu>> getAllMenus() {
        List<SysMenu> menus = menuService.getAllMenus();
        return new ResponseEntity<>(menus, HttpStatus.OK);
    }

    // 根据 ID 获取菜单
    @GetMapping("/{id}")
    public ResponseEntity<SysMenu> getMenuById(@PathVariable Long id) {
        SysMenu menu = menuService.getMenuById(id);
        if (menu != null) {
            return new ResponseEntity<>(menu, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // 搜索菜单
    @GetMapping("/search")
    public ResponseEntity<List<SysMenu>> searchMenus(@RequestParam String keyword) {
        List<SysMenu> menus = menuService.searchMenus(keyword);
        return new ResponseEntity<>(menus, HttpStatus.OK);
    }

    // 根据父 ID 获取菜单
    @GetMapping("/parent/{parentId}")
    public ResponseEntity<List<SysMenu>> getMenusByParentId(@PathVariable Long parentId) {
        List<SysMenu> menus = menuService.getMenusByParentId(parentId);
        return new ResponseEntity<>(menus, HttpStatus.OK);
    }

    // 创建菜单
    @PostMapping
    public ResponseEntity<SysMenu> createMenu(@RequestBody SysMenu menu) {
        SysMenu createdMenu = menuService.createMenu(menu);
        return new ResponseEntity<>(createdMenu, HttpStatus.CREATED);
    }

    // 更新菜单
    @PutMapping("/{id}")
    public ResponseEntity<SysMenu> updateMenu(@PathVariable Long id, @RequestBody SysMenu menu) {
        menu.setId(id);
        SysMenu updatedMenu = menuService.updateMenu(menu);
        if (updatedMenu != null) {
            return new ResponseEntity<>(updatedMenu, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // 删除菜单
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenu(@PathVariable Long id) {
        boolean deleted = menuService.deleteMenu(id);
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
