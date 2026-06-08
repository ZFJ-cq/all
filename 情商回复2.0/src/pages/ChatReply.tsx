import { useState, useRef, useCallback } from 'react';
import { Send, RotateCcw, Copy, Check, Sparkles, MessageCircleHeart, CheckCircle2, AlertCircle } from 'lucide-react';

// API 配置类型
interface ApiConfig {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

const API_LIST: ApiConfig[] = [
  { id: 'qingyunke', name: '青云客', icon: '☁️', desc: '免费无限 · 闲聊首选' },
  { id: 'tiangong', name: '天行AI', icon: '🌟', desc: '暖心委婉 · 高情商' },
  { id: 'xiaosi', name: '小思机器人', icon: '🎭', desc: '多风格切换' },
  { id: 'xiaoi', name: '小爱闲聊', icon: '💬', desc: '生活化 · 口语自然' },
  { id: 'ruyi', name: '如意海知', icon: '🧜', desc: '自定义人设' },
  { id: 'benben', name: '笨笨机器人', icon: '🤖', desc: '自带emoji' },
  { id: 'mlvoca', name: 'MLVoca大模型', icon: '🧠', desc: 'AI生成' },
];

// API 调用结果类型
interface ApiResult {
  apiId: string;
  apiName: string;
  apiIcon: string;
  content: string;
  success: boolean;
  loading: boolean;
}

// 对话历史类型
interface Conversation {
  id: string;
  input: string;
  results: ApiResult[];
  timestamp: number;
}

// API 调用函数
async function callApi(apiId: string, msg: string): Promise<string> {
  const encoded = encodeURIComponent(msg);

  switch (apiId) {
    case 'qingyunke': {
      try {
        const res = await fetch(`/api/qingyunke/api.php?key=free&appid=0&msg=${encoded}`);
        const data = await res.json();
        if (data.result === 0) return data.content;
        throw new Error(data.content || '请求失败');
      } catch {
        const text = await fetch(`/api/qingyunke/api.php?key=free&appid=0&msg=${encoded}`).then(r => r.text());
        return text.length > 0 ? text : '接口异常';
      }
    }
    case 'tiangong': {
      try {
        const res = await fetch(`/api/tiangong/robot/chat?msg=${encoded}`);
        const text = await res.text();
        if (text.includes('html')) {
          throw new Error('接口返回HTML');
        }
        const data = JSON.parse(text);
        if (data.code === 200) return data.reply;
        throw new Error(data.reply || '请求失败');
      } catch {
        return '接口维护中';
      }
    }
    case 'xiaosi': {
      try {
        const res = await fetch(`/api/xiaosi/api.php?msg=${encoded}&type=1`);
        const text = await res.text();
        if (text.includes('html')) {
          throw new Error('接口返回HTML');
        }
        const data = JSON.parse(text);
        return data.content || data.text || data.reply || JSON.stringify(data);
      } catch {
        return '接口维护中';
      }
    }
    case 'xiaoi': {
      const res = await fetch(`/api/xiaoi/free/chat?content=${encoded}`);
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        return data.reply || data.content || data.text || text;
      } catch {
        return text.length > 0 && !text.includes('html') ? text : '接口维护中';
      }
    }
    case 'ruyi': {
      try {
        const res = await fetch(`/api/haitun/free/robot?q=${encoded}&role=${encodeURIComponent('暖心闺蜜')}`);
        const text = await res.text();
        if (text.includes('html')) {
          throw new Error('接口返回HTML');
        }
        const data = JSON.parse(text);
        return data.reply || data.content || data.text || JSON.stringify(data);
      } catch {
        return '接口维护中';
      }
    }
    case 'benben': {
      const res = await fetch(`/api/benben/api?text=${encoded}`);
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        return data.content || data.text || data.reply || text;
      } catch {
        return text.length > 0 && !text.includes('html') ? text : '接口维护中';
      }
    }
    case 'mlvoca': {
      try {
        const res = await fetch('/api/mlvoca/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'tinyllama',
            prompt: `你是高情商文案师，根据这句话生成温柔回复：${msg}`,
          }),
        });
        const text = await res.text();
        if (text.includes('html')) {
          throw new Error('接口返回HTML');
        }
        const data = JSON.parse(text);
        return data.response || data.content || data.text || JSON.stringify(data);
      } catch {
        return '接口维护中';
      }
    }
    default:
      throw new Error('未知API');
  }
}

