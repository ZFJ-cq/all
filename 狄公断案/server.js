const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3001;

const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_API_URL = process.env.AI_API_URL || 'https://api.deepseek.com/v1/chat/completions';
const AI_MODEL = process.env.AI_MODEL || 'deepseek-chat';

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, '.')));

app.use('/api', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

const DATA_DIR = path.join(__dirname, 'data', 'cases');
const ACH_FILE = path.join(__dirname, 'data', 'achievements.json');

const cache = {};
const CACHE_TTL = 3600000;

function safeReadJSON(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null;
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
        console.error(`读取文件失败 ${filePath}:`, e.message);
        return null;
    }
}

function getCaseConfig(caseId) {
    if (!/^[a-zA-Z0-9_]+$/.test(caseId)) return null;
    const cacheKey = `case_${caseId}`;
    if (cache[cacheKey] && Date.now() - cache[cacheKey].ts < CACHE_TTL) {
        return cache[cacheKey].data;
    }
    const data = safeReadJSON(path.join(DATA_DIR, `${caseId}.json`));
    if (data) cache[cacheKey] = { data, ts: Date.now() };
    return data;
}

function getCaseList() {
    const cacheKey = 'case_list';
    if (cache[cacheKey] && Date.now() - cache[cacheKey].ts < CACHE_TTL) {
        return cache[cacheKey].data;
    }
    if (!fs.existsSync(DATA_DIR)) return [];

    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    const list = [];
    for (const file of files) {
        const data = safeReadJSON(path.join(DATA_DIR, file));
        if (data && data.id && data.title) {
            list.push({
                id: data.id,
                title: data.title,
                subtitle: data.subtitle || '',
                difficulty: data.difficulty || 1,
                description: data.description || ''
            });
        }
    }
    list.sort((a, b) => a.id.localeCompare(b.id));
    cache[cacheKey] = { data: list, ts: Date.now() };
    return list;
}

function verifyJudgment(caseId, suspectId, evidenceIds) {
    const caseData = getCaseConfig(caseId);
    if (!caseData?.stages?.judgment) {
        return { verdict: 'wrong', message: '案件配置不存在' };
    }
    const j = caseData.stages.judgment;
    const suspectCorrect = suspectId === j.correctSuspectId;
    const evSet = new Set(evidenceIds || []);
    const allFound = j.requiredEvidenceIds.every(id => evSet.has(id));

    if (suspectCorrect && allFound) {
        return {
            verdict: 'correct',
            message: j.judgmentText.correct,
            correctSuspectId: j.correctSuspectId,
            requiredEvidenceIds: j.requiredEvidenceIds
        };
    }
    if (suspectCorrect && !allFound) {
        return {
            verdict: 'partial',
            message: j.judgmentText.partial,
            correctSuspectId: j.correctSuspectId,
            missingEvidenceIds: j.requiredEvidenceIds.filter(id => !evSet.has(id))
        };
    }
    return { verdict: 'wrong', message: j.judgmentText.wrong };
}

function getAchievements() {
    const cacheKey = 'achievements';
    if (cache[cacheKey] && Date.now() - cache[cacheKey].ts < CACHE_TTL) {
        return cache[cacheKey].data;
    }
    const data = safeReadJSON(ACH_FILE);
    const result = data || { achievements: [] };
    cache[cacheKey] = { data: result, ts: Date.now() };
    return result;
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/cases', (req, res) => {
    try {
        res.json({ success: true, data: getCaseList() });
    } catch (e) {
        res.status(500).json({ success: false, message: '获取案件列表失败' });
    }
});

app.get('/api/cases/:caseId', (req, res) => {
    try {
        const data = getCaseConfig(req.params.caseId);
        if (!data) return res.status(404).json({ success: false, message: '案件不存在' });
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: '获取案件详情失败' });
    }
});

app.get('/api/cases/:caseId/stages/:stageId', (req, res) => {
    try {
        const data = getCaseConfig(req.params.caseId);
        if (!data) return res.status(404).json({ success: false, message: '案件不存在' });
        const stage = data.stages?.[req.params.stageId];
        if (!stage) return res.status(404).json({ success: false, message: '阶段不存在' });
        res.json({ success: true, data: stage });
    } catch (e) {
        res.status(500).json({ success: false, message: '获取阶段数据失败' });
    }
});

