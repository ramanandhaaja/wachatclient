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
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 w-full shadow-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">WhatsBot AI</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Pricing
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
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
                  </Link>
                </>
              }
            >
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden md:flex border-blue-200 text-blue-600 hover:border-blue-300"
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
      <section className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50 opacity-70 z-0"></div>
        <div className="absolute inset-0 z-0">
          <svg className="absolute right-0 top-0 h-full w-1/2 translate-x-1/2 transform" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path d="M500,0 C776.142375,0 1000,223.857625 1000,500 C1000,776.142375 776.142375,1000 500,1000 C223.857625,1000 0,776.142375 0,500 C0,223.857625 223.857625,0 500,0 Z" fill="url(#hero-gradient)"></path>
          </svg>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5">
                  <span className="text-xs font-medium text-blue-700">AI-Powered WhatsApp Automation</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl/none">
                  <span className="block">Elevate Customer Engagement</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 block">with AI WhatsApp Chatbots</span>
                </h1>
                <p className="max-w-[600px] text-lg text-gray-600 md:text-xl">
                  Transform how you connect with customers through WhatsApp. Automate support, boost sales, and deliver 24/7 personalized conversations.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl shadow-blue-300/20 transition-all duration-200"
                  >
                    Start Free Trial →
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-blue-200 text-blue-700 hover:border-blue-300 font-medium transition-all duration-200"
                >
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex items-center pt-6 space-x-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-${i*100}`}></div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">500+</span> businesses trust WhatsBot AI
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center relative mt-8 lg:mt-0">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10 border border-gray-200 mx-auto max-w-[500px]">
                <Image
                  src="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=2070&auto=format&fit=crop"
                  alt="WhatsApp Business Automation"
                  width={600}
                  height={700}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Automated Response</h3>
                        <p className="text-sm text-gray-500">Respond to customer inquiries in seconds, not hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-y border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "93%", label: "Customer Satisfaction" },
              { value: "24/7", label: "Availability" },
              { value: "70%", label: "Faster Response" },
              { value: "40%", label: "Cost Reduction" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="w-full py-16 md:py-24 lg:py-32 bg-white"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 mb-4">
              <span className="text-xs font-medium text-blue-700">Powerful Features</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything You Need to <span className="text-blue-600">Automate WhatsApp</span>
            </h2>
            <p className="max-w-[800px] text-lg text-gray-600 md:text-xl">
              Our platform combines AI intelligence with WhatsApp's reach to transform how you connect with customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {[
              {
                title: "Seamless WhatsApp Integration",
                description: "Connect your business WhatsApp in minutes with our no-code integration process",
                icon: (
                  <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                title: "AI-Powered Conversations",
                description: "Our GPT-powered AI understands natural language and responds intelligently to customer queries",
                icon: (
                  <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
              },
              {
                title: "24/7 Automated Support",
                description: "Let our chatbots handle inquiries around the clock, never missing a customer message",
                icon: (
                  <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: "No-Code Conversation Builder",
                description: "Design custom conversation flows and responses with our visual drag-and-drop builder",
                icon: (
                  <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                ),
              },
              {
                title: "Detailed Analytics Dashboard",
                description: "Track engagement, response times, and conversion rates with insightful reports",
                icon: (
                  <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                title: "Multilingual Support",
                description: "Communicate with customers in their preferred language with automatic translation",
                icon: (
                  <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                ),
              },
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex flex-col p-6 bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 flex-grow">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section
        id="how-it-works"
        className="w-full py-16 md:py-24 lg:py-32 bg-gray-50"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 mb-4">
              <span className="text-xs font-medium text-blue-700">Simple Process</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              How WhatsBot AI <span className="text-blue-600">Works</span>
            </h2>
            <p className="max-w-[800px] text-lg text-gray-600 md:text-xl">
              Get started in minutes and transform your customer communication
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                step: "1",
                title: "Connect Your WhatsApp",
                description: "Link your WhatsApp Business account to our platform with a few simple clicks",
                image: "https://images.unsplash.com/photo-1611746869696-b0fcc35a7075?q=80&w=2940&auto=format&fit=crop"
              },
              {
                step: "2",
                title: "Customize Your Bot",
                description: "Set up responses, conversation flows, and automated actions to match your business needs",
                image: "https://images.unsplash.com/photo-1586880244406-556ebe35f282?q=80&w=2787&auto=format&fit=crop"
              },
              {
                step: "3",
                title: "Launch & Optimize",
                description: "Your AI assistant is ready to engage with customers while you monitor performance",
                image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=2940&auto=format&fit=crop"
              },
            ].map((step, index) => (
              <div 
                key={index}
                className="flex flex-col rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 relative overflow-hidden">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 h-10 w-10 rounded-full bg-blue-600 text-white text-xl font-bold flex items-center justify-center shadow-lg">
                    {step.step}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="w-full py-16 md:py-24 lg:py-32 bg-white"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 mb-4">
              <span className="text-xs font-medium text-blue-700">Customer Stories</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Why Businesses <span className="text-blue-600">Love WhatsBot AI</span>
            </h2>
            <p className="max-w-[800px] text-lg text-gray-600 md:text-xl">
              See how businesses are transforming their customer interactions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {[
              {
                quote: "Our WhatsApp chatbot handles over 70% of customer inquiries automatically. We've reduced response time from hours to seconds while cutting support costs by 40%.",
                author: "Sarah Johnson",
                role: "Customer Support Manager",
                company: "RetailPlus",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop"
              },
              {
                quote: "Since implementing WhatsBot AI, our lead conversion has increased by 35%. The automated follow-ups have been a game-changer for our sales team.",
                author: "Michael Chen",
                role: "Sales Director",
                company: "GrowthCo",
                image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=2787&auto=format&fit=crop"
              },
              {
                quote: "The multi-language support has allowed us to expand into new markets without hiring additional staff. Our customers love getting instant responses in their native language.",
                author: "Emily Rodriguez",
                role: "Operations Manager",
                company: "GlobalServe",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2788&auto=format&fit=crop"
              },
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="flex flex-col p-6 bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10,8.5c-2.1,0-3.9,0.7-5.3,2.1S2.5,13.9,2.5,16c0,1.8,0.5,3.5,1.5,5.1s2.4,3,4.3,4.1L14.5,16V8.5H10z M24,8.5c-2.1,0-3.9,0.7-5.3,2.1S16.5,13.9,16.5,16c0,1.8,0.5,3.5,1.5,5.1s2.4,3,4.3,4.1L28.5,16V8.5H24z" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-6 flex-grow italic">"{testimonial.quote}"</p>
                <div className="flex items-center mt-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                    <Image 
                      src={testimonial.image}
                      alt={testimonial.author}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="w-full py-16 md:py-24 lg:py-32 bg-gray-50"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 mb-4">
              <span className="text-xs font-medium text-blue-700">Simple Pricing</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Plans for <span className="text-blue-600">Every Business Size</span>
            </h2>
            <p className="max-w-[800px] text-lg text-gray-600 md:text-xl">
              Start with our free plan and upgrade as your business grows
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "Perfect for small businesses just getting started",
                features: [
                  "500 messages/month",
                  "Basic AI chatbot",
                  "Standard templates",
                  "8-hour support response",
                  "Basic analytics"
                ],
                cta: "Start Free",
                popular: false,
                ctaVariant: "outline"
              },
              {
                name: "Professional",
                price: "$49",
                period: "/month",
                description: "Ideal for growing businesses with more demands",
                features: [
                  "10,000 messages/month",
                  "Advanced AI capabilities",
                  "Custom conversation flows",
                  "Priority support (4hr)",
                  "Detailed analytics",
                  "Team collaboration"
                ],
                cta: "Try 14 Days Free",
                popular: true,
                ctaVariant: "default"
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large businesses with specific requirements",
                features: [
                  "Unlimited messages",
                  "Premium AI capabilities",
                  "Advanced customization",
                  "Dedicated support",
                  "API access",
                  "Custom integrations",
                  "SLA guarantees"
                ],
                cta: "Contact Sales",
                popular: false,
                ctaVariant: "outline"
              }
            ].map((plan, index) => (
              <div 
                key={index}
                className={`flex flex-col p-8 rounded-2xl ${plan.popular ? 'bg-blue-600 text-white shadow-xl relative border-0 scale-105' : 'bg-white border border-gray-100 shadow-md'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className={`${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>{plan.period}</span>}
                </div>
                <p className={`mb-6 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>{plan.description}</p>
                <ul className="mb-8 space-y-3 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg className={`h-5 w-5 mr-2 ${plan.popular ? 'text-blue-300' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  size="lg"
                  variant={plan.popular ? "secondary" : (plan.ctaVariant === "outline" ? "outline" : "default")}
                  className={`w-full font-medium ${plan.popular ? 'bg-white text-blue-600 hover:bg-gray-100' : ''}`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560438718-eb61ede255eb?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto flex flex-col items-center justify-center space-y-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Ready to Transform Your Customer Experience?
            </h2>
            <p className="text-lg md:text-xl text-blue-100 max-w-xl">
              Join businesses saving 20+ hours per week on customer service
              while increasing engagement and sales by up to 40%.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-200 font-medium px-8"
              >
                Start Your Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white/10 transition-all duration-200 font-medium px-8"
              >
                Schedule Demo
              </Button>
            </div>
            <div className="pt-4 text-sm text-blue-100">
              No credit card required • 14-day free trial • Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">WhatsBot AI</span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                Transforming customer engagement through AI-powered WhatsApp automation.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map(social => (
                  <a key={social} href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                    <span className="sr-only">{social}</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z"/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Product</h3>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Security', 'Integrations', 'API'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Company</h3>
              <ul className="space-y-2">
                {['About', 'Careers', 'Blog', 'Press', 'Partners'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
              <ul className="space-y-2">
                {['Documentation', 'Help Center', 'Tutorials', 'Webinars', 'Status'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              2025 WhatsBot AI. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {['Terms', 'Privacy', 'Cookies', 'GDPR'].map(item => (
                <a key={item} href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
