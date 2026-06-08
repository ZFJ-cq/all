package com.lingyue.repository;

import com.lingyue.entity.ClanChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 宗门聊天消息 Repository
 */
@Repository
public interface ClanChatMessageRepository extends JpaRepository<ClanChatMessage, Long> {
    
    /**
     * 分页查询宗门聊天消息
     */
    List<ClanChatMessage> findByClanIdOrderByCreateTimeDesc(Long clanId, PageRequest pageRequest);
}
