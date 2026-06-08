class_name AIController
extends Node

var personality: int = 0

enum Personality {
	AGGRESSIVE,
	DEFENSIVE,
	BALANCED,
	CUNNING,
}

func _init(p: int = Personality.BALANCED) -> void:
	personality = p

func execute_play_phase(player: Player) -> void:
	await _use_active_skills(player)
	await _play_equipment(player)

	var attack_count = 0
	var max_attacks = 1
	if player.hero != null:
		for skill in player.hero.skills:
			if skill.effect_script == "san_tou_liu_bi":
				max_attacks = 2
				break
	if player.get_weapon() != null and player.get_weapon().id == "weapon_zhuge":
		max_attacks = 999

	while attack_count < max_attacks:
		var attack_cards = player.hand.get_cards_of_sub_type(GameEnums.CardSubType.ATTACK)
		if attack_cards.is_empty():
			break
		var targets = attack_cards[0].get_valid_targets(player)
		var best_target = _choose_attack_target(player, targets)
		if best_target == null:
			break
		player.hand.remove_card(attack_cards[0])
		ScriptingEngine.execute_effect("attack_effect", player, attack_cards[0], [best_target])
		GameManager.discard_pile.add_card(attack_cards[0])
		attack_count += 1
		await get_tree().create_timer(0.5).timeout

	await _play_scheme_cards(player)

	if player.current_health < player.max_health:
		var peach_cards = player.hand.get_cards_of_sub_type(GameEnums.CardSubType.PEACH)
		if not peach_cards.is_empty():
			player.hand.remove_card(peach_cards[0])
			ScriptingEngine.execute_effect("peach_effect", player, peach_cards[0], [player])
			GameManager.discard_pile.add_card(peach_cards[0])
			await get_tree().create_timer(0.3).timeout

func _use_active_skills(player: Player) -> void:
	if player.hero == null:
		return
	for skill in player.hero.skills:
		if skill.trigger_type == HeroSkill.TriggerType.ACTIVE and player.can_use_skill(skill.skill_name):
			match skill.effect_script:
				"jin_gu_bang":
					var basic_cards = player.hand.get_cards_of_type(GameEnums.CardType.BASIC)
					if not basic_cards.is_empty() and player.hand.get_cards_of_sub_type(GameEnums.CardSubType.ATTACK).is_empty():
						ScriptingEngine.execute_effect(skill.effect_script, player, null, [])
						player.mark_skill_used(skill.skill_name)
						await get_tree().create_timer(0.3).timeout
				"jiang_yao":
					var targets = GameManager.get_alive_players()
					targets.erase(player)
					if not targets.is_empty() and player.hand.size() > 1:
						var target = _choose_attack_target(player, targets)
						if target != null:
							ScriptingEngine.execute_effect(skill.effect_script, player, null, [target])
							player.mark_skill_used(skill.skill_name)
							await get_tree().create_timer(0.3).timeout
				"san_mei_zhen_huo":
					var red_cards: Array = []
					for card in player.hand.get_all_cards():
						if card.is_red:
							red_cards.append(card)
					if not red_cards.is_empty():
						var targets = GameManager.get_alive_players()
						targets.erase(player)
						if not targets.is_empty():
							var target = _choose_attack_target(player, targets)
							if target != null:
								ScriptingEngine.execute_effect(skill.effect_script, player, null, [target])
								player.mark_skill_used(skill.skill_name)
								await get_tree().create_timer(0.3).timeout
				"da_ci":
					var targets: Array = []
					for p in GameManager.get_alive_players():
						if p.current_health < p.max_health:
							targets.append(p)
					if not targets.is_empty():
						var target = targets[randi() % targets.size()]
						ScriptingEngine.execute_effect(skill.effect_script, player, null, [target])
						player.mark_skill_used(skill.skill_name)
						await get_tree().create_timer(0.3).timeout
				"lian_dan":
					if not player.hand.is_empty():
						var targets = GameManager.get_alive_players()
						targets.erase(player)
						if not targets.is_empty():
							var target = targets[randi() % targets.size()]
							ScriptingEngine.execute_effect(skill.effect_script, player, null, [target])
							player.mark_skill_used(skill.skill_name)
							await get_tree().create_timer(0.3).timeout

func _play_equipment(player: Player) -> void:
	var equip_cards = player.hand.get_cards_of_type(GameEnums.CardType.EQUIPMENT)
	for card in equip_cards:
		player.hand.remove_card(card)
		player.equip_card(card)
		await get_tree().create_timer(0.3).timeout

