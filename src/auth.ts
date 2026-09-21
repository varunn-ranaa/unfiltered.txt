import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
//Todo google provider
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import { type JWT } from "next-auth/jwt"
import { type Session } from "next-auth"
import { signInValidation } from "./schemasValidation/signInSchema"

class InvalidInputError extends CredentialsSignin {
  code = "invalid_input"
}
class UserNotFoundError extends CredentialsSignin {
  code = "user_not_found"
}
class UnverifiedUserError extends CredentialsSignin {
  code = "unverified_user"
}
class InvalidPasswordError extends CredentialsSignin {
  code = "invalid_password"
}
class NoPasswordSetError extends CredentialsSignin {
  code = "no_password_set"
}

async function generateUniqueUsername(email: string): Promise<string> {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") || "user"
  let username = base
  let count = 0

  while (await UserModel.findOne({ username })) {
    count++
    username = `${base}${count}`
  }

  return username
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Credentials({
    credentials: {
      identifier: {
        type: "text",
        label: "Username/Email",
        placeholder: "username/email",
      },
      password: {
        type: "password",
        label: "Password",
        placeholder: "*****"
      },
    },
    async authorize(credentials: any): Promise<any> {
      await dbConnect()

      const parsedCredentials = signInValidation.safeParse(credentials);

      if (!parsedCredentials.success) {
        throw new InvalidInputError()
      }

      const { identifier, password } = parsedCredentials.data;

      const user = await UserModel.findOne({
        $or: [
          { email: identifier },
          { username: identifier }
        ]
      })

      if (!user) {
        throw new UserNotFoundError()
      }

      if (!user.isVerified) {
        throw new UnverifiedUserError()
      }

      if (!user.password) {
        throw new NoPasswordSetError()
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password)

      if (!isPasswordCorrect) {
        throw new InvalidPasswordError()
      }

      return user
    }
  }),
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  })],
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return true
      }

      if (!profile?.email_verified) {
        return "/login?errorgoogle_email_not_verified"
      }

      await dbConnect()

      const email = user.email
      if (!email) {
        return "/login?error=no_email_from_google"
      }

      const existing = await UserModel.findOne({ email })

      // Case1: brand new user — create and let them straight in
      if (!existing) {
        const username = await generateUniqueUsername(email)

        const newUser = await UserModel.create({
          username,
          email,
          isVerified: true,
          isAcceptingMessages: true,
          messages: [],
          providers: [{
            provider: "google",
            providerId: account.providerAccountId,
          }],
        })

        user._id = newUser._id.toString()
        user.isVerified = newUser.isVerified
        user.isAcceptingMessages = newUser.isAcceptingMessages
        user.username = newUser.username
        return true
      }

      // Case 2: account exists AND has a password — this is a manual account, do not merge
      if (existing.password && existing.isVerified) {
        return "/login?error=account_exists"
      }

      // Case 3: account exists, has a password, but was never verified — send them to verify, not Google
      if (existing.password && !existing.isVerified) {
        return "/login?error=account_exists_but_not_verified"
      }

      // Remaining case: existing account has no password — a returning Google-only user, or
      // was created by another OAuth provider (e.g. Facebook) on the same email.
      // Attach this provider if not already linked, then let them in.
      const alreadyLinked = existing.providers?.some(
        p => p.provider === "google" && p.providerId === account.providerAccountId
      )

      if (!alreadyLinked) {
        existing.providers = existing.providers || []
        existing.providers.push({
          provider: "google",
          providerId: account.providerAccountId,
        })
        await existing.save()
      }

      user._id = existing._id.toString()
      user.isVerified = existing.isVerified
      user.isAcceptingMessages = existing.isAcceptingMessages
      user.username = existing.username
      return true
    },
    async jwt({ token, user }) {

      if (user) {
        token._id = user._id?.toString()
        token.isVerified = user.isVerified
        token.isAcceptingMessages = user.isAcceptingMessages
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id
        session.user.isVerified = token.isVerified
        session.user.isAcceptingMessages = token.isAcceptingMessages
        session.user.username = token.username
      }
      return session
    },

  }
})