export default function ChatReply() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 发送消息 - 同时调用所有API
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setLoading(true);

    // 创建初始结果（全部加载中）
    const initialResults: ApiResult[] = API_LIST.map((api) => ({
      apiId: api.id,
      apiName: api.name,
      apiIcon: api.icon,
      content: '',
      success: false,
      loading: true,
    }));

    const newConversation: Conversation = {
      id: Date.now().toString(),
      input: text,
      results: initialResults,
      timestamp: Date.now(),
    };

    setConversations((prev) => [newConversation, ...prev]);

    // 同时调用所有API
    const promises = API_LIST.map(async (api) => {
      try {
        const result = await callApi(api.id, text);
        return { apiId: api.id, content: result, success: true };
      } catch (err) {
        return { apiId: api.id, content: err instanceof Error ? err.message : '请求失败', success: false };
      }
    });

    // 逐个更新结果
    for (const promise of promises) {
      const { apiId, content, success } = await promise;
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === newConversation.id
            ? {
                ...conv,
                results: conv.results.map((r) =>
                  r.apiId === apiId ? { ...r, content, success, loading: false } : r
                ),
              }
            : conv
        )
      );
    }

    setLoading(false);
  }, [input, loading]);

  // 复制回复
  const handleCopy = useCallback((convId: string, apiId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    const result = conv?.results.find((r) => r.apiId === apiId);
    if (result?.content) {
      navigator.clipboard.writeText(result.content).then(() => {
        setCopiedId(`${convId}-${apiId}`);
        setTimeout(() => setCopiedId(null), 1500);
      });
    }
  }, [conversations]);

  // 清空历史
  const handleClear = useCallback(() => {
    setConversations([]);
  }, []);

  // 快捷提问
  const quickQuestions = ['今天心情不好', '最近好累', '被人冷落了', '怎么安慰失恋的朋友', '面试紧张怎么办'];

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-gradient-to-b from-[#F5F0FF] via-[#FFF5F9] to-[#FFF0F5]">
      {/* 顶部标题栏 */}
      <header className="sticky top-0 z-40 glass-purple px-4 pb-3 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] shadow-lg shadow-purple-200">
              <MessageCircleHeart size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1E1B4B]">情商回复2.0</h1>
              <p className="text-[11px] text-[#8B5CF6]/70">多API对比，选择最优回复</p>
            </div>
          </div>
          <button
            onClick={handleClear}
            disabled={conversations.length === 0}
            className="flex items-center gap-1 rounded-full bg-white/60 px-3 py-1.5 text-xs text-[#6B7280] shadow-sm transition-all disabled:opacity-50 disabled:active:scale-100 active:scale-95"
          >
            <RotateCcw size={12} />
            清空
          </button>
        </div>

        {/* API数量提示 */}
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/50 px-3 py-2">
          <Sparkles size={14} className="text-[#8B5CF6]" />
          <span className="text-xs text-[#6B7280]">
            同时调用 <span className="font-semibold text-[#8B5CF6]">{API_LIST.length}</span> 个AI接口
          </span>
        </div>
      </header>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4">
        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20">
              <Sparkles size={36} className="text-[#8B5CF6]" />
            </div>
            <h2 className="mb-1 text-lg font-bold text-[#1E1B4B]">输入对方说的话</h2>
            <p className="mb-6 text-sm text-[#6B7280]">所有AI接口同时响应，对比选择最优回复</p>

            {/* 快捷提问 */}
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

        {/* 对话历史 */}
        {conversations.map((conv) => (
          <div key={conv.id} className="mb-6 animate-slide-up">
            {/* 用户输入 */}
            <div className="mb-4 flex justify-end">
              <div className="max-w-[80%]">
                <div className="rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-4 py-3 text-sm text-white shadow-lg shadow-purple-200/50">
                  {conv.input}
                </div>
                <div className="mt-1 flex justify-end">
                  <span className="text-[10px] text-[#8B5CF6]/50">我的提问</span>
                </div>
              </div>
            </div>

            {/* 所有API回复列表 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
                <span className="text-[11px] text-[#8B5CF6]/60">AI回复列表</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
              </div>

              {conv.results.map((result) => (
                <div
                  key={result.apiId}
                  className={`group rounded-xl bg-white p-3 shadow-md shadow-purple-100/30 transition-all ${
                    result.loading ? 'opacity-60' : ''
                  }`}
                >
                  {/* API头部 */}
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{result.apiIcon}</span>
                      <span className="text-sm font-medium text-[#1E1B4B]">{result.apiName}</span>
                      {result.loading ? (
                        <span className="flex h-4 w-4 animate-spin">
                          <svg className="h-full w-full animate-spin" viewBox="0 0 24 24">
                            <circle className="h-full w-full animate-ping opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </span>
                      ) : result.success ? (
                        <CheckCircle2 size={14} className="text-[#34D399]" />
                      ) : (
                        <AlertCircle size={14} className="text-[#F87171]" />
                      )}
                    </div>
                    <button
                      onClick={() => handleCopy(conv.id, result.apiId)}
                      disabled={result.loading || !result.content}
                      className="flex items-center gap-0.5 text-[10px] text-[#8B5CF6]/50 transition-colors hover:text-[#8B5CF6] disabled:opacity-30"
                    >
                      {copiedId === `${conv.id}-${result.apiId}` ? (
                        <>
                          <Check size={10} />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy size={10} />
                          复制
                        </>
                      )}
                    </button>
                  </div>

                  {/* 回复内容 */}
                  <div
                    className={`text-sm leading-relaxed ${
                      result.loading
                        ? 'text-[#9CA3AF]'
                        : result.success
                        ? 'text-[#1E1B4B]'
                        : 'text-[#F87171]'
                    }`}
                  >
                    {result.loading ? (
                      <span className="animate-pulse-soft">正在思考中...</span>
                    ) : (
                      result.content
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 底部输入区域 */}
      <div className="sticky bottom-0 z-30 border-t border-purple-100/50 bg-gradient-to-t from-[#F5F0FF] via-[#F5F0FF] to-transparent px-4 pb-4 pt-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入对方说的话..."
              className="w-full rounded-2xl bg-white/80 px-4 py-3 pr-10 text-sm text-[#1E1B4B] shadow-lg shadow-purple-100/30 outline-none ring-1 ring-purple-100/50 placeholder:text-[#9CA3AF] transition-all focus:bg-white focus:ring-[#8B5CF6]/30"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-all active:scale-90 ${
              loading || !input.trim()
                ? 'bg-gray-200 shadow-none'
                : 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] shadow-purple-300/50'
            }`}
          >
            <Send size={18} className={loading || !input.trim() ? 'text-gray-400' : 'text-white'} />
          </button>
        </div>
        {loading && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="flex h-5 w-5 animate-spin">
              <svg className="h-full w-full" viewBox="0 0 24 24">
                <circle className="h-full w-full animate-ping opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <span className="text-xs text-[#8B5CF6]/60">正在同时调用 {API_LIST.length} 个接口...</span>
          </div>
        )}
      </div>
    </div>
  );
}
