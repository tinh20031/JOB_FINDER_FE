export const metadata = {
  title: "All Applicants for Job",
  description: "List of all applicants for a specific job",
};

import { Suspense } from 'react';
import AllApplicationsByJob from '@/components/dashboard-pages/employers-dashboard/all-applications-by-job';

export default function Page() {
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllApplicationsByJob />
    </Suspense>
  );
} 