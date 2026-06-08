package com.lingyue.config;

import com.lingyue.util.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT 认证过滤器
 * 用于从请求中获取 token 并验证用户身份
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 从请求头中获取 token
        String authHeader = request.getHeader("Authorization");
        
        // 检查是否是需要认证的路径
        String requestPath = request.getRequestURI();
        
        logger.info("请求路径：{}, Authorization Header: {}", requestPath, authHeader != null ? "存在" : "不存在");
        
        // 不需要认证的路径（这些路径已在 SecurityConfig 中配置为 permitAll）
        if (requestPath.startsWith("/auth/") || 
            requestPath.equals("/role/create") || 
            requestPath.startsWith("/sys/user/login") ||
            requestPath.startsWith("/config/") ||
            requestPath.equals("/health") ||
            requestPath.startsWith("/health/") ||
            requestPath.startsWith("/init/") ||
            requestPath.startsWith("/test-data/") ||
            requestPath.startsWith("/activity/") ||
            requestPath.startsWith("/announcement/") ||
            requestPath.startsWith("/leaderboard/") ||
            requestPath.startsWith("/body-cultivation/") ||
            requestPath.startsWith("/role-stats/") ||
            requestPath.startsWith("/cultivation/") ||
            requestPath.startsWith("/role-assets/")) {
            logger.info("放行无需认证的路径：{}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }
        
        // 需要认证的路径
        if (authHeader == null || !authHeader.startsWith("Bearer ") || authHeader.trim().length() <= 7) {
            logger.warn("未认证请求：{}, Authorization: {}", requestPath, authHeader);
            // 不直接返回 401，让 Spring Security 决定是否允许访问
            // 这样可以支持 permitAll() 的公开接口
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = authHeader.substring(7);
        
        try {
            // 验证 token
            if (jwtUtils.isTokenExpired(token)) {
                logger.warn("Token 已过期：{}", token);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setCharacterEncoding("UTF-8");
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"code\": 401, \"message\": \"token 已过期，请重新登录\"}");
                return;
            }
            
            Long userId = jwtUtils.getUserIdFromToken(token);
            // 将用户 ID 存储到请求中
            request.setAttribute("userId", userId);
            
            // 设置 Spring Security 认证上下文
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userId, null, java.util.Collections.emptyList());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            logger.info("Token 验证成功 - 用户 ID: {}, 路径：{}", userId, requestPath);
        } catch (Exception e) {
            // token 验证失败
            logger.error("Token 验证失败：{}, 错误信息：{}", token, e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\": 401, \"message\": \"token 无效，请重新登录\"}");
            return;
        }
        
        filterChain.doFilter(request, response);
    }
}