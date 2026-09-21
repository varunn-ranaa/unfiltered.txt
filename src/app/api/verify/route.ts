import { getZodErrorMessage } from "@/helpers/zodErrors";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { verifyValidation } from "@/schemasValidation/verifyCodeSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

  await dbConnect()

  try {

    const { username, otp } = await request.json()
    const result = verifyValidation.safeParse({
      code: otp
    })

    if (!result.success) {

      return NextResponse.json({
        success: false,
        message: getZodErrorMessage(result.error)
      },
        {
          status: 400
        }
      )
    }

    const decodeUsername = decodeURIComponent(username)
    const code = result.data.code

    const existingUser = await UserModel.findOne({ username: decodeUsername });

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: "User not found!"
      }, { status: 400 });
    }

    const expiry = existingUser.verifyCodeExpiry;
    const isExpired = !expiry || expiry < new Date();
    const isCodeWrong = existingUser.verifyCode !== code;

    if (isCodeWrong || isExpired) {
      return NextResponse.json({
        success: false,
        message: isExpired ? "Verification code expired!" : "Invalid verification code!"
      }, { status: 400 });
    }

    existingUser.isVerified = true;
    await existingUser.save();

    return NextResponse.json({
      success: true,
      message: "User Verified successfully !"
    },
      {
        status: 200
      }
    )

  } catch (error: any) {
    console.error("Error verifying user:", error.message);
    return NextResponse.json({
      success: false,
      message: 'Error verify user'
    },
      {
        status: 500
      }
    )
  }

}

