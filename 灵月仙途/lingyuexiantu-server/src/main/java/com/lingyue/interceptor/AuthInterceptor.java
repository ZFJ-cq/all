package com.lingyue.interceptor;

import com.lingyue.util.JwtUtils;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * 认证拦截器
 * 用于验证用户是否已登录，保护需要认证的API端点
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 获取请求头中的 Authorization
        String authorization = request.getHeader("Authorization");
        
        // 检查是否存在 Authorization 头
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return handleUnauthorized(response, "未提供认证令牌");
        }
        
        // 提取 token
        String token = authorization.substring(7);
        
        try {
            // 解析 token
            Claims claims = jwtUtils.parseToken(token);
            
            // 检查 token 是否过期
            if (jwtUtils.isTokenExpired(token)) {
                return handleUnauthorized(response, "认证令牌已过期");
            }
            
            // 将用户信息存储到请求中，供后续处理使用
            request.setAttribute("userId", claims.get("userId", Long.class));
            request.setAttribute("username", claims.get("username", String.class));
            
            return true;
        } catch (Exception e) {
            return handleUnauthorized(response, "认证令牌无效");
        }
    }
    
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        // 后续处理，暂无实现
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        // 完成处理，暂无实现
    }
    
    private boolean handleUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"code\": 401, \"message\": \"" + message + "\"}");
        return false;
    }
}