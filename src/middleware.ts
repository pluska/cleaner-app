import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // Validate environment variables
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return NextResponse.next();
    }

    let supabaseResponse = NextResponse.next({
      request,
    });

    // Handle authentication errors
    const error = request.nextUrl.searchParams.get("error");
    if (error && request.nextUrl.pathname === "/") {
      const errorUrl = new URL("/auth/error", request.url);
      errorUrl.searchParams.set("error", error);
      errorUrl.searchParams.set(
        "error_description",
        request.nextUrl.searchParams.get("error_description") || ""
      );
      return NextResponse.redirect(errorUrl);
    }

    // Handle authentication callbacks (email confirmation, magic links, etc.)
    const code = request.nextUrl.searchParams.get("code");
    if (code && request.nextUrl.pathname === "/") {
      // Let the page handle the authentication callback
      return NextResponse.next();
    }

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Get user with error handling
    let user = null;
    try {
      const {
        data: { user: userData },
        error: userError,
      } = await supabase.auth.getUser();

      if (!userError) {
        user = userData;
      }
    } catch (error) {
      // Continue without user if there's an exception
    }

    // Allow access to API routes without authentication
    if (request.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    // Allow access to static files and public assets
    if (
      request.nextUrl.pathname.startsWith("/_next") ||
      request.nextUrl.pathname.startsWith("/favicon.ico") ||
      request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|css|js)$/)
    ) {
      return NextResponse.next();
    }

    // Allow access to auth pages without redirects
    if (request.nextUrl.pathname.startsWith("/auth")) {
      // If user is signed in and trying to access auth pages, redirect to dashboard
      if (user) {
        const redirectUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(redirectUrl);
      }
      // If user is not signed in, allow access to auth pages
      return NextResponse.next();
    }

    // If user is not signed in and trying to access protected routes, redirect to login
    if (!user && request.nextUrl.pathname !== "/") {
      const redirectUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If user is signed in and on homepage, redirect to dashboard
    if (user && request.nextUrl.pathname === "/" && !code) {
      const redirectUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Allow access to homepage for unauthenticated users
    if (request.nextUrl.pathname === "/") {
      return NextResponse.next();
    }

    // Default: allow the request to proceed
    return supabaseResponse;
  } catch (error) {
    // In case of error, allow the request to proceed to avoid blocking the app
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
