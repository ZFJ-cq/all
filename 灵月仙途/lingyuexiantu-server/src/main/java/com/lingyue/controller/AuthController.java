package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyuexiantu.common.Result;
import com.lingyue.entity.GameUser;
import com.lingyue.repository.GameUserRepository;
import com.lingyue.service.VerificationCodeService;
import com.lingyue.util.AuthUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 认证控制器
 * 统一处理登录、注册、登出等认证相关接口
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class AuthController {
    
    @Autowired
    private GameUserRepository gameUserRepository;
    
    @Autowired
    private VerificationCodeService verificationCodeService;
    
    @Autowired
    private AuthUtils authUtils;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            
            // 验证参数
            if (username == null || username.trim().isEmpty()) {
                return Result.error("用户名不能为空");
            }
            if (password == null || password.trim().isEmpty()) {
                return Result.error("密码不能为空");
            }
            
            // 使用统一的认证工具类处理登录
            Map<String, Object> loginResult = authUtils.login(username, password);
            
            if (!(Boolean) loginResult.get("success")) {
                return Result.error((String) loginResult.get("message"));
            }
            
            return Result.success((Map<String, Object>) loginResult.get("data"));
            
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("登录失败，请检查用户名和密码");
        }
    }
    
    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        try {
            String phone = request.get("phone");
            String code = request.get("code");
            String password = request.get("password");
            String nickname = request.get("nickname");
            
            // 验证参数
            if (phone == null || code == null || password == null || nickname == null) {
                return Result.error("参数不完整");
            }
            
            // 验证验证码
            if (!verificationCodeService.verifyCode(phone, code)) {
                return Result.error("验证码错误或已过期");
            }
            
            // 检查手机号是否已注册
            GameUser existingUser = gameUserRepository.findByPhone(phone);
            if (existingUser != null) {
                return Result.error("手机号已注册");
            }
            
            // 创建新用户
            GameUser user = new GameUser();
            user.setUsername(phone); // 使用手机号作为用户名
            user.setPassword(passwordEncoder.encode(password)); // 使用BCrypt加密密码
            user.setNickname(nickname);
            user.setPhone(phone);
            user.setStatus(1); // 启用
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            
            gameUserRepository.save(user);
            
            // 返回用户信息
            Map<String, Object> data = new HashMap<>();
            data.put("userId", user.getId());
            data.put("username", user.getUsername());
            data.put("nickname", user.getNickname());
            
            return Result.success(data);
            
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("注册失败，请稍后重试");
        }
    }
    
    /**
     * 发送验证码
     */
    @PostMapping("/send-code")
    public Result<Map<String, String>> sendCode(@RequestParam String phone) {
        try {
            // 检查手机号是否已注册
            GameUser existingUser = gameUserRepository.findByPhone(phone);
            if (existingUser != null) {
                return Result.error("手机号已注册");
            }
            
            // 生成并发送验证码
            String code = verificationCodeService.generateAndSendCode(phone);
            
            Map<String, String> data = new HashMap<>();
            data.put("message", "验证码发送成功");
            // 不在返回值中包含验证码，提高安全性
            
            return Result.success(data);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("发送验证码失败，请稍后重试");
        }
    }
    
    /**
     * 用户登出
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        // 实际项目中应该处理 token 等信息
        return Result.success(null);
    }
    
    /**
     * 获取用户信息
     */
    @GetMapping("/user/{id}")
    public Result<Map<String, Object>> getUserInfo(@PathVariable Long id) {
        try {
            return Result.success(authUtils.validateUserInfo(id));
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取用户信息失败：" + e.getMessage());
        }
    }
    
    /**
     * 验证用户信息完整性
     */
    @GetMapping("/user/{id}/validate")
    public Result<Map<String, Object>> validateUserInfo(@PathVariable Long id) {
        try {
            Map<String, Object> validationResult = authUtils.validateUserInfo(id);
            
            if (!(Boolean) validationResult.get("valid")) {
                return Result.error((String) validationResult.get("message"));
            }
            
            return Result.success(validationResult);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("验证失败：" + e.getMessage());
        }
    }
    
    /**
     * 同步角色数据
     */
    @PostMapping("/role/{roleId}/sync")
    public Result<Map<String, Object>> syncRoleData(@RequestParam Long userId, 
                                                     @PathVariable Long roleId) {
        try {
            Map<String, Object> syncResult = authUtils.syncRoleData(userId, roleId);
            
            if (!(Boolean) syncResult.get("success")) {
                return Result.error((String) syncResult.get("message"));
            }
            
            return Result.success((Map<String, Object>) syncResult.get("data"));
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("同步失败：" + e.getMessage());
        }
    }
}
