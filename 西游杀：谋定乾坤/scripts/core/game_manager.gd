extends Node

var players: Array = []
var draw_pile: Pile = null
var discard_pile: Pile = null
var game_state: String = "idle"

signal game_initialized
signal game_started
signal game_ended(winner: GameEnums.Identity)

func _ready() -> void:
	draw_pile = Pile.new()
	draw_pile.setup("摸牌堆", Pile.PileType.DRAW)
	add_child(draw_pile)
	discard_pile = Pile.new()
	discard_pile.setup("弃牌堆", Pile.PileType.DISCARD)
	add_child(discard_pile)

	EventBus.game_over.connect(_on_game_over)
	EventBus.hero_died.connect(_on_hero_died)

func initialize_game(player_count: int, human_player_index: int = 0) -> void:
	_reset_game()

	var deck = CardDatabase.create_shuffled_deck()
	draw_pile.add_cards(deck)

	IdentityManager.setup_identities(player_count)

	for i in range(player_count):
		var player = Player.new()
		player.player_id = i
		player.seat_index = i
		player.is_human = (i == human_player_index)
		player.player_name = "玩家%d" % (i + 1) if not player.is_human else "你"
		add_child(player)
		players.append(player)

	var available_heroes = HeroManager.get_random_heroes(player_count)
	for i in range(player_count):
		players[i].setup_hero(available_heroes[i])

	IdentityManager.assign_identities(players)

	for player in players:
		var starting_cards = draw_cards(player, 4)
		player.hand.add_cards(starting_cards)

	game_state = "initialized"
	game_initialized.emit()

func start_game() -> void:
	game_state = "playing"
	game_started.emit()
	EventBus.game_started.emit(players)
	TurnManager.start_game(players)

func draw_cards(player: Player, count: int) -> Array:
	var drawn: Array = []
	for i in range(count):
		if draw_pile.is_empty():
			reshuffle_discard_to_draw()
		var card = draw_pile.draw_card()
		if card != null:
			player.hand.add_card(card)
			drawn.append(card)
			EventBus.card_drawn.emit(card, player)
		else:
			break
	return drawn

func reshuffle_discard_to_draw() -> void:
	draw_pile.reshuffle_from_discard(discard_pile)

func get_alive_players() -> Array:
	var result: Array = []
	for player in players:
		if player.is_alive:
			result.append(player)
	return result

func get_dead_players() -> Array:
	var result: Array = []
	for player in players:
		if not player.is_alive:
			result.append(player)
	return result

func get_player_by_id(pid: int) -> Player:
	for player in players:
		if player.player_id == pid:
			return player
	return null

func get_human_player() -> Player:
	for player in players:
		if player.is_human:
			return player
	return null

func get_distance(player_a: Player, player_b: Player) -> int:
	if player_a == player_b:
		return 0
	var alive = get_alive_players()
	var idx_a = -1
	var idx_b = -1
	for i in range(alive.size()):
		if alive[i] == player_a:
			idx_a = i
		if alive[i] == player_b:
			idx_b = i
	if idx_a < 0 or idx_b < 0:
		return 999
	var dist_clockwise = abs(idx_a - idx_b)
	var dist_counterclockwise = alive.size() - dist_clockwise
	var distance = min(dist_clockwise, dist_counterclockwise)
	distance -= player_a.get_offensive_mount_range()
	distance += player_b.get_defensive_mount_range()
	return max(1, distance)

func get_next_alive_player(from_player: Player) -> Player:
	var alive = get_alive_players()
	var idx = alive.find(from_player)
	if idx < 0:
		return null
	var next_idx = (idx + 1) % alive.size()
	return alive[next_idx]

func play_card(player: Player, card: Card, targets: Array = []) -> Dictionary:
	if not player.hand.has_card(card):
		return {"success": false, "reason": "手牌中没有此牌"}

	if not card.can_play(player, targets):
		return {"success": false, "reason": "当前不能使用此牌"}

	player.hand.remove_card(card)

	if card.card_type == GameEnums.CardType.EQUIPMENT:
		player.equip_card(card)
		EventBus.card_played.emit(card, player, targets)
		return {"success": true, "equipped": true}

	var result = ScriptingEngine.execute_effect(card.effect_script, player, card, targets)
	GameManager.discard_pile.add_card(card)
	return result

func discard_cards(player: Player, cards: Array) -> void:
	for card in cards:
		if player.hand.has_card(card):
			player.hand.remove_card(card)
			discard_pile.add_card(card)
			EventBus.card_discarded.emit(card, player)

func _on_game_over(winner: GameEnums.Identity) -> void:
	game_state = "ended"
	game_ended.emit(winner)

func _on_hero_died(player: Player, _killer: Player) -> void:
	TurnManager.eliminate_player(player)

	var win = IdentityManager.check_win_condition()
	if win >= 0:
		EventBus.game_over.emit(win as GameEnums.Identity)

func _reset_game() -> void:
	for player in players:
		player.queue_free()
	players.clear()
	draw_pile.clear()
	discard_pile.clear()
	game_state = "idle"
	IdentityManager.reset()
	TurnManager.reset()

func get_game_state_string() -> String:
	match game_state:
		"idle": return "等待中"
		"initialized": return "已初始化"
		"playing": return "游戏中"
		"ended": return "已结束"
		_: return "未知"

func get_draw_pile_count() -> int:
	return draw_pile.size()

func get_discard_pile_count() -> int:
	return discard_pile.size()
