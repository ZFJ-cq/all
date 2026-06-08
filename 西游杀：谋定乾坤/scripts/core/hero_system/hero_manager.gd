extends Node

var _heroes: Dictionary = {}

func _ready() -> void:
	_init_heroes()

func _init_heroes() -> void:
	_init_tang_monk_party()
	_init_demons()
	_init_heavenly_court()

func _create_hero(id: String, name: String, title: String, faction: GameEnums.HeroFaction, health: int, is_male: bool, desc: String, skills: Array) -> HeroData:
	var hero = HeroData.new()
	hero.hero_id = id
	hero.hero_name = name
	hero.hero_title = title
	hero.faction = faction
	hero.base_health = health
	hero.is_male = is_male
	hero.description = desc
	hero.skills = skills
	return hero

func _create_skill(name: String, desc: String, trigger: HeroSkill.TriggerType, type: HeroSkill.SkillType = HeroSkill.SkillType.NORMAL, once_turn: bool = false, effect: String = "", conds: Dictionary = {}) -> HeroSkill:
	var skill = HeroSkill.new()
	skill.skill_name = name
	skill.skill_description = desc
	skill.trigger_type = trigger
	skill.skill_type = type
	skill.once_per_turn = once_turn
	skill.effect_script = effect
	skill.conditions = conds
	return skill

func _init_tang_monk_party() -> void:
	var wukong = _create_hero("sun_wukong", "孙悟空", "齐天大圣", GameEnums.HeroFaction.TANG_MONK_PARTY, 4, true,
		"花果山石猴，大闹天宫，护送唐僧西天取经。",
		[
			_create_skill("金箍棒", "你可以将一张基本牌当【杀】使用或打出。", HeroSkill.TriggerType.ACTIVE, HeroSkill.SkillType.NORMAL, false, "jin_gu_bang"),
			_create_skill("筋斗云", "锁定技，你与其他角色的距离-1。", HeroSkill.TriggerType.PASSIVE, HeroSkill.SkillType.LOCKED, false, "jin_dou_yun"),
			_create_skill("七十二变", "每回合限一次，当你受到伤害时，你可以弃一张手牌来抵消此伤害。", HeroSkill.TriggerType.ON_DAMAGE_RECEIVED, HeroSkill.SkillType.NORMAL, true, "qi_shi_er_bian"),
		]
	)
	_register_hero(wukong)

	var tangseng = _create_hero("tang_seng", "唐僧", "金蝉子", GameEnums.HeroFaction.TANG_MONK_PARTY, 3, true,
		"前世金蝉子，西天取经的领队，慈悲为怀。",
		[
			_create_skill("紧箍咒", "出牌阶段限一次，你可以令一名其他角色本回合不能使用或打出牌。", HeroSkill.TriggerType.ACTIVE, HeroSkill.SkillType.NORMAL, true, "jin_gu_zhou"),
			_create_skill("慈悲", "锁定技，你每回复1点体力时，摸一张牌。", HeroSkill.TriggerType.ON_HEAL_RECEIVED, HeroSkill.SkillType.LOCKED, false, "ci_bei"),
			_create_skill("西行", "主公技，其他忠臣角色在其出牌阶段可以交给你一张手牌。", HeroSkill.TriggerType.PASSIVE, HeroSkill.SkillType.LOCKED, false, "xi_xing"),
		]
	)
	_register_hero(tangseng)

	var bajie = _create_hero("zhu_bajie", "猪八戒", "天蓬元帅", GameEnums.HeroFaction.TANG_MONK_PARTY, 4, true,
		"原天蓬元帅，因调戏嫦娥被贬下凡，后随唐僧取经。",
		[
			_create_skill("贪吃", "当你受到1点伤害后，你可以摸两张牌。", HeroSkill.TriggerType.ON_DAMAGE_RECEIVED, HeroSkill.SkillType.NORMAL, false, "tan_chi"),
			_create_skill("厚皮", "锁定技，你每回合第一次受到伤害时，伤害-1。", HeroSkill.TriggerType.ON_DAMAGE_RECEIVED, HeroSkill.SkillType.LOCKED, false, "hou_pi"),
		]
	)
	_register_hero(bajie)

	var shaseng = _create_hero("sha_seng", "沙僧", "卷帘大将", GameEnums.HeroFaction.TANG_MONK_PARTY, 4, true,
		"原卷帘大将，因失手打碎琉璃盏被贬，后随唐僧取经。",
		[
			_create_skill("挑担", "你的手牌上限+2。", HeroSkill.TriggerType.PASSIVE, HeroSkill.SkillType.LOCKED, false, "tiao_dan"),
			_create_skill("降妖", "出牌阶段限一次，你可以弃一张牌然后对一名角色造成1点伤害。", HeroSkill.TriggerType.ACTIVE, HeroSkill.SkillType.NORMAL, true, "jiang_yao"),
		]
	)
	_register_hero(shaseng)

	var bailongma = _create_hero("bai_long_ma", "白龙马", "西海龙王三太子", GameEnums.HeroFaction.TANG_MONK_PARTY, 3, true,
		"西海龙王三太子，因纵火烧了殿上明珠被贬，化身白马驮唐僧取经。",
		[
			_create_skill("龙魂", "你可以将红色手牌当【桃】使用，黑色手牌当【杀】使用。", HeroSkill.TriggerType.ACTIVE, HeroSkill.SkillType.NORMAL, false, "long_hun"),
			_create_skill("化身", "当你成为其他角色使用牌的目标后，你可以弃一张牌将此牌转移给另一名其他角色。", HeroSkill.TriggerType.ON_CARD_TARGETED, HeroSkill.SkillType.NORMAL, false, "hua_shen"),
		]
	)
	_register_hero(bailongma)

