import GoogleProvider from "next-auth/providers/google";
import type { AuthOptions } from "next-auth";
import type { User } from "next-auth";
import type { Session } from "next-auth";

// List of admin emails that are allowed to access the admin panel
const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

// Export a config object that other routes can import
export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: User }) {
      // Only allow sign in if the user's email is in the admin emails list
      return !!user.email && adminEmails.includes(user.email);
    },
    async session({ session }: { session: Session }) {
      // Add isAdmin flag to the session
      if (session.user && session.user.email) {
        session.user.isAdmin = adminEmails.includes(session.user.email);
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}; 