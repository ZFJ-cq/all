package com.lingyue.aspect;

import com.lingyue.annotation.SectPermission;
import com.lingyue.entity.ClanMember;
import com.lingyue.exception.AccessDeniedException;
import com.lingyue.repository.ClanMemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;

/**
 * 宗门权限校验切面
 */
@Aspect
@Component
public class SectPermissionAspect {
    
    private static final Logger log = LoggerFactory.getLogger(SectPermissionAspect.class);
    
    private final ClanMemberRepository clanMemberRepository;
    
    public SectPermissionAspect(ClanMemberRepository clanMemberRepository) {
        this.clanMemberRepository = clanMemberRepository;
    }
    
    /**
     * 环绕通知：权限校验
     */
    @Around("@annotation(com.lingyue.annotation.SectPermission)")
    public Object checkPermission(ProceedingJoinPoint pjp) throws Throwable {
        MethodSignature signature = (MethodSignature) pjp.getSignature();
        Method method = signature.getMethod();
        
        // 获取注解
        SectPermission sectPermission = method.getAnnotation(SectPermission.class);
        
        // 从方法参数中提取 roleId (假设第一个 Long 类型参数是 roleId)
        Long roleId = extractRoleId(pjp.getArgs());
        if (roleId == null) {
            log.error("无法从方法参数中提取 roleId，方法：{}", method.getName());
            throw new IllegalArgumentException("无法从方法参数中提取 roleId");
        }
        
        // 查询成员的宗门职位
        ClanMember member = clanMemberRepository.findByRoleId(roleId);
        if (member == null) {
            log.error("roleId={} 不是宗门成员", roleId);
            throw new AccessDeniedException("您不是宗门成员，无权执行此操作");
        }
        
        // 校验权限
        validatePermission(member, sectPermission);
        
        log.info("权限校验通过，roleId={}, position={}, method={}", 
            roleId, member.getPosition(), method.getName());
        
        // 执行原方法
        return pjp.proceed();
    }
    
    /**
     * 校验权限
     */
    private void validatePermission(ClanMember member, SectPermission annotation) {
        int memberPosition = member.getPosition();
        
        // 检查特定职位 (优先级更高)
        int[] requiredPositions = annotation.requiredPositions();
        if (requiredPositions.length > 0) {
            boolean hasRequiredPosition = Arrays.stream(requiredPositions)
                .anyMatch(pos -> pos == memberPosition);
            
            if (!hasRequiredPosition) {
                log.warn("权限校验失败：需要特定职位，memberPosition={}, requiredPositions={}", 
                    memberPosition, Arrays.toString(requiredPositions));
                throw new AccessDeniedException(annotation.message());
            }
            return;
        }
        
        // 检查最低职位
        int minPosition = annotation.minPosition();
        if (memberPosition < minPosition) {
            log.warn("权限校验失败：职位不足，memberPosition={}, minPosition={}", 
                memberPosition, minPosition);
            throw new AccessDeniedException(annotation.message());
        }
    }
    
    /**
     * 从方法参数中提取 roleId
     * 支持多种参数命名方式，查找第一个 Long 类型参数
     */
    private Long extractRoleId(Object[] args) {
        for (Object arg : args) {
            if (arg instanceof Long) {
                return (Long) arg;
            }
        }
        return null;
    }
}
