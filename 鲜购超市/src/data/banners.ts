export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  textColor: string;
  emoji: string;
}

export const banners: Banner[] = [
  {
    id: "b1",
    title: "新人专享",
    subtitle: "首单立减20元",
    bgColor: "linear-gradient(135deg, #FF6F61 0%, #FF8E53 100%)",
    textColor: "#FFFFFF",
    emoji: "🎁",
  },
  {
    id: "b2",
    title: "限时秒杀",
    subtitle: "低至3折起",
    bgColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#FFFFFF",
    emoji: "⚡",
  },
  {
    id: "b3",
    title: "满99减15",
    subtitle: "生鲜全品类",
    bgColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    textColor: "#FFFFFF",
    emoji: "🛍️",
  },
  {
    id: "b4",
    title: "免费配送",
    subtitle: "满39元包邮",
    bgColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    textColor: "#FFFFFF",
    emoji: "🚚",
  },
];
