"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode, useMemo } from "react";
import { usePathname } from "next/navigation";

interface AuthLayoutProps {
  children: ReactNode;
}

type AuthRouteKey = "authentication" | "register" | "login" | "verify" | "forgot-password";

const routeTitleMap: Record<AuthRouteKey, string> = {
  authentication: "Authentication",
  register: "Register",
  login: "Log In",
  verify: "Verify Identity",
  "forgot-password": "Forgot Password",
};


export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();

  const title = useMemo(() => {
    if (!pathname) return "Authentication";

    const segments = pathname.split("/").filter(Boolean);

    // If route is just /authentication
    if (segments.length === 1 && segments[0] === "authentication") {
      return routeTitleMap.authentication;
    }

    // If nested like /authentication/register
    const lastSegment = segments[segments.length - 1] as AuthRouteKey;

    return routeTitleMap[lastSegment] ?? "Authentication";
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/40 dark:bg-gray-950/40">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-(--white)/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="container-max-width flex items-center gap-4 px-(--section-px) py-3 sm:px-(--section-px-sm) lg:px-(--section-px-lg)">
          <Link
            href="/"
            className="rounded-full p-2 transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="mx-auto text-center text-lg font-semibold tracking-tight lg:text-xl">
            {title}
          </h1>
        </div>
      </header>

      <main className="flex h-full w-full flex-1 flex-col">
        <div className="container-max-width w-full px-(--section-px) py-(--section-py) sm:px-(--section-px-sm) sm:py-(--section-py-sm) lg:px-(--section-px-lg) lg:py-(--section-py-lg)">
          {children}
        </div>
      </main>
    </div>
  );
}
