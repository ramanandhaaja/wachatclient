"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

// Schema for signin validation
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignInForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate form data
      const result = signInSchema.safeParse({ email, password });
      if (!result.success) {
        setError(result.error.errors[0].message);
        setIsLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!signInResult?.error) {
        router.push(callbackUrl);
      } else {
        setError("Invalid email or password");
        setIsLoading(false);
      }
    } catch (error) {
      setError("An error occurred during sign in");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Social Sign-in Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => signIn("github", { callbackUrl })}
              className="w-full space-x-2"
            >
              <FaGithub className="h-4 w-4" />
              <span>GitHub</span>
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full space-x-2"
            >
              <FcGoogle className="h-4 w-4" />
              <span>Google</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-500">{error}</div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="text-sm text-muted-foreground">
            <Link 
              href="/auth/forgot-password" 
              className="text-primary hover:text-primary/90 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link 
              href="/auth/signup" 
              className="text-primary hover:text-primary/90 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
