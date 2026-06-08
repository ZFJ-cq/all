package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 系统操作日志实体
 */
@Entity
@Table(name = "sys_operation_log")
public class SysOperationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "operator_id", nullable = false)
    private Long operatorId; // 操作人ID

    @Column(name = "operator_username", nullable = false, length = 50)
    private String operatorUsername; // 操作人账号

    @Column(name = "operator_nickname", length = 50)
    private String operatorNickname; // 操作人昵称

    @Column(name = "module", length = 50)
    private String module; // 操作模块

    @Column(name = "operation_type", length = 50)
    private String operationType; // 操作类型

    @Column(name = "api_path", nullable = false, length = 200)
    private String apiPath; // API路径

    @Column(name = "request_method", length = 10)
    private String requestMethod; // 请求方法

    @Column(name = "request_params", columnDefinition = "TEXT")
    private String requestParams; // 请求参数

    @Column(name = "response_status")
    private Integer responseStatus = 200; // 响应状态码

    @Column(name = "ip_address", length = 50)
    private String ipAddress; // 操作IP

    @Column(name = "ip_location", length = 100)
    private String ipLocation; // IP归属地

    @Column(name = "user_agent", length = 500)
    private String userAgent; // 浏览器标识

    @Column(name = "execution_time")
    private Integer executionTime; // 执行时间

    @Column(name = "data_snapshot_before", columnDefinition = "TEXT")
    private String dataSnapshotBefore; // 操作前数据快照

    @Column(name = "data_snapshot_after", columnDefinition = "TEXT")
    private String dataSnapshotAfter; // 操作后数据快照

    @Column(name = "is_sensitive")
    private Integer isSensitive = 0; // 是否敏感操作

    @Column(name = "verification_code", length = 50)
    private String verificationCode; // 二次验证码

    @Column(name = "status")
    private Integer status = 1; // 状态：0-失败 1-成功

    @Column(name = "error_message", length = 1000)
    private String errorMessage; // 错误信息

    @Column(name = "create_time")
    private LocalDateTime createTime = LocalDateTime.now(); // 操作时间

    // 构造函数
    public SysOperationLog() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(Long operatorId) {
        this.operatorId = operatorId;
    }

    public String getOperatorUsername() {
        return operatorUsername;
    }

    public void setOperatorUsername(String operatorUsername) {
        this.operatorUsername = operatorUsername;
    }

    public String getOperatorNickname() {
        return operatorNickname;
    }

    public void setOperatorNickname(String operatorNickname) {
        this.operatorNickname = operatorNickname;
    }

    public String getModule() {
        return module;
    }

    public void setModule(String module) {
        this.module = module;
    }

    public String getOperationType() {
        return operationType;
    }

    public void setOperationType(String operationType) {
        this.operationType = operationType;
    }

    public String getApiPath() {
        return apiPath;
    }

    public void setApiPath(String apiPath) {
        this.apiPath = apiPath;
    }

    public String getRequestMethod() {
        return requestMethod;
    }

    public void setRequestMethod(String requestMethod) {
        this.requestMethod = requestMethod;
    }

    public String getRequestParams() {
        return requestParams;
    }

    public void setRequestParams(String requestParams) {
        this.requestParams = requestParams;
    }

    public Integer getResponseStatus() {
        return responseStatus;
    }

    public void setResponseStatus(Integer responseStatus) {
        this.responseStatus = responseStatus;
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

    public Integer getExecutionTime() {
        return executionTime;
    }

    public void setExecutionTime(Integer executionTime) {
        this.executionTime = executionTime;
    }

    public String getDataSnapshotBefore() {
        return dataSnapshotBefore;
    }

    public void setDataSnapshotBefore(String dataSnapshotBefore) {
        this.dataSnapshotBefore = dataSnapshotBefore;
    }

    public String getDataSnapshotAfter() {
        return dataSnapshotAfter;
    }

    public void setDataSnapshotAfter(String dataSnapshotAfter) {
        this.dataSnapshotAfter = dataSnapshotAfter;
    }

    public Integer getIsSensitive() {
        return isSensitive;
    }

    public void setIsSensitive(Integer isSensitive) {
        this.isSensitive = isSensitive;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }
}