// app/unsubscribe/page.tsx
import { Suspense } from 'react';
import UnsubscribeContent from './unsubscribe-context';

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<UnsubscribeLoading />}>
      <UnsubscribeContent />
    </Suspense>
  );
}

function UnsubscribeLoading() {
  return (
    <div className="max-w-xl mx-auto p-6 mt-10">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    </div>
  );
}