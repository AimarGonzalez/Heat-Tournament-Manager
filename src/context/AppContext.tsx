import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Tournament, Player } from '../models/types';
import {
    loadAppState,
    saveAppState,
    restoreFromAutoBackup,
    getAvailableBackups
} from '../services/storageService';

// Install uuid for ID generation
// npm install uuid @types/uuid

// Initial state
const initialState: AppState = {
    tournaments: [],
};

// Create context
interface AppContextType {
    state: AppState;
    activeTournament: Tournament | undefined;
    setActiveTournament: (tournament: Tournament | undefined) => void;
    createTournament: (name: string, players: Player[], type: 'live' | 'simulation') => Tournament;
    updateTournament: (tournament: Tournament) => void;
    archiveTournament: (id: string) => void;
    restoreTournament: (id: string) => void;
    deleteTournament: (id: string) => void;
    refreshAppState: () => void;
    autoRestorePerformed: boolean;
    clearAutoRestoreFlag: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    const [state, setState] = useState<AppState>(initialState);
    const [activeTournament, setActiveTournament] = useState<Tournament | undefined>(undefined);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [autoRestorePerformed, setAutoRestorePerformed] = useState(false);

    // Clear the auto-restore flag
    const clearAutoRestoreFlag = () => {
        setAutoRestorePerformed(false);
    };

    // Load state from local storage on initial load
    useEffect(() => {
        const loadAppData = async () => {
            // First, check for data in localStorage
            const savedState = loadAppState();

            if (savedState && savedState.tournaments && savedState.tournaments.length > 0) {
                // If we have tournaments in localStorage, use that state
                setState(savedState);
                console.log('Loaded data from localStorage with', savedState.tournaments.length, 'tournaments');
            } else {
                // No tournaments in localStorage, try to restore from the latest backup
                const backups = getAvailableBackups();

                if (backups.length > 0) {
                    console.log('No tournaments found in current state, attempting to restore latest backup');
                    // Get latest backup
                    const restored = restoreFromAutoBackup();

                    if (restored) {
                        // If restoration was successful, load the updated state
                        const restoredState = loadAppState();
                        if (restoredState) {
                            setState(restoredState);
                            setAutoRestorePerformed(true);
                            console.log('Successfully restored', restoredState.tournaments.length, 'tournaments from auto-backup');
                        }
                    }
                }
            }

            setInitialLoadComplete(true);
        };

        loadAppData();
    }, []);

    // Save state to local storage whenever it changes
    // Only start saving after initial load is complete to prevent overwriting with empty state
    useEffect(() => {
        if (initialLoadComplete) {
            saveAppState(state);
        }
    }, [state, initialLoadComplete]);

    // Force refresh the app state from localStorage
    const refreshAppState = () => {
        const savedState = loadAppState();
        if (savedState) {
            setState(savedState);
            setActiveTournament(undefined);
            console.log('App state refreshed from localStorage');
        }
    };

    // Create a new tournament
    const createTournament = (
        name: string,
        players: Player[],
        type: 'live' | 'simulation'
    ): Tournament => {
        const newTournament: Tournament = {
            id: uuidv4(),
            name,
            date: new Date().toISOString(),
            players,
            rounds: [],
            type,
            completed: false,
        };

        setState(prev => ({
            ...prev,
            tournaments: [...prev.tournaments, newTournament],
        }));

        return newTournament;
    };

    // Update a tournament
    const updateTournament = (tournament: Tournament) => {
        setState(prev => ({
            ...prev,
            tournaments: prev.tournaments.map(t =>
                t.id === tournament.id ? tournament : t
            ),
        }));

        // Update activeTournament if it's the same tournament
        if (activeTournament?.id === tournament.id) {
            setActiveTournament(tournament);
        }
    };

    // Archive a tournament (mark as archived instead of deleting)
    const archiveTournament = (id: string) => {
        setState(prev => ({
            ...prev,
            tournaments: prev.tournaments.map(t =>
                t.id === id ? { ...t, archived: true } : t
            ),
        }));

        if (activeTournament?.id === id) {
            setActiveTournament(undefined);
        }
    };

    // Restore an archived tournament
    const restoreTournament = (id: string) => {
        setState(prev => ({
            ...prev,
            tournaments: prev.tournaments.map(t =>
                t.id === id ? { ...t, archived: false } : t
            ),
        }));
    };

    // Update the original delete method (keep for backward compatibility)
    const deleteTournament = (id: string) => {
        setState(prev => ({
            ...prev,
            tournaments: prev.tournaments.filter(t => t.id !== id),
        }));

        if (activeTournament?.id === id) {
            setActiveTournament(undefined);
        }
    };

    const value = {
        state,
        activeTournament,
        setActiveTournament,
        createTournament,
        updateTournament,
        archiveTournament,
        restoreTournament,
        deleteTournament,
        refreshAppState,
        autoRestorePerformed,
        clearAutoRestoreFlag,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the AppContext
export const useAppContext = function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}; 