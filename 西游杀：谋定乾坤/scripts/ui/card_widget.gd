class_name CardWidget
extends Control

var card: Card = null
var is_selected: bool = false
var is_hovered: bool = false
var is_dragging: bool = false
var is_playable: bool = false
var drag_offset: Vector2 = Vector2.ZERO
var original_position: Vector2 = Vector2.ZERO

signal card_clicked(card_widget: CardWidget)
signal card_drag_started(card_widget: CardWidget)
signal card_drag_ended(card_widget: CardWidget)
signal card_hovered(card_widget: CardWidget)
signal card_unhovered(card_widget: CardWidget)

var CARD_WIDTH: float = 100.0
var CARD_HEIGHT: float = 140.0

func _ready() -> void:
	custom_minimum_size = Vector2(CARD_WIDTH, CARD_HEIGHT)
	mouse_filter = Control.MOUSE_FILTER_PASS

func setup(card_data: Card) -> void:
	card = card_data
	queue_redraw()

func _draw() -> void:
	var rect = Rect2(Vector2.ZERO, size)
	var bg_color = _get_card_background()
	var border_color = _get_card_border()

	if is_selected:
		border_color = Color(1, 1, 0)
	elif is_hovered:
		border_color = Color(1, 1, 1)

	draw_rect(rect, border_color, false, 3.0)
	var inner_rect = rect.grow(-3.0)
	draw_rect(inner_rect, bg_color)

	if card == null:
		return

	if not card.is_face_up:
		draw_rect(inner_rect, Color(0.3, 0.3, 0.5))
		var center = inner_rect.size / 2
		draw_string(ThemeDB.fallback_font, Vector2(center.x - 15, center.y + 5), "西游", HORIZONTAL_ALIGNMENT_CENTER, -1, 16, Color(0.8, 0.7, 0.3))
		return

	var suit_color = Color.WHITE
	if card.is_red:
		suit_color = Color(1.0, 0.2, 0.2)
	else:
		suit_color = Color(0.1, 0.1, 0.1)

	draw_string(ThemeDB.fallback_font, Vector2(8, 20), card.get_suit_string(), HORIZONTAL_ALIGNMENT_LEFT, -1, 16, suit_color)
	draw_string(ThemeDB.fallback_font, Vector2(8, 38), card.get_number_string(), HORIZONTAL_ALIGNMENT_LEFT, -1, 14, suit_color)

	var name_text = card.get_display_name()
	var name_font_size = 14
	if name_text.length() > 3:
		name_font_size = 12
	draw_string(ThemeDB.fallback_font, Vector2(CARD_WIDTH / 2 - name_text.length() * name_font_size / 4, CARD_HEIGHT / 2 + 5), name_text, HORIZONTAL_ALIGNMENT_LEFT, -1, name_font_size, Color.WHITE)

	var type_text = card.get_type_string()
	draw_string(ThemeDB.fallback_font, Vector2(8, CARD_HEIGHT - 10), type_text, HORIZONTAL_ALIGNMENT_LEFT, -1, 10, Color(0.7, 0.7, 0.7))

	if not is_playable:
		draw_rect(inner_rect, Color(0, 0, 0, 0.4))

func _get_card_background() -> Color:
	if card == null:
		return Color(0.2, 0.2, 0.2)
	match card.card_type:
		GameEnums.CardType.BASIC:
			match card.card_sub_type:
				GameEnums.CardSubType.ATTACK: return Color(0.6, 0.15, 0.15)
				GameEnums.CardSubType.DODGE: return Color(0.15, 0.4, 0.6)
				GameEnums.CardSubType.PEACH: return Color(0.6, 0.2, 0.3)
				_: return Color(0.3, 0.3, 0.3)
		GameEnums.CardType.SCHEME: return Color(0.15, 0.35, 0.15)
		GameEnums.CardType.EQUIPMENT: return Color(0.4, 0.3, 0.15)
		_: return Color(0.3, 0.3, 0.3)

func _get_card_border() -> Color:
	if card == null:
		return Color(0.5, 0.5, 0.5)
	match card.card_type:
		GameEnums.CardType.BASIC: return Color(0.8, 0.6, 0.4)
		GameEnums.CardType.SCHEME: return Color(0.4, 0.7, 0.4)
		GameEnums.CardType.EQUIPMENT: return Color(0.7, 0.6, 0.3)
		_: return Color(0.5, 0.5, 0.5)

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.pressed:
				is_dragging = true
				drag_offset = event.position
				original_position = position
				card_drag_started.emit(self)
			else:
				if is_dragging:
					is_dragging = false
					card_drag_ended.emit(self)
					if position.distance_to(original_position) < 10:
						is_selected = not is_selected
						card_clicked.emit(self)
			accept_event()
	elif event is InputEventMouseMotion:
		if is_dragging:
			position += event.relative
			accept_event()

func _notification(what: int) -> void:
	if what == NOTIFICATION_MOUSE_ENTER:
		is_hovered = true
		card_hovered.emit(self)
		queue_redraw()
	elif what == NOTIFICATION_MOUSE_EXIT:
		is_hovered = false
		card_unhovered.emit(self)
		queue_redraw()

func set_playable(playable: bool) -> void:
	is_playable = playable
	queue_redraw()

func reset_position() -> void:
	position = original_position
	is_selected = false
	is_dragging = false
	queue_redraw()

func get_card_description() -> String:
	if card == null:
		return ""
	return card.description
