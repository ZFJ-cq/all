package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 系统登录日志实体
 */
@Entity
@Table(name = "sys_login_log")
public class SysLoginLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId; // 用户ID

    @Column(name = "username", nullable = false, length = 50)
    private String username; // 用户名

    @Column(name = "login_type", length = 20)
    private String loginType; // 登录类型

    @Column(name = "ip_address", length = 50)
    private String ipAddress; // IP地址

    @Column(name = "ip_location", length = 100)
    private String ipLocation; // IP归属地

    @Column(name = "user_agent", length = 500)
    private String userAgent; // 浏览器标识

    @Column(name = "login_status")
    private Integer loginStatus = 1; // 登录状态

    @Column(name = "error_message", length = 200)
    private String errorMessage; // 错误信息

    @Column(name = "login_time")
    private LocalDateTime loginTime = LocalDateTime.now(); // 登录时间

    @Column(name = "logout_time")
    private LocalDateTime logoutTime; // 登出时间

    // 构造函数
    public SysLoginLog() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getLoginType() {
        return loginType;
    }

    public void setLoginType(String loginType) {
        this.loginType = loginType;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getIpLocation() {
        return ipLocation;
    }

    public void setIpLocation(String ipLocation) {
        this.ipLocation = ipLocation;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public Integer getLoginStatus() {
        return loginStatus;
    }

    public void setLoginStatus(Integer loginStatus) {
        this.loginStatus = loginStatus;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public LocalDateTime getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(LocalDateTime loginTime) {
        this.loginTime = loginTime;
    }

    public LocalDateTime getLogoutTime() {
        return logoutTime;
    }

    public void setLogoutTime(LocalDateTime logoutTime) {
        this.logoutTime = logoutTime;
    }
}