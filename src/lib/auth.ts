import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Chat Nova Auth",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text", placeholder: "Enter code" },
        name: { label: "Name", type: "text", placeholder: "Your Name (optional)" }, // Added name credential
      },
      async authorize(credentials) {
        // For a production-ready demo, we accept the credentials provided
        // In a real app, you would check a database here.
        if (credentials?.email && credentials?.password) {
          return {
            id: "user-" + Date.now(),
            name: credentials.name || "User",
            email: credentials.email,
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
};
