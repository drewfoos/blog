import { GameState, GridRoom, Position } from './types';
import { ITEMS, OBSTACLES } from './gameItems';

interface ParseOptions {
    position: Position;
    grid: Record<string, GridRoom>;
    gameState: GameState;
    actions: {
        movePlayer: (direction: 'north' | 'south' | 'east' | 'west') => void;
        addToInventory: (item: string) => void;
        removeFromInventory: (item: string) => void;
        updateEnergy: (amount: number) => void;
        updatePhoneCharge: (amount: number) => void;
    };
}

const LEAGUE_COMPLAINTS = [
    "These bushes are useless for ganking...",
    "No jungle camps to farm out here.",
    "Can't even ward these bushes.",
    "If only I could recall back to base right now.",
    "This grass touching debuff is really annoying.",
    "Seriously need some movement speed buffs.",
    "Zero CS in the last 20 minutes...",
    "The client would probably run better out here.",
    "Even Yuumi would be more useful than me in this forest.",
    "Wish I could FF this camping trip.",
    "Their jungler (the bear) is definitely camping my lane."
];

const getRandomComplaint = () => {
    return LEAGUE_COMPLAINTS[Math.floor(Math.random() * LEAGUE_COMPLAINTS.length)];
};

export const parseCommand = (input: string, options: ParseOptions): string => {
    const words = input.toLowerCase().trim().split(" ");
    let command = words[0];
    let arg = words.slice(1).join(" ");

    // Handle 'go' commands
    if (command === 'go') {
        return handleMovement(arg, options);
    }

    // Direct movement commands
    const directions = ['north', 'south', 'east', 'west', 'n', 's', 'e', 'w'];
    if (directions.includes(command)) {
        return handleMovement(command, options);
    }

    switch (command) {
        case 'help':
            return showHelp();
        case 'look':
        case 'l':
            return look(options);
        case 'take':
        case 'get':
            return take(arg, options);
        case 'use':
            return use(arg, options);
        case 'examine':
        case 'x':
            return examine(arg, options);
        case 'inventory':
        case 'i':
            return showInventory(options);
        case 'status':
            return showStatus(options);
        case 'complain':
            return getRandomComplaint();
        default:
            return "What are you trying to do? Type 'help' for commands. If only this was as easy as pressing QWER...";
    }
};

const handleMovement = (direction: string, options: ParseOptions): string => {
    const directionMap: Record<string, 'north' | 'south' | 'east' | 'west'> = {
        'n': 'north',
        'north': 'north',
        's': 'south',
        'south': 'south',
        'e': 'east',
        'east': 'east',
        'w': 'west',
        'west': 'west'
    };

    const normalizedDirection = direction.toLowerCase();
    if (!(normalizedDirection in directionMap)) {
        return "Go where? Try 'go north', 'go south', 'go east', or 'go west'.";
    }

    return move(directionMap[normalizedDirection], options);
};

const showHelp = (): string => {
    return `Available Commands:
- go [direction]: Move around (go north, go south, etc.). No flash available.
- look (l): Look around. Less effective than actual wards.
- take/get [item]: Pick up something. Like CS, but IRL.
- use [item]: Use an item. More complicated than pressing 1-6.
- examine (x) [thing]: Look at something closely. Like checking death recap.
- inventory (i): Check what you're carrying. Your actual items, not shop items.
- status: Check your vitals. Worse UI than League.
- complain: Voice your gamer frustrations.
- help: Show this help message.

Pro tip: If only you could buy Control Wards IRL...`;
};

