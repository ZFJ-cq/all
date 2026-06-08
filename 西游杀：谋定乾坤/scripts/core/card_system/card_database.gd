extends Node

var _card_templates: Dictionary = {}
var _all_cards: Array = []

func _ready() -> void:
	_init_card_templates()

func _init_card_templates() -> void:
	_init_basic_cards()
	_init_scheme_cards()
	_init_equipment_cards()

func _create_card(id: String, name: String, type: GameEnums.CardType, sub_type: GameEnums.CardSubType, suit: GameEnums.CardSuit, number: int, desc: String, target: GameEnums.TargetType, effect: String = "", rng: int = 1) -> Card:
	var card = Card.new()
	card.id = id
	card.card_name = name
	card.card_type = type
	card.card_sub_type = sub_type
	card.suit = suit
	card.number = number
	card.description = desc
	card.target_type = target
	card.is_red = (suit == GameEnums.CardSuit.HEART or suit == GameEnums.CardSuit.DIAMOND)
	card.effect_script = effect
	card.range = rng
	return card

func _init_basic_cards() -> void:
	var attack_suits = [
		[GameEnums.CardSuit.SPADE, 7], [GameEnums.CardSuit.SPADE, 8], [GameEnums.CardSuit.SPADE, 8],
		[GameEnums.CardSuit.SPADE, 9], [GameEnums.CardSuit.SPADE, 9], [GameEnums.CardSuit.SPADE, 10],
		[GameEnums.CardSuit.SPADE, 10], [GameEnums.CardSuit.CLUB, 2], [GameEnums.CardSuit.CLUB, 3],
		[GameEnums.CardSuit.CLUB, 4], [GameEnums.CardSuit.CLUB, 5], [GameEnums.CardSuit.CLUB, 6],
		[GameEnums.CardSuit.CLUB, 7], [GameEnums.CardSuit.CLUB, 8], [GameEnums.CardSuit.CLUB, 8],
		[GameEnums.CardSuit.CLUB, 9], [GameEnums.CardSuit.CLUB, 9], [GameEnums.CardSuit.CLUB, 10],
		[GameEnums.CardSuit.CLUB, 10], [GameEnums.CardSuit.CLUB, 11], [GameEnums.CardSuit.CLUB, 11],
		[GameEnums.CardSuit.HEART, 10], [GameEnums.CardSuit.HEART, 10], [GameEnums.CardSuit.HEART, 11],
		[GameEnums.CardSuit.DIAMOND, 6], [GameEnums.CardSuit.DIAMOND, 7], [GameEnums.CardSuit.DIAMOND, 8],
		[GameEnums.CardSuit.DIAMOND, 9], [GameEnums.CardSuit.DIAMOND, 10], [GameEnums.CardSuit.DIAMOND, 13],
	]
	for i in range(attack_suits.size()):
		var s = attack_suits[i]
		_register_card(_create_card(
			"attack_%d" % i, "杀", GameEnums.CardType.BASIC, GameEnums.CardSubType.ATTACK,
			s[0], s[1], "出牌阶段，对你攻击范围内的一名角色使用。对该角色造成1点伤害。",
			GameEnums.TargetType.OTHER_SINGLE, "attack_effect", 1
		))

	var dodge_suits = [
		[GameEnums.CardSuit.HEART, 2], [GameEnums.CardSuit.HEART, 2], [GameEnums.CardSuit.HEART, 13],
		[GameEnums.CardSuit.DIAMOND, 2], [GameEnums.CardSuit.DIAMOND, 2], [GameEnums.CardSuit.DIAMOND, 3],
		[GameEnums.CardSuit.DIAMOND, 4], [GameEnums.CardSuit.DIAMOND, 5], [GameEnums.CardSuit.DIAMOND, 6],
		[GameEnums.CardSuit.DIAMOND, 7], [GameEnums.CardSuit.DIAMOND, 8], [GameEnums.CardSuit.DIAMOND, 9],
		[GameEnums.CardSuit.DIAMOND, 10], [GameEnums.CardSuit.DIAMOND, 11], [GameEnums.CardSuit.DIAMOND, 11],
	]
	for i in range(dodge_suits.size()):
		var s = dodge_suits[i]
		_register_card(_create_card(
			"dodge_%d" % i, "闪", GameEnums.CardType.BASIC, GameEnums.CardSubType.DODGE,
			s[0], s[1], "当你成为【杀】的目标时，可以打出一张【闪】来抵消此【杀】。",
			GameEnums.TargetType.NONE, "dodge_effect"
		))

	var peach_suits = [
		[GameEnums.CardSuit.HEART, 3], [GameEnums.CardSuit.HEART, 4], [GameEnums.CardSuit.HEART, 6],
		[GameEnums.CardSuit.HEART, 7], [GameEnums.CardSuit.HEART, 8], [GameEnums.CardSuit.HEART, 9],
		[GameEnums.CardSuit.HEART, 12], [GameEnums.CardSuit.DIAMOND, 12],
	]
	for i in range(peach_suits.size()):
		var s = peach_suits[i]
		_register_card(_create_card(
			"peach_%d" % i, "桃", GameEnums.CardType.BASIC, GameEnums.CardSubType.PEACH,
			s[0], s[1], "出牌阶段，对自己使用。回复1点体力。或当有角色处于濒死状态时，对该角色使用。回复1点体力。",
			GameEnums.TargetType.SELF, "peach_effect"
		))

