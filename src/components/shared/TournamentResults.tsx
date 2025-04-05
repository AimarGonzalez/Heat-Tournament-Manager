import { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Tournament } from '../../models/types';
import './TournamentResults.css';
import React from 'react';

interface TournamentResultsProps {
    tournament: Tournament;
    title?: string;
}

interface PlayerRanking {
    playerId: string;
    playerName: string;
    round1: {
        position: number;
        points: number;
    };
    round2: {
        position: number;
        points: number;
    };
    totalPoints: number;
    difficultyBonus: number;
}

function TournamentResults({ tournament, title = 'Tournament Results' }: TournamentResultsProps) {
    const [rankings, setRankings] = useState<PlayerRanking[]>([]);
    const [showBonus, setShowBonus] = useState(false);

    useEffect(() => {
        if (tournament.rounds.length < 2) return;

        const playerRankings: PlayerRanking[] = [];

        // Process each player's results
        tournament.players.forEach(player => {
            const ranking: PlayerRanking = {
                playerId: player.id,
                playerName: player.name,
                round1: { position: 0, points: 0 },
                round2: { position: 0, points: 0 },
                totalPoints: 0,
                difficultyBonus: 0
            };

            // Get round 1 results
            const round1 = tournament.rounds[0];
            Object.values(round1.tables).forEach(table => {
                const result = table.results.find(r => r.playerId === player.id);
                if (result) {
                    ranking.round1 = {
                        position: result.position,
                        points: result.points
                    };
                    ranking.totalPoints += result.points;
                }
            });

            // Get round 2 results
            const round2 = tournament.rounds[1];
            Object.values(round2.tables).forEach(table => {
                const result = table.results.find(r => r.playerId === player.id);
                if (result) {
                    ranking.round2 = {
                        position: result.position,
                        points: result.points
                    };
                    ranking.totalPoints += result.points;
                }
            });

            // Get difficulty bonuses with better precision
            if (round1.difficultyBonus && round1.difficultyBonus[player.id] !== undefined) {
                ranking.difficultyBonus += parseFloat(round1.difficultyBonus[player.id].toFixed(2));
            }

            if (round2.difficultyBonus && round2.difficultyBonus[player.id] !== undefined) {
                ranking.difficultyBonus += parseFloat(round2.difficultyBonus[player.id].toFixed(2));
            }

            playerRankings.push(ranking);
        });

        // Sort by total score (points + bonus) descending
        playerRankings.sort((a, b) => {
            const aTotal = a.totalPoints + a.difficultyBonus;
            const bTotal = b.totalPoints + b.difficultyBonus;

            // First sort by total score (descending)
            if (bTotal !== aTotal) {
                return bTotal - aTotal;
            }

            // If total is tied, use totalPoints as tiebreaker
            if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }

            // If still tied, use highest single round position
            const aHighestPosition = Math.min(a.round1.position, a.round2.position);
            const bHighestPosition = Math.min(b.round1.position, b.round2.position);
            return aHighestPosition - bHighestPosition;
        });

        setRankings(playerRankings);
    }, [tournament]);

    // Function to get position tag class
    const getPositionTagClass = (position: number): string => {
        switch (position) {
            case 1: return 'position-first';
            case 2: return 'position-second';
            case 3: return 'position-third';
            case 4: return 'position-fourth';
            default: return 'position-other';
        }
    };

    // Function to format position with suffix
    const formatPosition = (position: number): string => {
        if (position === 0) return '-';

        const suffix = position === 1 ? 'st' :
            position === 2 ? 'nd' :
                position === 3 ? 'rd' : 'th';
        return `${position}${suffix}`;
    };

    // Format bonus with + and 2 decimal places
    const formatBonus = (value: number): string => {
        return `+${value.toFixed(2)}`;
    };

    const toggleBonusColumn = () => {
        setShowBonus(!showBonus);
    };

    return (
        <Card className="shadow-sm tournament-selected-card">
            <Card.Header className="d-flex justify-content-between align-items-center tournament-selected-header">
                <h5 className="mb-0">{title}</h5>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={toggleBonusColumn}
                >
                    {showBonus ? 'Hide Bonus' : 'Show Bonus'}
                </Button>
            </Card.Header>
            <Card.Body className="pt-0">
                <div className="tournament-results-table-container">
                    <table className="tournament-results-table">
                        <thead>
                            <tr>
                                <th className="position-header">#</th>
                                <th className="player-header">Player</th>
                                <th className="round-header">Round 1</th>
                                <th className="round-header">Round 2</th>
                                <th className="points-header">Points</th>
                                {showBonus && <th className="bonus-header">Bonus</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {rankings.map((player, index) => {
                                // Show separator row after position 6
                                const showSeparator = index === 6;

                                return (
                                    <React.Fragment key={player.playerId}>
                                        {index === 0 && (
                                            <tr className="separator-row">
                                                <td colSpan={showBonus ? 6 : 5} className="separator-cell">
                                                    <span className="top-six-label">Gran Final</span>
                                                </td>
                                            </tr>
                                        )}
                                        {showSeparator && rankings.length > 6 && (
                                            <tr className="separator-row">
                                                <td colSpan={showBonus ? 6 : 5} className="separator-cell">
                                                    <span className="top-six-label">Final</span>
                                                </td>
                                            </tr>
                                        )}
                                        <tr className={`player-row ${index === 0 ? 'first-place' : ''}`}>
                                            <td className="position-column">
                                                <span className="rank-number">{index + 1}</span>
                                            </td>
                                            <td className="player-name-cell">
                                                <div className="player-name">{player.playerName}</div>
                                            </td>
                                            <td className="score-cell">
                                                <span className={`position-tag ${getPositionTagClass(player.round1.position)}`}>
                                                    {formatPosition(player.round1.position)}
                                                </span>
                                                <span className="points-display">
                                                    {player.round1.points > 0 && `${player.round1.points}p`}
                                                </span>
                                            </td>
                                            <td className="score-cell">
                                                <span className={`position-tag ${getPositionTagClass(player.round2.position)}`}>
                                                    {formatPosition(player.round2.position)}
                                                </span>
                                                <span className="points-display">
                                                    {player.round2.points > 0 && `${player.round2.points}p`}
                                                </span>
                                            </td>
                                            <td className="points-cell">{player.totalPoints}</td>
                                            {showBonus && <td className="bonus-cell">{formatBonus(player.difficultyBonus)}</td>}
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card.Body>
        </Card>
    );
}

export default TournamentResults; 