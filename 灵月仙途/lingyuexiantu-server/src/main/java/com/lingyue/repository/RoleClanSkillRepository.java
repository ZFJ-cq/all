package com.lingyue.repository;

import com.lingyue.entity.RoleClanSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoleClanSkillRepository extends JpaRepository<RoleClanSkill, Long> {
    List<RoleClanSkill> findByRoleId(Long roleId);
    List<RoleClanSkill> findByClanSkillId(Long clanSkillId);
    RoleClanSkill findByRoleIdAndClanSkillId(Long roleId, Long clanSkillId);
}
