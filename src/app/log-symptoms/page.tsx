
import { Suspense } from 'react';
import LogSymptomsClient from './LogSymptomsClient';

function LogSymptomsPage() {
  return <LogSymptomsClient />;
}

export default function Page() {
  return (
    <Suspense>
      <LogSymptomsPage />
    </Suspense>
  );
}
