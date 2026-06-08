extends Node

var _effect_handlers: Dictionary = {}
var _pending_effects: Array = []
var _is_resolving: bool = false

signal effect_resolved(effect_name: String, result: Dictionary)
signal effect_failed(effect_name: String, reason: String)

func _ready() -> void:
	_register_builtin_effects()

func _register_builtin_effects() -> void:
	_effect_handlers["attack_effect"] = _effect_attack
	_effect_handlers["dodge_effect"] = _effect_dodge
	_effect_handlers["peach_effect"] = _effect_peach
	_effect_handlers["out_of_nothing_effect"] = _effect_out_of_nothing
	_effect_handlers["duel_effect"] = _effect_duel
	_effect_handlers["barbarian_effect"] = _effect_barbarian
	_effect_handlers["arrow_barrage_effect"] = _effect_arrow_barrage
	_effect_handlers["peach_garden_effect"] = _effect_peach_garden
	_effect_handlers["demolish_effect"] = _effect_demolish
	_effect_handlers["steal_effect"] = _effect_steal
	_effect_handlers["borrow_knife_effect"] = _effect_borrow_knife
	_effect_handlers["lightning_effect"] = _effect_lightning
	_effect_handlers["nullification_effect"] = _effect_nullification

	_effect_handlers["weapon_zhuge_effect"] = _effect_weapon_zhuge
	_effect_handlers["weapon_qinggang_effect"] = _effect_weapon_qinggang
	_effect_handlers["weapon_zhangba_effect"] = _effect_weapon_zhangba
	_effect_handlers["weapon_qinglong_effect"] = _effect_weapon_qinglong
	_effect_handlers["weapon_guanjiao_effect"] = _effect_weapon_guanjiao
	_effect_handlers["weapon_fangtian_effect"] = _effect_weapon_fangtian
	_effect_handlers["armor_bagua_effect"] = _effect_armor_bagua
	_effect_handlers["armor_renwang_effect"] = _effect_armor_renwang
	_effect_handlers["mount_offensive_effect"] = _effect_mount_offensive
	_effect_handlers["mount_defensive_effect"] = _effect_mount_defensive

	_effect_handlers["jin_gu_bang"] = _skill_jin_gu_bang
	_effect_handlers["jin_dou_yun"] = _skill_jin_dou_yun
	_effect_handlers["qi_shi_er_bian"] = _skill_qi_shi_er_bian
	_effect_handlers["jin_gu_zhou"] = _skill_jin_gu_zhou
	_effect_handlers["ci_bei"] = _skill_ci_bei
	_effect_handlers["tan_chi"] = _skill_tan_chi
	_effect_handlers["hou_pi"] = _skill_hou_pi
	_effect_handlers["tiao_dan"] = _skill_tiao_dan
	_effect_handlers["jiang_yao"] = _skill_jiang_yao
	_effect_handlers["long_hun"] = _skill_long_hun
	_effect_handlers["hua_shen"] = _skill_hua_shen
	_effect_handlers["li_jian"] = _skill_li_jian
	_effect_handlers["hua_shi"] = _skill_hua_shi
	_effect_handlers["man_li"] = _skill_man_li
	_effect_handlers["cheng_xiong"] = _skill_cheng_xiong
	_effect_handlers["san_mei_zhen_huo"] = _skill_san_mei_zhen_huo
	_effect_handlers["ba_jiao_shan"] = _skill_ba_jiao_shan
	_effect_handlers["shan_feng"] = _skill_shan_feng
	_effect_handlers["zhu_wang"] = _skill_zhu_wang
	_effect_handlers["xi_xue"] = _skill_xi_xue
	_effect_handlers["tian_yan"] = _skill_tian_yan
	_effect_handlers["xiao_tian_quan"] = _skill_xiao_tian_quan
	_effect_handlers["feng_huo_lun"] = _skill_feng_huo_lun
	_effect_handlers["san_tou_liu_bi"] = _skill_san_tou_liu_bi
	_effect_handlers["lian_hua_hua_shen"] = _skill_lian_hua_hua_shen
	_effect_handlers["da_ci"] = _skill_da_ci
	_effect_handlers["jing_ping"] = _skill_jing_ping
	_effect_handlers["lian_dan"] = _skill_lian_dan
	_effect_handlers["jin_dan"] = _skill_jin_dan
	_effect_handlers["xi_xing"] = _skill_xi_xing

