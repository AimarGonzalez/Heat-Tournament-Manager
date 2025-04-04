import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { USE_CAR_PICKER_STYLE } from '../config/constants';

interface ColorPickerContextType {
    useCarPicker: boolean;
    toggleCarPickerStyle: () => void;
}

// Create the context with a default value
const ColorPickerContext = createContext<ColorPickerContextType>({
    useCarPicker: USE_CAR_PICKER_STYLE,
    toggleCarPickerStyle: () => { }
});

// Hook to use the context
export const useColorPickerContext = () => useContext(ColorPickerContext);

interface ColorPickerProviderProps {
    children: ReactNode;
}

export const ColorPickerProvider: React.FC<ColorPickerProviderProps> = ({ children }) => {
    // Initialize from localStorage if available, otherwise use the default constant
    const [useCarPicker, setUseCarPicker] = useState<boolean>(() => {
        const savedPreference = localStorage.getItem('useCarPickerStyle');
        return savedPreference !== null ? JSON.parse(savedPreference) : USE_CAR_PICKER_STYLE;
    });

    // Update the global window variable when the state changes
    useEffect(() => {
        // @ts-ignore This is a hack to modify the constant at runtime
        window.USE_CAR_PICKER_STYLE = useCarPicker;
    }, [useCarPicker]);

    // Function to toggle the style
    const toggleCarPickerStyle = () => {
        const newValue = !useCarPicker;

        // Save preference to localStorage
        localStorage.setItem('useCarPickerStyle', JSON.stringify(newValue));

        // Update the window variable
        // @ts-ignore
        window.USE_CAR_PICKER_STYLE = newValue;

        // Update state
        setUseCarPicker(newValue);
    };

    return (
        <ColorPickerContext.Provider value={{ useCarPicker, toggleCarPickerStyle }}>
            {children}
        </ColorPickerContext.Provider>
    );
}; 