import { useState } from "react";
import { X, Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
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

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: Product) => void;
}

export default function ProductDetail({
  product,
  isOpen,
  onClose,
  onAdd,
}: ProductDetailProps) {
  const isFavorite = useFavoriteStore((s) =>
    product ? s.ids.includes(product.id) : false
  );
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);
  const [selectedSpec, setSelectedSpec] = useState(0);

  if (!product) return null;

  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxWidth: "480px", margin: "0 auto" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#2D2D2D]">商品详情</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto">
          <div className="aspect-square bg-gray-50">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="px-4 py-3">
            <h2 className="text-lg font-bold text-[#2D2D2D]">{product.name}</h2>
            <p className="text-sm text-gray-400 mt-1">{product.description}</p>

            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <span>★ {product.rating}</span>
              <span>|</span>
              <span>月售{product.sales}</span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-bold text-[#FF6F61]">
                ¥{product.price.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">/{product.unit}</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-300 line-through">
                  ¥{product.originalPrice.toFixed(1)}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs text-red-500 font-semibold">
                  省{discountPercent}%
                </span>
              )}
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      tagColorMap[tag] || "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {product.specs && product.specs.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-semibold text-[#2D2D2D] mb-2">规格</div>
                <div className="flex flex-wrap gap-2">
                  {product.specs.map((spec, i) => (
                    <button
                      key={spec}
                      onClick={() => setSelectedSpec(i)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors duration-200 ${
                        selectedSpec === i
                          ? "bg-[#FF6F61] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.detail && (
              <div className="mt-4">
                <div className="text-sm font-semibold text-[#2D2D2D] mb-2">商品详情</div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {product.detail}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={() => toggleFavorite(product.id)}
            className="flex flex-col items-center justify-center w-12"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
            <span className="text-[10px] text-gray-400 mt-0.5">
              {isFavorite ? "已收藏" : "收藏"}
            </span>
          </button>
          <button
            onClick={() => {
              onAdd(product);
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#FF6F61] text-white rounded-full text-sm font-semibold active:scale-95 transition-transform shadow-sm shadow-[#FF6F61]/30"
          >
            <ShoppingCart className="w-4 h-4" />
            加入购物车
          </button>
        </div>
      </div>
    </>
  );
}
