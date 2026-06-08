extends Node

func _ready() -> void:
	EventBus.damage_dealt.connect(_on_damage_dealt)
	EventBus.damage_prevented.connect(_on_damage_prevented)

func _on_damage_dealt(source: Player, target: Player, amount: int, damage_type: GameEnums.CardSubType) -> void:
	if source == null:
		return
	if source.hero != null:
		for skill in source.hero.skills:
			if skill.trigger_type == HeroSkill.TriggerType.ON_DAMAGE_DEALT:
				if skill.effect_script == "hua_shi":
					ScriptingEngine.execute_effect(skill.effect_script, source, null, [], {"damage": amount})
				elif skill.effect_script == "xi_xue":
					ScriptingEngine.execute_effect(skill.effect_script, source, null, [], {"damage": amount})

	if target.hero != null:
		for skill in target.hero.skills:
			if skill.trigger_type == HeroSkill.TriggerType.ON_DAMAGE_RECEIVED:
				if skill.effect_script == "qi_shi_er_bian" and target.can_use_skill("七十二变"):
					ScriptingEngine.execute_effect(skill.effect_script, target, null, [], {"damage": amount})
				elif skill.effect_script == "tan_chi":
					ScriptingEngine.execute_effect(skill.effect_script, target, null, [], {"damage": amount})
				elif skill.effect_script == "hou_pi":
					ScriptingEngine.execute_effect(skill.effect_script, target, null, [], {"damage": amount})

func _on_damage_prevented(target: Player, amount: int, reason: String) -> void:
	pass

func resolve_attack(source: Player, target: Player, attack_card: Card) -> Dictionary:
	var result = ScriptingEngine.execute_effect("attack_effect", source, attack_card, [target])
	return result

func resolve_duel(initiator: Player, target: Player, duel_card: Card) -> Dictionary:
	var result = ScriptingEngine.execute_effect("duel_effect", initiator, duel_card, [target])
	return result

func resolve_barbarian(source: Player, card: Card) -> Dictionary:
	var targets = card.get_valid_targets(source)
	var result = ScriptingEngine.execute_effect("barbarian_effect", source, card, targets)
	return result

func resolve_arrow_barrage(source: Player, card: Card) -> Dictionary:
	var targets = card.get_valid_targets(source)
	var result = ScriptingEngine.execute_effect("arrow_barrage_effect", source, card, targets)
	return result

func resolve_peach_garden(source: Player, card: Card) -> Dictionary:
	var targets = card.get_valid_targets(source)
	var result = ScriptingEngine.execute_effect("peach_garden_effect", source, card, targets)
	return result

func check_death(player: Player) -> bool:
	if player.current_health <= 0:
		player.is_dying = true
		return true
	return false

func attempt_save(player: Player) -> bool:
	var saved = false
	var all_players = GameManager.get_alive_players()
	for p in all_players:
		var peach_cards = p.hand.get_cards_of_sub_type(GameEnums.CardSubType.PEACH)
		if not peach_cards.is_empty():
			var peach = peach_cards[0]
			p.hand.remove_card(peach)
			GameManager.discard_pile.add_card(peach)
			player.heal(1, p)
			if player.current_health > 0:
				saved = true
				break
	return saved
