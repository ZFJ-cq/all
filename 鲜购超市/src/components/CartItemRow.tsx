import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/stores/cartStore";
import { useCartStore } from "@/stores/cartStore";

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <img
        src={item.image}
        alt={item.name}
        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-[#2D2D2D] truncate">
          {item.name}
        </h4>
        <span className="text-[#FF6F61] font-bold text-sm">
          ¥{item.price.toFixed(1)}
        </span>
        <span className="text-[10px] text-gray-400">/{item.unit}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() =>
            item.quantity === 1
              ? removeItem(item.productId)
              : updateQuantity(item.productId, item.quantity - 1)
          }
          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center active:scale-90 transition-transform"
        >
          {item.quantity === 1 ? (
            <Trash2 className="w-3 h-3 text-gray-400" />
          ) : (
            <Minus className="w-3 h-3 text-gray-500" />
          )}
        </button>
        <span className="text-sm font-semibold text-[#2D2D2D] min-w-[18px] text-center">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          className="w-6 h-6 rounded-full bg-[#FF6F61] flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus className="w-3 h-3 text-white" />
        </button>
      </div>
    </div>
  );
}
