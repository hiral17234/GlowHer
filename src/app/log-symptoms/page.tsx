
import { Suspense } from 'react';
import LogSymptomsClient from './LogSymptomsClient';

export default function Page() {
  return (
    <Suspense>
      <LogSymptomsClient />
    </Suspense>
  );
}
