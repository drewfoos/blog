'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, CheckCheck } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  value: {
    code: string;
    language?: string;
    filename?: string;
  }
}

export default function CodeBlock({ value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  if (!value?.code) {
    return null;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-8 group">
      <div className="absolute right-0 top-0 flex items-center space-x-2 p-2 z-10">
        {value.filename && (
          <div className="bg-muted/90 px-4 py-2 text-sm rounded-bl-lg">
            {value.filename}
          </div>
        )}
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-muted/90 hover:bg-muted transition-colors"
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <CheckCheck className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={value.language || 'typescript'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          padding: '2rem 1rem 1rem 1rem', // Extra padding at top for copy button
        }}
      >
        {value.code}
      </SyntaxHighlighter>
    </div>
  );
}