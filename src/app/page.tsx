import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import NavbarWrapper from "@/components/navbar-wrapper";

export default async function Home() {
  const session = await getServerAuthSession();

  if (session?.user.username) {
    redirect("/home");
  }

  return (
    <main className="flex w-full flex-col">
      <NavbarWrapper />

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="bg-grid-white/[0.02] absolute inset-0 bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />

        <div className="container relative mx-auto flex min-h-screen flex-col items-center justify-center gap-8 p-4 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary backdrop-blur-sm">
              ✨ Streamline your team's workflow
            </div>

            <h1 className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-6xl font-bold tracking-tight text-transparent md:text-7xl lg:text-8xl">
              Organize, Collaborate,
              <br />
              <span className="bg-gradient-to-r from-primary/80 via-primary to-primary bg-clip-text text-transparent">
                Achieve More
              </span>
            </h1>

            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-muted-foreground/80">
              Tasky is designed to streamline your team's workflow, ensuring
              that every project runs smoothly from start to finish. With our
              intuitive interface and powerful features, managing team tasks has
              never been easier.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href={session?.user ? "/dashboard" : "/auth/register"}
                className={buttonVariants({
                  variant: "default",
                  size: "lg",
                  className:
                    "group relative overflow-hidden rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl",
                })}
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>

              <Link
                href="#features"
                className="group flex items-center gap-2 rounded-xl border border-border bg-background/50 px-6 py-4 text-lg font-medium text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-background/80 hover:shadow-lg"
              >
                <span>Learn More</span>
                <svg
                  className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute left-10 top-1/4 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-10 top-1/3 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
          <div className="absolute bottom-1/4 left-1/4 h-16 w-16 rounded-full bg-primary/15 blur-xl" />
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="relative bg-gradient-to-b from-background to-background/95 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
              Why Choose Tasky?
            </h2>
            <p className="mt-6 text-xl text-muted-foreground/80">
              Built for modern teams who demand excellence
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "👥",
                title: "Effortless Team Collaboration",
                description:
                  "Create and manage teams effortlessly. Collaborate in real-time with your team members.",
                features: [
                  "Real-time collaboration",
                  "Team management",
                  "Instant communication",
                ],
              },
              {
                icon: "📋",
                title: "Seamless Task Assignment",
                description:
                  "Assign tasks to team members with just a few clicks. Track progress and stay updated.",
                features: [
                  "One-click assignment",
                  "Progress tracking",
                  "Status updates",
                ],
              },
              {
                icon: "🗂️",
                title: "Stay Organized",
                description:
                  "Keep all your tasks in one place. Prioritize, categorize, and manage tasks effectively.",
                features: [
                  "Centralized workspace",
                  "Smart categorization",
                  "Priority management",
                ],
              },
              {
                icon: "🚀",
                title: "Boost Productivity",
                description:
                  "Enhance your team's productivity with streamlined task management and goal achievement.",
                features: [
                  "Workflow optimization",
                  "Deadline management",
                  "Goal tracking",
                ],
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-background/80 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="mb-6 text-4xl">{feature.icon}</div>
                <h3 className="mb-4 text-xl font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="mb-6 leading-relaxed text-muted-foreground/80">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative bg-gradient-to-b from-background/95 to-background py-24"
      >
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
              Powerful Features
            </h2>
            <p className="mt-6 text-xl text-muted-foreground/80">
              Everything you need to manage your team effectively
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {[
              {
                icon: "🏢",
                title: "Create Teams and Manage Tasks",
                description:
                  "Easily create teams and add members. Assign tasks to specific team members and set due dates.",
                highlights: [
                  "Team creation",
                  "Member management",
                  "Task assignment",
                  "Due date tracking",
                ],
              },
              {
                icon: "📊",
                title: "Intuitive Dashboard",
                description:
                  "Get an overview of all your tasks and deadlines. Visualize your team's progress and productivity.",
                highlights: [
                  "Task overview",
                  "Progress visualization",
                  "Productivity metrics",
                  "Real-time updates",
                ],
              },
              {
                icon: "🎯",
                title: "Task Prioritization",
                description:
                  "Prioritize tasks to focus on what matters most. Use labels and categories to organize tasks efficiently.",
                highlights: [
                  "Priority levels",
                  "Smart categorization",
                  "Label system",
                  "Focus management",
                ],
              },
              {
                icon: "💬",
                title: "Real-Time Collaboration",
                description:
                  "Communicate with your team in real-time. Share files, leave comments, and get instant feedback.",
                highlights: [
                  "Live chat",
                  "File sharing",
                  "Comment system",
                  "Instant notifications",
                ],
              },
              {
                icon: "⚙️",
                title: "Customizable Workflows",
                description:
                  "Adapt Tasky to fit your team's unique workflow. Create custom task statuses and templates.",
                highlights: [
                  "Custom statuses",
                  "Workflow templates",
                  "Team adaptation",
                  "Flexible configuration",
                ],
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-background/80 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="mb-6 text-4xl">{feature.icon}</div>
                <h3 className="mb-4 text-2xl font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="mb-6 leading-relaxed text-muted-foreground/80">
                  {feature.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {feature.highlights.map((highlight, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">
            Ready to Transform Your Team?
          </h2>
          <p className="mb-8 text-xl text-muted-foreground/80">
            Join thousands of teams who have already improved their productivity
            with Tasky
          </p>
          <Link
            href={session?.user ? "/dashboard" : "/auth/register"}
            className="group relative overflow-hidden rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/25"
          >
            <span className="relative z-10">Start Your Free Trial</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
        </div>
      </section>
    </main>
  );
}
