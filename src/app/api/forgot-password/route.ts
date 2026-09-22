import { NextRequest, NextResponse } from "next/server";
import { APIresponse } from "@/types/apiResponse";
import UserModel from "@/model/User";
import { sendVerification } from "@/helpers/sendVerification";
import dbConnect from "@/lib/dbConnect";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { email } = await request.json();

    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json<APIresponse>(
        {
          success: false,
          message: "Email does not exist",
        },
        { status: 400 }
      );
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const username = user.username;

    user.resetVerifyCode = resetCode;
    user.resetVerifyCodeExpiry = new Date(Date.now() + 3600000);
    await user.save();

    const emailResponse = await sendVerification(email, username, resetCode);

    if (!emailResponse.success) {
      return NextResponse.json<APIresponse>(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully sent reset code! Please check your email.",
        username,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in forgot-password route:", error.message);
    return NextResponse.json<APIresponse>(
      {
        success: false,
        message: "Something went wrong while sending the reset code",
      },
      { status: 500 }
    );
  }
}