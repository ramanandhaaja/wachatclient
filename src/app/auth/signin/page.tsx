import { Metadata } from 'next'
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: 'Sign In - WhatsBot AI',
  description: 'Sign in to your WhatsBot AI account',
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SignInForm />
    </div>
  );
}
