package com.lingyue.repository;

import com.lingyue.entity.Mail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MailRepository extends JpaRepository<Mail, Long> {
    List<Mail> findByUserId(Long userId);
    long countByUserIdAndIsRead(Long userId, Integer isRead);
}