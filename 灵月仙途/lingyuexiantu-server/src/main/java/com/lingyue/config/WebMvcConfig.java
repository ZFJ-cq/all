package com.lingyue.config;

import com.lingyue.interceptor.AuthInterceptor;
import com.lingyue.interceptor.RequestLoggingInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置类
 * 用于注册拦截器等
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Autowired
    private AuthInterceptor authInterceptor;
    
    @Autowired
    private RequestLoggingInterceptor requestLoggingInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注册请求日志拦截器，记录所有HTTP请求
        registry.addInterceptor(requestLoggingInterceptor)
                .addPathPatterns("/**"); // 拦截所有请求
        
        // 注册认证拦截器，对需要认证的API端点进行保护
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**") // 拦截所有API请求
                .excludePathPatterns("/api/auth/**"); // 排除认证相关的端点
    }
}