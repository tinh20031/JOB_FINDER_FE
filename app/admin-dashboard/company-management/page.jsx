import EmployerManagement from '@/components/dashboard-pages/admin-dashboard/employer-Management';

export const metadata = {
  title: "Company Management | Admin Dashboard",
  description: "Quản lý công ty hệ thống",
};

const index = () => {
  return <EmployerManagement />;
};

export default index;