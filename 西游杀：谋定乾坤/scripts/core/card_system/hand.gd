class_name Hand
extends Node

var cards: Array = []
var hand_owner: Player = null
var max_hand_size: int = 999

signal hand_changed(hand: Hand)
signal card_added(card: Card)
signal card_removed(card: Card)
signal hand_overflow(hand: Hand, overflow_count: int)

func setup(player: Player) -> void:
	hand_owner = player

func add_card(card: Card) -> void:
	cards.append(card)
	card.owner_player = hand_owner
	card_added.emit(card)
	hand_changed.emit(self)

func add_cards(new_cards: Array) -> void:
	for card in new_cards:
		cards.append(card)
		card.owner_player = hand_owner
		card_added.emit(card)
	hand_changed.emit(self)

func remove_card(card: Card) -> bool:
	var idx = cards.find(card)
	if idx >= 0:
		cards.remove_at(idx)
		card.owner_player = null
		card_removed.emit(card)
		hand_changed.emit(self)
		return true
	return false

func remove_at(index: int) -> Card:
	if index < 0 or index >= cards.size():
		return null
	var card = cards[index]
	cards.remove_at(index)
	card.owner_player = null
	card_removed.emit(card)
	hand_changed.emit(self)
	return card

func get_card_at(index: int) -> Card:
	if index < 0 or index >= cards.size():
		return null
	return cards[index]

func has_card(card: Card) -> bool:
	return cards.has(card)

func has_card_of_sub_type(sub_type: GameEnums.CardSubType) -> bool:
	for card in cards:
		if card.card_sub_type == sub_type:
			return true
	return false

func get_cards_of_sub_type(sub_type: GameEnums.CardSubType) -> Array:
	var result: Array = []
	for card in cards:
		if card.card_sub_type == sub_type:
			result.append(card)
	return result

func get_cards_of_type(card_type: GameEnums.CardType) -> Array:
	var result: Array = []
	for card in cards:
		if card.card_type == card_type:
			result.append(card)
	return result

func get_playable_cards() -> Array:
	var result: Array = []
	for card in cards:
		if card.can_play(hand_owner):
			result.append(card)
	return result

func size() -> int:
	return cards.size()

func is_empty() -> bool:
	return cards.is_empty()

func discard_all() -> Array:
	var discarded = cards.duplicate()
	for card in cards:
		card.owner_player = null
	cards.clear()
	hand_changed.emit(self)
	return discarded

func check_overflow(current_health: int) -> int:
	var overflow = cards.size() - current_health
	if overflow > 0:
		hand_overflow.emit(self, overflow)
	return overflow

func sort_by_type() -> void:
	cards.sort_custom(func(a: Card, b: Card) -> bool:
		if a.card_type != b.card_type:
			return a.card_type < b.card_type
		if a.card_sub_type != b.card_sub_type:
			return a.card_sub_type < b.card_sub_type
		if a.suit != b.suit:
			return a.suit < b.suit
		return a.number < b.number
	)
	hand_changed.emit(self)
