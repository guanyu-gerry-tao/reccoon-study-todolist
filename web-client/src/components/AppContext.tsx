import { createContext, useContext } from 'react';
import type { States, SetStates, Actions } from '../utils/type';

export const AppContext = createContext<{
  states: States;
  setStates: SetStates;
  actions: Actions;
} | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
