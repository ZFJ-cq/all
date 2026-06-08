import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, RotateCcw, Copy, Check, MessageCircleHeart, Settings, X, Loader2 } from 'lucide-react';

// ============ Puter.js 类型声明 ============
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string | Array<{role: string; content: string}>, options?: { model?: string; stream?: boolean }) => Promise<{message?: {content?: Array<{type: string; text?: string}>}; toString?: () => string}>;
      };
    };
  }
}

// ============ API 配置 ============
interface ApiConfig {
  id: string;
  name: string;
  icon: string;
  desc: string;
  color: string;
  type: 'putter' | 'qingyunke';
  model?: string; // Puter模型ID
  systemPrompt?: string; // 系统提示词
}

const API_LIST: ApiConfig[] = [
  {
    id: 'qingyunke',
    name: '青云客',
    icon: '☁️',
    desc: '免费无限 · 闲聊首选',
    color: '#6366F1',
    type: 'qingyunke',
  },
  {
    id: 'gpt-nano',
    name: 'GPT-5.4 Nano',
    icon: '⚡',
    desc: '快速高效 · 日常对话',
    color: '#10B981',
    type: 'puter',
    model: 'gpt-5.4-nano',
    systemPrompt: '你是一个高情商聊天回复助手，用户输入的是对方说的话，请生成1-3句自然、口语化、适合微信日常聊天的回复，不要太长，语气温暖贴心。',
  },
  {
    id: 'gpt-mini',
    name: 'GPT-5.4 Mini',
    icon: '🟢',
    desc: '均衡性价比 · 智能回复',
    color: '#059669',
    type: 'puter',
    model: 'gpt-5.4-mini',
    systemPrompt: '你是一个善解人意的暖心朋友，用户输入的是对方说的话，请用温柔体贴的语气回复，让对方感到被理解和关心，回复1-3句即可。',
  },
  {
    id: 'claude-haiku',
    name: 'Claude Haiku',
    icon: '🟣',
    desc: '轻量快速 · 共情回复',
    color: '#8B5CF6',
    type: 'puter',
    model: 'claude-haiku-4-5',
    systemPrompt: '你是一个幽默又温暖的朋友，用户输入的是对方说的话，请用轻松幽默但不失温度的方式回复，可以适当加1个emoji，回复1-3句。',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek R1',
    icon: '🔵',
    desc: '深度推理 · 创意回复',
    color: '#2563EB',
    type: 'puter',
    model: 'deepseek-r1',
    systemPrompt: '你是一个创意十足的聊天达人，用户输入的是对方说的话，请生成一条有创意、带点小惊喜感的回复，适合活跃气氛，回复1-3句。',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    icon: '🌟',
    desc: '旗舰模型 · 高情商回复',
    color: '#F59E0B',
    type: 'puter',
    model: 'gpt-4o',
    systemPrompt: '你是高情商文案师，用户输入的是对方说的话，请生成2条不同风格的温柔回复：一条温柔安抚型，一条理性解决型，用序号分开。',
  },
  {
    id: 'llama',
    name: 'Llama 4 Maverick',
    icon: '🦙',
    desc: '开源模型 · 多风格回复',
    color: '#EF4444',
    type: 'puter',
    model: 'meta-llama/llama-4-maverick',
    systemPrompt: '你是一个多风格聊天助手，用户输入的是对方说的话，请同时生成3种不同风格的回复：1.幽默调侃型 2.温柔安抚型 3.理性解决型，用序号分开。',
  },
];

// ============ 类型定义 ============
interface ReplyItem {
  content: string;
  loading: boolean;
  error: boolean;
}

interface ApiReplyGroup {
  apiId: string;
  apiName: string;
  apiIcon: string;
  apiColor: string;
  replies: ReplyItem[];
  allDone: boolean;
}

interface ChatRound {
  id: string;
  userMessage: string;
  timestamp: number;
  apiReplies: ApiReplyGroup[];
}

// ============ 缓存 ============
const replyCache = new Map<string, string>();

