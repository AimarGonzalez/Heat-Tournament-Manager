import { useState, useEffect } from 'react';
import { Button, Card, Form, Row, Col, Alert, Nav, Table } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../../context/AppContext';
import { Tournament, Player, TournamentRound, GameResult } from '../../models/types';
import TournamentResultsTable from '../live-tournaments/TournamentResultsTable';
import ColorSquare from '../live-tournaments/ColorSquare';
import { calculatePointsFromPosition, calculateDifficultyBonus, calculateFinalBonuses } from '../../utils/tournamentUtils';
import { DWARVEN_FIRST_NAMES, DWARVEN_LAST_NAMES } from '../../config/constants';
import './Simulation.css';

// Available colors for randomization
const AVAILABLE_COLORS = [
    'red', 'blue', 'green', 'yellow', 'black', 'silver'
];

type SimulationView = 'setup' | 'round1' | 'round2' | 'results';

function Simulation() {
    const { createTournament, updateTournament, state } = useAppContext();
    const [simulatedTournament, setSimulatedTournament] = useState<Tournament | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [activeView, setActiveView] = useState<SimulationView>('setup');

    // Count existing simulations and live tournaments
    const simulationCount = state.tournaments.filter(t => t.type === 'simulation').length;
    const liveTournamentCount = state.tournaments.filter(t => t.type === 'live').length;

    // Get next number for simulation names
    const [tournamentName, setTournamentName] = useState(`Simulation ${simulationCount + 1}`);

    // Update tournament name when simulation count changes
    useEffect(() => {
        setTournamentName(`Simulation ${simulationCount + 1}`);
    }, [simulationCount]);

    // Generate random dwarf names
    const generatePlayerNames = (count: number): string[] => {
        const names: string[] = [];
        const usedFirstNames = new Set<string>();
        const usedLastNames = new Set<string>();

        for (let i = 0; i < count; i++) {
            // Get available names
            const availableFirstNames = DWARVEN_FIRST_NAMES.filter(name => !usedFirstNames.has(name));
            const availableLastNames = DWARVEN_LAST_NAMES.filter(name => !usedLastNames.has(name));

            // If we've used all names, use a numbered name
            if (availableFirstNames.length === 0 || availableLastNames.length === 0) {
                names.push(`Dwarf ${i + 1}`);
                continue;
            }

            // Pick random names from available pools
            const firstName = availableFirstNames[Math.floor(Math.random() * availableFirstNames.length)];
            const lastName = availableLastNames[Math.floor(Math.random() * availableLastNames.length)];

            // Mark names as used
            usedFirstNames.add(firstName);
            usedLastNames.add(lastName);

            names.push(`${firstName} ${lastName}`);
        }

        return names;
    };

    // Shuffle array randomly
    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Generate random colors for a table
    const generateRandomColors = (count: number): string[] => {
        const shuffledColors = shuffleArray([...AVAILABLE_COLORS]);
        return shuffledColors.slice(0, count);
    };

    // Generate tournament round results with random positions
    const generateRoundResults = (tournament: Tournament, roundNumber: number): TournamentRound => {
        // Shuffle player order for random table assignments
        const shuffledPlayerIds = shuffleArray(tournament.players.map(p => p.id));

        // Split into two tables
        const table1PlayerIds = shuffledPlayerIds.slice(0, 6);
        const table2PlayerIds = shuffledPlayerIds.slice(6, 12);

        // Generate random positions for each table
        const table1Positions = shuffleArray([1, 2, 3, 4, 5, 6]);
        const table2Positions = shuffleArray([1, 2, 3, 4, 5, 6]);

        // Generate random colors
        const table1Colors = generateRandomColors(6);
        const table2Colors = generateRandomColors(6);

        // Create results for each table
        const table1Results: GameResult[] = [];
        const table1PlayerColors: { [playerId: string]: string } = {};

        table1PlayerIds.forEach((playerId, index) => {
            const position = table1Positions[index];
            table1Results.push({
                playerId,
                position,
                points: calculatePointsFromPosition(position)
            });
            table1PlayerColors[playerId] = table1Colors[index];
        });

        const table2Results: GameResult[] = [];
        const table2PlayerColors: { [playerId: string]: string } = {};

        table2PlayerIds.forEach((playerId, index) => {
            const position = table2Positions[index];
            table2Results.push({
                playerId,
                position,
                points: calculatePointsFromPosition(position)
            });
            table2PlayerColors[playerId] = table2Colors[index];
        });

        // Create the round object
        const round: TournamentRound = {
            roundNumber,
            tables: {
                'table1': {
                    players: table1PlayerIds,
                    results: table1Results,
                    playerColors: table1PlayerColors
                },
                'table2': {
                    players: table2PlayerIds,
                    results: table2Results,
                    playerColors: table2PlayerColors
                }
            }
        };

        return round;
    };

    // Run a full tournament simulation
    const handleRunSimulation = () => {
        try {
            setIsSimulating(true);
            setErrorMessage('');

            // 1. Create a tournament with 12 random players
            const playerNames = generatePlayerNames(12);
            const players: Player[] = playerNames.map(name => ({
                id: uuidv4(),
                name,
                mastery: 0 // Initial mastery is 0
            }));

            // 2. Create the tournament
            const tournament = createTournament(
                tournamentName,
                players,
                'simulation'
            );

            // 3. Generate Round 1 results
            const round1 = generateRoundResults(tournament, 1);

            // 4. Add round 1 to tournament
            let updatedTournament: Tournament = {
                ...tournament,
                rounds: [round1]
            };

            // Calculate difficulty bonus for round 1
            round1.difficultyBonus = {};
            updatedTournament.players.forEach(player => {
                round1.difficultyBonus![player.id] = calculateDifficultyBonus(
                    player.id,
                    round1,
                    updatedTournament.players
                );
            });

            // 5. Generate Round 2 results
            const round2 = generateRoundResults(updatedTournament, 2);

            // 6. Add round 2 and finalize tournament
            updatedTournament = {
                ...updatedTournament,
                rounds: [...updatedTournament.rounds, round2],
                completed: true
            };

            // 7. Calculate final bonuses and rankings
            updatedTournament = calculateFinalBonuses(updatedTournament);

            // 8. Save the simulated tournament and show results view
            updateTournament(updatedTournament);
            setSimulatedTournament(updatedTournament);
            setActiveView('results');

        } catch (error) {
            console.error('Simulation error:', error);
            setErrorMessage('Error running the simulation. Please try again.');
        } finally {
            setIsSimulating(false);
        }
    };

    // Reset the simulation and prepare for a new one
    const handleReset = () => {
        setSimulatedTournament(null);

        // Get latest count of simulations after adding the current one
        const updatedSimulationCount = state.tournaments.filter(t => t.type === 'simulation').length;
        setTournamentName(`Simulation ${updatedSimulationCount + 1}`);

        setActiveView('setup');
    };

    // Format position with suffix (1st, 2nd, etc.)
    const formatPosition = (position: number): string => {
        if (position === 0) return '-';

        const suffix = position === 1 ? 'st' :
            position === 2 ? 'nd' :
                position === 3 ? 'rd' : 'th';
        return `${position}${suffix}`;
    };

    // Determine available views
    const getAvailableViews = () => {
        if (!simulatedTournament) return [{ id: 'setup', label: 'Setup' }];

        const views = [];

        // Round details are available if we have a completed simulation
        if (simulatedTournament.rounds.length >= 1) {
            views.push({ id: 'round1', label: 'Round 1' });
        }

        if (simulatedTournament.rounds.length >= 2) {
            views.push({ id: 'round2', label: 'Round 2' });
        }

        // Results view is always available for completed simulations
        views.push({ id: 'results', label: 'Final Results' });

        return views;
    };

    // Render table for a specific round
    const renderRoundTable = (roundNumber: number) => {
        if (!simulatedTournament || !simulatedTournament.rounds[roundNumber - 1]) {
            return <div>Round data not available</div>;
        }

        const round = simulatedTournament.rounds[roundNumber - 1];
        const players = simulatedTournament.players;

        return (
            <div className="round-tables">
                {Object.keys(round.tables).map((tableId, tableIndex) => {
                    const table = round.tables[tableId];
                    const tableResults = [...table.results].sort((a, b) => a.position - b.position);

                    return (
                        <Card key={tableId} className="mb-4">
                            <Card.Header>Table {tableIndex + 1}</Card.Header>
                            <Card.Body className="table-responsive">
                                <Table bordered hover className="round-results-table">
                                    <thead>
                                        <tr>
                                            <th>Position</th>
                                            <th>Player</th>
                                            <th>Color</th>
                                            <th>Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableResults.map(result => {
                                            const player = players.find(p => p.id === result.playerId);
                                            const color = table.playerColors?.[result.playerId];

                                            return (
                                                <tr key={result.playerId}>
                                                    <td className="text-center">{formatPosition(result.position)}</td>
                                                    <td>{player?.name || 'Unknown'}</td>
                                                    <td className="text-center">
                                                        {color && <ColorSquare color={color} size={24} />}
                                                    </td>
                                                    <td className="text-center">{result.points}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    );
                })}
            </div>
        );
    };

    // Render content based on active view
    const renderActiveView = () => {
        switch (activeView) {
            case 'setup':
                return (
                    <Card className="mb-4">
                        <Card.Header>Simulation Settings</Card.Header>
                        <Card.Body>
                            <Form>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Tournament Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={tournamentName}
                                                onChange={(e) => setTournamentName(e.target.value)}
                                                placeholder="e.g. Simulation #1"
                                            />
                                            <Form.Text className="text-muted">
                                                Current count: {simulationCount} simulations, {liveTournamentCount} live tournaments
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button
                                    variant="primary"
                                    onClick={handleRunSimulation}
                                    disabled={isSimulating}
                                >
                                    {isSimulating ? 'Simulating...' : 'Run Simulation'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                );
            case 'round1':
                return (
                    <Card>
                        <Card.Header>Round 1 Results</Card.Header>
                        <Card.Body>
                            {renderRoundTable(1)}
                        </Card.Body>
                    </Card>
                );
            case 'round2':
                return (
                    <Card>
                        <Card.Header>Round 2 Results</Card.Header>
                        <Card.Body>
                            {renderRoundTable(2)}
                        </Card.Body>
                    </Card>
                );
            case 'results':
                return <TournamentResultsTable tournament={simulatedTournament!} />;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Tournament Simulation</h2>
                {simulatedTournament && (
                    <Button variant="outline-secondary" onClick={handleReset}>
                        Run New Simulation
                    </Button>
                )}
            </div>

            {errorMessage && (
                <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>
                    {errorMessage}
                </Alert>
            )}

            {simulatedTournament && (
                <>
                    <h3 className="mb-3">{simulatedTournament.name}</h3>
                    <Card className="mb-3">
                        <Card.Body className="p-2">
                            <Nav variant="tabs" className="tournament-nav">
                                {getAvailableViews().map(view => (
                                    <Nav.Item key={view.id}>
                                        <Nav.Link
                                            active={activeView === view.id}
                                            onClick={() => setActiveView(view.id as SimulationView)}
                                        >
                                            {view.label}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        </Card.Body>
                    </Card>
                </>
            )}

            {renderActiveView()}
        </div>
    );
}

export default Simulation; 