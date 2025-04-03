import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Tournament, Player } from '../models/types';
import { loadAppState, saveAppState, restoreFromAutoBackup } from '../services/storageService';

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
    deleteTournament: (id: string) => void;
    refreshAppState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    const [state, setState] = useState<AppState>(initialState);
    const [activeTournament, setActiveTournament] = useState<Tournament | undefined>(undefined);

    // Load state from local storage on initial load
    useEffect(() => {
        const savedState = loadAppState();
        if (savedState) {
            setState(savedState);
        } else {
            // Try to restore from auto-backup if no data found
            const restoredFromBackup = restoreFromAutoBackup();
            if (restoredFromBackup) {
                const backupState = loadAppState();
                if (backupState) {
                    setState(backupState);
                    console.log('Restored data from auto-backup');
                }
            }
        }
    }, []);

    // Save state to local storage whenever it changes
    useEffect(() => {
        saveAppState(state);
    }, [state]);

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

    // Update an existing tournament
    const updateTournament = (updatedTournament: Tournament) => {
        setState(prev => ({
            ...prev,
            tournaments: prev.tournaments.map(t =>
                t.id === updatedTournament.id ? updatedTournament : t
            ),
        }));

        if (activeTournament?.id === updatedTournament.id) {
            setActiveTournament(updatedTournament);
        }
    };

    // Delete a tournament
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
        deleteTournament,
        refreshAppState,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the AppContext
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}; 