import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./cartStore";

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  tag: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number;
  totalCount: number;
  address: Address;
  createdAt: number;
  status: "pending" | "delivering" | "delivered";
}

interface OrderStore {
  addresses: Address[];
  orders: Order[];
  addAddress: (address: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getDefaultAddress: () => Address | undefined;
  addOrder: (items: CartItem[], address: Address) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      addresses: [
        {
          id: "addr1",
          name: "张三",
          phone: "138****8888",
          address: "北京市朝阳区建国路88号SOHO现代城A座1208",
          tag: "家",
          isDefault: true,
        },
        {
          id: "addr2",
          name: "张三",
          phone: "138****8888",
          address: "北京市海淀区中关村大街1号海龙大厦15层",
          tag: "公司",
          isDefault: false,
        },
      ],
      orders: [],

      addAddress: (address) => {
        const id = `addr_${Date.now()}`;
        set((state) => ({
          addresses: [
            ...state.addresses.map((a) =>
              address.isDefault ? { ...a, isDefault: false } : a
            ),
            { ...address, id },
          ],
        }));
      },

      removeAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        }));
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        }));
      },

      getDefaultAddress: () => {
        return get().addresses.find((a) => a.isDefault) || get().addresses[0];
      },

      addOrder: (items, address) => {
        const order: Order = {
          id: `order_${Date.now()}`,
          items: [...items],
          totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
          totalCount: items.reduce((sum, item) => sum + item.quantity, 0),
          address,
          createdAt: Date.now(),
          status: "pending",
        };
        set((state) => ({
          orders: [order, ...state.orders],
        }));
      },
    }),
    {
      name: "fresh-order-storage",
    }
  )
);
