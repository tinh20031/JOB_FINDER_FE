import dynamic from "next/dynamic";
import JobList from "@/components/job-listing-pages/job-list";

export const metadata = {
  title: "Job List",
  description: "Job List",
};

const index = () => {
  return (
    <>
      <JobList />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
