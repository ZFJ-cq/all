extends Node

var _identities: Array = []
var _identity_map: Dictionary = {}
var _lord_player: Player = null

signal identity_assigned(player: Player, identity: GameEnums.Identity)
signal identity_revealed(player: Player, identity: GameEnums.Identity)
signal lord_died
signal all_rebels_eliminated
signal spy_wins

func setup_identities(player_count: int) -> void:
	_identities.clear()
	_identity_map.clear()
	_lord_player = null

	match player_count:
		2:
			_identities = [GameEnums.Identity.LORD, GameEnums.Identity.REBEL]
		3:
			_identities = [GameEnums.Identity.LORD, GameEnums.Identity.REBEL, GameEnums.Identity.REBEL]
		4:
			_identities = [GameEnums.Identity.LORD, GameEnums.Identity.LOYALIST, GameEnums.Identity.REBEL, GameEnums.Identity.REBEL]
		5:
			_identities = [GameEnums.Identity.LORD, GameEnums.Identity.LOYALIST, GameEnums.Identity.REBEL, GameEnums.Identity.REBEL, GameEnums.Identity.REBEL]
		6:
			_identities = [GameEnums.Identity.LORD, GameEnums.Identity.LOYALIST, GameEnums.Identity.REBEL, GameEnums.Identity.REBEL, GameEnums.Identity.REBEL, GameEnums.Identity.SPY]
		7:
			_identities = [GameEnums.Identity.LORD, GameEnums.Identity.LOYALIST, GameEnums.Identity.LOYALIST, GameEnums.Identity.REBEL, GameEnums.Identity.REBEL, GameEnums.Identity.REBEL, GameEnums.Identity.SPY]
		8:
			_identities = [GameEnums.Identity.LORD, GameEnums.Identity.LOYALIST, GameEnums.Identity.LOYALIST, GameEnums.Identity.REBEL, GameEnums.Identity.REBEL, GameEnums.Identity.REBEL, GameEnums.Identity.REBEL, GameEnums.Identity.SPY]
		_:
			_identities = [GameEnums.Identity.LORD, GameEnums.Identity.LOYALIST, GameEnums.Identity.REBEL, GameEnums.Identity.REBEL, GameEnums.Identity.SPY]

func assign_identities(players: Array) -> void:
	var shuffled_identities = _identities.duplicate()
	shuffled_identities.shuffle()

	for i in range(players.size()):
		var player = players[i] as Player
		var identity = shuffled_identities[i]
		player.identity = identity
		_identity_map[player.player_id] = identity
		identity_assigned.emit(player, identity)

		if identity == GameEnums.Identity.LORD:
			_lord_player = player
			player.identity_revealed = true
			identity_revealed.emit(player, identity)

func get_identity(player: Player) -> GameEnums.Identity:
	if _identity_map.has(player.player_id):
		return _identity_map[player.player_id]
	return GameEnums.Identity.REBEL

func get_lord() -> Player:
	return _lord_player

func get_lords() -> Array:
	var result: Array = []
	if _lord_player != null and _lord_player.is_alive:
		result.append(_lord_player)
	return result

func get_loyalists() -> Array:
	var result: Array = []
	for player in GameManager.get_alive_players():
		if _identity_map.get(player.player_id) == GameEnums.Identity.LOYALIST:
			result.append(player)
	return result

func get_rebels() -> Array:
	var result: Array = []
	for player in GameManager.get_alive_players():
		if _identity_map.get(player.player_id) == GameEnums.Identity.REBEL:
			result.append(player)
	return result

func get_spies() -> Array:
	var result: Array = []
	for player in GameManager.get_alive_players():
		if _identity_map.get(player.player_id) == GameEnums.Identity.SPY:
			result.append(player)
	return result

func is_lord(player: Player) -> bool:
	return player == _lord_player

func is_ally(player_a: Player, player_b: Player) -> bool:
	var id_a = _identity_map.get(player_a.player_id)
	var id_b = _identity_map.get(player_b.player_id)

	if id_a == GameEnums.Identity.LORD and id_b == GameEnums.Identity.LOYALIST:
		return true
	if id_a == GameEnums.Identity.LOYALIST and id_b == GameEnums.Identity.LORD:
		return true
	if id_a == GameEnums.Identity.LOYALIST and id_b == GameEnums.Identity.LOYALIST:
		return true
	if id_a == GameEnums.Identity.REBEL and id_b == GameEnums.Identity.REBEL:
		return true
	return false

func is_enemy(player_a: Player, player_b: Player) -> bool:
	var id_a = _identity_map.get(player_a.player_id)
	var id_b = _identity_map.get(player_b.player_id)

	if id_a == GameEnums.Identity.LORD and id_b == GameEnums.Identity.REBEL:
		return true
	if id_a == GameEnums.Identity.LORD and id_b == GameEnums.Identity.SPY:
		return true
	if id_a == GameEnums.Identity.LOYALIST and id_b == GameEnums.Identity.REBEL:
		return true
	if id_a == GameEnums.Identity.REBEL and id_b == GameEnums.Identity.LORD:
		return true
	if id_a == GameEnums.Identity.REBEL and id_b == GameEnums.Identity.LOYALIST:
		return true
	return false

func reveal_identity(player: Player) -> void:
	if not player.identity_revealed:
		player.identity_revealed = true
		identity_revealed.emit(player, _identity_map.get(player.player_id))

func check_win_condition() -> int:
	if _lord_player == null or not _lord_player.is_alive:
		var alive_players = GameManager.get_alive_players()
		var alive_spies = get_spies()
		if alive_spies.size() == 1 and alive_players.size() == 1:
			return GameEnums.Identity.SPY
		return GameEnums.Identity.REBEL

	var alive_rebels = get_rebels()
	var alive_spies = get_spies()
	if alive_rebels.is_empty() and alive_spies.is_empty():
		return GameEnums.Identity.LORD

	return -1

func get_identity_string(identity: GameEnums.Identity) -> String:
	match identity:
		GameEnums.Identity.LORD: return "主公"
		GameEnums.Identity.LOYALIST: return "忠臣"
		GameEnums.Identity.REBEL: return "反贼"
		GameEnums.Identity.SPY: return "内奸"
		_: return "未知"

func get_identity_color(identity: GameEnums.Identity) -> Color:
	match identity:
		GameEnums.Identity.LORD: return Color(1.0, 0.84, 0.0)
		GameEnums.Identity.LOYALIST: return Color(0.2, 0.6, 1.0)
		GameEnums.Identity.REBEL: return Color(0.9, 0.2, 0.2)
		GameEnums.Identity.SPY: return Color(0.6, 0.2, 0.8)
		_: return Color.WHITE

func reset() -> void:
	_identities.clear()
	_identity_map.clear()
	_lord_player = null
