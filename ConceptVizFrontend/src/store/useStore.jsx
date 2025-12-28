import { create } from 'zustand';
import { authService } from '../services/authService';

export const useStore = create((set) => ({
  user: authService.getStoredUser(),
  currentDiagram: null,
  savedDiagrams: [],
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  
  setCurrentDiagram: (diagram) => set({ currentDiagram: diagram }),
  
  setSavedDiagrams: (diagrams) => set({ savedDiagrams: diagrams }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  logout: () => {
    authService.logout();
    set({ user: null, currentDiagram: null, savedDiagrams: [] });
  },
}));