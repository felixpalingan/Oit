'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Ticket 14: Route Interceptor & Graceful Redirect to Home
    const timer = setTimeout(() => {
      router.replace('/');
    }, 1200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="w-screen h-screen bg-[#121215] flex flex-col items-center justify-center text-white select-none">
      <div className="w-12 h-12 rounded-full border-4 border-[#FF5C00] border-t-transparent animate-spin mb-4" />
      <h3 className="text-sm font-extrabold text-white">Redirecting to Oit...</h3>
      <p className="text-xs text-zinc-500 mt-1">The channel or room you are looking for is unavailable.</p>
    </div>
  );
}
