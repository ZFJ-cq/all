package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "battle_record")
public class BattleRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_id", nullable = false)
    private Long roleId;

    @Column(name = "role_name", length = 50)
    private String roleName;

    @Column(name = "enemy_type", length = 50)
    private String enemyType;

    @Column(name = "enemy_name", length = 50)
    private String enemyName;

    @Column(name = "victory", nullable = false)
    private Boolean victory;

    @Column(name = "role_hp")
    private Integer roleHp;

    @Column(name = "role_attack")
    private Integer roleAttack;

    @Column(name = "role_defense")
    private Integer roleDefense;

    @Column(name = "enemy_hp")
    private Integer enemyHp;

    @Column(name = "enemy_attack")
    private Integer enemyAttack;

    @Column(name = "enemy_defense")
    private Integer enemyDefense;

    @Column(name = "rounds")
    private Integer rounds;

    @Column(name = "xiuwei_change")
    private Integer xiuweiChange;

    @Column(name = "lingshi_change")
    private Integer lingshiChange;

    @Column(name = "hunshi_change")
    private Integer hunshiChange;

    @Column(name = "combat_log", length = 2000)
    private String combatLog;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "create_time", nullable = false)
    private LocalDateTime createTime = LocalDateTime.now();

    public BattleRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public String getEnemyType() { return enemyType; }
    public void setEnemyType(String enemyType) { this.enemyType = enemyType; }

    public String getEnemyName() { return enemyName; }
    public void setEnemyName(String enemyName) { this.enemyName = enemyName; }

    public Boolean getVictory() { return victory; }
    public void setVictory(Boolean victory) { this.victory = victory; }

    public Integer getRoleHp() { return roleHp; }
    public void setRoleHp(Integer roleHp) { this.roleHp = roleHp; }

    public Integer getRoleAttack() { return roleAttack; }
    public void setRoleAttack(Integer roleAttack) { this.roleAttack = roleAttack; }

    public Integer getRoleDefense() { return roleDefense; }
    public void setRoleDefense(Integer roleDefense) { this.roleDefense = roleDefense; }

    public Integer getEnemyHp() { return enemyHp; }
    public void setEnemyHp(Integer enemyHp) { this.enemyHp = enemyHp; }

    public Integer getEnemyAttack() { return enemyAttack; }
    public void setEnemyAttack(Integer enemyAttack) { this.enemyAttack = enemyAttack; }

    public Integer getEnemyDefense() { return enemyDefense; }
    public void setEnemyDefense(Integer enemyDefense) { this.enemyDefense = enemyDefense; }

    public Integer getRounds() { return rounds; }
    public void setRounds(Integer rounds) { this.rounds = rounds; }

    public Integer getXiuweiChange() { return xiuweiChange; }
    public void setXiuweiChange(Integer xiuweiChange) { this.xiuweiChange = xiuweiChange; }

    public Integer getLingshiChange() { return lingshiChange; }
    public void setLingshiChange(Integer lingshiChange) { this.lingshiChange = lingshiChange; }

    public Integer getHunshiChange() { return hunshiChange; }
    public void setHunshiChange(Integer hunshiChange) { this.hunshiChange = hunshiChange; }

    public String getCombatLog() { return combatLog; }
    public void setCombatLog(String combatLog) { this.combatLog = combatLog; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
}
