package com.lingyue.service;

import com.lingyue.dto.BodyCultivationDTO;
import com.lingyue.dto.CultivateResult;
import com.lingyue.dto.BreakthroughResult;
import java.util.List;

/**
 * 锻体系统服务接口
 */
public interface BodyCultivationService {
    
    /**
     * 获取角色锻体信息
     */
    BodyCultivationDTO getBodyCultivationInfo(Long roleId);
    
    /**
     * 修炼锻体
     */
    CultivateResult cultivate(Long roleId, Long partId, Integer qteScore);
    
    /**
     * 境界突破
     */
    BreakthroughResult breakthrough(Long roleId, Boolean useMedicine);
    
    /**
     * 获取所有锻体境界
     */
    List<BodyCultivationDTO.RealmInfo> getAllRealms();
    
    /**
     * 获取所有锻体部位
     */
    List<BodyCultivationDTO.PartInfo> getAllParts();
    
    /**
     * 获取修炼日志
     */
    List<BodyCultivationDTO.LogInfo> getCultivationLogs(Long roleId, Integer days);
}
