import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

type ParamProps = {
    params: Promise<{ messageId: string }>
}

export async function DELETE(request: NextRequest, { params }: ParamProps) {
    try {
        await dbConnect()
        const session = await auth()
        const user = session?.user

        if (!user?._id) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const messageId = resolvedParams.messageId;

        const updatedUser = await UserModel.updateOne(
            {_id : user._id},
            { $pull: { messages: { _id: messageId } } }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Message deleted" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting message:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}