import { Suspense } from "react";
import UserManager from "@/components/dashboard-pages/admin-dashboard/user-manager";

export const metadata = {
  title: "User Manager | Admin Dashboard",
  description: "System user management",
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserManager />
    </Suspense>
  );
}
