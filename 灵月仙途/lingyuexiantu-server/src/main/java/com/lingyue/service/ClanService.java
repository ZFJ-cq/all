package com.lingyue.service;

import com.lingyue.entity.Clan;
import java.util.List;

public interface ClanService {
    List<Clan> getAllClans();
    Clan getClanById(Long id);
    Clan createClan(Clan clan);
    Clan updateClan(Long id, Clan clan);
    void deleteClan(Long id);
    List<Clan> getClansByLevel(int level);
    List<Clan> getActiveClans();
}
