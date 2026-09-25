import { redirect } from "next/navigation";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ? `token=${encodeURIComponent(params.token)}` : "";
  const email = params.email ? `email=${encodeURIComponent(params.email)}` : "";
  const query = [token, email].filter(Boolean).join("&");

  redirect(`/forgot-password${query ? `?${query}` : ""}`);
}

