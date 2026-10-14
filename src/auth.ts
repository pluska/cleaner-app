import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { users } from "./db/schema";
import { authConfig } from "./auth.config";
import { normalizeEmail, throttleAuth } from "./libs/server/security";
import { sessionIsCurrent } from "./libs/server/session";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.sessionVersion = (user as typeof user & { sessionVersion: number }).sessionVersion;
      }
      if (!await sessionIsCurrent(token.sub, token.sessionVersion)) return null;
      if (trigger === 'update') {
        const [current] = await db.select({name:users.name}).from(users).where(sql`${users.id} = ${token.sub}`);
        token.name = current?.name ?? null;
      }
      return token;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials, request) {
        if (typeof credentials?.password !== 'string' || new TextEncoder().encode(credentials.password).length > 72) return null;
        let email: string;
        try { email = normalizeEmail(credentials.email); } catch { return null; }
        await throttleAuth(request, 'login', email);

        const [user] = await db
          .select()
          .from(users)
          .where(sql`lower(${users.email}) = ${email}`);

        if (!user || !user.hashedPassword) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
});
