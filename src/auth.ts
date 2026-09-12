import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
//Todo google provider
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import { type JWT } from "next-auth/jwt"
import { type Session } from "next-auth"
import { signInValidation } from "./schemasValidation/signInSchema"

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
          throw new Error("Invalid input formats");
        }

      const { identifier, password } = parsedCredentials.data;

      try {

        const user = await UserModel.findOne({
          $or : [
            {email : identifier},
            {username : identifier}
          ]
        } )

        if (!user) {
          throw new Error("No user found !")
        }

        if(!user.isVerified){
          throw new Error("Please check email and verify !")
        }

        const isPasswordCorrect =  await  bcrypt.compare(password , user.password)
      
        if(!isPasswordCorrect){
          throw new Error("Invalid password.")
        }
        return user

      } catch (error: any) {
        throw new Error(error.message || "Error in Login.");
      }

    }
  })],
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks : {
    async jwt({ token, user }) {

      if(user){
        token._id = user._id?.toString()
        token.isVerified = user.isVerified
        token.isAcceptingMessages = user.isAcceptingMessages
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if(token){
        session.user._id = token._id 
        session.user.isVerified = token.isVerified
        session.user.isAcceptingMessages =  token.isAcceptingMessages
        session.user.username = token.username
      }
      return session
    },
    
  }
})