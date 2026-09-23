"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartPulse, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { DiabetesType, GlucoseUnit } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [diabetesType, setDiabetesType] = React.useState<DiabetesType>("Type 2");
  const [glucoseUnit, setGlucoseUnit] = React.useState<GlucoseUnit>("mg/dL");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          diabetesType,
          glucoseUnit,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Account created successfully!", {
        description: `Welcome to GlucoCare, ${data.user.name}`,
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register";
      toast.error(msg);
    } finally {
      setIsLoading(false);
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
            Join patients who manage their daily diabetes with confidence
          </p>
        </div>

        {/* Register Card */}
        <Card className="shadow-md border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Create your account</CardTitle>
            <CardDescription className="text-xs">
              Simple setup. No invasive questions or unsolicited medical claims.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-name">Full Name</Label>
                <div className="relative">
                  <Input
                    id="reg-name"
                    placeholder="e.g. Eleanor Brooks"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-9"
                  />
                  <User className="h-4 w-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="reg-email"
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
                <Label htmlFor="reg-password">Password (min 6 characters)</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-9"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-type">Diabetes Type</Label>
                  <Select
                    id="reg-type"
                    value={diabetesType}
                    onChange={(e) => setDiabetesType(e.target.value as DiabetesType)}
                  >
                    <option value="Type 2">Type 2</option>
                    <option value="Type 1">Type 1</option>
                    <option value="Prediabetes">Prediabetes</option>
                    <option value="Gestational">Gestational</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-unit">Preferred Unit</Label>
                  <Select
                    id="reg-unit"
                    value={glucoseUnit}
                    onChange={(e) => setGlucoseUnit(e.target.value as GlucoseUnit)}
                  >
                    <option value="mg/dL">mg/dL</option>
                    <option value="mmol/L">mmol/L</option>
                  </Select>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                className="w-full font-semibold"
                isLoading={isLoading}
              >
                Create Free Account
              </Button>

              <div className="text-center text-xs text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

