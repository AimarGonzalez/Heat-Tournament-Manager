import { useState, useRef, useEffect } from 'react';
import { Button, Modal, Form, Alert, Card, ListGroup, Badge } from 'react-bootstrap';
import { useAppContext } from '../../context/AppContext';
import {
    exportData,
    importData,
    restoreFromAutoBackup,
    getAvailableBackups,
    restoreFromSpecificBackup
} from '../../services/storageService';

const DataManager: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { state, refreshAppState } = useAppContext();
    const [availableBackups, setAvailableBackups] = useState<{ id: string, timestamp: string }[]>([]);

    useEffect(() => {
        // Load available backups when the modal is opened
        if (showModal) {
            setAvailableBackups(getAvailableBackups());
        }
    }, [showModal]);

    // Handles export data functionality
    const handleExport = () => {
        if (state.tournaments.length === 0) {
            setMessage({
                text: 'No tournaments to export. Create some tournaments first.',
                type: 'info'
            });
            return;
        }

        exportData();
        setMessage({
            text: 'Data exported successfully. Save this file to preserve your tournaments.',
            type: 'success'
        });
    };

    // Handles import data functionality
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        importData(file)
            .then(() => {
                refreshAppState(); // Refresh the app state after import
                setMessage({
                    text: 'Data imported successfully. Your tournaments have been loaded.',
                    type: 'success'
                });
                // Reset the file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            })
            .catch((error) => {
                setMessage({
                    text: `Error importing data: ${error.message}`,
                    type: 'danger'
                });
            });
    };

    // Handles auto-backup restore functionality
    const handleRestoreFromAutoBackup = () => {
        const restored = restoreFromAutoBackup();

        if (restored) {
            refreshAppState(); // Refresh the app state after restore
            setMessage({
                text: 'Data restored from auto-backup. Your tournaments have been loaded.',
                type: 'success'
            });
        } else {
            setMessage({
                text: 'No auto-backup found. You need to first use the app and make changes.',
                type: 'info'
            });
        }
    };

    // Handles restore from a specific backup
    const handleRestoreFromSpecificBackup = (backupId: string) => {
        const restored = restoreFromSpecificBackup(backupId);

        if (restored) {
            refreshAppState(); // Refresh the app state after restore
            setMessage({
                text: 'Data restored from backup. Your tournaments have been loaded.',
                type: 'success'
            });
        } else {
            setMessage({
                text: 'Failed to restore from the selected backup.',
                type: 'danger'
            });
        }
    };

    // Format the timestamp for display with seconds
    const formatTimestamp = (isoTimestamp: string): string => {
        try {
            const date = new Date(isoTimestamp);
            return date.toLocaleString(undefined, {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            return isoTimestamp;
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setMessage(null);
    };

    return (
        <>
            <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowModal(true)}
                className="data-manager-btn"
                title="Backup or restore tournament data"
            >
                <i className="bi bi-database"></i>
            </Button>

            <Modal show={showModal} onHide={closeModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Data Management</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {message && (
                        <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
                            {message.text}
                        </Alert>
                    )}

                    <p className="mb-3">
                        To prevent losing your tournament data when the application is updated or restarted,
                        you can export your data to a file and import it later.
                    </p>

                    <Card className="mb-4">
                        <Card.Header>Manual Backup & Restore</Card.Header>
                        <Card.Body>
                            <div className="d-flex flex-wrap gap-2">
                                <Button
                                    variant="primary"
                                    onClick={handleExport}
                                    className="d-flex align-items-center"
                                >
                                    <i className="bi bi-download me-2"></i> Export Data
                                </Button>

                                <Form.Group>
                                    <Form.Label htmlFor="importFile" className="mb-0 me-2">
                                        <Button
                                            variant="secondary"
                                            className="d-flex align-items-center"
                                            as="span"
                                        >
                                            <i className="bi bi-upload me-2"></i> Import Data
                                        </Button>
                                    </Form.Label>
                                    <Form.Control
                                        type="file"
                                        id="importFile"
                                        ref={fileInputRef}
                                        onChange={handleImport}
                                        accept=".json"
                                        style={{ display: 'none' }}
                                    />
                                </Form.Group>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header>Auto-Backup Recovery</Card.Header>
                        <Card.Body>
                            <p>
                                The app automatically creates a backup every time you make changes.
                                Up to 3 recent backups are stored in your browser.
                                If you lose your data, you can recover from the last auto-backup.
                            </p>

                            <div className="d-flex flex-wrap gap-2 mb-3">
                                <Button
                                    variant="warning"
                                    onClick={handleRestoreFromAutoBackup}
                                    className="d-flex align-items-center justify-content-center"
                                >
                                    <i className="bi bi-arrow-counterclockwise me-2"></i> Restore Latest Backup
                                </Button>
                            </div>

                            {availableBackups.length > 0 && (
                                <div className="mt-3">
                                    <h6>Available Backups:</h6>
                                    <ListGroup>
                                        {availableBackups.map((backup, index) => (
                                            <ListGroup.Item
                                                key={backup.id}
                                                className="d-flex justify-content-between align-items-center"
                                            >
                                                <div>
                                                    <span className="me-2">{formatTimestamp(backup.timestamp)}</span>
                                                    {index === 0 && (
                                                        <Badge bg="success" pill>Latest</Badge>
                                                    )}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline-warning"
                                                    onClick={() => handleRestoreFromSpecificBackup(backup.id)}
                                                >
                                                    Restore
                                                </Button>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default DataManager; 