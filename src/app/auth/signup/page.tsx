"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setDebugInfo("");

    try {
      setDebugInfo(`Registering user with email: ${email}`);
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      setDebugInfo(prev => `${prev}\nRegistration response: ${JSON.stringify(data)}`);

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Automatically sign in the user after successful registration
      setDebugInfo(prev => `${prev}\nAttempting to sign in with email: ${email}`);
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setDebugInfo(prev => `${prev}\nSign-in result: ${JSON.stringify(result)}`);

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      // Redirect to the callback URL or dashboard
      setDebugInfo(prev => `${prev}\nRedirecting to: ${callbackUrl}`);
      
      // Force a hard navigation
      window.location.href = callbackUrl;
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "An error occurred during registration");
      setDebugInfo(prev => `${prev}\nError: ${error.message || JSON.stringify(error)}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Sign up to get started with our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {debugInfo && (
              <div className="text-xs text-gray-500 whitespace-pre-wrap border p-2 mt-2 bg-gray-50">
                {debugInfo}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-4 flex items-center">
            <Separator className="flex-grow" />
            <span className="mx-2 text-sm text-gray-500">OR</span>
            <Separator className="flex-grow" />
          </div>

          <div className="mt-4 space-y-2">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={() => signIn("github", { callbackUrl })}
            >
              <FaGithub className="mr-2" />
              Sign up with GitHub
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={() => signIn("google", { callbackUrl })}
            >
              <FcGoogle className="mr-2" />
              Sign up with Google
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
