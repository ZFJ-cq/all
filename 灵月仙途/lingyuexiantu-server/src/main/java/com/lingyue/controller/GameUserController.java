package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.GameUser;
import com.lingyue.service.GameUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/game/user")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class GameUserController {
    
    private final GameUserService gameUserService;
    
    public GameUserController(GameUserService gameUserService) {
        this.gameUserService = gameUserService;
    }
    
    // 获取所有游戏用户
    @GetMapping
    public ResponseEntity<List<GameUser>> getAllUsers() {
        List<GameUser> users = gameUserService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
    
    // 根据ID获取用户
    @GetMapping("/{id}")
    public ResponseEntity<GameUser> getUserById(@PathVariable Long id) {
        GameUser user = gameUserService.getUserById(id);
        if (user != null) {
            return new ResponseEntity<>(user, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // 创建用户
    @PostMapping
    public ResponseEntity<GameUser> createUser(@RequestBody GameUser user) {
        GameUser createdUser = gameUserService.createUser(user);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }
    
    // 更新用户
    @PutMapping("/{id}")
    public ResponseEntity<GameUser> updateUser(@PathVariable Long id, @RequestBody GameUser user) {
        user.setId(id);
        GameUser updatedUser = gameUserService.updateUser(user);
        if (updatedUser != null) {
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // 删除用户（实际是禁用用户）
    @DeleteMapping("/{id}")
    public ResponseEntity<GameUser> deleteUser(@PathVariable Long id) {
        GameUser user = gameUserService.disableUser(id);
        if (user != null) {
            return new ResponseEntity<>(user, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // 启用用户
    @PutMapping("/{id}/enable")
    public ResponseEntity<GameUser> enableUser(@PathVariable Long id) {
        GameUser user = gameUserService.enableUser(id);
        if (user != null) {
            return new ResponseEntity<>(user, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
