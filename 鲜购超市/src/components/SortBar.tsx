interface SortBarProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const sortOptions = [
  { key: "default", label: "综合" },
  { key: "sales", label: "销量" },
  { key: "priceAsc", label: "价格↑" },
  { key: "priceDesc", label: "价格↓" },
  { key: "discount", label: "折扣" },
];

export default function SortBar({ sortBy, onSortChange }: SortBarProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-white border-b border-gray-100">
      {sortOptions.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onSortChange(opt.key)}
          className={`relative px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
            sortBy === opt.key
              ? "text-[#FF6F61] font-semibold"
              : "text-gray-500"
          }`}
        >
          {opt.label}
          {sortBy === opt.key && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#FF6F61] rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
