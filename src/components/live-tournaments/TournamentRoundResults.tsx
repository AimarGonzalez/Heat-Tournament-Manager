import { useState, useRef, useEffect } from 'react';
import { Card, Button, Row, Col, Table } from 'react-bootstrap';
import { Tournament, TournamentRound, GameResult } from '../../models/types';
import { useAppContext } from '../../context/AppContext';
import { calculatePointsFromPosition, calculateDifficultyBonus, calculateFinalBonuses } from '../../utils/tournamentUtils';
import ColorPicker from './ColorPicker';
import PlayerPicker from './PlayerPicker';
import PositionPicker from './PositionPicker';
import './TournamentRoundResults.css';
import ColorCarPicker from '../shared/ColorCarPicker';
import { useColorPickerContext } from '../../context/ColorPickerContext';

interface TournamentRoundResultsProps {
    tournament: Tournament;
    roundNumber: number;
    onComplete: () => void;
    isEdit?: boolean; // Flag to indicate we're editing an existing round
}

interface TableAssignment {
    tableId: string;
    playerSlots: Array<string | null>; // Player IDs, null if not assigned
    positions: Array<number | null>; // Positions 1-6, null if not assigned
    playerColors: Array<string | null>; // Colors for players, null if not assigned
}

const AUTO_BACKUP_KEY = 'tournament_round_draft';

