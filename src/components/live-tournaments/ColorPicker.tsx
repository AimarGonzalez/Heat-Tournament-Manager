import React, { useState, useRef, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import ColorSquare from './ColorSquare';
import './ColorPicker.css';

interface ColorOption {
    name: string;
    value: string;
}

interface ColorPickerProps {
    value: string | null;
    onChange: (color: string | null) => void;
    availableColors: ColorOption[];
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, availableColors }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getSelectedColor = () => {
        if (!value) return null;
        return availableColors.find(color => color.value === value) || null;
    };

    const selectedColor = getSelectedColor();

    return (
        <div className="custom-color-picker" ref={dropdownRef}>
            <Dropdown show={isOpen} onToggle={(isOpen) => setIsOpen(isOpen)}>
                <Dropdown.Toggle
                    variant="light"
                    className={value ? "d-flex align-items-center" : "text-muted"}
                    style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}
                >
                    {value ? (
                        <ColorSquare color={value} size={22} className="me-2" />
                    ) : (
                        <span className="color-placeholder">Select</span>
                    )}
                </Dropdown.Toggle>

                <Dropdown.Menu style={{ width: '100%' }}>
                    <div className="color-grid">
                        {availableColors.map(color => (
                            <div
                                key={color.value}
                                className={`color-item ${value === color.value ? 'active' : ''}`}
                                onClick={() => {
                                    onChange(color.value);
                                    setIsOpen(false);
                                }}
                                title={color.name}
                            >
                                <ColorSquare color={color.value} size={24} />
                            </div>
                        ))}
                    </div>
                    <Dropdown.Divider />
                    <Dropdown.Item
                        onClick={() => {
                            onChange(null);
                            setIsOpen(false);
                        }}
                        className="text-muted text-center"
                    >
                        Clear
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
};

export default ColorPicker; 