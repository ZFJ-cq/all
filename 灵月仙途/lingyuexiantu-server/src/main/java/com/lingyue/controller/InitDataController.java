package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.*;
import com.lingyue.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/init")
public class InitDataController {
    
    private final BodyCultivationRealmRepository realmRepository;
    private final BodyPartRepository partRepository;
    private final BodyMutationRepository mutationRepository;
    private final BodyCultivationMaterialRepository materialRepository;
    
    public InitDataController(
        BodyCultivationRealmRepository realmRepository,
        BodyPartRepository partRepository,
        BodyMutationRepository mutationRepository,
        BodyCultivationMaterialRepository materialRepository
    ) {
        this.realmRepository = realmRepository;
        this.partRepository = partRepository;
        this.mutationRepository = mutationRepository;
        this.materialRepository = materialRepository;
    }
    
    @PostMapping("/body-cultivation-data")
    public ResponseEntity<String> initBodyCultivationData() {
        if (realmRepository.count() > 0) {
            return new ResponseEntity<>("数据已存在", HttpStatus.OK);
        }
        
        BodyCultivationRealm realm1 = new BodyCultivationRealm();
        realm1.setRealmName("锻体境");
        realm1.setRealmOrder(1);
        realm1.setDescription("锻体初境，打磨肉身");
        realm1.setBaseHpBonus(10);
        realm1.setBaseDefenseBonus(5);
        realm1.setBaseStrengthBonus(3);
        realm1.setBreakthroughSuccessRate(new BigDecimal("90.00"));
        realm1.setRequiredExp(1000L);
        realm1.setPainGrowthRate(new BigDecimal("1.00"));
        realm1.setMutationProbability(new BigDecimal("0.00"));
        realm1.setFailurePenalty("NONE");
        realm1.setStatus(1);
        realmRepository.save(realm1);
        
        BodyCultivationRealm realm2 = new BodyCultivationRealm();
        realm2.setRealmName("淬骨境");
        realm2.setRealmOrder(2);
        realm2.setDescription("淬炼筋骨，脱胎换骨");
        realm2.setBaseHpBonus(30);
        realm2.setBaseDefenseBonus(15);
        realm2.setBaseStrengthBonus(10);
        realm2.setBreakthroughSuccessRate(new BigDecimal("80.00"));
        realm2.setRequiredExp(3000L);
        realm2.setPainGrowthRate(new BigDecimal("1.20"));
        realm2.setMutationProbability(new BigDecimal("2.00"));
        realm2.setFailurePenalty("INJURY");
        realm2.setStatus(1);
        realmRepository.save(realm2);
        
        BodyCultivationRealm realm3 = new BodyCultivationRealm();
        realm3.setRealmName("易筋境");
        realm3.setRealmOrder(3);
        realm3.setDescription("易筋洗髓，百病不侵");
        realm3.setBaseHpBonus(60);
        realm3.setBaseDefenseBonus(30);
        realm3.setBaseStrengthBonus(20);
        realm3.setBreakthroughSuccessRate(new BigDecimal("70.00"));
        realm3.setRequiredExp(8000L);
        realm3.setPainGrowthRate(new BigDecimal("1.50"));
        realm3.setMutationProbability(new BigDecimal("5.00"));
        realm3.setFailurePenalty("ATTR_DECAY");
        realm3.setStatus(1);
        realmRepository.save(realm3);
        
        BodyCultivationRealm realm4 = new BodyCultivationRealm();
        realm4.setRealmName("洗髓境");
        realm4.setRealmOrder(4);
        realm4.setDescription("洗经伐髓，超凡入圣");
        realm4.setBaseHpBonus(120);
        realm4.setBaseDefenseBonus(60);
        realm4.setBaseStrengthBonus(40);
        realm4.setBreakthroughSuccessRate(new BigDecimal("60.00"));
        realm4.setRequiredExp(20000L);
        realm4.setPainGrowthRate(new BigDecimal("2.00"));
        realm4.setMutationProbability(new BigDecimal("10.00"));
        realm4.setFailurePenalty("ATTR_DECAY");
        realm4.setStatus(1);
        realmRepository.save(realm4);
        
        BodyCultivationRealm realm5 = new BodyCultivationRealm();
        realm5.setRealmName("金身境");
        realm5.setRealmOrder(5);
        realm5.setDescription("铸就金身，坚不可摧");
        realm5.setBaseHpBonus(300);
        realm5.setBaseDefenseBonus(150);
        realm5.setBaseStrengthBonus(100);
        realm5.setBreakthroughSuccessRate(new BigDecimal("50.00"));
        realm5.setRequiredExp(50000L);
        realm5.setPainGrowthRate(new BigDecimal("2.50"));
        realm5.setMutationProbability(new BigDecimal("20.00"));
        realm5.setFailurePenalty("INJURY");
        realm5.setStatus(1);
        realmRepository.save(realm5);
        
        BodyCultivationRealm realm6 = new BodyCultivationRealm();
        realm6.setRealmName("不灭境");
        realm6.setRealmOrder(6);
        realm6.setDescription("肉身不灭，与天同寿");
        realm6.setBaseHpBonus(1000);
        realm6.setBaseDefenseBonus(500);
        realm6.setBaseStrengthBonus(300);
        realm6.setBreakthroughSuccessRate(new BigDecimal("40.00"));
        realm6.setRequiredExp(100000L);
        realm6.setPainGrowthRate(new BigDecimal("3.00"));
        realm6.setMutationProbability(new BigDecimal("30.00"));
        realm6.setFailurePenalty("ATTR_DECAY");
        realm6.setStatus(1);
        realmRepository.save(realm6);
        
        String[] partNames = {"头部", "颈部", "躯干", "左臂", "右臂", "左手", "右手", "左腿", "右腿", "双脚"};
        String[] partCodes = {"HEAD", "NECK", "TORSO", "LEFT_ARM", "RIGHT_ARM", "LEFT_HAND", "RIGHT_HAND", "LEFT_LEG", "RIGHT_LEG", "FEET"};
        String[] primaryAttrs = {"精神", "敏捷", "气血", "力量", "力量", "敏捷", "敏捷", "力量", "力量", "敏捷"};
        String[] secondaryAttrs = {"感知", "精神", "防御", "敏捷", "敏捷", "力量", "力量", "敏捷", "敏捷", "力量"};
        int[] baseExps = {100, 80, 150, 100, 100, 60, 60, 120, 120, 80};
        double[] growthRates = {1.2, 1.15, 1.25, 1.2, 1.2, 1.1, 1.1, 1.2, 1.2, 1.15};
        
        for (int i = 0; i < 10; i++) {
            BodyPart part = new BodyPart();
            part.setPartName(partNames[i]);
            part.setPartCode(partCodes[i]);
            part.setDescription(partNames[i] + "部位");
            part.setPrimaryAttr(primaryAttrs[i]);
            part.setSecondaryAttr(secondaryAttrs[i]);
            part.setBaseExpRequirement(baseExps[i]);
            part.setExpGrowthRate(new BigDecimal(String.valueOf(growthRates[i])));
            part.setMaxLevel(50);
            part.setStatus(1);
            partRepository.save(part);
        }
        
        String[] mutationNames = {"钢筋铁骨", "龙象之力", "凤凰涅槃", "金刚不坏", "气血如海", "神速"};
        String[] mutationCodes = {"IRON_BONES", "DRAGON_STRENGTH", "PHOENIX_REBIRTH", "DIAMOND_BODY", "OCEAN_BLOOD", "GOD_SPEED"};
        String[] rarities = {"COMMON", "RARE", "EPIC", "LEGENDARY", "RARE", "EPIC"};
        String[] effectTypes = {"DEFENSE_BOOST", "STRENGTH_BOOST", "AUTO_REVIVE", "ALL_RESIST", "HP_BOOST", "SPEED_BOOST"};
        String[] effectValues = {"defense_multiplier:1.5", "strength_multiplier:1.5", "revive_cooldown:300", "all_resist:50%", "hp_multiplier:2.0", "speed_multiplier:1.8, dodge_rate:30%"};
        
        for (int i = 0; i < 6; i++) {
            BodyMutation mutation = new BodyMutation();
            mutation.setMutationName(mutationNames[i]);
            mutation.setMutationCode(mutationCodes[i]);
            mutation.setDescription(mutationNames[i] + "异变");
            mutation.setRarity(rarities[i]);
            mutation.setEffectType(effectTypes[i]);
            mutation.setEffectValue(effectValues[i]);
            mutation.setStatus(1);
            mutationRepository.save(mutation);
        }
        
        String[] materialNames = {"锻体石", "淬骨草", "易筋花", "洗髓果", "金精", "不灭灵液"};
        String[] materialCodes = {"BODY_STONE", "BONE_HERB", "TENDON_FLOWER", "MARROW_FRUIT", "GOLD_ESSENCE", "IMMORTAL_FLUID"};
        String[] matEffectTypes = {"EXP_BOOST", "BREAKTHROUGH_SUCCESS", "BREAKTHROUGH_SUCCESS", "BREAKTHROUGH_SUCCESS", "PAIN_REDUCE", "EXP_BOOST"};
        String[] matEffectValues = {"exp_multiplier:1.2", "success_rate_bonus:10%", "success_rate_bonus:20%", "success_rate_bonus:30%", "pain_reduction:50", "exp_multiplier:2.0"};
        double[] dropRates = {30.0, 20.0, 10.0, 5.0, 2.0, 1.0};
        
        for (int i = 0; i < 6; i++) {
            BodyCultivationMaterial material = new BodyCultivationMaterial();
            material.setMaterialName(materialNames[i]);
            material.setMaterialCode(materialCodes[i]);
            material.setMaterialType(matEffectTypes[i]);
            material.setEffectDescription(matEffectValues[i]);
            material.setRarity("COMMON");
            material.setDropRate(new BigDecimal(String.valueOf(dropRates[i])).divide(new BigDecimal("100")));
            material.setStatus(1);
            materialRepository.save(material);
        }
        
        return new ResponseEntity<>("锻体系统初始化数据成功！", HttpStatus.OK);
    }
}
