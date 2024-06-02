import Link from "next/link";

import { getServerAuthSession } from "@/server/auth";
import Navbar from "@/components/navbar";
import { Button, buttonVariants } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerAuthSession();

  if (session?.user) {
    return {
      redirect: {
        destination: "/home",
        permanent: false,
      },
    };
  }

  return (
    <main className="flex w-full flex-col">
      <Navbar />
      <section className="w-full snap-y snap-mandatory overflow-scroll bg-background">
        <div className="container mx-auto flex h-screen shrink-0 snap-start snap-always flex-col items-center justify-center gap-4 p-4">
          <h1 className="w-7/12 text-center text-6xl font-bold text-primary">
            Organize, Collaborate, and Achieve More with Tasky
          </h1>
          <p className="w-7/12 text-center text-xl text-foreground ">
            Tasky is designed to streamline your team's workflow, ensuring that
            every project runs smoothly from start to finish. With our intuitive
            interface and powerful features, managing team tasks has never been
            easier.
          </p>
          <Link
            href={session?.user ? "/dashboard" : "/auth/register"}
            className={buttonVariants({
              variant: "default",
              size: "lg",
            })}
          >
            Get Started
          </Link>
        </div>
        <div className="container mx-auto flex h-screen shrink-0 snap-center snap-always flex-col items-center justify-center gap-8 p-4">
          <h1 className="w-7/12 text-center text-6xl font-bold text-primary">
            Why Choose Tasky?
          </h1>
          <div className="grid grid-cols-2 gap-6">
            <ul className="list-disc">
              <p className="text-xl font-bold">Effortless Team Collaboration</p>
              <li>Create and manage teams effortlessly.</li>
              <li>Collaborate in real-time with your team members.</li>
            </ul>
            <ul className="list-disc">
              <p className="text-xl font-bold">Seamless Task Assignment</p>
              <li>Assign tasks to team members with just a few clicks.</li>
              <li>Track progress and stay updated on task statuses.</li>
            </ul>
            <ul className="list-disc">
              <p className="text-xl font-bold">Stay Organized</p>
              <li>Keep all your tasks in one place.</li>
              <li>Prioritize, categorize, and manage tasks effectively.</li>
            </ul>
            <ul className="list-disc">
              <p className="text-xl font-bold">Stay Organized</p>
              <li>
                Enhance your team's productivity with streamlined task
                management.
              </li>
              <li>
                Meet deadlines consistently and achieve your goals faster.
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto flex h-screen shrink-0 snap-center snap-always flex-col items-center justify-center gap-8 p-4">
          <h1 className="w-7/12 text-center text-6xl font-bold text-primary">
            Features
          </h1>
          <div className="grid grid-cols-2 gap-6">
            <ul className="list-disc">
              <p className="text-xl font-bold">Create Teams and Manage Tasks</p>
              <li>Easily create teams and add members.</li>
              <li>Assign tasks to specific team members and set due dates.</li>
              <li>Track task progress and receive notifications on updates.</li>
            </ul>
            <ul className="list-disc">
              <p className="text-xl font-bold"> Intuitive Dashboard</p>
              <li>Get an overview of all your tasks and deadlines.</li>
              <li>Visualize your team&prime;s progress and productivity.</li>
            </ul>
            <ul className="list-disc">
              <p className="text-xl font-bold">Task Prioritization</p>
              <li>Prioritize tasks to focus on what matters most.</li>
              <li>Use labels and categories to organize tasks efficiently.</li>
            </ul>
            <ul className="list-disc">
              <p className="text-xl font-bold">Real-Time Collaboration</p>
              <li>Communicate with your team in real-time.</li>
              <li>Share files, leave comments, and get instant feedback.</li>
            </ul>
            <ul className="list-disc">
              <p className="text-xl font-bold">Customizable Workflows</p>
              <li>Adapt Tasky to fit your team's unique workflow.</li>
              <li>Create custom task statuses and templates.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
