package com.lingyue.repository;

import com.lingyue.entity.MapNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MapNodeRepository extends JpaRepository<MapNode, Long> {
    
    Optional<MapNode> findByMapCode(String mapCode);
    
    List<MapNode> findByStatus(Integer status);
    
    List<MapNode> findByMapType(Integer mapType);
    
    List<MapNode> findByStatusAndRecommendLevelLessThanEqual(Integer status, Integer recommendLevel);
    
    @Query("SELECT m FROM MapNode m WHERE m.mapName LIKE %?1%")
    List<MapNode> searchByKeyword(String keyword);
}
