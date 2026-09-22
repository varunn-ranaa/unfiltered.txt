import { getZodErrorMessage } from "@/helpers/zodErrors";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import * as z from 'zod'
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs'
import { resetPasswordValidation } from "@/schemasValidation/resetPasswordSchema";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { username, otp, newpassword } = await request.json();

    const result = resetPasswordValidation.safeParse({
      code: otp,
      newpassword
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: getZodErrorMessage(result.error),
        },
        { status: 400 }
      );
    }

    const decodeUsername = decodeURIComponent(username);
    const code = result.data.code;
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(newpassword, salt);

    const existingUser = await UserModel.findOne({ username: decodeUsername });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found!",
        },
        { status: 400 }
      );
    }

    if (!existingUser.resetVerifyCode || !existingUser.resetVerifyCodeExpiry) {
      return NextResponse.json(
        {
          success: false,
          message: "No reset code was requested for this account. Please request a new one.",
        },
        { status: 400 }
      );
    }

    const expiry = existingUser.resetVerifyCodeExpiry ;
    const isExpired = !expiry || expiry < new Date();
    const isCodeWrong = existingUser.resetVerifyCode !== code;

    if (isCodeWrong || isExpired) {
      return NextResponse.json({
        success: false,
        message: isExpired ? "Verification code expired!" : "Invalid verification code!"
      }, { status: 400 });
    }

    existingUser.password = hashPassword;
    existingUser.resetVerifyCode = undefined;
    existingUser.resetVerifyCodeExpiry = undefined;
    await existingUser.save();

    return NextResponse.json(
      {
        success: true,
        message: "New password set successfully!",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error verifying user and setting new password:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Error verifying user",
      },
      { status: 500 }
    );
  }
}