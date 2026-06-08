package com.lingyue.util;

import com.lingyue.entity.GameRole;
import com.lingyue.entity.GameUser;
import com.lingyue.repository.GameRoleRepository;
import com.lingyue.repository.GameUserRepository;
import com.lingyue.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 统一认证工具类
 * 处理用户登录、角色认证、用户信息校验等
 */
@Component
public class AuthUtils {
    
    @Autowired
    private GameUserRepository gameUserRepository;
    
    @Autowired
    private GameRoleRepository gameRoleRepository;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * 用户登录
     * @param username 用户名或手机号
     * @param password 密码
     * @return 登录结果
     */
    public Map<String, Object> login(String username, String password) {
        Map<String, Object> result = new HashMap<>();
        
        // 1. 验证参数
        if (username == null || username.trim().isEmpty()) {
            result.put("success", false);
            result.put("code", 400);
            result.put("message", "用户名不能为空");
            return result;
        }
        
        if (password == null || password.trim().isEmpty()) {
            result.put("success", false);
            result.put("code", 400);
            result.put("message", "密码不能为空");
            return result;
        }
        
        try {
            // 2. 查找用户
            GameUser user = gameUserRepository.findByUsername(username);
            if (user == null) {
                // 尝试通过手机号查找
                user = gameUserRepository.findByPhone(username);
            }
            
            if (user == null) {
                result.put("success", false);
                result.put("code", 404);
                result.put("message", "用户不存在");
                return result;
            }
            
            // 3. 验证密码
            boolean passwordMatch = false;
            try {
                // 首先尝试BCrypt验证（加密密码）
                passwordMatch = passwordEncoder.matches(password, user.getPassword());
                
                // 如果BCrypt验证失败，尝试明文验证（兼容旧数据）
                if (!passwordMatch) {
                    passwordMatch = password.equals(user.getPassword());
                    
                    // 如果明文验证成功，自动更新为BCrypt加密
                    if (passwordMatch) {
                        user.setPassword(passwordEncoder.encode(password));
                        user.setUpdatedAt(LocalDateTime.now());
                        gameUserRepository.save(user);
                    }
                }
            } catch (Exception e) {
                // 验证失败
                passwordMatch = false;
            }
            
            if (!passwordMatch) {
                result.put("success", false);
                result.put("code", 401);
                result.put("message", "密码错误");
                return result;
            }
            
            // 4. 检查用户状态
            if (user.getStatus() == 0) {
                result.put("success", false);
                result.put("code", 403);
                result.put("message", "账号已被禁用");
                return result;
            }
            
            // 5. 更新最后登录时间
            user.setLastLoginTime(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            gameUserRepository.save(user);
            
            // 6. 获取用户角色列表
            List<GameRole> roles = gameRoleRepository.findByUserId(user.getId());
            
            // 7. 生成 JWT token
            String token = jwtUtils.generateToken(user.getId(), user.getUsername());
            
            // 8. 构建返回数据
            Map<String, Object> data = buildUserData(user, roles);
            data.put("token", token);
            
            result.put("success", true);
            result.put("code", 200);
            result.put("message", "登录成功");
            result.put("data", data);
            
            return result;
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("code", 500);
            result.put("message", "登录失败：" + e.getMessage());
            return result;
        }
    }
    
    /**
     * 验证用户信息完整性
     * @param userId 用户 ID
     * @return 验证结果
     */
    public Map<String, Object> validateUserInfo(Long userId) {
        Map<String, Object> result = new HashMap<>();
        
        if (userId == null) {
            result.put("valid", false);
            result.put("message", "用户 ID 不能为空");
            return result;
        }
        
        try {
            Optional<GameUser> optionalUser = gameUserRepository.findById(userId);
            if (!optionalUser.isPresent()) {
                result.put("valid", false);
                result.put("message", "用户不存在");
                return result;
            }
            
            GameUser user = optionalUser.get();
            
            // 检查必填字段
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                result.put("valid", false);
                result.put("message", "用户名不能为空");
                return result;
            }
            
            if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
                result.put("valid", false);
                result.put("message", "手机号不能为空");
                return result;
            }
            
            // 检查是否有角色
            List<GameRole> roles = gameRoleRepository.findByUserId(userId);
            if (roles == null || roles.isEmpty()) {
                result.put("valid", true);
                result.put("message", "用户信息完整，但未创建角色");
                result.put("needCreateRole", true);
                return result;
            }
            
            result.put("valid", true);
            result.put("message", "用户信息完整");
            result.put("needCreateRole", false);
            result.put("roleCount", roles.size());
            
            return result;
            
        } catch (Exception e) {
            result.put("valid", false);
            result.put("message", "验证失败：" + e.getMessage());
            return result;
        }
    }
    
    /**
     * 同步角色数据
     * @param userId 用户 ID
     * @param roleId 角色 ID
     * @return 同步结果
     */
    public Map<String, Object> syncRoleData(Long userId, Long roleId) {
        Map<String, Object> result = new HashMap<>();
        
        if (userId == null || roleId == null) {
            result.put("success", false);
            result.put("message", "参数不能为空");
            return result;
        }
        
        try {
            // 验证用户
            Optional<GameUser> optionalUser = gameUserRepository.findById(userId);
            if (!optionalUser.isPresent()) {
                result.put("success", false);
                result.put("message", "用户不存在");
                return result;
            }
            
            // 验证角色
            Optional<GameRole> optionalRole = gameRoleRepository.findById(roleId);
            if (!optionalRole.isPresent()) {
                result.put("success", false);
                result.put("message", "角色不存在");
                return result;
            }
            
            GameRole role = optionalRole.get();
            
            // 验证角色归属
            if (!role.getUserId().equals(userId)) {
                result.put("success", false);
                result.put("message", "角色不属于该用户");
                return result;
            }
            
            result.put("success", true);
            result.put("message", "角色数据同步成功");
            result.put("data", buildRoleData(role));
            
            return result;
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "同步失败：" + e.getMessage());
            return result;
        }
    }
    
    /**
     * 构建用户数据
     */
    private Map<String, Object> buildUserData(GameUser user, List<GameRole> roles) {
        Map<String, Object> data = new HashMap<>();
        data.put("userId", user.getId());
        data.put("username", user.getUsername());
        data.put("nickname", user.getNickname());
        data.put("phone", user.getPhone());
        data.put("avatar", user.getAvatar());
        data.put("status", user.getStatus());
        data.put("lastLoginTime", user.getLastLoginTime());
        
        // 角色列表
        if (roles != null && !roles.isEmpty()) {
            data.put("roles", roles.stream().map(this::buildRoleData).toList());
            // 默认使用第一个角色
            data.put("currentRoleId", roles.get(0).getId());
        }
        
        return data;
    }
    
    /**
     * 构建角色数据
     */
    private Map<String, Object> buildRoleData(GameRole role) {
        Map<String, Object> data = new HashMap<>();
        data.put("roleId", role.getId());
        data.put("roleName", role.getRoleName());
        data.put("gender", role.getGender());
        data.put("realm", role.getRealm());
        data.put("status", role.getStatus());
        return data;
    }
}
