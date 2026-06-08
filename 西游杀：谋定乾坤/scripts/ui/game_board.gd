class_name GameBoard
extends Control

var card_widgets: Array = []
var player_panels: Array = []
var selected_card: CardWidget = null
var target_selection_mode: bool = false
var pending_card: Card = null
var discard_mode: bool = false
var discard_count: int = 0
var discard_selected: Array = []

var hand_container: HBoxContainer = null
var player_area: VBoxContainer = null
var opponent_area: HBoxContainer = null
var info_bar: HBoxContainer = null
var action_bar: HBoxContainer = null
var phase_label: Label = null
var log_label: RichTextLabel = null
var end_turn_button: Button = null
var confirm_button: Button = null
var cancel_button: Button = null
var description_label: Label = null

signal play_card_requested(card: Card, targets: Array)
signal discard_requested(cards: Array)
signal end_turn_requested
signal response_provided(card: Card)

func _ready() -> void:
	_build_ui()
	_connect_signals()

func _build_ui() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)

	var main_vbox = VBoxContainer.new()
	main_vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(main_vbox)

	opponent_area = HBoxContainer.new()
	opponent_area.custom_minimum_size = Vector2(0, 200)
	opponent_area.add_theme_constant_override("separation", 10)
	main_vbox.add_child(opponent_area)

	var center_area = HBoxContainer.new()
	center_area.custom_minimum_size = Vector2(0, 400)
	main_vbox.add_child(center_area)

	var left_panel = VBoxContainer.new()
	left_panel.custom_minimum_size = Vector2(200, 0)
	center_area.add_child(left_panel)

	log_label = RichTextLabel.new()
	log_label.custom_minimum_size = Vector2(200, 350)
	log_label.bbcode_enabled = true
	left_panel.add_child(log_label)

	var game_area = VBoxContainer.new()
	game_area.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	center_area.add_child(game_area)

	info_bar = HBoxContainer.new()
	game_area.add_child(info_bar)

	phase_label = Label.new()
	phase_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	phase_label.add_theme_font_size_override("font_size", 24)
	game_area.add_child(phase_label)

	description_label = Label.new()
	description_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	description_label.add_theme_color_override("font_color", Color(0.8, 0.8, 0.8))
	game_area.add_child(description_label)

	var right_panel = VBoxContainer.new()
	right_panel.custom_minimum_size = Vector2(200, 0)
	center_area.add_child(right_panel)

	player_area = VBoxContainer.new()
	player_area.add_theme_constant_override("separation", 5)
	right_panel.add_child(player_area)

	var bottom_area = VBoxContainer.new()
	bottom_area.custom_minimum_size = Vector2(0, 200)
	main_vbox.add_child(bottom_area)

	hand_container = HBoxContainer.new()
	hand_container.add_theme_constant_override("separation", -30)
	hand_container.alignment = BoxContainer.ALIGNMENT_CENTER
	bottom_area.add_child(hand_container)

	action_bar = HBoxContainer.new()
	action_bar.alignment = BoxContainer.ALIGNMENT_CENTER
	action_bar.add_theme_constant_override("separation", 20)
	bottom_area.add_child(action_bar)

	end_turn_button = Button.new()
	end_turn_button.text = "结束出牌"
	end_turn_button.custom_minimum_size = Vector2(120, 40)
	action_bar.add_child(end_turn_button)

	confirm_button = Button.new()
	confirm_button.text = "确认"
	confirm_button.custom_minimum_size = Vector2(100, 40)
	confirm_button.visible = false
	action_bar.add_child(confirm_button)

	cancel_button = Button.new()
	cancel_button.text = "取消"
	cancel_button.custom_minimum_size = Vector2(100, 40)
	cancel_button.visible = false
	action_bar.add_child(cancel_button)

func _connect_signals() -> void:
	end_turn_button.pressed.connect(_on_end_turn_pressed)
	confirm_button.pressed.connect(_on_confirm_pressed)
	cancel_button.pressed.connect(_on_cancel_pressed)
	TurnManager.turn_started.connect(_on_turn_started)
	TurnManager.phase_started.connect(_on_phase_started)
	TurnManager.request_play_card.connect(_on_request_play_card)
	TurnManager.request_discard.connect(_on_request_discard)
	TurnManager.request_response_card.connect(_on_request_response)
	EventBus.card_played.connect(_on_card_played)
	EventBus.damage_dealt.connect(_on_damage_dealt)
	EventBus.healing_applied.connect(_on_healing_applied)
	EventBus.hero_died.connect(_on_hero_died)
	EventBus.game_over.connect(_on_game_over)
	EventBus.identity_revealed.connect(_on_identity_revealed)
	EventBus.skill_triggered.connect(_on_skill_triggered)