const look = (options: ParseOptions): string => {
    const { position, grid } = options;
    const room = grid[`${position.x},${position.y}`];
    
    let description = `${room.description}\n`;

    // Add available directions
    description += "\nPossible paths (no flash available):";
    if (position.y > 0) description += "\n- North";
    if (position.y < 15) description += "\n- South";
    if (position.x > 0) description += "\n- West";
    if (position.x < 15) description += "\n- East";

    // Items in room
    if (room.items.length > 0) {
        description += "\n\nYou can see:";
        room.items.forEach(item => {
            const itemData = ITEMS[item];
            description += `\n- ${itemData ? itemData.name : item}`;
        });
    }

    // Add a random League complaint
    if (Math.random() < 0.3) { // 30% chance
        description += `\n\n${getRandomComplaint()}`;
    }

    return description;
};

const move = (direction: 'north' | 'south' | 'east' | 'west', options: ParseOptions): string => {
    const { position, gameState, actions } = options;
    
    if (gameState.energy < 10) {
        return "You're too tired to move. Need healing, but no support in sight...";
    }

    const oldPosition = { ...position };
    actions.movePlayer(direction);
    
    // Get updated room description after movement
    return look(options);
};

const take = (item: string, options: ParseOptions): string => {
    const { position, grid, actions } = options;
    const room = grid[`${position.x},${position.y}`];
    
    if (!item) {
        return "Take what? This isn't auto-attack...";
    }

    if (room.items.includes(item)) {
        actions.addToInventory(item);
        // Remove item from room
        room.items = room.items.filter(i => i !== item);
        const itemData = ITEMS[item];
        return `You pick up ${itemData.name}. ${itemData.description}`;
    }

    return "You don't see that here. Missing CS IRL too...";
};

const use = (item: string, options: ParseOptions): string => {
    const { gameState, actions } = options;
    
    if (!item) {
        return "Use what? You need to specify, just like pinging items in League.";
    }

    if (!gameState.inventory.includes(item)) {
        return "You don't have that item. Check your inventory first, noob.";
    }

    const itemData = ITEMS[item];
    switch (item) {
        case 'energy_drink':
            actions.updateEnergy(30);
            actions.removeFromInventory(item);
            return "The energy drink restores your power! Almost as good as blue buff.";
        
        case 'portable_charger':
            if (gameState.inventory.includes('phone')) {
                actions.updatePhoneCharge(50);
                return "You charge your phone. Technology beats magic every time!";
            }
            return "You need your phone to use this. Obviously.";

        case 'granola_bar':
            actions.updateEnergy(15);
            actions.removeFromInventory(item);
            return "You eat the granola bar. Not as satisfying as gaming snacks...";

        default:
            return itemData.use;
    }
};

const examine = (target: string, options: ParseOptions): string => {
    const { position, grid, gameState } = options;
    const room = grid[`${position.x},${position.y}`];
    
    if (!target) {
        return "Examine what? Be specific, like reading ability tooltips!";
    }

    if (target === "surroundings" || target === "around") {
        return `${room.examine.surroundings}\n${getRandomComplaint()}`;
    }

    if (room.examine[target]) {
        return room.examine[target];
    }

    if (gameState.inventory.includes(target)) {
        const itemData = ITEMS[target];
        return itemData.description;
    }

    return "You don't see that here. Your map awareness needs work.";
};

const showInventory = (options: ParseOptions): string => {
    const { gameState } = options;
    
    if (gameState.inventory.length === 0) {
        return "Your inventory is empty. Worse than 0/10/0...";
    }

    let output = "You're carrying:\n";
    gameState.inventory.forEach(item => {
        const itemData = ITEMS[item];
        output += `- ${itemData.name}\n`;
    });
    return output;
};

const showStatus = (options: ParseOptions): string => {
    const { gameState } = options;
    
    return `Status Report:
Energy: ${gameState.energy}/${gameState.maxEnergy} (no mana though)
Phone: ${gameState.phoneCharge}% (worse than energy problems in ARAM)
Time: ${Math.floor(gameState.timeOfDay)}:${(gameState.timeOfDay % 1 * 60).toString().padStart(2, '0')}
Moves Made: ${gameState.moves} (still better KDA than my ranked games)
${getRandomComplaint()}`;
};