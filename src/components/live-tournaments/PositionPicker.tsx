import React, { useState, useEffect, useRef } from 'react';
import './DropdownPicker.css';

interface PositionPickerProps {
    value: number | null;
    onChange: (position: number | null) => void;
    availablePositions: number[];
}

const PositionPicker: React.FC<PositionPickerProps> = ({
    value,
    onChange,
    availablePositions
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

    // Get the positions to display (available + currently selected)
    const getPositionsToShow = () => {
        // Start with all available positions
        const positionsToShow = [...availablePositions];

        // If we have a selected position that's not in the available list, add it
        if (value !== null && !availablePositions.includes(value)) {
            positionsToShow.push(value);
        }

        // Sort positions numerically
        return positionsToShow.sort((a, b) => a - b);
    };

    // Format position with suffix (1st, 2nd, 3rd, etc.)
    const formatPosition = (position: number) => {
        const suffix = position === 1 ? 'st' :
            position === 2 ? 'nd' :
                position === 3 ? 'rd' : 'th';
        return `${position}${suffix}`;
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (position: number | null) => {
        onChange(position);
        setIsOpen(false);
    };

    return (
        <div className={`custom-dropdown-picker ${isOpen ? 'dropdown-active' : ''}`}>
            <button
                ref={toggleRef}
                className={`dropdown-toggle btn btn-light ${value ? "" : "text-muted placeholder"}`}
                onClick={toggleDropdown}
                style={{ width: '100%', textAlign: 'left' }}
            >
                {value !== null ? formatPosition(value) : "Select"}
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className="dropdown-menu show"
                    style={{ width: '100%' }}
                >
                    {value !== null && (
                        <button
                            className="dropdown-item clear-option"
                            onClick={() => handleSelect(null)}
                        >
                            Clear
                        </button>
                    )}

                    <div className="scrollable-menu">
                        {getPositionsToShow().map(position => (
                            <button
                                key={position}
                                className={`dropdown-item ${value === position ? 'active' : ''}`}
                                onClick={() => handleSelect(position)}
                            >
                                {formatPosition(position)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PositionPicker; 