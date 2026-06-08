import { useState, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import CategoryNav from "@/components/CategoryNav";
import ProductList from "@/components/ProductList";
import CartBar from "@/components/CartBar";
import CartDetail from "@/components/CartDetail";
import ProductDetail from "@/components/ProductDetail";
import Toast from "@/components/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useCartStore } from "@/stores/cartStore";
import { products } from "@/data/products";
import type { Product } from "@/data/products";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("recommend");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const addItem = useCartStore((s) => s.addItem);

  const filteredProducts = products.filter((p) => {
    let matchesCategory = true;
    if (activeCategory === "flash") {
      matchesCategory = !!p.isFlashSale;
    } else if (activeCategory !== "recommend") {
      matchesCategory = p.categoryId === activeCategory;
    }
    const matchesSearch =
      debouncedSearch === "" ||
      p.name.includes(debouncedSearch) ||
      p.description.includes(debouncedSearch);
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "sales":
        return b.sales - a.sales;
      case "priceAsc":
        return a.price - b.price;
      case "priceDesc":
        return b.price - a.price;
      case "discount": {
        const discA = a.originalPrice
          ? (1 - a.price / a.originalPrice)
          : 0;
        const discB = b.originalPrice
          ? (1 - b.price / b.originalPrice)
          : 0;
        return discB - discA;
      }
      default:
        return 0;
    }
  });

  const handleAdd = useCallback(
    (product: Product) => {
      addItem(product);
      setToastMessage(`已添加 ${product.name}`);
      setToastVisible((v) => !v);
    },
    [addItem]
  );

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  }, []);

  const handleCheckout = useCallback(() => {
    setToastMessage("下单成功！即将为您配送");
    setToastVisible((v) => !v);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#F5F5F5] max-w-[480px] mx-auto relative overflow-hidden">
      <div className="flex-shrink-0 bg-white shadow-sm">
        <div className="flex items-center justify-center py-2.5">
          <h1 className="text-lg font-bold text-[#2D2D2D]">
            🛒 <span className="text-[#FF6F61]">鲜购</span>超市
          </h1>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <CategoryNav
          activeCategory={activeCategory}
          onCategoryChange={(cat) => {
            setActiveCategory(cat);
            setSortBy("default");
          }}
        />
        <ProductList
          products={sortedProducts}
          onAdd={handleAdd}
          onProductClick={handleProductClick}
          sortBy={sortBy}
          onSortChange={setSortBy}
          activeCategory={activeCategory}
        />
      </div>

      <CartBar onClick={() => setCartOpen(true)} />
      <CartDetail
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />
      <ProductDetail
        product={selectedProduct}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onAdd={handleAdd}
      />
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}
