package com.lingyue.annotation;

import java.lang.annotation.*;

/**
 * 宗门权限校验注解
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface SectPermission {
    
    /**
     * 需要的最低职位
     * 1: 普通成员，2: 精英，3: 长老，4: 宗主
     */
    int minPosition() default 1;
    
    /**
     * 是否需要特定职位 (优先级高于 minPosition)
     */
    int[] requiredPositions() default {};
    
    /**
     * 错误消息
     */
    String message() default "权限不足，无法执行此操作";
}