func _init_demons() -> void:
	var baigujing = _create_hero("bai_gu_jing", "白骨精", "白骨夫人", GameEnums.HeroFaction.DEMON, 3, false,
		"白骨成精，三次变化欲吃唐僧肉，被孙悟空识破。",
		[
			_create_skill("离间", "出牌阶段限一次，你可以弃一张牌并选择两名其他角色，令其中一名角色对另一名角色使用一张【杀】。", HeroSkill.TriggerType.ACTIVE, HeroSkill.SkillType.NORMAL, true, "li_jian"),
			_create_skill("化尸", "当你造成伤害后，你可以摸一张牌。", HeroSkill.TriggerType.ON_DAMAGE_DEALT, HeroSkill.SkillType.NORMAL, false, "hua_shi"),
		]
	)
	_register_hero(baigujing)

	var numowang = _create_hero("niu_mo_wang", "牛魔王", "平天大圣", GameEnums.HeroFaction.DEMON, 5, true,
		"孙悟空的结拜大哥，七大圣之首，力大无穷。",
		[
			_create_skill("蛮力", "你使用【杀】造成的伤害+1。", HeroSkill.TriggerType.ON_DAMAGE_DEALT, HeroSkill.SkillType.LOCKED, false, "man_li"),
			_create_skill("称兄", "当其他角色对你使用牌时，若其手牌数小于你，该牌对你无效。", HeroSkill.TriggerType.ON_CARD_TARGETED, HeroSkill.SkillType.LOCKED, false, "cheng_xiong"),
		]
	)
	_register_hero(numowang)

	var honghaier = _create_hero("hong_hai_er", "红孩儿", "圣婴大王", GameEnums.HeroFaction.DEMON, 3, true,
		"牛魔王之子，会使三昧真火，武艺高强。",
		[
			_create_skill("三昧真火", "出牌阶段限一次，你可以弃一张红色牌，对一名角色造成1点火焰伤害。此伤害不能被【闪】抵消。", HeroSkill.TriggerType.ACTIVE, HeroSkill.SkillType.NORMAL, true, "san_mei_zhen_huo"),
			_create_skill("火眼", "锁定技，你观看牌堆顶的两张牌。", HeroSkill.TriggerType.ON_DRAW, HeroSkill.SkillType.LOCKED, false, "huo_yan"),
		]
	)
	_register_hero(honghaier)

	var tieshan = _create_hero("tie_shan_gong_zhu", "铁扇公主", "罗刹女", GameEnums.HeroFaction.DEMON, 3, false,
		"牛魔王之妻，持有芭蕉扇，能灭火焰山之火。",
		[
			_create_skill("芭蕉扇", "出牌阶段限一次，你可以弃一张牌，令一名角色弃置所有手牌然后摸等量的牌。", HeroSkill.TriggerType.ACTIVE, HeroSkill.SkillType.NORMAL, true, "ba_jiao_shan"),
			_create_skill("扇风", "当你成为【杀】的目标时，你可以弃一张牌令此【杀】无效。", HeroSkill.TriggerType.ON_CARD_TARGETED, HeroSkill.SkillType.NORMAL, false, "shan_feng"),
		]
	)
	_register_hero(tieshan)

	var spider_queen = _create_hero("zhi_zhu_jing", "蜘蛛精", "盘丝洞主", GameEnums.HeroFaction.DEMON, 3, false,
		"盘丝洞七仙之首，善吐丝结网困人。",
		[
			_create_skill("蛛网", "出牌阶段限一次，你可以选择一名其他角色，其下回合出牌阶段不能使用牌。", HeroSkill.TriggerType.ACTIVE, HeroSkill.SkillType.NORMAL, true, "zhu_wang"),
			_create_skill("吸血", "当你对其他角色造成伤害后，你可以回复1点体力。", HeroSkill.TriggerType.ON_DAMAGE_DEALT, HeroSkill.SkillType.NORMAL, false, "xi_xue"),
		]
	)
	_register_hero(spider_queen)

