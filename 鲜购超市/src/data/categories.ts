export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "recommend", name: "推荐", icon: "Flame" },
  { id: "flash", name: "限时秒杀", icon: "Zap" },
  { id: "fruit", name: "新鲜水果", icon: "Apple" },
  { id: "vegetable", name: "时令蔬菜", icon: "Salad" },
  { id: "meat", name: "肉禽蛋品", icon: "Drumstick" },
  { id: "seafood", name: "海鲜水产", icon: "Fish" },
  { id: "dairy", name: "乳品烘焙", icon: "Milk" },
  { id: "snack", name: "休闲零食", icon: "Cookie" },
  { id: "drink", name: "酒水饮料", icon: "Wine" },
  { id: "grain", name: "粮油调味", icon: "Wheat" },
  { id: "frozen", name: "速食冷冻", icon: "Snowflake" },
  { id: "deli", name: "熟食卤味", icon: "Beef" },
  { id: "bakery", name: "面点主食", icon: "Croissant" },
  { id: "baby", name: "母婴用品", icon: "Baby" },
  { id: "pet", name: "宠物用品", icon: "Cat" },
  { id: "household", name: "日用百货", icon: "Home" },
];