function TournamentRoundResults({ tournament, roundNumber, onComplete, isEdit = false }: TournamentRoundResultsProps) {
    const { updateTournament } = useAppContext();
    const [tables, setTables] = useState<TableAssignment[]>(() => {
        return initializeTables(tournament, roundNumber);
    });

    const [errors, setErrors] = useState({
        playerAssignment: false,
        positions: false
    });

    // Reset tables when tournament or round changes
    useEffect(() => {
        setTables(initializeTables(tournament, roundNumber));
    }, [tournament.id, roundNumber]);

    // Function to initialize tables from tournament data or localStorage
    function initializeTables(tournament: Tournament, roundNumber: number): TableAssignment[] {
        // Try to load from localStorage first
        const savedData = localStorage.getItem(`${AUTO_BACKUP_KEY}_${tournament.id}_${roundNumber}`);
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (e) {
                console.error('Failed to parse saved table data', e);
            }
        }

        // Check if there's existing data in the tournament for this round
        const existingRound = tournament.rounds.find(r => r.roundNumber === roundNumber);
        if (existingRound) {
            const table1 = existingRound.tables['table1'];
            const table2 = existingRound.tables['table2'];

            const table1Assignment: TableAssignment = {
                tableId: 'table1',
                playerSlots: Array(6).fill(null),
                positions: Array(6).fill(null),
                playerColors: Array(6).fill(null)
            };

            const table2Assignment: TableAssignment = {
                tableId: 'table2',
                playerSlots: Array(6).fill(null),
                positions: Array(6).fill(null),
                playerColors: Array(6).fill(null)
            };

            // Fill in player slots, positions, and colors from existing data
            if (table1) {
                table1.results.forEach(result => {
                    const idx = table1Assignment.playerSlots.indexOf(null);
                    if (idx >= 0) {
                        table1Assignment.playerSlots[idx] = result.playerId;
                        table1Assignment.positions[idx] = result.position;

                        // Get color if available
                        if (table1.playerColors && table1.playerColors[result.playerId]) {
                            table1Assignment.playerColors[idx] = table1.playerColors[result.playerId];
                        }
                    }
                });
            }

            if (table2) {
                table2.results.forEach(result => {
                    const idx = table2Assignment.playerSlots.indexOf(null);
                    if (idx >= 0) {
                        table2Assignment.playerSlots[idx] = result.playerId;
                        table2Assignment.positions[idx] = result.position;

                        // Get color if available
                        if (table2.playerColors && table2.playerColors[result.playerId]) {
                            table2Assignment.playerColors[idx] = table2.playerColors[result.playerId];
                        }
                    }
                });
            }

            return [table1Assignment, table2Assignment];
        }

        // Default initial state if no saved data or existing round
        return [
            {
                tableId: 'table1',
                playerSlots: Array(6).fill(null),
                positions: Array(6).fill(null),
                playerColors: Array(6).fill(null)
            },
            {
                tableId: 'table2',
                playerSlots: Array(6).fill(null),
                positions: Array(6).fill(null),
                playerColors: Array(6).fill(null)
            }
        ];
    }

    // Manual backup only - no automatic saving
    const saveTablesToDraft = useRef(() => {
        localStorage.setItem(
            `${AUTO_BACKUP_KEY}_${tournament.id}_${roundNumber}`,
            JSON.stringify(tables)
        );
    });

    // Update the function when dependencies change
    useEffect(() => {
        saveTablesToDraft.current = () => {
            localStorage.setItem(
                `${AUTO_BACKUP_KEY}_${tournament.id}_${roundNumber}`,
                JSON.stringify(tables)
            );
        };
    }, [tournament.id, roundNumber, tables]);

    // Backup on component unmount
    useEffect(() => {
        return () => {
            if (tables.length > 0) {
                saveTablesToDraft.current();
            }
        };
    }, [tables]);

    // Debounced backup after table changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (tables.length > 0) {
                saveTablesToDraft.current();
            }
        }, 2000); // 2 second debounce

        return () => clearTimeout(timeoutId);
    }, [tables]); // Direct dependency on tables for debounced autosave

    // Available colors for the color picker
    const availableColors = [
        { name: 'Red', value: 'red' },
        { name: 'Blue', value: 'blue' },
        { name: 'Green', value: 'green' },
        { name: 'Yellow', value: 'yellow' },
        { name: 'Black', value: 'black' },
        { name: 'Silver', value: 'silver' }
    ];

    // Check if each player is assigned to exactly one table
    const validatePlayerAssignment = () => {
        const allAssignedPlayers = tables.flatMap(table => table.playerSlots.filter(Boolean)) as string[];

        // Each player must be assigned once
        const uniquePlayers = new Set(allAssignedPlayers);
        const allPlayersAssigned = uniquePlayers.size === tournament.players.length;
        const noDuplicates = allAssignedPlayers.length === uniquePlayers.size;

        return allPlayersAssigned && noDuplicates;
    };

    // Check if each table has all positions 1-6 assigned
    const validatePositions = () => {
        return tables.every(table => {
            // Only check tables with players assigned
            if (table.playerSlots.some(p => p !== null)) {
                const filledPositions = table.positions.filter(p => p !== null);
                if (filledPositions.length !== 6) return false;

                // Check if all positions 1-6 are present
                const uniquePositions = new Set(filledPositions);
                if (uniquePositions.size !== 6) return false;

                for (let i = 1; i <= 6; i++) {
                    if (!uniquePositions.has(i)) return false;
                }

                return true;
            }
            return true;
        });
    };

    const handlePlayerChange = (tableIndex: number, slotIndex: number, playerId: string | null) => {
        const newTables = [...tables];
        newTables[tableIndex].playerSlots[slotIndex] = playerId;
        setTables(newTables);
    };

    const handlePositionChange = (tableIndex: number, slotIndex: number, position: number | null) => {
        const newTables = [...tables];
        newTables[tableIndex].positions[slotIndex] = position;
        setTables(newTables);
    };

    const handleColorChange = (tableIndex: number, slotIndex: number, color: string | null) => {
        const newTables = [...tables];
        newTables[tableIndex].playerColors[slotIndex] = color;
        setTables(newTables);
    };

    // Randomly assign players to tables and positions
    const handleRandomize = () => {
        // Get all unassigned players
        const unassignedPlayers = tournament.players
            .map(p => p.id)
            .filter(id => !tables.some(table => table.playerSlots.includes(id)));

        // Shuffle unassigned players
        for (let i = unassignedPlayers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [unassignedPlayers[i], unassignedPlayers[j]] = [unassignedPlayers[j], unassignedPlayers[i]];
        }

        // Create new tables array preserving existing assignments
        const newTables = tables.map(table => ({
            ...table,
            playerSlots: [...table.playerSlots],
            positions: [...table.positions],
            playerColors: [...table.playerColors]
        }));

        let playerIndex = 0;

        // Fill table 1 empty slots
        for (let i = 0; i < newTables[0].playerSlots.length && playerIndex < unassignedPlayers.length; i++) {
            if (newTables[0].playerSlots[i] === null) {
                newTables[0].playerSlots[i] = unassignedPlayers[playerIndex++];
            }
        }

        // Fill table 2 empty slots
        for (let i = 0; i < newTables[1].playerSlots.length && playerIndex < unassignedPlayers.length; i++) {
            if (newTables[1].playerSlots[i] === null) {
                newTables[1].playerSlots[i] = unassignedPlayers[playerIndex++];
            }
        }

        // For each table, fill empty positions with random available positions
        newTables.forEach(table => {
            const usedPositions = new Set(table.positions.filter(p => p !== null));
            const availablePositions = [1, 2, 3, 4, 5, 6].filter(p => !usedPositions.has(p));

            // Shuffle available positions
            for (let i = availablePositions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
            }

            // Fill empty position slots
            let posIndex = 0;
            for (let i = 0; i < table.positions.length; i++) {
                if (table.positions[i] === null && posIndex < availablePositions.length) {
                    table.positions[i] = availablePositions[posIndex++];
                }
            }

            // Fill empty color slots with random available colors
            const usedColors = new Set(table.playerColors.filter(c => c !== null));
            const availableColorValues = availableColors
                .map(c => c.value)
                .filter(color => !usedColors.has(color));

            // Shuffle available colors
            for (let i = availableColorValues.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availableColorValues[i], availableColorValues[j]] = [availableColorValues[j], availableColorValues[i]];
            }

            // Fill empty color slots
            let colorIndex = 0;
            for (let i = 0; i < table.playerColors.length; i++) {
                if (table.playerColors[i] === null && colorIndex < availableColorValues.length) {
                    table.playerColors[i] = availableColorValues[colorIndex++];
                }
            }
        });

        setTables(newTables);
    };

    const handleSubmit = () => {
        // Validate assignments
        const isValidPlayerAssignment = validatePlayerAssignment();
        const isValidPositions = validatePositions();

        setErrors({
            playerAssignment: !isValidPlayerAssignment,
            positions: !isValidPositions
        });

        if (!isValidPlayerAssignment || !isValidPositions) {
            return;
        }

        // Create round results
        const roundResults: TournamentRound = {
            roundNumber,
            tables: {}
        };

        // Process each table
        tables.forEach(table => {
            const results: GameResult[] = [];
            const playerColors: { [playerId: string]: string } = {};

            // Create game results for each player at the table
            table.playerSlots.forEach((playerId, index) => {
                if (playerId && table.positions[index]) {
                    const position = table.positions[index] as number;
                    results.push({
                        playerId,
                        position,
                        points: calculatePointsFromPosition(position)
                    });

                    // Save player color if available
                    if (table.playerColors[index]) {
                        playerColors[playerId] = table.playerColors[index] as string;
                    }
                }
            });

            roundResults.tables[table.tableId] = {
                players: table.playerSlots.filter(Boolean) as string[],
                results,
                playerColors // Add colors to the tournament data
            };
        });

        // Clone players for updates
        const updatedPlayers = [...tournament.players];

        let updatedTournament: Tournament;

        if (isEdit) {
            // When editing an existing round, replace it in the tournament
            const updatedRounds = [...tournament.rounds];
            const roundIndex = updatedRounds.findIndex(r => r.roundNumber === roundNumber);

            if (roundIndex !== -1) {
                updatedRounds[roundIndex] = roundResults;
            } else {
                // Shouldn't happen, but just in case
                updatedRounds.push(roundResults);
            }

            updatedTournament = {
                ...tournament,
                players: updatedPlayers,
                rounds: updatedRounds
            };

            // Always recalculate bonuses after editing
            updatedTournament = calculateFinalBonuses(updatedTournament);
        } else {
            // For new rounds, add to existing rounds
            updatedTournament = {
                ...tournament,
                players: updatedPlayers,
                rounds: [...tournament.rounds, roundResults],
                completed: roundNumber === 2
            };

            if (roundNumber === 2) {
                // For Round 2 (final round), recalculate all bonuses with final mastery values
                updatedTournament = calculateFinalBonuses(updatedTournament);
            } else {
                // For Round 1, initialize difficulty bonus for this round only
                // We'll set mastery to 0 for all players
                updatedPlayers.forEach(player => {
                    player.mastery = 0;
                });

                // Calculate temporary difficulty bonus for Round 1
                roundResults.difficultyBonus = {};
                tournament.players.forEach(player => {
                    roundResults.difficultyBonus![player.id] = calculateDifficultyBonus(
                        player.id,
                        roundResults,
                        updatedPlayers
                    );
                });
            }
        }

        // Clear the auto-backup data when successfully submitting
        localStorage.removeItem(`${AUTO_BACKUP_KEY}_${tournament.id}_${roundNumber}`);

        updateTournament(updatedTournament);
        onComplete();
    };

    const getAvailablePlayers = (currentTableIndex: number, currentSlot: number) => {
        const assignedPlayers = new Set<string>();

        // Get all currently assigned players except for the current slot
        tables.forEach((table, tableIndex) => {
            table.playerSlots.forEach((playerId, slotIndex) => {
                if (playerId && !(tableIndex === currentTableIndex && slotIndex === currentSlot)) {
                    assignedPlayers.add(playerId);
                }
            });
        });

        // Return players not yet assigned
        return tournament.players.filter(player => !assignedPlayers.has(player.id));
    };

    // Get available positions for a given table and slot
    const getAvailablePositions = (tableIndex: number, slotIndex: number) => {
        const usedPositions = new Set<number>();

        // Get all currently assigned positions in this table except for the current slot
        tables[tableIndex].positions.forEach((position, index) => {
            if (position !== null && index !== slotIndex) {
                usedPositions.add(position);
            }
        });

        // Return positions that aren't already assigned
        return [1, 2, 3, 4, 5, 6].filter(pos => !usedPositions.has(pos));
    };

    // Calculate submit button text based on edit mode
    const getSubmitButtonText = () => {
        if (isEdit) {
            return `Update Round ${roundNumber} Results`;
        }
        return `Submit Round ${roundNumber} Results`;
    };

    // Auto-save to draft as changes are made - DISABLED to fix infinite update loop

    return (
        <Card className="tournament-selected-card">
            <Card.Header className="d-flex justify-content-between align-items-center tournament-selected-header">
                <span>{isEdit ? `Edit Round ${roundNumber} Results` : `Round ${roundNumber} Results`}</span>
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleRandomize}
                    title="Randomly assign players and positions"
                >
                    <i className="bi bi-shuffle me-1"></i> Randomize Assignments
                </Button>
            </Card.Header>
            <Card.Body>
                {errors.playerAssignment && (
                    <div className="alert alert-danger">
                        Each player must be assigned to exactly one table slot.
                    </div>
                )}

                {errors.positions && (
                    <div className="alert alert-dange">
                        Each table must have all positions 1-6 assigned.
                    </div>
                )}

                <Row>
                    {tables.map((table, tableIndex) => (
                        <Col md={6} key={table.tableId} className="mb-4">
                            <Card className="playing-table-card">
                                <Card.Header>Table {tableIndex + 1}</Card.Header>
                                <Card.Body className="table-responsive">
                                    <Table bordered hover className="round-results-table">
                                        <colgroup>
                                            <col style={{ width: "8%" }} />
                                            <col style={{ width: "42%" }} />
                                            <col style={{ width: "25%" }} />
                                            <col style={{ width: "25%" }} />
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Player</th>
                                                <th>Color</th>
                                                <th>Position</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {table.playerSlots.map((playerId, slotIndex) => (
                                                <tr key={slotIndex}>
                                                    <td className="text-center">{slotIndex + 1}</td>
                                                    <td>
                                                        <PlayerPicker
                                                            value={playerId}
                                                            onChange={(playerId) => handlePlayerChange(
                                                                tableIndex,
                                                                slotIndex,
                                                                playerId
                                                            )}
                                                            players={tournament.players}
                                                            availablePlayers={getAvailablePlayers(tableIndex, slotIndex)}
                                                            selectedPlayer={tournament.players.find(p => p.id === playerId)}
                                                        />
                                                    </td>
                                                    <td>
                                                        {/* Color picker using context */}
                                                        {(() => {
                                                            // Use the context for the car picker style preference
                                                            const { useCarPicker } = useColorPickerContext();

                                                            return useCarPicker ? (
                                                                <ColorCarPicker
                                                                    value={table.playerColors[slotIndex]}
                                                                    onChange={(color) => handleColorChange(
                                                                        tableIndex,
                                                                        slotIndex,
                                                                        color
                                                                    )}
                                                                    availableColors={availableColors}
                                                                    tableColors={table.playerColors}
                                                                    currentIndex={slotIndex}
                                                                />
                                                            ) : (
                                                                <ColorPicker
                                                                    value={table.playerColors[slotIndex]}
                                                                    onChange={(color) => handleColorChange(
                                                                        tableIndex,
                                                                        slotIndex,
                                                                        color
                                                                    )}
                                                                    availableColors={availableColors}
                                                                    tableColors={table.playerColors}
                                                                    currentIndex={slotIndex}
                                                                />
                                                            );
                                                        })()}
                                                    </td>
                                                    <td>
                                                        <PositionPicker
                                                            value={table.positions[slotIndex]}
                                                            onChange={(position) => handlePositionChange(
                                                                tableIndex,
                                                                slotIndex,
                                                                position
                                                            )}
                                                            availablePositions={getAvailablePositions(tableIndex, slotIndex)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <div className="d-grid gap-2 mt-3">
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                    >
                        {getSubmitButtonText()}
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
}

export default TournamentRoundResults; 