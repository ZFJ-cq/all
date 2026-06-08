package com.lingyue.repository;

import com.lingyue.entity.TradeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeItemRepository extends JpaRepository<TradeItem, Long> {
    List<TradeItem> findByActiveTrue();
    List<TradeItem> findByCategoryAndActiveTrue(String category);
}