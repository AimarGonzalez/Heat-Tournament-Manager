import { useState, useEffect } from 'react';
import { Card, Table, Badge, Form, InputGroup, Button, Modal } from 'react-bootstrap';
import { useAppContext } from '../../context/AppContext';
import TournamentResults from '../shared/TournamentResults';
import { Tournament } from '../../models/types';
import './History.css';

function History() {
    const { state } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Sort all tournaments by date (newest first)
    const sortedTournaments = [...state.tournaments]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Filter tournaments based on search term
    const filteredTournaments = sortedTournaments.filter(tournament =>
        tournament.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    // Get tournament winner
    const getWinner = (tournament: Tournament): string => {
        if (!tournament.rounds || tournament.rounds.length < 2) {
            return 'In Progress';
        }

        // Find the player with the highest total score
        let highestScore = -1;
        let winnerName = 'Unknown';

        tournament.players.forEach(player => {
            let totalPoints = 0;
            let totalBonus = 0;

            // Add up points from all rounds
            tournament.rounds.forEach(round => {
                Object.values(round.tables).forEach(table => {
                    const result = table.results.find(r => r.playerId === player.id);
                    if (result) {
                        totalPoints += result.points;
                    }
                });

                // Add bonus if available
                if (round.difficultyBonus && round.difficultyBonus[player.id] !== undefined) {
                    totalBonus += round.difficultyBonus[player.id];
                }
            });

            const finalScore = totalPoints + totalBonus;
            if (finalScore > highestScore) {
                highestScore = finalScore;
                winnerName = player.name;
            }
        });

        return winnerName;
    };

    const handleViewDetails = (tournament: Tournament) => {
        setSelectedTournament(tournament);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedTournament(null);
    };

    const getStatusBadge = (tournament: Tournament) => {
        if (tournament.completed) {
            return <Badge bg="success">Completed</Badge>;
        } else if (tournament.rounds.length === 0) {
            return <Badge bg="warning">Setup</Badge>;
        } else if (tournament.rounds.length === 1) {
            return <Badge bg="primary">Round 1</Badge>;
        } else {
            return <Badge bg="info">Round 2</Badge>;
        }
    };

    return (
        <div className="history-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Tournament History</h4>
                <div className="search-container">
                    <InputGroup>
                        <Form.Control
                            placeholder="Search tournaments"
                            aria-label="Search tournaments"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <InputGroup.Text>
                            <i className="bi bi-search"></i>
                        </InputGroup.Text>
                    </InputGroup>
                </div>
            </div>

            <Card>
                <Card.Header>All Tournaments</Card.Header>
                <div className="table-responsive">
                    <Table hover>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Tournament Name</th>
                                <th>Players</th>
                                <th>Winner</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTournaments.length > 0 ? (
                                filteredTournaments.map((tournament) => (
                                    <tr key={tournament.id}>
                                        <td>{formatDate(tournament.date)}</td>
                                        <td>{tournament.name}</td>
                                        <td>{tournament.players.length}</td>
                                        <td>{getWinner(tournament)}</td>
                                        <td>
                                            <Badge bg={tournament.type === 'live' ? 'success' : 'info'}>
                                                {tournament.type === 'live' ? 'Live' : 'Simulation'}
                                            </Badge>
                                        </td>
                                        <td>{getStatusBadge(tournament)}</td>
                                        <td>
                                            <Button
                                                variant="link"
                                                className="p-0 text-decoration-none"
                                                onClick={() => handleViewDetails(tournament)}
                                            >
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="text-center text-muted">
                                    <td colSpan={7}>No tournaments found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {/* Tournament Details Modal */}
            <Modal
                show={showDetailsModal}
                onHide={closeDetailsModal}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedTournament?.name}
                        <Badge
                            bg={selectedTournament?.type === 'live' ? 'success' : 'info'}
                            className="ms-2"
                        >
                            {selectedTournament?.type === 'live' ? 'Live' : 'Simulation'}
                        </Badge>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTournament && (
                        <div>
                            <div className="tournament-info-section mb-3">
                                <div className="row">
                                    <div className="col-md-6">
                                        <p><strong>Date:</strong> {formatDate(selectedTournament.date)}</p>
                                        <p><strong>Players:</strong> {selectedTournament.players.length}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Status:</strong> {selectedTournament.completed ? 'Completed' : 'In Progress'}</p>
                                        <p><strong>Winner:</strong> {getWinner(selectedTournament)}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedTournament.rounds.length === 2 ? (
                                <TournamentResults tournament={selectedTournament} title="Tournament Results" />
                            ) : (
                                <div className="alert alert-info">
                                    This tournament is still in progress. Results will be available when both rounds are completed.
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeDetailsModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default History; 