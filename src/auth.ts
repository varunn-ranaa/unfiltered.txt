import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
//Todo google provider
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

      const isPasswordCorrect = await bcrypt.compare(password, user.password)

      if (!isPasswordCorrect) {
        throw new InvalidPasswordError()
      }

      return user
    }
  })],
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
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