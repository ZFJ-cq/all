package com.lingyue.repository;

import com.lingyue.entity.ClanShopItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClanShopItemRepository extends JpaRepository<ClanShopItem, Long> {
    
    List<ClanShopItem> findByStatusOrderByCreateTimeDesc(Integer status);
    
    List<ClanShopItem> findByClanIdAndStatusOrderByCreateTimeDesc(Long clanId, Integer status);
    
    default List<ClanShopItem> findAllAvailable() {
        return findByStatusOrderByCreateTimeDesc(1);
    }
    
    default List<ClanShopItem> findAvailableByClanId(Long clanId) {
        return findByClanIdAndStatusOrderByCreateTimeDesc(clanId, 1);
    }
}
