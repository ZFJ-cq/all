extends Control

var selected_player_count: int = 5

func _ready() -> void:
	_connect_buttons()

func _connect_buttons() -> void:
	var vbox = $CenterContainer/VBoxContainer
	var count_box = vbox.get_node("PlayerCountBox")

	for child in count_box.get_children():
		if child is Button:
			child.pressed.connect(_on_count_button_pressed.bind(child))

	vbox.get_node("StartButton").pressed.connect(_on_start_pressed)
	vbox.get_node("RulesButton").pressed.connect(_on_rules_pressed)
	vbox.get_node("QuitButton").pressed.connect(_on_quit_pressed)

	_update_count_buttons()

func _on_count_button_pressed(button: Button) -> void:
	var text = button.text.replace("人", "")
	selected_player_count = int(text)
	_update_count_buttons()

func _update_count_buttons() -> void:
	var vbox = $CenterContainer/VBoxContainer
	var count_box = vbox.get_node("PlayerCountBox")
	for child in count_box.get_children():
		if child is Button:
			var count = int(child.text.replace("人", ""))
			if count == selected_player_count:
				child.modulate = Color(1.5, 1.5, 0.8)
			else:
				child.modulate = Color(1, 1, 1)

func _on_start_pressed() -> void:
	GameManager.initialize_game(selected_player_count, 0)

	for player in GameManager.players:
		if not player.is_human:
			var ai = AIController.new(randi() % 4)
			ai.name = "AIController"
			player.add_child(ai)

	get_tree().change_scene_to_file("res://scenes/game/game_board.tscn")

	await get_tree().create_timer(0.5).timeout

	var board = get_tree().current_scene
	if board and board is GameBoard:
		board.setup_game_board()
		GameManager.start_game()

func _on_rules_pressed() -> void:
	var rules = """
	=== 西游杀：谋定乾坤 规则 ===

	【身份】
	• 主公：消灭所有反贼和内奸
	• 忠臣：保护主公，消灭反贼和内奸
	• 反贼：推翻主公
	• 内奸：成为最后的幸存者

	【回合流程】
	1. 准备阶段：触发准备阶段技能
	2. 判定阶段：处理判定区的延时锦囊
	3. 摸牌阶段：摸2张牌
	4. 出牌阶段：使用手牌（每回合限用1张杀）
	5. 弃牌阶段：手牌超过体力值需弃牌
	6. 结束阶段：触发结束阶段技能

	【基本牌】
	• 杀：对攻击范围内角色造成1点伤害
	• 闪：抵消一张杀
	• 桃：回复1点体力

	【胜利条件】
	• 主公+忠臣：消灭所有反贼和内奸
	• 反贼：主公阵亡
	• 内奸：在所有其他角色阵亡后存活
	"""
	print(rules)

func _on_quit_pressed() -> void:
	get_tree().quit()
