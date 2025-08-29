import dynamic from "next/dynamic";
import EmployersList from "@/components/employers-listing-pages/company-list";

export const metadata = {
  title: "Companies",
  description: "Job Finder - Companies",
};

const index = () => {
  return (
    <>
      <EmployersList />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
