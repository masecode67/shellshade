import { create } from 'zustand';
import type { ThemeSummary, Tag } from '../../shared/types/theme';

interface LibraryState {
  // Theme library
  themes: ThemeSummary[];
  selectedThemeId: string | null;

  // Tags
  tags: Tag[];
  selectedTags: number[];

  // Search and filters
  searchQuery: string;
  showFavoritesOnly: boolean;
  sortBy: 'name' | 'updatedAt' | 'author';
  sortDirection: 'asc' | 'desc';

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Actions
  setThemes: (themes: ThemeSummary[]) => void;
  addTheme: (theme: ThemeSummary) => void;
  updateTheme: (id: string, updates: Partial<ThemeSummary>) => void;
  removeTheme: (id: string) => void;

  setSelectedThemeId: (id: string | null) => void;

  setTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  removeTag: (id: number) => void;

  setSelectedTags: (tagIds: number[]) => void;
  toggleTag: (tagId: number) => void;

  setSearchQuery: (query: string) => void;
  setShowFavoritesOnly: (showFavorites: boolean) => void;
  setSortBy: (sortBy: LibraryState['sortBy']) => void;
  setSortDirection: (direction: LibraryState['sortDirection']) => void;

  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  clearFilters: () => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  themes: [],
  selectedThemeId: null,

  tags: [],
  selectedTags: [],

  searchQuery: '',
  showFavoritesOnly: false,
  sortBy: 'updatedAt',
  sortDirection: 'desc',

  isLoading: false,
  error: null,

  setThemes: (themes) => set({ themes }),

  addTheme: (theme) =>
    set((state) => ({
      themes: [...state.themes, theme],
    })),

  updateTheme: (id, updates) =>
    set((state) => ({
      themes: state.themes.map((theme) =>
        theme.id === id ? { ...theme, ...updates } : theme
      ),
    })),

  removeTheme: (id) =>
    set((state) => ({
      themes: state.themes.filter((theme) => theme.id !== id),
      selectedThemeId: state.selectedThemeId === id ? null : state.selectedThemeId,
    })),

  setSelectedThemeId: (id) => set({ selectedThemeId: id }),

  setTags: (tags) => set({ tags }),

  addTag: (tag) =>
    set((state) => ({
      tags: [...state.tags, tag],
    })),

  removeTag: (id) =>
    set((state) => ({
      tags: state.tags.filter((tag) => tag.id !== id),
      selectedTags: state.selectedTags.filter((tagId) => tagId !== id),
    })),

  setSelectedTags: (tagIds) => set({ selectedTags: tagIds }),

  toggleTag: (tagId) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tagId)
        ? state.selectedTags.filter((id) => id !== tagId)
        : [...state.selectedTags, tagId],
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setShowFavoritesOnly: (showFavorites) => set({ showFavoritesOnly: showFavorites }),

  setSortBy: (sortBy) => set({ sortBy }),

  setSortDirection: (direction) => set({ sortDirection: direction }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearFilters: () =>
    set({
      searchQuery: '',
      showFavoritesOnly: false,
      selectedTags: [],
      sortBy: 'updatedAt',
      sortDirection: 'desc',
    }),
}));
