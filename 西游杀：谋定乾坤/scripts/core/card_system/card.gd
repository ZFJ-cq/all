class_name Card
extends Resource

@export var id: String = ""
@export var card_name: String = ""
@export var card_type: GameEnums.CardType = GameEnums.CardType.BASIC
@export var card_sub_type: GameEnums.CardSubType = GameEnums.CardSubType.ATTACK
@export var suit: GameEnums.CardSuit = GameEnums.CardSuit.SPADE
@export var number: int = 1
@export var description: String = ""
@export var flavor_text: String = ""
@export var target_type: GameEnums.TargetType = GameEnums.TargetType.NONE
@export var is_red: bool = false
@export var effect_script: String = ""
@export var range: int = 1

var instance_id: int = 0
var owner_player: Player = null
var is_face_up: bool = true

static var _next_instance_id: int = 1

func _init() -> void:
	instance_id = Card._next_instance_id
	Card._next_instance_id += 1

func get_suit_string() -> String:
	match suit:
		GameEnums.CardSuit.SPADE: return "♠"
		GameEnums.CardSuit.HEART: return "♥"
		GameEnums.CardSuit.CLUB: return "♣"
		GameEnums.CardSuit.DIAMOND: return "♦"
		_: return "?"

func get_number_string() -> String:
	match number:
		1: return "A"
		11: return "J"
		12: return "Q"
		13: return "K"
		_: return str(number)

func get_type_string() -> String:
	match card_type:
		GameEnums.CardType.BASIC: return "基本牌"
		GameEnums.CardType.SCHEME: return "锦囊牌"
		GameEnums.CardType.EQUIPMENT: return "装备牌"
		_: return "未知"

func get_sub_type_string() -> String:
	match card_sub_type:
		GameEnums.CardSubType.ATTACK: return "杀"
		GameEnums.CardSubType.DODGE: return "闪"
		GameEnums.CardSubType.PEACH: return "桃"
		GameEnums.CardSubType.SCHEME_NULLIFICATION: return "无懈可击"
		GameEnums.CardSubType.SCHEME_OUT_OF_NOTHING: return "无中生有"
		GameEnums.CardSubType.SCHEME_DUEL: return "决斗"
		GameEnums.CardSubType.SCHEME_BARBARIAN: return "南蛮入侵"
		GameEnums.CardSubType.SCHEME_ARROW_BARRAGE: return "万箭齐发"
		GameEnums.CardSubType.SCHEME_PEACH_GARDEN: return "桃园结义"
		GameEnums.CardSubType.SCHEME_DEMOLISH: return "过河拆桥"
		GameEnums.CardSubType.SCHEME_STEAL: return "顺手牵羊"
		GameEnums.CardSubType.SCHEME_BORROW_KNIFE: return "借刀杀人"
		GameEnums.CardSubType.SCHEME_LIGHTNING: return "闪电"
		GameEnums.CardSubType.EQUIPMENT_WEAPON: return "武器"
		GameEnums.CardSubType.EQUIPMENT_ARMOR: return "防具"
		GameEnums.CardSubType.EQUIPMENT_MOUNT_OFFENSIVE: return "进攻坐骑"
		GameEnums.CardSubType.EQUIPMENT_MOUNT_DEFENSIVE: return "防御坐骑"
		_: return "未知"

func get_display_name() -> String:
	if card_name != "":
		return card_name
	return get_sub_type_string()

func can_play(player: Player, _targets: Array = []) -> bool:
	if not is_face_up:
		return false
	match card_sub_type:
		GameEnums.CardSubType.ATTACK:
			return player.attacks_remaining > 0
		GameEnums.CardSubType.DODGE:
			return false
		GameEnums.CardSubType.PEACH:
			return player.current_health < player.max_health
		GameEnums.CardSubType.SCHEME_OUT_OF_NOTHING:
			return true
		GameEnums.CardSubType.SCHEME_DUEL:
			return true
		GameEnums.CardSubType.SCHEME_BARBARIAN:
			return true
		GameEnums.CardSubType.SCHEME_ARROW_BARRAGE:
			return true
		GameEnums.CardSubType.SCHEME_PEACH_GARDEN:
			return true
		GameEnums.CardSubType.SCHEME_DEMOLISH:
			return true
		GameEnums.CardSubType.SCHEME_STEAL:
			return true
		GameEnums.CardSubType.SCHEME_BORROW_KNIFE:
			return true
		GameEnums.CardSubType.SCHEME_LIGHTNING:
			return true
		GameEnums.CardSubType.SCHEME_NULLIFICATION:
			return false
		GameEnums.CardSubType.EQUIPMENT_WEAPON, \
		GameEnums.CardSubType.EQUIPMENT_ARMOR, \
		GameEnums.CardSubType.EQUIPMENT_MOUNT_OFFENSIVE, \
		GameEnums.CardSubType.EQUIPMENT_MOUNT_DEFENSIVE:
			return true
		_:
			return false

func get_valid_targets(player: Player) -> Array:
	var targets: Array = []
	match target_type:
		GameEnums.TargetType.NONE:
			pass
		GameEnums.TargetType.SELF:
			targets.append(player)
		GameEnums.TargetType.OTHER_SINGLE:
			for p in GameManager.get_alive_players():
				if p != player:
					var distance = GameManager.get_distance(player, p)
					if card_sub_type == GameEnums.CardSubType.ATTACK:
						if distance <= player.get_attack_range():
							targets.append(p)
					elif card_sub_type == GameEnums.CardSubType.SCHEME_STEAL:
						if distance <= 1:
							targets.append(p)
					else:
						targets.append(p)
		GameEnums.TargetType.ALL_OTHERS:
			for p in GameManager.get_alive_players():
				if p != player:
					targets.append(p)
		GameEnums.TargetType.ALL_PLAYERS:
			targets = GameManager.get_alive_players()
		GameEnums.TargetType.ANY_PLAYER:
			targets = GameManager.get_alive_players()
	return targets

func duplicate_card() -> Card:
	var new_card = Card.new()
	new_card.id = id
	new_card.card_name = card_name
	new_card.card_type = card_type
	new_card.card_sub_type = card_sub_type
	new_card.suit = suit
	new_card.number = number
	new_card.description = description
	new_card.flavor_text = flavor_text
	new_card.target_type = target_type
	new_card.is_red = is_red
	new_card.effect_script = effect_script
	new_card.range = range
	return new_card
