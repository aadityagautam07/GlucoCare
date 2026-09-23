"use client";

import * as React from "react";
import Link from "next/link";
import { HeartPulse, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    toast.success("Password reset link sent", {
      description: `If an account exists for ${email}, you will receive instructions shortly.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-700 to-teal-600 text-white flex items-center justify-center shadow-md">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Gluco<span className="text-teal-600">Care</span>
            </span>
          </Link>
        </div>

        <Card className="shadow-md border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Reset your password</CardTitle>
            <CardDescription className="text-xs">
              Enter your registered email address to receive password recovery instructions.
            </CardDescription>
          </CardHeader>

          {submitted ? (
            <CardContent className="space-y-4 text-center py-6">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Check your inbox
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                We sent password recovery instructions to <strong>{email}</strong>.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="reset-email"
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
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-2">
                <Button type="submit" className="w-full font-semibold">
                  Send Reset Link
                </Button>

                <div className="text-center text-xs">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

