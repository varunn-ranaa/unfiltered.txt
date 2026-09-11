import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { acceptMessageValidation } from "@/schemasValidation/acceptMessageSchema";
import { getZodErrorMessage } from "@/helpers/zodErrors";

export async function POST(request: NextRequest) {

    try {
        await dbConnect()
        const session = await auth()
        const user = session?.user

        if (!session || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = user._id
        const body = await request.json()
        const result = acceptMessageValidation.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: getZodErrorMessage(result.error)
                },
                { status: 400 }
            );
        }

        const { acceptMessage } = result.data

        const updatedUser = await UserModel.findByIdAndUpdate(userId,
            { isAcceptingMessages: acceptMessage },
            { new: true }
        )

        if (!updatedUser) {
            return NextResponse.json({
                success: false,
                message: 'Failed to update message acceptance status! '
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Message acceptance status updated successfully!',
            updatedUser
        }, { status: 200 });


    } catch (error : any) {
        console.error("Error updating message acceptance:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}

export async function GET(request: NextRequest) {
    try {
        await dbConnect()
        const session = await auth()
        const user = session?.user

        if (!session || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = user._id

        const existUser = await UserModel.findById(userId)
        if (!existUser) {
            return NextResponse.json({
                success: false,
                message: 'User not found!'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            isAcceptingMessages: existUser.isAcceptingMessages
        }, { status: 200 });

    } catch (error : any) {
        console.error("Error updating message acceptance:", error);
        return NextResponse.json({ error: "Error in getting Message status" }, { status: 500 });
    }
}