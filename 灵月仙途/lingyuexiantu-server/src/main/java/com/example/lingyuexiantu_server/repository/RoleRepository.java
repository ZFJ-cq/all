package com.example.lingyuexiantu_server.repository;

import com.example.lingyuexiantu_server.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    List<Role> findByUserId(Long userId);
}