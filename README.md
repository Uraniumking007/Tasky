# [Tasky](http://tasky.bhaveshp.dev "Tasky")

Tasky is a web-based task manager and note-taking application that allows users to organize their tasks and notes in a single, easy-to-use interface. With Tasky, users can create and manage tasks, set priorities, and add unlimited subtasks for each task.

To get started with Tasky, simply create an account and log in. From there, you can create new tasks and notes, set priorities, and add subtasks as needed. Tasky&apos;s intuitive interface makes it easy to manage your tasks and notes, so you can stay organized and on top of your work.

## Some of the key features of Tasky include:

- Task creation and management: Users can create new tasks, set due dates, and mark them as completed.
- Note-taking: Users can create and edit notes, as well as organize them into folders for easy access.
- Subtask creation: Users can add unlimited subtasks for each task, allowing them to break down larger projects into smaller, more manageable tasks.
- Priority setting: Users can set priorities for each task, allowing them to focus on the most important tasks first.
- Task tracking: Users can track the progress of their tasks and notes, making it easy to see what needs to be done and when.

## Tech Stack
To get started with Tasky, simply sign up for an account on our website. Once you&apos;re logged in, you can start creating tasks and notes.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [shadcn/ui](https://ui.shadcn.com/)
- [Nodemailer](https://nodemailer.com/) (Email functionality)

## Getting Started

To get started with [Tasky](http://tasky.bhaveshp.dev), simply sign up for an account on our [website](http://tasky.bhaveshp.dev). Once you&apos;re logged in, you can start creating tasks and notes.

## Development

### Prerequisites

- Node.js 18+
- pnpm (recommended package manager)

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Tasky <noreply@tasky.com>"
```

#### Email Setup

For Gmail, you'll need to:

1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password as `SMTP_PASS`

For other email providers, check their SMTP settings and adjust the configuration accordingly.

### Database Setup

```bash
pnpm db:push
```

### Running the Development Server

#### Standard Development (Webpack)

```bash
pnpm dev
```

#### Fast Development with Turbopack ⚡

```bash
pnpm dev:turbo
```

**Turbopack Benefits:**

- Up to 700x faster updates than Webpack
- Incremental compilation
- Faster hot module replacement
- Better memory usage

> **Note:** Turbopack is still in beta. If you encounter any issues, fall back to the standard `pnpm dev` command.

### Other Commands

```bash
pnpm build          # Build for production
pnpm start          # Start production server
pnpm lint           # Run ESLint
pnpm db:studio      # Open Prisma Studio
```

## Usage

Tasky is designed to be user-friendly, so you can start using it right away. Here are some basic steps to get you started:

1. Create a new task or note.
2. Set the priority of the task or note.
3. Add any subtasks or notes as needed.
4. Save the task or note.
5. View and edit your tasks and notes at any time.

## Conclusion

Tasky is the perfect tool for managing your tasks and notes. With its easy-to-use interface and powerful features, you can stay organized and focused on your work. Sign up for an account today and start using Tasky to take control of your workflow.
