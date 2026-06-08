class_name HeroSkill
extends Resource

enum TriggerType {
	ON_PLAY_CARD,
	ON_DAMAGE_RECEIVED,
	ON_DAMAGE_DEALT,
	ON_HEAL_RECEIVED,
	ON_TURN_START,
	ON_TURN_END,
	ON_DRAW,
	ON_DISCARD,
	ON_CARD_TARGETED,
	ON_JUDGE,
	ON_EQUIP,
	ON_DEATH,
	ON_REVIVE,
	ON_OTHER_DEATH,
	PASSIVE,
	ACTIVE,
}

enum SkillType {
	NORMAL,
	AWAKENED,
	LIMITED,
	LOCKED,
}

@export var skill_name: String = ""
@export var skill_description: String = ""
@export var trigger_type: TriggerType = TriggerType.PASSIVE
@export var skill_type: SkillType = SkillType.NORMAL
@export var once_per_turn: bool = false
@export var once_per_round: bool = false
@export var effect_script: String = ""
@export var conditions: Dictionary = {}
