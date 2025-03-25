"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

export default function SignIn() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  // Check if user is already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      setDebugInfo(prev => `${prev}\nUser is already authenticated, redirecting to: ${callbackUrl}`);
      router.push(callbackUrl);
    } else {
      setDebugInfo(prev => `${prev}\nAuth status: ${status}`);
    }
  }, [status, callbackUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setDebugInfo(`Attempting to sign in with email: ${email}`);
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setDebugInfo(prev => `${prev}\nSign-in result: ${JSON.stringify(result)}`);

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        setDebugInfo(prev => `${prev}\nSign-in successful, redirecting to: ${callbackUrl}`);
        
        // Try both methods for redirection
        try {
          // Method 1: Use Next.js router
          router.push(callbackUrl);
          
          // Method 2: After a short delay, try window.location as a fallback
          setTimeout(() => {
            setDebugInfo(prev => `${prev}\nFallback redirect using window.location.href to: ${callbackUrl}`);
            window.location.href = callbackUrl;
          }, 1000);
        } catch (redirectError) {
          setDebugInfo(prev => `${prev}\nRedirect error: ${JSON.stringify(redirectError)}`);
          // Final fallback
          window.location.href = callbackUrl;
        }
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setError("Something went wrong. Please try again.");
      setDebugInfo(prev => `${prev}\nError: ${JSON.stringify(error)}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => signIn("github", { callbackUrl })}
                className="flex items-center gap-2"
              >
                <FaGithub className="h-4 w-4" />
                GitHub
              </Button>
              <Button 
                variant="outline" 
                onClick={() => signIn("google", { callbackUrl })}
                className="flex items-center gap-2"
              >
                <FcGoogle className="h-4 w-4" />
                Google
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
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
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      Forgot password?
                    </Link>
                  </div>
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
                <div className="text-xs text-gray-500 whitespace-pre-wrap border p-2 mt-2 bg-gray-50">
                  <p>Debug Info:</p>
                  <p>Session Status: {status}</p>
                  <p>Callback URL: {callbackUrl}</p>
                  {debugInfo && <pre>{debugInfo}</pre>}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-500 hover:text-blue-600"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
