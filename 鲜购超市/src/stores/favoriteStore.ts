import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoriteStore {
  ids: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      ids: [],

      toggleFavorite: (id: string) => {
        set((state) => {
          if (state.ids.includes(id)) {
            return { ids: state.ids.filter((fid) => fid !== id) };
          }
          return { ids: [...state.ids, id] };
        });
      },

      isFavorite: (id: string) => {
        return get().ids.includes(id);
      },
    }),
    {
      name: "fresh-favorites-storage",
    }
  )
);
