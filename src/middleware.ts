import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is not signed in and the current path is not /auth/* or /, redirect to /auth/login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    request.nextUrl.pathname !== "/"
  ) {
    const redirectUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in and the current path is /auth/*, redirect to /dashboard
  if (user && request.nextUrl.pathname.startsWith("/auth")) {
    const redirectUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in and on homepage, redirect to dashboard
  if (user && request.nextUrl.pathname === "/" && !code) {
    const redirectUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
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
