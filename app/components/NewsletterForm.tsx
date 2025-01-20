'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot field
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
    // Honeypot check
    if (website) {
      // Silently reject bot submissions
      setEmail('');
      return;
    }

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to subscribe');
      }

      toast.success('Thanks for subscribing!');
      setEmail('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to subscribe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="border-t pt-16 pb-8">
      <div className="max-w-xl mx-auto text-center">
        <div className="bg-muted/50 rounded-lg px-6 py-8 sm:px-8">
          <h2 className="text-2xl font-serif mb-4">Stay Informed</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Subscribe to receive thoughtful insights on technology and development,
            delivered directly to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            {/* Honeypot field - hidden from real users */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-md border bg-background px-4 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              aria-label="Email address"
            />
            <Button
              type="submit"
              size="sm"
              className="font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            By subscribing, you agree to receive occasional updates. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}