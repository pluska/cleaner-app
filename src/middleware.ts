import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

// Define protected and public routes
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/schedule"];
const STATIC_PATTERNS = [
  /^\/_next\//,
  /^\/favicon\.ico$/,
  /\.(svg|png|jpg|jpeg|gif|webp|css|js)$/,
];

export async function middleware(request: NextRequest) {
  try {
    // Early returns for static assets
    if (isStaticAsset(request.nextUrl.pathname)) {
      return NextResponse.next();
    }

    // Handle auth errors
    if (hasAuthError(request)) {
      return redirectToAuthError(request);
    }

    // Handle authentication callbacks (email confirmation, magic links, etc.)
    // These are handled by the page components, so we just let them through
    const code = request.nextUrl.searchParams.get("code");
    if (code && request.nextUrl.pathname === "/") {
      return NextResponse.next();
    }

    // For API routes, just let them through without authentication checks
    // The API routes handle their own authentication
    if (isApiRoute(request.nextUrl.pathname)) {
      return NextResponse.next();
    }

    // Only create Supabase client for non-API routes that need authentication
    const supabase = createSupabaseClient(request);

    // Get user session
    const { user } = await getUserSession(supabase);

    // Handle route access logic for non-API routes
    return handleRouteAccess(request, user);
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

function isStaticAsset(pathname: string): boolean {
  return STATIC_PATTERNS.some((pattern) => pattern.test(pathname));
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api");
}

function hasAuthError(request: NextRequest): boolean {
  return (
    request.nextUrl.searchParams.has("error") &&
    request.nextUrl.pathname === "/"
  );
}

function redirectToAuthError(request: NextRequest): NextResponse {
  const errorUrl = new URL("/auth/error", request.url);
  errorUrl.searchParams.set(
    "error",
    request.nextUrl.searchParams.get("error") || ""
  );
  errorUrl.searchParams.set(
    "error_description",
    request.nextUrl.searchParams.get("error_description") || ""
  );
  return NextResponse.redirect(errorUrl);
}

function createSupabaseClient(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error("Missing Supabase environment variables");
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // Supabase will handle setting the cookies on the response
          // We don't need to do anything here
        },
      },
    }
  );
}

async function getUserSession(
  supabase: SupabaseClient
): Promise<{ user: User | null }> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user: error ? null : user };
  } catch {
    return { user: null };
  }
}

function handleRouteAccess(
  request: NextRequest,
  user: User | null
): NextResponse {
  const { pathname } = request.nextUrl;

  // Auth routes logic
  if (pathname.startsWith("/auth")) {
    return user
      ? NextResponse.redirect(new URL("/dashboard", request.url))
      : NextResponse.next();
  }

  // Protected routes logic
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    return user
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Homepage logic
  if (pathname === "/") {
    return user
      ? NextResponse.redirect(new URL("/dashboard", request.url))
      : NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
