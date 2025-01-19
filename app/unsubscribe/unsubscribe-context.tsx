// app/unsubscribe/unsubscribe-content.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function UnsubscribeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
 
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (email && token) {
      handleUnsubscribe();
    }
  }, [email, token]);

  async function handleUnsubscribe() {
    if (!email || !token) return;
   
    setStatus('loading');
   
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
      });
     
      const data = await response.json();
     
      if (response.ok) {
        setStatus('success');
        setMessage('You have been successfully unsubscribed from our newsletter.');
      } else {
        setStatus('error');
        setMessage(data.message || 'An error occurred while unsubscribing.');
      }
    } catch {
      setStatus('error');
      setMessage('An error occurred while processing your request.');
    }
  }

  if (!email || !token) {
    return (
      <div className="max-w-xl mx-auto p-6 mt-10">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            This page can only be accessed through a valid unsubscribe link sent to your email.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition duration-200"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 mt-10">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Newsletter Unsubscribe</h1>
       
        {status === 'loading' && (
          <div className="text-gray-600">
            <p>Processing your unsubscribe request...</p>
          </div>
        )}
       
        {status === 'success' && (
          <div className="text-green-600">
            <p>{message}</p>
            <p className="mt-4 text-sm">
              Changed your mind? You can always resubscribe from our blog homepage.
            </p>
          </div>
        )}
       
        {status === 'error' && (
          <div className="text-red-600">
            <p>{message}</p>
            <p className="mt-4 text-sm">
              If you continue to have issues, please contact us.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}