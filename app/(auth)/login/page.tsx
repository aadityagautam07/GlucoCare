"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartPulse, Sparkles, Lock, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDemoLoading, setIsDemoLoading] = React.useState(false);
  const [isAdminDemoLoading, setIsAdminDemoLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast.success("Welcome back!", {
        description: `Signed in as ${data.user.name}`,
      });
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid email or password";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setIsDemoLoading(true);
      const res = await fetch("/api/auth/demo", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in as demo patient");
      }

      toast.success("Welcome to GlucoCare Demo!", {
        description: "Logged in as Eleanor Brooks (Demo Patient)",
      });
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Failed to sign in as demo patient. Please try again.");
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleAdminDemoLogin = async () => {
    try {
      setIsAdminDemoLoading(true);
      const res = await fetch("/api/auth/demo-admin", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in as administrator");
      }

      toast.success("Welcome, Administrator!", {
        description: "Logged in as Dr. Marcus Vance (Admin) with full rights",
      });
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Failed to sign in as administrator. Please try again.");
    } finally {
      setIsAdminDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-700 to-teal-600 text-white flex items-center justify-center shadow-md">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Gluco<span className="text-teal-600">Care</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500 font-medium">
            Daily diabetes tracking with clarity and calm
          </p>
        </div>

        {/* Instant Demo Access Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-teal-50 border border-indigo-100 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>Instant Evaluation & Role Testing</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Test all features immediately as a patient or evaluate the system as a master administrator with user management rights.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={handleDemoLogin}
              isLoading={isDemoLoading}
              variant="default"
              className="w-full bg-gradient-to-r from-indigo-700 to-teal-700 hover:from-indigo-800 hover:to-teal-800 text-white shadow-sm font-semibold text-xs py-2 h-auto"
            >
              Demo Patient
            </Button>
            <Button
              type="button"
              onClick={handleAdminDemoLogin}
              isLoading={isAdminDemoLoading}
              variant="outline"
              className="w-full border-purple-300 text-purple-800 hover:bg-purple-100/70 font-semibold text-xs py-2 h-auto gap-1.5 shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              Demo Admin
            </Button>
          </div>
        </div>

        {/* Regular Login Card */}
        <Card className="shadow-md border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign in to your account</CardTitle>
            <CardDescription className="text-xs">
              Enter your patient credentials to access your daily dashboard.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9"
                  />
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                className="w-full font-semibold"
                isLoading={isLoading}
              >
                Sign In
              </Button>

              <div className="text-center text-xs text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Create account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

