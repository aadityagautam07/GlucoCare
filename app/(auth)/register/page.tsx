"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartPulse, Mail, Lock, User, Shield, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = React.useState(false);
  const [adminKey, setAdminKey] = React.useState("");
  const [showAdminKey, setShowAdminKey] = React.useState(false);
  const [showAdminField, setShowAdminField] = React.useState(false);
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
          adminKey: adminKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (data.user.role === "admin") {
        toast.success("Administrator Account Created!", {
          description: `Welcome Administrator ${data.user.name}`,
        });
        router.push("/admin");
      } else {
        toast.success("Account created successfully!", {
          description: `Welcome to GlucoCare, ${data.user.name}`,
        });
        router.push("/dashboard");
      }
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
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-9 pr-10"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
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

              {/* Optional Admin Setup Key */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdminField((prev) => !prev)}
                  className="text-[11px] font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 transition-colors"
                >
                  <Shield className="w-3 h-3 text-purple-600" />
                  <span>{showAdminField ? "Hide Admin Setup Key" : "Have an Admin Setup Key?"}</span>
                </button>

                {showAdminField && (
                  <div className="mt-2 p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-1.5">
                    <Label htmlFor="reg-adminkey" className="text-xs text-purple-900 font-semibold">
                      Admin Setup Key
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-adminkey"
                        type={showAdminKey ? "text" : "password"}
                        placeholder="Enter setup key (or your AUTH_SECRET)"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        className="bg-white border-purple-200 text-xs text-purple-950 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminKey(!showAdminKey)}
                        className="absolute right-3 top-2.5 text-purple-400 hover:text-purple-700 transition-colors p-0.5 rounded focus:outline-none"
                        aria-label={showAdminKey ? "Hide key" : "Show key"}
                      >
                        {showAdminKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-purple-700">
                      Configures this account with master administrative rights across all users and features.
                    </p>
                  </div>
                )}
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

