import { InventoryMap, PracticeAttempt, SimulatorSettings } from '../types/simulator';
import { DEFAULT_SETTINGS } from '../data/mockProfiles';

const STORAGE_KEYS = {
  ATTEMPTS: 'ttd_sim_attempts_v1',
  BEST_TIME: 'ttd_sim_best_time_v1',
  SETTINGS: 'ttd_sim_settings_v1',
  INVENTORY: 'ttd_sim_inventory_v1',
};

export function loadAttempts(): PracticeAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAttempts(attempts: PracticeAttempt[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
  } catch {
    // Ignore quota errors in restricted sandboxes
  }
}

export function loadBestTime(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BEST_TIME);
    if (!raw) return null;
    const val = Number(raw);
    return Number.isFinite(val) && val > 0 ? val : null;
  } catch {
    return null;
  }
}

export function saveBestTime(seconds: number | null): void {
  try {
    if (seconds === null) {
      localStorage.removeItem(STORAGE_KEYS.BEST_TIME);
    } else {
      localStorage.setItem(STORAGE_KEYS.BEST_TIME, String(seconds));
    }
  } catch {
    // Ignore storage errors
  }
}

export function loadSettings(): SimulatorSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SimulatorSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      categoryLimits: {
        ...DEFAULT_SETTINGS.categoryLimits,
        ...(parsed.categoryLimits || {}),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SimulatorSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

export function loadInventory(): InventoryMap | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function saveInventory(inventory: InventoryMap): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  } catch {
    // Ignore storage errors
  }
}

export function clearPracticeStats(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.BEST_TIME);
  } catch {
    // Ignore storage errors
  }
}
