import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

// List of admin emails that are allowed to access the admin panel
const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow sign in if the user's email is in the admin emails list
      return !!user.email && adminEmails.includes(user.email);
    },
    async session({ session }) {
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 