import React, { createContext, useContext, useState, useEffect } from 'react';
import backgroundTrack from '../assets/background/background-track.jpg';
import backgroundPlayer from '../assets/background/background-player-matt.webp';
import backgroundIllustration from '../assets/background/background-ilustration.webp';

const backgrounds = [
    backgroundPlayer,
    backgroundTrack,
    backgroundIllustration
];

interface BackgroundContextType {
    currentBackground: string;
    cycleBackground: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        document.body.style.backgroundImage = `url(${backgrounds[currentIndex]})`;
    }, [currentIndex]);

    const cycleBackground = () => {
        setCurrentIndex((prev) => (prev + 1) % backgrounds.length);
    };

    return (
        <BackgroundContext.Provider value={{
            currentBackground: backgrounds[currentIndex],
            cycleBackground
        }}>
            {children}
        </BackgroundContext.Provider>
    );
}

export function useBackground() {
    const context = useContext(BackgroundContext);
    if (context === undefined) {
        throw new Error('useBackground must be used within a BackgroundProvider');
    }
    return context;
} 