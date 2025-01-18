"use client"

import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
   
    const navItems = [
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" }
    ];

    return (
        <div className="fixed top-0 left-0 right-0 z-50">
            <nav className="w-full bg-background/80 backdrop-blur-sm border-b">
                <div className="max-w-[1200px] mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="font-bold text-3xl">
                            Andrew<span className="text-primary">Blog</span>
                        </Link>
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-sm font-medium transition-colors hover:text-primary"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <ModeToggle />
                        </div>
                        {/* Mobile Navigation */}
                        <div className="md:hidden flex items-center gap-4">
                            <ModeToggle />
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="h-10 w-10 flex items-center justify-center hover:bg-accent rounded-md"
                            >
                                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="border-b md:hidden">
                        <div className="max-w-[1200px] mx-auto px-4">
                            <div className="flex flex-col space-y-4 py-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="text-sm font-medium transition-colors hover:text-primary"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
}