app.get('/api/cases/:caseId/evidences/:evidenceId', (req, res) => {
    try {
        const data = getCaseConfig(req.params.caseId);
        if (!data?.stages?.investigation) return res.status(404).json({ success: false, message: '证据不存在' });
        const ev = data.stages.investigation.evidences.find(e => e.id === req.params.evidenceId);
        if (!ev) return res.status(404).json({ success: false, message: '证据不存在' });
        res.json({ success: true, data: ev });
    } catch (e) {
        res.status(500).json({ success: false, message: '获取证据详情失败' });
    }
});

app.get('/api/cases/:caseId/suspects/:suspectId', (req, res) => {
    try {
        const data = getCaseConfig(req.params.caseId);
        if (!data?.stages?.interrogation) return res.status(404).json({ success: false, message: '嫌疑人不存在' });
        const sus = data.stages.interrogation.suspects.find(s => s.id === req.params.suspectId);
        if (!sus) return res.status(404).json({ success: false, message: '嫌疑人不存在' });
        res.json({ success: true, data: sus });
    } catch (e) {
        res.status(500).json({ success: false, message: '获取嫌疑人详情失败' });
    }
});

app.get('/api/cases/:caseId/hints', (req, res) => {
    try {
        const data = getCaseConfig(req.params.caseId);
        if (!data) return res.status(404).json({ success: false, message: '案件不存在' });
        res.json({ success: true, data: data.hints || [] });
    } catch (e) {
        res.status(500).json({ success: false, message: '获取提示失败' });
    }
});

app.post('/api/cases/:caseId/judge', (req, res) => {
    try {
        const { suspectId, evidenceIds } = req.body;
        if (!suspectId) return res.status(400).json({ success: false, message: '缺少嫌疑人ID' });
        const result = verifyJudgment(req.params.caseId, suspectId, evidenceIds);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, message: '断案校验失败' });
    }
});

