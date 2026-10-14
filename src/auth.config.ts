import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  providers: [
    Credentials({
      async authorize() {
        // This is a placeholder for the Edge-compatible config
        // The actual implementation will be in auth.ts
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.name = token.name as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = nextUrl.pathname.startsWith("/auth");
      const isProtectedRoute = ["/onboarding", "/profile", "/dashboard", "/schedule", "/stats", "/store", "/kingdom"].some(route =>
        nextUrl.pathname.startsWith(route)
      );

      if (isAuthRoute) return true;

      if (isProtectedRoute && !isLoggedIn) {
        return Response.redirect(new URL("/auth/login", nextUrl));
      }

      if (nextUrl.pathname === "/" && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
