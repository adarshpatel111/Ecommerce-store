import type React from "react"
import Link from "next/link"
import { ArrowRight, BarChart3, Package, Users, FileText, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl">BusinessPro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-20 md:py-32">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-6 md:space-y-8">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <span className="mr-1">✨</span> Streamline Your Business Operations
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Manage Your Business <span className="text-primary">With Ease</span>
                </h1>
                <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
                  Our all-in-one dashboard provides powerful tools to track customers, manage products, and handle
                  invoices in one centralized platform.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="gap-2 text-base">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="text-base">
                      Login to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-70 blur-xl"></div>
                <div className="relative overflow-hidden rounded-xl border bg-background shadow-xl">
                  <img
                    src="/placeholder.svg?height=500&width=600"
                    alt="Dashboard Preview"
                    className="w-full object-cover"
                    width={600}
                    height={500}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Everything You Need to Succeed
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Our comprehensive suite of tools helps you manage every aspect of your business.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Users className="h-10 w-10 text-primary" />}
                title="Customer Management"
                description="Keep track of all your customers and their purchase history in one place. Add notes, track interactions, and build stronger relationships."
              />
              <FeatureCard
                icon={<Package className="h-10 w-10 text-primary" />}
                title="Product Inventory"
                description="Manage your product inventory with ease. Get notified when stock is low, track product performance, and optimize your offerings."
              />
              <FeatureCard
                icon={<FileText className="h-10 w-10 text-primary" />}
                title="Invoice Tracking"
                description="Create and track invoices, and get paid faster with our easy-to-use system. Send reminders, track payment status, an improve cash flow."
              />
              <FeatureCard
                icon={<BarChart3 className="h-10 w-10 text-primary" />}
                title="Business Analytics"
                description="Gain valuable insights into your business performance with detailed analytics and reports. Make data-driven decisions to grow your business."
              />
              <FeatureCard
                icon={<CheckCircle className="h-10 w-10 text-primary" />}
                title="Task Management"
                description="Stay organized with our task management system. Set priorities, assign tasks, and track progress to ensure nothing falls through the cracks."
              />
              <FeatureCard
                icon={<Package className="h-10 w-10 text-primary" />}
                title="Mobile Friendly"
                description="Access your dashboard from anywhere, on any device. Our responsive design ensures a seamless experience on desktop, tablet, and mobile."
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-muted py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Trusted by Businesses Worldwide
              </h2>
              <p className="text-muted-foreground md:text-lg">
                See what our customers have to say about our business management platform.
              </p>
            </div>
            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
              <TestimonialCard
                quote="This dashboard has completely transformed how we manage our business. The customer tracking alone has increased our sales by 30%."
                name="Sarah Johnson"
                company="Retail Solutions Inc."
              />
              <TestimonialCard
                quote="The invoice management system is a game-changer. We've reduced our unpaid invoices by 75% since implementing this platform."
                name="Michael Chen"
                company="Tech Innovations"
              />
              <TestimonialCard
                quote="As a small business owner, I needed something comprehensive yet easy to use. This platform delivers on all fronts and has saved me countless hours."
                name="Jessica Williams"
                company="Creative Studios"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-20 text-primary-foreground md:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to Transform Your Business?
              </h2>
              <p className="mb-8 text-primary-foreground/80 md:text-lg">
                Join thousands of businesses that have streamlined their operations with our platform.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="w-full text-base sm:w-auto">
                    Start Your Free Trial
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-primary-foreground/20 text-base text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
                  >
                    Schedule a Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/40 py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <Package className="h-6 w-6 text-primary" />
                <span className="text-xl">BusinessPro</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Streamlining business operations since 2020. Our mission is to help businesses of all sizes succeed.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2023 BusinessPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, name, company }: { quote: string; name: string; company: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 text-4xl text-primary">"</div>
      <p className="mb-4 italic text-muted-foreground">{quote}</p>
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">{company}</p>
      </div>
    </div>
  )
}
