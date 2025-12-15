import { create } from 'zustand';
import type { Theme } from '../../shared/types/theme';

interface ThemeState {
  // Current theme being edited
  currentTheme: Theme | null;

  // Editing state
  isEditing: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  setCurrentTheme: (theme: Theme | null) => void;
  updateCurrentTheme: (updates: Partial<Theme>) => void;
  setIsEditing: (isEditing: boolean) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  resetEditor: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: null,
  isEditing: false,
  hasUnsavedChanges: false,

  setCurrentTheme: (theme) =>
    set({
      currentTheme: theme,
      isEditing: theme !== null,
      hasUnsavedChanges: false,
    }),

  updateCurrentTheme: (updates) =>
    set((state) => {
      if (!state.currentTheme) return state;
      return {
        currentTheme: { ...state.currentTheme, ...updates },
        hasUnsavedChanges: true,
      };
    }),

  setIsEditing: (isEditing) => set({ isEditing }),

  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

  resetEditor: () =>
    set({
      currentTheme: null,
      isEditing: false,
      hasUnsavedChanges: false,
    }),
}));
