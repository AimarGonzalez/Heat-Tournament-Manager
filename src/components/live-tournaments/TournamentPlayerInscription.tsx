import { useState } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../../context/AppContext';
import { Tournament, Player } from '../../models/types';
import './TournamentPlayerInscription.css';

// Dwarven name lists for autofill
const DWARVEN_FIRST_NAMES = [
    'Thorin', 'Balin', 'Dwalin', 'Fili', 'Kili', 'Bombur', 'Bofur', 'Bifur', 'Gloin', 'Oin',
    'Dori', 'Nori', 'Ori', 'Gimli', 'Durin', 'Thrain', 'Thror', 'Dain', 'Borin', 'Fundin'
];

const DWARVEN_LAST_NAMES = [
    'Oakenshield', 'Ironfoot', 'Stonehelm', 'Hammerhand', 'Firebeard', 'Longbeard',
    'Stiffbeard', 'Stonefist', 'Rockfist', 'Battlehammer', 'Ironforge', 'Goldbeard',
    'Silveraxe', 'Stoutmantle', 'Deepdelver', 'Anvilmar', 'Flamebeard', 'Steelgaze',
    'Mountainkeeper', 'Blacklock'
];

interface TournamentPlayerInscriptionProps {
    tournament: Tournament;
    onComplete: () => void;
}

function TournamentPlayerInscription({ tournament, onComplete }: TournamentPlayerInscriptionProps) {
    const { updateTournament } = useAppContext();
    const [tournamentName, setTournamentName] = useState(tournament.name);
    const [playerNames, setPlayerNames] = useState<string[]>(Array(12).fill(''));
    const [validated, setValidated] = useState(false);

    const handlePlayerNameChange = (index: number, name: string) => {
        const newPlayerNames = [...playerNames];
        newPlayerNames[index] = name;
        setPlayerNames(newPlayerNames);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        // Create player objects from names
        const players: Player[] = playerNames.map(name => ({
            id: uuidv4(),
            name,
            mastery: 0 // Initial mastery
        }));

        // Update tournament
        const updatedTournament = {
            ...tournament,
            name: tournamentName,
            players
        };

        updateTournament(updatedTournament);
        onComplete();
    };

    const areAllPlayersNamed = () => {
        return playerNames.every(name => name.trim().length > 0);
    };

    // Autofill empty player names with dwarven names
    const handleAutofill = () => {
        const newPlayerNames = [...playerNames];
        const usedFirstNames = new Set<string>();
        const usedLastNames = new Set<string>();

        // Get already used names from non-empty slots
        newPlayerNames.forEach(name => {
            if (name && name.trim() !== '') {
                const [firstName, lastName] = name.split(' ');
                if (DWARVEN_FIRST_NAMES.includes(firstName)) usedFirstNames.add(firstName);
                if (DWARVEN_LAST_NAMES.includes(lastName)) usedLastNames.add(lastName);
            }
        });

        // Only fill empty slots
        for (let i = 0; i < newPlayerNames.length; i++) {
            if (!newPlayerNames[i] || newPlayerNames[i].trim() === '') {
                // Get available names
                const availableFirstNames = DWARVEN_FIRST_NAMES.filter(name => !usedFirstNames.has(name));
                const availableLastNames = DWARVEN_LAST_NAMES.filter(name => !usedLastNames.has(name));

                // If we've used all names, regenerate the pools
                if (availableFirstNames.length === 0 || availableLastNames.length === 0) {
                    newPlayerNames[i] = `Dwarf ${i + 1}`;
                    continue;
                }

                // Pick random names from available pools
                const firstName = availableFirstNames[Math.floor(Math.random() * availableFirstNames.length)];
                const lastName = availableLastNames[Math.floor(Math.random() * availableLastNames.length)];

                // Mark names as used
                usedFirstNames.add(firstName);
                usedLastNames.add(lastName);

                newPlayerNames[i] = `${firstName} ${lastName}`;
            }
        }

        setPlayerNames(newPlayerNames);
    };

    return (
        <Card className="player-inscription-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <span>Player Inscription</span>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleAutofill}
                >
                    <i className="bi bi-magic me-1"></i> Autofill with Dwarven Names
                </Button>
            </Card.Header>
            <Card.Body>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Row className="mb-4">
                        <Col md={6} lg={4}>
                            <Form.Group>
                                <Form.Label>Tournament Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={tournamentName}
                                    onChange={(e) => setTournamentName(e.target.value)}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a tournament name.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <h5 className="player-names-header mb-3">Player Names</h5>

                    <Row className="player-grid">
                        {playerNames.map((name, index) => (
                            <Col md={4} lg={3} key={index} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Player {index + 1}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={name}
                                        placeholder={`Enter player ${index + 1} name`}
                                        onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please provide a player name.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        ))}
                    </Row>

                    <div className="d-grid gap-2 mt-4">
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={!areAllPlayersNamed()}
                        >
                            Continue to Round 1
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default TournamentPlayerInscription; 