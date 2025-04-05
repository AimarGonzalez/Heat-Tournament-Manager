import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Card, Row, Col, CardBody } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../../context/AppContext';
import { Tournament, Player } from '../../models/types';
import './TournamentPlayerInscription.css';
import { CHARACTER_NAMES } from '../../config/constants';

interface TournamentPlayerInscriptionProps {
    tournament: Tournament;
    onComplete: () => void;
}

function TournamentPlayerInscription({ tournament, onComplete }: TournamentPlayerInscriptionProps) {
    const { updateTournament } = useAppContext();
    const [tournamentName, setTournamentName] = useState(tournament.name);
    const [playerNames, setPlayerNames] = useState<string[]>(() => {
        // Initialize with existing player names or empty array of 12 slots
        if (tournament.players.length > 0) {
            return tournament.players.map(p => p.name);
        }
        return Array(12).fill('');
    });
    const [validated, setValidated] = useState(false);
    const isEditing = tournament.players.length === 0;
    // Add a ref to track auto-save operations
    const isAutoSaving = useRef(false);

    // OLD AUTO-SAVE (DISABLED to fix infinite update loop)
    // useEffect(() => {
    //     // Always save changes for tournaments with existing players
    //     if (tournament.players.length > 0) {
    //         const updatedTournament = {
    //             ...tournament,
    //             name: tournamentName,
    //             players: tournament.players.map((player, index) => ({
    //                 ...player,
    //                 name: playerNames[index] || player.name // Keep existing name if empty
    //             }))
    //         };
    //         updateTournament(updatedTournament);
    //     }
    // }, [tournamentName, playerNames, tournament, updateTournament]);

    // Replace the above useEffect with a debounced version
    // Memoize the save function
    const saveFunction = useRef(() => {
        if (tournament.players.length > 0 && !isAutoSaving.current) {
            isAutoSaving.current = true;

            const updatedTournament = {
                ...tournament,
                name: tournamentName,
                players: tournament.players.map((player, index) => ({
                    ...player,
                    name: playerNames[index] || player.name // Keep existing name if empty
                }))
            };

            updateTournament(updatedTournament);

            // Reset the flag after saving
            setTimeout(() => {
                isAutoSaving.current = false;
            }, 0);
        }
    });

    // Update the save function when dependencies change
    useEffect(() => {
        saveFunction.current = () => {
            if (tournament.players.length > 0 && !isAutoSaving.current) {
                isAutoSaving.current = true;

                const updatedTournament = {
                    ...tournament,
                    name: tournamentName,
                    players: tournament.players.map((player, index) => ({
                        ...player,
                        name: playerNames[index] || player.name // Keep existing name if empty
                    }))
                };

                updateTournament(updatedTournament);

                // Reset the flag after saving
                setTimeout(() => {
                    isAutoSaving.current = false;
                }, 0);
            }
        };
    }, [tournamentName, playerNames, tournament, updateTournament]);

    // Debounced auto-save
    useEffect(() => {
        if (tournament.players.length === 0) return;

        const timeoutId = setTimeout(() => {
            saveFunction.current();
        }, 1000); // 1 second debounce

        return () => clearTimeout(timeoutId);
    }, [tournamentName, playerNames]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        // If we're creating a new tournament (no players yet)
        if (tournament.players.length === 0) {
            // Create players from names
            const players: Player[] = playerNames
                .filter(name => name.trim() !== '')
                .map(name => ({
                    id: uuidv4(),
                    name
                }));

            // Validate that we have exactly 12 players
            if (players.length !== 12) {
                setValidated(true);
                return;
            }

            // Update tournament with name and players
            const updatedTournament = {
                ...tournament,
                name: tournamentName,
                players
            };

            updateTournament(updatedTournament);
        }

        onComplete();
    };

    const handleNameChange = (index: number, value: string) => {
        const newPlayerNames = [...playerNames];
        newPlayerNames[index] = value;
        setPlayerNames(newPlayerNames);
    };

    // Autofill empty player names with character names
    const handleAutofill = () => {
        const newPlayerNames = [...playerNames];
        const usedNames = new Set<string>();

        // Get already used names from non-empty slots
        newPlayerNames.forEach(name => {
            if (name && name.trim() !== '') {
                if (CHARACTER_NAMES.includes(name)) usedNames.add(name);
            }
        });

        // Only fill empty slots
        for (let i = 0; i < newPlayerNames.length; i++) {
            if (!newPlayerNames[i] || newPlayerNames[i].trim() === '') {
                // Get available names
                const availableNames = CHARACTER_NAMES.filter(name => !usedNames.has(name));

                // If we've used all names, use a numbered name
                if (availableNames.length === 0) {
                    newPlayerNames[i] = `Player ${i + 1}`;
                    continue;
                }

                // Pick a random name from available pool
                const characterName = availableNames[Math.floor(Math.random() * availableNames.length)];

                // Mark name as used
                usedNames.add(characterName);

                newPlayerNames[i] = characterName;
            }
        }

        setPlayerNames(newPlayerNames);
    };

    return (
        <Card className="player-inscription-card tournament-selected-card">
            <Card.Header className="d-flex justify-content-between align-items-center tournament-selected-header">
                <span>{isEditing ? 'Player Inscription' : 'Edit Tournament Details'}</span>
                <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={handleAutofill}
                    style={{
                        color: '#fd7e14',
                        borderColor: '#fd7e14'
                    }}
                >
                    <i className="bi bi-magic me-1"></i> Autofill player names
                </Button>
            </Card.Header>
            <Card.Body>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Card className="mb-4">
                        <CardBody>
                            <Form.Label className="section-header mb-2">Tournament Name</Form.Label>
                            <Row>
                                <Col md={6} lg={4}>
                                    <Form.Group>
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
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>
                            <Form.Label className="section-header mb-2">Player Names</Form.Label>

                            <div className="player-grid">
                                <Row className="g-3">
                                    {Array.from({ length: 12 }).map((_, index) => (
                                        <Col key={index} md={6} lg={4}>
                                            <Form.Group>
                                                <Form.Control
                                                    type="text"
                                                    value={playerNames[index] || ''}
                                                    onChange={(e) => handleNameChange(index, e.target.value)}
                                                    placeholder={`Enter name for player ${index + 1}`}
                                                    required
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    Please provide a name for player {index + 1}.
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        </CardBody>
                    </Card>

                    <div className="d-grid gap-2 mt-4">
                        <Button type="submit" variant="primary" size="lg">
                            {isEditing ? 'Start Tournament' : 'Save Changes'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default TournamentPlayerInscription; 