import React, { useState, useEffect } from 'react';
import { Terminal } from './ui/GameTerminal';
import useGameStore from './GameEngine';
import { parseCommand } from './CommandParser';

const AVAILABLE_COMMANDS = [
    'look', 'l',
    'north', 'n',
    'south', 's', 
    'east', 'e',
    'west', 'w',
    'take', 'get',
    'use',
    'examine', 'x',
    'inventory', 'i',
    'status',
    'complain',
    'help'
];

const INTRO_TEXT = `You wake up in your tent, the sound of nature assaulting your ears.
Your parents forced you to go camping to "touch grass" and "get some fresh air."
But they don't understand - you have ranked games to play! Your League of Legends
rank isn't going to climb itself.

Your phone shows 12% battery and no signal. Everyone else is asleep.
This is your chance to escape this outdoor prison and get back to what really
matters - gaming.

Type 'help' to see available commands, or 'look' to check your surroundings.
(Pro tip: You can also 'complain' about the lack of gaming amenities.)`;

export const TextAdventure: React.FC = () => {
    const [gameLog, setGameLog] = useState<string[]>([]);
    const { 
        gameState,
        grid,
        movePlayer,
        addToInventory,
        removeFromInventory,
        updateEnergy,
        updatePhoneCharge
    } = useGameStore();

    // Initialize game
    useEffect(() => {
        setGameLog(INTRO_TEXT.split('\n'));
    }, []);

    // Check win/loss conditions
    useEffect(() => {
        if (gameState.energy <= 0) {
            addToLog("\nYou're too exhausted to continue. If only you had a support with healing...");
            addToLog("GAME OVER - Your energy reached 0!");
            return;
        }

        if (gameState.phoneCharge <= 0) {
            addToLog("\nYour phone is dead. No way to call for help or check op.gg...");
            addToLog("GAME OVER - Your phone died!");
            return;
        }

        const currentRoom = grid.rooms[`${gameState.position.x},${gameState.position.y}`];
        if (currentRoom.type === 'road' && gameState.inventory.includes('car_keys')) {
            addToLog("\nYOU WIN! You found a way back to civilization!");
            addToLog("Your gaming chair awaits, victorious player!");
            return;
        }
    }, [gameState.energy, gameState.phoneCharge, gameState.position, gameState.inventory, grid.rooms]);

    const addToLog = (text: string) => {
        setGameLog(prev => [...prev, text]);
    };

    const handleCommand = (input: string) => {
        // Don't process commands if game is over
        if (gameState.energy <= 0 || gameState.phoneCharge <= 0) {
            addToLog("Game over! Type 'restart' to try again.");
            return;
        }

        addToLog(`> ${input}`);
        
        if (input.toLowerCase().trim() === 'restart') {
            window.location.reload();
            return;
        }

        const response = parseCommand(input, {
            position: gameState.position,
            grid: grid.rooms,
            gameState,
            actions: {
                movePlayer,
                addToInventory,
                removeFromInventory,
                updateEnergy,
                updatePhoneCharge
            }
        });
        
        response.split('\n').forEach(line => addToLog(line));
    };

    return (
        <section className="space-y-4">
            {/* Game Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-4 bg-card rounded-lg border shadow-sm">
                    <div>
                        <span className="text-sm">Energy:</span>
                        <div className="w-32 h-2 bg-muted rounded-full mt-1">
                            <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(gameState.energy / gameState.maxEnergy) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div>
                        <span className="text-sm">Phone:</span>
                        <div className="w-32 h-2 bg-muted rounded-full mt-1">
                            <div 
                                className={`h-full rounded-full ${
                                    gameState.phoneCharge < 20 ? 'bg-red-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${gameState.phoneCharge}%` }}
                            />
                        </div>
                    </div>
                    <div>
                        <span className="text-sm">Time:</span>
                        <div className="text-lg font-mono">
                            {Math.floor(gameState.timeOfDay)}:
                            {(gameState.timeOfDay % 1 * 60).toString().padStart(2, '0')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Game Terminal */}
            <Terminal 
                gameLog={gameLog}
                onCommand={handleCommand}
                availableCommands={AVAILABLE_COMMANDS}
            />
        </section>
    );
};