func _init_scheme_cards() -> void:
	var nullification_data = [
		[GameEnums.CardSuit.SPADE, 11], [GameEnums.CardSuit.SPADE, 13],
		[GameEnums.CardSuit.CLUB, 12], [GameEnums.CardSuit.CLUB, 13],
		[GameEnums.CardSuit.DIAMOND, 12],
	]
	for i in range(nullification_data.size()):
		var s = nullification_data[i]
		_register_card(_create_card(
			"nullification_%d" % i, "无懈可击", GameEnums.CardType.SCHEME, GameEnums.CardSubType.SCHEME_NULLIFICATION,
			s[0], s[1], "当一名角色成为锦囊牌的目标时，你可以打出此牌来抵消该锦囊牌的效果。",
			GameEnums.TargetType.NONE, "nullification_effect"
		))

	var out_of_nothing_data = [
		[GameEnums.CardSuit.HEART, 7], [GameEnums.CardSuit.HEART, 8],
		[GameEnums.CardSuit.HEART, 9], [GameEnums.CardSuit.HEART, 11],
	]
	for i in range(out_of_nothing_data.size()):
		var s = out_of_nothing_data[i]
		_register_card(_create_card(
			"out_of_nothing_%d" % i, "无中生有", GameEnums.CardType.SCHEME, GameEnums.CardSubType.SCHEME_OUT_OF_NOTHING,
			s[0], s[1], "出牌阶段，对自己使用。摸两张牌。",
			GameEnums.TargetType.SELF, "out_of_nothing_effect"
		))

	var duel_data = [
		[GameEnums.CardSuit.SPADE, 1], [GameEnums.CardSuit.CLUB, 1],
		[GameEnums.CardSuit.DIAMOND, 1],
	]
	for i in range(duel_data.size()):
		var s = duel_data[i]
		_register_card(_create_card(
			"duel_%d" % i, "决斗", GameEnums.CardType.SCHEME, GameEnums.CardSubType.SCHEME_DUEL,
			s[0], s[1], "出牌阶段，对一名其他角色使用。由目标角色先开始，你与其轮流打出一张【杀】，首先不出【杀】的角色受到对方1点伤害。",
			GameEnums.TargetType.OTHER_SINGLE, "duel_effect"
		))

	var barbarian_data = [
		[GameEnums.CardSuit.SPADE, 7], [GameEnums.CardSuit.SPADE, 13],
		[GameEnums.CardSuit.CLUB, 7],
	]
	for i in range(barbarian_data.size()):
		var s = barbarian_data[i]
		_register_card(_create_card(
			"barbarian_%d" % i, "南蛮入侵", GameEnums.CardType.SCHEME, GameEnums.CardSubType.SCHEME_BARBARIAN,
			s[0], s[1], "出牌阶段，对所有其他角色使用。每名目标角色需打出一张【杀】，否则受到1点伤害。",
			GameEnums.TargetType.ALL_OTHERS, "barbarian_effect"
		))

	var arrow_data = [
		[GameEnums.CardSuit.HEART, 1],
	]
	_register_card(_create_card(
		"arrow_barrage_0", "万箭齐发", GameEnums.CardType.SCHEME, GameEnums.CardSubType.SCHEME_ARROW_BARRAGE,
		arrow_data[0][0], arrow_data[0][1], "出牌阶段，对所有其他角色使用。每名目标角色需打出一张【闪】，否则受到1点伤害。",
		GameEnums.TargetType.ALL_OTHERS, "arrow_barrage_effect"
	))

	var peach_garden_data = [
		[GameEnums.CardSuit.HEART, 1],
	]
	_register_card(_create_card(
		"peach_garden_0", "桃园结义", GameEnums.CardType.SCHEME, GameEnums.CardSubType.SCHEME_PEACH_GARDEN,
		peach_garden_data[0][0], peach_garden_data[0][1], "出牌阶段，对所有角色使用。每名目标角色回复1点体力。",
		GameEnums.TargetType.ALL_PLAYERS, "peach_garden_effect"
	))

	var demolish_data = [
		[GameEnums.CardSuit.SPADE, 3], [GameEnums.CardSuit.SPADE, 4],
		[GameEnums.CardSuit.SPADE, 12], [GameEnums.CardSuit.CLUB, 3],
		[GameEnums.CardSuit.CLUB, 4], [GameEnums.CardSuit.HEART, 12],
	]
	for i in range(demolish_data.size()):
		var s = demolish_data[i]
		_register_card(_create_card(
			"demolish_%d" % i, "过河拆桥", GameEnums.CardType.SCHEME, GameEnums.CardSubType.SCHEME_DEMOLISH,
			s[0], s[1], "出牌阶段，对一名距离为1的其他角色使用。弃置其一张牌。",
			GameEnums.TargetType.OTHER_SINGLE, "demolish_effect"
		))

	var steal_data = [
		[GameEnums.CardSuit.SPADE, 3], [GameEnums.CardSuit.SPADE, 4],
		[GameEnums.CardSuit.SPADE, 11], [GameEnums.CardSuit.DIAMOND, 3],
	]
	for i in range(steal_data.size()):
		var s = steal_data[i]
		_register_card(_create_card(
			"steal_%d" % i, "顺手牵羊", GameEnums.CardType.SCHEME, GameEnums.CardSubType.SCHEME_STEAL,
			s[0], s[1], "出牌阶段，对一名距离为1的其他角色使用。获得其一张牌。",
			GameEnums.TargetType.OTHER_SINGLE, "steal_effect"
		))

	var borrow_knife_data = [
		[GameEnums.CardSuit.CLUB, 11], [GameEnums.CardSuit.CLUB, 12],
		[GameEnums.CardSuit.CLUB, 13],
	]
	for i in range(borrow_knife_data.size()):
		var s = borrow_knife_data[i]
		_register_card(_create_card(
			"borrow_knife_%d" % i, "借刀杀人", GameEnums.CardType.SCHEME, GameEnums.CardSubType.SCHEME_BORROW_KNIFE,
			s[0], s[1], "出牌阶段，对一名装备区有武器的其他角色使用。令其对你指定的一名角色使用一张【杀】，否则你获得其武器。",
			GameEnums.TargetType.OTHER_SINGLE, "borrow_knife_effect"
		))

	var lightning_data = [
		[GameEnums.CardSuit.SPADE, 1], [GameEnums.CardSuit.SPADE, 2],
	]
	for i in range(lightning_data.size()):
		var s = lightning_data[i]
		_register_card(_create_card(
			"lightning_%d" % i, "闪电", GameEnums.CardType.SCHEME, GameEnums.CardSubType.SCHEME_LIGHTNING,
			s[0], s[1], "延时锦囊牌。出牌阶段，对一名其他角色使用。将此牌置于目标判定区，目标回合判定阶段进行判定：若为黑桃2~9，受到3点雷电伤害；否则将此牌传给下一名其他角色。",
			GameEnums.TargetType.OTHER_SINGLE, "lightning_effect"
		))

