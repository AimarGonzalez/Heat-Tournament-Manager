/**
 * Player in a tournament
 */
export interface Player {
    id: string;
    name: string;
    mastery?: number; // Total score / 100, used for difficulty calculations
}

/**
 * Results of a player in one game
 */
export interface GameResult {
    playerId: string;
    position: number; // 1-6
    points: number;  // Calculated based on position
}

/**
 * Round of games in a tournament
 */
export interface TournamentRound {
    roundNumber: number;
    tables: {
        [tableId: string]: {
            players: string[]; // Player IDs at this table
            results: GameResult[];
            playerColors?: { [playerId: string]: string }; // Colors used by players in this table
        }
    };
    difficultyBonus?: { [playerId: string]: number }; // Calculated difficulty bonus for this round
}

/**
 * A tournament with players and rounds
 */
export interface Tournament {
    id: string;
    name: string;
    date: string;
    players: Player[];
    rounds: TournamentRound[];
    type: 'live' | 'simulation';
    completed: boolean;
    rankings?: {
        playerId: string;
        totalPoints: number;
        difficultyBonus: number;
        finalScore: number;
    }[];
}

/**
 * State for the entire application
 */
export interface AppState {
    tournaments: Tournament[];
    activeTournament?: Tournament;
} 