package com.lingyue.controller;

import com.lingyue.entity.GameRole;
import com.lingyue.entity.GameUser;
import com.lingyue.entity.PaymentRecord;
import com.lingyue.repository.GameRoleRepository;
import com.lingyue.repository.GameUserRepository;
import com.lingyue.repository.PaymentRecordRepository;
import com.lingyue.repository.RoleAssetRepository;
import com.lingyue.service.RoleAssetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payment")
@CrossOrigin(originPatterns = "*")
public class PaymentController {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    private static final BigDecimal MAX_PAYMENT_AMOUNT = new BigDecimal("1000000");
    
    private final PaymentRecordRepository paymentRecordRepository;
    private final GameUserRepository gameUserRepository;
    private final GameRoleRepository gameRoleRepository;
    private final RoleAssetService roleAssetService;
    
    public PaymentController(PaymentRecordRepository paymentRecordRepository, 
                           GameUserRepository gameUserRepository, 
                           GameRoleRepository gameRoleRepository, 
                           RoleAssetService roleAssetService) {
        this.paymentRecordRepository = paymentRecordRepository;
        this.gameUserRepository = gameUserRepository;
        this.gameRoleRepository = gameRoleRepository;
        this.roleAssetService = roleAssetService;
    }
    
    @PostMapping("/buy")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<Map<String, Object>> buyItem(@RequestBody Map<String, Object> request) {
        try {
            if (request == null || request.get("amount") == null || request.get("method") == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "参数不完整"
                ));
            }
            
            BigDecimal amount;
            try {
                amount = new BigDecimal(request.get("amount").toString());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "金额格式错误"
                ));
            }
            
            String method = request.get("method").toString();
            Long userId = request.containsKey("userId") ? Long.parseLong(request.get("userId").toString()) : null;
            Long roleId = request.containsKey("roleId") ? Long.parseLong(request.get("roleId").toString()) : null;
            
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "充值金额必须大于 0"
                ));
            }
            
            if (amount.compareTo(MAX_PAYMENT_AMOUNT) > 0) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "单次充值金额不能超过 100 万"
                ));
            }
            
            if (userId == null && roleId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "用户 ID 或角色 ID 不能为空"
                ));
            }
            
            // 如果提供了角色ID，获取对应的用户ID
            if (roleId != null && userId == null) {
                GameRole role = gameRoleRepository.findById(roleId).orElse(null);
                if (role == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "角色不存在"
                    ));
                }
                userId = role.getUserId();
            }
            
            // 验证用户是否存在
            GameUser user = gameUserRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "用户不存在"
                ));
            }
            
            // 生成订单号
            String orderNo = UUID.randomUUID().toString().replace("-", "");
            
            PaymentRecord paymentRecord = new PaymentRecord();
            paymentRecord.setUserId(userId);
            paymentRecord.setRoleId(roleId);
            paymentRecord.setAmount(amount);
            paymentRecord.setMethod(method);
            paymentRecord.setStatus("success");
            paymentRecord.setOrderNo(orderNo);
            paymentRecord.setCreateTime(LocalDateTime.now());
            paymentRecord.setUpdateTime(LocalDateTime.now());
            paymentRecordRepository.save(paymentRecord);
            
            int lingShiAmount = amount.multiply(new BigDecimal(100)).intValue();
            if (roleId != null) {
                roleAssetService.updateAsset(roleId, "灵石", lingShiAmount);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "购买成功");
            result.put("orderNo", orderNo);
            result.put("amount", amount);
            result.put("lingShiAmount", lingShiAmount);
            
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            logger.warn("充值参数错误：{}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("充值失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "充值失败，请稍后重试"
            ));
        }
    }
    
    @GetMapping("/records/{userId}")
    public ResponseEntity<Map<String, Object>> getPaymentRecords(@PathVariable Long userId) {
        try {
            GameUser user = gameUserRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "用户不存在"
                ));
            }
            
            var records = paymentRecordRepository.findByUserId(userId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("records", records);
            result.put("total", records.size());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("获取支付记录失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "操作失败：" + e.getMessage()
            ));
        }
    }
}
