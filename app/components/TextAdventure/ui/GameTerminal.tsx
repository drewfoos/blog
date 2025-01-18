import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface TerminalProps {
    onCommand: (command: string) => void;
    gameLog: string[];
    availableCommands: string[];
}

export const Terminal: React.FC<TerminalProps> = ({ 
    onCommand, 
    gameLog,
    availableCommands 
}) => {
    const [input, setInput] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [gameLog]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'Tab':
                e.preventDefault();
                handleTabComplete();
                break;
            case 'ArrowUp':
                e.preventDefault();
                navigateHistory(1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                navigateHistory(-1);
                break;
            case 'Enter':
                handleSubmit();
                break;
        }
    };

    const handleTabComplete = () => {
        const words = input.split(' ');
        const currentWord = words[words.length - 1].toLowerCase();
        
        const matches = availableCommands.filter(cmd => 
            cmd.toLowerCase().startsWith(currentWord)
        );

        if (matches.length === 1) {
            words[words.length - 1] = matches[0];
            setInput(words.join(' '));
            setSuggestions([]);
            setShowSuggestions(false);
        } else if (matches.length > 1) {
            setSuggestions(matches);
            setShowSuggestions(true);
        }
    };

    const navigateHistory = (direction: number) => {
        const newIndex = historyIndex + direction;
        if (newIndex >= -1 && newIndex < commandHistory.length) {
            setHistoryIndex(newIndex);
            if (newIndex === -1) {
                setInput('');
            } else {
                setInput(commandHistory[newIndex]);
            }
        }
    };

    const handleSubmit = () => {
        if (!input.trim()) return;
        
        onCommand(input);
        setCommandHistory(prev => [input, ...prev]);
        setInput('');
        setHistoryIndex(-1);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow">
            <div className="font-mono p-4 min-h-[400px] flex flex-col relative">
                {/* Game Status Bar */}
                <div className="border-b mb-4 pb-2 text-sm text-muted-foreground">
                    <span className="mr-4">📱 Phone: 12%</span>
                    <span className="mr-4">⚡ Energy: 85%</span>
                    <span>🕒 Time: 23:45</span>
                </div>

                {/* Terminal Output */}
                <div 
                    ref={terminalRef}
                    className="flex-1 overflow-y-auto space-y-1 mb-4 text-sm"
                >
                    {gameLog.map((log, index) => (
                        <div 
                            key={index} 
                            className={cn(
                                "whitespace-pre-wrap",
                                log.startsWith('>') ? "text-primary font-medium" : ""
                            )}
                        >
                            {log}
                        </div>
                    ))}
                </div>

                {/* Command Input */}
                <div className="relative border-t pt-2">
                    <div className="flex items-center">
                        <span className="text-primary mr-2">{'>'}</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                setShowSuggestions(false);
                            }}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent outline-none border-none font-mono text-sm"
                            placeholder="What would you like to do? (Type 'help' for commands)"
                            autoFocus
                        />
                    </div>

                    {/* Tab Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute bottom-full left-0 mb-2 bg-popover border rounded-md p-2 shadow-md">
                            <div className="text-sm text-muted-foreground">
                                Available commands:
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {suggestions.map((suggestion, index) => (
                                    <span 
                                        key={index}
                                        className="text-primary text-sm"
                                    >
                                        {suggestion}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};