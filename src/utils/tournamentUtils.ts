import { Player, GameResult, Tournament, TournamentRound } from '../models/types';

/**
 * Calculate points based on position (1st, 2nd, etc.)
 */
export const calculatePointsFromPosition = (position: number): number => {
    const points = [9, 6, 4, 3, 2, 1];
    return position > 0 && position <= points.length ? points[position - 1] : 0;
};

/**
 * Calculate a player's mastery score (total points / 100)
 */
export const calculateMastery = (player: Player, tournaments: Tournament[]): number => {
    let totalPoints = 0;

    tournaments.forEach(tournament => {
        tournament.rounds.forEach(round => {
            Object.values(round.tables).forEach(table => {
                const result = table.results.find(r => r.playerId === player.id);
                if (result) {
                    totalPoints += result.points;
                }
            });
        });
    });

    return totalPoints / 100;
};

/**
 * Calculate difficulty bonus for a player in a round
 */
export const calculateDifficultyBonus = (
    playerId: string,
    round: TournamentRound,
    players: Player[]
): number => {
    let bonus = 0;

    // Find which table the player is at
    Object.values(round.tables).forEach(table => {
        if (table.players.includes(playerId)) {
            // Sum up the mastery of all opponents at the table
            const opponents = table.players.filter(id => id !== playerId);
            opponents.forEach(opponentId => {
                const opponent = players.find(p => p.id === opponentId);
                if (opponent && opponent.mastery) {
                    bonus += opponent.mastery;
                }
            });
        }
    });

    return bonus;
};

/**
 * Generate random positions for players at a table
 */
export const generateRandomResults = (playerIds: string[]): GameResult[] => {
    // Create a copy and shuffle player order
    const shuffled = [...playerIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Assign positions and points
    return shuffled.map((playerId, index) => {
        const position = index + 1;
        return {
            playerId,
            position,
            points: calculatePointsFromPosition(position)
        };
    });
};

/**
 * Calculate final difficulty bonuses for all rounds after tournament completion
 * This recalculates bonuses using the final mastery values
 */
export const calculateFinalBonuses = (tournament: Tournament): Tournament => {
    if (tournament.rounds.length < 2) return tournament;

    // Clone the tournament to avoid mutations
    const updatedTournament = {
        ...tournament,
        rounds: [...tournament.rounds]
    };

    // Calculate final mastery values for all players based on total points
    updatedTournament.players = updatedTournament.players.map(player => {
        let totalPoints = 0;

        // Sum up all points from both rounds
        updatedTournament.rounds.forEach(round => {
            Object.values(round.tables).forEach(table => {
                const result = table.results.find(r => r.playerId === player.id);
                if (result) {
                    totalPoints += result.points;
                }
            });
        });

        // Update player mastery with final value
        return {
            ...player,
            mastery: totalPoints / 100
        };
    });

    // Recalculate difficulty bonuses for all rounds using final mastery values
    updatedTournament.rounds = updatedTournament.rounds.map(round => {
        const updatedRound = { ...round };
        updatedRound.difficultyBonus = {};

        tournament.players.forEach(player => {
            updatedRound.difficultyBonus![player.id] = calculateDifficultyBonus(
                player.id,
                round,
                updatedTournament.players
            );
        });

        return updatedRound;
    });

    return updatedTournament;
}; 