import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser, isDoctorOrAdmin } from "@/lib/auth";
import { AdminView } from "@/components/admin/admin-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Clinical & Admin Portal | GlucoCare",
  description: "System administration and patient clinical records portal.",
};

export default async function AdminPage() {
  const user = await getSessionUser();

  if (!isDoctorOrAdmin(user)) {
    redirect("/dashboard");
  }

  return <AdminView currentUser={user} />;
}
