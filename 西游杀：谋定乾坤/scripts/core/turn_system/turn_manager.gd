extends Node

var current_turn: int = 0
var current_player: Player = null
var current_phase: GameEnums.TurnPhase = GameEnums.TurnPhase.PREPARE
var turn_order: Array = []
var turn_index: int = 0
var is_turn_active: bool = false
var is_game_active: bool = false

signal turn_started(player: Player)
signal turn_ended(player: Player)
signal phase_started(player: Player, phase: GameEnums.TurnPhase)
signal phase_ended(player: Player, phase: GameEnums.TurnPhase)
signal request_play_card(player: Player)
signal request_discard(player: Player, count: int)
signal request_response_card(player: Player, card_type: GameEnums.CardSubType)
signal turn_resolution_complete

func start_game(players: Array) -> void:
	turn_order = players.duplicate()
	turn_order.shuffle()
	var lord = IdentityManager.get_lord()
	if lord != null:
		turn_order.erase(lord)
		turn_order.push_front(lord)
	turn_index = 0
	current_turn = 0
	is_game_active = true
	_begin_next_turn()

func _begin_next_turn() -> void:
	if not is_game_active:
		return

	while turn_index < turn_order.size():
		var player = turn_order[turn_index] as Player
		if player.is_alive:
			current_turn += 1
			current_player = player
			is_turn_active = true
			turn_started.emit(player)
			EventBus.turn_started.emit(player)
			player.start_turn()
			_process_turn_phases(player)
			return
		turn_index += 1

	turn_index = 0
	_begin_next_turn()

func _process_turn_phases(player: Player) -> void:
	var phases = [
		GameEnums.TurnPhase.PREPARE,
		GameEnums.TurnPhase.JUDGE,
		GameEnums.TurnPhase.DRAW,
		GameEnums.TurnPhase.PLAY,
		GameEnums.TurnPhase.DISCARD,
		GameEnums.TurnPhase.END,
	]

	for phase in phases:
		if not player.is_alive or not is_game_active:
			break
		current_phase = phase
		phase_started.emit(player, phase)
		EventBus.phase_changed.emit(player, current_phase, phase)

		match phase:
			GameEnums.TurnPhase.PREPARE:
				_phase_prepare(player)
			GameEnums.TurnPhase.JUDGE:
				await _phase_judge(player)
			GameEnums.TurnPhase.DRAW:
				_phase_draw(player)
			GameEnums.TurnPhase.PLAY:
				await _phase_play(player)
			GameEnums.TurnPhase.DISCARD:
				await _phase_discard(player)
			GameEnums.TurnPhase.END:
				_phase_end(player)

		phase_ended.emit(player, phase)

	if is_turn_active:
		is_turn_active = false
		player.end_turn()
		turn_ended.emit(player)
		EventBus.turn_ended.emit(player)

	var win = IdentityManager.check_win_condition()
	if win >= 0:
		is_game_active = false
		EventBus.game_over.emit(win as GameEnums.Identity)
		return

	turn_index += 1
	if turn_index >= turn_order.size():
		turn_index = 0
	_begin_next_turn()

func _phase_prepare(player: Player) -> void:
	player.set_meta("hou_pi_used_this_turn", false)
	if player.hero != null:
		for skill in player.hero.skills:
			if skill.trigger_type == HeroSkill.TriggerType.ON_TURN_START:
				ScriptingEngine.execute_effect(skill.effect_script, player, null, [], {})

func _phase_judge(player: Player) -> void:
	if player.judge_area.is_empty():
		return

	var judge_cards = player.judge_area.duplicate()
	player.judge_area.clear()

	for card in judge_cards:
		var judge_card = GameManager.draw_pile.draw_card()
		if judge_card == null:
			GameManager.reshuffle_discard_to_draw()
			judge_card = GameManager.draw_pile.draw_card()
		if judge_card == null:
			continue

		var success = false
		match card.card_sub_type:
			GameEnums.CardSubType.SCHEME_LIGHTNING:
				success = not (judge_card.suit == GameEnums.CardSuit.SPADE and judge_card.number >= 2 and judge_card.number <= 9)
				if not success:
					var immune = false
					if player.hero != null:
						for skill in player.hero.skills:
							if skill.effect_script == "jin_dan":
								immune = true
								break
					if not immune:
						player.take_damage(3, null)
					else:
						GameManager.discard_pile.add_card(card)
				else:
					var next_player = _get_next_alive_player(player)
					if next_player != null:
						next_player.judge_area.append(card)
					else:
						GameManager.discard_pile.add_card(card)

		EventBus.judge_result.emit(player, judge_card, success)
		GameManager.discard_pile.add_card(judge_card)

