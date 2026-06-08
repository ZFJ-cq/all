import { useState } from "react";
import { X, MapPin } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useOrderStore } from "@/stores/orderStore";
import CartItemRow from "./CartItemRow";
import EmptyCart from "./EmptyCart";
import AddressSelector from "./AddressSelector";
import type { Address } from "@/stores/orderStore";

interface CartDetailProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDetail({
  isOpen,
  onClose,
  onCheckout,
}: CartDetailProps) {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const totalCount = useCartStore((s) => s.getTotalCount());
  const addOrder = useOrderStore((s) => s.addOrder);
  const getDefaultAddress = useOrderStore((s) => s.getDefaultAddress);
  const [addressOpen, setAddressOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>(
    undefined
  );

  const currentAddress = selectedAddress || getDefaultAddress();

  const handleCheckout = () => {
    if (!currentAddress) {
      setAddressOpen(true);
      return;
    }
    addOrder(items, currentAddress);
    clearCart();
    onClose();
    onCheckout();
  };

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
          <h3 className="text-base font-bold text-[#2D2D2D]">购物车</h3>
          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-gray-400 active:text-[#FF6F61]"
              >
                清空
              </button>
            )}
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {items.length > 0 && currentAddress && (
          <button
            onClick={() => setAddressOpen(true)}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100"
          >
            <MapPin className="w-4 h-4 text-[#FF6F61] flex-shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#2D2D2D]">
                  {currentAddress.name}
                </span>
                <span className="text-[10px] text-gray-400">
                  {currentAddress.phone}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 truncate">
                {currentAddress.address}
              </p>
            </div>
          </button>
        )}

        <div className="max-h-[45vh] overflow-y-auto px-4">
          {items.length === 0 ? (
            <EmptyCart onClose={onClose} />
          ) : (
            items.map((item) => <CartItemRow key={item.productId} item={item} />)
          )}
        </div>

        {items.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400">合计</span>
              <span className="text-xl font-bold text-[#FF6F61] ml-1">
                ¥{totalPrice.toFixed(1)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="px-8 py-2.5 bg-[#FF6F61] text-white rounded-full text-sm font-semibold active:scale-95 transition-transform shadow-sm shadow-[#FF6F61]/30"
            >
              去结算({totalCount})
            </button>
          </div>
        )}
      </div>

      <AddressSelector
        isOpen={addressOpen}
        onClose={() => setAddressOpen(false)}
        onSelect={(addr) => setSelectedAddress(addr)}
      />
    </>
  );
}
