import dynamic from "next/dynamic";
import AppliedListByJob from "@/components/dashboard-pages/candidates-dashboard/applied-jobs/components/AppliedListByJob";
export const metadata = {
    title: "Applied List",
    description: "Appled List",
  };
const Page = () => <AppliedListByJob />;

export default dynamic(() => Promise.resolve(Page), { ssr: false }); 