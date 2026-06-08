package com.lingyuexiantu.repository;

import com.lingyuexiantu.entity.MapNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MapNodeRepository extends JpaRepository<MapNode, Long> {
}
