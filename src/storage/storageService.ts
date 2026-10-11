// src/storage/storageService.ts
import { AppState } from '../types/finance';
import { getHackathonDemoState, getPristineState } from './initialState';

const STORAGE_KEY = 'paisapilot_state_v1';

export class StorageService {
  public static loadState(): AppState {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        const demoState = getHackathonDemoState();
        this.saveState(demoState);
        return demoState;
      }
      const parsed: AppState = JSON.parse(serialized);
      // Validate critical attributes
      if (!parsed || typeof parsed.initialBudget !== 'number') {
        throw new Error('Corrupt state detected in local storage');
      }
      return parsed;
    } catch (err) {
      console.warn('Failed to load state from localStorage, falling back to demo state:', err);
      const demo = getHackathonDemoState();
      this.saveState(demo);
      return demo;
    }
  }

  public static saveState(state: AppState): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      console.error('Failed to save state to localStorage:', err);
      return false;
    }
  }

  public static resetToDemo(): AppState {
    const demo = getHackathonDemoState();
    this.saveState(demo);
    return demo;
  }

  public static resetToPristine(): AppState {
    const pristine = getPristineState();
    this.saveState(pristine);
    return pristine;
  }

  public static exportJSON(state: AppState): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `paisapilot-state-day-${state.currentDay}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
