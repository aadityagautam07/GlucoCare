import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ProfileView } from "@/components/profile/profile-view";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return <ProfileView user={user} />;
}

