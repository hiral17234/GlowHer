"use client";

import { Suspense } from 'react';
import LogSymptomsClient from './LogSymptomsClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-8">Loading symptoms form...</div>}>
      <LogSymptomsClient />
    </Suspense>
  );
}
