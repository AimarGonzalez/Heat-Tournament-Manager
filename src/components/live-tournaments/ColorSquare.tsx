import React from 'react';
import redSquare from '../../assets/colors/red.svg';
import blueSquare from '../../assets/colors/blue.svg';
import greenSquare from '../../assets/colors/green.svg';
import yellowSquare from '../../assets/colors/yellow.svg';
import blackSquare from '../../assets/colors/black.svg';
import silverSquare from '../../assets/colors/silver.svg';

interface ColorSquareProps {
    color: string;
    size?: number;
    className?: string;
}

const ColorSquare: React.FC<ColorSquareProps> = ({ color, size = 16, className = '' }) => {
    const getColorImage = () => {
        switch (color) {
            case 'red':
                return redSquare;
            case 'blue':
                return blueSquare;
            case 'green':
                return greenSquare;
            case 'yellow':
                return yellowSquare;
            case 'black':
                return blackSquare;
            case 'silver':
                return silverSquare;
            default:
                return null;
        }
    };

    const image = getColorImage();

    if (!image) return null;

    return <img src={image} alt={`${color} color`} width={size} height={size} style={{ verticalAlign: 'middle' }} className={className} />;
};

export default ColorSquare; 