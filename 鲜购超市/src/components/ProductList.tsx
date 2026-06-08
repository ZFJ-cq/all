import type { Product } from "@/data/products";
import ProductCard from "./ProductCard";
import BannerCarousel from "./BannerCarousel";
import SortBar from "./SortBar";
import { products as allProducts } from "@/data/products";

interface ProductListProps {
  products: Product[];
  onAdd: (product: Product) => void;
  onProductClick: (product: Product) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  activeCategory: string;
}

export default function ProductList({
  products,
  onAdd,
  onProductClick,
  sortBy,
  onSortChange,
  activeCategory,
}: ProductListProps) {
  const flashProducts = allProducts.filter((p) => p.isFlashSale);

  if (products.length === 0 && activeCategory !== "recommend") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="text-5xl mb-3">🔍</div>
        <p className="text-sm">没有找到相关商品</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {activeCategory === "recommend" && (
        <>
          <div className="px-3 pt-3">
            <BannerCarousel />
          </div>

          {flashProducts.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 px-3 mb-2">
                <span className="text-sm font-bold text-[#2D2D2D]">⚡ 限时秒杀</span>
                <span className="text-[10px] text-gray-400">手慢无</span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide px-3 pb-3">
                {flashProducts.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[140px]">
                    <ProductCard
                      product={product}
                      onAdd={onAdd}
                      onProductClick={onProductClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-3 pt-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={onAdd}
                  onProductClick={onProductClick}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {activeCategory === "flash" && (
        <>
          <div className="px-3 pt-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={onAdd}
                  onProductClick={onProductClick}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {activeCategory !== "recommend" && activeCategory !== "flash" && (
        <>
          <SortBar sortBy={sortBy} onSortChange={onSortChange} />
          <div className="px-3 pt-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={onAdd}
                  onProductClick={onProductClick}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
