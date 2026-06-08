package com.lingyue.repository;

import com.lingyue.entity.ClanMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ClanMemberRepository extends JpaRepository<ClanMember, Long> {
    ClanMember findByRoleId(Long roleId);
    List<ClanMember> findByClanId(Long clanId);
    
    /**
     * 统计某宗门某职位的人数
     */
    @Query("SELECT COUNT(cm) FROM ClanMember cm WHERE cm.clanId = :clanId AND cm.position = :position")
    int countByClanIdAndPosition(@Param("clanId") Long clanId, @Param("position") Integer position);
}