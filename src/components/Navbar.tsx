"use client"

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User } from "next-auth";
import ThemeToggle from "./ThemeToggler";

export default function Navbar() {
    const { data: session, status } = useSession();
    const user = session?.user as User

    return (
        <nav className="w-full max-w-full overflow-x-hidden border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950 sm:px-6 sm:py-4">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
                <Link
                    href="/"
                    className="shrink-0 font-serif text-xl tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-xl"
                >
                    Unfiltered.txt
                </Link>

                <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                    <ThemeToggle/>
                    <Link
                        href="/"
                        className="text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                    >
                        Home
                    </Link>

                    {status === "loading" && (
                        <span className="text-sm text-neutral-400 dark:text-neutral-500">
                            Loading…
                        </span>
                    )}

                    {status === "unauthenticated" && (
                        <Link href="/login">
                            <button
                                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium tracking-wide text-white transition-colors duration-150 hover:bg-neutral-700 active:bg-neutral-950 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-300"
                            >
                                Login
                            </button>
                        </Link>
                    )}

                    {status === "authenticated" && user && (
                        <>
                            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                                <span className="hidden min-w-0 truncate text-sm text-neutral-700 dark:text-neutral-300 sm:inline">
                                    Welcome, {user.username || user.email}
                                </span>
                                <button
                                    onClick={() => signOut()}
                                    className="shrink-0 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium tracking-wide text-white transition-colors duration-150 hover:bg-neutral-700 active:bg-neutral-950 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-300"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}