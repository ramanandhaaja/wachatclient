import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { AuthCheck } from "@/components/auth/auth-check";
import { UserMenu } from "@/components/auth/user-menu";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 w-full shadow-sm">
        <div className="container mx-auto flex h-24 items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-bold">WhatsBot AI</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <AuthCheck
              fallback={
                <>
                  <Link href="/auth/signin">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden md:flex"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              }
            >
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden md:flex"
                  >
                    Dashboard
                  </Button>
                </Link>
                <UserMenu />
              </div>
            </AuthCheck>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-gray-900 dark:via-indigo-950 dark:to-gray-800 overflow-hidden relative">
        <div className="container mx-auto px-4 md:px-6">
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob dark:bg-green-900"></div>
          <div className="absolute top-32 -left-24 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 dark:bg-blue-900"></div>
          <div className="absolute -bottom-24 left-48 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 dark:bg-indigo-900"></div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 relative z-10">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold text-blue-600 bg-blue-50 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                  Intelligent WhatsApp Solutions
                </span>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  AI-Powered WhatsApp Chatbots for Your Business
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Automate customer service, boost sales, and engage your
                  audience seamlessly through WhatsApp.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-8">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Get Started
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700 transition-all duration-200"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center relative">
              <Image
                src="/hero-image.svg"
                alt="WhatsApp AI Chatbot"
                width={550}
                height={550}
                className="rounded-xl object-cover shadow-2xl transition-all duration-500 hover:scale-105 z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-indigo-100 px-3 py-1 text-sm text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Smart WhatsApp Solutions
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Our AI-powered platform makes creating and managing WhatsApp
                chatbots simple and effective.
              </p>
            </div>
          </div>
          <div className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {[
              {
                title: "Easy WhatsApp Integration",
                description:
                  "Connect your business WhatsApp in minutes with our simple setup process.",
                icon: "📱",
              },
              {
                title: "AI-Powered Conversations",
                description:
                  "Our advanced AI understands natural language and keeps learning from interactions.",
                icon: "🤖",
              },
              {
                title: "24/7 Customer Support",
                description:
                  "Let our chatbots handle inquiries around the clock, never missing a customer message.",
                icon: "⏰",
              },
              {
                title: "Custom Chat Workflows",
                description:
                  "Design conversation flows and automated responses without any coding required.",
                icon: "⚙️",
              },
              {
                title: "Detailed Analytics",
                description:
                  "Track engagement metrics, response times, and conversion rates with powerful insights.",
                icon: "📊",
              },
              {
                title: "Multi-language Support",
                description:
                  "Communicate with your customers in their preferred language automatically.",
                icon: "🌐",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="flex flex-col items-center text-center border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                <CardHeader className="flex flex-col items-center justify-center pb-0">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300 text-3xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    {feature.icon}
                  </div>
                  <CardTitle className="mt-4 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-center">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <hr className="border-gray-200 dark:border-gray-700 w-full" />

      {/* Testimonials Section */}
      <section
              id="testimonials"
              className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-gray-900 dark:via-indigo-950 dark:to-gray-800 overflow-hidden relative"
            >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-700 dark:bg-green-900/50 dark:text-green-300">
                Testimonials
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Success Stories
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                See how businesses are transforming their customer interactions
                with our WhatsApp AI chatbots.
              </p>
            </div>
          </div>
          <div className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {[
              {
                quote:
                  "Our WhatsApp chatbot handles over 70% of customer inquiries automatically. We've reduced response time from hours to seconds while cutting support costs by 40%.",
                author: "Sarah Johnson",
                role: "Customer Support Manager, RetailPlus",
              },
              {
                quote:
                  "Since implementing the WhatsBot AI solution, our lead conversion has increased by 35%. The automated follow-ups have been a game-changer for our sales team.",
                author: "Michael Chen",
                role: "Sales Director, GrowthCo",
              },
              {
                quote:
                  "The multi-language support has allowed us to expand into new markets without hiring additional staff. Our customers love getting instant responses in their native language.",
                author: "Emily Rodriguez",
                role: "Operations Manager, GlobalServe",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="flex flex-col border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group"
              >
                <CardHeader>
                  <svg
                    className="h-12 w-12 text-gray-400 dark:text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                  </svg>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-gray-500 dark:text-gray-400">
                    {testimonial.quote}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col items-start">
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="w-full py-24 md:py-32 lg:py-40 bg-white dark:bg-gray-900"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                Pricing
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Choose Your Plan
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Start with our free plan and upgrade as you grow.
              </p>
            </div>
          </div>
          <div className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-3 mt-8">
            {/* Free Tier */}
            <div className="flex flex-col items-center border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold">Free</h3>
                <div className="mt-4 text-gray-500 dark:text-gray-400">
                  Basic features for getting started.
                </div>
              </div>
              <div className="p-8 border-t border-gray-100 dark:border-gray-800 w-full text-center">
                <Button variant="outline">Get Started</Button>
              </div>
            </div>

            {/* $29/month Tier */}
            <div className="flex flex-col items-center border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold">$29/month</h3>
                <div className="mt-4 text-gray-500 dark:text-gray-400">
                  Advanced features for growing businesses.
                </div>
              </div>
              <div className="p-8 border-t border-gray-100 dark:border-gray-800 w-full text-center">
                <Button>Upgrade Now</Button>
              </div>
            </div>

            {/* Custom Tier */}
            <div className="flex flex-col items-center border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold">Custom</h3>
                <div className="mt-4 text-gray-500 dark:text-gray-400">
                  Tailored solutions for enterprise needs.
                </div>
              </div>
              <div className="p-8 border-t border-gray-100 dark:border-gray-800 w-full text-center">
                <Button variant="outline">Contact Us</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Transform Your WhatsApp Business?
              </h2>
              <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">
                Join businesses saving 20+ hours per week on customer service
                while increasing engagement and sales.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Create Your Chatbot
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white/70 hover:bg-white/10 hover:border-white transition-all duration-200"
              >
                See Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 md:py-12 bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
            &copy; 2025 WhatsBot AI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
