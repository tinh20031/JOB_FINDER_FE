import dynamic from "next/dynamic";
import RevenueStatisticsDashboard from "@/components/dashboard-pages/admin-dashboard/revenue-statistics";

export const metadata = {
  title: "Revenue Statistics - Admin Dashboard",
  description: "Revenue Statistics Dashboard for Admin",
};

const RevenueStatisticsPage = () => {
  return (
    <>
      <RevenueStatisticsDashboard />
    </>
  );
};

export default dynamic(() => Promise.resolve(RevenueStatisticsPage), { ssr: false }); 