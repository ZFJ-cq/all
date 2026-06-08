package com.lingyue.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Component
public class RequestLoggingInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        long startTime = System.currentTimeMillis();
        request.setAttribute("startTime", startTime);
        
        // 记录请求信息
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String requestUrl = uri + (queryString != null ? "?" + queryString : "");
        
        // 获取请求头
        Map<String, String> headers = new HashMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            headers.put(headerName, request.getHeader(headerName));
        }
        
        // 获取请求参数
        Map<String, String[]> parameters = request.getParameterMap();
        
        logger.debug("[Request] Method: {}, URL: {}, Headers: {}, Parameters: {}",
                method, requestUrl, headers, parameters);
        
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        // 可以在这里记录响应信息
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        long startTime = (Long) request.getAttribute("startTime");
        long endTime = System.currentTimeMillis();
        long executionTime = endTime - startTime;
        
        String method = request.getMethod();
        String uri = request.getRequestURI();
        int statusCode = response.getStatus();
        
        // 记录异常信息
        if (ex != null) {
            logger.error("[Request] Method: {}, URL: {}, Status: {}, Execution Time: {}ms, Exception: {}",
                    method, uri, statusCode, executionTime, ex.getMessage(), ex);
        } else {
            logger.debug("[Request] Method: {}, URL: {}, Status: {}, Execution Time: {}ms",
                    method, uri, statusCode, executionTime);
        }
    }
}