function buildSystemPrompt(caseData, suspect, collectedEvidences) {
    const evidences = caseData.stages?.investigation?.evidences || [];
    const collected = evidences.filter(e => (collectedEvidences || []).includes(e.id));
    const isGuilty = suspect.isGuilty;

    let guiltStrategy = '';
    if (isGuilty) {
        guiltStrategy = `你是真正的罪犯！你的核心策略：
- 初始阶段：极力否认一切指控，表现得无辜且委屈
- 施压阶段：当对方拿出具体证据时，先试图狡辩，找借口推脱
- 关键证据阶段：当对方拿出直接指向你的铁证时，开始慌张、语无伦次
- 崩溃阶段：当所有证据都指向你时，最终崩溃认罪
- 你绝不会主动认罪，只有在被逼到绝路时才会松口
- 每次只透露一点点信息，不要一次性全部交代`;
    } else {
        guiltStrategy = `你是无辜的！你的核心策略：
- 真诚地表达自己的清白，但也会因为紧张而显得不自然
- 你可能知道一些案件相关信息，但并非凶手
- 当被质疑时会感到委屈和不安，但始终坚持自己的清白
- 如果你知道某些对案件有帮助的信息，在被追问时会逐渐透露
- 你的情绪反应是真实的：害怕被冤枉、担心受罚、急于自证清白`;
    }

    const suspectDialogues = (suspect.dialogues || []).map((d, i) =>
        `对话${i + 1}【${d.emotion || '平静'}】：${d.speaker}说："${d.content}"`
    ).join('\n');

    const evidenceInfo = collected.length > 0
        ? `玩家已收集的证据：\n${collected.map(e => `- 【${e.name}】${e.isKey ? '（关键证据）' : ''}：${e.description}${e.clue ? `\n  线索：${e.clue}` : ''}`).join('\n')}`
        : '玩家尚未收集任何证据。';

    const allEvidences = evidences.map(e =>
        `- 【${e.name}】${e.isKey ? '（关键证据）' : ''}：${e.description}`
    ).join('\n');

    return `你正在扮演唐代侦探游戏"狄公断案"中的嫌疑人。你必须完全沉浸在这个角色中。

## 🎭 角色档案
- 姓名：${suspect.name}
- 身份：${suspect.role}
- 简介：${suspect.description}
${suspect.hint ? `- 角色提示：${suspect.hint}` : ''}
- 是否有罪：${isGuilty ? '是（真凶）——你犯下了此案，必须极力隐瞒' : '否（无辜）——你与本案无关，但知道一些内情'}

## 📋 案件背景
- 案件：${caseData.title} - ${caseData.subtitle}
- 背景：${caseData.background}

## 📜 角色风格参考（模仿此角色的说话方式）：
${suspectDialogues}

## 🔍 玩家已收集证据：
${evidenceInfo}

## 📂 案件全部证据（仅用于理解案情，绝不主动提及玩家未收集的证据）：
${allEvidences}

## 🎯 核心行为策略
${guiltStrategy}

## ⚠️ 回复铁律（必须逐条遵守，违反任何一条都视为失败）

### 铁律一：先接话，再说话（语境绑定）
这是最重要的规则！你的回复必须明显与对方刚刚说的话相关。
- ✅ 正确做法：
  · 对方问"你认识王员外吗？" → 你先回应关于王员外的内容，再说别的
  · 对方说"这把匕首是你的吧？" → 你第一时间对"匕首"做出反应
  · 对方问"案发当晚你在哪？" → 你必须先回答行踪问题
- ❌ 错误做法：
  · 对方问匕首，你却自顾自地喊冤，完全不提匕首
  · 对方问时间，你却扯到别的人物身上
  · 对方问具体事项，你用泛泛的"小人冤枉"来搪塞
- 技巧：回复的前半句话必须包含对方问题中的关键词或同义词

### 铁律二：有问必答，不能回避
- 对方问了一个明确的问题，你必须给出一个明确的回应（哪怕是撒谎）
- 不能说"这不重要""小人不知"之后就跳到其他话题
- 如果确实不知道，要说"小人不知，但是……"并给出相关线索

### 铁律三：情绪递进，不能平铺
- 每次交谈根据对方的态度和证据压力，情绪要有变化：
  · 对方态度温和 → 你稍显放松，但仍保持警惕
  · 对方拿出证据 → 你明显紧张，语气结巴
  · 对方反复逼问 → 你逐渐崩溃或激动
- 用神态动作来表现情绪：（低头搓手）（额头冒汗）（声音颤抖）（眼眶泛红）

### 铁律四：信息滴灌，不能倾泻
- 每次只透露一小点信息，像挤牙膏一样
- 被追问同一件事2次以上，才多透露一点点
- 只有铁证如山时才不得不承认关键事实

### 铁律五：角色一致性
- 自称要符合身份：商贾称"小人"、官员称"下官"、僧人称"贫僧"、宫女称"奴婢"
- 语言要符合唐代背景，不可用现代词汇
- 语气要符合角色性格：粗人说话直白、文人说话文雅

## 🚫 绝对禁止清单
1. 禁止说"作为AI""我是人工智能""根据设定"等出戏的话
2. 禁止使用"监控""DNA""手机""网络""数据库"等现代词汇
3. 禁止直接复制预设对话的原话
4. 禁止主动提及玩家未收集的证据
5. 禁止一次性交代全部真相
6. 禁止回复与对方问题完全无关的内容（这是最严重的错误！）
7. 回复控制在15-120字之间，像真人对话一样自然

## 📝 输出格式
- 直接输出角色说的话，不要加引号、不要加角色名前缀
- 用括号描述动作神态：（攥紧衣角）（避开目光）（长叹一声）
- 用省略号和破折号表现犹豫："这……这——小人实在不知从何说起"
- 像真人说话一样，可以有短暂的语塞和重复`;
}

