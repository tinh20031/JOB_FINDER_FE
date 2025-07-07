import JobPostManagement from '@/components/dashboard-pages/admin-dashboard/job-post-management';

export const metadata = {
  title: "Job Post Management | Admin Dashboard",
  description: "Quản lý bài đăng hệ thống",
};

const index = () => {
  return <JobPostManagement />;
};

export default index;