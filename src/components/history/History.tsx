import { useState, useEffect } from 'react';
import { Button, Card, ListGroup, Row, Col, Nav, DropdownButton, Dropdown } from 'react-bootstrap';
import { useAppContext } from '../../context/AppContext';
import { Tournament, Player } from '../../models/types';
import './History.css';
import '../live-tournaments/LiveTournaments.css'; // Import live tournament styles for status badges
import TournamentPlayerInscription from '../live-tournaments/TournamentPlayerInscription';
import TournamentRoundResults from '../live-tournaments/TournamentRoundResults';
import TournamentResultsTable from '../live-tournaments/TournamentResultsTable';

function History() {
    const { state, restoreTournament } = useAppContext();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const [activeTournamentView, setActiveTournamentView] = useState<'inscription' | 'round1' | 'round2' | 'results'>('inscription');
    const [sortOption, setSortOption] = useState<'date' | 'name'>('date');
    const [filterOption, setFilterOption] = useState<'all' | 'live' | 'simulation' | 'archived'>('all');

    useEffect(() => {
        let filtered = [...state.tournaments];

        // Apply filter
        if (filterOption === 'live') {
            filtered = filtered.filter(t => t.type === 'live' && !t.archived);
        } else if (filterOption === 'simulation') {
            filtered = filtered.filter(t => t.type === 'simulation');
        } else if (filterOption === 'archived') {
            filtered = filtered.filter(t => t.archived);
        }

        // Apply sort
        if (sortOption === 'date') {
            filtered = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
            filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
        }

        setTournaments(filtered);
    }, [state.tournaments, sortOption, filterOption]);

    // Add an effect to keep the selectedTournament in sync with state.tournaments
    useEffect(() => {
        // If we have a selected tournament, make sure it's synchronized with the latest data
        if (selectedTournament) {
            const updatedTournament = state.tournaments.find(t => t.id === selectedTournament.id);
            if (updatedTournament && JSON.stringify(updatedTournament) !== JSON.stringify(selectedTournament)) {
                // Update the selected tournament with the latest data
                setSelectedTournament(updatedTournament);
            }
        }
    }, [state.tournaments, selectedTournament]);

    // Format date for display
    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString(undefined, {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    // Get status badge with consistent styling from LiveTournaments
    const getStatusBadge = (tournament: Tournament) => {
        if (tournament.completed) {
            return <span className="tournament-status status-finished">Finished</span>;
        }

        if (tournament.rounds.length === 1) {
            return <span className="tournament-status status-round2">Round 2</span>;
        }

        if (tournament.rounds.length === 0 && tournament.players.length > 0) {
            return <span className="tournament-status status-round1">Round 1</span>;
        }

        return <span className="tournament-status status-waiting">Waiting Players</span>;
    };

    // Find winner based on points
    const determineWinner = (tournament: Tournament): Player | null => {
        if (!tournament.completed || tournament.players.length === 0) {
            return null;
        }

        // Sort players by total points descending
        const sortedPlayers = [...tournament.players].sort((a, b) => {
            const pointsA = tournament.rounds.reduce((total, round) => {
                let roundPoints = 0;
                // Iterate through tables to find player results
                Object.values(round.tables).forEach(table => {
                    const result = table.results.find(r => r.playerId === a.id);
                    if (result) {
                        roundPoints += result.points;
                    }
                });
                return total + roundPoints;
            }, 0);

            const pointsB = tournament.rounds.reduce((total, round) => {
                let roundPoints = 0;
                // Iterate through tables to find player results
                Object.values(round.tables).forEach(table => {
                    const result = table.results.find(r => r.playerId === b.id);
                    if (result) {
                        roundPoints += result.points;
                    }
                });
                return total + roundPoints;
            }, 0);

            return pointsB - pointsA;
        });

        return sortedPlayers[0] || null;
    };

    const handleSelectTournament = (tournament: Tournament) => {
        setSelectedTournament(tournament);

        // Determine which view to show based on tournament state
        if (tournament.players.length === 0) {
            setActiveTournamentView('inscription');
        } else if (tournament.rounds.length === 0) {
            setActiveTournamentView('round1');
        } else if (tournament.rounds.length === 1) {
            setActiveTournamentView('round2');
        } else {
            setActiveTournamentView('results');
        }
    };

    const handleRestoreTournament = (tournament: Tournament, e: React.MouseEvent) => {
        e.stopPropagation();
        restoreTournament(tournament.id);
    };

    // Determine available navigation options based on tournament state
    const getAvailableViews = () => {
        if (!selectedTournament) return [];

        const views = [];

        // Players inscription is always available
        views.push({ id: 'inscription', label: 'Players' });

        // Round 1 is available if there are players
        if (selectedTournament.players.length > 0) {
            views.push({ id: 'round1', label: 'Round 1' });
        }

        // Round 2 is available if round 1 is completed
        if (selectedTournament.rounds.length >= 1) {
            views.push({ id: 'round2', label: 'Round 2' });
        }

        // Results are available if round 2 is completed
        if (selectedTournament.rounds.length >= 2) {
            views.push({ id: 'results', label: 'Final Results' });
        }

        return views;
    };

    return (
        <div>
            <Row>
                <Col lg={3} className="sidebar-column">
                    <Card className="tournament-list-card">
                        <Card.Header className="d-flex justify-content-between align-items-center py-2">
                            <span>Tournament History</span>
                            <div className="d-flex">
                                <DropdownButton
                                    variant="outline-secondary"
                                    size="sm"
                                    title={`${window.innerWidth <= 576 ? '' : 'Filter: '}${filterOption === 'all' ? 'All' : filterOption === 'live' ? 'Live' : filterOption === 'simulation' ? 'Sim' : 'Arch'}`}
                                    className="me-1"
                                >
                                    <Dropdown.Item onClick={() => setFilterOption('all')}>All</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setFilterOption('live')}>Live</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setFilterOption('simulation')}>Simulation</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setFilterOption('archived')}>Archived</Dropdown.Item>
                                </DropdownButton>
                                <DropdownButton
                                    variant="outline-secondary"
                                    size="sm"
                                    title={`${window.innerWidth <= 576 ? '' : 'Sort: '}${sortOption === 'date' ? 'Date' : 'Name'}`}
                                >
                                    <Dropdown.Item onClick={() => setSortOption('date')}>Date</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setSortOption('name')}>Name</Dropdown.Item>
                                </DropdownButton>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {tournaments.length === 0 ? (
                                <div className="p-3 text-center text-muted">
                                    No tournament history available.
                                </div>
                            ) : (
                                <ListGroup variant="flush" className="tournament-list">
                                    {tournaments.map((tournament) => {
                                        const status = getStatusBadge(tournament);
                                        const winner = determineWinner(tournament);

                                        return (
                                            <ListGroup.Item
                                                key={tournament.id}
                                                as="div"
                                                className="d-flex justify-content-between align-items-start"
                                            >
                                                <div
                                                    className={`tournament-info flex-grow-1 ${tournament.type === 'simulation' ? 'simulation-tournament' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleSelectTournament(tournament)}
                                                >
                                                    <div className={`tournament-name-container ${selectedTournament?.id === tournament.id ? 'active' : ''}`}>
                                                        <div className="tournament-name">
                                                            {tournament.name}
                                                        </div>
                                                        {status}
                                                    </div>
                                                    <div className="tournament-date">
                                                        <span title={formatDate(tournament.date)}>
                                                            {formatDate(tournament.date)}
                                                        </span>
                                                        <span className="tournament-type-badge ms-2">
                                                            {tournament.type === 'live' ? 'Live' : 'Sim'}
                                                        </span>
                                                    </div>
                                                    {winner && tournament.type !== 'simulation' && (
                                                        <div className="tournament-winner">
                                                            Winner: <strong>{winner.name}</strong>
                                                        </div>
                                                    )}
                                                </div>
                                                {tournament.archived && (
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        title="Restore Tournament"
                                                        onClick={(e) => handleRestoreTournament(tournament, e)}
                                                    >
                                                        <i className="bi bi-arrow-counterclockwise"></i>
                                                    </Button>
                                                )}
                                            </ListGroup.Item>
                                        );
                                    })}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={9} className="content-column">
                    {selectedTournament ? (
                        <>
                            <Card className="mb-2">
                                <Card.Body className="p-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="mb-0 fw-bold">
                                                {selectedTournament.name}
                                                {selectedTournament.archived && <span className="archived-badge ms-2">(Archived)</span>}
                                            </h6>
                                            <div className="tournament-details-subtitle">
                                                <small>{formatDate(selectedTournament.date)}</small>
                                                <small className="mx-1">•</small>
                                                <small>{selectedTournament.type === 'live' ? 'Live Tournament' : 'Simulation'}</small>
                                            </div>
                                        </div>
                                        {selectedTournament.archived && (
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => {
                                                    restoreTournament(selectedTournament.id);
                                                }}
                                            >
                                                <i className="bi bi-arrow-counterclockwise"></i>
                                            </Button>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Navigation tabs for tournament sections */}
                            <Card className="mb-2">
                                <Card.Body className="p-1">
                                    <Nav variant="tabs" className="tournament-nav">
                                        {getAvailableViews().map(view => (
                                            <Nav.Item key={view.id}>
                                                <Nav.Link
                                                    active={activeTournamentView === view.id}
                                                    onClick={() => setActiveTournamentView(view.id as any)}
                                                    className="py-1 px-3"
                                                >
                                                    {view.label}
                                                </Nav.Link>
                                            </Nav.Item>
                                        ))}
                                    </Nav>
                                </Card.Body>
                            </Card>

                            {activeTournamentView === 'inscription' && (
                                <TournamentPlayerInscription
                                    key={`inscription-${selectedTournament.id}`}
                                    tournament={selectedTournament}
                                    onComplete={() => setActiveTournamentView('round1')}
                                />
                            )}

                            {activeTournamentView === 'round1' && (
                                <TournamentRoundResults
                                    key={`round1-${selectedTournament.id}`}
                                    tournament={selectedTournament}
                                    roundNumber={1}
                                    onComplete={() => setActiveTournamentView('round2')}
                                    isEdit={selectedTournament.rounds.length >= 1}
                                />
                            )}

                            {activeTournamentView === 'round2' && (
                                <TournamentRoundResults
                                    key={`round2-${selectedTournament.id}`}
                                    tournament={selectedTournament}
                                    roundNumber={2}
                                    onComplete={() => setActiveTournamentView('results')}
                                    isEdit={selectedTournament.rounds.length >= 2}
                                />
                            )}

                            {activeTournamentView === 'results' && (
                                <TournamentResultsTable
                                    key={`results-${selectedTournament.id}`}
                                    tournament={selectedTournament}
                                />
                            )}
                        </>
                    ) : (
                        <Card>
                            <Card.Body className="text-center">
                                <p className="my-5 text-muted">
                                    Select a tournament from the list to view details.
                                </p>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    );
}

export default History; 