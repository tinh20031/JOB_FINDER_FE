import dynamic from "next/dynamic";
import AllApplicants from "@/components/dashboard-pages/employers-dashboard/all-applicants";

export const metadata = {
  title: "All Applicants",
  description: "All Applicants",
};

const index = () => {
  return (
    <>
      <AllApplicants showMatchingInfo={false} />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
