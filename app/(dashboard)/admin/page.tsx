import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { AdminView } from "@/components/admin/admin-view";

export const metadata: Metadata = {
  title: "Admin Portal | GlucoCare",
  description: "System administration and user rights governance portal.",
};

export default async function AdminPage() {
  const user = await getSessionUser();

  if (!isAdmin(user)) {
    redirect("/dashboard");
  }

  return <AdminView />;
}

