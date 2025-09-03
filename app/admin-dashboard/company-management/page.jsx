
import EmployerManagement from '@/components/dashboard-pages/admin-dashboard/employer-Management';

export const metadata = {
  title: "Company Management | Admin Dashboard",
  description: "Quản lý công ty hệ thống",
};

export const dynamic = "force-dynamic";

const index = () => {
  return <EmployerManagement />;
};

export default index;