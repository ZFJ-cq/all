import { ShoppingCart } from "lucide-react";

interface EmptyCartProps {
  onClose: () => void;
}

export default function EmptyCart({ onClose }: EmptyCartProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <ShoppingCart className="w-10 h-10 text-gray-300" />
      </div>
      <p className="text-gray-400 text-sm mb-4">购物车是空的</p>
      <button
        onClick={onClose}
        className="px-6 py-2 bg-[#FF6F61] text-white rounded-full text-sm font-semibold active:scale-95 transition-transform"
      >
        去逛逛
      </button>
    </div>
  );
}
