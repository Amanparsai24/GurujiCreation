import { create } from 'zustand';
import api from '../api/axios';
import type { Product } from '../types';

interface WishlistState {
  items: Product[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/wishlist');
      set({ items: response.data.map((w: any) => w.product) });
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addToWishlist: async (productId: number) => {
    try {
      const response = await api.post('/wishlist', { product_id: productId });
      const currentItems = get().items;
      if (!currentItems.find(p => p.id === productId)) {
        set({ items: [...currentItems, response.data.product] });
      }
    } catch (error) {
      console.error('Failed to add to wishlist', error);
    }
  },
  removeFromWishlist: async (productId: number) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      set({ items: get().items.filter(p => p.id !== productId) });
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
    }
  },
  isInWishlist: (productId: number) => {
    return get().items.some(p => p.id === productId);
  }
}));
