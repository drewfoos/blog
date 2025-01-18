export interface Position {
    x: number;
    y: number;
}

export interface GridRoom {
    name: string;
    description: string;
    items: string[];
    examine: Record<string, string>;
    type: RoomType;
    discovered: boolean;
    events?: GameEvent[];
}

export type RoomType = 
    | 'campsite'      // Starting area
    | 'forest'        // Basic area
    | 'dense_forest'  // Harder to navigate
    | 'clearing'      // Easier to navigate
    | 'trail'         // Potential escape route
    | 'creek'         // Need to cross it
    | 'ranger_post'   // Avoid detection
    | 'parking_lot'   // Potential escape point
    | 'cabin'         // Might have useful items
    | 'cave'          // Shelter/hiding spot
    | 'bear_area'     // Dangerous!
    | 'road';         // Path to freedom

export type GameEvent = {
    id: string;
    type: 'encounter' | 'obstacle' | 'discovery';
    description: string;
    resolved: boolean;
    requires?: string[];  // Required items to resolve
    rewards?: string[];   // Items gained when resolved
};

export interface GameState {
    position: Position;
    inventory: string[];
    energy: number;      // Instead of health - represents how tired you are
    maxEnergy: number;
    phoneCharge: number; // Need this to call for pickup!
    moves: number;
    timeOfDay: number;   // 0-23, affects gameplay
    eventsResolved: string[];
    needsToCharge: boolean;
    hasMap: boolean;
    knowsTheWay: boolean;
}

export interface GameGrid {
    width: number;
    height: number;
    rooms: Record<string, GridRoom>;  // Key format: "x,y"
}

export interface GameStore {
    gameState: GameState;
    grid: GameGrid;
    movePlayer: (direction: 'north' | 'south' | 'east' | 'west') => void;
    addToInventory: (item: string) => void;
    removeFromInventory: (item: string) => void;
    updateEnergy: (amount: number) => void;
    updatePhoneCharge: (amount: number) => void;
    resolveEvent: (eventId: string) => void;
    advanceTime: (hours: number) => void;
    discoverRoom: (position: Position) => void;
}