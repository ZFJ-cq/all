package com.example.lingyuexiantu_server.service;

import com.example.lingyuexiantu_server.entity.Role;
import com.example.lingyuexiantu_server.repository.RoleRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    
    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

    public Role getRoleById(Long id) {
        return roleRepository.findById(id).orElse(null);
    }

    public List<Role> getRolesByUserId(Long userId) {
        return roleRepository.findByUserId(userId);
    }

    public Role updateRole(Long id, Role roleDetails) {
        Role role = roleRepository.findById(id).orElse(null);
        if (role != null) {
            role.setName(roleDetails.getName());
            role.setDescription(roleDetails.getDescription());
            role.setLevel(roleDetails.getLevel());
            role.setExperience(roleDetails.getExperience());
            role.setHealth(roleDetails.getHealth());
            role.setHealthMax(roleDetails.getHealthMax());
            role.setMana(roleDetails.getMana());
            role.setManaMax(roleDetails.getManaMax());
            role.setSpiritStones(roleDetails.getSpiritStones());
            role.setRealm(roleDetails.getRealm());
            role.setRealmStage(roleDetails.getRealmStage());
            return roleRepository.save(role);
        }
        return null;
    }

    public void deleteRole(Long id) {
        roleRepository.deleteById(id);
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
}