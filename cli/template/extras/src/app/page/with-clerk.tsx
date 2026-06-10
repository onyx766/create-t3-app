import { Show, SignInButton, SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Create <span className="text-[hsl(280,100%,70%)]">Agent</span> App
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
            href="https://create.t3.gg/en/usage/first-steps"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">First Steps →</h3>
            <div className="text-lg">
              Just the basics - Everything you need to know to set up your
              database and authentication.
            </div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
            href="https://clerk.com/docs"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">Clerk Docs →</h3>
            <div className="text-lg">
              Learn how to customize authentication, manage users, and go to
              production with Clerk.
            </div>
          </Link>
        </div>
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-2xl text-white">
            {user ? (
              <span>
                Logged in as {user.firstName ?? user.username ?? "you"}
              </span>
            ) : (
              <span>You are not signed in</span>
            )}
          </p>
          <Show
            when="signed-in"
            fallback={
              <SignInButton mode="modal">
                <button className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
                  Sign in
                </button>
              </SignInButton>
            }
          >
            <SignOutButton>
              <button className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
                Sign out
              </button>
            </SignOutButton>
          </Show>
        </div>
      </div>
    </main>
  );
}