func _init_equipment_cards() -> void:
	_register_card(_create_card(
		"weapon_zhuge", "诸葛连弩", GameEnums.CardType.EQUIPMENT, GameEnums.CardSubType.EQUIPMENT_WEAPON,
		GameEnums.CardSuit.CLUB, 1, "武器，攻击范围1。出牌阶段，你可以使用任意数量的【杀】。",
		GameEnums.TargetType.SELF, "weapon_zhuge_effect", 1
	))
	_register_card(_create_card(
		"weapon_qinggang", "青釭剑", GameEnums.CardType.EQUIPMENT, GameEnums.CardSubType.EQUIPMENT_WEAPON,
		GameEnums.CardSuit.SPADE, 6, "武器，攻击范围2。当你使用【杀】时，无视目标防具。",
		GameEnums.TargetType.SELF, "weapon_qinggang_effect", 2
	))
	_register_card(_create_card(
		"weapon_zhangba", "丈八蛇矛", GameEnums.CardType.EQUIPMENT, GameEnums.CardSubType.EQUIPMENT_WEAPON,
		GameEnums.CardSuit.SPADE, 12, "武器，攻击范围3。你可以将两张手牌当【杀】使用。",
		GameEnums.TargetType.SELF, "weapon_zhangba_effect", 3
	))
	_register_card(_create_card(
		"weapon_qinglong", "青龙偃月刀", GameEnums.CardType.EQUIPMENT, GameEnums.CardSubType.EQUIPMENT_WEAPON,
		GameEnums.CardSuit.SPADE, 5, "武器，攻击范围3。当你使用的【杀】被【闪】抵消时，你可以对目标再使用一张【杀】。",
		GameEnums.TargetType.SELF, "weapon_qinglong_effect", 3
	))
	_register_card(_create_card(
		"weapon_guanjiao", "贯石斧", GameEnums.CardType.EQUIPMENT, GameEnums.CardSubType.EQUIPMENT_WEAPON,
		GameEnums.CardSuit.DIAMOND, 5, "武器，攻击范围3。当你使用的【杀】被【闪】抵消时，你可以弃两张牌强制命中。",
		GameEnums.TargetType.SELF, "weapon_guanjiao_effect", 3
	))
	_register_card(_create_card(
		"weapon_fangtian", "方天画戟", GameEnums.CardType.EQUIPMENT, GameEnums.CardSubType.EQUIPMENT_WEAPON,
		GameEnums.CardSuit.DIAMOND, 12, "武器，攻击范围4。当你使用【杀】时，若你手牌数不大于1，可指定至多三名目标。",
		GameEnums.TargetType.SELF, "weapon_fangtian_effect", 4
	))

	_register_card(_create_card(
		"armor_bagua", "八卦阵", GameEnums.CardType.EQUIPMENT, GameEnums.CardSubType.EQUIPMENT_ARMOR,
		GameEnums.CardSuit.SPADE, 2, "防具。当你需要打出【闪】时，你可以进行判定：若判定结果为红色，视为你打出了一张【闪】。",
		GameEnums.TargetType.SELF, "armor_bagua_effect"
	))
	_register_card(_create_card(
		"armor_renwang", "仁王盾", GameEnums.CardType.EQUIPMENT, GameEnums.CardSubType.EQUIPMENT_ARMOR,
		GameEnums.CardSuit.CLUB, 2, "防具。黑色的【杀】对你无效。",
		GameEnums.TargetType.SELF, "armor_renwang_effect"
	))

	_register_card(_create_card(
		"mount_chitu", "赤兔马", GameEnums.CardType.EQUIPMENT, GameEnums.CardSubType.EQUIPMENT_MOUNT_OFFENSIVE,
		GameEnums.CardSuit.HEART, 5, "进攻坐骑。你与其他角色的距离-1。",
		GameEnums.TargetType.SELF, "mount_offensive_effect"
	))
	_register_card(_create_card(
		"mount_dilu", "的卢马", GameEnums.CardType.EQUIPMENT, GameEnums.CardSubType.EQUIPMENT_MOUNT_DEFENSIVE,
		GameEnums.CardSuit.CLUB, 5, "防御坐骑。其他角色与你的距离+1。",
		GameEnums.TargetType.SELF, "mount_defensive_effect"
	))
	_register_card(_create_card(
		"mount_jueying", "绝影马", GameEnums.CardType.EQUIPMENT, GameEnums.CardSubType.EQUIPMENT_MOUNT_DEFENSIVE,
		GameEnums.CardSuit.SPADE, 5, "防御坐骑。其他角色与你的距离+1。",
		GameEnums.TargetType.SELF, "mount_defensive_effect"
	))
	_register_card(_create_card(
		"mount_zhuahuang", "爪黄飞电", GameEnums.CardType.EQUIPMENT, GameEnums.CardSubType.EQUIPMENT_MOUNT_OFFENSIVE,
		GameEnums.CardSuit.HEART, 13, "进攻坐骑。你与其他角色的距离-1。",
		GameEnums.TargetType.SELF, "mount_offensive_effect"
	))

func _register_card(card: Card) -> void:
	_card_templates[card.id] = card
	_all_cards.append(card)

func get_card_template(id: String) -> Card:
	if _card_templates.has(id):
		return _card_templates[id].duplicate_card()
	push_error("CardDatabase: 卡牌模板不存在: " + id)
	return null

func create_full_deck() -> Array:
	var deck: Array = []
	for card_template in _all_cards:
		deck.append(card_template.duplicate_card())
	return deck

func create_shuffled_deck() -> Array:
	var deck = create_full_deck()
	deck.shuffle()
	return deck

func get_cards_by_type(card_type: GameEnums.CardType) -> Array:
	var result: Array = []
	for card in _all_cards:
		if card.card_type == card_type:
			result.append(card.duplicate_card())
	return result

func get_cards_by_sub_type(sub_type: GameEnums.CardSubType) -> Array:
	var result: Array = []
	for card in _all_cards:
		if card.card_sub_type == sub_type:
			result.append(card.duplicate_card())
	return result

func get_template_count() -> int:
	return _card_templates.size()