function getCacheKey(apiId: string, msg: string, index: number): string {
  return `${apiId}:${msg}:${index}`;
}

// ============ API 调用 ============
async function callQingyunke(msg: string): Promise<string> {
  const encoded = encodeURIComponent(msg);
  const res = await fetch(`/api/qingyunke/api.php?key=free&appid=0&msg=${encoded}`);
  const data = await res.json();
  if (data.result === 0) return data.content;
  throw new Error(data.content || '请求失败');
}

async function callPuterApi(msg: string, model: string, systemPrompt: string): Promise<string> {
  if (!window.puter?.ai?.chat) {
    throw new Error('Puter.js 未加载，请刷新页面');
  }
  const response = await window.puter.ai.chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: msg },
    ],
    { model }
  );
  // Puter返回格式兼容处理
  if (response?.message?.content?.[0]?.text) {
    return response.message.content[0].text;
  }
  if (typeof response === 'string') return response;
  if (response?.toString) return response.toString();
  return JSON.stringify(response);
}

async function callApi(apiId: string, msg: string): Promise<string> {
  const api = API_LIST.find((a) => a.id === apiId)!;
  const timeout = api.type === 'qingyunke' ? 10000 : 30000;
  
  const fn = api.type === 'qingyunke'
    ? () => callQingyunke(msg)
    : () => callPuterApi(msg, api.model!, api.systemPrompt!);

  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('请求超时，请检查是否已登录Puter账号')), timeout)
    ),
  ]);
}

