import React, { useState, useEffect, useRef } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Player } from '../../models/types';
import './DropdownPicker.css';

interface PlayerPickerProps {
    value: string | null;
    onChange: (playerId: string | null) => void;
    players: Player[];
    availablePlayers: Player[];
    selectedPlayer: Player | undefined;
}

const PlayerPicker: React.FC<PlayerPickerProps> = ({
    value,
    onChange,
    players,
    availablePlayers,
    selectedPlayer
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

    // Get the players to display (available + currently selected)
    const getPlayersToShow = () => {
        // Start with all available players
        const playersToShow = [...availablePlayers];

        // If we have a selected player that's not in the available list, add them
        if (selectedPlayer && !availablePlayers.find(p => p.id === selectedPlayer.id)) {
            playersToShow.push(selectedPlayer);
        }

        // Sort players by name for better UX
        return playersToShow.sort((a, b) => a.name.localeCompare(b.name));
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (playerId: string | null) => {
        onChange(playerId);
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
                {selectedPlayer ? selectedPlayer.name : "Select"}
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className="dropdown-menu show"
                    style={{ width: '100%' }}
                >
                    {value && (
                        <button
                            className="dropdown-item clear-option"
                            onClick={() => handleSelect(null)}
                        >
                            Clear
                        </button>
                    )}

                    <div className="scrollable-menu">
                        {getPlayersToShow().map(player => (
                            <button
                                key={player.id}
                                className={`dropdown-item ${value === player.id ? 'active' : ''}`}
                                onClick={() => handleSelect(player.id)}
                            >
                                {player.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerPicker; 