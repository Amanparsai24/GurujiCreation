import { create } from 'zustand';
import api from '../api/axios';

interface SettingsState {
  themeColor: string;
  siteLogo: string | null;
  whatsappNumber: string;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: { themeColor?: string, siteLogo?: string | null, whatsappNumber?: string }) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  themeColor: '#1e3a8a',
  siteLogo: null,
  whatsappNumber: '919876543210',
  loading: true,
  fetchSettings: async () => {
    try {
      const response = await api.get('/settings');
      const settings = response.data;
      if (settings.themeColor) {
        document.documentElement.style.setProperty('--color-primary', settings.themeColor);
        set({ themeColor: settings.themeColor });
      }
      if (settings.siteLogo) {
        set({ siteLogo: settings.siteLogo });
      }
      if (settings.whatsappNumber) {
        set({ whatsappNumber: settings.whatsappNumber });
      }
    } catch (error) {
      console.error('Failed to load settings', error);
    } finally {
      set({ loading: false });
    }
  },
  updateSettings: async (newSettings) => {
    try {
      const payload = {
        settings: [] as any[]
      };
      
      if (newSettings.themeColor) {
        payload.settings.push({ key: 'themeColor', value: newSettings.themeColor, type: 'string' });
        document.documentElement.style.setProperty('--color-primary', newSettings.themeColor);
      }
      
      if (newSettings.siteLogo !== undefined) {
        payload.settings.push({ key: 'siteLogo', value: newSettings.siteLogo, type: 'string' });
      }

      if (newSettings.whatsappNumber) {
        payload.settings.push({ key: 'whatsappNumber', value: newSettings.whatsappNumber, type: 'string' });
      }

      await api.post('/admin/settings', payload);
      
      set((state) => ({ ...state, ...newSettings }));
    } catch (error) {
      console.error('Failed to update settings', error);
      throw error;
    }
  }
}));