func _init_heavenly_court() -> void:
	var erlang = _create_hero("er_lang_shen", "二郎神", "清源妙道真君", GameEnums.HeroFaction.HEAVENLY_COURT, 4, true,
		"玉帝外甥，天庭第一战将，第三只眼能看穿一切变化。",
		[
			_create_skill("天眼", "出牌阶段限一次，你可以查看一名其他角色的手牌。", HeroSkill.TriggerType.ACTIVE, HeroSkill.SkillType.NORMAL, true, "tian_yan"),
			_create_skill("哮天犬", "当你使用【杀】指定目标后，你可以令其弃一张牌。", HeroSkill.TriggerType.ON_PLAY_CARD, HeroSkill.SkillType.NORMAL, false, "xiao_tian_quan"),
		]
	)
	_register_hero(erlang)

	var nezha = _create_hero("nezha", "哪吒", "三太子", GameEnums.HeroFaction.HEAVENLY_COURT, 4, true,
		"托塔天王李靖三子，莲花化身，脚踏风火轮。",
		[
			_create_skill("风火轮", "你使用【杀】无距离限制。", HeroSkill.TriggerType.PASSIVE, HeroSkill.SkillType.LOCKED, false, "feng_huo_lun"),
			_create_skill("三头六臂", "出牌阶段，你可以使用两张【杀】。", HeroSkill.TriggerType.PASSIVE, HeroSkill.SkillType.LOCKED, false, "san_tou_liu_bi"),
			_create_skill("莲花化身", "当你进入濒死状态时，你可以弃所有手牌，回复至1点体力。每局游戏限一次。", HeroSkill.TriggerType.ON_DAMAGE_RECEIVED, HeroSkill.SkillType.LIMITED, false, "lian_hua_hua_shen"),
		]
	)
	_register_hero(nezha)

	var guanyin = _create_hero("guan_yin", "观音菩萨", "大慈大悲", GameEnums.HeroFaction.HEAVENLY_COURT, 3, false,
		"大慈大悲观世音菩萨，救苦救难。",
		[
			_create_skill("大慈", "出牌阶段限一次，你可以令一名角色回复1点体力。", HeroSkill.TriggerType.ACTIVE, HeroSkill.SkillType.NORMAL, true, "da_ci"),
			_create_skill("净瓶", "你的【桃】可以令目标回复2点体力。", HeroSkill.TriggerType.PASSIVE, HeroSkill.SkillType.LOCKED, false, "jing_ping"),
		]
	)
	_register_hero(guanyin)

	var taishang = _create_hero("tai_shang_lao_jun", "太上老君", "道德天尊", GameEnums.HeroFaction.HEAVENLY_COURT, 3, true,
		"三清之一，炼丹修道，法力无边。",
		[
			_create_skill("炼丹", "出牌阶段限一次，你可以将一张手牌交给一名其他角色，然后摸两张牌。", HeroSkill.TriggerType.ACTIVE, HeroSkill.SkillType.NORMAL, true, "lian_dan"),
			_create_skill("金丹", "锁定技，你免疫闪电伤害。", HeroSkill.TriggerType.ON_DAMAGE_RECEIVED, HeroSkill.SkillType.LOCKED, false, "jin_dan"),
		]
	)
	_register_hero(taishang)

func _register_hero(hero: HeroData) -> void:
	_heroes[hero.hero_id] = hero

func get_hero(hero_id: String) -> HeroData:
	if _heroes.has(hero_id):
		return _heroes[hero_id]
	return null

func get_all_heroes() -> Array:
	return _heroes.values()

func get_heroes_by_faction(faction: GameEnums.HeroFaction) -> Array:
	var result: Array = []
	for hero in _heroes.values():
		if hero.faction == faction:
			result.append(hero)
	return result

func get_random_heroes(count: int) -> Array:
	var all = _heroes.values().duplicate()
	all.shuffle()
	var result: Array = []
	for i in range(min(count, all.size())):
		result.append(all[i])
	return result

func get_hero_count() -> int:
	return _heroes.size()

func get_faction_string(faction: GameEnums.HeroFaction) -> String:
	match faction:
		GameEnums.HeroFaction.TANG_MONK_PARTY: return "取经团"
		GameEnums.HeroFaction.DEMON: return "妖族"
		GameEnums.HeroFaction.HEAVENLY_COURT: return "天庭"
		_: return "未知"

func get_faction_color(faction: GameEnums.HeroFaction) -> Color:
	match faction:
		GameEnums.HeroFaction.TANG_MONK_PARTY: return Color(0.9, 0.7, 0.2)
		GameEnums.HeroFaction.DEMON: return Color(0.7, 0.2, 0.2)
		GameEnums.HeroFaction.HEAVENLY_COURT: return Color(0.3, 0.5, 0.9)
		_: return Color.WHITE
