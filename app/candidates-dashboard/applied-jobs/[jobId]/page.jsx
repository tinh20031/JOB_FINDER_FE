import dynamic from "next/dynamic";
import AppliedListByJob from "@/components/dashboard-pages/candidates-dashboard/applied-jobs/components/AppliedListByJob";

const Page = () => <AppliedListByJob />;

export default dynamic(() => Promise.resolve(Page), { ssr: false }); 