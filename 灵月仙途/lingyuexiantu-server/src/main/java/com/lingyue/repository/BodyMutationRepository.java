package com.lingyue.repository;

import com.lingyue.entity.BodyMutation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BodyMutationRepository extends JpaRepository<BodyMutation, Long> {
}
