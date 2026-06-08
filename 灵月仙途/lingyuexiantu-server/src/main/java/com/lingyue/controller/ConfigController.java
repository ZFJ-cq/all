package com.lingyue.controller;

import com.lingyue.entity.CfgEquipmentQuality;
import com.lingyue.entity.CfgNumericalRules;
import com.lingyue.entity.CfgPillEffect;
import com.lingyue.entity.CfgRealmBreakthrough;
import com.lingyue.entity.CfgSkillUpgrade;
import com.lingyue.repository.CfgEquipmentQualityRepository;
import com.lingyue.repository.CfgPillEffectRepository;
import com.lingyue.repository.CfgRealmBreakthroughRepository;
import com.lingyue.repository.CfgSkillUpgradeRepository;
import com.lingyue.service.ConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * 配置管理控制器
 */
@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/config")
public class ConfigController {

    @Autowired
    private ConfigService configService;

    @Autowired
    private CfgRealmBreakthroughRepository realmBreakthroughRepository;

    @Autowired
    private CfgEquipmentQualityRepository equipmentQualityRepository;

    @Autowired
    private CfgPillEffectRepository pillEffectRepository;

    @Autowired
    private CfgSkillUpgradeRepository skillUpgradeRepository;

    // 境界突破配置管理
    @GetMapping("/realm-breakthrough")
    public ResponseEntity<List<CfgRealmBreakthrough>> getRealmBreakthroughs() {
        return ResponseEntity.ok(configService.getAllRealmBreakthroughs());
    }

