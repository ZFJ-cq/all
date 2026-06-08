import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

interface CartBarProps {
  onClick: () => void;
}

export default function CartBar({ onClick }: CartBarProps) {
  const totalCount = useCartStore((s) => s.getTotalCount());
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30"
      style={{ maxWidth: "480px", margin: "0 auto" }}
    >
      <div className="bg-[#2D2D2D] mx-3 mb-3 rounded-full flex items-center justify-between px-4 py-2.5 shadow-lg shadow-black/20">
        <button
          onClick={onClick}
          className="relative flex items-center gap-2"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-white" />
            {totalCount > 0 && (
              <span
                key={totalCount}
                className="absolute -top-2 -right-2 bg-[#FF6F61] text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 animate-bounce-once"
              >
                {totalCount}
              </span>
            )}
          </div>
          {totalPrice > 0 && (
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-tight">
                ¥{totalPrice.toFixed(1)}
              </span>
              <span className="text-[10px] text-gray-400">预计30分钟送达</span>
            </div>
          )}
        </button>
        <button
          onClick={onClick}
          disabled={totalCount === 0}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            totalCount > 0
              ? "bg-[#FF6F61] text-white active:scale-95"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          去结算
        </button>
      </div>
    </div>
  );
}
