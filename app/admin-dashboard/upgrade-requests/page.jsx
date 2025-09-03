import { Suspense } from "react";
import UpgradeRequests from "@/components/dashboard-pages/admin-dashboard/upgrade-requests";

export const metadata = {
  title: "Upgrade Requests | Admin Dashboard",
  description: "Manage candidate to company upgrade requests",
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpgradeRequests />
    </Suspense>
  );
}