func execute_effect(effect_name: String, source: Player, card: Card, targets: Array, context: Dictionary = {}) -> Dictionary:
	if _effect_handlers.has(effect_name):
		var handler = _effect_handlers[effect_name]
		var result = handler.call(source, card, targets, context)
		if result is Dictionary:
			effect_resolved.emit(effect_name, result)
			return result
		return {"success": true}
	effect_failed.emit(effect_name, "未注册的效果: " + effect_name)
	return {"success": false, "reason": "未注册的效果"}

func register_effect(effect_name: String, handler: Callable) -> void:
	_effect_handlers[effect_name] = handler

func _try_auto_respond_dodge(target: Player) -> bool:
	var dodge_cards = target.hand.get_cards_of_sub_type(GameEnums.CardSubType.DODGE)
	if dodge_cards.is_empty():
		return false
	var dodge_card = dodge_cards[0]
	target.hand.remove_card(dodge_card)
	GameManager.discard_pile.add_card(dodge_card)
	EventBus.card_played.emit(dodge_card, target, [])
	return true

func _effect_attack(source: Player, card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": false, "reason": "无目标"}
	var target = targets[0] as Player
	source.use_attack()
	EventBus.card_played.emit(card, source, targets)

	var dodged = _try_auto_respond_dodge(target)

	if dodged:
		EventBus.damage_prevented.emit(target, 1, "闪")
		return {"success": true, "dodged": true}
	else:
		var damage_amount = 1
		if source.hero != null:
			for skill in source.hero.skills:
				if skill.effect_script == "man_li" and skill.skill_type == HeroSkill.SkillType.LOCKED:
					damage_amount = 2
					break
		target.take_damage(damage_amount, source)
		return {"success": true, "damage": damage_amount, "dodged": false}

func _effect_dodge(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true}

func _effect_peach(source: Player, card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	var target = source
	if not targets.is_empty():
		target = targets[0] as Player
	EventBus.card_played.emit(card, source, [target])
	var heal_amount = 1
	if source.hero != null:
		for skill in source.hero.skills:
			if skill.effect_script == "jing_ping" and skill.skill_type == HeroSkill.SkillType.LOCKED:
				heal_amount = 2
				break
	var actual = target.heal(heal_amount, source)
	return {"success": true, "healed": actual}

func _effect_out_of_nothing(source: Player, card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	EventBus.card_played.emit(card, source, [source])
	var drawn = GameManager.draw_cards(source, 2)
	return {"success": true, "cards_drawn": drawn.size()}

func _effect_duel(source: Player, card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": false, "reason": "无目标"}
	var target = targets[0] as Player
	EventBus.card_played.emit(card, source, targets)

	var current_attacker = target
	var current_defender = source

	for _i in range(100):
		var attack_cards = current_attacker.hand.get_cards_of_sub_type(GameEnums.CardSubType.ATTACK)
		if attack_cards.is_empty():
			current_attacker.take_damage(1, current_defender)
			return {"success": true, "loser": current_attacker, "winner": current_defender}
		var played_card = attack_cards[0]
		current_attacker.hand.remove_card(played_card)
		GameManager.discard_pile.add_card(played_card)
		EventBus.card_played.emit(played_card, current_attacker, [current_defender])

		var temp = current_attacker
		current_attacker = current_defender
		current_defender = temp

	return {"success": true, "draw": true}

func _effect_barbarian(source: Player, card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	EventBus.card_played.emit(card, source, targets)
	var results: Array = []
	for target in targets:
		var t = target as Player
		if not t.is_alive:
			continue
		var attack_cards = t.hand.get_cards_of_sub_type(GameEnums.CardSubType.ATTACK)
		if attack_cards.is_empty():
			t.take_damage(1, source)
			results.append({"player": t, "played_attack": false})
		else:
			var played = attack_cards[0]
			t.hand.remove_card(played)
			GameManager.discard_pile.add_card(played)
			EventBus.card_played.emit(played, t, [])
			results.append({"player": t, "played_attack": true})
	return {"success": true, "results": results}

func _effect_arrow_barrage(source: Player, card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	EventBus.card_played.emit(card, source, targets)
	var results: Array = []
	for target in targets:
		var t = target as Player
		if not t.is_alive:
			continue
		var dodge_cards = t.hand.get_cards_of_sub_type(GameEnums.CardSubType.DODGE)
		if dodge_cards.is_empty():
			t.take_damage(1, source)
			results.append({"player": t, "played_dodge": false})
		else:
			var played = dodge_cards[0]
			t.hand.remove_card(played)
			GameManager.discard_pile.add_card(played)
			EventBus.card_played.emit(played, t, [])
			results.append({"player": t, "played_dodge": true})
	return {"success": true, "results": results}

func _effect_peach_garden(source: Player, card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	EventBus.card_played.emit(card, source, targets)
	var results: Array = []
	for target in targets:
		var t = target as Player
		if t.is_alive and t.current_health < t.max_health:
			var healed = t.heal(1, source)
			results.append({"player": t, "healed": healed})
	return {"success": true, "results": results}

func _effect_demolish(source: Player, card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": false, "reason": "无目标"}
	var target = targets[0] as Player
	EventBus.card_played.emit(card, source, targets)
	var total_cards: Array = []
	for c in target.hand.get_all_cards():
		total_cards.append({"card": c, "source": "hand"})
	for slot in target.equipment:
		if target.equipment[slot] != null:
			total_cards.append({"card": target.equipment[slot], "source": "equipment"})
	if total_cards.is_empty():
		return {"success": true, "discarded": false}
	var chosen = total_cards[randi() % total_cards.size()]
	if chosen.source == "hand":
		target.hand.remove_card(chosen.card)
	else:
		target.unequip_slot(int(chosen.source))
	GameManager.discard_pile.add_card(chosen.card)
	EventBus.card_discarded.emit(chosen.card, target)
	return {"success": true, "discarded": true, "card": chosen.card}

func _effect_steal(source: Player, card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": false, "reason": "无目标"}
	var target = targets[0] as Player
	EventBus.card_played.emit(card, source, targets)
	var total_cards: Array = []
	for c in target.hand.get_all_cards():
		total_cards.append({"card": c, "source": "hand"})
	for slot in target.equipment:
		if target.equipment[slot] != null:
			total_cards.append({"card": target.equipment[slot], "source": "equipment"})
	if total_cards.is_empty():
		return {"success": true, "stolen": false}
	var chosen = total_cards[randi() % total_cards.size()]
	if chosen.source == "hand":
		target.hand.remove_card(chosen.card)
	else:
		target.unequip_slot(int(chosen.source))
	source.hand.add_card(chosen.card)
	return {"success": true, "stolen": true, "card": chosen.card}

func _effect_borrow_knife(source: Player, card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": false, "reason": "无目标"}
	var target = targets[0] as Player
	EventBus.card_played.emit(card, source, targets)
	if target.get_weapon() == null:
		return {"success": false, "reason": "目标没有武器"}
	var attack_cards = target.hand.get_cards_of_sub_type(GameEnums.CardSubType.ATTACK)
	if attack_cards.is_empty():
		var weapon = target.unequip_slot(GameEnums.EquipmentSlot.WEAPON)
		source.hand.add_card(weapon)
		return {"success": true, "got_weapon": true}
	else:
		var attack_card = attack_cards[0]
		target.hand.remove_card(attack_card)
		var attack_targets = attack_card.get_valid_targets(target)
		if not attack_targets.is_empty():
			ScriptingEngine.execute_effect("attack_effect", target, attack_card, [attack_targets[0]])
		return {"success": true, "got_weapon": false}

func _effect_lightning(source: Player, card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": false, "reason": "无目标"}
	var target = targets[0] as Player
	EventBus.card_played.emit(card, source, targets)
	target.judge_area.append(card)
	return {"success": true, "placed": true}

func _effect_nullification(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "nullified": true}

func _effect_weapon_zhuge(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "unlimited_attacks": true}

func _effect_weapon_qinggang(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "ignore_armor": true}

func _effect_weapon_zhangba(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "cards_as_attack": true}

func _effect_weapon_qinglong(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "follow_up_attack": true}

func _effect_weapon_guanjiao(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "force_hit": true}

func _effect_weapon_fangtian(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "multi_target": true}

func _effect_armor_bagua(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "judge_dodge": true}

func _effect_armor_renwang(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "block_black_attack": true}

func _effect_mount_offensive(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "distance_minus_one": true}

func _effect_mount_defensive(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "distance_plus_one": true}

func _skill_jin_gu_bang(source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	if source.hand.is_empty():
		return {"success": false, "reason": "没有手牌"}
	var basic_cards = source.hand.get_cards_of_type(GameEnums.CardType.BASIC)
	if basic_cards.is_empty():
		return {"success": false, "reason": "没有基本牌"}
	var chosen = basic_cards[0]
	source.hand.remove_card(chosen)
	var attack = CardDatabase.get_card_template("attack_0")
	attack.suit = chosen.suit
	attack.number = chosen.number
	attack.is_red = chosen.is_red
	source.hand.add_card(attack)
	return {"success": true, "converted": true}

func _skill_jin_dou_yun(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "distance_minus_one": true}

func _skill_qi_shi_er_bian(source: Player, _card: Card, _targets: Array, context: Dictionary) -> Dictionary:
	if not source.is_dying and context.get("damage", 0) <= 0:
		return {"success": false, "reason": "未受到伤害"}
	if source.hand.is_empty():
		return {"success": false, "reason": "没有手牌可弃"}
	var discarded = source.hand.remove_at(0)
	GameManager.discard_pile.add_card(discarded)
	EventBus.damage_prevented.emit(source, context.get("damage", 1), "七十二变")
	return {"success": true, "damage_prevented": true}

func _skill_jin_gu_zhou(source: Player, _card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": false, "reason": "无目标"}
	var target = targets[0] as Player
	target.set_meta("silenced_until_turn", TurnManager.current_turn + 1)
	return {"success": true, "silenced": true}

func _skill_ci_bei(source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	var drawn = GameManager.draw_cards(source, 1)
	return {"success": true, "cards_drawn": drawn.size()}

func _skill_tan_chi(source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	var drawn = GameManager.draw_cards(source, 2)
	return {"success": true, "cards_drawn": drawn.size()}

func _skill_hou_pi(source: Player, _card: Card, _targets: Array, context: Dictionary) -> Dictionary:
	if source.get_meta("hou_pi_used_this_turn", false):
		context["damage"] = context.get("damage", 1)
		return {"success": false, "reason": "本回合已使用"}
	source.set_meta("hou_pi_used_this_turn", true)
	return {"success": true, "damage_reduction": 1}

func _skill_tiao_dan(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "hand_limit_bonus": 2}

func _skill_jiang_yao(source: Player, _card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": false, "reason": "无目标"}
	if source.hand.is_empty():
		return {"success": false, "reason": "没有手牌可弃"}
	var discarded = source.hand.remove_at(0)
	GameManager.discard_pile.add_card(discarded)
	var target = targets[0] as Player
	target.take_damage(1, source)
	return {"success": true, "damage": 1}

func _skill_long_hun(source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	var red_cards: Array = []
	var black_cards: Array = []
	for c in source.hand.get_all_cards():
		if c.is_red:
			red_cards.append(c)
		else:
			black_cards.append(c)
	if not red_cards.is_empty():
		var chosen = red_cards[0]
		source.hand.remove_card(chosen)
		var peach = CardDatabase.get_card_template("peach_0")
		peach.suit = chosen.suit
		peach.number = chosen.number
		source.hand.add_card(peach)
	if not black_cards.is_empty():
		var chosen = black_cards[0]
		source.hand.remove_card(chosen)
		var attack = CardDatabase.get_card_template("attack_0")
		attack.suit = chosen.suit
		attack.number = chosen.number
		source.hand.add_card(attack)
	return {"success": true}

func _skill_hua_shen(source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	if source.hand.is_empty():
		return {"success": false, "reason": "没有手牌可弃"}
	var discarded = source.hand.remove_at(0)
	GameManager.discard_pile.add_card(discarded)
	return {"success": true, "redirect": true}

func _skill_li_jian(source: Player, _card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.size() < 2:
		return {"success": false, "reason": "需要两个目标"}
	if source.hand.is_empty():
		return {"success": false, "reason": "没有手牌可弃"}
	var discarded = source.hand.remove_at(0)
	GameManager.discard_pile.add_card(discarded)
	var attacker = targets[0] as Player
	var attack_target = targets[1] as Player
	var attack_cards = attacker.hand.get_cards_of_sub_type(GameEnums.CardSubType.ATTACK)
	if not attack_cards.is_empty():
		var attack = attack_cards[0]
		attacker.hand.remove_card(attack)
		ScriptingEngine.execute_effect("attack_effect", attacker, attack, [attack_target])
	return {"success": true}

func _skill_hua_shi(source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	var drawn = GameManager.draw_cards(source, 1)
	return {"success": true, "cards_drawn": drawn.size()}

func _skill_man_li(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "extra_damage": 1}

func _skill_cheng_xiong(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "block_if_fewer_cards": true}

func _skill_san_mei_zhen_huo(source: Player, _card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": false, "reason": "无目标"}
	var red_cards: Array = []
	for c in source.hand.get_all_cards():
		if c.is_red:
			red_cards.append(c)
	if red_cards.is_empty():
		return {"success": false, "reason": "没有红色牌"}
	var chosen = red_cards[0]
	source.hand.remove_card(chosen)
	GameManager.discard_pile.add_card(chosen)
	var target = targets[0] as Player
	target.take_damage(1, source)
	return {"success": true, "unpreventable_damage": 1}

func _skill_ba_jiao_shan(source: Player, _card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": false, "reason": "无目标"}
	if source.hand.is_empty():
		return {"success": false, "reason": "没有手牌可弃"}
	var discarded = source.hand.remove_at(0)
	GameManager.discard_pile.add_card(discarded)
	var target = targets[0] as Player
	var count = target.hand.size()
	var all_cards = target.hand.discard_all()
	for c in all_cards:
		GameManager.discard_pile.add_card(c)
	var drawn = GameManager.draw_cards(target, count)
	return {"success": true, "cards_replaced": count}

func _skill_shan_feng(source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	if source.hand.is_empty():
		return {"success": false, "reason": "没有手牌可弃"}
	var discarded = source.hand.remove_at(0)
	GameManager.discard_pile.add_card(discarded)
	return {"success": true, "attack_nullified": true}

func _skill_zhu_wang(source: Player, _card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": false, "reason": "无目标"}
	var target = targets[0] as Player
	target.set_meta("webbed_until_turn", TurnManager.current_turn + 1)
	return {"success": true, "webbed": true}

func _skill_xi_xue(source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	if source.current_health < source.max_health:
		source.heal(1, source)
		return {"success": true, "healed": 1}
	return {"success": true, "healed": 0}

func _skill_tian_yan(source: Player, _card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": false, "reason": "无目标"}
	var target = targets[0] as Player
	var hand_info: Array = []
	for c in target.hand.get_all_cards():
		hand_info.append({"name": c.get_display_name(), "suit": c.get_suit_string(), "number": c.get_number_string()})
	return {"success": true, "revealed_hand": hand_info}

func _skill_xiao_tian_quan(source: Player, _card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": true}
	var target = targets[0] as Player
	if not target.hand.is_empty():
		var discarded = target.hand.remove_at(0)
		GameManager.discard_pile.add_card(discarded)
		return {"success": true, "forced_discard": true}
	return {"success": true}

func _skill_feng_huo_lun(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "unlimited_range": true}

func _skill_san_tou_liu_bi(source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	source.attacks_remaining = 2
	return {"success": true, "attacks": 2}

func _skill_lian_hua_hua_shen(source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	if source.get_meta("lian_hua_used", false):
		return {"success": false, "reason": "每局游戏限一次"}
	var all_cards = source.hand.discard_all()
	for c in all_cards:
		GameManager.discard_pile.add_card(c)
	source.current_health = 1
	source.is_dying = false
	source.set_meta("lian_hua_used", true)
	return {"success": true, "revived": true}

func _skill_da_ci(source: Player, _card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": false, "reason": "无目标"}
	var target = targets[0] as Player
	var healed = target.heal(1, source)
	return {"success": true, "healed": healed}

func _skill_jing_ping(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "peach_heal_bonus": 1}

func _skill_lian_dan(source: Player, _card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": false, "reason": "无目标"}
	if source.hand.is_empty():
		return {"success": false, "reason": "没有手牌"}
	var target = targets[0] as Player
	var c = source.hand.remove_at(0)
	target.hand.add_card(c)
	var drawn = GameManager.draw_cards(source, 2)
	return {"success": true, "cards_drawn": drawn.size()}

func _skill_jin_dan(_source: Player, _card: Card, _targets: Array, _context: Dictionary) -> Dictionary:
	return {"success": true, "lightning_immune": true}

func _skill_xi_xing(source: Player, _card: Card, targets: Array, _context: Dictionary) -> Dictionary:
	if targets.is_empty():
		return {"success": false, "reason": "无目标"}
	var target = targets[0] as Player
	if target.identity != GameEnums.Identity.LOYALIST:
		return {"success": false, "reason": "目标不是忠臣"}
	if target.hand.is_empty():
		return {"success": false, "reason": "目标没有手牌"}
	var c = target.hand.remove_at(0)
	source.hand.add_card(c)
	return {"success": true, "received_card": true}
