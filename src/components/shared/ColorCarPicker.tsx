import React, { useState, useEffect, useRef } from 'react';
import ColorCarSquare from './ColorCarSquare';
import '../live-tournaments/ColorPicker.css'; // Reuse the same CSS
import './ColorCarPicker.css'; // Add car-specific CSS

interface ColorOption {
    name: string;
    value: string;
}

interface ColorCarPickerProps {
    value: string | null;
    onChange: (color: string | null) => void;
    availableColors: ColorOption[];
    tableColors: Array<string | null>; // All colors currently used in the table
    currentIndex: number; // Current index in the table
}

const ColorCarPicker: React.FC<ColorCarPickerProps> = ({
    value,
    onChange,
    availableColors,
    tableColors,
    currentIndex
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent) {
            if (
                menuRef.current &&
                toggleRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                !toggleRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        // Add event listener
        document.addEventListener('mousedown', handleOutsideClick);

        // Clean up
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const getSelectedColor = () => {
        if (!value) return null;
        return availableColors.find(color => color.value === value) || null;
    };

    // Filter out colors that are already used in this table (except for the current position's color)
    const getAvailableColors = () => {
        // Get all colors currently used in the table except for the current position
        const usedColors = new Set<string>();
        tableColors.forEach((color, index) => {
            if (color && index !== currentIndex) {
                usedColors.add(color);
            }
        });

        // Return only colors that aren't already used
        return availableColors.filter(color => !usedColors.has(color.value));
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (color: string | null) => {
        onChange(color);
        setIsOpen(false);
    };

    const filteredColors = getAvailableColors();

    return (
        <div className={`custom-color-picker ${isOpen ? 'dropdown-active' : ''}`}>
            <button
                ref={toggleRef}
                className={`dropdown-toggle btn btn-light ${value ? "d-flex align-items-center" : "text-muted"}`}
                onClick={toggleDropdown}
                style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}
            >
                {value ? (
                    <ColorCarSquare color={value} size={22} className="me-2" />
                ) : (
                    <span className="color-placeholder">Select</span>
                )}
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className="dropdown-menu show"
                    style={{ width: '100%' }}
                >
                    <button
                        className="dropdown-item clear-option"
                        onClick={() => handleSelect(null)}
                    >
                        Clear
                    </button>

                    <div className="scrollable-menu">
                        <div className="car-grid">
                            {filteredColors.map(color => (
                                <div
                                    key={color.value}
                                    className={`car-item ${value === color.value ? 'active' : ''}`}
                                    onClick={() => handleSelect(color.value)}
                                    title={color.name}
                                >
                                    <ColorCarSquare color={color.value} size={24} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorCarPicker; 