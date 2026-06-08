class_name Pile
extends Node

enum PileType {
	DRAW,
	DISCARD,
	JUDGE,
	DECK,
}

var pile_type: PileType = PileType.DRAW
var cards: Array = []
var pile_name: String = ""

signal pile_changed(pile: Pile)
signal pile_emptied(pile: Pile)

func setup(p_name: String = "", p_type: PileType = PileType.DRAW) -> void:
	pile_name = p_name
	pile_type = p_type

func add_card(card: Card, to_bottom: bool = false) -> void:
	if to_bottom:
		cards.push_front(card)
	else:
		cards.append(card)
	card.owner_player = null
	pile_changed.emit(self)

func add_cards(new_cards: Array, to_bottom: bool = false) -> void:
	for card in new_cards:
		if to_bottom:
			cards.push_front(card)
		else:
			cards.append(card)
		card.owner_player = null
	pile_changed.emit(self)

func draw_card() -> Card:
	if cards.is_empty():
		pile_emptied.emit(self)
		return null
	var card = cards.pop_back()
	pile_changed.emit(self)
	return card

func draw_cards(count: int) -> Array:
	var drawn: Array = []
	for i in range(count):
		var card = draw_card()
		if card == null:
			break
		drawn.append(card)
	return drawn

func peek_card() -> Card:
	if cards.is_empty():
		return null
	return cards[cards.size() - 1]

func peek_top(count: int) -> Array:
	var result: Array = []
	var start = max(0, cards.size() - count)
	for i in range(start, cards.size()):
		result.append(cards[i])
	return result

func remove_card(card: Card) -> bool:
	var idx = cards.find(card)
	if idx >= 0:
		cards.remove_at(idx)
		pile_changed.emit(self)
		return true
	return false

func remove_at(index: int) -> Card:
	if index < 0 or index >= cards.size():
		return null
	var card = cards[index]
	cards.remove_at(index)
	pile_changed.emit(self)
	return card

func shuffle() -> void:
	cards.shuffle()
	pile_changed.emit(self)

func clear() -> void:
	cards.clear()
	pile_changed.emit(self)

func size() -> int:
	return cards.size()

func is_empty() -> bool:
	return cards.is_empty()

func has_card(card: Card) -> bool:
	return cards.has(card)

func get_card_at(index: int) -> Card:
	if index < 0 or index >= cards.size():
		return null
	return cards[index]

func get_all_cards() -> Array:
	return cards.duplicate()

func reshuffle_from_discard(discard_pile: Pile) -> void:
	var discarded = discard_pile.get_all_cards()
	discard_pile.clear()
	for card in discarded:
		card.is_face_up = true
	add_cards(discarded)
	shuffle()
