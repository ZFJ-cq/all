window.G24 = window.G24 || {};

G24.API = window.location.origin;
G24.EPS = 1e-9;

G24.OP_DISPLAY = { '+': '＋', '-': '－', '*': '×', '/': '÷' };

G24.AI_NAMES = [
  '数学天才', '计算达人', '数字精灵', '算术王者', '数学小能手',
  '心算大师', '聪明小明', '智慧豆豆', '逻辑达人', '思维王者',
  '数学新星', '计算高手', '数字达人', '算术超人', '脑力王者'
];

G24.AI_CONFIG = {
  easy:    { correct: [0.8, 0.9],  speed: [3000, 6000] },
  medium:  { correct: [0.7, 0.85], speed: [4000, 8000] },
  mix:     { correct: [0.65, 0.75], speed: [3500, 7000] },
  hard:    { correct: [0.4, 0.6],  speed: [7000, 18000] }
};

G24.DIFF_NAMES = {
  easy:   '加减',
  medium: '四则',
  mix:    '混合',
  hard:   '24点'
};

G24.DIFF_ICONS = {
  easy:   '🌱 加减',
  medium: '⚡ 四则',
  mix:    '🎯 混合',
  hard:   '🏆 24点'
};

G24.CONFETTI_COLORS = [
  '#6c5ce7', '#fd79a8', '#00b894',
  '#fdcb6e', '#0984e3', '#e17055'
];