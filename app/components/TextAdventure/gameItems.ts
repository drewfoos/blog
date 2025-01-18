interface GameItem {
    name: string;
    description: string;
    use: string;
}

export const ITEMS: Record<string, GameItem> = {
    phone: {
        name: "Gaming Phone",
        description: "Your precious phone. 12% battery left. No signal here though...",
        use: "Maybe you can find a spot with better reception..."
    },
    portable_charger: {
        name: "Portable Charger",
        description: "A portable battery pack. Could charge your phone if needed.",
        use: "Use this to charge your phone."
    },
    trail_map: {
        name: "Trail Map",
        description: "A somewhat useful map of the camping grounds. If only you were better at reading maps...",
        use: "Study the map to better understand your surroundings."
    },
    compass: {
        name: "Compass",
        description: "An old compass. Not as good as GPS, but it'll have to do.",
        use: "Use this to maintain your direction."
    },
    granola_bar: {
        name: "Granola Bar",
        description: "Not as good as gaming snacks, but it'll give you energy.",
        use: "Eat to recover some energy."
    },
    energy_drink: {
        name: "Energy Drink",
        description: "You snuck this in! Perfect for gaming... or escaping.",
        use: "Drink to get a significant energy boost."
    },
    flashlight: {
        name: "Flashlight",
        description: "Better than your phone's flashlight. Helps you see in dark areas.",
        use: "Use to navigate in dark areas."
    },
    car_keys: {
        name: "Car Keys",
        description: "Keys to someone's car in the parking lot. Freedom awaits!",
        use: "Use these at the parking lot..."
    },
    ranger_schedule: {
        name: "Ranger Schedule",
        description: "A schedule showing ranger patrol times. Very useful for sneaking around!",
        use: "Study this to avoid ranger encounters."
    },
    whistle: {
        name: "Emergency Whistle",
        description: "Could be useful for distracting people... or attracting unwanted attention.",
        use: "Blow the whistle to create a distraction."
    },
    snacks: {
        name: "Trail Mix",
        description: "Could be used to distract wildlife... or restore energy.",
        use: "Use as distraction or eat for energy."
    }
} as const;

interface Obstacle {
    description: string;
    requires: string[];
    success: string;
    failure: string;
}

export const OBSTACLES: Record<string, Obstacle> = {
    BEAR: {
        description: "A bear is blocking your path! Maybe you can distract it...",
        requires: ["snacks"],
        success: "You throw the snacks away from the path. The bear happily wobbles away to eat them.",
        failure: "The bear looks hungry... better find something to distract it with!"
    },
    RANGER: {
        description: "A park ranger is patrolling the area! Need to time this carefully...",
        requires: ["ranger_schedule"],
        success: "Using the ranger schedule, you time your movement perfectly between patrols.",
        failure: "Better find a way to know the ranger's schedule..."
    },
    DARK_TRAIL: {
        description: "This trail is too dark to navigate safely...",
        requires: ["flashlight"],
        success: "With the flashlight, you can safely navigate the dark trail.",
        failure: "You need some source of light to proceed safely."
    },
    CREEK: {
        description: "A creek blocks your path. The water isn't deep, but your gaming phone can't get wet!",
        requires: ["trail_map"],
        success: "The trail map shows a small bridge nearby. You cross safely!",
        failure: "There must be a safer way to cross..."
    }
} as const;