import dynamic from "next/dynamic";
import UserManager from "@/components/dashboard-pages/admin-dashboard/user-manager";

export const metadata = {
  title: "User Manager | Admin Dashboard",
  description: "Quản lý người dùng hệ thống",
};

const index = () => {
  return <UserManager />;
};

export default dynamic(() => Promise.resolve(index), { ssr: false }); 