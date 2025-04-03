import { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';

const LocalStorageViewer = () => {
    const [storageData, setStorageData] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const data: Record<string, string> = {};

            // Loop through all localStorage items
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    const value = localStorage.getItem(key);
                    data[key] = value || '';
                }
            }

            setStorageData(data);
        } catch (err) {
            setError('Error accessing localStorage: ' + String(err));
        }
    }, []);

    const clearAllStorage = () => {
        try {
            localStorage.clear();
            setStorageData({});
        } catch (err) {
            setError('Error clearing localStorage: ' + String(err));
        }
    };

    return (
        <Card className="mt-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <span>localStorage Debug</span>
                <Button
                    variant="danger"
                    size="sm"
                    onClick={clearAllStorage}
                >
                    Clear All
                </Button>
            </Card.Header>
            <Card.Body>
                {error && <div className="alert alert-danger">{error}</div>}

                {Object.keys(storageData).length === 0 ? (
                    <p className="text-muted">No data in localStorage</p>
                ) : (
                    <ul className="list-group">
                        {Object.entries(storageData).map(([key, value]) => (
                            <li key={key} className="list-group-item">
                                <h5>{key}</h5>
                                <pre className="bg-light p-2" style={{ maxHeight: '200px', overflow: 'auto' }}>
                                    {value.length > 1000
                                        ? value.substring(0, 1000) + '... (truncated)'
                                        : value
                                    }
                                </pre>
                            </li>
                        ))}
                    </ul>
                )}
            </Card.Body>
        </Card>
    );
};

export default LocalStorageViewer; 