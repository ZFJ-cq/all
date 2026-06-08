package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_role", indexes = {
    @Index(name = "idx_game_role_user_id", columnList = "user_id"),
    @Index(name = "idx_game_role_realm", columnList = "realm"),
    @Index(name = "idx_game_role_status", columnList = "status")
})
public class GameRole {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "role_name", nullable = false)
    private String roleName;
    
    private Integer gender;
    
    private String realm;
    
    @Column(name = "realm_level")
    private Integer realmLevel = 1;
    
    @Column(name = "last_online_time")
    private LocalDateTime lastOnlineTime;
    
    @Column(name = "last_cultivation_time")
    private LocalDateTime lastCultivationTime;
    
    @Column(name = "walk_fire_until")
    private LocalDateTime walkFireUntil;
    
    @Column(name = "consecutive_breakthrough_failures")
    private Integer consecutiveBreakthroughFailures = 0;
    
    private Integer level;
    
    private Integer hp;
    
    private Integer mp;
    
    @Column(name = "spirit_root")
    private String spiritRoot;
    
    @Column(name = "origin")
    private String origin;
    
    private String avatar;
    
    @Column(name = "body_level")
    private String bodyLevel;
    
    @Column(name = "body_strength")
    private Integer bodyStrength;
    
    @Column(name = "age")
    private Integer age;
    
    @Column(name = "max_age")
    private Integer maxAge;
    
    @Column(name = "life_status")
    private Integer lifeStatus;
    
    @Column(name = "death_time")
    private LocalDateTime deathTime;
    
    @Column(name = "reincarnation_count")
    private Integer reincarnationCount;
    
    @Column(name = "cultivation_base")
    private Double cultivationBase;
    
    @Column(name = "longevity_bonus")
    private Integer longevityBonus;
    
    @Column(name = "create_time")
    private LocalDateTime createTime;
    
    private Integer status = 1; // 1-启用，0-禁用
    
    public GameRole() {
    }
    
    public GameRole(Long id, Long userId, String roleName, Integer gender, String realm, Integer level, Integer hp, Integer mp, String spiritRoot, String avatar, String bodyLevel, Integer bodyStrength, LocalDateTime createTime, Integer status) {
        this.id = id;
        this.userId = userId;
        this.roleName = roleName;
        this.gender = gender;
        this.realm = realm;
        this.level = level;
        this.hp = hp;
        this.mp = mp;
        this.spiritRoot = spiritRoot;
        this.avatar = avatar;
        this.bodyLevel = bodyLevel;
        this.bodyStrength = bodyStrength;
        this.createTime = createTime;
        this.status = status;
        this.age = 18;
        this.maxAge = 100;
        this.lifeStatus = 0;
        this.reincarnationCount = 0;
        this.cultivationBase = 1.0;
        this.longevityBonus = 0;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getRoleName() {
        return roleName;
    }
    
    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
    
    public Integer getGender() {
        return gender;
    }
    
    public void setGender(Integer gender) {
        this.gender = gender;
    }
    
    public String getRealm() {
        return realm;
    }
    
    public void setRealm(String realm) {
        this.realm = realm;
    }
    
    public Integer getRealmLevel() {
        return realmLevel;
    }
    
    public void setRealmLevel(Integer realmLevel) {
        this.realmLevel = realmLevel;
    }
    
    public LocalDateTime getLastOnlineTime() {
        return lastOnlineTime;
    }
    
    public void setLastOnlineTime(LocalDateTime lastOnlineTime) {
        this.lastOnlineTime = lastOnlineTime;
    }
    
    public LocalDateTime getLastCultivationTime() {
        return lastCultivationTime;
    }
    
    public void setLastCultivationTime(LocalDateTime lastCultivationTime) {
        this.lastCultivationTime = lastCultivationTime;
    }
    
    public LocalDateTime getWalkFireUntil() {
        return walkFireUntil;
    }
    
    public void setWalkFireUntil(LocalDateTime walkFireUntil) {
        this.walkFireUntil = walkFireUntil;
    }
    
    public Integer getConsecutiveBreakthroughFailures() {
        return consecutiveBreakthroughFailures;
    }
    
    public void setConsecutiveBreakthroughFailures(Integer consecutiveBreakthroughFailures) {
        this.consecutiveBreakthroughFailures = consecutiveBreakthroughFailures;
    }
    
    public Integer getLevel() {
        return level;
    }
    
    public void setLevel(Integer level) {
        this.level = level;
    }
    
    public Integer getHp() {
        return hp;
    }
    
    public void setHp(Integer hp) {
        this.hp = hp;
    }
    
    public Integer getMp() {
        return mp;
    }
    
    public void setMp(Integer mp) {
        this.mp = mp;
    }
    
    public String getSpiritRoot() {
        return spiritRoot;
    }
    
    public void setSpiritRoot(String spiritRoot) {
        this.spiritRoot = spiritRoot;
    }
    
    public String getOrigin() {
        return origin;
    }
    
    public void setOrigin(String origin) {
        this.origin = origin;
    }
    
    public String getAvatar() {
        return avatar;
    }
    
    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
    
    public String getBodyLevel() {
        return bodyLevel;
    }
    
    public void setBodyLevel(String bodyLevel) {
        this.bodyLevel = bodyLevel;
    }
    
    public Integer getBodyStrength() {
        return bodyStrength;
    }
    
    public void setBodyStrength(Integer bodyStrength) {
        this.bodyStrength = bodyStrength;
    }
    
    public LocalDateTime getCreateTime() {
        return createTime;
    }
    
    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }
    
    public Integer getStatus() {
        return status;
    }
    
    public void setStatus(Integer status) {
        this.status = status;
    }
    
    public Integer getAge() {
        return age;
    }
    
    public void setAge(Integer age) {
        this.age = age;
    }
    
    public Integer getMaxAge() {
        return maxAge;
    }
    
    public void setMaxAge(Integer maxAge) {
        this.maxAge = maxAge;
    }
    
    public Integer getLifeStatus() {
        return lifeStatus;
    }
    
    public void setLifeStatus(Integer lifeStatus) {
        this.lifeStatus = lifeStatus;
    }
    
    public LocalDateTime getDeathTime() {
        return deathTime;
    }
    
    public void setDeathTime(LocalDateTime deathTime) {
        this.deathTime = deathTime;
    }
    
    public Integer getReincarnationCount() {
        return reincarnationCount;
    }
    
    public void setReincarnationCount(Integer reincarnationCount) {
        this.reincarnationCount = reincarnationCount;
    }
    
    public Double getCultivationBase() {
        return cultivationBase;
    }
    
    public void setCultivationBase(Double cultivationBase) {
        this.cultivationBase = cultivationBase;
    }
    
    public Integer getLongevityBonus() {
        return longevityBonus;
    }
    
    public void setLongevityBonus(Integer longevityBonus) {
        this.longevityBonus = longevityBonus;
    }
}