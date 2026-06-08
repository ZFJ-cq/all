class_name PlayerPanel
extends Control

var player: Player = null
var is_current_turn: bool = false

var health_bar: ProgressBar = null
var name_label: Label = null
var identity_label: Label = null
var hero_label: Label = null
var card_count_label: Label = null
var skill_container: VBoxContainer = null
var equipment_container: HBoxContainer = null

signal player_panel_clicked(player: Player)

func _ready() -> void:
	_build_ui()

func _build_ui() -> void:
	var panel = PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(panel)

	var vbox = VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 4)
	panel.add_child(vbox)

	name_label = Label.new()
	name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(name_label)

	identity_label = Label.new()
	identity_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(identity_label)

	hero_label = Label.new()
	hero_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(hero_label)

	var health_hbox = HBoxContainer.new()
	vbox.add_child(health_hbox)

	var health_label = Label.new()
	health_label.text = "体力:"
	health_hbox.add_child(health_label)

	health_bar = ProgressBar.new()
	health_bar.min_value = 0
	health_bar.show_percentage = false
	health_bar.custom_minimum_size = Vector2(100, 20)
	health_hbox.add_child(health_bar)

	card_count_label = Label.new()
	card_count_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(card_count_label)

	var equip_label = Label.new()
	equip_label.text = "装备:"
	vbox.add_child(equip_label)

	equipment_container = HBoxContainer.new()
	vbox.add_child(equipment_container)

	var skill_label = Label.new()
	skill_label.text = "技能:"
	vbox.add_child(skill_label)

	skill_container = VBoxContainer.new()
	vbox.add_child(skill_container)

func setup(player_data: Player) -> void:
	player = player_data
	player.health_changed.connect(_on_health_changed)
	player.player_died.connect(_on_player_died)
	refresh()

func refresh() -> void:
	if player == null:
		return

	name_label.text = player.player_name

	if player.identity_revealed:
		identity_label.text = IdentityManager.get_identity_string(player.identity)
		identity_label.add_theme_color_override("font_color", IdentityManager.get_identity_color(player.identity))
	else:
		identity_label.text = "身份: ？"
		identity_label.add_theme_color_override("font_color", Color.GRAY)

	hero_label.text = player.get_hero_name()
	if player.hero != null:
		var faction_color = HeroManager.get_faction_color(player.hero.faction)
		hero_label.add_theme_color_override("font_color", faction_color)

	health_bar.max_value = player.max_health
	health_bar.value = player.current_health

	card_count_label.text = "手牌: %d" % player.hand.size()

	for child in equipment_container.get_children():
		child.queue_free()
	for slot in player.equipment:
		var card = player.equipment[slot]
		if card != null:
			var label = Label.new()
			label.text = card.get_display_name()
			equipment_container.add_child(label)

	for child in skill_container.get_children():
		child.queue_free()
	if player.hero != null:
		for skill in player.hero.skills:
			var label = Label.new()
			label.text = "%s: %s" % [skill.skill_name, skill.skill_description.left(20) + "..."]
			skill_container.add_child(label)

func _on_health_changed(_player: Player, _old: int, _new: int) -> void:
	refresh()

func _on_player_died(_player: Player, _killer: Player) -> void:
	refresh()
	modulate.a = 0.5

func set_current_turn(active: bool) -> void:
	is_current_turn = active
	if active:
		modulate = Color(1.2, 1.2, 1.0)
	else:
		modulate = Color(1.0, 1.0, 1.0)

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		player_panel_clicked.emit(player)
		accept_event()