func setup_game_board() -> void:
	_clear_board()

	for child in opponent_area.get_children():
		child.queue_free()
	player_panels.clear()

	var human_player = GameManager.get_human_player()
	for player in GameManager.players:
		var panel = PlayerPanel.new()
		panel.setup(player)
		panel.player_panel_clicked.connect(_on_player_panel_clicked)
		player_panels.append(panel)
		if player == human_player:
			player_area.add_child(panel)
		else:
			opponent_area.add_child(panel)

	_refresh_hand()
	_update_info_bar()
	add_log("[color=yellow]游戏开始！[/color]")

func _clear_board() -> void:
	for child in hand_container.get_children():
		child.queue_free()
	card_widgets.clear()
	selected_card = null

func _refresh_hand() -> void:
	for child in hand_container.get_children():
		child.queue_free()
	card_widgets.clear()

	var human = GameManager.get_human_player()
	if human == null:
		return

	var is_my_turn = TurnManager.current_player == human and TurnManager.current_phase == GameEnums.TurnPhase.PLAY

	for card in human.hand.get_all_cards():
		var widget = CardWidget.new()
		widget.setup(card)
		widget.card_clicked.connect(_on_card_clicked)
		widget.card_hovered.connect(_on_card_hovered)
		widget.card_unhovered.connect(_on_card_unhovered)
		widget.set_playable(is_my_turn and card.can_play(human))
		hand_container.add_child(widget)
		card_widgets.append(widget)

func _update_info_bar() -> void:
	for child in info_bar.get_children():
		child.queue_free()

	var draw_label = Label.new()
	draw_label.text = "牌堆: %d" % GameManager.get_draw_pile_count()
	info_bar.add_child(draw_label)

	var discard_label = Label.new()
	discard_label.text = "弃牌堆: %d" % GameManager.get_discard_pile_count()
	info_bar.add_child(discard_label)

	var turn_label = Label.new()
	turn_label.text = "回合: %d" % TurnManager.current_turn
	info_bar.add_child(turn_label)

	var alive_label = Label.new()
	alive_label.text = "存活: %d" % GameManager.get_alive_players().size()
	info_bar.add_child(alive_label)

func _on_turn_started(player: Player) -> void:
	add_log("[color=cyan]%s 的回合开始[/color]" % player.player_name)
	for panel in player_panels:
		panel.set_current_turn(panel.player == player)
	_refresh_hand()
	_update_info_bar()

func _on_phase_started(player: Player, phase: GameEnums.TurnPhase) -> void:
	phase_label.text = "%s - %s" % [player.player_name, TurnManager.get_current_phase_string()]
	if phase == GameEnums.TurnPhase.PLAY:
		var human = GameManager.get_human_player()
		if player == human:
			end_turn_button.visible = true
			_refresh_hand()
		else:
			end_turn_button.visible = false
	elif phase == GameEnums.TurnPhase.DRAW:
		add_log("%s 摸了2张牌" % player.player_name)
		await get_tree().create_timer(0.3).timeout
		_refresh_hand()
		_update_info_bar()

func _on_request_play_card(player: Player) -> void:
	if player.is_human:
		end_turn_button.visible = true
		_refresh_hand()

func _on_request_discard(player: Player, count: int) -> void:
	if player.is_human:
		discard_mode = true
		discard_count = count
		discard_selected.clear()
		end_turn_button.visible = false
		confirm_button.visible = true
		cancel_button.visible = false
		add_log("[color=orange]请弃置%d张牌[/color]" % count)
		_refresh_hand()

func _on_request_response(player: Player, card_type: GameEnums.CardSubType) -> void:
	var type_name = ""
	match card_type:
		GameEnums.CardSubType.DODGE: type_name = "闪"
		GameEnums.CardSubType.ATTACK: type_name = "杀"
		_: type_name = "牌"
	add_log("[color=red]请打出【%s】响应[/color]" % type_name)
	confirm_button.visible = true
	cancel_button.visible = true
	_refresh_hand()

func _on_card_clicked(widget: CardWidget) -> void:
	if discard_mode:
		_handle_discard_click(widget)
		return

	if target_selection_mode:
		return

	if not widget.is_playable:
		return

	var human = GameManager.get_human_player()
	if human == null:
		return

	var card = widget.card
	match card.target_type:
		GameEnums.TargetType.NONE, GameEnums.TargetType.SELF:
			_play_card(human, card, [])
		GameEnums.TargetType.OTHER_SINGLE, GameEnums.TargetType.ANY_PLAYER:
			target_selection_mode = true
			pending_card = card
			selected_card = widget
			add_log("[color=yellow]请选择目标[/color]")
		GameEnums.TargetType.ALL_OTHERS, GameEnums.TargetType.ALL_PLAYERS:
			var targets = card.get_valid_targets(human)
			_play_card(human, card, targets)

