"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HeartPulse,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  ExternalLink,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlToken = searchParams.get("token") || "";
  const urlEmail = searchParams.get("email") || "";

  const [activeTab, setActiveTab] = React.useState<"email" | "code">(
    urlToken ? "code" : "email"
  );

  // Email form state
  const [email, setEmail] = React.useState(urlEmail);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);
  const [emailSentData, setEmailSentData] = React.useState<{
    sent: boolean;
    previewUrl?: string;
    code?: string;
  } | null>(null);

  // Reset password form state
  const [resetEmail, setResetEmail] = React.useState(urlEmail);
  const [token, setToken] = React.useState(urlToken);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const [resetSuccess, setResetSuccess] = React.useState(false);

  React.useEffect(() => {
    if (urlToken) {
      setToken(urlToken);
      setActiveTab("code");
    }
    if (urlEmail) {
      setEmail(urlEmail);
      setResetEmail(urlEmail);
    }
  }, [urlToken, urlEmail]);

  // Handler for sending SMTP reset email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSendingEmail(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setEmailSentData({
        sent: true,
        previewUrl: data.previewUrl,
        code: data.verificationCode,
      });
      setResetEmail(trimmed);
      if (data.verificationCode) {
        setToken(data.verificationCode);
      }

      toast.success("Reset email dispatched!", {
        description: `Check the inbox for ${trimmed}.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email";
      toast.error(msg);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Handler for submitting new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsResetting(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail.trim().toLowerCase(),
          newPassword,
          token: token.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setResetSuccess(true);
      toast.success("Password reset successfully!", {
        description: data.message,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to reset password";
      toast.error(msg);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-700 to-teal-600 text-white flex items-center justify-center shadow-md">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Gluco<span className="text-teal-600 dark:text-teal-400">Care</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Account recovery & secure password reset
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex rounded-xl bg-slate-200/70 dark:bg-slate-800/70 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "email"
                ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Send Reset Email</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "code"
                ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Enter Code & Reset</span>
          </button>
        </div>

        {/* TAB 1: SEND RESET EMAIL VIA SMTP */}
        {activeTab === "email" && (
          <Card className="shadow-md border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Reset via Email</CardTitle>
              <CardDescription className="text-xs">
                Enter your registered email address. We will dispatch a secure reset link and verification code via SMTP.
              </CardDescription>
            </CardHeader>

            {emailSentData?.sent ? (
              <CardContent className="space-y-4 text-center py-6">
                <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Email Successfully Dispatched
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  We sent password reset instructions to <strong>{email}</strong>. Please check your inbox and spam folder.
                </p>

                {emailSentData.code && (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-xs mx-auto">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Verification Code
                    </span>
                    <span className="text-2xl font-mono font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
                      {emailSentData.code}
                    </span>
                  </div>
                )}

                {emailSentData.previewUrl && (
                  <div className="pt-2">
                    <a
                      href={emailSentData.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>View Test Email Preview (Ethereal)</span>
                    </a>
                  </div>
                )}

                <div className="pt-4 flex flex-col gap-2">
                  <Button
                    onClick={() => setActiveTab("code")}
                    className="w-full shadow-sm"
                  >
                    <span>Proceed to Enter Code & Set New Password</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEmailSentData(null)}
                    className="text-xs text-slate-500"
                  >
                    Send to a different email
                  </Button>
                </div>
              </CardContent>
            ) : (
              <form onSubmit={handleSendEmail}>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="send-email">Registered Email Address</Label>
                    <div className="relative">
                      <Input
                        id="send-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    className="w-full shadow-sm"
                    disabled={isSendingEmail}
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSendingEmail ? "Sending Email..." : "Send Reset Email"}</span>
                  </Button>
                  <Link
                    href="/login"
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 inline-flex items-center gap-1 font-medium transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Back to Sign In</span>
                  </Link>
                </CardFooter>
              </form>
            )}
          </Card>
        )}

        {/* TAB 2: ENTER CODE & SET NEW PASSWORD */}
        {activeTab === "code" && (
          <Card className="shadow-md border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Set New Password</CardTitle>
              <CardDescription className="text-xs">
                Enter your email, the verification code received via email, and your new password.
              </CardDescription>
            </CardHeader>

            {resetSuccess ? (
              <CardContent className="space-y-4 text-center py-6">
                <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Password Successfully Updated
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Your new password is now active. You can proceed to sign in to GlucoCare.
                </p>
                <div className="pt-3">
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full shadow-sm"
                  >
                    <span>Proceed to Sign In</span>
                  </Button>
                </div>
              </CardContent>
            ) : (
              <form onSubmit={handleResetPassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reset-email">Account Email</Label>
                    <div className="relative">
                      <Input
                        id="reset-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="token">Verification Code / Token</Label>
                    <div className="relative">
                      <Input
                        id="token"
                        type="text"
                        placeholder="e.g. 123456"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="pl-10 font-mono"
                      />
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="new-pass">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-pass"
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-pass">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-pass"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    className="w-full shadow-sm"
                    disabled={isResetting}
                  >
                    <span>{isResetting ? "Updating Password..." : "Update Password"}</span>
                  </Button>
                  <Link
                    href="/login"
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 inline-flex items-center gap-1 font-medium transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Back to Sign In</span>
                  </Link>
                </CardFooter>
              </form>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </React.Suspense>
  );
}
