package com.lingyue.service.impl;

import com.lingyue.entity.GameRole;
import com.lingyue.entity.GameUser;
import com.lingyue.repository.GameRoleRepository;
import com.lingyue.repository.GameUserRepository;
import com.lingyue.service.GameUserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GameUserServiceImpl implements GameUserService {
    
    private final GameUserRepository gameUserRepository;
    private final GameRoleRepository gameRoleRepository;
    
    public GameUserServiceImpl(GameUserRepository gameUserRepository, GameRoleRepository gameRoleRepository) {
        this.gameUserRepository = gameUserRepository;
        this.gameRoleRepository = gameRoleRepository;
    }
    
    @Override
    public List<GameUser> getAllUsers() {
        return gameUserRepository.findAll();
    }
    
    @Override
    public GameUser getUserById(Long id) {
        return gameUserRepository.findById(id).orElse(null);
    }
    
    @Override
    public GameUser getUserByUsername(String username) {
        return gameUserRepository.findByUsername(username);
    }
    
    @Override
    public GameUser getUserByPhone(String phone) {
        return gameUserRepository.findByPhone(phone);
    }
    
    @Override
    public GameUser createUser(GameUser user) {
        return gameUserRepository.save(user);
    }
    
    @Override
    public GameUser updateUser(GameUser user) {
        return gameUserRepository.save(user);
    }
    
    @Override
    public GameUser disableUser(Long id) {
        GameUser user = gameUserRepository.findById(id).orElse(null);
        if (user != null) {
            // 禁用用户
            user.setStatus(0);
            gameUserRepository.save(user);
            
            // 禁用用户关联的所有角色
            List<GameRole> roles = gameRoleRepository.findByUserId(id);
            for (GameRole role : roles) {
                role.setStatus(0);
                gameRoleRepository.save(role);
            }
        }
        return user;
    }
    
    @Override
    public GameUser enableUser(Long id) {
        GameUser user = gameUserRepository.findById(id).orElse(null);
        if (user != null) {
            // 启用用户
            user.setStatus(1);
            gameUserRepository.save(user);
        }
        return user;
    }
    
    @Override
    public long getUserCount() {
        return gameUserRepository.count();
    }
}