func _on_player_panel_clicked(player: Player) -> void:
	if not target_selection_mode or pending_card == null:
		return

	var human = GameManager.get_human_player()
	var valid_targets = pending_card.get_valid_targets(human)
	if player in valid_targets:
		_play_card(human, pending_card, [player])
		target_selection_mode = false
		pending_card = null
		selected_card = null

func _handle_discard_click(widget: CardWidget) -> void:
	if widget.is_selected:
		widget.is_selected = false
		discard_selected.erase(widget.card)
	else:
		if discard_selected.size() < discard_count:
			widget.is_selected = true
			discard_selected.append(widget.card)

	if discard_selected.size() == discard_count:
		confirm_button.visible = true
	else:
		confirm_button.visible = false

	widget.queue_redraw()

func _play_card(player: Player, card: Card, targets: Array) -> void:
	var result = GameManager.play_card(player, card, targets)
	if result.get("success", false):
		add_log("[color=green]%s 使用了【%s】[/color]" % [player.player_name, card.get_display_name()])
	_refresh_hand()
	_update_info_bar()
	for panel in player_panels:
		panel.refresh()

func _on_end_turn_pressed() -> void:
	if discard_mode:
		return
	end_turn_button.visible = false
	TurnManager.end_play_phase()

func _on_confirm_pressed() -> void:
	if discard_mode:
		if discard_selected.size() == discard_count:
			GameManager.discard_cards(GameManager.get_human_player(), discard_selected)
			discard_mode = false
			discard_selected.clear()
			confirm_button.visible = false
			_refresh_hand()
			TurnManager.end_discard_phase()
	else:
		confirm_button.visible = false
		cancel_button.visible = false

func _on_cancel_pressed() -> void:
	confirm_button.visible = false
	cancel_button.visible = false
	target_selection_mode = false
	pending_card = null
	if selected_card != null:
		selected_card.reset_position()
		selected_card = null
	EventBus.response_provided.emit(GameManager.get_human_player(), null)

func _on_card_hovered(widget: CardWidget) -> void:
	if widget.card != null:
		description_label.text = widget.card.get_display_name() + ": " + widget.card.description

func _on_card_unhovered(_widget: CardWidget) -> void:
	description_label.text = ""

func _on_card_played(card: Card, player: Player, _targets: Array) -> void:
	if not player.is_human:
		add_log("%s 使用了【%s】" % [player.player_name, card.get_display_name()])
	_refresh_hand()
	_update_info_bar()

func _on_damage_dealt(source: Player, target: Player, amount: int, _type: GameEnums.CardSubType) -> void:
	var source_name = source.player_name if source != null else "系统"
	add_log("[color=red]%s 对 %s 造成了%d点伤害[/color]" % [source_name, target.player_name, amount])
	_refresh_hand()
	_update_info_bar()
	for panel in player_panels:
		panel.refresh()

func _on_healing_applied(source: Player, target: Player, amount: int) -> void:
	add_log("[color=green]%s 回复了%d点体力[/color]" % [target.player_name, amount])
	_refresh_hand()
	_update_info_bar()
	for panel in player_panels:
		panel.refresh()

func _on_hero_died(player: Player, killer: Player) -> void:
	var killer_name = killer.player_name if killer != null else "系统"
	add_log("[color=red]%s 阵亡！（由 %s 击杀）[/color]" % [player.player_name, killer_name])
	_refresh_hand()
	_update_info_bar()

func _on_identity_revealed(player: Player, identity: GameEnums.Identity) -> void:
	add_log("[color=yellow]%s 的身份是: %s[/color]" % [player.player_name, IdentityManager.get_identity_string(identity)])
	for panel in player_panels:
		panel.refresh()

func _on_skill_triggered(player: Player, skill_name: String) -> void:
	add_log("[color=cyan]%s 发动了技能【%s】[/color]" % [player.player_name, skill_name])

func _on_game_over(winner: GameEnums.Identity) -> void:
	var winner_name = IdentityManager.get_identity_string(winner)
	add_log("[color=yellow]========== 游戏结束！%s 获胜！==========[/color]" % winner_name)
	phase_label.text = "游戏结束 - %s获胜" % winner_name
	end_turn_button.visible = false
	confirm_button.visible = false
	cancel_button.visible = false

func add_log(text: String) -> void:
	if log_label != null:
		log_label.append_text(text + "\n")
