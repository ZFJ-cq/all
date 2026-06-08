package com.lingyue.service.impl;

import com.lingyue.entity.Clan;
import com.lingyue.repository.ClanRepository;
import com.lingyue.service.ClanService;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClanServiceImpl implements ClanService {
    
    private final ClanRepository clanRepository;
    
    public ClanServiceImpl(ClanRepository clanRepository) {
        this.clanRepository = clanRepository;
    }

    @Override
    public List<Clan> getAllClans() {
        return clanRepository.findAll();
    }

    @Override
    public Clan getClanById(Long id) {
        return clanRepository.findById(id).orElse(null);
    }

    @Override
    public Clan createClan(Clan clan) {
        clan.setLevel(1);
        clan.setMembersCount(1);
        clan.setStatus("active");
        clan.setMaxMembers(10);
        return clanRepository.save(clan);
    }

    @Override
    public Clan updateClan(Long id, Clan clan) {
        Clan existingClan = clanRepository.findById(id).orElse(null);
        if (existingClan != null) {
            existingClan.setName(clan.getName());
            existingClan.setDescription(clan.getDescription());
            existingClan.setLogo(clan.getLogo());
            existingClan.setLevel(clan.getLevel());
            existingClan.setMembersCount(clan.getMembersCount());
            existingClan.setContribution(clan.getContribution());
            existingClan.setLeaderName(clan.getLeaderName());
            existingClan.setLeaderId(clan.getLeaderId());
            existingClan.setStatus(clan.getStatus());
            existingClan.setLocation(clan.getLocation());
            existingClan.setMaxMembers(clan.getMaxMembers());
            existingClan.setRequiredLevel(clan.getRequiredLevel());
            return clanRepository.save(existingClan);
        }
        return null;
    }

    @Override
    public void deleteClan(Long id) {
        clanRepository.deleteById(id);
    }

    @Override
    public List<Clan> getClansByLevel(int level) {
        return clanRepository.findAll().stream()
                .filter(clan -> clan.getLevel() == level)
                .collect(Collectors.toList());
    }

    @Override
    public List<Clan> getActiveClans() {
        return clanRepository.findAll().stream()
                .filter(clan -> "active".equals(clan.getStatus()))
                .collect(Collectors.toList());
    }
}
