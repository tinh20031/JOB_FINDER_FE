import dynamic from "next/dynamic";
import ShortlistedResumes from "@/components/dashboard-pages/employers-dashboard/shortlisted-resumes";

export const metadata = {
  title: "All jobs Candidate applied",
  description: "All jobs Candidate applied",
};

const index = () => {
  return (
    <>
      <ShortlistedResumes />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
