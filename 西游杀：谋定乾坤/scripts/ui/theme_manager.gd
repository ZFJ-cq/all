class_name ThemeManager
extends Node

static var game_theme: Theme = null

static func get_theme() -> Theme:
	if game_theme == null:
		game_theme = _create_theme()
	return game_theme

static func _create_theme() -> Theme:
	var theme = Theme.new()

	var default_font = ThemeDB.fallback_font
	var default_font_size = 16

	theme.set_default_font(default_font)
	theme.set_default_font_size(default_font_size)

	theme.set_color("font_color", "Label", Color(0.95, 0.9, 0.8))
	theme.set_font_size("font_size", "Label", 16)

	theme.set_color("font_color", "Button", Color(0.95, 0.9, 0.8))
	theme.set_color("font_hover_color", "Button", Color(1, 0.95, 0.7))
	theme.set_color("font_pressed_color", "Button", Color(0.8, 0.75, 0.5))
	theme.set_stylebox("normal", "Button", _create_button_style(Color(0.2, 0.15, 0.25), Color(0.5, 0.4, 0.3)))
	theme.set_stylebox("hover", "Button", _create_button_style(Color(0.3, 0.22, 0.35), Color(0.7, 0.55, 0.35)))
	theme.set_stylebox("pressed", "Button", _create_button_style(Color(0.15, 0.1, 0.2), Color(0.6, 0.5, 0.3)))
	theme.set_font_size("font_size", "Button", 18)

	theme.set_stylebox("panel", "PanelContainer", _create_panel_style(Color(0.12, 0.08, 0.18, 0.9), Color(0.4, 0.3, 0.2)))

	theme.set_color("font_color", "RichTextLabel", Color(0.9, 0.85, 0.75))
	theme.set_stylebox("normal", "RichTextLabel", _create_panel_style(Color(0.08, 0.05, 0.12, 0.8), Color(0.3, 0.25, 0.15)))

	theme.set_stylebox("fill", "ProgressBar", _create_progress_fill())
	theme.set_stylebox("background", "ProgressBar", _create_progress_bg())

	return theme

static func _create_button_style(bg_color: Color, border_color: Color) -> StyleBoxFlat:
	var style = StyleBoxFlat.new()
	style.bg_color = bg_color
	style.border_color = border_color
	style.set_border_width_all(2)
	style.set_corner_radius_all(6)
	style.set_content_margin_all(8)
	return style

static func _create_panel_style(bg_color: Color, border_color: Color) -> StyleBoxFlat:
	var style = StyleBoxFlat.new()
	style.bg_color = bg_color
	style.border_color = border_color
	style.set_border_width_all(2)
	style.set_corner_radius_all(4)
	style.set_content_margin_all(6)
	return style

static func _create_progress_fill() -> StyleBoxFlat:
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.8, 0.2, 0.2)
	style.set_corner_radius_all(3)
	return style

static func _create_progress_bg() -> StyleBoxFlat:
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.15, 0.1, 0.2)
	style.border_color = Color(0.4, 0.3, 0.2)
	style.set_border_width_all(1)
	style.set_corner_radius_all(3)
	return style

static func get_card_type_color(card_type: GameEnums.CardType) -> Color:
	match card_type:
		GameEnums.CardType.BASIC: return Color(0.9, 0.7, 0.5)
		GameEnums.CardType.SCHEME: return Color(0.5, 0.8, 0.5)
		GameEnums.CardType.EQUIPMENT: return Color(0.8, 0.7, 0.3)
		_: return Color.WHITE

static func get_suit_color(is_red: bool) -> Color:
	if is_red:
		return Color(1.0, 0.25, 0.25)
	return Color(0.15, 0.15, 0.15)
