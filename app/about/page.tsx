"use client";

import { 
    Gamepad2, 
    Monitor, 
    Code, 
    Keyboard, 
    Mouse,
    Sword,
    Trophy,
    Github,
    Linkedin
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-16 py-12">
            {/* Hero Section */}
            <section className="text-center space-y-6">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text">
                    Hey, I&apos;m Andrew 👋
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Developer by day, competitive gamer by night. 
                    I bring the same strategic mindset from chess and esports to building great software.
                </p>
                <div className="flex justify-center gap-4 pt-4">
                    <a href="https://github.com/drewfoos" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="lg" className="space-x-2">
                            <Github className="h-5 w-5" />
                            <span>GitHub</span>
                        </Button>
                    </a>
                    <a href="https://www.linkedin.com/in/andrew-dryfoos" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="lg" className="space-x-2">
                            <Linkedin className="h-5 w-5" />
                            <span>LinkedIn</span>
                        </Button>
                    </a>
                </div>
            </section>

            {/* Developer Section */}
            <section className="space-y-8">
                <div className="flex items-center gap-3">
                    <Code className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-semibold">Developer</h2>
                </div>
                <div className="bg-card rounded-lg p-6 border shadow-sm">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        I specialize in building efficient, user-friendly web applications. 
                        Check out my projects and work at{" "}
                        <a 
                            href="https://andrewdryfoos.dev" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium"
                        >
                            andrewdryfoos.dev
                        </a>
                    </p>
                </div>
            </section>

            {/* Gaming Section */}
            <section className="space-y-8">
                <div className="flex items-center gap-3">
                    <Gamepad2 className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-semibold">Gamer</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-lg p-6 border shadow-sm space-y-4">
                        <h3 className="text-xl font-semibold">Competitive Background</h3>
                        <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Trophy className="h-4 w-4 flex-shrink-0" />
                                <span>Former collegiate R6 Siege & LoL player</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Gamepad2 className="h-4 w-4 flex-shrink-0" />
                                <span>Active League of Legends & TFT player (drewfoos#1471)</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Sword className="h-4 w-4 flex-shrink-0" />
                                <span>Tournament-rated chess player</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-card rounded-lg p-6 border shadow-sm space-y-4">
                        <h3 className="text-xl font-semibold">Setup</h3>
                        <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Keyboard className="h-4 w-4 flex-shrink-0" />
                                <span>Keyboard: Zoom75</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mouse className="h-4 w-4 flex-shrink-0" />
                                <span>Mouse: Razer Basilisk Pro 35K</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Monitor className="h-4 w-4 flex-shrink-0" />
                                <span>Mousepad: Artisan</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Other Interests */}
            <section className="space-y-8">
                <div className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-semibold">Other Interests</h2>
                </div>
                <div className="bg-card rounded-lg p-6 border shadow-sm">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">College Basketball & Chess</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Beyond tech and gaming, I&apos;m passionate about college basketball and chess. 
                            These interests contribute to my strategic approach in both gaming and development, 
                            where pattern recognition and tactical thinking are key.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