// ============ 主组件 ============
export default function ChatReply() {
  const [chatRounds, setChatRounds] = useState<ChatRound[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [callCount, setCallCount] = useState(3);
  const [showSettings, setShowSettings] = useState(false);
  const [enabledApis, setEnabledApis] = useState<string[]>(['qingyunke', 'gpt-nano', 'claude-haiku']);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动滚动
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatRounds]);

  // 切换API启用
  const toggleApi = (apiId: string) => {
    setEnabledApis((prev) => {
      if (prev.includes(apiId)) {
        if (prev.length <= 1) return prev;
        return prev.filter((id) => id !== apiId);
      }
      return [...prev, apiId];
    });
  };

  // 发送消息
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    const roundId = Date.now().toString();
    const apis = API_LIST.filter((a) => enabledApis.includes(a.id));

    const newRound: ChatRound = {
      id: roundId,
      userMessage: text,
      timestamp: Date.now(),
      apiReplies: apis.map((api) => ({
        apiId: api.id,
        apiName: api.name,
        apiIcon: api.icon,
        apiColor: api.color,
        replies: Array.from({ length: callCount }, () => ({
          content: '',
          loading: true,
          error: false,
        })),
        allDone: false,
      })),
    };

    setChatRounds((prev) => [...prev, newRound]);
    setInput('');
    setSending(true);

    // 并行调用所有API
    for (const api of apis) {
      const promises = Array.from({ length: callCount }, async (_, i) => {
        const cacheKey = getCacheKey(api.id, text, i);
        try {
          if (replyCache.has(cacheKey)) {
            return { index: i, content: replyCache.get(cacheKey)!, error: false };
          }
          // 青云客多次调用加延迟避免限流
          if (api.type === 'qingyunke' && i > 0) {
            await new Promise((r) => setTimeout(r, i * 300));
          }
          const reply = await callApi(api.id, text);
          replyCache.set(cacheKey, reply);
          return { index: i, content: reply, error: false };
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : '请求失败';
          return { index: i, content: errorMsg, error: true };
        }
      });

      for (const promise of promises) {
        promise.then((result) => {
          setChatRounds((prev) =>
            prev.map((round) => {
              if (round.id !== roundId) return round;
              return {
                ...round,
                apiReplies: round.apiReplies.map((group) => {
                  if (group.apiId !== api.id) return group;
                  const newReplies = [...group.replies];
                  newReplies[result.index] = {
                    content: result.content,
                    loading: false,
                    error: result.error,
                  };
                  const allDone = newReplies.every((r) => !r.loading);
                  return { ...group, replies: newReplies, allDone };
                }),
              };
            })
          );
        });
      }
    }

    // 等所有完成
    await new Promise<void>((resolve) => {
      const check = () => {
        setChatRounds((prev) => {
          const round = prev.find((r) => r.id === roundId);
          if (round && round.apiReplies.every((g) => g.allDone)) {
            resolve();
            return prev;
          }
          setTimeout(check, 300);
          return prev;
        });
      };
      setTimeout(check, 500);
    });

    setSending(false);
  }, [input, sending, enabledApis, callCount]);

  // 复制
  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    });
  }, []);

  // 清空
  const handleClear = useCallback(() => {
    setChatRounds([]);
    replyCache.clear();
  }, []);

  // 快捷提问
  const quickQuestions = [
    '今天心情不好',
    '最近好累',
    '被人冷落了',
    '怎么安慰失恋的朋友',
    '面试紧张怎么办',
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-[520px] flex-col bg-gradient-to-b from-[#F8F6FF] via-[#FFF8FB] to-[#FFF5F5]">
      {/* ====== 顶部导航栏 ====== */}
      <header className="sticky top-0 z-40 glass-purple px-4 pb-3 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] shadow-lg shadow-purple-200">
              <MessageCircleHeart size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1E1B4B]">AI多API回复对比</h1>
              <p className="text-[11px] text-[#8B5CF6]/70">输入一句话，同时获取所有API回复</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs shadow-sm transition-all active:scale-95 ${
                showSettings
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white'
                  : 'bg-white/60 text-[#6B7280]'
              }`}
            >
              <Settings size={12} />
              设置
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 rounded-full bg-white/60 px-3 py-1.5 text-xs text-[#6B7280] shadow-sm transition-all active:scale-95"
            >
              <RotateCcw size={12} />
              清空
            </button>
          </div>
        </div>

        {/* ====== 设置面板 ====== */}
        {showSettings && (
          <div className="animate-slide-up mt-3 rounded-xl bg-white/90 p-3 shadow-lg backdrop-blur-md">
            <div className="mb-3">
              <div className="mb-2 text-xs font-medium text-[#1E1B4B]">选择API（可多选）</div>
              <div className="grid grid-cols-2 gap-1.5">
                {API_LIST.map((api) => (
                  <button
                    key={api.id}
                    onClick={() => toggleApi(api.id)}
                    className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-all active:scale-95 ${
                      enabledApis.includes(api.id)
                        ? 'ring-1 ring-[#8B5CF6]/30'
                        : 'opacity-40'
                    }`}
                    style={{
                      background: enabledApis.includes(api.id)
                        ? `linear-gradient(135deg, ${api.color}15, ${api.color}08)`
                        : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {enabledApis.includes(api.id) && (
                      <span className="absolute right-1.5 top-1.5 text-[10px] text-[#8B5CF6]">✓</span>
                    )}
                    <span className="text-base">{api.icon}</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-[#1E1B4B]">{api.name}</div>
                      <div className="truncate text-[9px] text-[#9CA3AF]">{api.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-medium text-[#1E1B4B]">每个API调用次数</div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCallCount(n)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                      callCount === n
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white shadow-md'
                        : 'bg-white/60 text-[#6B7280]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-amber-50 p-2 text-[10px] leading-relaxed text-amber-700">
              💡 Puter.js模型首次使用需登录Puter账号（免费注册），之后即可无限调用。青云客无需注册。
            </div>
          </div>
        )}
      </header>

      {/* ====== 回复对比区 ====== */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4">
        {chatRounds.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20">
              <Sparkles size={36} className="text-[#8B5CF6]" />
            </div>
            <h2 className="mb-1 text-lg font-bold text-[#1E1B4B]">输入对方说的话</h2>
            <p className="mb-6 text-sm text-[#6B7280]">一键获取所有API回复，方便对比效果</p>

            <div className="flex flex-wrap justify-center gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="rounded-full bg-white/70 px-3 py-1.5 text-xs text-[#6B7280] shadow-sm transition-all hover:bg-white active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatRounds.map((round) => (
          <div key={round.id} className="mb-6 animate-slide-up">
            {/* 用户消息 */}
            <div className="mb-4 flex justify-end">
              <div className="max-w-[80%] rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-4 py-2.5 text-sm leading-relaxed text-white shadow-lg shadow-purple-200/50">
                {round.userMessage}
              </div>
            </div>

            {/* API回复卡片 */}
            <div className="space-y-3">
              {round.apiReplies.map((group) => (
                <div
                  key={group.apiId}
                  className="overflow-hidden rounded-2xl bg-white shadow-md transition-all"
                  style={{ borderLeft: `3px solid ${group.apiColor}` }}
                >
                  {/* 卡片标题 */}
                  <div
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{ background: `linear-gradient(135deg, ${group.apiColor}10, ${group.apiColor}05)` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{group.apiIcon}</span>
                      <span className="text-sm font-semibold" style={{ color: group.apiColor }}>
                        {group.apiName}
                      </span>
                      <span className="text-[10px] text-[#9CA3AF]">
                        {API_LIST.find((a) => a.id === group.apiId)?.desc}
                      </span>
                    </div>
                    {group.allDone && (
                      <span className="text-[10px] text-[#10B981]">全部完成</span>
                    )}
                  </div>

                  {/* 回复内容列表 */}
                  <div className="divide-y divide-gray-50">
                    {group.replies.map((reply, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3">
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ background: group.apiColor }}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          {reply.loading ? (
                            <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                              <Loader2 size={14} className="animate-spin" style={{ color: group.apiColor }} />
                              <span>正在获取回复...</span>
                            </div>
                          ) : reply.error ? (
                            <div className="text-sm text-[#EF4444]">
                              ⚠️ {reply.content}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">
                              {reply.content}
                            </div>
                          )}
                        </div>
                        {!reply.loading && !reply.error && reply.content && (
                          <button
                            onClick={() => handleCopy(reply.content, `${round.id}-${group.apiId}-${i}`)}
                            className="shrink-0 p-1 text-[#9CA3AF] transition-colors hover:text-[#8B5CF6]"
                            title="复制"
                          >
                            {copiedKey === `${round.id}-${group.apiId}-${i}` ? (
                              <Check size={14} className="text-[#10B981]" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      {/* ====== 底部输入区 ====== */}
      <div className="sticky bottom-0 z-30 border-t border-purple-100/50 bg-gradient-to-t from-[#F8F6FF] via-[#F8F6FF] to-transparent px-4 pb-4 pt-3">
        {/* 已选API标签 */}
        <div className="mb-2 flex flex-wrap gap-1.5">
          {enabledApis.map((apiId) => {
            const api = API_LIST.find((a) => a.id === apiId)!;
            return (
              <span
                key={apiId}
                className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[10px] text-[#6B7280] shadow-sm"
              >
                <span>{api.icon}</span>
                {api.name}
                <button
                  onClick={() => toggleApi(apiId)}
                  className="ml-0.5 text-[#9CA3AF] hover:text-[#EF4444]"
                >
                  <X size={10} />
                </button>
              </span>
            );
          })}
          <span className="text-[10px] text-[#9CA3AF]">×{callCount}次</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入对方说的话，一键获取所有API回复..."
              className="w-full rounded-2xl bg-white/80 px-4 py-3 pr-10 text-sm text-[#1E1B4B] shadow-lg shadow-purple-100/30 outline-none ring-1 ring-purple-100/50 placeholder:text-[#9CA3AF] transition-all focus:bg-white focus:ring-[#8B5CF6]/30"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-all active:scale-90 ${
              sending || !input.trim()
                ? 'bg-gray-200 shadow-none'
                : 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] shadow-purple-300/50'
            }`}
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : (
              <Send size={18} className="text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
