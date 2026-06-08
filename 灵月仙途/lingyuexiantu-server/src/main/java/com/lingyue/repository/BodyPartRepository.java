package com.lingyue.repository;

import com.lingyue.entity.BodyPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BodyPartRepository extends JpaRepository<BodyPart, Long> {
    
    @Query("SELECT p FROM BodyPart p WHERE p.status = 1 ORDER BY p.id ASC")
    List<BodyPart> findAllActiveParts();
}
