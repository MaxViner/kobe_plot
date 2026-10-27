import { create } from 'zustand';

const DEFAULT_GRID_SETTINGS = {
  dx: 200,
  dy: 500,
  targetRadius: 50,
  approachCourse: 270,
};

export const useGridSettingsStore = create(
  (set) => ({
    ...DEFAULT_GRID_SETTINGS,

    updateGridSettings: (nextSettings) =>
      set((state) => ({
        ...state,
        ...nextSettings,
      })),

    resetGridSettings: () =>
      set({ ...DEFAULT_GRID_SETTINGS }),
  }),
);