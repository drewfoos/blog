import { GameGrid, GridRoom, Position, RoomType, GameEvent } from './types';
import { OBSTACLES } from './gameItems';

const getRoomDescription = (type: RoomType): string => {
    const descriptions: Record<RoomType, string[]> = {
        campsite: [
            "The dreaded campsite where you were forced to 'touch grass'. Your gaming chair feels so far away...",
            "Tents and a dying campfire. Everyone's asleep - the perfect time to escape this outdoors nightmare."
        ],
        forest: [
            "Trees. More trees. These bushes are nothing like the ones in League - can't even hide in them.",
            "Woodland surrounds you. No tactical advantage like in Summoner's Rift.",
            "More forest. At least jungle camps drop gold and buffs... this is just leaves."
        ],
        dense_forest: [
            "The trees are so thick here you can barely move. Makes Maokai's ultimate look welcoming.",
            "You push through thick vegetation. At least Teemo's mushrooms aren't hiding here.",
            "Dense forest blocks your path. Ivern would love it here, you absolutely don't."
        ],
        clearing: [
            "An open area provides some relief from the endless trees. Still no wifi though.",
            "A clear space in the forest. Perfect for a teamfight, except you're alone. And outside.",
            "A peaceful clearing. The equivalent of a lane without minions."
        ],
        trail: [
            "A dirt path winds through the trees. Not as straightforward as a League lane.",
            "A hiking trail. People actually do this for fun instead of playing ranked?",
            "A beaten path through the wilderness. No towers to mark the way."
        ],
        creek: [
            "A stream of water blocks your path. Your gaming phone cannot get wet! If only you could Zac jump across.",
            "Running water creates an obstacle. No blue buff to collect here.",
            "A creek babbles mockingly at you. Even river scuttler would be better than this."
        ],
        ranger_post: [
            "A ranger station. Must avoid detection - you're trying to go HOME! Time to channel your inner Evelynn.",
            "A small outpost for park rangers. Stealth section activated, but no Duskblade to help you.",
            "The ranger's post. Getting caught here would be worse than a failed gank."
        ],
        parking_lot: [
            "Finally! Civilization! Various cars are parked here. Each one a potential escape route to your gaming setup.",
            "A parking area. The promised land of asphalt and vehicles.",
            "Cars! Real ones, not like Rammus. Each one could lead you back to your PC."
        ],
        cabin: [
            "A rustic cabin. Might have useful items inside, but no gaming peripherals in sight.",
            "A wooden cabin. Not as comfortable as your gaming setup, but might have something useful.",
            "A basic cabin. The anti-gaming station of accommodations."
        ],
        cave: [
            "A dark cave. Could be a good hiding spot... or certain doom. Nocturne would feel right at home.",
            "A cave mouth yawns before you. Darker than your RGB keyboard at night.",
            "A gloomy cave entrance. No respawn timer if something goes wrong in there."
        ],
        bear_area: [
            "Fresh bear tracks and claw marks on trees. Enemy Volibear definitely around here!",
            "Signs of bear activity everywhere. Worse than facing Tibbers.",
            "Bear territory. No Annie to control these ones."
        ],
        road: [
            "A paved road! The way back to civilization... and League of Legends!",
            "An actual road! Your gaming chair and PC are somewhere along this path.",
            "Sweet, sweet pavement. The recall channel back to the real world."
        ]
    };

    return descriptions[type][Math.floor(Math.random() * descriptions[type].length)];
};

const generateEvent = (type: RoomType): GameEvent[] => {
    const events: GameEvent[] = [];
    
    switch(type) {
        case 'bear_area':
            events.push({
                id: 'bear_encounter',
                type: 'encounter',
                description: OBSTACLES.BEAR.description,
                resolved: false,
                requires: OBSTACLES.BEAR.requires
            });
            break;
        case 'ranger_post':
            events.push({
                id: 'ranger_patrol',
                type: 'encounter',
                description: OBSTACLES.RANGER.description,
                resolved: false,
                requires: OBSTACLES.RANGER.requires
            });
            break;
        case 'dense_forest':
            if (Math.random() < 0.3) {
                events.push({
                    id: 'dark_trail',
                    type: 'obstacle',
                    description: OBSTACLES.DARK_TRAIL.description,
                    resolved: false,
                    requires: OBSTACLES.DARK_TRAIL.requires
                });
            }
            break;
        case 'creek':
            events.push({
                id: 'creek_crossing',
                type: 'obstacle',
                description: OBSTACLES.CREEK.description,
                resolved: false,
                requires: OBSTACLES.CREEK.requires
            });
            break;
    }
    
    return events;
};

const getRandomItems = (type: RoomType): string[] => {
    const itemPool: Record<RoomType, string[]> = {
        campsite: ['granola_bar', 'flashlight'],
        forest: ['snacks'],
        dense_forest: ['compass'],
        clearing: ['trail_map'],
        trail: ['ranger_schedule'],
        creek: [],
        ranger_post: ['portable_charger'],
        parking_lot: ['car_keys'],
        cabin: ['energy_drink', 'whistle'],
        cave: [],
        bear_area: [],
        road: []
    };

    if (!itemPool[type]) return [];

    const items = itemPool[type];
    const numItems = Math.floor(Math.random() * 2);  // 0 or 1 items per room
    const selectedItems: string[] = [];
    
    for (let i = 0; i < numItems; i++) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        if (randomItem && !selectedItems.includes(randomItem)) {
            selectedItems.push(randomItem);
        }
    }
    
    return selectedItems;
};

export const generateGrid = (width: number, height: number): GameGrid => {
    const grid: GameGrid = {
        width,
        height,
        rooms: {}
    };

    // Start with all forest
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const type: RoomType = 'forest';
            grid.rooms[`${x},${y}`] = {
                name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
                description: getRoomDescription(type),
                items: getRandomItems(type),
                examine: {
                    surroundings: "You look around the area, desperately seeking civilization.",
                    trees: "Just more trees. Your gaming setup would never betray you like this.",
                },
                type,
                discovered: false
            };
        }
    }

    // Place special locations
    const specialLocations: [number, number, RoomType][] = [
        [Math.floor(width/2), Math.floor(height/2), 'campsite'],  // Start in middle
        [width-2, height-2, 'road'],  // Goal near corner
        [width-3, height-3, 'parking_lot'],  // Near the road
        [1, Math.floor(height/2), 'ranger_post'],
        [Math.floor(width/2), 1, 'creek'],
        [width-2, 1, 'bear_area'],
        [width-4, height-4, 'cabin'],
    ];

    specialLocations.forEach(([x, y, type]) => {
        grid.rooms[`${x},${y}`] = {
            name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
            description: getRoomDescription(type),
            items: getRandomItems(type),
            examine: {
                surroundings: "You look around the area, desperately seeking civilization.",
                signs: "Signs of human presence. Closer to gaming... or danger?",
            },
            type,
            discovered: false,
            events: generateEvent(type)
        };
    });

    return grid;
};