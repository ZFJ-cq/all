extends Control

func _ready() -> void:
	var return_button = $CenterContainer/VBoxContainer/ReturnButton
	return_button.pressed.connect(_on_return_pressed)

	EventBus.game_over.connect(_on_game_over)

func _on_game_over(winner: GameEnums.Identity) -> void:
	var result_label = $CenterContainer/VBoxContainer/ResultLabel
	var winner_label = $CenterContainer/VBoxContainer/WinnerLabel
	var identity_list = $CenterContainer/VBoxContainer/IdentityList

	var winner_name = IdentityManager.get_identity_string(winner)
	var winner_color = IdentityManager.get_identity_color(winner)

	match winner:
		GameEnums.Identity.LORD, GameEnums.Identity.LOYALIST:
			result_label.text = "主公阵营胜利！"
			result_label.add_theme_color_override("font_color", Color(1, 0.84, 0))
		GameEnums.Identity.REBEL:
			result_label.text = "反贼胜利！"
			result_label.add_theme_color_override("font_color", Color(0.9, 0.2, 0.2))
		GameEnums.Identity.SPY:
			result_label.text = "内奸胜利！"
			result_label.add_theme_color_override("font_color", Color(0.6, 0.2, 0.8))

	winner_label.text = "获胜方: %s" % winner_name
	winner_label.add_theme_color_override("font_color", winner_color)

	for child in identity_list.get_children():
		child.queue_free()

	for player in GameManager.players:
		var label = Label.new()
		var identity_str = IdentityManager.get_identity_string(player.identity)
		var identity_color = IdentityManager.get_identity_color(player.identity)
		var status = "存活" if player.is_alive else "阵亡"
		label.text = "%s - %s (%s) - %s" % [player.player_name, player.get_hero_name(), identity_str, status]
		label.add_theme_color_override("font_color", identity_color)
		identity_list.add_child(label)

func _on_return_pressed() -> void:
	GameManager._reset_game()
	get_tree().change_scene_to_file("res://scenes/main/main_menu.tscn")
