import dynamic from "next/dynamic";
import AllApplicants from "@/components/dashboard-pages/employers-dashboard/all-applicants";

export const metadata = {
  title: "All Applicants Matching",
  description: "All Applicants with Matching Info",
};

const index = () => {
  return (
    <>
      <AllApplicants showMatchingInfo={true} useMatchingApi={true} />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false }); 