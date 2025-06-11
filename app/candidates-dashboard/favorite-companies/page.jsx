import dynamic from "next/dynamic";
import FavoriteCompanies from "@/components/dashboard-pages/candidates-dashboard/favorite-companies";

export const metadata = {
  title: "Favorite Companies || Superio - Job Borad React NextJS Template",
  description: "Superio - Job Borad React NextJS Template",
};

const index = () => {
  return (
    <>
      <FavoriteCompanies />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false }); 