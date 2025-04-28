import NextAuth from "next-auth";
import { authOptions } from "./auth";

// Create the auth handler
const handler = NextAuth(authOptions);

// Export the GET and POST handlers
export { handler as GET, handler as POST }; 