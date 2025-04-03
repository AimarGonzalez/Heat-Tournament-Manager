import { useState, useEffect } from 'react';
import { Button, Card, ListGroup, Row, Col, Alert } from 'react-bootstrap';
import { useAppContext } from '../../context/AppContext';
import { Tournament } from '../../models/types';
import TournamentPlayerInscription from './TournamentPlayerInscription';
import TournamentRoundResults from './TournamentRoundResults';
import TournamentResultsTable from './TournamentResultsTable';
import { restoreFromAutoBackup } from '../../services/storageService';
import './LiveTournaments.css';
import './TournamentPlayerInscription.css';

function LiveTournaments() {
    const { state, createTournament, deleteTournament, setActiveTournament, activeTournament } = useAppContext();
    const [activeTournamentView, setActiveTournamentView] = useState<'inscription' | 'round1' | 'round2' | 'results'>('inscription');
    const [showRecoveryMessage, setShowRecoveryMessage] = useState(false);

    // Filter only live tournaments (not simulations) and sort by date (newest first)
    const liveTournaments = state.tournaments
        .filter(t => t.type === 'live')
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

    const handleCreateNewTournament = () => {
        const newTournament = createTournament(
            `Tournament ${liveTournaments.length + 1}`,
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

    const handleDeleteTournament = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteTournament(id);
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

    return (
        <div className="tournament-container">
            <Row>
                <Col lg={3} className="sidebar-column">
                    <Card className="tournament-list-card">
                        <Card.Header>
                            <div className="d-flex justify-content-between align-items-center">
                                <span>Live Tournaments</span>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleCreateNewTournament}
                                >
                                    New Tournament
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
                                    {liveTournaments.map((tournament) => (
                                        <ListGroup.Item
                                            key={tournament.id}
                                            action
                                            active={activeTournament?.id === tournament.id}
                                            onClick={() => handleSelectTournament(tournament)}
                                            className="d-flex justify-content-between align-items-start"
                                        >
                                            <div className="tournament-info">
                                                <div className="tournament-name">{tournament.name}</div>
                                                <div className="tournament-date">{formatDate(tournament.date)}</div>
                                            </div>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={(e) => handleDeleteTournament(tournament.id, e)}
                                            >
                                                ×
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={9} className="content-column">
                    {activeTournament ? (
                        <>
                            {activeTournamentView === 'inscription' && (
                                <TournamentPlayerInscription
                                    tournament={activeTournament}
                                    onComplete={() => setActiveTournamentView('round1')}
                                />
                            )}

                            {activeTournamentView === 'round1' && (
                                <TournamentRoundResults
                                    tournament={activeTournament}
                                    roundNumber={1}
                                    onComplete={() => setActiveTournamentView('round2')}
                                />
                            )}

                            {activeTournamentView === 'round2' && (
                                <TournamentRoundResults
                                    tournament={activeTournament}
                                    roundNumber={2}
                                    onComplete={() => setActiveTournamentView('results')}
                                />
                            )}

                            {activeTournamentView === 'results' && (
                                <TournamentResultsTable tournament={activeTournament} />
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