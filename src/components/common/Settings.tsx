import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { useColorPickerContext } from '../../context/ColorPickerContext';

interface SettingsProps {
    showDebug: boolean;
    setShowDebug: (show: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ showDebug, setShowDebug }) => {
    const [showModal, setShowModal] = useState(false);
    const { useCarPicker, toggleCarPickerStyle } = useColorPickerContext();

    const closeModal = () => setShowModal(false);

    return (
        <>
            <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowModal(true)}
                className="data-manager-btn"
                title="Settings"
            >
                <i className="bi bi-gear"></i>
            </Button>

            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="switch"
                                id="debug-mode"
                                label="Debug Mode"
                                checked={showDebug}
                                onChange={(e) => setShowDebug(e.target.checked)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Check
                                type="switch"
                                id="color-picker-style"
                                label="Use Car Icons"
                                checked={useCarPicker}
                                onChange={toggleCarPickerStyle}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Settings; 