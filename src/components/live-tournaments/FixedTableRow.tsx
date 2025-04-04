import React from 'react';
import { TableAssignment, Tournament } from '../../models/types';
import PlayerPicker from './PlayerPicker';
import PositionPicker from './PositionPicker';
import ColorPicker from './ColorPicker';
import ColorCarPicker from '../shared/ColorCarPicker';
import { useColorPickerContext } from '../../context/ColorPickerContext';

interface TableRowProps {
    table: TableAssignment;
    tableIndex: number;
    slotIndex: number;
    playerId: string | null;
    tournament: Tournament;
    availableColors: Array<{ name: string; value: string }>;
    getAvailablePlayers: (tableIndex: number, slotIndex: number) => any[];
    getAvailablePositions: (tableIndex: number, slotIndex: number) => number[];
    handlePlayerChange: (tableIndex: number, slotIndex: number, playerId: string | null) => void;
    handleColorChange: (tableIndex: number, slotIndex: number, color: string | null) => void;
    handlePositionChange: (tableIndex: number, slotIndex: number, position: number | null) => void;
}

const FixedTableRow: React.FC<TableRowProps> = ({
    table,
    tableIndex,
    slotIndex,
    playerId,
    tournament,
    availableColors,
    getAvailablePlayers,
    getAvailablePositions,
    handlePlayerChange,
    handleColorChange,
    handlePositionChange
}) => {
    // Use the context for the car picker style preference
    const { useCarPicker } = useColorPickerContext();

    return (
        <tr key={slotIndex}>
            <td className="text-center">{slotIndex + 1}</td>
            <td>
                <PlayerPicker
                    value={playerId}
                    onChange={(playerId) => handlePlayerChange(
                        tableIndex,
                        slotIndex,
                        playerId
                    )}
                    players={tournament.players}
                    availablePlayers={getAvailablePlayers(tableIndex, slotIndex)}
                    selectedPlayer={tournament.players.find(p => p.id === playerId)}
                />
            </td>
            <td>
                {useCarPicker ? (
                    <ColorCarPicker
                        value={table.playerColors[slotIndex]}
                        onChange={(color) => handleColorChange(
                            tableIndex,
                            slotIndex,
                            color
                        )}
                        availableColors={availableColors}
                        tableColors={table.playerColors}
                        currentIndex={slotIndex}
                    />
                ) : (
                    <ColorPicker
                        value={table.playerColors[slotIndex]}
                        onChange={(color) => handleColorChange(
                            tableIndex,
                            slotIndex,
                            color
                        )}
                        availableColors={availableColors}
                        tableColors={table.playerColors}
                        currentIndex={slotIndex}
                    />
                )}
            </td>
            <td>
                <PositionPicker
                    value={table.positions[slotIndex]}
                    onChange={(position) => handlePositionChange(
                        tableIndex,
                        slotIndex,
                        position
                    )}
                    availablePositions={getAvailablePositions(tableIndex, slotIndex)}
                />
            </td>
        </tr>
    );
};

export default FixedTableRow; 