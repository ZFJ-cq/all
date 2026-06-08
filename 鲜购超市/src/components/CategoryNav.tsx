import {
  Flame,
  Apple,
  Salad,
  Drumstick,
  Fish,
  Milk,
  Cookie,
  Wine,
  Wheat,
  Snowflake,
  Zap,
  Beef,
  Croissant,
  Baby,
  Cat,
  Home,
} from "lucide-react";
import { categories } from "@/data/categories";

const iconMap: Record<string, React.ElementType> = {
  Flame,
  Apple,
  Salad,
  Drumstick,
  Fish,
  Milk,
  Cookie,
  Wine,
  Wheat,
  Snowflake,
  Zap,
  Beef,
  Croissant,
  Baby,
  Cat,
  Home,
};

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export default function CategoryNav({
  activeCategory,
  onCategoryChange,
}: CategoryNavProps) {
  return (
    <div className="w-20 md:w-[120px] flex-shrink-0 bg-[#F5F5F5] overflow-y-auto scrollbar-hide h-full">
      <div className="flex flex-col">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon];
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`relative flex flex-col items-center justify-center py-3 px-1 text-xs transition-all duration-200 ${
                isActive
                  ? "bg-white text-[#FF6F61] font-semibold"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#FF6F61] rounded-r-full" />
              )}
              {Icon && (
                <Icon
                  className={`w-5 h-5 mb-1 ${
                    isActive ? "text-[#FF6F61]" : "text-gray-400"
                  }`}
                />
              )}
              <span className="leading-tight text-center">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
