class_name Player
extends Node

var player_id: int = 0
var player_name: String = ""
var identity: GameEnums.Identity = GameEnums.Identity.REBEL
var identity_revealed: bool = false
var is_human: bool = false
var seat_index: int = 0

var hero: HeroData = null
var current_health: int = 0
var max_health: int = 0

var hand: Hand = null
var equipment: Dictionary = {}
var judge_area: Array = []

var attacks_remaining: int = 1
var is_alive: bool = true
var is_dying: bool = false

var _skill_cooldowns: Dictionary = {}
var _skill_used_this_turn: Dictionary = {}

signal health_changed(player: Player, old_health: int, new_health: int)
signal player_died(player: Player, killer: Player)
signal player_damaged(player: Player, amount: int, source: Player)
signal player_healed(player: Player, amount: int)
signal equipment_changed(player: Player, slot: GameEnums.EquipmentSlot, card: Card)

func _init() -> void:
	hand = Hand.new()
	hand.setup(self)
	equipment = {
		GameEnums.EquipmentSlot.WEAPON: null,
		GameEnums.EquipmentSlot.ARMOR: null,
		GameEnums.EquipmentSlot.MOUNT_OFFENSIVE: null,
		GameEnums.EquipmentSlot.MOUNT_DEFENSIVE: null,
	}

func setup_hero(hero_data: HeroData) -> void:
	hero = hero_data
	max_health = hero_data.base_health
	current_health = max_health
	if identity == GameEnums.Identity.LORD:
		max_health += 1
		current_health = max_health

func take_damage(amount: int, source: Player = null) -> int:
	if not is_alive:
		return 0
	var old_health = current_health
	current_health = max(0, current_health - amount)
	health_changed.emit(self, old_health, current_health)
	player_damaged.emit(self, amount, source)

	if current_health <= 0:
		is_dying = true
		EventBus.damage_dealt.emit(source, self, amount, GameEnums.CardSubType.ATTACK)
		if current_health <= 0:
			die(source)
	else:
		EventBus.damage_dealt.emit(source, self, amount, GameEnums.CardSubType.ATTACK)
	return amount

func heal(amount: int, source: Player = null) -> int:
	if not is_alive:
		return 0
	var old_health = current_health
	current_health = min(max_health, current_health + amount)
	var actual_heal = current_health - old_health
	if actual_heal > 0:
		health_changed.emit(self, old_health, current_health)
		player_healed.emit(self, actual_heal)
		if source:
			EventBus.healing_applied.emit(source, self, actual_heal)
	return actual_heal

func die(killer: Player = null) -> void:
	is_alive = false
	is_dying = false
	player_died.emit(self, killer)
	EventBus.hero_died.emit(self, killer)
	IdentityManager.reveal_identity(self)

	for card in hand.get_all_cards():
		hand.remove_card(card)
		GameManager.discard_pile.add_card(card)

	for slot in equipment.keys():
		if equipment[slot] != null:
			var card = equipment[slot]
			equipment[slot] = null
			GameManager.discard_pile.add_card(card)
			equipment_changed.emit(self, slot, null)

	for card in judge_area:
		GameManager.discard_pile.add_card(card)
	judge_area.clear()

func revive(health: int = 1) -> void:
	if is_alive:
		return
	is_alive = true
	is_dying = false
	current_health = min(health, max_health)
	EventBus.hero_revived.emit(self)

func equip_card(card: Card) -> void:
	var slot = _get_equipment_slot(card)
	if slot == -1:
		return

	if equipment[slot] != null:
		var old_card = equipment[slot]
		equipment[slot] = null
		GameManager.discard_pile.add_card(old_card)
		equipment_changed.emit(self, slot as GameEnums.EquipmentSlot, null)

	equipment[slot] = card
	card.owner_player = self
	equipment_changed.emit(self, slot as GameEnums.EquipmentSlot, card)
	EventBus.equipment_equipped.emit(self, card, slot as GameEnums.EquipmentSlot)

func unequip_slot(slot: GameEnums.EquipmentSlot) -> Card:
	if equipment[slot] == null:
		return null
	var card = equipment[slot]
	equipment[slot] = null
	card.owner_player = null
	equipment_changed.emit(self, slot, null)
	EventBus.equipment_unequipped.emit(self, card, slot)
	return card

func _get_equipment_slot(card: Card) -> int:
	match card.card_sub_type:
		GameEnums.CardSubType.EQUIPMENT_WEAPON: return GameEnums.EquipmentSlot.WEAPON
		GameEnums.CardSubType.EQUIPMENT_ARMOR: return GameEnums.EquipmentSlot.ARMOR
		GameEnums.CardSubType.EQUIPMENT_MOUNT_OFFENSIVE: return GameEnums.EquipmentSlot.MOUNT_OFFENSIVE
		GameEnums.CardSubType.EQUIPMENT_MOUNT_DEFENSIVE: return GameEnums.EquipmentSlot.MOUNT_DEFENSIVE
		_: return -1

func get_weapon() -> Card:
	return equipment.get(GameEnums.EquipmentSlot.WEAPON)

func get_armor() -> Card:
	return equipment.get(GameEnums.EquipmentSlot.ARMOR)

func get_attack_range() -> int:
	var weapon = get_weapon()
	if weapon != null:
		return weapon.range
	return 1

func get_offensive_mount_range() -> int:
	if equipment.get(GameEnums.EquipmentSlot.MOUNT_OFFENSIVE) != null:
		return 1
	return 0

func get_defensive_mount_range() -> int:
	if equipment.get(GameEnums.EquipmentSlot.MOUNT_DEFENSIVE) != null:
		return 1
	return 0

func has_armor() -> bool:
	return equipment.get(GameEnums.EquipmentSlot.ARMOR) != null

func can_dodge_attack(attack_card: Card) -> bool:
	var armor = get_armor()
	if armor != null:
		if armor.id == "armor_renwang" and not attack_card.is_red:
			return true
	return false

func start_turn() -> void:
	attacks_remaining = 1
	_skill_used_this_turn.clear()

	if get_weapon() != null and get_weapon().id == "weapon_zhuge":
		attacks_remaining = 999

func end_turn() -> void:
	_skill_used_this_turn.clear()

func can_attack() -> bool:
	return attacks_remaining > 0

func use_attack() -> void:
	attacks_remaining = max(0, attacks_remaining - 1)

func get_hand_size() -> int:
	return hand.size()

func get_total_card_count() -> int:
	var count = hand.size()
	for slot in equipment:
		if equipment[slot] != null:
			count += 1
	count += judge_area.size()
	return count

func has_card_in_hand(sub_type: GameEnums.CardSubType) -> bool:
	return hand.has_card_of_sub_type(sub_type)

func get_identity_string() -> String:
	if identity_revealed:
		return IdentityManager.get_identity_string(identity)
	return "？"

func get_identity_color() -> Color:
	if identity_revealed:
		return IdentityManager.get_identity_color(identity)
	return Color.GRAY

func get_hero_name() -> String:
	if hero != null:
		return hero.hero_name
	return "未知"

func can_use_skill(skill_name: String) -> bool:
	if hero == null:
		return false
	var skill = hero.get_skill(skill_name)
	if skill == null:
		return false
	if skill.once_per_turn and _skill_used_this_turn.has(skill_name):
		return false
	return true

func mark_skill_used(skill_name: String) -> void:
	_skill_used_this_turn[skill_name] = true
	EventBus.skill_triggered.emit(self, skill_name)

func get_health_display() -> String:
	var display = ""
	for i in range(max_health):
		if i < current_health:
			display += "❤"
		else:
			display += "🖤"
	return display
