import { getSessionUser } from "@/lib/auth";
import { demoUser } from "@/lib/seed-data";
import { ProfileView } from "@/components/profile/profile-view";

export default async function ProfilePage() {
  const sessionUser = await getSessionUser();
  const user = sessionUser || demoUser;

  return <ProfileView user={user} />;
}

