package com.lingyue.integration;

import com.lingyue.entity.GameRole;
import com.lingyue.entity.Skill;
import com.lingyue.service.GameRoleService;
import com.lingyue.service.SkillService;
import com.lingyuexiantu.common.Result;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
public class IntegrationTest {

    @Autowired
    private GameRoleService gameRoleService;

    @Autowired
    private SkillService skillService;

    private GameRole testRole;

    @BeforeEach
    public void setUp() {
        // 创建测试角色
        testRole = new GameRole();
        testRole.setUserId(1L);
        testRole.setRoleName("测试角色");
        testRole.setRealm("凡人");
        testRole = gameRoleService.createRole(testRole);
        assertNotNull(testRole);
        assertNotNull(testRole.getId());
    }

    @Test
    public void testRoleCreationAndSkillIntegration() {
        // 测试角色创建
        assertNotNull(testRole);
        assertNotNull(testRole.getId());
        assertTrue(testRole.getRoleName().equals("测试角色"));
        assertTrue(testRole.getRealm().equals("凡人"));

        // 测试技能列表获取
        List<Skill> skills = skillService.getAllSkills();
        assertNotNull(skills);
        assertTrue(skills.size() > 0);

        // 测试角色技能学习（如果有相关方法）
        // 这里可以添加角色学习技能的测试
    }

    @Test
    public void testRoleRealmUpdate() {
        // 测试角色境界更新
        String newRealm = "练气期";
        GameRole updatedRole = gameRoleService.updateRealm(testRole.getId(), newRealm);
        assertNotNull(updatedRole);
        assertTrue(updatedRole.getRealm().equals(newRealm));
    }

    @Test
    public void testSkillListRetrieval() {
        // 测试技能列表获取
        List<Skill> skills = skillService.getAllSkills();
        assertNotNull(skills);
        assertTrue(skills.size() > 0);
    }
}
