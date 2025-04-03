import { Button, Card, Form, Row, Col, Table } from 'react-bootstrap';

function Simulation() {
    return (
        <div>
            <h2>Tournament Simulation</h2>

            <Card className="mb-4">
                <Card.Header>Simulation Settings</Card.Header>
                <Card.Body>
                    <Form>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Number of Players</Form.Label>
                                    <Form.Control type="number" defaultValue={12} min={6} max={24} />
                                    <Form.Text className="text-muted">Standard tournament has 12 players</Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Tournament Name</Form.Label>
                                    <Form.Control type="text" placeholder="e.g. Simulation #1" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button variant="primary">Run Simulation</Button>
                    </Form>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header>Simulation Results</Card.Header>
                <Card.Body>
                    <p className="text-center text-muted">Run a simulation to see results</p>
                    <Table striped bordered hover className="d-none">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Player</th>
                                <th>Round 1</th>
                                <th>Round 2</th>
                                <th>Total Points</th>
                                <th>Difficulty Bonus</th>
                                <th>Final Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Player 1</td>
                                <td>9</td>
                                <td>6</td>
                                <td>15</td>
                                <td>2.4</td>
                                <td>17.4</td>
                            </tr>
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
}

export default Simulation; 