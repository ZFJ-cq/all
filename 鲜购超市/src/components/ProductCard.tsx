import { Plus, Minus, Heart } from "lucide-react";
import type { Product } from "@/data/products";
import { useCartStore } from "@/stores/cartStore";
import { useFavoriteStore } from "@/stores/favoriteStore";

const tagColorMap: Record<string, string> = {
  热卖: "bg-red-100 text-red-500",
  爆款: "bg-orange-100 text-orange-500",
  新品: "bg-blue-100 text-blue-500",
  进口: "bg-purple-100 text-purple-500",
  有机: "bg-green-100 text-green-600",
  品质: "bg-yellow-100 text-yellow-600",
  健身: "bg-teal-100 text-teal-600",
  健康: "bg-green-100 text-green-600",
};

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export default function ProductCard({ product, onAdd, onProductClick }: ProductCardProps) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartItem = items.find((item) => item.productId === product.id);
  const quantity = cartItem?.quantity || 0;
  const isFavorite = useFavoriteStore((s) => s.ids.includes(product.id));
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);

  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md group relative">
      <button
        onClick={() => toggleFavorite(product.id)}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
          }`}
        />
      </button>

      <div
        className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer"
        onClick={() => onProductClick(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {product.isFlashSale && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            秒杀
          </span>
        )}
        {discountPercent > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </span>
        )}
      </div>

      <div className="p-2.5 flex flex-col flex-1">
        <h3
          className="text-sm font-semibold text-[#2D2D2D] leading-tight truncate cursor-pointer"
          onClick={() => onProductClick(product)}
        >
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {product.description}
        </p>

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] px-1.5 py-0 rounded-full ${
                  tagColorMap[tag] || "bg-gray-100 text-gray-500"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="text-[10px] text-gray-400 mt-1">
          ★ {product.rating} | 月售{product.sales}
        </div>

        <div className="flex items-end justify-between mt-auto pt-2">
          <div>
            <span className="text-[#FF6F61] font-bold text-base">
              ¥{product.price.toFixed(1)}
            </span>
            <span className="text-[10px] text-gray-400 ml-0.5">
              /{product.unit}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] text-gray-300 line-through ml-1">
                ¥{product.originalPrice.toFixed(1)}
              </span>
            )}
          </div>
          {quantity > 0 ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-6 h-6 rounded-full border border-[#FF6F61] flex items-center justify-center active:scale-90 transition-transform"
              >
                <Minus className="w-3 h-3 text-[#FF6F61]" />
              </button>
              <span className="text-sm font-semibold text-[#2D2D2D] min-w-[18px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => onAdd(product)}
                className="w-6 h-6 rounded-full bg-[#FF6F61] flex items-center justify-center active:scale-90 transition-transform"
              >
                <Plus className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(product)}
              className="w-7 h-7 rounded-full bg-[#FF6F61] flex items-center justify-center active:scale-90 transition-transform shadow-sm shadow-[#FF6F61]/30"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
