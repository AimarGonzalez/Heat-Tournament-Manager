/**
 * Application constants
 */

// Default tournament settings
export const DEFAULT_PLAYERS_COUNT = 12;
export const DEFAULT_TABLES_COUNT = 2;
export const DEFAULT_PLAYERS_PER_TABLE = 6;
export const DEFAULT_ROUNDS_COUNT = 2;

// Scoring values
export const POSITION_POINTS = [9, 6, 4, 3, 2, 1];

// Dwarven name lists for the generator
export const DWARVEN_FIRST_NAMES = [
    'Thorin', 'Balin', 'Dwalin', 'Fili', 'Kili', 'Bombur', 'Bofur', 'Bifur', 'Gloin', 'Oin',
    'Dori', 'Nori', 'Ori', 'Gimli', 'Durin', 'Thrain', 'Thror', 'Dain', 'Borin', 'Fundin'
];

export const DWARVEN_LAST_NAMES = [
    'Escudoroble', 'Piedrohierro', 'Yelmorocoso', 'Manomartillo', 'Barbafuego', 'Barbalarga',
    'Barbadura', 'Puñoroca', 'Puñopiedra', 'Martillobatalla', 'Forjahierro', 'Barbaoro',
    'Hachaplatino', 'Mantorecio', 'Excavaprofundo', 'Yunquemar', 'Barbafuego', 'Miradacero',
    'Guardamontaña', 'Cerraduranegra'
];

// Random player name generation
export const FIRST_NAMES = [
    'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'
];

export const LAST_NAMES = [
    'Herrero', 'Jiménez', 'Guillén', 'Gómez', 'Moreno', 'Díaz', 'Molina', 'Villanueva', 'Morales', 'Sastre',
    'Andrade', 'Torres', 'Jaramillo', 'Blanco', 'Hernández', 'Martín', 'Tomás', 'García', 'Martínez', 'Ruiz'
];

// UI Configuration
export const USE_CAR_PICKER_STYLE = true; // When true, uses car icons instead of color squares

/**
 * Generate a random player name
 */
export const generateRandomName = (): string => {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

    return `${firstName} ${lastName}`;
}; 