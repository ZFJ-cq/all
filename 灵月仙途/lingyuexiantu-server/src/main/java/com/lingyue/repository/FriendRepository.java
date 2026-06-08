package com.lingyue.repository;

import com.lingyue.entity.Friend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FriendRepository extends JpaRepository<Friend, Long> {
    
    List<Friend> findByUserIdAndStatus(Long userId, String status);
    
    List<Friend> findByUserId(Long userId);
    
    @Query("SELECT f FROM Friend f WHERE f.userId = :userId AND f.friendId = :friendId")
    Friend findByUserIdAndFriendId(Long userId, Long friendId);
    
    @Query("SELECT COUNT(f) FROM Friend f WHERE f.userId = :userId AND f.status = 'pending'")
    int countPendingRequests(Long userId);
    
    boolean existsByUserIdAndFriendIdAndStatus(Long userId, Long friendId, String status);
}
