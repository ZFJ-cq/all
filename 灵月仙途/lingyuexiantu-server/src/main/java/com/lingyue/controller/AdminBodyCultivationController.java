package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.BodyCultivationRealm;
import com.lingyue.entity.BodyPart;
import com.lingyue.entity.BodyMutation;
import com.lingyue.entity.BodyCultivationMaterial;
import com.lingyue.repository.BodyCultivationRealmRepository;
import com.lingyue.repository.BodyPartRepository;
import com.lingyue.repository.BodyMutationRepository;
import com.lingyue.repository.BodyCultivationMaterialRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 锻体系统后台管理 Controller
 */
@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/admin/body-cultivation")
public class AdminBodyCultivationController {
    
    private final BodyCultivationRealmRepository realmRepository;
    private final BodyPartRepository partRepository;
    private final BodyMutationRepository mutationRepository;
    private final BodyCultivationMaterialRepository materialRepository;
    
    public AdminBodyCultivationController(
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
    
    // ========== 境界管理 ==========
    
    @GetMapping("/realms")
    public ResponseEntity<List<BodyCultivationRealm>> getAllRealms() {
        return new ResponseEntity<>(realmRepository.findAll(), HttpStatus.OK);
    }
    
    @PostMapping("/realms")
    public ResponseEntity<BodyCultivationRealm> createRealm(@RequestBody BodyCultivationRealm realm) {
        realm.setStatus(1);
        return new ResponseEntity<>(realmRepository.save(realm), HttpStatus.CREATED);
    }
    
    @PutMapping("/realms/{id}")
    public ResponseEntity<BodyCultivationRealm> updateRealm(
            @PathVariable Long id,
            @RequestBody BodyCultivationRealm realm) {
        realm.setId(id);
        return new ResponseEntity<>(realmRepository.save(realm), HttpStatus.OK);
    }
    
    @DeleteMapping("/realms/{id}")
    public ResponseEntity<Void> deleteRealm(@PathVariable Long id) {
        realmRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    @PatchMapping("/realms/{id}/config")
    public ResponseEntity<BodyCultivationRealm> updateRealmConfig(
            @PathVariable Long id,
            @RequestBody Map<String, Object> config) {
        BodyCultivationRealm realm = realmRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("境界不存在"));
        
        if (config.containsKey("breakthroughSuccessRate")) {
            realm.setBreakthroughSuccessRate(new BigDecimal(config.get("breakthroughSuccessRate").toString()));
        }
        if (config.containsKey("mutationProbability")) {
            realm.setMutationProbability(new BigDecimal(config.get("mutationProbability").toString()));
        }
        if (config.containsKey("painGrowthRate")) {
            realm.setPainGrowthRate(new BigDecimal(config.get("painGrowthRate").toString()));
        }
        if (config.containsKey("requiredExp")) {
            realm.setRequiredExp(Long.valueOf(config.get("requiredExp").toString()));
        }
        
        return new ResponseEntity<>(realmRepository.save(realm), HttpStatus.OK);
    }
    
    // ========== 部位管理 ==========
    
    @GetMapping("/parts")
    public ResponseEntity<List<BodyPart>> getAllParts() {
        return new ResponseEntity<>(partRepository.findAll(), HttpStatus.OK);
    }
    
    @PostMapping("/parts")
    public ResponseEntity<BodyPart> createPart(@RequestBody BodyPart part) {
        part.setStatus(1);
        return new ResponseEntity<>(partRepository.save(part), HttpStatus.CREATED);
    }
    
    @PutMapping("/parts/{id}")
    public ResponseEntity<BodyPart> updatePart(
            @PathVariable Long id,
            @RequestBody BodyPart part) {
        part.setId(id);
        return new ResponseEntity<>(partRepository.save(part), HttpStatus.OK);
    }
    
    @DeleteMapping("/parts/{id}")
    public ResponseEntity<Void> deletePart(@PathVariable Long id) {
        partRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    /**
     * 初始化部位数据（四肢和五脏）
     */
    @PostMapping("/parts/init")
    public ResponseEntity<String> initParts() {
        try {
            // 删除所有现有部位
            partRepository.deleteAll();
            
            // 创建四肢
            BodyPart limbs = new BodyPart();
            limbs.setPartName("四肢");
            limbs.setPartCode("LIMBS");
            limbs.setDescription("双手双足，力量之源");
            limbs.setPrimaryAttr("力量");
            limbs.setSecondaryAttr("敏捷");
            limbs.setBaseExpRequirement(100);
            limbs.setExpGrowthRate(new BigDecimal("1.2"));
            limbs.setMaxLevel(50);
            limbs.setStatus(1);
            limbs.setSortOrder(1);
            
            // 创建五脏
            BodyPart organs = new BodyPart();
            organs.setPartName("五脏");
            organs.setPartCode("ORGANS");
            organs.setDescription("心肝脾肺肾，生命之本");
            organs.setPrimaryAttr("气血");
            organs.setSecondaryAttr("精神");
            organs.setBaseExpRequirement(150);
            organs.setExpGrowthRate(new BigDecimal("1.25"));
            organs.setMaxLevel(50);
            organs.setStatus(1);
            organs.setSortOrder(2);
            
            partRepository.save(limbs);
            partRepository.save(organs);
            
            return new ResponseEntity<>("部位初始化成功：四肢、五脏", HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("部位初始化失败：" + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ========== 异变管理 ==========
    
    @GetMapping("/mutations")
    public ResponseEntity<List<BodyMutation>> getAllMutations() {
        return new ResponseEntity<>(mutationRepository.findAll(), HttpStatus.OK);
    }
    
    @PostMapping("/mutations")
    public ResponseEntity<BodyMutation> createMutation(@RequestBody BodyMutation mutation) {
        mutation.setStatus(1);
        return new ResponseEntity<>(mutationRepository.save(mutation), HttpStatus.CREATED);
    }
    
    @PutMapping("/mutations/{id}")
    public ResponseEntity<BodyMutation> updateMutation(
            @PathVariable Long id,
            @RequestBody BodyMutation mutation) {
        mutation.setId(id);
        return new ResponseEntity<>(mutationRepository.save(mutation), HttpStatus.OK);
    }
    
    @DeleteMapping("/mutations/{id}")
    public ResponseEntity<Void> deleteMutation(@PathVariable Long id) {
        mutationRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    // ========== 材料管理 ==========
    
    @GetMapping("/materials")
    public ResponseEntity<List<BodyCultivationMaterial>> getAllMaterials() {
        return new ResponseEntity<>(materialRepository.findAll(), HttpStatus.OK);
    }
    
    @PostMapping("/materials")
    public ResponseEntity<BodyCultivationMaterial> createMaterial(@RequestBody BodyCultivationMaterial material) {
        material.setStatus(1);
        return new ResponseEntity<>(materialRepository.save(material), HttpStatus.CREATED);
    }
    
    @PutMapping("/materials/{id}")
    public ResponseEntity<BodyCultivationMaterial> updateMaterial(
            @PathVariable Long id,
            @RequestBody BodyCultivationMaterial material) {
        material.setId(id);
        return new ResponseEntity<>(materialRepository.save(material), HttpStatus.OK);
    }
    
    @DeleteMapping("/materials/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        materialRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    @PatchMapping("/materials/{id}/drop-rate")
    public ResponseEntity<BodyCultivationMaterial> updateDropRate(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> data) {
        BodyCultivationMaterial material = materialRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("材料不存在"));
        
        if (data.containsKey("dropRate")) {
            material.setDropRate(data.get("dropRate"));
        }
        
        return new ResponseEntity<>(materialRepository.save(material), HttpStatus.OK);
    }
}
