class_name HeroData
extends Resource

@export var hero_id: String = ""
@export var hero_name: String = ""
@export var hero_title: String = ""
@export var faction: GameEnums.HeroFaction = GameEnums.HeroFaction.TANG_MONK_PARTY
@export var base_health: int = 4
@export var is_male: bool = true
@export var description: String = ""
@export var skills: Array = []

func get_skill(skill_name: String) -> HeroSkill:
	for skill in skills:
		if skill.skill_name == skill_name:
			return skill
	return null

func get_skill_count() -> int:
	return skills.size()

func get_skill_names() -> Array:
	var names: Array = []
	for skill in skills:
		names.append(skill.skill_name)
	return names
