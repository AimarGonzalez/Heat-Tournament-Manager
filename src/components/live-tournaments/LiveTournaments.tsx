import { useState, useEffect } from 'react';
import { Button, Card, ListGroup, Row, Col, Alert, Nav } from 'react-bootstrap';
import { useAppContext } from '../../context/AppContext';
import { Tournament } from '../../models/types';
import TournamentPlayerInscription from './TournamentPlayerInscription';
import TournamentRoundResults from './TournamentRoundResults';
import TournamentResultsTable from './TournamentResultsTable';
import { restoreFromAutoBackup } from '../../services/storageService';
import './LiveTournaments.css';
import './TournamentPlayerInscription.css';
import '../shared/TournamentDetailTabs.css';

function LiveTournaments() {
    const { state, createTournament, archiveTournament, setActiveTournament, activeTournament } = useAppContext();
    const [activeTournamentView, setActiveTournamentView] = useState<'inscription' | 'round1' | 'round2' | 'results'>('inscription');
    const [showRecoveryMessage, setShowRecoveryMessage] = useState(false);

    // Filter only live tournaments (not simulations) and sort by date (newest first)
    // Also filter out archived tournaments
    const liveTournaments = state.tournaments
        .filter(t => t.type === 'live' && !t.archived)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Check if we need to show the recovery message
    useEffect(() => {
        // Only show recovery message if there are no tournaments and local storage has any data
        if (state.tournaments.length === 0 && localStorage.getItem('heat-tournament-auto-backup')) {
            setShowRecoveryMessage(true);
        } else {
            setShowRecoveryMessage(false);
        }
    }, [state.tournaments.length]);

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

    // Get tournament status label and class
    const getTournamentStatus = (tournament: Tournament): { label: string; className: string } => {
        if (tournament.completed) {
            return { label: "Finished", className: "status-finished" };
        }

        if (tournament.rounds.length === 1) {
            return { label: "Round 2", className: "status-round2" };
        }

        if (tournament.rounds.length === 0 && tournament.players.length > 0) {
            return { label: "Round 1", className: "status-round1" };
        }

        return { label: "Waiting Players", className: "status-waiting" };
    };

    const handleCreateNewTournament = () => {
        // Count existing live tournaments to create an appropriate name
        const liveTournamentCount = state.tournaments.filter(t => t.type === 'live').length;

        const newTournament = createTournament(
            `Tournament ${liveTournamentCount + 1}`,
            [], // Empty players array initially
            'live'
        );
        setActiveTournament(newTournament);
        setActiveTournamentView('inscription');
    };

    const handleSelectTournament = (tournament: Tournament) => {
        setActiveTournament(tournament);

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

    const handleArchiveTournament = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the parent ListGroupItem click event
        archiveTournament(id);

        // If the archived tournament is the active one, clear it
        if (activeTournament?.id === id) {
            setActiveTournament(undefined);
        }
    };

    const handleRestoreData = () => {
        const restored = restoreFromAutoBackup();
        if (restored) {
            // Clear the message
            setShowRecoveryMessage(false);
            // Force reload to see the restored data
            window.location.reload();
        }
    };

    // Determine available navigation options based on tournament state
    const getAvailableViews = () => {
        if (!activeTournament) return [];

        const views = [];

        // Players inscription is always available
        views.push({ id: 'inscription', label: 'Players' });

        // Round 1 is available if there are players
        if (activeTournament.players.length > 0) {
            views.push({ id: 'round1', label: 'Round 1' });
        }

        // Round 2 is available if round 1 is completed
        if (activeTournament.rounds.length >= 1) {
            views.push({ id: 'round2', label: 'Round 2' });
        }

        // Results are available if round 2 is completed
        if (activeTournament.rounds.length >= 2) {
            views.push({ id: 'results', label: 'Final Results' });
        }

        return views;
    };

    return (
        <div>
            <Row>
                <Col lg={3} className="sidebar-column">
                    <Card className="tournament-list-card">
                        <Card.Header className="p-2 p-sm-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="d-none d-sm-inline">Live Tournaments</span>
                                <span className="d-inline d-sm-none">Live</span>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleCreateNewTournament}
                                    className="py-1 px-2 py-sm-1 px-sm-2"
                                >
                                    <span className="d-none d-sm-inline">New Tournament</span>
                                    <span className="d-inline d-sm-none">New</span>
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {showRecoveryMessage && (
                                <Alert variant="warning" className="m-2">
                                    Your tournament data appears to be missing.
                                    <Button
                                        variant="link"
                                        onClick={handleRestoreData}
                                        className="p-0 m-0 ms-1 text-decoration-none"
                                    >
                                        Restore from backup?
                                    </Button>
                                </Alert>
                            )}

                            {liveTournaments.length === 0 ? (
                                <div className="p-3 text-center text-muted">
                                    No tournaments yet. Click 'New Tournament' to start.
                                </div>
                            ) : (
                                <ListGroup variant="flush" className="tournament-list">
                                    {liveTournaments.map((tournament) => {
                                        const status = getTournamentStatus(tournament);

                                        return (
                                            <ListGroup.Item
                                                key={tournament.id}
                                                as="div"
                                                className={`d-flex justify-content-between align-items-start ${activeTournament?.id === tournament.id ? 'selected-tournament' : ''}`}
                                            >
                                                <div
                                                    className="tournament-info flex-grow-1"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleSelectTournament(tournament)}
                                                >
                                                    <div className={`tournament-name-container ${activeTournament?.id === tournament.id ? 'active' : ''}`}>
                                                        <div className="tournament-name">{tournament.name}</div>
                                                        <div className={`tournament-status ${status.className}`}>
                                                            {status.label}
                                                        </div>
                                                    </div>
                                                    <div className="tournament-date">{formatDate(tournament.date)}</div>
                                                </div>
                                                {activeTournament?.id === tournament.id && (
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        title="Archive Tournament"
                                                        onClick={(e) => handleArchiveTournament(tournament.id, e)}
                                                    >
                                                        <i className="bi bi-archive"></i>
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
                    {activeTournament ? (
                        <>
                            {/* Navigation tabs for tournament sections */}
                            <Card className="tournament-detail-tabs">
                                <Card.Body>
                                    <Nav variant="tabs" className="tournament-nav">
                                        {getAvailableViews().map(view => (
                                            <Nav.Item key={view.id}>
                                                <Nav.Link
                                                    active={activeTournamentView === view.id}
                                                    onClick={() => setActiveTournamentView(view.id as any)}
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
                                    key={`inscription-${activeTournament.id}`}
                                    tournament={activeTournament}
                                    onComplete={() => setActiveTournamentView('round1')}
                                />
                            )}

                            {activeTournamentView === 'round1' && (
                                <TournamentRoundResults
                                    key={`round1-${activeTournament.id}`}
                                    tournament={activeTournament}
                                    roundNumber={1}
                                    onComplete={() => setActiveTournamentView('round2')}
                                    isEdit={activeTournament.rounds.length >= 1}
                                />
                            )}

                            {activeTournamentView === 'round2' && (
                                <TournamentRoundResults
                                    key={`round2-${activeTournament.id}`}
                                    tournament={activeTournament}
                                    roundNumber={2}
                                    onComplete={() => setActiveTournamentView('results')}
                                    isEdit={activeTournament.rounds.length >= 2}
                                />
                            )}

                            {activeTournamentView === 'results' && (
                                <TournamentResultsTable
                                    key={`results-${activeTournament.id}`}
                                    tournament={activeTournament}
                                />
                            )}
                        </>
                    ) : (
                        <Card>
                            <Card.Body className="text-center">
                                <p className="my-5 text-muted">
                                    Select or create a tournament to start.
                                </p>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    );
}

export default LiveTournaments; 