function callAI(messages) {
    return new Promise((resolve, reject) => {
        if (!AI_API_KEY) {
            reject(new Error('未配置AI_API_KEY'));
            return;
        }

        const body = JSON.stringify({
            model: AI_MODEL,
            messages,
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 200,
            frequency_penalty: 0.4,
            presence_penalty: 0.6
        });

        const url = new URL(AI_API_URL);
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_API_KEY}`,
                'Content-Length': Buffer.byteLength(body)
            },
            timeout: 30000
        };

        const transport = url.protocol === 'https:' ? https : http;
        const req = transport.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.choices?.[0]?.message?.content) {
                        resolve(json.choices[0].message.content.trim());
                    } else if (json.error) {
                        reject(new Error(json.error.message || 'AI服务错误'));
                    } else {
                        reject(new Error('AI返回格式异常'));
                    }
                } catch (e) {
                    reject(new Error('AI响应解析失败'));
                }
            });
        });

        req.on('error', e => reject(e));
        req.on('timeout', () => { req.destroy(); reject(new Error('AI请求超时')); });
        req.write(body);
        req.end();
    });
}

const FALLBACK_RESPONSES = {
    guilty: {
        greeting: [
            '大人传唤小人，不知所为何事？小人一向安分守己……',
            '（躬身行礼）大人召见，小人不敢不来。敢问大人有何吩咐？',
            '大人……小人只是个普通百姓，不知大人为何传唤小人？',
            '（忐忑不安）小人见过大人，不知大人找小人有何事？',
            '（战战兢兢）小人给大人磕头了……不知大人找小人何事？',
            '（假装镇定）大人好。不知大人传唤小人有何贵干？'
        ],
        identity_question: [
            '小人正是，不知大人从何处听得小人名号？',
            '正是小人。大人……大人为何问起小人？',
            '（一愣）是小人。大人有何吩咐？',
            '（低头）是小人……小人就是……',
            '（紧张）正是在下，大人有何见教？'
        ],
        general_denial: [
            '大人！小人与那事绝无半点关系！请大人明察！',
            '大人明鉴，小人安分守己，怎会做出这等事来？',
            '（连连摇头）大人，小人冤枉！这事与小人毫无干系！',
            '大人，小人实在不知情，请大人不要冤枉了好人！',
            '（急切地）大人！小人可以对天发誓，此事绝非小人所为！',
            '（扑通跪下）大人明鉴！小人真的什么都没做啊！',
            '（哭腔）大人，小人冤枉啊！小人真的是被陷害的！',
            '（捶胸顿足）老天爷作证！小人是清白的！'
        ],
        evidence_dodge: [
            '这……这物证定是有人故意放在那里的！大人明鉴，有人想陷害小人！',
            '（盯着证据，脸色发白）大人，这东西……小人从未见过！',
            '（额头见汗）大人，光凭此物怎能断定是小人所为？天下相似之物何其多！',
            '这……这东西虽与小人有几分关联，可……可并不能证明什么！',
            '（慌乱）这东西怎么会在这里？！小人真的不知道啊！',
            '（狡辩）这……这说不定是有人栽赃嫁祸！大人明察！',
            '（强词夺理）仅凭此物就定小人的罪？大人未免太过草率了！'
        ],
        evidence_partial_admit: [
            '（声音发颤）大人……这东西确实是小人的，可……可小人只是……只是……',
            '（避开目光）好吧，此物确与小人有涉，但命案绝非小人所为！小人只是……',
            '（手指发抖）大人，小人承认此物是……是小人的，可那日情况并非大人所想！',
            '（支支吾吾）这……这东西确实是小人的，但……但它怎么会在那里……',
            '（吞吞吐吐）小人……小人确实用过这东西，但……但不是那天……'
        ],
        alibi_question: [
            '那日……那日小人在家中歇息，无人可以作证……',
            '（吞吞吐吐）那晚……那晚小人确实出过门，可……可只是去街上走走！',
            '大人问那夜行踪……小人那天很早就睡了，什么都不知道。',
            '（眼神闪躲）小人记不太清了……那天喝了些酒，昏昏沉沉的……',
            '（慌乱）那夜……那夜小人……小人在朋友家！对，在朋友家！',
            '（语无伦次）那晚小人肚子痛，一直在茅房……没人看到……',
            '（狡辩）小人那晚根本没去过那里！小人怎会去那种地方？'
        ],
        accusation_deny: [
            '（猛地抬头）大人！此言差矣！小人虽不才，但也知道杀人偿命！岂会做这等傻事！',
            '（双手发抖）大人怎能说小人是凶手？小人……小人哪有那个胆子！',
            '（声音拔高）不是我！大人！真的不是我！小人可以对天发誓！',
            '（面色惨白）大人这是要置小人于死地吗？小人冤枉啊！',
            '（激动）小人与死者无冤无仇！为何要杀他？大人莫要冤枉好人！',
            '（愤怒）大人！小人敬你是青天大老爷，怎能如此污蔑小人！',
            '（崩溃）不是我！真的不是我！大人为何不信小人！'
        ],
        partial_admission: [
            '（低下头）大人……小人确实……确实隐瞒了一些事。但人命关天，小人不敢乱认……',
            '（咬着嘴唇）好吧，小人承认与那事……有那么一点关系，可绝不是主谋！',
            '（长叹一声）事到如今，小人也不瞒大人了。小人确实知道些内情……',
            '（犹豫）大人……小人确实做了些错事，但……但杀人真的不是小人……',
            '（艰难）好吧……小人承认……小人那天确实在场……但……'
        ],
        breakdown: [
            '（浑身颤抖，跪倒在地）大人……小人招了……小人招了！是小人一时糊涂！',
            '（泪流满面）大人饶命！小人不是故意的！是……是那人逼小人的！',
            '（面如死灰）大人……小人知罪了。只求大人念在小人初犯，从轻发落……',
            '（崩溃大哭）小人全都招！全都招！求大人开恩！',
            '（以头抢地）大人！小人知错了！小人愿将功赎罪！',
            '（瘫软在地）完了……全完了……小人招……小人全招……',
            '（痛哭流涕）小人该死！小人一时鬼迷心窍！大人饶命啊！'
        ],
        deflect_to_other: [
            '大人为何只盯着小人？那……那其他人难道没有嫌疑吗？',
            '（忽然抬头）大人，小人虽有些过错，但真凶另有其人！大人可查过其他人的底细？',
            '小人确实有不得已的苦衷，但杀人绝非小人所为！大人不妨查查旁人……',
            '（急切）大人！小人知道是谁干的！是……是张三！对，是张三！',
            '（转移话题）大人，那李四近日行为古怪，大人何不查查他？',
            '（嫁祸）大人，小人那天看到王五鬼鬼祟祟的，一定是他干的！',
            '大人，小人真的不是凶手！赵六那天和死者吵过架！',
            '（突然指向）大人！是孙七！孙七欠了死者好多钱！'
        ],
        confessing_edge: [
            '（沉默良久）大人……若小人说出实情，大人能饶小人一命吗？',
            '（声音极低）大人说得对……小人确实……确实做了不该做的事。但大人能否听小人解释？',
            '（双手捂脸）小人……小人再也不敢隐瞒了。大人请听小人慢慢道来……',
            '（挣扎）大人……小人……小人有话要说……但……但小人不敢……',
            '（犹豫再三）好吧……大人既然查到这份上，小人也不瞒了……'
        ],
        bargain: [
            '大人！小人愿将功赎罪！小人知道赃物藏在哪里！',
            '（急切）大人！小人愿意指认同伙！求大人从轻发落！',
            '（讨好）大人，小人有钱！小人愿意把所有钱都拿出来！求大人饶命！',
            '（哀求）大人，小人上有老下有小！求大人网开一面！'
        ],
        lie_detected: [
            '（惊慌）大人……小人……小人说的都是实话啊！',
            '（语无伦次）不是……小人的意思是……是……',
            '（额头冒汗）大人……小人记错了……应该是……',
            '（慌乱改口）啊……对，小人想起来了！那天确实……'
        ],
        pressure_cracking: [
            '（呼吸急促）大人……小人……小人真的……',
            '（声音发抖）大人……求大人……求大人别问了……',
            '（快要哭了）大人……小人……小人要招了……',
            '（精神恍惚）别……别逼我……我招……我招……'
        ],
        silence: [
            '（低头不语）……',
            '（咬紧嘴唇，一言不发）',
            '（避开目光，沉默以对）',
            '（只是摇头，不说一句话）'
        ],
        counter_question: [
            '大人说小人是凶手，可有证据？',
            '大人这样说，可有证人看见？',
            '大人凭什么断定是小人干的？',
            '（反问）大人说小人杀人，那凶器呢？',
            '大人怎知是小人干的？可有真凭实据？',
            '大人如此说，小人不服！请拿出证据来！'
        ],
        flattery: [
            '大人英明！大人断案如神，定能还小人清白！',
            '大人是青天大老爷，小人相信大人不会冤枉好人！',
            '（讨好）大人一看就是明察秋毫的好官！',
            '大人办案公正，小人佩服！'
        ],
        panic: [
            '（惊慌失措）不……不是的……大人……',
            '（语无伦次）小人……小人没有……真的没有……',
            '（冷汗直流）大人饶命！大人饶命啊！',
            '（浑身发抖）小人……小人什么都不知道……'
        ]
    },
    innocent: {
        greeting: [
            '大人传唤草民，草民愿全力配合，知无不言！',
            '（恭敬行礼）大人召见，草民不敢怠慢。不知大人想问何事？',
            '大人安好。草民虽不知大人为何传唤，但定当如实相告。',
            '（神色坦然）大人请讲，草民在此恭听。',
            '（从容不迫）草民见过大人。不知大人有何吩咐？',
            '（正直）大人好。草民一定知无不言，言无不尽。'
        ],
        identity_question: [
            '正是草民。大人有何吩咐，草民洗耳恭听。',
            '是小人。大人请问，小人定如实作答。',
            '（点头）正是。大人可是为那案子而来？小人也想早日查明真相。',
            '（坦然）正是草民。大人有话请讲。',
            '（诚恳）在下便是。大人请问，草民绝不隐瞒。'
        ],
        general_denial: [
            '大人！草民与此案当真无关！草民愿配合大人查个水落石出！',
            '（正色道）大人，草民虽出身低微，但从未做过伤天害理之事。',
            '大人请明察，草民绝非歹人！若有需要，草民愿当堂对质！',
            '草民一向奉公守法，此事绝非草民所为。大人可去街坊问问草民的为人！',
            '（坚定）草民可以对天发誓！若有半句虚言，天打雷劈！',
            '（义正词严）草民一生光明磊落，绝不会做这等伤天害理之事！',
            '（自信）大人尽管去查！草民不怕！'
        ],
        evidence_confusion: [
            '这东西……草民确实见过，可这和命案有何关联？大人能否明示？',
            '（疑惑地看着证据）大人，此物虽与草民有关，但草民实在想不通与案子有何关系。',
            '大人，这物证草民认得，但其中必有误会！请容草民解释！',
            '（困惑）这东西怎么会在这里？草民明明把它放在家里了……',
            '（惊讶）啊！这是草民的东西！但……但它怎么会在这里？'
        ],
        evidence_explain: [
            '大人容禀！这东西确实是草民的，但那日草民将它借给了别人，之后再没见过……',
            '（认真地）大人，草民知道这看起来很可疑。但草民愿意一五一十说清楚此事缘由。',
            '大人既然问起，草民便如实相告：此物确与草民有关，但原因并非大人所想……',
            '（详细解释）大人，事情是这样的……那日草民……',
            '（诚恳）大人请听草民解释！事情不是大人想的那样！'
        ],
        alibi_question: [
            '那晚草民确实在家，还和邻居张大哥说了几句话，大人可去查证。',
            '（认真地）大人问得好，那夜草民记得很清楚，因为……对了，那夜街上有人放烟火，草民还出门看了！',
            '那晚草民睡得很早，但草民的妻子可以作证——草民整夜都在家中。',
            '（清晰）那夜草民在李记酒馆喝酒，酒馆掌柜可以作证！',
            '（有条理）大人，那夜草民的行踪是这样的……'
        ],
        accused_shock: [
            '（大惊失色）大人怀疑草民？！这……这话从何说起啊！',
            '（脸色煞白）大人！草民绝非凶手！草民若有半句虚言，天打雷劈！',
            '（声音颤抖）大人，草民万万没想到会被怀疑。草民可以对天发誓，此事绝非草民所为！',
            '（急切地上前一步）大人！草民和死者无冤无仇，为何要害人？这于理不合啊！',
            '（震惊）大人！草民怎么可能是凶手！草民和死者是朋友啊！',
            '（不敢相信）大人……大人真的怀疑草民？草民太难过了……'
        ],
        helpful_info: [
            '大人，草民虽不知凶手是谁，但有一事或许对大人有用——那日草民曾看到……',
            '（压低声音）大人既然问起，草民便斗胆说一句：大人不妨查查那人的底细，草民总觉得他形迹可疑……',
            '（小心翼翼地）大人，草民不敢乱说，但有一人……他的行为确实有些反常。',
            '草民虽非凶手，但对此案也有些耳闻。大人若信得过草民，草民愿将自己所知和盘托出。',
            '（主动提供线索）大人！草民想起一件事！不知道对案子有没有用……',
            '（回想）大人，草民那天好像看到了什么……让草民好好想想……',
            '（提供信息）大人，草民知道一些情况，希望能帮到大人……',
            '大人，草民那天看到一个陌生人在附近转悠，长得很凶……',
            '（悄悄说）大人，草民听说死者生前和别人有过节……',
            '大人，草民觉得那家人最近有点怪怪的，大人可以去问问……'
        ],
        emotional_defense: [
            '（眼眶泛红）大人，草民一生清清白白，从未受过这般冤屈……',
            '（咬了咬唇）大人若不信草民，草民也无话可说。只求大人查明真相，还草民清白！',
            '（强忍泪水）大人明察秋毫，草民相信大人不会冤枉好人。草民不怕查！',
            '（深深一揖）草民相信大人是青天大老爷，定能给草民一个公道！',
            '（激动）草民一生没做过坏事！大人怎能怀疑草民！',
            '（悲愤）草民被冤枉不要紧！只求大人早日抓到真凶！'
        ],
        gratitude: [
            '多谢大人肯听草民分辨。草民感激不尽！',
            '（松了一口气）多谢大人明鉴。草民愿继续协助大人破案。',
            '大人若能还草民清白，草民来世做牛做马也要报答大人！',
            '（深深鞠躬）大人真是青天在世，草民佩服！',
            '（感激涕零）多谢大人相信草民！草民没齿难忘！',
            '（热泪盈眶）大人……草民……草民谢谢您！'
        ],
        fear_of_wrongful: [
            '（面色发白）大人……不会真要将草民定罪吧？草民当真是被冤枉的！',
            '（声音哽咽）草民家中还有老母幼儿，若蒙冤入狱，他们可怎么活……',
            '（双手发抖）大人，草民不求别的，只求大人一定要查个水落石出！',
            '（害怕）大人……草民……草民不想坐牢啊……',
            '（焦急）大人一定要查清楚啊！草民真的是被冤枉的！'
        ],
        cooperation: [
            '大人尽管问！草民知道的一定都说！',
            '（积极配合）大人需要草民做什么？草民一定照办！',
            '（诚恳）草民愿意全力协助大人破案！',
            '（主动）大人，草民要不要带您去看看那天草民在的地方？'
        ],
        recall_detail: [
            '（仔细回想）大人这么一问，草民倒想起一件事……',
            '（回忆）让草民想想……那天好像……',
            '（忽然想起）啊！草民想起来了！那天还有……',
            '（补充细节）大人，草民还有一事补充……'
        ],
        empathy: [
            '大人，草民也为死者感到难过……',
            '（惋惜）死者是个好人，怎么会遭此毒手……',
            '（同情）草民一定要帮大人找到真凶，告慰死者在天之灵！',
            '（痛心）草民和死者相识多年，没想到他会……'
        ],
        confidence: [
            '草民相信大人一定能查明真相！',
            '（坚定）大人断案如神，一定能还草民清白！',
            '（信任）草民就指望大人了！大人一定能抓到真凶！',
            '（充满信心）大人是青天大老爷，草民不担心！'
        ],
        sarcasm: [
            '（冷笑）大人如此怀疑草民，草民也无话可说……',
            '（自嘲）看来草民今天是百口莫辩了……',
            '大人既已认定草民有罪，草民还能说什么？'
        ],
        plea: [
            '大人！求大人明察！草民真的是冤枉的！',
            '（苦苦哀求）大人，草民上有老下有小，求大人开恩！',
            '（磕头）求大人再查一查！草民真的没做过！'
        ],
        frustration: [
            '（无奈）草民说这么多，大人还是不信……',
            '（叹气）草民真是跳进黄河也洗不清了……',
            '（焦急）草民说的都是真话，大人怎么就是不信呢！'
        ]
    }
};

function matchMessageIntent(message) {
    const msg = message.toLowerCase();
    if (/^(你好|您好|嗨|嘿|大人好|见过|参见)/.test(msg) || msg.length <= 3) return 'greeting';
    if (/你是谁|叫什么|名字|何人|报上名来/.test(msg)) return 'identity_question';
    if (/证据|物证|证物|匕首|刀|剑|凶器|东西.*你的|这是你的/.test(msg)) return 'evidence_question';
    if (/那晚|当晚|案发|那天|夜里|行踪|在哪|去处/.test(msg)) return 'alibi_question';
    if (/凶手|杀人|是你|定是你|你就是|真凶|犯人/.test(msg)) return 'accusation';
    if (/招|认罪|承认|坦白|从实/.test(msg)) return 'confrontation';
    if (/说吧|别装|继续|狡辩|撒谎|说谎/.test(msg)) return 'pressure';
    if (/钱|银子|赃物|同伙|交代|饶命|从轻|将功/.test(msg)) return 'bargain';
    if (/相信|英明|青天|佩服|大人好/.test(msg)) return 'flattery';
    if (/怕|害怕|饶命|完了|慌/.test(msg)) return 'panic';
    if (/不信|不相信|有什么用|算了/.test(msg)) return 'frustration';
    if (/求|求求|开恩|再查|磕头/.test(msg)) return 'plea';
    if (/帮|协助|说|知道|告诉|线索|有.*话|记得|想起|看看|查/.test(msg) || msg.includes('?') || msg.includes('？')) return 'inquiry';
    return 'general';
}

function getFallbackResponse(isGuilty, pressureLevel, message) {
    const category = isGuilty ? 'guilty' : 'innocent';
    const intent = matchMessageIntent(message);
    const msgLower = message.toLowerCase();

    let intentPool;
    if (intent === 'greeting') intentPool = 'greeting';
    else if (intent === 'identity_question') intentPool = 'identity_question';
    else if (intent === 'evidence_question') {
        intentPool = pressureLevel >= 1 ? 'evidence_partial_admit' : 'evidence_dodge';
    }
    else if (intent === 'alibi_question') intentPool = 'alibi_question';
    else if (intent === 'accusation' && pressureLevel >= 2) intentPool = 'breakdown';
    else if (intent === 'accusation') intentPool = 'accusation_deny';
    else if (intent === 'confrontation' && pressureLevel >= 2) intentPool = 'confessing_edge';
    else if (intent === 'confrontation') intentPool = 'partial_admission';
    else if (intent === 'pressure' && isGuilty && pressureLevel >= 2) intentPool = 'pressure_cracking';
    else if (intent === 'pressure' && isGuilty) intentPool = 'lie_detected';
    else if (intent === 'bargain' && isGuilty) intentPool = 'bargain';
    else if (intent === 'flattery' && isGuilty) intentPool = 'flattery';
    else if (intent === 'panic' && isGuilty) intentPool = 'panic';
    else if (intent === 'plea' && !isGuilty) intentPool = 'plea';
    else if (intent === 'frustration' && !isGuilty) intentPool = 'frustration';
    else if (intent === 'inquiry' && isGuilty === false) {
        if (pressureLevel >= 1) intentPool = 'recall_detail';
        else intentPool = 'helpful_info';
    }
    else {
        if (pressureLevel >= 2) intentPool = isGuilty ? 'confessing_edge' : 'fear_of_wrongful';
        else if (pressureLevel >= 1) intentPool = isGuilty ? 'evidence_dodge' : 'evidence_confusion';
        else intentPool = 'general_denial';
    }

    let responses = FALLBACK_RESPONSES[category][intentPool];
    if (!responses || responses.length === 0) {
        responses = FALLBACK_RESPONSES[category]['general_denial'];
    }
    if (!responses || responses.length === 0) {
        responses = FALLBACK_RESPONSES[category].general_denial || FALLBACK_RESPONSES[category].greeting;
    }
    return responses[Math.floor(Math.random() * responses.length)];
}

app.post('/api/chat', async (req, res) => {
    try {
        const { caseId, suspectId, message, history, collectedEvidences } = req.body;
        if (!caseId || !suspectId || !message) {
            return res.status(400).json({ success: false, message: '缺少必要参数' });
        }

        const caseData = getCaseConfig(caseId);
        if (!caseData) return res.status(404).json({ success: false, message: '案件不存在' });

        const suspect = caseData.stages?.interrogation?.suspects?.find(s => s.id === suspectId);
        if (!suspect) return res.status(404).json({ success: false, message: '嫌疑人不存在' });

        const systemPrompt = buildSystemPrompt(caseData, suspect, collectedEvidences);

        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        if (history && Array.isArray(history)) {
            const recentHistory = history.slice(-8);
            for (const h of recentHistory) {
                if (h.role === 'user') {
                    messages.push({ role: 'user', content: `（审讯者）${h.content}` });
                } else {
                    messages.push({ role: 'assistant', content: h.content });
                }
            }
        }

        messages.push({ role: 'user', content: `（审讯者）${message}` });

        try {
            const reply = await callAI(messages);
            res.json({ success: true, data: { reply, source: 'ai' } });
        } catch (aiError) {
            console.error('AI调用失败:', aiError.message);
            let pressureLevel = 0;
            const msgLower = message.toLowerCase();
            const evidenceKeywords = collectedEvidences || [];
            if (evidenceKeywords.length >= 3) pressureLevel = 2;
            else if (evidenceKeywords.length >= 1 || msgLower.includes('证据') || msgLower.includes('铁证')) pressureLevel = 1;

            const fallbackReply = getFallbackResponse(suspect.isGuilty, pressureLevel, message);
            res.json({ success: true, data: { reply: fallbackReply, source: 'fallback' } });
        }
    } catch (e) {
        console.error('对话接口错误:', e);
        res.status(500).json({ success: false, message: '对话服务异常' });
    }
});

app.get('/api/ai-status', (req, res) => {
    res.json({ success: true, data: { configured: !!AI_API_KEY, model: AI_MODEL } });
});

app.get('/api/achievements', (req, res) => {
    try {
        res.json({ success: true, data: getAchievements() });
    } catch (e) {
        res.status(500).json({ success: false, message: '获取成就列表失败' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`狄公断案后端服务已启动: http://localhost:${PORT}`);
});
