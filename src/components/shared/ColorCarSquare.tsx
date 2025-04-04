import React from 'react';
import redCar from '../../assets/cars/vintage-red.png';
import blueCar from '../../assets/cars/vintage-blue.png';
import greenCar from '../../assets/cars/vintage-green.png';
import yellowCar from '../../assets/cars/vintage-yellow.png';
import blackCar from '../../assets/cars/vintage-black.png';
import silverCar from '../../assets/cars/vintage-silver.png';

interface ColorCarSquareProps {
    color: string;
    size?: number;
    className?: string;
}

const ColorCarSquare: React.FC<ColorCarSquareProps> = ({ color, size = 16, className = '' }) => {
    const getColorImage = () => {
        switch (color) {
            case 'red':
                return redCar;
            case 'blue':
                return blueCar;
            case 'green':
                return greenCar;
            case 'yellow':
                return yellowCar;
            case 'black':
                return blackCar;
            case 'silver':
                return silverCar;
            default:
                return null;
        }
    };

    const image = getColorImage();

    if (!image) return null;

    // Size the car based on width to maintain aspect ratio
    const adjustedWidth = Math.round(size * 2.5 );

    return (
        <img
            src={image}
            alt={`${color} car`}
            width={adjustedWidth}
            style={{
                verticalAlign: 'middle',
                height: 'auto', // Let height adjust automatically to maintain aspect ratio
                margin: '0'
            }}
            className={className}
        />
    );
};

export default ColorCarSquare; 