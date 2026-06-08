import { X, MapPin, Check } from "lucide-react";
import { useOrderStore } from "@/stores/orderStore";
import type { Address } from "@/stores/orderStore";

interface AddressSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: Address) => void;
}

const tagColorMap: Record<string, string> = {
  家: "bg-blue-100 text-blue-500",
  公司: "bg-purple-100 text-purple-500",
  学校: "bg-green-100 text-green-500",
};

export default function AddressSelector({
  isOpen,
  onClose,
  onSelect,
}: AddressSelectorProps) {
  const addresses = useOrderStore((s) => s.addresses);

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
          <h3 className="text-base font-bold text-[#2D2D2D]">选择地址</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="max-h-[45vh] overflow-y-auto px-4">
          {addresses.map((addr) => (
            <button
              key={addr.id}
              onClick={() => {
                onSelect(addr);
                onClose();
              }}
              className="w-full flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0 text-left"
            >
              <MapPin className="w-5 h-5 text-[#FF6F61] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#2D2D2D]">
                    {addr.name}
                  </span>
                  <span className="text-xs text-gray-400">{addr.phone}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0 rounded-full ${
                      tagColorMap[addr.tag] || "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {addr.tag}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {addr.address}
                </p>
              </div>
              {addr.isDefault && (
                <Check className="w-4 h-4 text-[#FF6F61] flex-shrink-0 mt-1" />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