func _play_scheme_cards(player: Player) -> void:
	var scheme_cards = player.hand.get_cards_of_type(GameEnums.CardType.SCHEME)
	for card in scheme_cards:
		if not player.is_alive:
			break
		match card.card_sub_type:
			GameEnums.CardSubType.SCHEME_OUT_OF_NOTHING:
				player.hand.remove_card(card)
				ScriptingEngine.execute_effect("out_of_nothing_effect", player, card, [player])
				GameManager.discard_pile.add_card(card)
				await get_tree().create_timer(0.3).timeout
			GameEnums.CardSubType.SCHEME_BARBARIAN:
				player.hand.remove_card(card)
				var targets = card.get_valid_targets(player)
				ScriptingEngine.execute_effect("barbarian_effect", player, card, targets)
				GameManager.discard_pile.add_card(card)
				await get_tree().create_timer(0.3).timeout
			GameEnums.CardSubType.SCHEME_ARROW_BARRAGE:
				player.hand.remove_card(card)
				var targets = card.get_valid_targets(player)
				ScriptingEngine.execute_effect("arrow_barrage_effect", player, card, targets)
				GameManager.discard_pile.add_card(card)
				await get_tree().create_timer(0.3).timeout
			GameEnums.CardSubType.SCHEME_DEMOLISH:
				var targets = card.get_valid_targets(player)
				if not targets.is_empty():
					var target = _choose_attack_target(player, targets)
					if target != null:
						player.hand.remove_card(card)
						ScriptingEngine.execute_effect("demolish_effect", player, card, [target])
						GameManager.discard_pile.add_card(card)
						await get_tree().create_timer(0.3).timeout
			GameEnums.CardSubType.SCHEME_STEAL:
				var targets = card.get_valid_targets(player)
				if not targets.is_empty():
					var target = targets[randi() % targets.size()]
					player.hand.remove_card(card)
					ScriptingEngine.execute_effect("steal_effect", player, card, [target])
					GameManager.discard_pile.add_card(card)
					await get_tree().create_timer(0.3).timeout
			GameEnums.CardSubType.SCHEME_DUEL:
				var targets = card.get_valid_targets(player)
				if not targets.is_empty():
					var target = _choose_attack_target(player, targets)
					if target != null:
						player.hand.remove_card(card)
						ScriptingEngine.execute_effect("duel_effect", player, card, [target])
						GameManager.discard_pile.add_card(card)
						await get_tree().create_timer(0.3).timeout
			GameEnums.CardSubType.SCHEME_PEACH_GARDEN:
				player.hand.remove_card(card)
				var targets = card.get_valid_targets(player)
				ScriptingEngine.execute_effect("peach_garden_effect", player, card, targets)
				GameManager.discard_pile.add_card(card)
				await get_tree().create_timer(0.3).timeout

func _choose_attack_target(player: Player, targets: Array) -> Player:
	if targets.is_empty():
		return null

	var scored_targets: Array = []
	for target in targets:
		var score = _evaluate_target(player, target)
		scored_targets.append({"player": target, "score": score})

	scored_targets.sort_custom(func(a, b): return a.score > b.score)

	match personality:
		Personality.AGGRESSIVE:
			return scored_targets[0].player
		Personality.DEFENSIVE:
			if randf() < 0.3 and scored_targets.size() > 1:
				return scored_targets[1].player
			return scored_targets[0].player
		_:
			if randf() < 0.2 and scored_targets.size() > 1:
				return scored_targets[1].player
			return scored_targets[0].player

func _evaluate_target(player: Player, target: Player) -> float:
	var score = 0.0

	if IdentityManager.is_enemy(player, target):
		score += 10.0
	elif IdentityManager.is_ally(player, target):
		score -= 20.0

	score += (target.max_health - target.current_health) * 2.0

	if target.current_health <= 1:
		score += 15.0

	if target.identity == GameEnums.Identity.LORD and IdentityManager.is_enemy(player, target):
		score += 8.0

	if target.hand.size() <= 2:
		score += 3.0

	if target.get_weapon() != null:
		score += 2.0

	if player.identity == GameEnums.Identity.SPY:
		var alive_count = GameManager.get_alive_players().size()
		if alive_count <= 2:
			if target.identity == GameEnums.Identity.LORD:
				score += 30.0
		else:
			if target.identity == GameEnums.Identity.REBEL:
				score += 5.0
			elif target.identity == GameEnums.Identity.LOYALIST:
				score += 3.0

	return score

func choose_discard(player: Player, count: int) -> Array:
	var to_discard: Array = []
	var hand_cards = player.hand.get_all_cards().duplicate()

	hand_cards.sort_custom(func(a: Card, b: Card) -> bool:
		return _card_priority(a) < _card_priority(b)
	)

	for i in range(min(count, hand_cards.size())):
		to_discard.append(hand_cards[i])

	return to_discard

func _card_priority(card: Card) -> int:
	match card.card_sub_type:
		GameEnums.CardSubType.DODGE: return 5
		GameEnums.CardSubType.PEACH: return 4
		GameEnums.CardSubType.ATTACK: return 3
		GameEnums.CardSubType.SCHEME_NULLIFICATION: return 2
		_: return 1

func should_respond(player: Player, card_type: GameEnums.CardSubType) -> bool:
	var cards = player.hand.get_cards_of_sub_type(card_type)
	if cards.is_empty():
		return false
	match personality:
		Personality.AGGRESSIVE:
			return true
		Personality.DEFENSIVE:
			return player.current_health <= 2 or randf() < 0.7
		_:
			return randf() < 0.8
