import { Suspense } from 'react';
import LogSymptomsClient from './LogSymptomsClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>}>
      <LogSymptomsClient />
    </Suspense>
  );
}
