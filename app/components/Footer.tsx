'use client';

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function Footer() {
  const [copied, setCopied] = useState(false);
  const email = "dryfoosa@gmail.com";

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* About Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">About Andrew's Blog</h3>
            <p className="text-sm text-muted-foreground">
              Sharing insights and experiences in technology, development, and digital innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="/articles" className="hover:text-primary transition-colors">Articles</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Connect</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button
                  onClick={handleCopyEmail}
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  Email
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </li>
              <li>
                <a 
                  target="_blank" 
                  href="https://github.com/drewfoos" 
                  className="hover:text-primary transition-colors"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  target="_blank" 
                  href="https://www.linkedin.com/in/andrew-dryfoos" 
                  className="hover:text-primary transition-colors"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Andrew's Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}