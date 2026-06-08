package com.lingyue.repository;

import com.lingyue.entity.MailItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MailItemRepository extends JpaRepository<MailItem, Long> {
    List<MailItem> findByMailId(Long mailId);
}