    @GetMapping("/realm-breakthrough/{id}")
    public ResponseEntity<CfgRealmBreakthrough> getRealmBreakthrough(@PathVariable Integer id) {
        Optional<CfgRealmBreakthrough> config = realmBreakthroughRepository.findById(id);
        return config.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/realm-breakthrough")
    public ResponseEntity<CfgRealmBreakthrough> createRealmBreakthrough(@RequestBody CfgRealmBreakthrough config) {
        CfgRealmBreakthrough saved = realmBreakthroughRepository.save(config);
        configService.refreshCache();
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/realm-breakthrough/{id}")
    public ResponseEntity<CfgRealmBreakthrough> updateRealmBreakthrough(@PathVariable Integer id, @RequestBody CfgRealmBreakthrough config) {
        Optional<CfgRealmBreakthrough> existing = realmBreakthroughRepository.findById(id);
        if (existing.isPresent()) {
            config.setId(id);
            CfgRealmBreakthrough updated = realmBreakthroughRepository.save(config);
            configService.refreshCache();
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/realm-breakthrough/{id}")
    public ResponseEntity<Void> deleteRealmBreakthrough(@PathVariable Integer id) {
        if (realmBreakthroughRepository.existsById(id)) {
            realmBreakthroughRepository.deleteById(id);
            configService.refreshCache();
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 装备品质配置管理
    @GetMapping("/equipment-quality")
    public ResponseEntity<List<CfgEquipmentQuality>> getEquipmentQualities() {
        return ResponseEntity.ok(configService.getAllEquipmentQualities());
    }

    @GetMapping("/equipment-quality/{id}")
    public ResponseEntity<CfgEquipmentQuality> getEquipmentQuality(@PathVariable Integer id) {
        Optional<CfgEquipmentQuality> config = equipmentQualityRepository.findById(id);
        return config.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/equipment-quality")
    public ResponseEntity<CfgEquipmentQuality> createEquipmentQuality(@RequestBody CfgEquipmentQuality config) {
        CfgEquipmentQuality saved = equipmentQualityRepository.save(config);
        configService.refreshCache();
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/equipment-quality/{id}")
    public ResponseEntity<CfgEquipmentQuality> updateEquipmentQuality(@PathVariable Integer id, @RequestBody CfgEquipmentQuality config) {
        Optional<CfgEquipmentQuality> existing = equipmentQualityRepository.findById(id);
        if (existing.isPresent()) {
            config.setId(id);
            CfgEquipmentQuality updated = equipmentQualityRepository.save(config);
            configService.refreshCache();
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/equipment-quality/{id}")
    public ResponseEntity<Void> deleteEquipmentQuality(@PathVariable Integer id) {
        if (equipmentQualityRepository.existsById(id)) {
            equipmentQualityRepository.deleteById(id);
            configService.refreshCache();
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 丹药效果配置管理
    @GetMapping("/pill-effect")
    public ResponseEntity<List<CfgPillEffect>> getPillEffects() {
        return ResponseEntity.ok(configService.getAllPillEffects());
    }

    @GetMapping("/pill-effect/{id}")
    public ResponseEntity<CfgPillEffect> getPillEffect(@PathVariable Integer id) {
        Optional<CfgPillEffect> config = pillEffectRepository.findById(id);
        return config.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/pill-effect")
    public ResponseEntity<CfgPillEffect> createPillEffect(@RequestBody CfgPillEffect config) {
        CfgPillEffect saved = pillEffectRepository.save(config);
        configService.refreshCache();
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/pill-effect/{id}")
    public ResponseEntity<CfgPillEffect> updatePillEffect(@PathVariable Integer id, @RequestBody CfgPillEffect config) {
        Optional<CfgPillEffect> existing = pillEffectRepository.findById(id);
        if (existing.isPresent()) {
            config.setId(id);
            CfgPillEffect updated = pillEffectRepository.save(config);
            configService.refreshCache();
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/pill-effect/{id}")
    public ResponseEntity<Void> deletePillEffect(@PathVariable Integer id) {
        if (pillEffectRepository.existsById(id)) {
            pillEffectRepository.deleteById(id);
            configService.refreshCache();
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 技能升级配置管理
    @GetMapping("/skill-upgrade")
    public ResponseEntity<List<CfgSkillUpgrade>> getSkillUpgrades() {
        return ResponseEntity.ok(configService.getAllSkillUpgrades());
    }

    @GetMapping("/skill-upgrade/{id}")
    public ResponseEntity<CfgSkillUpgrade> getSkillUpgrade(@PathVariable Integer id) {
        Optional<CfgSkillUpgrade> config = skillUpgradeRepository.findById(id);
        return config.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/skill-upgrade")
    public ResponseEntity<CfgSkillUpgrade> createSkillUpgrade(@RequestBody CfgSkillUpgrade config) {
        CfgSkillUpgrade saved = skillUpgradeRepository.save(config);
        configService.refreshCache();
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/skill-upgrade/{id}")
    public ResponseEntity<CfgSkillUpgrade> updateSkillUpgrade(@PathVariable Integer id, @RequestBody CfgSkillUpgrade config) {
        Optional<CfgSkillUpgrade> existing = skillUpgradeRepository.findById(id);
        if (existing.isPresent()) {
            config.setId(id);
            CfgSkillUpgrade updated = skillUpgradeRepository.save(config);
            configService.refreshCache();
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/skill-upgrade/{id}")
    public ResponseEntity<Void> deleteSkillUpgrade(@PathVariable Integer id) {
        if (skillUpgradeRepository.existsById(id)) {
            skillUpgradeRepository.deleteById(id);
            configService.refreshCache();
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 缓存管理
    @PostMapping("/refresh-cache")
    public ResponseEntity<Void> refreshCache() {
        configService.refreshCache();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/clear-cache")
    public ResponseEntity<Void> clearCache() {
        configService.clearCache();
        return ResponseEntity.ok().build();
    }

    // 属性计算相关配置
    @GetMapping("/stat-caps")
    public ResponseEntity<?> getStatCaps() {
        CfgNumericalRules config = configService.getConfig("stat_caps");
        if (config == null) {
            // 返回默认值
            String defaultConfig = "{\"hp\": 999999, \"attack\": 99999, \"defense\": 99999, \"speed\": 9999, \"crit\": 100, \"dodge\": 100}";
            return ResponseEntity.ok(defaultConfig);
        }
        return ResponseEntity.ok(config.getContent());
    }

    @GetMapping("/formula-coef")
    public ResponseEntity<?> getFormulaCoefficients() {
        CfgNumericalRules config = configService.getConfig("formula_coef");
        if (config == null) {
            // 返回默认值
            String defaultConfig = "{\"hp_base\": 100, \"atk_spirit\": 8, \"atk_vit\": 1, \"def_vit\": 5, \"def_agi\": 2, \"speed\": 10, \"crit_luck\": 0.001, \"crit_spirit\": 0.0002, \"dodge\": 0.005, \"hit_base\": 0.9, \"hit_agi\": 0.003, \"exp_base\": 1.0, \"exp_wis\": 0.01}";
            return ResponseEntity.ok(defaultConfig);
        }
        return ResponseEntity.ok(config.getContent());
    }

    @GetMapping("/realm-mult")
    public ResponseEntity<?> getRealmMultipliers() {
        CfgNumericalRules config = configService.getConfig("realm_mult");
        if (config == null) {
            // 返回默认值
            String defaultConfig = "{\"凡人\": 1, \"练气期\": 2, \"筑基期\": 3, \"金丹期\": 5, \"元婴期\": 8, \"化神期\": 13, \"合体期\": 21, \"大乘期\": 34, \"渡劫期\": 55, \"真仙\": 89}";
            return ResponseEntity.ok(defaultConfig);
        }
        return ResponseEntity.ok(config.getContent());
    }
    
    @GetMapping("/realm-breakthrough-config")
    public ResponseEntity<?> getRealmBreakthroughConfig() {
        CfgNumericalRules config = configService.getConfig("realm_breakthrough");
        if (config == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(config.getContent());
    }
}