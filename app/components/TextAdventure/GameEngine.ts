import { create } from 'zustand';
import { GameStore, GameState, Position } from './types';
import { generateGrid } from './gridGenerator';

const GRID_SIZE = 16;
const STARTING_POSITION: Position = { x: Math.floor(GRID_SIZE/2), y: Math.floor(GRID_SIZE/2) };

const useGameStore = create<GameStore>((set, get) => ({
    gameState: {
        position: STARTING_POSITION,
        inventory: ['phone'],  // Start with your phone
        energy: 100,
        maxEnergy: 100,
        phoneCharge: 12,      // Start with low battery
        moves: 0,
        timeOfDay: 23,        // Start at 11 PM
        eventsResolved: [],
        needsToCharge: true,
        hasMap: false,
        knowsTheWay: false
    },
    grid: generateGrid(GRID_SIZE, GRID_SIZE),

    movePlayer: (direction) => set((state) => {
        const { position } = state.gameState;
        let newX = position.x;
        let newY = position.y;

        // Calculate new position
        switch (direction) {
            case 'north': newY = Math.max(0, position.y - 1); break;
            case 'south': newY = Math.min(GRID_SIZE - 1, position.y + 1); break;
            case 'west': newX = Math.max(0, position.x - 1); break;
            case 'east': newX = Math.min(GRID_SIZE - 1, position.x + 1); break;
        }

        // If position didn't change, return same state
        if (newX === position.x && newY === position.y) {
            return state;
        }

        const newPosition = { x: newX, y: newY };
        
        // Discover new room and update energy
        get().discoverRoom(newPosition);
        get().updateEnergy(-5); // Moving costs energy
        get().advanceTime(0.25); // 15 minutes per move

        // Drain phone battery occasionally
        if (Math.random() < 0.1) { // 10% chance per move
            get().updatePhoneCharge(-1);
        }

        return {
            gameState: {
                ...state.gameState,
                position: newPosition,
                moves: state.gameState.moves + 1
            }
        };
    }),

    addToInventory: (item) => set((state) => ({
        gameState: {
            ...state.gameState,
            inventory: [...state.gameState.inventory, item]
        }
    })),

    removeFromInventory: (item) => set((state) => ({
        gameState: {
            ...state.gameState,
            inventory: state.gameState.inventory.filter(i => i !== item)
        }
    })),

    updateEnergy: (amount) => set((state) => ({
        gameState: {
            ...state.gameState,
            energy: Math.min(
                state.gameState.maxEnergy, 
                Math.max(0, state.gameState.energy + amount)
            )
        }
    })),

    updatePhoneCharge: (amount) => set((state) => ({
        gameState: {
            ...state.gameState,
            phoneCharge: Math.min(
                100, 
                Math.max(0, state.gameState.phoneCharge + amount)
            ),
            needsToCharge: state.gameState.phoneCharge + amount < 20
        }
    })),

    resolveEvent: (eventId) => set((state) => ({
        gameState: {
            ...state.gameState,
            eventsResolved: [...state.gameState.eventsResolved, eventId]
        }
    })),

    advanceTime: (hours) => set((state) => {
        const newTime = (state.gameState.timeOfDay + hours) % 24;
        return {
            gameState: {
                ...state.gameState,
                timeOfDay: newTime,
                // Drain energy faster at night
                energy: newTime >= 22 || newTime <= 5 
                    ? state.gameState.energy - (hours * 2)
                    : state.gameState.energy - hours
            }
        };
    }),

    discoverRoom: (position) => set((state) => {
        const key = `${position.x},${position.y}`;
        const room = state.grid.rooms[key];
        
        if (!room.discovered) {
            return {
                grid: {
                    ...state.grid,
                    rooms: {
                        ...state.grid.rooms,
                        [key]: {
                            ...room,
                            discovered: true
                        }
                    }
                }
            };
        }
        return state;
    })
}));

export default useGameStore;