func _phase_draw(player: Player) -> void:
	var draw_count = 2
	if player.hero != null:
		for skill in player.hero.skills:
			if skill.trigger_type == HeroSkill.TriggerType.ON_DRAW:
				pass
	GameManager.draw_cards(player, draw_count)

func _phase_play(player: Player) -> void:
	if player.is_human:
		request_play_card.emit(player)
		await EventBus.turn_phase_action_completed
	else:
		var ai = player.get_node_or_null("AIController")
		if ai != null:
			await ai.execute_play_phase(player)
		else:
			await _auto_play_phase(player)

func _phase_discard(player: Player) -> void:
	var hand_limit = player.current_health
	if player.hero != null:
		for skill in player.hero.skills:
			if skill.effect_script == "tiao_dan":
				hand_limit += 2
				break

	var overflow = player.hand.size() - hand_limit
	if overflow > 0:
		if player.is_human:
			request_discard.emit(player, overflow)
			await EventBus.turn_phase_action_completed
		else:
			_auto_discard(player, overflow)

func _phase_end(player: Player) -> void:
	if player.hero != null:
		for skill in player.hero.skills:
			if skill.trigger_type == HeroSkill.TriggerType.ON_TURN_END:
				ScriptingEngine.execute_effect(skill.effect_script, player, null, [], {})

func _get_next_alive_player(after_player: Player) -> Player:
	var idx = turn_order.find(after_player)
	if idx < 0:
		return null
	for i in range(1, turn_order.size()):
		var next_idx = (idx + i) % turn_order.size()
		var p = turn_order[next_idx] as Player
		if p.is_alive:
			return p
	return null

func _auto_play_phase(player: Player) -> void:
	var played_something = true
	while played_something and player.is_alive:
		played_something = false
		var playable = player.hand.get_playable_cards()
		if playable.is_empty():
			break

		for card in playable:
			if not player.is_alive:
				break
			if card.card_sub_type == GameEnums.CardSubType.ATTACK and not player.can_attack():
				continue
			if card.card_sub_type == GameEnums.CardSubType.PEACH and player.current_health >= player.max_health:
				continue

			var targets = card.get_valid_targets(player)
			match card.target_type:
				GameEnums.TargetType.NONE:
					player.hand.remove_card(card)
					if card.card_type == GameEnums.CardType.EQUIPMENT:
						player.equip_card(card)
					else:
						ScriptingEngine.execute_effect(card.effect_script, player, card, [])
						GameManager.discard_pile.add_card(card)
					played_something = true
				GameEnums.TargetType.SELF:
					player.hand.remove_card(card)
					if card.card_type == GameEnums.CardType.EQUIPMENT:
						player.equip_card(card)
					else:
						ScriptingEngine.execute_effect(card.effect_script, player, card, [player])
						GameManager.discard_pile.add_card(card)
					played_something = true
				_:
					if not targets.is_empty():
						var target = targets[randi() % targets.size()]
						player.hand.remove_card(card)
						ScriptingEngine.execute_effect(card.effect_script, player, card, [target])
						GameManager.discard_pile.add_card(card)
						played_something = true

		await get_tree().create_timer(0.3).timeout

func _auto_discard(player: Player, count: int) -> void:
	for i in range(count):
		if player.hand.is_empty():
			break
		var card = player.hand.remove_at(0)
		GameManager.discard_pile.add_card(card)
		EventBus.card_discarded.emit(card, player)

func end_play_phase() -> void:
	EventBus.turn_phase_action_completed.emit(current_player, GameEnums.TurnPhase.PLAY)

func end_discard_phase() -> void:
	EventBus.turn_phase_action_completed.emit(current_player, GameEnums.TurnPhase.DISCARD)

func get_current_phase_string() -> String:
	match current_phase:
		GameEnums.TurnPhase.PREPARE: return "准备阶段"
		GameEnums.TurnPhase.JUDGE: return "判定阶段"
		GameEnums.TurnPhase.DRAW: return "摸牌阶段"
		GameEnums.TurnPhase.PLAY: return "出牌阶段"
		GameEnums.TurnPhase.DISCARD: return "弃牌阶段"
		GameEnums.TurnPhase.END: return "结束阶段"
		_: return "未知"

func get_remaining_players() -> int:
	var count = 0
	for p in turn_order:
		if p.is_alive:
			count += 1
	return count

func eliminate_player(player: Player) -> void:
	if not player.is_alive:
		return

func reset() -> void:
	current_turn = 0
	current_player = null
	current_phase = GameEnums.TurnPhase.PREPARE
	turn_order.clear()
	turn_index = 0
	is_turn_active = false
	is_game_active = false
