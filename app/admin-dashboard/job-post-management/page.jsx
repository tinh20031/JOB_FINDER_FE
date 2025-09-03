import JobPostManagement from '@/components/dashboard-pages/admin-dashboard/job-post-management';

export const metadata = {
  title: "Job Post Management | Admin Dashboard",
  description: "Job Post Management",
};

export const dynamic = "force-dynamic";

const index = () => {
  return <JobPostManagement />;
};

export default index;