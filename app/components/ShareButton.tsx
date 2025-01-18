'use client';

import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareButton({ title }: { title: string }) {
  const handleShare = async () => {
    if (navigator.share) {
      // Use native share functionality
      navigator
        .share({
          title: title,
          url: window.location.href,
        })
        .catch(() => {
          toast.error("Sharing canceled.");
        });
    } else {
      // Fallback to clipboard sharing
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!", {
          description: "You can now share it anywhere.",
        });
      } catch (error) {
        console.error("Failed to copy the link: ", error);
        toast.error("Failed to copy the link. Please try again.");
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      aria-label="Share this article"
    >
      <Share2 className="h-4 w-4" />
      Share
    </button>
  );
}
