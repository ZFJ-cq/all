package com.lingyue.repository;

import com.lingyue.entity.ClanSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClanSkillRepository extends JpaRepository<ClanSkill, Long> {
    List<ClanSkill> findByClanId(Long clanId);
}
