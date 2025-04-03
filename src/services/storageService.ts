import { Tournament, AppState } from '../models/types';

const STORAGE_KEY = 'heat-tournament-data';
const LAST_BACKUP_KEY = 'heat-tournament-last-backup';
// We'll still track the backup time for informational purposes
const LAST_BACKUP_TIME_KEY = 'heat-tournament-last-backup-time';

/**
 * Save application state to local storage
 */
export const saveAppState = (state: AppState): void => {
    try {
        // First, save the current state to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

        // Create auto-backup if there are tournaments in the state
        if (state.tournaments.length > 0) {
            // Create an auto-backup file on every data change
            createAutoBackup(state);

            // Update the last backup time for reference
            setLastBackupTime(Date.now());
        }
    } catch (error) {
        console.error('Error saving to local storage:', error);
    }
};

/**
 * Load application state from local storage
 */
export const loadAppState = (): AppState | null => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data) as AppState;
        }
    } catch (error) {
        console.error('Error loading from local storage:', error);
    }
    return null;
};

/**
 * Save a tournament to local storage
 */
export const saveTournament = (tournament: Tournament): void => {
    try {
        // Get existing state
        const state = loadAppState() || { tournaments: [] };

        // Update tournament if it exists, add it if it's new
        const index = state.tournaments.findIndex(t => t.id === tournament.id);
        if (index >= 0) {
            state.tournaments[index] = tournament;
        } else {
            state.tournaments.push(tournament);
        }

        // Save updated state
        saveAppState(state);
    } catch (error) {
        console.error('Error saving tournament:', error);
    }
};

/**
 * Delete a tournament from local storage
 */
export const deleteTournament = (tournamentId: string): void => {
    try {
        const state = loadAppState();
        if (state) {
            state.tournaments = state.tournaments.filter(t => t.id !== tournamentId);
            saveAppState(state);
        }
    } catch (error) {
        console.error('Error deleting tournament:', error);
    }
};

/**
 * Export app data to a file
 */
export const exportData = (): void => {
    try {
        const state = loadAppState();
        if (state) {
            const dataStr = JSON.stringify(state, null, 2);
            const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

            const exportFileDefaultName = `heat-tournament-data-${new Date().toISOString()}.json`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        }
    } catch (error) {
        console.error('Error exporting data:', error);
    }
};

/**
 * Create an auto-backup file
 */
const createAutoBackup = (state: AppState): void => {
    try {
        const dataStr = JSON.stringify(state, null, 2);
        const now = new Date();
        const timestamp = now.toISOString();

        // Save the main auto-backup data to local storage (latest version)
        localStorage.setItem('heat-tournament-auto-backup', dataStr);

        // Save a timestamped version as well (for history)
        localStorage.setItem(`heat-tournament-backup-${timestamp}`, dataStr);

        // Keep only the 3 most recent backups to avoid filling localStorage
        cleanupOldBackups();

        // Update timestamps for tracking
        localStorage.setItem('heat-tournament-auto-backup-time', timestamp);

        console.log('Auto-backup created:', now.toLocaleString());
    } catch (error) {
        console.error('Error creating auto-backup:', error);
    }
};

/**
 * Clean up old backups, keeping only the 3 most recent
 */
const cleanupOldBackups = (): void => {
    try {
        // Get all keys from localStorage
        const backupKeys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('heat-tournament-backup-')) {
                backupKeys.push(key);
            }
        }

        // Sort them by date (newest first)
        backupKeys.sort().reverse();

        // Remove all but the most recent 3
        if (backupKeys.length > 3) {
            const keysToRemove = backupKeys.slice(3);
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            console.log(`Cleaned up ${keysToRemove.length} old backups`);
        }
    } catch (error) {
        console.error('Error cleaning up old backups:', error);
    }
};

/**
 * Import app data from a file
 */
export const importData = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string) as AppState;
                saveAppState(data);
                resolve(true);
            } catch (error) {
                console.error('Error parsing imported data:', error);
                reject(error);
            }
        };

        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            reject(error);
        };

        reader.readAsText(file);
    });
};

/**
 * Get the timestamp of the last backup
 */
const getLastBackupTime = (): number | null => {
    const timestamp = localStorage.getItem(LAST_BACKUP_TIME_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
};

/**
 * Set the timestamp of the last backup
 */
const setLastBackupTime = (timestamp: number): void => {
    localStorage.setItem(LAST_BACKUP_TIME_KEY, timestamp.toString());
};

/**
 * Restore data from the latest auto-backup
 */
export const restoreFromAutoBackup = (): boolean => {
    try {
        const backupData = localStorage.getItem('heat-tournament-auto-backup');
        if (backupData) {
            const state = JSON.parse(backupData) as AppState;
            saveAppState(state);
            return true;
        }
    } catch (error) {
        console.error('Error restoring from auto-backup:', error);
    }
    return false;
};

/**
 * Get all available backups with their timestamps
 */
export const getAvailableBackups = (): { id: string, timestamp: string }[] => {
    try {
        const backups: { id: string, timestamp: string }[] = [];

        // Add the main auto-backup if it exists
        const mainBackupTime = localStorage.getItem('heat-tournament-auto-backup-time');
        if (mainBackupTime) {
            backups.push({
                id: 'heat-tournament-auto-backup',
                timestamp: mainBackupTime
            });
        }

        // Add all timestamped backups
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('heat-tournament-backup-')) {
                const timestamp = key.replace('heat-tournament-backup-', '');
                backups.push({
                    id: key,
                    timestamp
                });
            }
        }

        // Sort by most recent first
        backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return backups;
    } catch (error) {
        console.error('Error getting available backups:', error);
        return [];
    }
};

/**
 * Restore data from a specific backup by its ID
 */
export const restoreFromSpecificBackup = (backupId: string): boolean => {
    try {
        const backupData = localStorage.getItem(backupId);
        if (backupData) {
            const state = JSON.parse(backupData) as AppState;

            // Save to main storage (without creating a new backup)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

            // Update timestamp for reference
            setLastBackupTime(Date.now());

            return true;
        }
    } catch (error) {
        console.error(`Error restoring from backup ${backupId}:`, error);
    }
    return false;
}; 