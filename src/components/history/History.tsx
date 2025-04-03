import { Card, Table, Badge, Form, InputGroup } from 'react-bootstrap';

function History() {
    return (
        <div>
            <h2>Tournament History</h2>

            <InputGroup className="mb-3">
                <Form.Control
                    placeholder="Search tournaments"
                    aria-label="Search tournaments"
                />
                <InputGroup.Text>
                    <i className="bi bi-search"></i>
                </InputGroup.Text>
            </InputGroup>

            <Card>
                <Card.Header>Past Tournaments</Card.Header>
                <Table striped hover responsive>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Tournament Name</th>
                            <th>Players</th>
                            <th>Winner</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>April 2, 2025</td>
                            <td>Championship #1</td>
                            <td>12</td>
                            <td>John Doe</td>
                            <td><Badge bg="success">Live</Badge></td>
                            <td>
                                <a href="#" className="me-2">View Details</a>
                            </td>
                        </tr>
                        <tr>
                            <td>April 1, 2025</td>
                            <td>Test Simulation</td>
                            <td>12</td>
                            <td>Random Player #3</td>
                            <td><Badge bg="info">Simulation</Badge></td>
                            <td>
                                <a href="#" className="me-2">View Details</a>
                            </td>
                        </tr>
                        <tr className="text-center text-muted">
                            <td colSpan={6}>No tournament history available</td>
                        </tr>
                    </tbody>
                </Table>
            </Card>
        </div>
    );
}

export default History; 